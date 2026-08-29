import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  Briefcase,
  Building2,
  Calendar,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  Edit3,
  Save,
  Loader2,
  Quote,
  Plus,
} from 'lucide-react';

export const AlumniDashboard: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit Profile Form State
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [experienceYears, setExperienceYears] = useState(3);
  const [location, setLocation] = useState('');
  const [skills, setSkills] = useState('');
  const [careerStoryQuote, setCareerStoryQuote] = useState('');
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAlumniData();
  }, []);

  const fetchAlumniData = async () => {
    try {
      const [meRes, evRes, msgRes] = await Promise.all([
        api.get('/auth/me'),
        api.get('/mentorship/events'),
        api.get('/messages'),
      ]);

      const alum = meRes.data.user?.alumniProfile;
      if (alum) {
        setProfile(alum);
        setName(alum.name || '');
        setCompany(alum.company || '');
        setRole(alum.role || '');
        setExperienceYears(alum.experienceYears || 3);
        setLocation(alum.location || '');
        setCareerStoryQuote(alum.careerStoryQuote || '');
        setBio(alum.bio || '');
        try {
          setSkills(Array.isArray(JSON.parse(alum.skills || '[]')) ? JSON.parse(alum.skills).join(', ') : alum.skills || '');
        } catch {
          setSkills(alum.skills || '');
        }
      }

      setEvents(evRes.data.events || []);
      setMessages(msgRes.data.messages || []);
    } catch (err) {
      console.error('Failed to load alumni dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/auth/profile', {
        name,
        company,
        role,
        experienceYears: Number(experienceYears),
        location,
        skills: skills.split(',').map((s) => s.trim()).filter(Boolean),
        careerStoryQuote,
        bio,
      });
      setEditing(false);
      fetchAlumniData();
    } catch (err) {
      alert('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-blue-700 uppercase tracking-wider">
          <Users className="w-4 h-4" />
          <span>Alumni Mentorship & Giving Back</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Welcome back, {profile?.name || 'Alumni Member'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-3xl">
          Thank you for mentoring current engineering students at COEP Technological University. Share interview experiences, review resumes, and host technical AMAs.
        </p>
      </div>

      {loading ? (
        <div className="min-h-[30vh] flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Loading alumni dashboard...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Alumni Profile Card */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-sm font-bold text-slate-900">Your Alumni Card</h2>
                <button
                  onClick={() => setEditing(!editing)}
                  className="text-xs font-bold text-blue-700 hover:underline flex items-center gap-1"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{editing ? 'Cancel' : 'Edit'}</span>
                </button>
              </div>

              {editing ? (
                <form onSubmit={handleSaveProfile} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Your Full Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Company / Organization</label>
                    <input
                      type="text"
                      required
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Current Job Title / Role</label>
                    <input
                      type="text"
                      required
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Experience (Years)</label>
                    <input
                      type="number"
                      value={experienceYears}
                      onChange={(e) => setExperienceYears(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Technical Skills (comma-separated)</label>
                    <input
                      type="text"
                      value={skills}
                      onChange={(e) => setSkills(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Career Advice Quote for Juniors</label>
                    <textarea
                      rows={2}
                      value={careerStoryQuote}
                      onChange={(e) => setCareerStoryQuote(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl shadow-2xs flex items-center justify-center gap-1.5"
                  >
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>Save Profile</span>
                  </button>
                </form>
              ) : (
                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 space-y-1">
                    <div className="font-bold text-slate-900 text-sm">{profile?.name}</div>
                    <div className="text-blue-800 font-semibold">{profile?.role}</div>
                    <div className="text-slate-600 font-medium">{profile?.company}</div>
                  </div>

                  <div className="text-[11px] text-slate-500 space-y-1">
                    <div><strong>Department:</strong> {profile?.departmentName}</div>
                    <div><strong>Batch:</strong> Class of {profile?.graduationYear}</div>
                    <div><strong>Location:</strong> {profile?.location || 'Pune / Hyderabad'}</div>
                  </div>

                  {profile?.careerStoryQuote && (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 italic text-[11px] leading-relaxed flex gap-2">
                      <Quote className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                      <span>"{profile.careerStoryQuote}"</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right: Inquiries & Scheduled Masterclasses */}
          <div className="lg:col-span-8 space-y-6">
            {/* Student Connection Messages */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-700" />
                <span>Student Mentorship Notes & Inquiries ({messages.length})</span>
              </h2>

              {messages.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs bg-slate-50 rounded-xl border border-slate-200">
                  No mentorship requests received yet. Students will reach out via the Alumni Directory.
                </div>
              ) : (
                <div className="space-y-2">
                  {messages.map((m) => (
                    <div key={m.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                      <div className="flex items-center justify-between font-bold text-slate-900">
                        <span>From: {m.otherUserName} ({m.otherUserRole})</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(m.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-slate-700">{m.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Campus Masterclasses */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-700" />
                <span>Campus Masterclasses & FDPs ({events.length})</span>
              </h2>

              <div className="space-y-3">
                {events.slice(0, 3).map((ev) => (
                  <div
                    key={ev.id}
                    className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                        {ev.type?.replace(/_/g, ' ')}
                      </span>
                      <h3 className="font-bold text-slate-900 mt-1">{ev.title}</h3>
                      <div className="text-[11px] text-slate-500">
                        {new Date(ev.dateTime).toLocaleDateString()} • {ev.startTime} • {ev.locationOrLink}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-blue-700 font-mono">
                        {ev.attendeesCount} Registered
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

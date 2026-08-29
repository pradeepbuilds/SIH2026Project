import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import {
  Users,
  Search,
  Building2,
  GraduationCap,
  Briefcase,
  MapPin,
  Linkedin,
  Github,
  MessageSquare,
  Sparkles,
  Loader2,
  CheckCircle2,
  Quote,
} from 'lucide-react';
import { ENGINEERING_BRANCHES_ALL } from '@ayush-portal/shared';

export const AlumniDirectoryPage: React.FC = () => {
  const [alumni, setAlumni] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('all');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');

  // Connect Modal State
  const [connectModalAlum, setConnectModalAlum] = useState<any | null>(null);
  const [connectMessage, setConnectMessage] = useState('');
  const [connectSending, setConnectSending] = useState(false);
  const [connectSent, setConnectSent] = useState(false);

  useEffect(() => {
    fetchAlumni();
  }, [selectedCompany, selectedBranch, selectedYear]);

  const fetchAlumni = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCompany !== 'all') params.append('company', selectedCompany);
      if (selectedBranch !== 'all') params.append('branch', selectedBranch);
      if (selectedYear !== 'all') params.append('year', selectedYear);
      if (search.trim()) params.append('search', search.trim());

      const res = await api.get(`/analytics/alumni?${params.toString()}`);
      setAlumni(res.data.alumni || []);
    } catch (err) {
      console.error('Failed to load alumni directory:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAlumni();
  };

  const handleSendConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connectModalAlum) return;

    setConnectSending(true);
    try {
      await api.post('/messages', {
        receiverUserId: connectModalAlum.userId,
        content: connectMessage || `Hi ${connectModalAlum.name}, I would love to connect for career advice and mentorship regarding ${connectModalAlum.company}.`,
      });
      setConnectSent(true);
      setTimeout(() => {
        setConnectModalAlum(null);
        setConnectSent(false);
        setConnectMessage('');
      }, 1500);
    } catch (err) {
      alert('Failed to send connection message.');
    } finally {
      setConnectSending(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-blue-700 uppercase tracking-wider">
          <Users className="w-4 h-4" />
          <span>Institutional Alumni Network</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Alumni Directory & Mentorship Network
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-3xl">
          Connect with verified COEP & engineering alumni working across Microsoft, Google, AWS, Bosch, TCS, and Qualcomm. Request 1:1 career guidance, mock interviews, and resume reviews.
        </p>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search alumni by name, role, skill (e.g. Distributed Systems)..."
              className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 font-semibold"
            >
              <option value="all">All Engineering Branches</option>
              {ENGINEERING_BRANCHES_ALL.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 font-semibold"
            >
              <option value="all">All Graduation Years</option>
              <option value="2024">Batch 2024</option>
              <option value="2023">Batch 2023</option>
              <option value="2022">Batch 2022</option>
              <option value="2021">Batch 2021</option>
              <option value="2020">Batch 2020</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl transition-colors shadow-2xs flex items-center justify-center gap-1.5"
            >
              <Search className="w-4 h-4" />
              <span>Search Alumni</span>
            </button>
          </div>
        </form>
      </div>

      {/* Alumni Directory Grid */}
      {loading ? (
        <div className="min-h-[30vh] flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Searching alumni records...</p>
        </div>
      ) : alumni.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
          No alumni found matching the selected filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {alumni.map((a) => (
            <div
              key={a.id}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* Alum Header */}
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-700 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-2xs overflow-hidden">
                    {a.avatarUrl ? (
                      <img src={a.avatarUrl} alt={a.name} className="w-full h-full object-cover" />
                    ) : (
                      a.name.slice(0, 2).toUpperCase()
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{a.name}</h3>
                    <div className="text-xs font-semibold text-blue-700 flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5" />
                      <span>{a.role}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5" />
                      <span>{a.company}</span>
                    </div>
                  </div>
                </div>

                {/* Academic Tag */}
                <div className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 space-y-0.5">
                  <div className="font-bold text-slate-700">{a.branchName}</div>
                  <div className="text-slate-500">
                    Graduated {a.graduationYear} • {a.experienceYears} Years Exp • {a.location}
                  </div>
                </div>

                {/* Bio / Quote */}
                {a.careerStoryQuote && (
                  <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-slate-700 text-[11px] italic leading-relaxed flex gap-2">
                    <Quote className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    <span>"{a.careerStoryQuote}"</span>
                  </div>
                )}

                {/* Skills Tags */}
                {a.skills?.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {a.skills.map((sk: string, idx: number) => (
                      <span
                        key={idx}
                        className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {a.linkedinUrl && (
                    <a
                      href={a.linkedinUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 text-slate-400 hover:text-blue-700 hover:bg-slate-50 rounded-lg transition-colors"
                      title="LinkedIn Profile"
                    >
                      <Linkedin className="w-4 h-4" />
                    </a>
                  )}
                  {a.githubUrl && (
                    <a
                      href={a.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
                      title="GitHub Profile"
                    >
                      <Github className="w-4 h-4" />
                    </a>
                  )}
                </div>

                <button
                  onClick={() => setConnectModalAlum(a)}
                  className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold rounded-xl text-xs transition-colors border border-blue-200 flex items-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Connect / AMA</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Connect Modal */}
      {connectModalAlum && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-700" />
              <span>Connect with {connectModalAlum.name}</span>
            </h2>

            <p className="text-xs text-slate-600">
              Send a note to <strong>{connectModalAlum.name}</strong> ({connectModalAlum.role} at {connectModalAlum.company}) to request resume feedback or mock technical guidance.
            </p>

            {connectSent ? (
              <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 flex items-center gap-2 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Connection note delivered successfully!</span>
              </div>
            ) : (
              <form onSubmit={handleSendConnect} className="space-y-4 text-xs">
                <textarea
                  rows={4}
                  required
                  value={connectMessage}
                  onChange={(e) => setConnectMessage(e.target.value)}
                  placeholder={`Hi ${connectModalAlum.name}, I am a 3rd year engineering student at COEP preparing for campus placements at ${connectModalAlum.company}. Would love your guidance on system design preparation.`}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setConnectModalAlum(null)}
                    className="px-4 py-2 border border-slate-300 rounded-xl font-bold text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={connectSending}
                    className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl shadow-2xs flex items-center gap-2 disabled:opacity-50"
                  >
                    {connectSending && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>Send Note</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

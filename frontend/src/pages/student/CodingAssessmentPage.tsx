import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import {
  Code2,
  FileCode2,
  Upload,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  FileText,
  Sparkles,
  ChevronRight,
  Terminal,
  HelpCircle,
} from 'lucide-react';

export const CodingAssessmentPage: React.FC = () => {
  const [questions, setQuestions] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileLanguage, setFileLanguage] = useState<string>('java');
  const [fileContent, setFileContent] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    fetchCodingData();
  }, []);

  const fetchCodingData = async () => {
    try {
      const [qRes, sRes] = await Promise.all([
        api.get('/skills/coding/questions'),
        api.get('/skills/coding/submissions'),
      ]);
      const qList = qRes.data.questions || [];
      setQuestions(qList);
      if (qList.length > 0 && !selectedQuestionId) {
        setSelectedQuestionId(qList[0].id);
      }
      setSubmissions(sRes.data.submissions || []);
    } catch (err) {
      console.error('Failed to load coding data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext === 'java') setFileLanguage('java');
    else if (ext === 'py') setFileLanguage('python');
    else if (ext === 'cpp' || ext === 'c') setFileLanguage('cpp');
    else if (ext === 'js' || ext === 'ts') setFileLanguage('javascript');
    else setFileLanguage('txt');

    // Read file contents as text
    const reader = new FileReader();
    reader.onload = (event) => {
      setFileContent(event.target?.result as string || '');
    };
    reader.readAsText(file);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !fileContent) {
      setUploadError('Please select a code file to upload.');
      return;
    }

    setUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      const res = await api.post('/skills/coding/submit', {
        questionId: selectedQuestionId,
        fileName: selectedFile.name,
        fileLanguage,
        fileContent,
      });

      setUploadSuccess(`Solution "${selectedFile.name}" uploaded successfully! Skill profile updated.`);
      setSelectedFile(null);
      setFileContent('');

      // Refresh submissions
      const sRes = await api.get('/skills/coding/submissions');
      setSubmissions(sRes.data.submissions || []);
    } catch (err: any) {
      setUploadError(err.response?.data?.error || 'Failed to upload solution code.');
    } finally {
      setUploading(false);
    }
  };

  const activeQuestion = questions.find((q) => q.id === selectedQuestionId);
  const activeSubmissions = submissions.filter((s) => s.questionId === selectedQuestionId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-blue-700 uppercase tracking-wider">
          <Code2 className="w-4 h-4" />
          <span>Practical Technical Coding Assessment</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Coding Assessment Arena
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-3xl">
          Review standard engineering problem statements, solve in your local IDE, and upload your verified solution code file (.java, .py, .cpp, .js, .txt) for persistent evaluation.
        </p>
      </div>

      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Loading coding questions...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Question Selector List */}
          <div className="lg:col-span-4 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
              Assessment Challenges ({questions.length})
            </h2>

            <div className="space-y-2">
              {questions.map((q) => {
                const isSelected = q.id === selectedQuestionId;
                const hasSubmitted = submissions.some((s) => s.questionId === q.id);

                return (
                  <button
                    key={q.id}
                    onClick={() => {
                      setSelectedQuestionId(q.id);
                      setUploadSuccess(null);
                      setUploadError(null);
                    }}
                    className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                      isSelected
                        ? 'bg-blue-50 border-blue-500 shadow-2xs'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            q.difficulty === 'easy'
                              ? 'bg-emerald-100 text-emerald-800'
                              : q.difficulty === 'hard'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {q.difficulty}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{q.marks} Marks</span>
                      </div>
                      <div className="text-xs font-bold text-slate-900 leading-snug">{q.title}</div>
                      <div className="text-[11px] text-slate-500">{q.skillName}</div>
                    </div>

                    {hasSubmitted ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1 shrink-0">
                        <CheckCircle2 className="w-3 h-3" /> Submitted
                      </span>
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 mt-2" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Active Challenge & File Upload Form */}
          {activeQuestion && (
            <div className="lg:col-span-8 space-y-6">
              {/* Problem Details Card */}
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                        {activeQuestion.skillName}
                      </span>
                      <span className="text-xs text-slate-500 font-semibold">{activeQuestion.departmentName}</span>
                    </div>
                    <h2 className="text-lg font-bold text-slate-900 mt-1">{activeQuestion.title}</h2>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-bold text-blue-700 font-mono">{activeQuestion.marks} Points</div>
                    <div className="text-[10px] text-slate-400">Standard Evaluation</div>
                  </div>
                </div>

                {/* Problem Description */}
                <div className="space-y-2 text-xs text-slate-700 leading-relaxed">
                  <div className="font-bold text-slate-900 text-sm">Problem Statement:</div>
                  <p className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-medium whitespace-pre-wrap">
                    {activeQuestion.description}
                  </p>
                </div>

                {/* Constraints */}
                {activeQuestion.constraints && (
                  <div className="space-y-1 text-xs">
                    <div className="font-bold text-slate-900">Constraints:</div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-mono text-[11px] text-slate-600">
                      {activeQuestion.constraints}
                    </div>
                  </div>
                )}

                {/* Examples */}
                {activeQuestion.examples?.length > 0 && (
                  <div className="space-y-3 text-xs">
                    <div className="font-bold text-slate-900">Examples:</div>
                    {activeQuestion.examples.map((ex: any, idx: number) => (
                      <div key={idx} className="p-3.5 bg-slate-900 text-slate-200 rounded-xl font-mono text-xs space-y-1">
                        <div><strong className="text-blue-400">Input:</strong> {ex.input}</div>
                        <div><strong className="text-emerald-400">Output:</strong> {ex.output}</div>
                        {ex.explanation && <div className="text-slate-400 text-[11px]"><strong>Explanation:</strong> {ex.explanation}</div>}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Upload Solution Code Form */}
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Upload className="w-4 h-4 text-blue-700" />
                      <span>Upload Solution Code</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Supported extensions: <code>.java</code>, <code>.py</code>, <code>.cpp</code>, <code>.js</code>, <code>.txt</code>
                    </p>
                  </div>
                </div>

                <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Select Code File from Your Device</label>
                    <input
                      type="file"
                      required
                      accept=".java,.py,.cpp,.c,.js,.ts,.txt"
                      onChange={handleFileChange}
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-700 file:text-white hover:file:bg-blue-800"
                    />
                  </div>

                  {selectedFile && (
                    <div className="p-3 bg-blue-50 text-blue-950 rounded-xl border border-blue-200 flex items-center justify-between text-xs font-semibold">
                      <div className="flex items-center gap-2">
                        <FileCode2 className="w-4 h-4 text-blue-700" />
                        <span>{selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                      </div>
                      <span className="font-mono uppercase text-[10px] bg-white px-2 py-0.5 rounded border border-blue-200">
                        {fileLanguage}
                      </span>
                    </div>
                  )}

                  {uploadSuccess && (
                    <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 flex items-center gap-2 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{uploadSuccess}</span>
                    </div>
                  )}

                  {uploadError && (
                    <div className="p-3 bg-red-50 text-red-800 rounded-xl border border-red-200 flex items-center gap-2 font-bold">
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                      <span>{uploadError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={uploading || !selectedFile}
                    className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl transition-colors shadow-2xs flex items-center gap-2 disabled:opacity-50"
                  >
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    <span>Submit Solution File</span>
                  </button>
                </form>
              </div>

              {/* Submissions History for this Question */}
              {activeSubmissions.length > 0 && (
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Your Submissions for this Problem ({activeSubmissions.length})
                  </h3>

                  <div className="space-y-2">
                    {activeSubmissions.map((sub) => (
                      <div
                        key={sub.id}
                        className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                      >
                        <div className="space-y-0.5">
                          <div className="font-bold text-slate-900 flex items-center gap-2">
                            <FileCode2 className="w-4 h-4 text-blue-700" />
                            <span>{sub.fileName}</span>
                            <span className="text-[10px] font-mono text-slate-500 uppercase">({sub.fileLanguage})</span>
                          </div>
                          <div className="text-[11px] text-slate-500">
                            Uploaded on {new Date(sub.uploadedAt).toLocaleString()}
                          </div>
                          {sub.reviewerNotes && (
                            <div className="text-[11px] text-emerald-800 font-medium">
                              ✓ {sub.reviewerNotes}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="font-black text-blue-700 font-mono text-sm">{sub.score}%</div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase">{sub.status}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

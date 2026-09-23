import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileText,
  Sparkles,
  Upload,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Copy,
  Check,
  RefreshCw,
  X,
  TrendingUp,
  Target,
  ArrowRight,
  Download,
  BookOpen,
  ListChecks,
  Sliders,
  History,
  Info,
  ShieldCheck,
} from 'lucide-react';
import { CareerProfile, ResumeAnalysisResult, SavedResumeAudit } from '../../types';
import {
  SAMPLE_RESUMES,
  analyzeResumeWithAI,
  saveResumeAuditLocally,
  getSavedResumeAuditsLocally,
} from '../../services/resumeAnalyzerService';
import { uploadResumeToSupabase } from '../../services/supabaseService';
import { SUPABASE_PROJECT_ID } from '../../services/supabaseClient';
import { useToast } from '../../context/ToastContext';

interface AIResumeAnalyzerModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: CareerProfile | null;
  onAuditCompleted?: (result: ResumeAnalysisResult) => void;
  initialAudit?: SavedResumeAudit | null;
}

type TabType = 'overview' | 'keywords' | 'sections' | 'bullet_rewrites' | 'ats_hygiene' | 'history';

export const AIResumeAnalyzerModal: React.FC<AIResumeAnalyzerModalProps> = ({
  isOpen,
  onClose,
  profile,
  onAuditCompleted,
  initialAudit = null,
}) => {
  const { showSuccess, showError, showInfo } = useToast();

  const userId = profile?.uid || 'guest_user';
  const [resumeText, setResumeText] = useState<string>('');
  const [targetJob, setTargetJob] = useState<string>(profile?.targetJob || 'Frontend Developer');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<ResumeAnalysisResult | null>(
    initialAudit ? initialAudit.result : null
  );
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedKeyword, setCopiedKeyword] = useState<string | null>(null);
  const [selectedSampleId, setSelectedSampleId] = useState<string>('');
  const [savedAudits, setSavedAudits] = useState<SavedResumeAudit[]>([]);
  const [completedActionSteps, setCompletedActionSteps] = useState<Record<number, boolean>>({});

  // Sync state on open
  React.useEffect(() => {
    if (isOpen) {
      const audits = getSavedResumeAuditsLocally(userId);
      setSavedAudits(audits);
      if (initialAudit) {
        setAnalysisResult(initialAudit.result);
        setTargetJob(initialAudit.result.targetRole);
      } else if (audits.length > 0 && !analysisResult) {
        setAnalysisResult(audits[0].result);
        setTargetJob(audits[0].result.targetRole);
      }
    }
  }, [isOpen, userId, initialAudit]);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showError('File size too large', 'Please upload a resume under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      if (content) {
        setResumeText(content);
        showSuccess('Resume file loaded', `Loaded ${file.name} (${content.split(/\s+/).length} words). Storing in Supabase...`);

        // Upload to Supabase Storage & Database
        try {
          const uploadRes = await uploadResumeToSupabase(file, file.name, userId, {
            extractedText: content,
            targetRole: targetJob,
          });
          if (uploadRes.publicUrl) {
            showInfo('Supabase Cloud Sync', `Resume stored in Supabase (Project: ${SUPABASE_PROJECT_ID})`);
          }
        } catch (supaErr) {
          console.warn('Supabase upload background note:', supaErr);
        }
      }
    };
    reader.readAsText(file);
  };

  const handleLoadSample = (sampleId: string) => {
    const sample = SAMPLE_RESUMES.find((s) => s.id === sampleId);
    if (sample) {
      setSelectedSampleId(sampleId);
      setResumeText(sample.fullText);
      setTargetJob(sample.role);
      showInfo('Sample template loaded', `Loaded ${sample.title}. Ready for instant ATS audit.`);
    }
  };

  const handleRunAnalysis = async () => {
    if (!resumeText.trim() || resumeText.trim().length < 20) {
      showError('Resume text missing', 'Please paste your resume text or select a sample resume first.');
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await analyzeResumeWithAI({
        resumeText,
        targetJob,
        experienceLevel: profile?.experienceLevel,
        education: profile?.education,
        skills: profile?.skills,
      });

      setAnalysisResult(result);
      const saved = saveResumeAuditLocally(userId, result);
      setSavedAudits((prev) => [saved, ...prev.filter((a) => a.id !== saved.id)]);

      // Save analyzed resume record in Supabase
      const resumeBlob = new Blob([resumeText], { type: 'text/plain' });
      uploadResumeToSupabase(resumeBlob, `resume_${targetJob.replace(/\s+/g, '_')}.txt`, userId, {
        extractedText: resumeText,
        targetRole: targetJob,
        atsScore: result.atsScore,
        detectedSkills: result.keywordAnalysis?.matchedKeywords || [],
        aiFeedback: result,
      }).catch((e) => console.warn('Supabase analysis sync note:', e));

      if (onAuditCompleted) {
        onAuditCompleted(result);
      }

      showSuccess(
        `ATS Audit: ${result.atsScore}/100 (${result.scoreGrade})`,
        result.atsScore >= 80
          ? 'Top-tier ATS match! Your resume structure is strongly aligned with recruiter filters.'
          : 'Audit complete. Check missing keywords and section suggestions below.'
      );
      setActiveTab('overview');
    } catch (err: any) {
      showError('Analysis error', err.message || 'Could not analyze resume. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopyBullet = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    showSuccess('Bullet copied to clipboard!', 'Paste this improved bullet point into your resume document.');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleCopyKeyword = (kw: string) => {
    navigator.clipboard.writeText(kw);
    setCopiedKeyword(kw);
    showSuccess('Keyword copied', `"${kw}" copied to clipboard.`);
    setTimeout(() => setCopiedKeyword(null), 1800);
  };

  const toggleActionStep = (index: number) => {
    setCompletedActionSteps((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', text: 'text-emerald-600', ring: 'text-emerald-500' };
    if (score >= 70) return { bg: 'bg-blue-50 text-blue-700 border-blue-200', text: 'text-blue-600', ring: 'text-blue-500' };
    if (score >= 55) return { bg: 'bg-amber-50 text-amber-700 border-amber-200', text: 'text-amber-600', ring: 'text-amber-500' };
    return { bg: 'bg-rose-50 text-rose-700 border-rose-200', text: 'text-rose-600', ring: 'text-rose-500' };
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div
      id="ai-resume-analyzer-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-900 to-indigo-950 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <Sparkles className="w-5 h-5 text-indigo-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-tight">AI Resume & ATS Analyzer</h3>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/30 text-indigo-200 border border-indigo-400/20">
                  Gemini 3.8
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Audited specifically for <span className="font-semibold text-white">{targetJob}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {analysisResult && (
              <button
                id="print-audit-report-btn"
                onClick={handlePrintReport}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                title="Print or Save PDF summary"
              >
                <Download className="w-3.5 h-3.5" />
                Export
              </button>
            )}
            <button
              id="close-resume-analyzer-modal-btn"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body Container (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50/50">
          {/* Input & Selector Section */}
          <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span className="text-sm font-semibold text-slate-900">Resume Content & Role Target</span>
              </div>

              {/* Quick Sample Selector */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-slate-500">Quick Templates:</span>
                {SAMPLE_RESUMES.map((sample) => (
                  <button
                    key={sample.id}
                    id={`sample-btn-${sample.id}`}
                    onClick={() => handleLoadSample(sample.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      selectedSampleId === sample.id
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {sample.role.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Target Role Input & File Upload bar */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-7">
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Target Job Title (Matches ATS Keywords)
                </label>
                <div className="relative">
                  <Target className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    id="target-job-input"
                    type="text"
                    value={targetJob}
                    onChange={(e) => setTargetJob(e.target.value)}
                    placeholder="e.g. Frontend Developer, Customer Support, MIS Operator"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                  />
                </div>
              </div>

              <div className="sm:col-span-5 flex items-end">
                <label
                  htmlFor="resume-file-input"
                  className="w-full cursor-pointer flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors text-center"
                >
                  <Upload className="w-3.5 h-3.5 text-slate-600" />
                  <span>Upload .TXT / .MD File</span>
                  <input
                    id="resume-file-input"
                    type="file"
                    accept=".txt,.md,.rtf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Resume Text Area */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-slate-600">
                  Paste Resume Plain Text (or edit loaded content)
                </label>
                <span className="text-[11px] text-slate-400">
                  {resumeText.trim().length > 0 ? `${resumeText.trim().split(/\s+/).length} words` : 'Empty'}
                </span>
              </div>
              <textarea
                id="resume-textarea-input"
                rows={5}
                value={resumeText}
                onChange={(e) => {
                  setResumeText(e.target.value);
                  setSelectedSampleId('');
                }}
                placeholder="Paste your complete resume text here (Objective, Technical Skills, Projects, Experience, Education)..."
                className="w-full p-3 text-xs sm:text-sm font-mono rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50/50 resize-y leading-relaxed"
              />
            </div>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Zero recruiter biases • Evaluates standard Applicant Tracking Systems</span>
              </div>

              <button
                id="run-ats-audit-btn"
                onClick={handleRunAnalysis}
                disabled={isAnalyzing || !resumeText.trim()}
                className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all shadow-sm ${
                  isAnalyzing || !resumeText.trim()
                    ? 'bg-slate-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 active:scale-98 shadow-indigo-200'
                }`}
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Auditing with Gemini AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-indigo-200" />
                    <span>Run Instant ATS Audit</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Results Display */}
          {analysisResult && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Score Highlight Banner */}
              <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  {/* Score Dial */}
                  <div className="md:col-span-4 flex items-center gap-4 border-b md:border-b-0 md:border-r border-slate-100 pb-4 md:pb-0 pr-0 md:pr-4">
                    <div className="relative flex items-center justify-center w-20 h-20 shrink-0">
                      <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          className="text-slate-100"
                          strokeWidth="3.5"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                          className={getScoreColor(analysisResult.atsScore).ring}
                          strokeDasharray={`${analysisResult.atsScore}, 100`}
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-xl font-extrabold text-slate-900 tracking-tight leading-none">
                          {analysisResult.atsScore}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400 uppercase">/ 100</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                            getScoreColor(analysisResult.atsScore).bg
                          }`}
                        >
                          {analysisResult.scoreGrade}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 mt-1">ATS Match Score</h4>
                      <p className="text-xs text-slate-500">
                        {analysisResult.roleMatchPercentage}% Match for {analysisResult.targetRole}
                      </p>
                    </div>
                  </div>

                  {/* Executive Summary */}
                  <div className="md:col-span-8">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      Executive Recruiter Verdict
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                      {analysisResult.executiveSummary}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-slate-500">
                      <span>✓ {analysisResult.keywordAnalysis.matchedKeywords.length} keywords detected</span>
                      <span>• {analysisResult.keywordAnalysis.missingHighPriorityKeywords.length} missing high-priority terms</span>
                      <span>• {analysisResult.bulletRewrites.length} AI bullet upgrades</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto pb-0.5">
                {[
                  { id: 'overview', label: 'Overview & Strengths', icon: Info },
                  { id: 'keywords', label: 'ATS Keywords', icon: Target },
                  { id: 'sections', label: 'Section Audit', icon: BookOpen },
                  { id: 'bullet_rewrites', label: 'Bullet Point Upgrader', icon: TrendingUp },
                  { id: 'ats_hygiene', label: 'Hygiene & Action Plan', icon: ListChecks },
                  { id: 'history', label: `Audits (${savedAudits.length})`, icon: History },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      id={`tab-${tab.id}`}
                      onClick={() => setActiveTab(tab.id as TabType)}
                      className={`flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
                        isActive
                          ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white shadow-2xs font-semibold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Tab Content Panels */}
              <div className="space-y-4">
                {/* TAB 1: OVERVIEW & STRENGTHS */}
                {activeTab === 'overview' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Strengths */}
                    <div className="bg-white rounded-xl p-4 sm:p-5 border border-emerald-100 shadow-xs space-y-3">
                      <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Key Strengths Detected</span>
                      </div>
                      <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700">
                        {analysisResult.strengths.map((strength, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                              ✓
                            </span>
                            <span>{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Critical Gaps */}
                    <div className="bg-white rounded-xl p-4 sm:p-5 border border-amber-100 shadow-xs space-y-3">
                      <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        <span>High-Priority Improvement Areas</span>
                      </div>
                      <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700">
                        {analysisResult.criticalGaps.map((gap, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                              !
                            </span>
                            <span>{gap}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* TAB 2: ATS KEYWORDS */}
                {activeTab === 'keywords' && (
                  <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-5">
                    {/* Missing Keywords (Most Important) */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                          <AlertTriangle className="w-4 h-4 text-rose-500" />
                          <span>Missing High-Priority Recruiter Search Keywords</span>
                        </div>
                        <span className="text-xs text-slate-500">Click chip to copy</span>
                      </div>
                      <p className="text-xs text-slate-600 mb-3">
                        Recruiters and ATS parsers filter candidates by searching for these exact terms for{' '}
                        <span className="font-semibold text-slate-900">{analysisResult.targetRole}</span>:
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {analysisResult.keywordAnalysis.missingHighPriorityKeywords.map((kw, i) => (
                          <button
                            key={i}
                            onClick={() => handleCopyKeyword(kw)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 transition-colors group cursor-pointer"
                            title="Click to copy keyword"
                          >
                            <span className="font-semibold">{kw}</span>
                            {copiedKeyword === kw ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3 text-rose-400 group-hover:text-rose-700" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Matched Keywords */}
                    <div className="pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Matched Keywords Detected in Your Resume</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {analysisResult.keywordAnalysis.matchedKeywords.map((kw, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200"
                          >
                            <Check className="w-3 h-3 text-emerald-600" />
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Recommended Placement Guidance */}
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Placement Strategy Tips</span>
                      </div>
                      <ul className="text-xs text-slate-600 space-y-1.5 pl-4 list-disc">
                        {analysisResult.keywordAnalysis.recommendedPlacementTips.map((tip, i) => (
                          <li key={i}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* TAB 3: SECTION BY SECTION AUDIT */}
                {activeTab === 'sections' && (
                  <div className="space-y-3">
                    {analysisResult.sectionReviews.map((section, i) => {
                      const isPass = section.status === 'pass';
                      const isWarning = section.status === 'warning';
                      return (
                        <div
                          key={i}
                          className={`bg-white rounded-xl p-4 sm:p-5 border transition-all ${
                            isPass
                              ? 'border-emerald-200/80 bg-emerald-50/10'
                              : isWarning
                              ? 'border-amber-200/80 bg-amber-50/10'
                              : 'border-rose-200/80 bg-rose-50/10'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex items-center gap-2">
                              {isPass ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                              ) : isWarning ? (
                                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                              ) : (
                                <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                              )}
                              <h5 className="text-sm font-bold text-slate-900">{section.sectionName}</h5>
                            </div>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                                isPass
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : isWarning
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {section.status.replace('_', ' ')}
                            </span>
                          </div>

                          <p className="text-xs sm:text-sm text-slate-700 mb-2 leading-relaxed">
                            {section.feedback}
                          </p>

                          <div className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-700">
                            <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                            <div>
                              <strong className="text-slate-900">Recommendation: </strong>
                              {section.suggestion}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* TAB 4: BULLET POINT REWRITES */}
                {activeTab === 'bullet_rewrites' && (
                  <div className="space-y-4">
                    <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-3.5 text-xs text-indigo-900 flex items-start gap-2.5">
                      <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-semibold">The XYZ Accomplishment Formula: </strong>
                        Top recruiters look for: <em>Accomplished [X], as measured by [Y], by doing [Z]</em>.
                        Here are customized rewrites from your resume text:
                      </div>
                    </div>

                    {analysisResult.bulletRewrites.map((rewrite, i) => (
                      <div key={i} className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-3">
                        {/* Original Bullet */}
                        <div>
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-700 uppercase tracking-wide mb-1">
                            <XCircle className="w-3.5 h-3.5 text-rose-500" />
                            Original Weak Phrasing
                          </div>
                          <div className="p-3 rounded-lg bg-rose-50/50 border border-rose-100 text-xs sm:text-sm text-slate-800 font-mono">
                            "{rewrite.originalBullet}"
                          </div>
                        </div>

                        {/* Improved Bullet */}
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 uppercase tracking-wide">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              AI Quantified High-Impact Upgrade
                            </div>
                            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              {rewrite.impactBoost}
                            </span>
                          </div>
                          <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-200 text-xs sm:text-sm text-slate-900 font-medium leading-relaxed">
                            {rewrite.improvedBullet}
                          </div>
                        </div>

                        {/* Rationale & Copy button */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                          <p className="text-xs text-slate-500">
                            <strong className="text-slate-700">Why this converts: </strong>
                            {rewrite.reason}
                          </p>

                          <button
                            id={`copy-bullet-${i}-btn`}
                            onClick={() => handleCopyBullet(rewrite.improvedBullet, i)}
                            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white transition-colors shrink-0"
                          >
                            {copiedIndex === i ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy Improved Bullet</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* TAB 5: ATS HYGIENE & ACTION PLAN */}
                {activeTab === 'ats_hygiene' && (
                  <div className="space-y-5">
                    {/* ATS Hygiene Checklist */}
                    <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-3">
                      <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-indigo-600" />
                        ATS Parser Hygiene Audit
                      </h4>
                      <div className="divide-y divide-slate-100">
                        {analysisResult.atsHygieneCheck.map((item, i) => (
                          <div key={i} className="py-2.5 flex items-start justify-between gap-3">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-900">
                                {item.passed ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                ) : (
                                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                                )}
                                <span>{item.checkItem}</span>
                              </div>
                              <p className="text-xs text-slate-500 pl-6">{item.tip}</p>
                            </div>
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                item.passed
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}
                            >
                              {item.passed ? 'PASSED' : 'CHECK'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Immediate 15-Minute Action Plan */}
                    <div className="bg-white rounded-xl p-4 sm:p-5 border border-indigo-100 shadow-sm space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                          <ListChecks className="w-4 h-4 text-indigo-600" />
                          15-Minute Quick-Win Action Plan
                        </h4>
                        <span className="text-xs text-indigo-600 font-semibold">
                          +15 to +20 ATS Points Target
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">
                        Check off each item as you apply the fixes to your master resume:
                      </p>

                      <div className="space-y-2">
                        {analysisResult.actionPlan.map((step, i) => {
                          const isDone = !!completedActionSteps[i];
                          return (
                            <div
                              key={i}
                              onClick={() => toggleActionStep(i)}
                              className={`flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer select-none ${
                                isDone
                                  ? 'bg-emerald-50/60 border-emerald-200 text-slate-600 line-through'
                                  : 'bg-slate-50/70 hover:bg-slate-100/70 border-slate-200 text-slate-800 font-medium'
                              }`}
                            >
                              <div
                                className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 transition-colors ${
                                  isDone
                                    ? 'bg-emerald-600 text-white'
                                    : 'border-2 border-slate-300 text-transparent'
                                }`}
                              >
                                {isDone ? '✓' : ''}
                              </div>
                              <span className="text-xs sm:text-sm">{step}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 6: PAST AUDITS HISTORY */}
                {activeTab === 'history' && (
                  <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-3">
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-2">
                      <History className="w-4 h-4 text-indigo-600" />
                      Saved ATS Audits & Progress
                    </h4>
                    {savedAudits.length === 0 ? (
                      <p className="text-xs text-slate-500 py-4 text-center">No past audits saved yet.</p>
                    ) : (
                      <div className="space-y-2.5">
                        {savedAudits.map((audit) => (
                          <div
                            key={audit.id}
                            className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/20 transition-all cursor-pointer"
                            onClick={() => {
                              setAnalysisResult(audit.result);
                              setTargetJob(audit.targetRole);
                              setActiveTab('overview');
                              showInfo('Loaded audit', `Loaded audit from ${new Date(audit.timestamp).toLocaleDateString()}`);
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm border ${
                                  getScoreColor(audit.atsScore).bg
                                }`}
                              >
                                {audit.atsScore}
                              </div>
                              <div>
                                <h5 className="text-sm font-bold text-slate-900">{audit.targetRole}</h5>
                                <p className="text-xs text-slate-500">
                                  {new Date(audit.timestamp).toLocaleDateString()} • {audit.result.scoreGrade}
                                </p>
                              </div>
                            </div>
                            <span className="text-xs font-semibold text-indigo-600 flex items-center gap-1">
                              View Audit <ArrowRight className="w-3 h-3" />
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 bg-white border-t border-slate-100 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500">
            {analysisResult ? (
              <span>Last analyzed {new Date(analysisResult.analyzedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            ) : (
              <span>Paste your resume text to get started</span>
            )}
          </div>
          <button
            id="close-resume-analyzer-bottom-btn"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Sparkles,
  Target,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  TrendingUp,
} from 'lucide-react';
import { CareerProfile, ResumeAnalysisResult, SavedResumeAudit } from '../../types';
import { DashboardCard } from '../common/DashboardCard';
import { PrimaryButton } from '../common/PrimaryButton';
import { AIResumeAnalyzerModal } from './AIResumeAnalyzerModal';
import { getLatestResumeAuditLocally } from '../../services/resumeAnalyzerService';

interface ResumeAnalyzerCardProps {
  profile: CareerProfile | null;
}

export const ResumeAnalyzerCard: React.FC<ResumeAnalyzerCardProps> = ({ profile }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [latestAudit, setLatestAudit] = useState<SavedResumeAudit | null>(null);
  const userId = profile?.uid || 'guest_user';

  useEffect(() => {
    const audit = getLatestResumeAuditLocally(userId);
    setLatestAudit(audit);
  }, [userId]);

  const handleAuditCompleted = (result: ResumeAnalysisResult) => {
    const audit: SavedResumeAudit = {
      id: 'audit_' + Date.now(),
      userId,
      targetRole: result.targetRole,
      atsScore: result.atsScore,
      result,
      timestamp: new Date().toISOString(),
    };
    setLatestAudit(audit);
  };

  const getScoreBadgeClass = (score: number) => {
    if (score >= 85) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (score >= 70) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (score >= 55) return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-rose-50 text-rose-700 border-rose-200';
  };

  return (
    <>
      <DashboardCard
        id="resume-analyzer-card"
        title="AI RESUME & ATS ANALYZER"
        subtitle="Automated recruiter ATS score, keyword gap detection & bullet upgrader"
        icon={<FileText className="w-5 h-5 text-indigo-600" />}
        badge="Gemini 3.8 Flash"
        className="border-indigo-100 bg-gradient-to-b from-white via-indigo-50/10 to-white shadow-sm"
      >
        <div className="space-y-4">
          {latestAudit ? (
            /* AUDITED STATE */
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-extrabold border shadow-2xs shrink-0 ${getScoreBadgeClass(
                      latestAudit.atsScore
                    )}`}
                  >
                    <span className="text-xl leading-none">{latestAudit.atsScore}</span>
                    <span className="text-[10px] font-bold uppercase opacity-80 mt-0.5">/100</span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-bold border ${getScoreBadgeClass(
                          latestAudit.atsScore
                        )}`}
                      >
                        {latestAudit.result.scoreGrade}
                      </span>
                      <span className="text-xs text-slate-500">
                        Target: <strong className="text-slate-800">{latestAudit.targetRole}</strong>
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 font-medium mt-1 line-clamp-1">
                      {latestAudit.result.executiveSummary}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <PrimaryButton
                    id="open-full-resume-audit-btn"
                    onClick={() => setIsModalOpen(true)}
                    icon={<ArrowRight className="w-4 h-4" />}
                    className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-xs py-2 px-3.5 shadow-indigo-100"
                  >
                    View Full Audit
                  </PrimaryButton>
                </div>
              </div>

              {/* Mini Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Keywords Matched</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {latestAudit.result.keywordAnalysis.matchedKeywords.slice(0, 3).map((kw, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 text-[11px] font-medium bg-emerald-50 text-emerald-700 rounded border border-emerald-100"
                      >
                        {kw}
                      </span>
                    ))}
                    {latestAudit.result.keywordAnalysis.matchedKeywords.length > 3 && (
                      <span className="text-[11px] text-slate-400 self-center">
                        +{latestAudit.result.keywordAnalysis.matchedKeywords.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800 mb-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                    <span>Missing Key Terms</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {latestAudit.result.keywordAnalysis.missingHighPriorityKeywords.slice(0, 2).map((kw, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 text-[11px] font-medium bg-rose-50 text-rose-700 rounded border border-rose-100"
                      >
                        {kw}
                      </span>
                    ))}
                    {latestAudit.result.keywordAnalysis.missingHighPriorityKeywords.length > 2 && (
                      <span className="text-[11px] text-slate-400 self-center">
                        +{latestAudit.result.keywordAnalysis.missingHighPriorityKeywords.length - 2} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-800 mb-1">
                    <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
                    <span>AI Rewrites</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    {latestAudit.result.bulletRewrites.length} high-impact accomplishment bullets ready to copy.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* INITIAL EMPTY STATE */
            <div className="flex flex-col md:flex-row items-center justify-between gap-5 p-4 sm:p-5 rounded-xl bg-gradient-to-r from-indigo-50/50 via-white to-indigo-50/30 border border-indigo-100">
              <div className="space-y-2 max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">
                    Role-Tailored ATS Scanner
                  </span>
                  <span className="text-xs text-slate-500">
                    Aligned for <strong className="text-slate-800">{profile?.targetJob || 'Your Target Role'}</strong>
                  </span>
                </div>
                <h4 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  Get Instant Feedback & Boost Recruiter Callbacks
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Upload or paste your resume to scan against real recruiter filters. Get missing keywords, section-by-section audit, and AI-rewritten bullet points using proven XYZ accomplishment formulas.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0 w-full md:w-auto">
                <PrimaryButton
                  id="start-resume-analyzer-btn"
                  onClick={() => setIsModalOpen(true)}
                  icon={<Sparkles className="w-4 h-4 text-indigo-200" />}
                  className="bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100 justify-center"
                >
                  Analyze My Resume
                </PrimaryButton>
              </div>
            </div>
          )}
        </div>
      </DashboardCard>

      {/* Interactive Modal */}
      <AIResumeAnalyzerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        profile={profile}
        onAuditCompleted={handleAuditCompleted}
        initialAudit={latestAudit}
      />
    </>
  );
};

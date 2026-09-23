import React, { useState, useEffect } from 'react';
import { CareerProfile, MockInterviewResult } from '../../types';
import {
  getInterviewHistory,
  deleteInterviewRecord,
} from '../../services/mockInterviewService';
import { DashboardCard } from '../common/DashboardCard';
import { PrimaryButton } from '../common/PrimaryButton';
import { SecondaryButton } from '../common/SecondaryButton';
import { InterviewFeedbackModal } from './InterviewFeedbackModal';
import { MockInterviewModal } from './MockInterviewModal';
import {
  History,
  Trophy,
  Award,
  Calendar,
  FileText,
  ChevronRight,
  Eye,
  Trash2,
  Sparkles,
  Mic,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

interface InterviewHistorySectionProps {
  userId: string;
  profile: CareerProfile | null;
  id?: string;
}

export const InterviewHistorySection: React.FC<InterviewHistorySectionProps> = ({
  userId,
  profile,
  id = 'interview-history-section',
}) => {
  const [history, setHistory] = useState<MockInterviewResult[]>([]);
  const [selectedInterview, setSelectedInterview] = useState<MockInterviewResult | null>(null);
  const [isReviewOpen, setIsReviewOpen] = useState<boolean>(false);
  const [isNewInterviewOpen, setIsNewInterviewOpen] = useState<boolean>(false);

  const refreshHistory = () => {
    setHistory(getInterviewHistory(userId));
  };

  useEffect(() => {
    refreshHistory();
  }, [userId]);

  const handleOpenReview = (item: MockInterviewResult) => {
    setSelectedInterview(item);
    setIsReviewOpen(true);
  };

  const handleDelete = (e: React.MouseEvent, interviewId: string) => {
    e.stopPropagation();
    const updated = deleteInterviewRecord(userId, interviewId);
    setHistory(updated);
  };

  const getScoreBadgeClass = (score: number) => {
    if (score >= 85) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (score >= 70) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (score >= 55) return 'bg-amber-100 text-amber-800 border-amber-200';
    return 'bg-rose-100 text-rose-800 border-rose-200';
  };

  const bestScore = history.length > 0 ? Math.max(...history.map((h) => h.overallScore)) : 0;
  const targetJob = profile?.targetJob || 'Entry-Level Associate';

  return (
    <>
      <DashboardCard
        id={id}
        title="PAST MOCK INTERVIEWS & FEEDBACK ARCHIVE"
        subtitle="Review recruiter advice and track your interview progress"
        icon={<History className="w-5 h-5 text-indigo-600" />}
        badge={history.length > 0 ? `${history.length} Completed` : undefined}
      >
        <div className="space-y-4">
          {history.length === 0 ? (
            /* Empty State */
            <div className="text-center py-8 px-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                <Mic className="w-6 h-6" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h4 className="text-sm font-bold text-slate-900">
                  No interview sessions recorded yet
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Practice simulated questions for <strong className="text-slate-800">{targetJob}</strong>.
                  Your scores, recorded answers, and AI recruiter feedback will be archived here for review anytime.
                </p>
              </div>
              <div className="pt-1">
                <PrimaryButton
                  onClick={() => setIsNewInterviewOpen(true)}
                  icon={<Sparkles className="w-3.5 h-3.5" />}
                  className="text-xs !py-2 !px-4"
                >
                  Start First Practice Interview
                </PrimaryButton>
              </div>
            </div>
          ) : (
            /* History List */
            <div className="space-y-3">
              {/* Summary Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-indigo-50/40 border border-indigo-100 text-xs">
                <div className="flex items-center gap-4">
                  <div>
                    <span className="text-slate-500 font-medium">Sessions Taken: </span>
                    <strong className="text-slate-900 font-bold">{history.length}</strong>
                  </div>
                  <div className="h-3 w-px bg-indigo-200" />
                  <div className="flex items-center gap-1.5">
                    <Trophy className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-slate-500 font-medium">Best Score: </span>
                    <strong className="text-slate-900 font-bold">{bestScore}%</strong>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsNewInterviewOpen(true)}
                  className="text-indigo-700 hover:text-indigo-900 font-bold inline-flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <span>New Practice Session</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {/* List of Interview Cards */}
              <div className="space-y-2.5">
                {history.map((session) => {
                  const dateStr = new Date(session.completedAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  });
                  const timeStr = new Date(session.completedAt).toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <div
                      key={session.id}
                      className="p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-200 hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3.5"
                    >
                      {/* Left Details */}
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900 truncate">
                            {session.roleTitle}
                          </h4>
                          <span
                            className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getScoreBadgeClass(
                              session.overallScore
                            )}`}
                          >
                            Score: {session.overallScore}/100 • {session.grade.split('(')[0].trim()}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {dateStr} at {timeStr}
                          </span>
                          <span>•</span>
                          <span>{session.totalQuestions} Questions</span>
                          {session.answers?.[0]?.evaluation?.strengths?.[0] && (
                            <>
                              <span>•</span>
                              <span className="text-slate-600 truncate max-w-xs italic hidden md:inline">
                                &ldquo;{session.answers[0].evaluation.strengths[0]}&rdquo;
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Right Action Buttons */}
                      <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                        <PrimaryButton
                          onClick={() => handleOpenReview(session)}
                          icon={<Eye className="w-3.5 h-3.5" />}
                          className="!py-1.5 !px-3.5 text-xs font-bold"
                        >
                          Review Feedback
                        </PrimaryButton>

                        <button
                          type="button"
                          onClick={(e) => handleDelete(e, session.id)}
                          title="Delete this interview record"
                          className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </DashboardCard>

      {/* Review Feedback Modal */}
      <InterviewFeedbackModal
        interview={selectedInterview}
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        onPracticeAgain={(role) => {
          setIsNewInterviewOpen(true);
        }}
      />

      {/* New Interview Practice Modal */}
      <MockInterviewModal
        userId={userId}
        profile={profile}
        isOpen={isNewInterviewOpen}
        onClose={() => {
          setIsNewInterviewOpen(false);
          refreshHistory();
        }}
        onInterviewComplete={(newResult) => {
          setHistory((prev) => [newResult, ...prev]);
        }}
      />
    </>
  );
};

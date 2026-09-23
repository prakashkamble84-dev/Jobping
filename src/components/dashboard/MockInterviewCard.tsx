import React, { useState, useEffect } from 'react';
import { CareerProfile, MockInterviewResult } from '../../types';
import { getInterviewHistory } from '../../services/mockInterviewService';
import { MockInterviewModal } from './MockInterviewModal';
import { MockInterview } from './MockInterview';
import { DashboardCard } from '../common/DashboardCard';
import { PrimaryButton } from '../common/PrimaryButton';
import { SecondaryButton } from '../common/SecondaryButton';
import {
  Mic,
  Sparkles,
  Trophy,
  History,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
  MessageSquare,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface MockInterviewCardProps {
  userId: string;
  profile: CareerProfile | null;
  onViewAchievements?: () => void;
  id?: string;
}

export const MockInterviewCard: React.FC<MockInterviewCardProps> = ({
  userId,
  profile,
  onViewAchievements,
  id = 'mock-interview-section',
}) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [showInlineInteractive, setShowInlineInteractive] = useState<boolean>(false);
  const [history, setHistory] = useState<MockInterviewResult[]>([]);

  useEffect(() => {
    setHistory(getInterviewHistory(userId));
  }, [userId]);

  const targetJob = profile?.targetJob || 'Entry-Level Associate';
  const latestResult = history.length > 0 ? history[0] : null;
  const bestScore = history.length > 0 ? Math.max(...history.map((h) => h.overallScore)) : null;

  return (
    <>
      <DashboardCard
        id={id}
        title="AI ROLE-SPECIFIC MOCK INTERVIEW"
        subtitle="Simulate real employer questions & get instant feedback"
        icon={<Mic className="w-5 h-5 text-indigo-600" />}
        badge="Interactive AI"
        className="border-indigo-100 bg-gradient-to-b from-white via-white to-indigo-50/20"
      >
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Target Interview Track
              </span>
              <h4 className="text-base font-extrabold text-slate-900">
                {targetJob} Interview
              </h4>
              <p className="text-xs text-slate-500">
                Tailored for {profile?.experienceLevel || 'Fresher'} level in India.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {bestScore !== null ? (
                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    Best Score
                  </span>
                  <div className="flex items-center gap-1 text-slate-900 font-extrabold text-lg">
                    <Trophy className="w-4 h-4 text-amber-500" />
                    <span>{bestScore}%</span>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-400 font-medium">
                  Not attempted yet
                </div>
              )}
            </div>
          </div>

          {latestResult && (
            <div className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-100 text-xs text-slate-700 space-y-1.5">
              <div className="flex items-center justify-between font-bold text-indigo-900 text-[11px] uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                  Latest Session ({new Date(latestResult.completedAt).toLocaleDateString()})
                </span>
                <span>{latestResult.grade}</span>
              </div>
              <p className="text-xs text-slate-600">
                Completed {latestResult.totalQuestions} questions with an overall score of{' '}
                <strong className="text-slate-900">{latestResult.overallScore}/100</strong>.
              </p>
            </div>
          )}

          {/* Interactive Mock Interview Inline Component View */}
          {showInlineInteractive && (
            <div className="pt-2">
              <MockInterview
                userId={userId}
                profile={profile}
                onClose={() => setShowInlineInteractive(false)}
                onInterviewComplete={(newResult) => {
                  setHistory((prev) => [newResult, ...prev]);
                }}
              />
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <p className="text-xs text-slate-500">
              Features live Gemini text feedback, STAR evaluation, and hiring manager model answers.
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <SecondaryButton
                onClick={() => setShowInlineInteractive((prev) => !prev)}
                icon={showInlineInteractive ? <ChevronUp className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
                className="!py-2.5 !px-4 text-xs font-bold"
              >
                {showInlineInteractive ? 'Hide Chat Session' : 'Interactive Chat Mode'}
              </SecondaryButton>

              <PrimaryButton
                id="start-mock-interview-btn"
                onClick={() => setIsModalOpen(true)}
                icon={<Mic className="w-4 h-4" />}
                className="w-full sm:w-auto !py-2.5 !px-5 text-xs font-bold"
              >
                {history.length > 0 ? 'Start Full Screen Practice' : 'Start Mock Interview'}
              </PrimaryButton>
            </div>
          </div>
        </div>
      </DashboardCard>

      <MockInterviewModal
        userId={userId}
        profile={profile}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onInterviewComplete={(newResult) => {
          setHistory((prev) => [newResult, ...prev]);
        }}
      />
    </>
  );
};


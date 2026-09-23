import React from 'react';
import { ScoreBreakdown } from '../../types';
import { ProgressBar } from './ProgressBar';
import { ShieldCheck, Info, Sparkles, TrendingUp, FileDown, Loader2 } from 'lucide-react';

interface ScoreCardProps {
  score: ScoreBreakdown;
  onActionClick?: () => void;
  onDownloadReport?: () => void;
  isDownloadingReport?: boolean;
  id?: string;
  className?: string;
}

export const ScoreCard: React.FC<ScoreCardProps> = ({
  score,
  onActionClick,
  onDownloadReport,
  isDownloadingReport = false,
  id = 'jobready-score-card',
  className = '',
}) => {
  const getCategoryTheme = (category: string) => {
    switch (category) {
      case 'Highly Prepared':
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          badge: 'bg-emerald-600 text-white',
          accent: 'emerald',
        };
      case 'Strong Preparation':
        return {
          bg: 'bg-blue-50 text-blue-900 border-blue-200',
          badge: 'bg-blue-700 text-white',
          accent: 'blue',
        };
      case 'Job Ready in Progress':
        return {
          bg: 'bg-sky-50 text-sky-900 border-sky-200',
          badge: 'bg-sky-700 text-white',
          accent: 'blue',
        };
      case 'Developing':
        return {
          bg: 'bg-amber-50 text-amber-900 border-amber-200',
          badge: 'bg-amber-600 text-white',
          accent: 'amber',
        };
      default:
        return {
          bg: 'bg-slate-50 text-slate-800 border-slate-200',
          badge: 'bg-slate-700 text-white',
          accent: 'primary',
        };
    }
  };

  const theme = getCategoryTheme(score.category);

  return (
    <div
      id={id}
      className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition-all ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-blue-100 text-blue-700">
              <TrendingUp className="w-3.5 h-3.5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Internal Readiness Indicator
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            JOBREADY PREPARATION SCORE
          </h2>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {onDownloadReport && (
            <button
              type="button"
              onClick={onDownloadReport}
              disabled={isDownloadingReport}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors px-2.5 py-1 rounded-full cursor-pointer"
            >
              {isDownloadingReport ? (
                <Loader2 className="w-3 h-3 animate-spin text-indigo-600" />
              ) : (
                <FileDown className="w-3 h-3 text-indigo-600" />
              )}
              <span>Export PDF</span>
            </button>
          )}

          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase shadow-2xs ${theme.badge}`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            {score.category}
          </span>
        </div>
      </div>

      {/* Main Score Number and Feedback */}
      <div className="py-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-baseline gap-2">
          <span className="text-5xl sm:text-6xl font-black text-slate-900 tracking-tight">
            {score.overallScore}
          </span>
          <span className="text-xl font-bold text-slate-400">/ 100</span>
        </div>
        <div className="flex-1 max-w-xl">
          <p className="text-sm sm:text-base font-semibold text-slate-800 leading-relaxed">
            &ldquo;{score.categoryFeedback}&rdquo;
          </p>
          <div className="flex items-start gap-1.5 mt-2 text-xs text-slate-500">
            <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <span>
              This score measures preparation completeness. It is not a hiring prediction or job guarantee.
            </span>
          </div>
        </div>
      </div>

      {/* Breakdown Grid (4 components: 40% + 20% + 20% + 20%) */}
      <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-slate-700">Profile Completeness</span>
            <span className="text-2xl font-bold text-slate-900">{score.profileCompletionScore}%</span>
          </div>
          <ProgressBar value={score.profileCompletionScore} showPercentage={false} size="sm" color="blue" />
          <span className="block mt-1.5 text-[11px] text-slate-500">Weight: 40% of score</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-slate-700">Skills Information</span>
            <span className="text-2xl font-bold text-slate-900">{score.skillsScore}%</span>
          </div>
          <ProgressBar value={score.skillsScore} showPercentage={false} size="sm" color="blue" />
          <span className="block mt-1.5 text-[11px] text-slate-500">Weight: 20% of score</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-slate-700">Career Goal Clarity</span>
            <span className="text-2xl font-bold text-slate-900">{score.careerGoalScore}%</span>
          </div>
          <ProgressBar value={score.careerGoalScore} showPercentage={false} size="sm" color="blue" />
          <span className="block mt-1.5 text-[11px] text-slate-500">Weight: 20% of score</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-slate-700">Target Job Selected</span>
            <span className="text-2xl font-bold text-slate-900">{score.targetJobScore}%</span>
          </div>
          <ProgressBar value={score.targetJobScore} showPercentage={false} size="sm" color="blue" />
          <span className="block mt-1.5 text-[11px] text-slate-500">Weight: 20% of score</span>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { CareerProfile, AICareerInsight } from '../../types';
import {
  fetchDailyCareerInsight,
  isQuickActionCompletedToday,
  markQuickActionCompletedToday,
} from '../../services/careerInsightService';
import { DashboardCard } from '../common/DashboardCard';
import {
  Lightbulb,
  Sparkles,
  RotateCw,
  CheckCircle2,
  Clock,
  TrendingUp,
  Tag,
  Zap,
} from 'lucide-react';

interface CareerInsightCardProps {
  userId: string;
  profile: CareerProfile | null;
  id?: string;
}

export const CareerInsightCard: React.FC<CareerInsightCardProps> = ({
  userId,
  profile,
  id = 'ai-career-insight-card',
}) => {
  const [insight, setInsight] = useState<AICareerInsight | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  useEffect(() => {
    setIsCompleted(isQuickActionCompletedToday(userId));
    loadInsight(false);
  }, [userId, profile?.targetJob]);

  const loadInsight = async (forceRefresh: boolean) => {
    if (forceRefresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const data = await fetchDailyCareerInsight(userId, profile, forceRefresh);
      setInsight(data);
    } catch (err) {
      console.error('Failed to load career insight:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleToggleComplete = () => {
    const nextState = !isCompleted;
    setIsCompleted(nextState);
    markQuickActionCompletedToday(userId, nextState);
  };

  const targetJob = profile?.targetJob || 'Entry-Level Associate';

  // Category styling map
  const getCategoryTheme = (category: string) => {
    const cat = (category || '').toLowerCase();
    if (cat.includes('interview')) {
      return {
        badgeBg: 'bg-purple-100 text-purple-800 border-purple-200',
        cardBg: 'from-white via-white to-purple-50/25',
        border: 'border-purple-100',
        icon: 'text-purple-600',
      };
    }
    if (cat.includes('ats') || cat.includes('resume')) {
      return {
        badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        cardBg: 'from-white via-white to-emerald-50/25',
        border: 'border-emerald-100',
        icon: 'text-emerald-600',
      };
    }
    if (cat.includes('skill') || cat.includes('upgrade')) {
      return {
        badgeBg: 'bg-amber-100 text-amber-800 border-amber-200',
        cardBg: 'from-white via-white to-amber-50/25',
        border: 'border-amber-100',
        icon: 'text-amber-600',
      };
    }
    return {
      badgeBg: 'bg-blue-100 text-blue-800 border-blue-200',
      cardBg: 'from-white via-white to-blue-50/25',
      border: 'border-blue-100',
      icon: 'text-blue-600',
    };
  };

  const theme = getCategoryTheme(insight?.category || 'General');

  return (
    <DashboardCard
      id={id}
      title="DAILY AI CAREER INSIGHT"
      subtitle={`Personalized guidance for ${targetJob}`}
      icon={<Lightbulb className={`w-5 h-5 ${theme.icon}`} />}
      badge="Actionable Tip"
      className={`${theme.border} bg-gradient-to-b ${theme.cardBg}`}
    >
      {isLoading ? (
        <div className="py-8 flex flex-col items-center justify-center space-y-2 text-slate-400">
          <Sparkles className="w-6 h-6 animate-spin text-blue-600" />
          <p className="text-xs font-semibold text-slate-500">
            Generating your personalized career insight...
          </p>
        </div>
      ) : insight ? (
        <div className="space-y-4">
          {/* Category & Impact Tag Top Row */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span
                className={`text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${theme.badgeBg}`}
              >
                {insight.category}
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-emerald-600" />
                {insight.impactTag}
              </span>
            </div>

            <button
              type="button"
              onClick={() => loadInsight(true)}
              disabled={isRefreshing}
              title="Get a fresh tip"
              className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-slate-700 transition-colors p-1 rounded-md hover:bg-slate-100 cursor-pointer"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
              <span className="hidden sm:inline">Refresh Tip</span>
            </button>
          </div>

          {/* Headline & Body Advice */}
          <div className="space-y-2">
            <h4 className="text-base sm:text-lg font-black text-slate-900 leading-snug tracking-tight">
              {insight.headline}
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              {insight.actionableTip}
            </p>
          </div>

          {/* 5-Minute Quick Action Box */}
          <div
            className={`p-3.5 rounded-xl border transition-all ${
              isCompleted
                ? 'bg-emerald-50/70 border-emerald-200'
                : 'bg-slate-50 border-slate-200/80'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5 flex-1 min-w-0">
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                    isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <Zap className="w-3.5 h-3.5" />
                  )}
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                      5-Minute Quick Action
                    </span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                      <Clock className="w-3 h-3" /> Today
                    </span>
                  </div>
                  <p
                    className={`text-xs leading-relaxed font-medium ${
                      isCompleted ? 'text-emerald-900 line-through' : 'text-slate-800'
                    }`}
                  >
                    {insight.quickAction}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleToggleComplete}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all shrink-0 cursor-pointer ${
                  isCompleted
                    ? 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                {isCompleted ? 'Completed ✓' : 'Mark Done'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-6 text-slate-400 text-xs">
          No insight available at this time. Click refresh to generate one.
        </div>
      )}
    </DashboardCard>
  );
};

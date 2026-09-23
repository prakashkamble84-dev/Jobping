import React from 'react';
import { StreakStats } from '../../types';
import { ProgressBar } from '../common/ProgressBar';
import {
  Flame,
  Trophy,
  CalendarCheck,
  Zap,
  CheckCircle2,
  Clock,
  Sparkles,
  TrendingUp,
} from 'lucide-react';

interface LearningStreakTrackerProps {
  stats: StreakStats;
  id?: string;
  className?: string;
}

export const LearningStreakTracker: React.FC<LearningStreakTrackerProps> = ({
  stats,
  id = 'learning-streak-tracker',
  className = '',
}) => {
  const { currentStreak, bestStreak, totalCompletedDays, weeklyDays, nextMilestone } = stats;

  const milestoneProgress = Math.min(
    100,
    Math.round((currentStreak / nextMilestone.target) * 100)
  );

  const getStreakMessage = () => {
    if (currentStreak === 0) {
      return 'Start your preparation streak today by completing your first daily learning goal!';
    }
    if (currentStreak < 3) {
      return `You're warming up! Complete today's goal to keep your ${currentStreak}-day streak alive.`;
    }
    if (currentStreak < 7) {
      return `Impressive focus! Only ${nextMilestone.daysRemaining} more ${
        nextMilestone.daysRemaining === 1 ? 'day' : 'days'
      } to unlock the ${nextMilestone.title}.`;
    }
    return `Incredible consistency! You are operating in the top tier of job-ready candidates with a ${currentStreak}-day streak.`;
  };

  return (
    <div
      id={id}
      className={`rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs relative overflow-hidden ${className}`}
    >
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-xs">
            <Flame className="w-7 h-7 fill-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                Learning Streak Tracker
              </h3>
              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full">
                Consistency Engine
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Calculates consecutive days of goal completion to build employer-ready habits.
            </p>
          </div>
        </div>

        {/* Big Highlight Streak Pill */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 border border-orange-200 text-orange-950 shadow-2xs self-start sm:self-auto">
          <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
          <div className="flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-black text-slate-900">
              {currentStreak}
            </span>
            <span className="text-xs font-bold text-orange-800">
              {currentStreak === 1 ? 'Day Active Streak' : 'Days Active Streak'}
            </span>
          </div>
        </div>
      </div>

      {/* 3 Core Streak Metrics */}
      <div className="grid grid-cols-3 gap-3 my-5">
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
          <div className="flex items-center justify-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Current</span>
          </div>
          <div className="text-lg sm:text-xl font-black text-slate-900">
            {currentStreak} {currentStreak === 1 ? 'Day' : 'Days'}
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
          <div className="flex items-center justify-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            <Trophy className="w-3.5 h-3.5 text-yellow-600" />
            <span>Best Streak</span>
          </div>
          <div className="text-lg sm:text-xl font-black text-slate-900">
            {bestStreak} {bestStreak === 1 ? 'Day' : 'Days'}
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
          <div className="flex items-center justify-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            <CalendarCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Total Logged</span>
          </div>
          <div className="text-lg sm:text-xl font-black text-slate-900">
            {totalCompletedDays} {totalCompletedDays === 1 ? 'Goal' : 'Goals'}
          </div>
        </div>
      </div>

      {/* 7-Day Weekly Streak Visualizer */}
      <div className="space-y-2 mb-5">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
          <span>Last 7 Days Activity</span>
          <span className="text-[11px] font-medium text-slate-400">
            Daily goal status
          </span>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {weeklyDays.map((day) => {
            const isCompleted = day.status === 'completed';
            const isPendingToday = day.status === 'today-pending';

            return (
              <div
                key={day.dateString}
                className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                  day.isToday
                    ? 'border-blue-500 bg-blue-50/50 ring-2 ring-blue-500/20'
                    : isCompleted
                    ? 'border-emerald-200 bg-emerald-50/60'
                    : 'border-slate-200 bg-slate-50/50'
                }`}
              >
                <span
                  className={`text-[10px] font-bold uppercase ${
                    day.isToday ? 'text-blue-700 font-black' : 'text-slate-500'
                  }`}
                >
                  {day.dayName}
                </span>

                <div className="w-6 h-6 flex items-center justify-center">
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                  ) : isPendingToday ? (
                    <Clock className="w-4 h-4 text-blue-600 animate-spin" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-slate-300" />
                  )}
                </div>

                <span className="text-[9px] font-semibold text-slate-400">
                  {day.isToday ? 'Today' : day.dateString.slice(8)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Next Milestone Progress Bar */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 font-bold text-slate-900">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Next Goal: {nextMilestone.title}</span>
          </div>
          <span className="font-extrabold text-amber-700">
            {currentStreak} / {nextMilestone.target} Days
          </span>
        </div>

        <ProgressBar
          value={milestoneProgress}
          showPercentage={false}
          size="sm"
          color="amber"
        />

        <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
          {getStreakMessage()}
        </p>
      </div>
    </div>
  );
};

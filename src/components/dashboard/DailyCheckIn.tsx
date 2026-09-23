import React, { useState, useEffect } from 'react';
import { DailyCheckIn as DailyCheckInType } from '../../types';
import {
  getDailyCheckIn,
  saveDailyGoal,
  toggleGoalCompletion,
  getTodayDateString,
  SaveCheckInPayload,
} from '../../services/checkInService';
import { useToast } from '../../context/ToastContext';
import { PrimaryButton } from '../common/PrimaryButton';
import { SecondaryButton } from '../common/SecondaryButton';
import {
  Flame,
  CheckCircle2,
  Circle,
  Sparkles,
  Edit3,
  CalendarCheck,
  Target,
  ArrowRight,
  Zap,
  Clock,
  Send,
  BookOpen,
  HelpCircle,
  Plus,
  Minus,
  Check,
  TrendingUp,
  Award,
  ChevronRight,
} from 'lucide-react';

export interface DailyCheckInProps {
  userId: string;
  onCheckInChange?: (checkIn: DailyCheckInType) => void;
  id?: string;
  className?: string;
}

const QUICK_GOAL_PROMPTS = [
  'Practice 5 common STAR interview questions',
  'Master 3 essential technical / Excel formulas',
  'Apply to 3 relevant jobs with instant pings',
  'Refine 1-minute elevator pitch in English',
  'Study system design or sales communication basics',
];

export const DailyCheckIn: React.FC<DailyCheckInProps> = ({
  userId,
  onCheckInChange,
  id = 'daily-check-in',
  className = '',
}) => {
  const [checkIn, setCheckIn] = useState<DailyCheckInType | null>(null);
  const [goalInput, setGoalInput] = useState('');
  const [hoursStudied, setHoursStudied] = useState<number>(1.5);
  const [applicationsSent, setApplicationsSent] = useState<number>(2);
  const [questionsPracticed, setQuestionsPracticed] = useState<number>(3);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'log' | 'quick_goals'>('log');

  const today = getTodayDateString();
  const { showGoalCompletionCelebration, showSuccess, showInfo } = useToast();

  useEffect(() => {
    if (userId) {
      const data = getDailyCheckIn(userId);
      setCheckIn(data);
      if (data && data.date === today) {
        setGoalInput(data.goal || '');
        if (data.hoursStudied !== undefined) setHoursStudied(data.hoursStudied);
        if (data.applicationsSent !== undefined) setApplicationsSent(data.applicationsSent);
        if (data.questionsPracticed !== undefined) setQuestionsPracticed(data.questionsPracticed);
      }
      if (data && onCheckInChange) {
        onCheckInChange(data);
      }
    }
  }, [userId, today]);

  const hasGoalForToday = Boolean(checkIn && checkIn.date === today && checkIn.goal.trim().length > 0);
  const streak = checkIn?.streakCount || 0;

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const finalGoal = goalInput.trim() || `Studied ${hoursStudied}h & sent ${applicationsSent} applications`;

    const payload: Partial<SaveCheckInPayload> = {
      hoursStudied,
      applicationsSent,
      questionsPracticed,
      timeSpentMinutes: Math.round(hoursStudied * 60),
    };

    const saved = saveDailyGoal(userId, finalGoal, payload);
    setCheckIn(saved);
    setIsEditing(false);
    if (onCheckInChange) onCheckInChange(saved);
    showSuccess('Progress Recorded! 🎯', `Logged ${hoursStudied}h study, ${applicationsSent} applications. Keep the momentum going!`);
  };

  const handleToggleComplete = () => {
    const updated = toggleGoalCompletion(userId);
    if (updated) {
      setCheckIn(updated);
      if (onCheckInChange) onCheckInChange(updated);

      if (updated.completed) {
        showGoalCompletionCelebration(
          updated.goal,
          updated.streakCount,
          () => {
            const streakEl = document.getElementById('learning-streak-tracker');
            streakEl?.scrollIntoView({ behavior: 'smooth' });
          }
        );
      } else {
        showInfo('Goal Marked Incomplete', 'Take your time — complete it anytime before midnight to keep your streak.');
      }
    }
  };

  // Motivational message based on streak count
  const getMotivationalText = (count: number) => {
    if (count === 0) {
      return {
        title: 'Start Your Streak Today!',
        message: 'Log your first daily activity to activate your JobPing momentum badge.',
        color: 'text-slate-600',
        badge: 'Day 1 Starter',
      };
    }
    if (count === 1) {
      return {
        title: 'Great First Step! 🔥',
        message: 'You have logged 1 day of focused preparation. Come back tomorrow to build a streak!',
        color: 'text-brand-orange',
        badge: '1 Day Strong',
      };
    }
    if (count < 4) {
      return {
        title: `${count}-Day Streak Active! ⚡`,
        message: 'Consistency creates confidence. You are building serious competitive advantage.',
        color: 'text-brand-green',
        badge: 'Momentum Builder',
      };
    }
    if (count < 7) {
      return {
        title: `Unstoppable ${count}-Day Run! 🚀`,
        message: 'Almost at a full 7-day week streak! Recruiters value dedicated daily learners.',
        color: 'text-brand-blue',
        badge: 'Habit Champion',
      };
    }
    return {
      title: `Legendary ${count}-Day Streak! 👑`,
      message: 'Top 1% discipline! You are exceptionally well-positioned for career breakthroughs.',
      color: 'text-purple-600',
      badge: 'Elite Performer',
    };
  };

  const motivation = getMotivationalText(streak);

  return (
    <div
      id={id}
      className={`rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-xs relative overflow-hidden transition-all ${className}`}
    >
      {/* Top Accent Gradient Bar in JobPing brand colors */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand-green via-brand-blue to-brand-orange" />

      {/* Header & Motivational Streak Counter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-green-light border border-brand-green/30 flex items-center justify-center text-brand-green shrink-0 shadow-2xs">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-black text-brand-navy tracking-tight">
                Daily Check-in &amp; Activity Log
              </h3>
              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider bg-brand-orange-light text-brand-orange px-2.5 py-0.5 rounded-full border border-brand-orange/30">
                <Sparkles className="w-3 h-3" />
                {motivation.badge}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Record study hours, applications sent, and protect your streak.
            </p>
          </div>
        </div>

        {/* Motivational Streak Badge */}
        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-gradient-to-r from-brand-orange-light via-amber-50 to-orange-50 border border-brand-orange/40 text-brand-navy shadow-2xs self-start sm:self-auto">
          <div className="relative">
            <Flame
              className={`w-5 h-5 ${
                streak > 0 ? 'text-brand-orange fill-brand-orange animate-bounce' : 'text-slate-400'
              }`}
            />
            {streak > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-brand-green animate-ping" />
            )}
          </div>
          <div className="text-left">
            <div className="text-xs font-black leading-none">
              <span className="text-brand-orange text-sm font-extrabold">{streak}</span>{' '}
              <span>{streak === 1 ? 'Day' : 'Days'} Streak</span>
            </div>
            <span className="text-[10px] font-bold text-slate-500 leading-none">
              {checkIn?.completed ? 'Completed Today ✓' : 'Daily Goal Pending'}
            </span>
          </div>
        </div>
      </div>

      {/* Motivational Banner */}
      <div className="mt-4 p-3.5 rounded-2xl bg-slate-50/90 border border-slate-200/80 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs">
            <Zap className="w-4 h-4 text-brand-orange fill-brand-orange" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-900 truncate">{motivation.title}</p>
            <p className="text-[11px] text-slate-500 truncate">{motivation.message}</p>
          </div>
        </div>
        <span className="text-[11px] font-bold text-brand-green shrink-0 hidden sm:inline">
          ⚡ Real-Time Sync
        </span>
      </div>

      {/* Active Goal View (if already set) */}
      {hasGoalForToday && !isEditing ? (
        <div className="mt-5 space-y-4">
          {/* Main Card Checkbox Toggle */}
          <div
            onClick={handleToggleComplete}
            className={`group p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 select-none ${
              checkIn?.completed
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950 shadow-2xs'
                : 'bg-slate-50 hover:bg-slate-100/90 border-slate-200 text-slate-900 hover:border-brand-green/40 shadow-2xs'
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {checkIn?.completed ? (
                <CheckCircle2 className="w-6 h-6 text-brand-green fill-emerald-100" />
              ) : (
                <Circle className="w-6 h-6 text-slate-400 group-hover:text-brand-green transition-colors" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  {checkIn?.completed ? 'COMPLETED TODAY' : 'TODAY’S CHECK-IN TARGET'}
                </span>
                <span
                  className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                    checkIn?.completed
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      : 'bg-amber-100 text-amber-900 border border-amber-300'
                  }`}
                >
                  {checkIn?.completed ? 'Done for Today 🎉' : 'Tap to Mark Done'}
                </span>
              </div>

              <p
                className={`text-sm sm:text-base font-bold leading-relaxed ${
                  checkIn?.completed ? 'line-through text-slate-500' : 'text-slate-900'
                }`}
              >
                {checkIn?.goal}
              </p>

              {/* Recorded Metrics Chips */}
              <div className="flex flex-wrap items-center gap-2 mt-3 pt-2 border-t border-slate-200/60 text-xs">
                {checkIn?.hoursStudied !== undefined && checkIn.hoursStudied > 0 && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 font-bold text-slate-700">
                    <Clock className="w-3.5 h-3.5 text-brand-blue" />
                    <span>{checkIn.hoursStudied}h Studied</span>
                  </span>
                )}
                {checkIn?.applicationsSent !== undefined && checkIn.applicationsSent > 0 && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 font-bold text-slate-700">
                    <Send className="w-3.5 h-3.5 text-brand-orange" />
                    <span>{checkIn.applicationsSent} Applications</span>
                  </span>
                )}
                {checkIn?.questionsPracticed !== undefined && checkIn.questionsPracticed > 0 && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 font-bold text-slate-700">
                    <HelpCircle className="w-3.5 h-3.5 text-brand-green" />
                    <span>{checkIn.questionsPracticed} Questions</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Edit / Change Button */}
          <div className="flex items-center justify-between pt-1 text-xs">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-1.5 text-slate-600 hover:text-brand-navy font-bold transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-slate-500" />
              <span>Update Activity / Change Target</span>
            </button>

            <span className="text-[11px] font-semibold text-slate-400">
              Resets daily at midnight
            </span>
          </div>
        </div>
      ) : (
        /* Recording / Input Form */
        <form onSubmit={handleSave} className="mt-5 space-y-4">
          {/* Interactive Activity Recording Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Metric 1: Hours Spent Studying */}
            <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200 hover:border-brand-blue/40 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-brand-blue" /> Study Time
                </span>
                <span className="text-xs font-black text-brand-blue">{hoursStudied} hrs</span>
              </div>
              <div className="flex items-center justify-between gap-1">
                <button
                  type="button"
                  onClick={() => setHoursStudied((prev) => Math.max(0, parseFloat((prev - 0.5).toFixed(1))))}
                  className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold flex items-center justify-center hover:bg-slate-100 cursor-pointer"
                  aria-label="Decrease study hours"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-sm font-black text-slate-900">{hoursStudied}h</span>
                <button
                  type="button"
                  onClick={() => setHoursStudied((prev) => parseFloat((prev + 0.5).toFixed(1)))}
                  className="w-8 h-8 rounded-xl bg-brand-blue-light border border-brand-blue/30 text-brand-blue font-bold flex items-center justify-center hover:bg-blue-100 cursor-pointer"
                  aria-label="Increase study hours"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Metric 2: Applications Sent */}
            <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200 hover:border-brand-orange/40 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <Send className="w-3.5 h-3.5 text-brand-orange" /> Applications
                </span>
                <span className="text-xs font-black text-brand-orange">{applicationsSent} sent</span>
              </div>
              <div className="flex items-center justify-between gap-1">
                <button
                  type="button"
                  onClick={() => setApplicationsSent((prev) => Math.max(0, prev - 1))}
                  className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold flex items-center justify-center hover:bg-slate-100 cursor-pointer"
                  aria-label="Decrease applications"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-sm font-black text-slate-900">{applicationsSent}</span>
                <button
                  type="button"
                  onClick={() => setApplicationsSent((prev) => prev + 1)}
                  className="w-8 h-8 rounded-xl bg-brand-orange-light border border-brand-orange/30 text-brand-orange font-bold flex items-center justify-center hover:bg-amber-100 cursor-pointer"
                  aria-label="Increase applications"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Metric 3: Mock Questions Practiced */}
            <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200 hover:border-brand-green/40 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5 text-brand-green" /> Questions
                </span>
                <span className="text-xs font-black text-brand-green">{questionsPracticed} done</span>
              </div>
              <div className="flex items-center justify-between gap-1">
                <button
                  type="button"
                  onClick={() => setQuestionsPracticed((prev) => Math.max(0, prev - 1))}
                  className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold flex items-center justify-center hover:bg-slate-100 cursor-pointer"
                  aria-label="Decrease questions practiced"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-sm font-black text-slate-900">{questionsPracticed}</span>
                <button
                  type="button"
                  onClick={() => setQuestionsPracticed((prev) => prev + 1)}
                  className="w-8 h-8 rounded-xl bg-brand-green-light border border-brand-green/30 text-brand-green-dark font-bold flex items-center justify-center hover:bg-emerald-100 cursor-pointer"
                  aria-label="Increase questions practiced"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Goal Input Field */}
          <div>
            <label
              htmlFor="custom-daily-goal-input"
              className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
            >
              Today's Key Preparation Target or Note:
            </label>
            <input
              id="custom-daily-goal-input"
              type="text"
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
              placeholder="e.g. Mastered STAR answers for customer relations role..."
              className="w-full px-4 py-3 rounded-2xl border border-slate-300 text-slate-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-brand-green transition-all shadow-2xs placeholder:font-normal placeholder:text-slate-400"
              maxLength={140}
              autoFocus={isEditing}
            />
          </div>

          {/* Quick Picks for Today */}
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              ⚡ Quick Picks (Click to select):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_GOAL_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => setGoalInput(prompt)}
                  className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-brand-green-light border border-slate-200 hover:border-brand-green/40 text-slate-700 hover:text-brand-green-dark text-xs font-medium transition-all text-left cursor-pointer"
                >
                  + {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-2">
            {isEditing && (
              <SecondaryButton
                type="button"
                onClick={() => setIsEditing(false)}
                className="text-xs !py-2.5 !px-4"
              >
                Cancel
              </SecondaryButton>
            )}
            <PrimaryButton
              id="save-daily-checkin-btn"
              type="submit"
              icon={<ArrowRight className="w-4 h-4" />}
              className="ml-auto text-xs !py-2.5 !px-6 bg-brand-green hover:bg-brand-green-dark font-bold shadow-md shadow-brand-green/25"
            >
              Record Today&apos;s Progress ⚡
            </PrimaryButton>
          </div>
        </form>
      )}
    </div>
  );
};

export default DailyCheckIn;

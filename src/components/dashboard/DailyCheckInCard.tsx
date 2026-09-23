import React, { useState, useEffect } from 'react';
import { DailyCheckIn } from '../../types';
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
  Mic,
  FileText,
  Send,
  MessageSquare,
  Clock,
  Smile,
  Check,
  Plus,
  TrendingUp,
  Award,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface DailyCheckInCardProps {
  userId: string;
  onCheckInChange?: (checkIn: DailyCheckIn) => void;
  id?: string;
  className?: string;
}

type GoalCategory = 'skills' | 'interview' | 'resume' | 'applications' | 'networking' | 'general';
type ConfidenceLevel = 'fired_up' | 'focused' | 'steady' | 'calm';

interface CategoryConfig {
  id: GoalCategory;
  label: string;
  icon: React.ReactNode;
  color: string;
  badgeBg: string;
  presets: string[];
}

const CATEGORIES: CategoryConfig[] = [
  {
    id: 'skills',
    label: 'Technical Skills',
    icon: <Target className="w-3.5 h-3.5" />,
    color: 'text-brand-green',
    badgeBg: 'bg-brand-green-light border-brand-green/30 text-brand-green-dark',
    presets: [
      'Master 3 essential Excel / SQL functions',
      'Complete 1 hands-on coding or practical drill',
      'Learn 5 industry-specific technical concepts',
    ],
  },
  {
    id: 'interview',
    label: 'Mock Interview',
    icon: <Mic className="w-3.5 h-3.5" />,
    color: 'text-brand-blue',
    badgeBg: 'bg-brand-blue-light border-brand-blue/30 text-brand-blue',
    presets: [
      'Practice 4 behavioral questions using STAR technique',
      'Refine my 60-second elevator pitch in English',
      'Record and review a 5-minute mock answer',
    ],
  },
  {
    id: 'resume',
    label: 'Resume & ATS',
    icon: <FileText className="w-3.5 h-3.5" />,
    color: 'text-brand-orange',
    badgeBg: 'bg-brand-orange-light border-brand-orange/30 text-brand-orange',
    presets: [
      'Add 3 quantifiable metrics to past project bullets',
      'Run ATS analyzer and optimize keyword coverage',
      'Proofread summary and core competencies section',
    ],
  },
  {
    id: 'applications',
    label: 'Job Alerts & Pings',
    icon: <Send className="w-3.5 h-3.5" />,
    color: 'text-indigo-600',
    badgeBg: 'bg-indigo-50 border-indigo-200 text-indigo-800',
    presets: [
      'Apply to 3 high-match recruiter vacancies on JobPing',
      'Set instant alert criteria for target city roles',
      'Tailor custom cover note for top company application',
    ],
  },
];

const DAILY_MICRO_ACTIVITIES = [
  { id: 'act_questions', label: 'Practiced 3+ interview questions', icon: '🎙️' },
  { id: 'act_drills', label: 'Completed 20 mins of skill drills', icon: '⚡' },
  { id: 'act_alerts', label: 'Checked live job matches & alerts', icon: '🔔' },
  { id: 'act_review', label: 'Reviewed curated study resources', icon: '📚' },
];

const CONFIDENCE_OPTIONS: { id: ConfidenceLevel; label: string; icon: string; desc: string }[] = [
  { id: 'fired_up', label: 'Fired Up', icon: '⚡', desc: 'Ready to crush interviews' },
  { id: 'focused', label: 'Focused', icon: '🎯', desc: 'Making deep progress' },
  { id: 'steady', label: 'Steady', icon: '📈', desc: 'Consistent daily steps' },
  { id: 'calm', label: 'Reflective', icon: '🧘', desc: 'Reviewing fundamentals' },
];

export const DailyCheckInCard: React.FC<DailyCheckInCardProps> = ({
  userId,
  onCheckInChange,
  id = 'daily-check-in-card',
  className = '',
}) => {
  const [checkIn, setCheckIn] = useState<DailyCheckIn | null>(null);
  const [goalInput, setGoalInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<GoalCategory>('skills');
  const [confidence, setConfidence] = useState<ConfidenceLevel>('focused');
  const [reflection, setReflection] = useState('');
  const [timeSpent, setTimeSpent] = useState<number>(30);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const today = getTodayDateString();
  const { showGoalCompletionCelebration, showSuccess, showInfo } = useToast();

  useEffect(() => {
    if (userId) {
      const data = getDailyCheckIn(userId);
      setCheckIn(data);
      if (data && data.date === today) {
        setGoalInput(data.goal || '');
        if (data.category) setSelectedCategory(data.category);
        if (data.confidenceLevel) setConfidence(data.confidenceLevel);
        if (data.reflectionNote) setReflection(data.reflectionNote);
        if (data.timeSpentMinutes) setTimeSpent(data.timeSpentMinutes);
        if (data.completedActivities) setSelectedActivities(data.completedActivities);
      }
      if (data && onCheckInChange) {
        onCheckInChange(data);
      }
    }
  }, [userId, today]);

  const hasGoalForToday = Boolean(checkIn && checkIn.date === today && checkIn.goal.trim().length > 0);

  const handleSaveGoal = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!goalInput.trim()) return;

    const payload: Partial<SaveCheckInPayload> = {
      category: selectedCategory,
      confidenceLevel: confidence,
      reflectionNote: reflection.trim() || undefined,
      timeSpentMinutes: timeSpent,
      completedActivities: selectedActivities,
    };

    const saved = saveDailyGoal(userId, goalInput.trim(), payload);
    setCheckIn(saved);
    setIsEditing(false);
    if (onCheckInChange) onCheckInChange(saved);
    showSuccess('Daily Goal Locked In! 🎯', `"${goalInput.trim()}" is set. Check it off once completed!`);
  };

  const handleToggleActivity = (actId: string) => {
    const updated = selectedActivities.includes(actId)
      ? selectedActivities.filter((a) => a !== actId)
      : [...selectedActivities, actId];
    setSelectedActivities(updated);

    if (hasGoalForToday && checkIn) {
      const saved = saveDailyGoal(userId, checkIn.goal, {
        category: checkIn.category,
        confidenceLevel: checkIn.confidenceLevel,
        reflectionNote: checkIn.reflectionNote,
        timeSpentMinutes: checkIn.timeSpentMinutes,
        completedActivities: updated,
      });
      setCheckIn(saved);
      if (onCheckInChange) onCheckInChange(saved);
    }
  };

  const handleToggle = () => {
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

  const streak = checkIn?.streakCount || 0;
  const currentCategoryConfig = CATEGORIES.find((c) => c.id === (checkIn?.category || selectedCategory)) || CATEGORIES[0];

  return (
    <div
      id={id}
      className={`rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-xs relative overflow-hidden transition-all ${className}`}
    >
      {/* Top Brand Accent Gradient Bar */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand-green via-brand-blue to-brand-orange" />

      {/* Header section with streak indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-green-light border border-brand-green/30 flex items-center justify-center text-brand-green shrink-0 shadow-2xs">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-black text-brand-navy tracking-tight">
                Daily Career Check-in
              </h3>
              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider bg-brand-green-light text-brand-green-dark px-2.5 py-0.5 rounded-full border border-brand-green/20">
                <Zap className="w-3 h-3 text-brand-green fill-brand-green" />
                {hasGoalForToday && checkIn?.completed ? 'Completed Today' : "Today's Target"}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Log daily progress, master key drills, and protect your preparation streak.
            </p>
          </div>
        </div>

        {/* Consistency Streak Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-brand-orange-light to-amber-50 border border-brand-orange/30 text-brand-navy self-start sm:self-auto shadow-2xs">
          <Flame
            className={`w-4 h-4 ${
              streak > 0 ? 'text-brand-orange fill-brand-orange animate-bounce' : 'text-slate-400'
            }`}
          />
          <div className="text-xs font-black">
            <span className="text-brand-orange">{streak}</span>{' '}
            <span className="text-slate-700">{streak === 1 ? 'Day' : 'Days'} Streak</span>
          </div>
        </div>
      </div>

      {/* Body Content */}
      <div className="pt-5">
        {hasGoalForToday && !isEditing ? (
          /* ================= ACTIVE GOAL VIEW ================= */
          <div className="space-y-5">
            {/* Primary Goal Completion Card */}
            <div
              onClick={handleToggle}
              className={`group p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 select-none ${
                checkIn?.completed
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950 shadow-2xs'
                  : 'bg-slate-50/80 hover:bg-slate-100/90 border-slate-200 text-slate-900 hover:border-brand-green/40 shadow-2xs'
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
                <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border uppercase tracking-wider ${currentCategoryConfig.badgeBg}`}
                    >
                      {currentCategoryConfig.label}
                    </span>
                    {checkIn?.timeSpentMinutes && (
                      <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" /> {checkIn.timeSpentMinutes} mins
                      </span>
                    )}
                  </div>

                  <span
                    className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                      checkIn?.completed
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        : 'bg-amber-100 text-amber-900 border border-amber-300'
                    }`}
                  >
                    {checkIn?.completed ? 'Done for Today 🎉' : 'In Progress (Click to Complete)'}
                  </span>
                </div>

                <p
                  className={`text-base font-bold leading-relaxed ${
                    checkIn?.completed ? 'line-through text-slate-500' : 'text-slate-900'
                  }`}
                >
                  {checkIn?.goal}
                </p>

                {/* Reflection note if added */}
                {checkIn?.reflectionNote && (
                  <div className="mt-2.5 p-2.5 rounded-xl bg-white/80 border border-slate-200/80 text-xs text-slate-700 italic">
                    <span className="font-bold text-slate-900 not-italic">Daily Reflection: </span>&ldquo;
                    {checkIn.reflectionNote}&rdquo;
                  </div>
                )}

                <span className="text-[11px] text-slate-400 mt-2 block font-medium">
                  {checkIn?.completed
                    ? 'Streak incremented! Click anytime to toggle status.'
                    : 'Click checkbox when finished to log today’s progress.'}
                </span>
              </div>
            </div>

            {/* Quick Micro-Activities Logger */}
            <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-brand-orange" />
                  <span>Today's Career Drills Logged ({selectedActivities.length}/4)</span>
                </span>
                <span className="text-[11px] font-semibold text-slate-400">Tap to check off</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {DAILY_MICRO_ACTIVITIES.map((act) => {
                  const isDone = selectedActivities.includes(act.id);
                  return (
                    <button
                      key={act.id}
                      type="button"
                      onClick={() => handleToggleActivity(act.id)}
                      className={`flex items-center gap-2 p-2 rounded-xl text-left text-xs font-semibold transition-all border cursor-pointer ${
                        isDone
                          ? 'bg-brand-green-light border-brand-green/40 text-brand-green-dark'
                          : 'bg-white hover:bg-slate-100/80 border-slate-200 text-slate-700'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 border ${
                          isDone
                            ? 'bg-brand-green border-brand-green text-white'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isDone && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span className="truncate">{act.icon} {act.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Actions Row */}
            <div className="flex items-center justify-between pt-1 text-xs">
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-1.5 text-slate-600 hover:text-brand-navy font-bold transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                <span>Edit Today&apos;s Target</span>
              </button>

              <span className="text-[11px] font-semibold text-slate-400">
                Resets daily at midnight • ⚡ JobPing Sync
              </span>
            </div>
          </div>
        ) : (
          /* ================= GOAL CREATION / EDIT VIEW ================= */
          <form onSubmit={handleSaveGoal} className="space-y-4">
            {/* Category Selector Tabs */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                1. Select Focus Area:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                      selectedCategory === cat.id
                        ? `${cat.badgeBg} ring-2 ring-brand-green/30 shadow-2xs`
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    <span className={cat.color}>{cat.icon}</span>
                    <span className="truncate">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Goal Input Field */}
            <div>
              <label
                htmlFor="daily-goal-input"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                2. What is your #1 Career Target for Today?
              </label>
              <div className="relative">
                <input
                  id="daily-goal-input"
                  type="text"
                  value={goalInput}
                  onChange={(e) => setGoalInput(e.target.value)}
                  placeholder="e.g. Practice 4 STAR interview answers, master VLOOKUP, or apply to 2 roles..."
                  className="w-full px-4 py-3 rounded-2xl border border-slate-300 text-slate-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-brand-green transition-all shadow-2xs placeholder:font-normal placeholder:text-slate-400"
                  maxLength={140}
                  autoFocus={isEditing}
                />
              </div>
            </div>

            {/* Quick Suggestion Chips from Selected Category */}
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                ⚡ Quick-Pick Recommendations ({CATEGORIES.find((c) => c.id === selectedCategory)?.label}):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.find((c) => c.id === selectedCategory)?.presets.map((prompt) => (
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

            {/* Toggle Advanced Options (Time, Mindset, Reflection) */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-xs font-bold text-brand-blue hover:text-blue-700 flex items-center gap-1 cursor-pointer"
              >
                <span>{showAdvanced ? 'Hide Optional Details' : '+ Add Time, Mindset & Notes'}</span>
                {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showAdvanced && (
                <div className="mt-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3.5">
                  {/* Confidence Mindset Selector */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Today's Energy / Mindset:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {CONFIDENCE_OPTIONS.map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setConfidence(opt.id)}
                          className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                            confidence === opt.id
                              ? 'bg-white border-brand-green text-brand-green-dark shadow-2xs'
                              : 'bg-white/60 border-slate-200 text-slate-600 hover:bg-white'
                          }`}
                        >
                          <span>{opt.icon}</span>
                          <span>{opt.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Estimated Time Spent */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Planned Target Time:
                      </label>
                      <span className="text-xs font-extrabold text-brand-navy">{timeSpent} Minutes</span>
                    </div>
                    <div className="flex gap-2">
                      {[15, 30, 45, 60].map((mins) => (
                        <button
                          key={mins}
                          type="button"
                          onClick={() => setTimeSpent(mins)}
                          className={`flex-1 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                            timeSpent === mins
                              ? 'bg-brand-navy text-white border-brand-navy'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {mins}m
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Optional Reflection Note */}
                  <div>
                    <label
                      htmlFor="daily-reflection-input"
                      className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1"
                    >
                      Key Win or Note to Remember:
                    </label>
                    <input
                      id="daily-reflection-input"
                      type="text"
                      value={reflection}
                      onChange={(e) => setReflection(e.target.value)}
                      placeholder="e.g. Cleared 2 rounds of mock interview, need more metrics on project #2..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-brand-green"
                      maxLength={120}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
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
                id="save-daily-goal-btn"
                type="submit"
                disabled={!goalInput.trim()}
                icon={<ArrowRight className="w-4 h-4" />}
                className="ml-auto text-xs !py-2.5 !px-6 bg-brand-green hover:bg-brand-green-dark shadow-md shadow-brand-green/25 font-bold"
              >
                Save Today&apos;s Goal ⚡
              </PrimaryButton>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

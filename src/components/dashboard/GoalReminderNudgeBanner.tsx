import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BellRing,
  Flame,
  CheckCircle2,
  Clock,
  X,
  Sparkles,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { DailyCheckIn, StreakStats, CareerProfile } from '../../types';
import { isPastEveningTime, getReminderSettings } from '../../services/reminderService';
import { toggleGoalCompletion, getTodayDateString } from '../../services/checkInService';
import { useToast } from '../../context/ToastContext';

interface GoalReminderNudgeBannerProps {
  userId: string;
  checkIn: DailyCheckIn | null;
  stats: StreakStats;
  profile: CareerProfile | null;
  onGoalCompleted?: (updated: DailyCheckIn) => void;
  onOpenReminderSettings?: () => void;
}

export const GoalReminderNudgeBanner: React.FC<GoalReminderNudgeBannerProps> = ({
  userId,
  checkIn,
  stats,
  profile,
  onGoalCompleted,
  onOpenReminderSettings,
}) => {
  const { showSuccess, showGoalCompletionCelebration } = useToast();
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const [hoursLeftUntilMidnight, setHoursLeftUntilMidnight] = useState<number>(4);

  const settings = getReminderSettings(userId, profile?.uid ? '' : '');
  const today = getTodayDateString();
  const isGoalDone = checkIn?.date === today && checkIn?.completed;
  const isEvening = isPastEveningTime(settings.eveningReminderTime || '19:00');

  // Calculate hours until midnight
  useEffect(() => {
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    const diffHours = Math.max(1, Math.round((midnight.getTime() - now.getTime()) / (1000 * 60 * 60)));
    setHoursLeftUntilMidnight(diffHours);
  }, []);

  // Show if: reminders enabled, not dismissed, not completed today, and it's evening (or user has an active goal)
  if (!settings.enabled || isDismissed || isGoalDone) {
    return null;
  }

  const handleQuickComplete = () => {
    const updated = toggleGoalCompletion(userId);
    if (updated) {
      if (onGoalCompleted) onGoalCompleted(updated);
      showGoalCompletionCelebration(
        updated.goal || "Today's learning goal",
        updated.streakCount
      );
    }
  };

  const streak = stats.currentStreak;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="rounded-2xl border border-amber-300 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 p-4 sm:p-5 text-white shadow-md relative overflow-hidden"
        id="evening-nudge-banner"
      >
        {/* Glow effect */}
        <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 border border-white/25 shadow-2xs">
              <Flame className="w-5 h-5 text-amber-100 animate-pulse" />
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-black/20 text-white uppercase tracking-wider border border-white/20">
                  Evening Goal Reminder
                </span>
                {streak > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-white text-orange-800">
                    🔥 Protect {streak}-Day Streak
                  </span>
                )}
                <span className="text-xs text-amber-100 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> ~{hoursLeftUntilMidnight} hours before midnight
                </span>
              </div>

              <h4 className="text-sm sm:text-base font-extrabold text-white tracking-tight">
                {checkIn?.goal
                  ? `Don't forget today's goal: "${checkIn.goal.length > 50 ? checkIn.goal.substring(0, 48) + '...' : checkIn.goal}"`
                  : `Complete your 15-minute learning check-in for ${profile?.targetJob || 'your target role'}!`}
              </h4>
              <p className="text-xs text-amber-100/90 max-w-xl">
                Logging your goal takes just 30 seconds and awards +5 readiness points toward your weekly consistency score.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center w-full sm:w-auto">
            {checkIn?.goal && (
              <button
                id="quick-complete-nudge-btn"
                onClick={handleQuickComplete}
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-white text-orange-900 font-bold text-xs shadow-sm hover:bg-amber-50 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Mark as Done</span>
              </button>
            )}

            {onOpenReminderSettings && (
              <button
                id="open-reminder-settings-btn"
                onClick={onOpenReminderSettings}
                className="px-3 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-xs border border-white/20 transition-all cursor-pointer"
                title="Reminder Settings"
              >
                <BellRing className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              id="dismiss-nudge-banner-btn"
              onClick={() => setIsDismissed(true)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
              title="Dismiss for today"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

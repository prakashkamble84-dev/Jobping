import { DailyCheckIn, StreakStats, DayStreakItem } from '../types';

const CHECKIN_STORAGE_PREFIX = 'jobready_daily_checkin_';

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getYesterdayDateString(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const year = yesterday.getFullYear();
  const month = String(yesterday.getMonth() + 1).padStart(2, '0');
  const day = String(yesterday.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDailyCheckIn(uid: string): DailyCheckIn | null {
  if (!uid) return null;
  try {
    const raw = localStorage.getItem(`${CHECKIN_STORAGE_PREFIX}${uid}`);
    if (!raw) return null;
    return JSON.parse(raw) as DailyCheckIn;
  } catch {
    return null;
  }
}

export interface SaveCheckInPayload {
  goalText: string;
  category?: DailyCheckIn['category'];
  confidenceLevel?: DailyCheckIn['confidenceLevel'];
  reflectionNote?: string;
  timeSpentMinutes?: number;
  hoursStudied?: number;
  applicationsSent?: number;
  questionsPracticed?: number;
  completedActivities?: string[];
}

export function saveDailyGoal(
  uid: string,
  goalText: string,
  extra?: Partial<SaveCheckInPayload>
): DailyCheckIn {
  const today = getTodayDateString();
  const yesterday = getYesterdayDateString();
  const existing = getDailyCheckIn(uid);

  let streak = existing?.streakCount || 0;
  // If user had a streak and their last completed date was yesterday or today, keep it. Otherwise reset if they skipped.
  if (existing?.lastCompletedDate && existing.lastCompletedDate !== yesterday && existing.lastCompletedDate !== today) {
    streak = 0;
  }

  const isToday = existing?.date === today;
  const history = existing?.completedHistory || [];
  const bestStreak = existing?.bestStreak || streak;

  const newCheckIn: DailyCheckIn = {
    date: today,
    goal: goalText.trim(),
    completed: isToday ? existing.completed : false,
    streakCount: streak,
    bestStreak: Math.max(bestStreak, streak),
    completedHistory: history,
    lastCompletedDate: existing?.lastCompletedDate,
    category: extra?.category || (isToday ? existing?.category : 'general'),
    confidenceLevel: extra?.confidenceLevel || (isToday ? existing?.confidenceLevel : undefined),
    reflectionNote: extra?.reflectionNote !== undefined ? extra.reflectionNote : (isToday ? existing?.reflectionNote : undefined),
    timeSpentMinutes: extra?.timeSpentMinutes !== undefined ? extra.timeSpentMinutes : (isToday ? existing?.timeSpentMinutes : undefined),
    hoursStudied: extra?.hoursStudied !== undefined ? extra.hoursStudied : (isToday ? existing?.hoursStudied : undefined),
    applicationsSent: extra?.applicationsSent !== undefined ? extra.applicationsSent : (isToday ? existing?.applicationsSent : undefined),
    questionsPracticed: extra?.questionsPracticed !== undefined ? extra.questionsPracticed : (isToday ? existing?.questionsPracticed : undefined),
    completedActivities: extra?.completedActivities || (isToday ? existing?.completedActivities : []),
    updatedAt: new Date().toISOString(),
  };

  localStorage.setItem(`${CHECKIN_STORAGE_PREFIX}${uid}`, JSON.stringify(newCheckIn));
  return newCheckIn;
}

export function toggleGoalCompletion(uid: string): DailyCheckIn | null {
  const today = getTodayDateString();
  const existing = getDailyCheckIn(uid);
  if (!existing || existing.date !== today) return null;

  const willComplete = !existing.completed;
  let newStreak = existing.streakCount;
  let history = [...(existing.completedHistory || [])];

  if (willComplete) {
    newStreak = Math.max(1, existing.streakCount + (existing.lastCompletedDate === today ? 0 : 1));
    if (!history.includes(today)) {
      history.push(today);
    }
  } else {
    // Undo complete
    if (existing.lastCompletedDate === today && existing.streakCount > 0) {
      newStreak = Math.max(0, existing.streakCount - 1);
    }
    history = history.filter((d) => d !== today);
  }

  const bestStreak = Math.max(existing.bestStreak || 0, newStreak);

  const updated: DailyCheckIn = {
    ...existing,
    completed: willComplete,
    streakCount: newStreak,
    bestStreak,
    completedHistory: history,
    lastCompletedDate: willComplete ? today : existing.lastCompletedDate === today ? undefined : existing.lastCompletedDate,
    updatedAt: new Date().toISOString(),
  };

  localStorage.setItem(`${CHECKIN_STORAGE_PREFIX}${uid}`, JSON.stringify(updated));
  return updated;
}

const MILESTONES = [
  { target: 3, title: '3-Day Starter Flame' },
  { target: 7, title: '7-Day Momentum Builder' },
  { target: 14, title: '14-Day Consistency Master' },
  { target: 30, title: '30-Day Job-Ready Champion' },
  { target: 60, title: '60-Day Career Elite' },
];

export function computeStreakStats(checkIn: DailyCheckIn | null): StreakStats {
  const todayStr = getTodayDateString();
  const history = checkIn?.completedHistory || [];
  const currentStreak = checkIn?.streakCount || 0;
  const bestStreak = Math.max(checkIn?.bestStreak || 0, currentStreak);
  const totalCompletedDays = history.length;

  // Compute 7-day window ending today
  const weeklyDays: DayStreakItem[] = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dStr = `${year}-${month}-${day}`;
    const dayName = dayNames[d.getDay()];
    const isToday = dStr === todayStr;

    let status: DayStreakItem['status'] = 'missed';
    if (history.includes(dStr)) {
      status = 'completed';
    } else if (isToday) {
      status = checkIn?.completed ? 'completed' : 'today-pending';
    } else {
      status = 'missed';
    }

    weeklyDays.push({
      dayName,
      dateString: dStr,
      isToday,
      status,
    });
  }

  // Find next milestone
  const next = MILESTONES.find((m) => m.target > currentStreak) || {
    target: currentStreak + 10,
    title: 'Legendary Consistency',
  };

  const daysRemaining = Math.max(0, next.target - currentStreak);

  return {
    currentStreak,
    bestStreak,
    totalCompletedDays,
    weeklyDays,
    nextMilestone: {
      target: next.target,
      title: next.title,
      daysRemaining,
    },
  };
}

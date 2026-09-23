import { ReminderSettings, ReminderDispatchRecord, DailyCheckIn, StreakStats } from '../types';
import { getTodayDateString } from './checkInService';

const SETTINGS_PREFIX = 'jobready_reminder_settings_';
const LOGS_PREFIX = 'jobready_reminder_logs_';

export const DEFAULT_REMINDER_SETTINGS: ReminderSettings = {
  enabled: true,
  eveningReminderTime: '20:00', // 8:00 PM
  channels: {
    browserPush: true,
    email: true,
    inAppToast: true,
  },
  emailAddress: '',
  weekendReminders: true,
  nudgeTone: 'streak_focused',
};

export function getReminderSettings(userId: string, fallbackEmail = ''): ReminderSettings {
  if (!userId) return { ...DEFAULT_REMINDER_SETTINGS, emailAddress: fallbackEmail };
  try {
    const raw = localStorage.getItem(`${SETTINGS_PREFIX}${userId}`);
    if (!raw) return { ...DEFAULT_REMINDER_SETTINGS, emailAddress: fallbackEmail };
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_REMINDER_SETTINGS,
      ...parsed,
      emailAddress: parsed.emailAddress || fallbackEmail,
    };
  } catch {
    return { ...DEFAULT_REMINDER_SETTINGS, emailAddress: fallbackEmail };
  }
}

export function saveReminderSettings(userId: string, settings: ReminderSettings): void {
  if (!userId) return;
  try {
    localStorage.setItem(`${SETTINGS_PREFIX}${userId}`, JSON.stringify(settings));
  } catch (err) {
    console.error('Error saving reminder settings', err);
  }
}

export function getReminderDispatchLogs(userId: string): ReminderDispatchRecord[] {
  if (!userId) return [];
  try {
    const raw = localStorage.getItem(`${LOGS_PREFIX}${userId}`);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function recordReminderDispatch(userId: string, record: Omit<ReminderDispatchRecord, 'id' | 'timestamp'>): ReminderDispatchRecord {
  const newRecord: ReminderDispatchRecord = {
    ...record,
    id: `nudge_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
  };

  try {
    const existing = getReminderDispatchLogs(userId);
    const updated = [newRecord, ...existing.slice(0, 19)]; // keep latest 20
    localStorage.setItem(`${LOGS_PREFIX}${userId}`, JSON.stringify(updated));
  } catch (err) {
    console.error('Error saving reminder log', err);
  }

  return newRecord;
}

export async function requestBrowserNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    return 'denied';
  }
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (err) {
    console.warn('Browser notifications not supported or blocked in iframe context', err);
    return 'denied';
  }
}

export function triggerBrowserPushNotification(title: string, body: string, icon = '/favicon.ico'): boolean {
  if (!('Notification' in window)) return false;
  if (Notification.permission !== 'granted') return false;

  try {
    const notification = new Notification(title, {
      body,
      icon,
      badge: icon,
      tag: 'daily-goal-reminder',
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    return true;
  } catch (err) {
    console.warn('Notification constructor error (likely sandbox/iframe restrictions):', err);
    return false;
  }
}

export function generateNudgeCopy(
  goalText: string,
  streakCount: number,
  tone: ReminderSettings['nudgeTone'] = 'streak_focused',
  targetRole = 'Career'
): { title: string; body: string; emailSubject: string } {
  const goalSnippet = goalText ? `"${goalText.length > 40 ? goalText.substring(0, 38) + '...' : goalText}"` : 'your daily preparation goal';

  if (tone === 'streak_focused') {
    if (streakCount > 0) {
      return {
        title: `🔥 Protect your ${streakCount}-day streak!`,
        body: `It's evening! Complete ${goalSnippet} before midnight to keep your streak alive.`,
        emailSubject: `⏰ Evening Reminder: Don't lose your ${streakCount}-day JobReady streak!`,
      };
    }
    return {
      title: '🎯 Start your learning streak tonight!',
      body: `Complete ${goalSnippet} tonight to earn +5 readiness points and launch your streak.`,
      emailSubject: `🎯 Evening Reminder: Complete today's goal for ${targetRole}`,
    };
  }

  if (tone === 'career_coach') {
    return {
      title: `💼 15 mins closer to your ${targetRole} offer`,
      body: `Consistency wins interviews. Take 15 minutes tonight to complete ${goalSnippet}.`,
      emailSubject: `💼 Daily Career Nudge: Complete ${goalSnippet} tonight`,
    };
  }

  // Friendly default
  return {
    title: '🌟 Evening Check-In: How did today go?',
    body: `Take a quick moment to log ${goalSnippet} and review today's career progress.`,
    emailSubject: `🌟 Quick Evening Nudge: Check off today's learning goal`,
  };
}

export function isPastEveningTime(timeString: string): boolean {
  try {
    const [targetHours, targetMinutes] = timeString.split(':').map(Number);
    const now = new Date();
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();

    if (currentHours > targetHours) return true;
    if (currentHours === targetHours && currentMinutes >= targetMinutes) return true;
    return false;
  } catch {
    return false;
  }
}

import { CareerProfile, AICareerInsight } from '../types';

const INSIGHT_CACHE_PREFIX = 'jobready_daily_career_insight_';
const INSIGHT_ACTION_DONE_PREFIX = 'jobready_insight_action_done_';

export async function fetchDailyCareerInsight(
  userId: string,
  profile: CareerProfile | null,
  forceRefresh: boolean = false
): Promise<AICareerInsight> {
  const todayKey = new Date().toISOString().split('T')[0];
  const cacheKey = `${INSIGHT_CACHE_PREFIX}${userId}_${todayKey}`;

  if (!forceRefresh) {
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        return JSON.parse(cached) as AICareerInsight;
      }
    } catch {
      // Ignore cache retrieval errors
    }
  }

  const targetJob = profile?.targetJob || 'Entry-Level Associate';
  const education = profile?.education || 'Graduate / Diploma';
  const experienceLevel = profile?.experienceLevel || 'Fresher';
  const currentSkills = profile?.skills || [];
  const preferredCity = profile?.preferredCity || 'India';

  const response = await fetch('/api/daily-career-insight', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      targetJob,
      education,
      experienceLevel,
      currentSkills,
      preferredCity,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch career insight: ${response.statusText}`);
  }

  const data: AICareerInsight = await response.json();
  data.generatedDate = todayKey;

  try {
    localStorage.setItem(cacheKey, JSON.stringify(data));
  } catch {
    // Ignore cache save errors
  }

  return data;
}

export function isQuickActionCompletedToday(userId: string): boolean {
  if (!userId) return false;
  const todayKey = new Date().toISOString().split('T')[0];
  return localStorage.getItem(`${INSIGHT_ACTION_DONE_PREFIX}${userId}_${todayKey}`) === 'true';
}

export function markQuickActionCompletedToday(userId: string, completed: boolean): void {
  if (!userId) return;
  const todayKey = new Date().toISOString().split('T')[0];
  if (completed) {
    localStorage.setItem(`${INSIGHT_ACTION_DONE_PREFIX}${userId}_${todayKey}`, 'true');
  } else {
    localStorage.removeItem(`${INSIGHT_ACTION_DONE_PREFIX}${userId}_${todayKey}`);
  }
}

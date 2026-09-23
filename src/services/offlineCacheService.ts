import { CareerProfile, ScoreBreakdown, ResourceItem, DailyCheckIn, StreakStats } from '../types';
import { getBookmarkedResourceIds } from './resourceService';
import { CURATED_RESOURCE_CATALOG } from './resourceService';
import { computeStreakStats, getDailyCheckIn } from './checkInService';

export interface OfflineAppSnapshot {
  version: number;
  lastSyncedAt: string;
  userId: string;
  profile: CareerProfile | null;
  score: number;
  scoreBreakdown: ScoreBreakdown | null;
  bookmarkedResources: ResourceItem[];
  allResourcesCount: number;
  checkIn: DailyCheckIn | null;
  streakStats: StreakStats | null;
  cachedModules: {
    profileAvailable: boolean;
    scoreAvailable: boolean;
    resourcesAvailable: boolean;
    dailyCheckInAvailable: boolean;
    interviewHistoryAvailable: boolean;
    resumeAnalyzerAvailable: boolean;
    salaryBenchmarkAvailable: boolean;
    careerRoadmapAvailable: boolean;
  };
}

const OFFLINE_SNAPSHOT_PREFIX = 'jobready_offline_snapshot_';
const OFFLINE_LAST_SYNC_KEY = 'jobready_last_offline_sync_time';

export function saveOfflineSnapshot(
  userId: string,
  profile: CareerProfile | null,
  score: number,
  scoreBreakdown: ScoreBreakdown | null,
  checkIn?: DailyCheckIn | null
): OfflineAppSnapshot {
  if (!userId) {
    // Fallback for anonymous
    userId = 'guest_user';
  }

  const bookmarkedIds = getBookmarkedResourceIds();
  const bookmarkedResources = CURATED_RESOURCE_CATALOG.filter((r) =>
    bookmarkedIds.includes(r.id)
  );

  const activeCheckIn = checkIn !== undefined ? checkIn : getDailyCheckIn(userId);
  const streakStats = computeStreakStats(activeCheckIn);

  // Check if interview, resume, and roadmap caches exist in localStorage
  const hasInterviews = !!localStorage.getItem(`jobready_interviews_${userId}`);
  const hasResume = !!localStorage.getItem(`jobready_resume_audit_${userId}`);
  const hasSalary = !!localStorage.getItem(`jobready_salary_benchmarks_${userId}`);
  const hasRoadmap = !!localStorage.getItem(`jobready_career_roadmap_${userId}_${encodeURIComponent(profile?.targetJob || 'default')}`);

  const snapshot: OfflineAppSnapshot = {
    version: 1,
    lastSyncedAt: new Date().toISOString(),
    userId,
    profile,
    score,
    scoreBreakdown,
    bookmarkedResources,
    allResourcesCount: CURATED_RESOURCE_CATALOG.length,
    checkIn: activeCheckIn,
    streakStats,
    cachedModules: {
      profileAvailable: !!profile,
      scoreAvailable: score > 0,
      resourcesAvailable: bookmarkedResources.length > 0 || CURATED_RESOURCE_CATALOG.length > 0,
      dailyCheckInAvailable: !!activeCheckIn,
      interviewHistoryAvailable: hasInterviews,
      resumeAnalyzerAvailable: hasResume,
      salaryBenchmarkAvailable: hasSalary,
      careerRoadmapAvailable: hasRoadmap,
    },
  };

  try {
    localStorage.setItem(`${OFFLINE_SNAPSHOT_PREFIX}${userId}`, JSON.stringify(snapshot));
    localStorage.setItem(OFFLINE_LAST_SYNC_KEY, snapshot.lastSyncedAt);
  } catch (err) {
    console.warn('Could not save offline snapshot to localStorage:', err);
  }

  return snapshot;
}

export function getOfflineSnapshot(userId: string): OfflineAppSnapshot | null {
  if (!userId) userId = 'guest_user';
  try {
    const raw = localStorage.getItem(`${OFFLINE_SNAPSHOT_PREFIX}${userId}`);
    if (!raw) return null;
    return JSON.parse(raw) as OfflineAppSnapshot;
  } catch {
    return null;
  }
}

export function getLastOfflineSyncTime(): string | null {
  return localStorage.getItem(OFFLINE_LAST_SYNC_KEY);
}

export function clearOfflineCache(userId: string): void {
  try {
    localStorage.removeItem(`${OFFLINE_SNAPSHOT_PREFIX}${userId}`);
  } catch (err) {
    console.error('Failed to clear offline cache:', err);
  }
}

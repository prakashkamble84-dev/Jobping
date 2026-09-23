import { CareerProfile, SkillsGapAnalysis } from '../types';

const SKILLS_GAP_CACHE_PREFIX = 'jobready_skills_gap_';

export async function fetchSkillsGapAnalysis(
  profile: CareerProfile | null
): Promise<SkillsGapAnalysis> {
  const targetJob = profile?.targetJob || 'Entry-Level Professional';
  const education = profile?.education || 'Graduate / Diploma';
  const experienceLevel = profile?.experienceLevel || 'Fresher';
  const currentSkills = profile?.skills || [];

  const response = await fetch('/api/skills-gap-analysis', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      targetJob,
      education,
      experienceLevel,
      currentSkills,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to analyze skills gap: ${response.statusText}`);
  }

  const data: SkillsGapAnalysis = await response.json();
  data.analyzedAt = new Date().toISOString();

  // Save to cache
  if (profile) {
    try {
      localStorage.setItem(
        `${SKILLS_GAP_CACHE_PREFIX}${profile.targetJob}`,
        JSON.stringify(data)
      );
    } catch {
      // ignore storage quota issues
    }
  }

  return data;
}

export function getCachedSkillsGapAnalysis(
  targetJob?: string
): SkillsGapAnalysis | null {
  if (!targetJob) return null;
  try {
    const raw = localStorage.getItem(`${SKILLS_GAP_CACHE_PREFIX}${targetJob}`);
    if (!raw) return null;
    return JSON.parse(raw) as SkillsGapAnalysis;
  } catch {
    return null;
  }
}

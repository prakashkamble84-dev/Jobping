import { CareerProfile, ScoreBreakdown, AchievementBadge } from '../types';
import { calculateProfileCompletion } from './scoreCalculator';

export function calculateAchievements(
  profile: CareerProfile | null,
  score: ScoreBreakdown
): AchievementBadge[] {
  const profilePercent = calculateProfileCompletion(profile);
  const skillsCount = profile?.skills?.length || 0;
  const langCount = profile?.languages?.length || 0;
  const goalLength = (profile?.careerGoal || profile?.careerObjective || '').trim().length;
  const hasTargetRoleAndLocation = Boolean(
    profile?.targetJob && profile?.preferredCity && profile?.workPreference
  );

  const achievements: AchievementBadge[] = [
    {
      id: 'profile_pioneer',
      title: 'Profile Pioneer',
      description: 'Completed your foundational career setup.',
      category: 'milestone',
      iconName: 'UserCheck',
      tier: 'bronze',
      requirement: 'Complete 100% of your career profile fields',
      progressPercent: profilePercent,
      isUnlocked: profilePercent >= 100,
    },
    {
      id: 'skill_stacker',
      title: 'Skill Stacker',
      description: 'Listed at least 3 relevant job skills.',
      category: 'skills',
      iconName: 'Layers',
      tier: 'bronze',
      requirement: 'Add 3 or more skills to your profile',
      progressPercent: Math.min(100, Math.round((skillsCount / 3) * 100)),
      isUnlocked: skillsCount >= 3,
    },
    {
      id: 'career_visionary',
      title: 'Career Visionary',
      description: 'Articulated a clear career objective statement.',
      category: 'goal',
      iconName: 'Compass',
      tier: 'silver',
      requirement: 'Write a specific career goal (30+ characters)',
      progressPercent: Math.min(100, Math.round((goalLength / 30) * 100)),
      isUnlocked: goalLength >= 30,
    },
    {
      id: 'multilingual_communicator',
      title: 'Polyglot Communicator',
      description: 'Versatile communication in 2 or more languages.',
      category: 'skills',
      iconName: 'Globe',
      tier: 'silver',
      requirement: 'Add 2 or more spoken / written languages',
      progressPercent: Math.min(100, Math.round((langCount / 2) * 100)),
      isUnlocked: langCount >= 2,
    },
    {
      id: 'target_locked',
      title: 'Target Locked',
      description: 'Firmly pinned down role, location & work preference.',
      category: 'milestone',
      iconName: 'Target',
      tier: 'silver',
      requirement: 'Set target role, city, and work style preference',
      progressPercent: hasTargetRoleAndLocation ? 100 : 50,
      isUnlocked: hasTargetRoleAndLocation,
    },
    {
      id: 'skill_master',
      title: 'Skill Master',
      description: 'Built a robust capability arsenal with 6+ skills.',
      category: 'skills',
      iconName: 'Cpu',
      tier: 'gold',
      requirement: 'Add 6 or more industry skills',
      progressPercent: Math.min(100, Math.round((skillsCount / 6) * 100)),
      isUnlocked: skillsCount >= 6,
    },
    {
      id: 'readiness_50',
      title: 'Rising Aspirant',
      description: 'Crossed the 50/100 threshold on the readiness engine.',
      category: 'readiness',
      iconName: 'TrendingUp',
      tier: 'silver',
      requirement: 'Achieve a JobReady score of 50 or higher',
      progressPercent: Math.min(100, Math.round((score.overallScore / 50) * 100)),
      isUnlocked: score.overallScore >= 50,
    },
    {
      id: 'readiness_70',
      title: 'Job Ready in Progress',
      description: 'Solid foundation ready for active recruitment.',
      category: 'readiness',
      iconName: 'Award',
      tier: 'gold',
      requirement: 'Achieve a JobReady score of 70 or higher',
      progressPercent: Math.min(100, Math.round((score.overallScore / 70) * 100)),
      isUnlocked: score.overallScore >= 70,
    },
    {
      id: 'readiness_85',
      title: 'Prime Candidate',
      description: 'Elite readiness for high-standard interview rounds.',
      category: 'readiness',
      iconName: 'Crown',
      tier: 'platinum',
      requirement: 'Achieve a JobReady score of 85 or higher',
      progressPercent: Math.min(100, Math.round((score.overallScore / 85) * 100)),
      isUnlocked: score.overallScore >= 85,
    },
  ];

  return achievements;
}

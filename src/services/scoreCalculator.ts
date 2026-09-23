import { CareerProfile, ScoreBreakdown, ScoreCategory } from '../types';

export function calculateProfileCompletion(profile: Partial<CareerProfile> | null | undefined): number {
  if (!profile) return 0;

  const checks = [
    Boolean(profile.jobPreference && profile.jobPreference.trim() !== ''),
    Boolean(profile.education && profile.education.trim() !== ''),
    Boolean(profile.experienceLevel && profile.experienceLevel.trim() !== ''),
    Boolean(profile.targetJob && profile.targetJob.trim() !== ''),
    Boolean(profile.preferredCity && profile.preferredCity.trim() !== ''),
    Boolean(profile.workPreference && profile.workPreference.trim() !== ''),
    Boolean(profile.salaryMin || profile.salaryMax),
    Boolean(profile.skills && profile.skills.length > 0),
    Boolean(profile.languages && profile.languages.length > 0),
    Boolean(
      (profile.careerGoal && profile.careerGoal.trim().length > 5) ||
      (profile.careerObjective && profile.careerObjective.trim().length > 5)
    ),
  ];

  const completed = checks.filter(Boolean).length;
  return Math.round((completed / checks.length) * 100);
}

export function calculateSkillsScore(skills: string[] | undefined): number {
  if (!skills || skills.length === 0) return 0;
  const count = skills.length;
  if (count === 1) return 35;
  if (count === 2) return 55;
  if (count === 3) return 75;
  if (count === 4) return 90;
  return 100; // 5 or more skills
}

export function calculateCareerGoalScore(goal: string | undefined, objective: string | undefined): number {
  const text = (goal || objective || '').trim();
  if (!text) return 0;
  if (text.length < 15) return 40;
  if (text.length < 35) return 70;
  if (text.length < 70) return 85;
  return 100;
}

export function calculateTargetJobScore(targetJob: string | undefined): number {
  if (!targetJob || targetJob.trim() === '' || targetJob === 'Other') return 0;
  return 100;
}

export function getScoreCategory(score: number): { category: ScoreCategory; feedback: string } {
  if (score < 40) {
    return {
      category: 'Getting Started',
      feedback: "You're beginning your career preparation journey. Complete the key profile steps to unlock tailored insights.",
    };
  }
  if (score < 60) {
    return {
      category: 'Developing',
      feedback: "Good progress on your foundational details. Adding more specific skills and clarifying your career goal will boost your readiness.",
    };
  }
  if (score < 75) {
    return {
      category: 'Job Ready in Progress',
      feedback: "You're building a strong foundation. A few refinements will help you stand out to hiring managers.",
    };
  }
  if (score < 90) {
    return {
      category: 'Strong Preparation',
      feedback: 'Well-defined career target and core skill sets documented. You are on a solid preparation track.',
    };
  }
  return {
    category: 'Highly Prepared',
    feedback: 'Comprehensive profile, strong goal clarity, and rich skills inventory documented. Excellent preparation base.',
  };
}

export function calculateJobReadyScore(profile: Partial<CareerProfile> | null | undefined): ScoreBreakdown {
  const profileCompletionScore = calculateProfileCompletion(profile);
  const skillsScore = calculateSkillsScore(profile?.skills);
  const careerGoalScore = calculateCareerGoalScore(profile?.careerGoal, profile?.careerObjective);
  const targetJobScore = calculateTargetJobScore(profile?.targetJob);

  // Formula as mandated:
  // profileCompletionScore * 0.40 + skillsScore * 0.20 + careerGoalScore * 0.20 + targetJobScore * 0.20
  const rawScore =
    profileCompletionScore * 0.4 +
    skillsScore * 0.2 +
    careerGoalScore * 0.2 +
    targetJobScore * 0.2;

  const overallScore = Math.min(100, Math.max(0, Math.round(rawScore)));
  const { category, feedback } = getScoreCategory(overallScore);

  // Determine Today's Recommended Action
  let recommendedAction: ScoreBreakdown['recommendedAction'];

  if (profileCompletionScore < 60) {
    recommendedAction = {
      title: 'Complete your career profile',
      description: 'Fill in your education, location preferences, and work style to strengthen your profile.',
      actionField: 'onboarding',
    };
  } else if (skillsScore < 70) {
    recommendedAction = {
      title: 'Add more relevant skills',
      description: 'List at least 4 to 5 technical or interpersonal skills employers look for in your role.',
      actionField: 'skills',
    };
  } else if (careerGoalScore < 75) {
    recommendedAction = {
      title: 'Clarify your career goal',
      description: 'Provide a specific statement about what you want to achieve in your target role.',
      actionField: 'careerGoal',
    };
  } else if (targetJobScore < 100) {
    recommendedAction = {
      title: 'Select a concrete target role',
      description: 'Choose the exact job title you are targeting to align your preparation.',
      actionField: 'targetJob',
    };
  } else {
    recommendedAction = {
      title: 'Review and refine your profile',
      description: 'Your preparation foundation is strong. Keep your skills and goals updated as you grow.',
      actionField: 'careerGoal',
    };
  }

  return {
    overallScore,
    category,
    categoryFeedback: feedback,
    profileCompletionScore,
    skillsScore,
    careerGoalScore,
    targetJobScore,
    recommendedAction,
  };
}

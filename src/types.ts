export type UserRole = 'candidate' | 'employer' | 'admin';

export interface User {
  uid: string;
  name: string;
  email: string;
  phoneNumber?: string;
  role?: UserRole;
  companyId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CareerProfile {
  uid: string;
  careerGoal: string; // e.g. "I want to start my career as a sales executive."
  jobPreference: string; // "First Job" | "Better Job" | "Career Change" | "Internship" | "Part-time Work" | string;
  education: string; // "10th" | "12th" | "ITI" | "Diploma" | "Graduate" | "Post Graduate" | "Other" | string;
  experienceLevel: string; // "Fresher" | "Less than 1 year" | "1–3 years" | "3–5 years" | "5+ years" | string;
  targetJob: string; // "Sales Executive" | "Customer Service Executive" | ...
  preferredCity: string;
  preferredState: string;
  workPreference: string; // "Office" | "Remote" | "Hybrid" | "Any" | string;
  salaryMin: string; // e.g. "₹15,000 / month" or "Not decided"
  salaryMax: string; // e.g. "₹25,000 / month" or "Not decided"
  skills: string[];
  languages: string[];
  careerObjective: string;
  profileCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ScoreCategory =
  | 'Getting Started'
  | 'Developing'
  | 'Job Ready in Progress'
  | 'Strong Preparation'
  | 'Highly Prepared';

export interface ScoreBreakdown {
  overallScore: number; // 0 to 100
  category: ScoreCategory;
  categoryFeedback: string;
  profileCompletionScore: number; // 0 to 100
  skillsScore: number; // 0 to 100
  careerGoalScore: number; // 0 to 100
  targetJobScore: number; // 0 to 100
  recommendedAction: {
    title: string;
    description: string;
    actionField?: keyof CareerProfile | 'onboarding';
  };
}

export type AuthMode = 'signin' | 'signup' | 'forgot_password';

export type ActiveScreen = 'landing' | 'onboarding' | 'dashboard' | 'profile' | 'employer';

export interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  category: 'milestone' | 'readiness' | 'skills' | 'goal';
  iconName: string;
  isUnlocked: boolean;
  unlockedAt?: string;
  requirement: string;
  progressPercent: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
}

export interface DailyCheckIn {
  date: string; // YYYY-MM-DD
  goal: string;
  completed: boolean;
  streakCount: number;
  bestStreak?: number;
  completedHistory?: string[]; // array of YYYY-MM-DD
  lastCompletedDate?: string;
  category?: 'skills' | 'interview' | 'resume' | 'applications' | 'networking' | 'general';
  confidenceLevel?: 'fired_up' | 'focused' | 'steady' | 'calm';
  reflectionNote?: string;
  timeSpentMinutes?: number;
  hoursStudied?: number;
  applicationsSent?: number;
  questionsPracticed?: number;
  completedActivities?: string[];
  updatedAt: string;
}

export interface DayStreakItem {
  dayName: string;
  dateString: string;
  isToday: boolean;
  status: 'completed' | 'missed' | 'today-pending' | 'future';
}

export interface StreakStats {
  currentStreak: number;
  bestStreak: number;
  totalCompletedDays: number;
  weeklyDays: DayStreakItem[];
  nextMilestone: {
    target: number;
    title: string;
    daysRemaining: number;
  };
}

export interface MatchingSkill {
  name: string;
  strength: 'High' | 'Medium' | 'Developing' | string;
  relevance: string;
}

export interface MissingSkill {
  name: string;
  importance: 'Critical' | 'Important' | 'Nice to Have' | string;
  category: 'Technical' | 'Workplace' | 'Tool' | 'Domain' | string;
  whyNeeded: string;
  learningTip: string;
  estimatedTimeToLearn: string;
}

export interface IndustryBenchmark {
  inDemandTools: string[];
  typicalDailyTasks: string[];
  entryLevelExpectation: string;
}

export interface SkillsGapAnalysis {
  targetRole: string;
  overallMatchScore: number;
  matchingSkills: MatchingSkill[];
  missingSkills: MissingSkill[];
  industryBenchmark: IndustryBenchmark;
  recommendationSummary: string;
  analyzedAt?: string;
}

export interface InterviewQuestion {
  id: number | string;
  questionText: string;
  questionType: 'introductory' | 'technical' | 'situational' | 'behavioral' | string;
  contextTip?: string;
  idealAnswerKeyPoints?: string[];
  difficulty?: string;
  expectedKeywords?: string[];
  interviewerIntent?: string;
  suggestedAnswerFramework?: string;
}

export interface InterviewAnswerEvaluation {
  score: number;
  rating?: 'Excellent' | 'Good' | 'Needs Work' | string;
  feedback: string;
  strengths: string[];
  improvements: string[];
  sampleBestAnswer?: string;
  idealAnswerSample?: string;
  followUpPrompt?: string;
}

export interface AnsweredInterviewQuestion {
  question: InterviewQuestion;
  candidateAnswer: string;
  evaluation: InterviewAnswerEvaluation;
  answeredAt: string;
}

export interface MockInterviewResult {
  id: string;
  roleTitle: string;
  totalQuestions: number;
  overallScore: number;
  grade: 'Interview Ready (A+)' | 'Strong Candidate (A)' | 'Good Foundation (B)' | 'Needs Practice (C)';
  answers: AnsweredInterviewQuestion[];
  completedAt: string;
}

export interface AICareerInsight {
  headline: string;
  category: 'Interview Strategy' | 'ATS & Resume' | 'Micro-Skill Upgrade' | 'Workplace Readiness' | 'Hiring Insight' | string;
  actionableTip: string;
  quickAction: string;
  impactTag: string;
  generatedDate?: string;
}

export interface LeaderboardEntry {
  id: string;
  rank: number;
  name: string;
  avatarColor: string;
  targetRole: string;
  collegeOrLocation: string;
  readinessScore: number;
  streakDays: number;
  badgesCount: number;
  isCurrentUser: boolean;
  rankChange: number; // positive for gained ranks, negative for lost, 0 for same
  tier: 'Elite (90+)' | 'Champion (80+)' | 'Pro (70+)' | 'Rising Star (<70)';
}

export type ResourceCategory =
  | 'All Resources'
  | 'Study Materials'
  | 'Courses & Bootcamps'
  | 'Certification Guides'
  | 'Interview Kits';

export interface ResourceItem {
  id: string;
  title: string;
  description: string;
  category: 'Study Materials' | 'Courses & Bootcamps' | 'Certification Guides' | 'Interview Kits';
  pricing: 'Free' | 'Paid' | 'Free with Audit' | 'Official Certification';
  provider: string;
  url: string;
  estimatedDuration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';
  tags: string[];
  targetRoles: string[]; // matches targetJob or ['all']
  rating?: number; // e.g. 4.8
  learnerCount?: string; // e.g. '120k+ learners'
  isFeatured?: boolean;
}

export type ToastType = 'success' | 'celebration' | 'info' | 'warning' | 'error';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  streakCount?: number;
  badge?: string;
  action?: ToastAction;
  duration?: number; // duration in ms, 0 for persistent
}

// AI Resume Analyzer Types
export interface SectionReview {
  sectionName: string;
  status: 'pass' | 'warning' | 'needs_work';
  feedback: string;
  suggestion: string;
}

export interface BulletRewrite {
  originalBullet: string;
  improvedBullet: string;
  reason: string;
  impactBoost: string;
}

export interface KeywordAnalysis {
  matchedKeywords: string[];
  missingHighPriorityKeywords: string[];
  recommendedPlacementTips: string[];
}

export interface ATSHygieneItem {
  checkItem: string;
  passed: boolean;
  tip: string;
}

export interface ResumeAnalysisResult {
  targetRole: string;
  atsScore: number; // 0 - 100
  scoreGrade: 'Needs Major Work' | 'Fair' | 'Competitive' | 'Top Tier';
  roleMatchPercentage: number;
  executiveSummary: string;
  strengths: string[];
  criticalGaps: string[];
  sectionReviews: SectionReview[];
  keywordAnalysis: KeywordAnalysis;
  bulletRewrites: BulletRewrite[];
  atsHygieneCheck: ATSHygieneItem[];
  actionPlan: string[];
  analyzedAt: string;
}

export interface SavedResumeAudit {
  id: string;
  userId: string;
  fileName?: string;
  targetRole: string;
  atsScore: number;
  result: ResumeAnalysisResult;
  timestamp: string;
}

// Salary Benchmark Types
export interface SalaryPercentileTier {
  tier: string;
  amount: string;
  description: string;
}

export interface SalaryBooster {
  skillOrFactor: string;
  potentialIncrease: string;
  tip: string;
}

export interface LocationSalaryComparison {
  city: string;
  diffPercentage: string;
  medianMonthly: string;
}

export interface SalaryBenchmarkResult {
  targetJob: string;
  location: string;
  experienceLevel: string;
  currency: string;
  monthlyRange: {
    min: number;
    median: number;
    max: number;
    formattedMin: string;
    formattedMedian: string;
    formattedMax: string;
  };
  annualLpaRange: {
    min: number;
    median: number;
    max: number;
    formatted: string;
  };
  percentileTiers: SalaryPercentileTier[];
  topSalaryBoosters: SalaryBooster[];
  locationComparison: LocationSalaryComparison[];
  marketDemand: {
    level: 'Moderate' | 'High' | 'Very High';
    hiringTrend: string;
  };
  negotiationTips: string[];
  estimatedAt: string;
}

// Push & Email Reminder Nudge Types
export interface ReminderSettings {
  enabled: boolean;
  eveningReminderTime: string; // e.g. "19:30" or "20:00"
  channels: {
    browserPush: boolean;
    email: boolean;
    inAppToast: boolean;
  };
  emailAddress: string;
  weekendReminders: boolean;
  nudgeTone: 'friendly' | 'streak_focused' | 'career_coach';
  lastNotifiedDate?: string;
}

export interface ReminderDispatchRecord {
  id: string;
  timestamp: string;
  channel: 'browser_push' | 'email' | 'in_app';
  title: string;
  message: string;
  status: 'delivered' | 'simulated' | 'failed';
  streakAtTime: number;
}

// Career Path Roadmap Types
export interface RoadmapTask {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  category: 'learning' | 'project' | 'networking' | 'interview' | 'certification';
  estimatedHours?: number;
}

export interface RoadmapMilestone {
  id: string;
  stepNumber: number;
  phase: string; // e.g. "Phase 1: Foundations"
  title?: string;
  timeFrame: string; // e.g. "Weeks 1–4"
  description: string;
  keyCompetencies: string[];
  tasks: RoadmapTask[];
  capstoneProject: {
    title: string;
    brief: string;
    deliverables: string[];
  };
  recommendedResources: string[];
  status: 'completed' | 'in_progress' | 'upcoming';
  isLocked?: boolean;
}

export interface CareerPathRoadmap {
  targetRole: string;
  candidateTier: string;
  currentEducation: string;
  estimatedTotalMonths: string;
  overallProgressPercent: number;
  summaryNote: string;
  salaryTrajectory: {
    entryLevel: string;
    oneYear: string;
    threeYears: string;
  };
  milestones: RoadmapMilestone[];
  generatedAt: string;
}

// Interview Prep Tips Types
export type InterviewRoundType = 'behavioral' | 'technical' | 'hr' | 'salary' | 'reverse_questions' | 'dos_donts';

export interface InterviewTipItem {
  id: string;
  roundType: InterviewRoundType;
  title: string;
  categoryTag: string; // e.g. "STAR Method", "Problem Solving", "Salary Anchor", "Elevator Pitch"
  summary: string;
  recommendedFramework?: string; // e.g. "Situation -> Task -> Action -> Result"
  sampleQuestion?: string;
  sampleAnswerTemplate?: string;
  proTips: string[];
  commonMistakesToAvoid?: string[];
  isBookmarked?: boolean;
}

export interface RoleInterviewPrepGuide {
  targetRole: string;
  roundTips: InterviewTipItem[];
  highImpactChecklist: string[];
  elevatorPitchFormula: {
    hook: string;
    proofPoints: string;
    targetAlignment: string;
  };
  questionsToAskInterviewer: {
    category: string;
    question: string;
    whyItWorks: string;
  }[];
  generatedAt?: string;
}

// ==========================================
// EMPLOYER, JOB & SKILL MATCH SCHEMA TYPES
// ==========================================

export interface CompanyProfile {
  id: string;
  name: string;
  legalName?: string;
  slug: string;
  logoUrl?: string;
  website: string;
  industry: string;
  companySize: '1-10' | '11-50' | '51-200' | '201-500' | '500+';
  headquarters: {
    city: string;
    state?: string;
    country: string;
  };
  about: string;
  verifiedBadge: boolean;
  ownerUserId: string;
  recruiterUserIds: string[];
  activeJobCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface JobSkillRequirement {
  name: string;
  normalizedKey: string;
  isMandatory: boolean;
  minYearsRequired?: number;
}

export type JobExperienceLevel = 'fresher' | 'junior' | 'mid_level' | 'senior' | 'lead';
export type JobWorkMode = 'onsite' | 'hybrid' | 'remote';
export type JobPostingStatus = 'draft' | 'active' | 'paused' | 'closed';

export interface JobPosting {
  id: string;
  companyId: string;
  postedByUserId: string;
  companySummary: {
    name: string;
    logoUrl?: string;
    city: string;
    verified: boolean;
  };
  title: string;
  description: string;
  department: string;
  experienceLevel: JobExperienceLevel;
  minYearsExperience: number;
  maxYearsExperience?: number;
  workMode: JobWorkMode;
  location: {
    city: string;
    state?: string;
    country: string;
  };
  compensation: {
    currency: string;
    minSalary: number;
    maxSalary: number;
    isDisclosed: boolean;
  };
  skills: JobSkillRequirement[];
  mandatorySkillKeys: string[];
  allNormalizedSkillKeys: string[];
  status: JobPostingStatus;
  matchThresholdPercentage: number;
  applicantCount: number;
  matchesEvaluatedCount?: number;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export type MatchStage = 'discovered' | 'applied' | 'shortlisted' | 'interviewing' | 'rejected' | 'hired';
export type MatchNotificationStatus = 'pending' | 'notified_candidate' | 'notified_employer' | 'notified_both' | 'failed';

export interface ApplicantCandidateSnapshot {
  id: string;
  fullName: string;
  headline: string;
  email: string;
  phoneNumber: string;
  currentCity: string;
  preferredCities: string[];
  workPreference: string;
  experienceLevel: string;
  yearsOfExperience: number;
  expectedSalary: string;
  skills: {
    name: string;
    normalizedKey: string;
    proficiency: string;
    yearsUsed: number;
    isPrimary: boolean;
  }[];
  education: string;
  resumeUrl?: string;
}

export interface JobApplicantMatch {
  id: string; // `${candidateId}_${jobId}`
  candidateId: string;
  jobId: string;
  companyId: string;
  candidate: ApplicantCandidateSnapshot;
  overallScore: number; // 0 - 100
  breakdown: {
    skillScore: number;      // 60% weight
    experienceScore: number; // 25% weight
    locationScore: number;   // 15% weight
  };
  matchedMandatorySkills: string[];
  missingMandatorySkills: string[];
  matchedOptionalSkills: string[];
  stage: MatchStage;
  notification: {
    status: MatchNotificationStatus;
    candidateNotifiedAt?: string;
    candidateMessageSid?: string;
    employerNotifiedAt?: string;
    employerMessageSid?: string;
  };
  appliedAt?: string;
  createdAt: string;
  updatedAt: string;
}



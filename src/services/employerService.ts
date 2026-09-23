import {
  CompanyProfile,
  JobPosting,
  JobApplicantMatch,
  JobPostingStatus,
  MatchStage,
  ApplicantCandidateSnapshot,
} from '../types';
import {
  saveJobToSupabase,
  saveMatchToSupabase,
} from './supabaseService';
import {
  triggerSkillMatchNotification,
  batchNotifyMatchingCandidatesForJob,
} from './whatsappService';

const COMPANY_STORAGE_KEY = 'jobready_employer_company';
const JOBS_STORAGE_KEY = 'jobready_employer_jobs';
const MATCHES_STORAGE_KEY = 'jobready_employer_matches';

// Default Seed Company Profile
const DEFAULT_COMPANY: CompanyProfile = {
  id: 'comp_alpha_tech',
  name: 'NexusFlow Technologies',
  legalName: 'NexusFlow Software India Pvt. Ltd.',
  slug: 'nexusflow-technologies',
  logoUrl: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=120&auto=format&fit=crop&q=80',
  website: 'https://nexusflow.io',
  industry: 'FinTech & Cloud SaaS',
  companySize: '51-200',
  headquarters: {
    city: 'Bangalore',
    state: 'Karnataka',
    country: 'India',
  },
  about: 'Building AI-driven workflow engines and automated cloud-native fintech infrastructure.',
  verifiedBadge: true,
  ownerUserId: 'usr_emp_demo',
  recruiterUserIds: ['usr_emp_demo'],
  activeJobCount: 3,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Seed Candidate Pool for Realistic Multi-Candidate Matching
const SEED_CANDIDATE_POOL: ApplicantCandidateSnapshot[] = [
  {
    id: 'cand_rahul_01',
    fullName: 'Rahul Sharma',
    headline: 'Frontend Developer | React, TypeScript & Tailwind CSS',
    email: 'rahul.sharma@example.com',
    phoneNumber: '+919876543210',
    currentCity: 'Bangalore',
    preferredCities: ['Bangalore', 'Pune', 'Remote'],
    workPreference: 'Hybrid',
    experienceLevel: 'Fresher (1 yr)',
    yearsOfExperience: 1.2,
    expectedSalary: '₹4.5 - 6.0 LPA',
    education: 'B.Tech in Computer Science (2025)',
    skills: [
      { name: 'React', normalizedKey: 'react', proficiency: 'advanced', yearsUsed: 1.5, isPrimary: true },
      { name: 'TypeScript', normalizedKey: 'typescript', proficiency: 'intermediate', yearsUsed: 1.0, isPrimary: true },
      { name: 'JavaScript', normalizedKey: 'javascript', proficiency: 'advanced', yearsUsed: 2.0, isPrimary: true },
      { name: 'Tailwind CSS', normalizedKey: 'tailwindcss', proficiency: 'advanced', yearsUsed: 1.5, isPrimary: false },
      { name: 'Git / GitHub', normalizedKey: 'git', proficiency: 'intermediate', yearsUsed: 1.5, isPrimary: false },
      { name: 'HTML/CSS', normalizedKey: 'htmlcss', proficiency: 'expert', yearsUsed: 2.5, isPrimary: false },
    ],
  },
  {
    id: 'cand_priya_02',
    fullName: 'Priya Patel',
    headline: 'Senior Full Stack Engineer | React, Node.js & AWS',
    email: 'priya.patel@example.com',
    phoneNumber: '+919811223344',
    currentCity: 'Bangalore',
    preferredCities: ['Bangalore', 'Remote'],
    workPreference: 'Remote',
    experienceLevel: 'Senior (4.5 yrs)',
    yearsOfExperience: 4.5,
    expectedSalary: '₹16 - 20 LPA',
    education: 'B.E. Information Technology (2021)',
    skills: [
      { name: 'React', normalizedKey: 'react', proficiency: 'expert', yearsUsed: 4.5, isPrimary: true },
      { name: 'TypeScript', normalizedKey: 'typescript', proficiency: 'expert', yearsUsed: 4.0, isPrimary: true },
      { name: 'Node.js', normalizedKey: 'nodejs', proficiency: 'advanced', yearsUsed: 3.5, isPrimary: true },
      { name: 'AWS Cloud', normalizedKey: 'aws', proficiency: 'intermediate', yearsUsed: 2.0, isPrimary: false },
      { name: 'PostgreSQL', normalizedKey: 'postgresql', proficiency: 'advanced', yearsUsed: 3.0, isPrimary: false },
      { name: 'Docker', normalizedKey: 'docker', proficiency: 'intermediate', yearsUsed: 2.0, isPrimary: false },
    ],
  },
  {
    id: 'cand_amit_03',
    fullName: 'Amit Verma',
    headline: 'Backend Node.js & Microservices Specialist',
    email: 'amit.verma@example.com',
    phoneNumber: '+919833445566',
    currentCity: 'Pune',
    preferredCities: ['Pune', 'Bangalore', 'Hyderabad'],
    workPreference: 'Hybrid',
    experienceLevel: 'Mid-Level (3 yrs)',
    yearsOfExperience: 3.0,
    expectedSalary: '₹10 - 13 LPA',
    education: 'MCA Masters in Computer Applications',
    skills: [
      { name: 'Node.js', normalizedKey: 'nodejs', proficiency: 'expert', yearsUsed: 3.0, isPrimary: true },
      { name: 'Express.js', normalizedKey: 'express', proficiency: 'expert', yearsUsed: 3.0, isPrimary: true },
      { name: 'TypeScript', normalizedKey: 'typescript', proficiency: 'intermediate', yearsUsed: 1.5, isPrimary: true },
      { name: 'MongoDB / Firestore', normalizedKey: 'mongodb', proficiency: 'advanced', yearsUsed: 3.0, isPrimary: false },
      { name: 'Redis', normalizedKey: 'redis', proficiency: 'intermediate', yearsUsed: 1.5, isPrimary: false },
      { name: 'REST APIs', normalizedKey: 'restapi', proficiency: 'expert', yearsUsed: 3.0, isPrimary: true },
    ],
  },
  {
    id: 'cand_sneha_04',
    fullName: 'Sneha Iyer',
    headline: 'Product Designer & UI Engineer (Figma + React)',
    email: 'sneha.iyer@example.com',
    phoneNumber: '+919877665544',
    currentCity: 'Mumbai',
    preferredCities: ['Mumbai', 'Bangalore', 'Remote'],
    workPreference: 'Remote',
    experienceLevel: 'Mid-Level (2.5 yrs)',
    yearsOfExperience: 2.5,
    expectedSalary: '₹8 - 11 LPA',
    education: 'B.Des in Interaction Design (2023)',
    skills: [
      { name: 'Figma UI/UX', normalizedKey: 'figma', proficiency: 'expert', yearsUsed: 3.0, isPrimary: true },
      { name: 'Design Systems', normalizedKey: 'designsystems', proficiency: 'expert', yearsUsed: 2.5, isPrimary: true },
      { name: 'React', normalizedKey: 'react', proficiency: 'intermediate', yearsUsed: 1.5, isPrimary: false },
      { name: 'Tailwind CSS', normalizedKey: 'tailwindcss', proficiency: 'advanced', yearsUsed: 2.0, isPrimary: true },
      { name: 'User Research', normalizedKey: 'userresearch', proficiency: 'advanced', yearsUsed: 2.5, isPrimary: false },
    ],
  },
  {
    id: 'cand_vikram_05',
    fullName: 'Vikram Nair',
    headline: 'Junior Data Analyst & Python Developer',
    email: 'vikram.nair@example.com',
    phoneNumber: '+919855667788',
    currentCity: 'Hyderabad',
    preferredCities: ['Hyderabad', 'Bangalore'],
    workPreference: 'Onsite',
    experienceLevel: 'Junior (1.5 yrs)',
    yearsOfExperience: 1.5,
    expectedSalary: '₹5 - 7 LPA',
    education: 'B.Sc in Statistics & Data Science',
    skills: [
      { name: 'Python', normalizedKey: 'python', proficiency: 'advanced', yearsUsed: 2.0, isPrimary: true },
      { name: 'SQL & Database', normalizedKey: 'sql', proficiency: 'advanced', yearsUsed: 2.0, isPrimary: true },
      { name: 'Tableau / PowerBI', normalizedKey: 'powerbi', proficiency: 'intermediate', yearsUsed: 1.0, isPrimary: false },
      { name: 'Pandas & NumPy', normalizedKey: 'pandas', proficiency: 'advanced', yearsUsed: 1.5, isPrimary: true },
      { name: 'Excel Advanced', normalizedKey: 'excel', proficiency: 'expert', yearsUsed: 3.0, isPrimary: false },
    ],
  },
];

// Initial Seed Jobs
const SEED_JOBS: JobPosting[] = [
  {
    id: 'job_react_dev_101',
    companyId: 'comp_alpha_tech',
    postedByUserId: 'usr_emp_demo',
    companySummary: {
      name: 'NexusFlow Technologies',
      logoUrl: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=120&auto=format&fit=crop&q=80',
      city: 'Bangalore',
      verified: true,
    },
    title: 'Frontend React & TypeScript Developer',
    description: 'Looking for a skilled frontend engineer to build interactive dashboards, optimize performance, and scale our component design system.',
    department: 'Engineering',
    experienceLevel: 'junior',
    minYearsExperience: 1.0,
    maxYearsExperience: 3.0,
    workMode: 'hybrid',
    location: {
      city: 'Bangalore',
      state: 'Karnataka',
      country: 'India',
    },
    compensation: {
      currency: 'INR',
      minSalary: 600000,
      maxSalary: 1000000,
      isDisclosed: true,
    },
    skills: [
      { name: 'React', normalizedKey: 'react', isMandatory: true, minYearsRequired: 1.0 },
      { name: 'TypeScript', normalizedKey: 'typescript', isMandatory: true, minYearsRequired: 1.0 },
      { name: 'Tailwind CSS', normalizedKey: 'tailwindcss', isMandatory: false, minYearsRequired: 0.5 },
      { name: 'Git / GitHub', normalizedKey: 'git', isMandatory: false, minYearsRequired: 0.5 },
    ],
    mandatorySkillKeys: ['react', 'typescript'],
    allNormalizedSkillKeys: ['react', 'typescript', 'tailwindcss', 'git'],
    status: 'active',
    matchThresholdPercentage: 70.0,
    applicantCount: 3,
    matchesEvaluatedCount: 5,
    expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'job_backend_node_102',
    companyId: 'comp_alpha_tech',
    postedByUserId: 'usr_emp_demo',
    companySummary: {
      name: 'NexusFlow Technologies',
      logoUrl: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=120&auto=format&fit=crop&q=80',
      city: 'Bangalore',
      verified: true,
    },
    title: 'Senior Node.js & Cloud Backend Architect',
    description: 'Lead backend microservices architecture, REST API scaling, database optimization, and cloud deployments.',
    department: 'Core Platform',
    experienceLevel: 'senior',
    minYearsExperience: 3.0,
    maxYearsExperience: 6.0,
    workMode: 'remote',
    location: {
      city: 'Bangalore',
      state: 'Karnataka',
      country: 'India',
    },
    compensation: {
      currency: 'INR',
      minSalary: 1400000,
      maxSalary: 2200000,
      isDisclosed: true,
    },
    skills: [
      { name: 'Node.js', normalizedKey: 'nodejs', isMandatory: true, minYearsRequired: 3.0 },
      { name: 'TypeScript', normalizedKey: 'typescript', isMandatory: true, minYearsRequired: 2.0 },
      { name: 'PostgreSQL', normalizedKey: 'postgresql', isMandatory: false, minYearsRequired: 2.0 },
      { name: 'AWS Cloud', normalizedKey: 'aws', isMandatory: false, minYearsRequired: 1.5 },
    ],
    mandatorySkillKeys: ['nodejs', 'typescript'],
    allNormalizedSkillKeys: ['nodejs', 'typescript', 'postgresql', 'aws'],
    status: 'active',
    matchThresholdPercentage: 75.0,
    applicantCount: 2,
    matchesEvaluatedCount: 5,
    expiresAt: new Date(Date.now() + 45 * 86400000).toISOString(),
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

/**
 * Matching Algorithm Engine matching candidate snapshots against a job
 */
function computeCandidateJobMatch(
  candidate: ApplicantCandidateSnapshot,
  job: JobPosting
): JobApplicantMatch {
  const candidateSkillKeys = new Set(candidate.skills.map((s) => s.normalizedKey.toLowerCase()));

  // 1. Mandatory & Optional Skill Overlap
  const mandatoryMatches: string[] = [];
  const mandatoryMissing: string[] = [];
  const optionalMatches: string[] = [];

  job.skills.forEach((req) => {
    const key = req.normalizedKey.toLowerCase();
    if (candidateSkillKeys.has(key)) {
      if (req.isMandatory) {
        mandatoryMatches.push(key);
      } else {
        optionalMatches.push(key);
      }
    } else {
      if (req.isMandatory) {
        mandatoryMissing.push(key);
      }
    }
  });

  const mandatoryScore =
    job.mandatorySkillKeys.length > 0
      ? (mandatoryMatches.length / job.mandatorySkillKeys.length) * 100
      : 100;

  const optionalReqs = job.skills.filter((s) => !s.isMandatory);
  const optionalScore =
    optionalReqs.length > 0 ? (optionalMatches.length / optionalReqs.length) * 100 : 100;

  const skillScore = mandatoryScore * 0.8 + optionalScore * 0.2;

  // 2. Experience Score
  let experienceScore = 100;
  if (candidate.yearsOfExperience < job.minYearsExperience) {
    const gap = job.minYearsExperience - candidate.yearsOfExperience;
    experienceScore = Math.max(0, 100 - gap * 35);
  }

  // 3. Location / Work Mode Score
  let locationScore = 50;
  const isRemote = job.workMode === 'remote';
  const cityMatch =
    candidate.currentCity.toLowerCase() === job.location.city.toLowerCase() ||
    candidate.preferredCities.some((c) => c.toLowerCase() === job.location.city.toLowerCase());

  if (isRemote || cityMatch) {
    locationScore = 100;
  } else if (job.workMode === 'hybrid') {
    locationScore = 50;
  } else {
    locationScore = 25;
  }

  // Composite Overall Score (Skills 60%, Exp 25%, Location 15%)
  const overallScore = Math.round(skillScore * 0.6 + experienceScore * 0.25 + locationScore * 0.15);

  const isHighFit = overallScore >= job.matchThresholdPercentage;

  return {
    id: `${candidate.id}_${job.id}`,
    candidateId: candidate.id,
    jobId: job.id,
    companyId: job.companyId,
    candidate,
    overallScore,
    breakdown: {
      skillScore: Math.round(skillScore),
      experienceScore: Math.round(experienceScore),
      locationScore: Math.round(locationScore),
    },
    matchedMandatorySkills: mandatoryMatches,
    missingMandatorySkills: mandatoryMissing,
    matchedOptionalSkills: optionalMatches,
    stage: overallScore >= 80 ? 'shortlisted' : 'discovered',
    notification: {
      status: isHighFit ? 'notified_both' : 'pending',
      candidateNotifiedAt: isHighFit ? new Date(Date.now() - 3600000).toISOString() : undefined,
      candidateMessageSid: isHighFit ? `WA_MSG_${Math.random().toString(36).substring(2, 9).toUpperCase()}` : undefined,
      employerNotifiedAt: isHighFit ? new Date(Date.now() - 3600000).toISOString() : undefined,
      employerMessageSid: isHighFit ? `WA_EMP_${Math.random().toString(36).substring(2, 9).toUpperCase()}` : undefined,
    },
    appliedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Service Layer Functions
 */
export const getEmployerCompany = (): CompanyProfile => {
  try {
    const saved = localStorage.getItem(COMPANY_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (err) {
    console.error('Failed to load company profile:', err);
  }
  localStorage.setItem(COMPANY_STORAGE_KEY, JSON.stringify(DEFAULT_COMPANY));
  return DEFAULT_COMPANY;
};

export const updateEmployerCompany = (updates: Partial<CompanyProfile>): CompanyProfile => {
  const current = getEmployerCompany();
  const updated: CompanyProfile = {
    ...current,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(COMPANY_STORAGE_KEY, JSON.stringify(updated));
  return updated;
};

export const getEmployerJobs = (): JobPosting[] => {
  try {
    const saved = localStorage.getItem(JOBS_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (err) {
    console.error('Failed to load jobs:', err);
  }
  localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(SEED_JOBS));
  return SEED_JOBS;
};

export const createEmployerJob = (
  jobData: Omit<JobPosting, 'id' | 'createdAt' | 'updatedAt' | 'applicantCount' | 'matchesEvaluatedCount'>
): { job: JobPosting; matches: JobApplicantMatch[] } => {
  const jobs = getEmployerJobs();
  const newJobId = `job_${Date.now()}`;
  
  const newJob: JobPosting = {
    ...jobData,
    id: newJobId,
    applicantCount: 0,
    matchesEvaluatedCount: SEED_CANDIDATE_POOL.length,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const updatedJobs = [newJob, ...jobs];
  localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(updatedJobs));

  // Run matching engine against all seed candidates
  const newMatches: JobApplicantMatch[] = SEED_CANDIDATE_POOL.map((candidate) =>
    computeCandidateJobMatch(candidate, newJob)
  );

  // Update applicant count
  newJob.applicantCount = newMatches.filter((m) => m.overallScore >= newJob.matchThresholdPercentage).length;
  localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(updatedJobs));

  // Store matches in cache
  const existingMatches = getAllStoredMatches();
  const combinedMatches = [...newMatches, ...existingMatches];
  localStorage.setItem(MATCHES_STORAGE_KEY, JSON.stringify(combinedMatches));

  // Asynchronously synchronize to Supabase Cloud Database & trigger WhatsApp alerts
  saveJobToSupabase(newJob).catch((err) => console.warn('Supabase job background sync:', err));
  newMatches.forEach((m) => {
    saveMatchToSupabase(m).catch((err) => console.warn('Supabase match background sync:', err));
  });

  // Automatically trigger WhatsApp Business API alerts for qualifying candidates (>= threshold)
  batchNotifyMatchingCandidatesForJob(newJob, newMatches, newJob.matchThresholdPercentage).catch((err) =>
    console.warn('WhatsApp match broadcast note:', err)
  );

  return { job: newJob, matches: newMatches };
};

export const updateJobStatus = (jobId: string, status: JobPostingStatus): JobPosting | null => {
  const jobs = getEmployerJobs();
  const idx = jobs.findIndex((j) => j.id === jobId);
  if (idx === -1) return null;

  jobs[idx] = {
    ...jobs[idx],
    status,
    updatedAt: new Date().toISOString(),
  };

  localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(jobs));
  saveJobToSupabase(jobs[idx]).catch((err) => console.warn('Supabase job status sync:', err));
  return jobs[idx];
};

function getAllStoredMatches(): JobApplicantMatch[] {
  try {
    const saved = localStorage.getItem(MATCHES_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (err) {
    console.error('Failed to load matches:', err);
  }

  // Pre-generate matches for all seed jobs
  const initialMatches: JobApplicantMatch[] = [];
  SEED_JOBS.forEach((job) => {
    SEED_CANDIDATE_POOL.forEach((candidate) => {
      initialMatches.push(computeCandidateJobMatch(candidate, job));
    });
  });

  localStorage.setItem(MATCHES_STORAGE_KEY, JSON.stringify(initialMatches));
  return initialMatches;
}

export const getJobApplicants = (jobId?: string): JobApplicantMatch[] => {
  const all = getAllStoredMatches();
  if (!jobId || jobId === 'all') {
    return all.sort((a, b) => b.overallScore - a.overallScore);
  }
  return all
    .filter((m) => m.jobId === jobId)
    .sort((a, b) => b.overallScore - a.overallScore);
};

export const updateApplicantStage = (matchId: string, stage: MatchStage): JobApplicantMatch | null => {
  const all = getAllStoredMatches();
  const match = all.find((m) => m.id === matchId);
  if (!match) return null;

  match.stage = stage;
  match.updatedAt = new Date().toISOString();

  localStorage.setItem(MATCHES_STORAGE_KEY, JSON.stringify(all));
  saveMatchToSupabase(match).catch((err) => console.warn('Supabase match stage sync:', err));
  return match;
};

export const sendWhatsAppCandidateAlert = async (
  matchId: string
): Promise<{ success: boolean; messageSid: string; timestamp: string }> => {
  const all = getAllStoredMatches();
  const match = all.find((m) => m.id === matchId);
  const jobs = getEmployerJobs();
  const job = jobs.find((j) => j.id === match?.jobId) || SEED_JOBS[0];

  if (match) {
    const waResult = await triggerSkillMatchNotification(match, job);
    match.notification = {
      ...match.notification,
      status: 'notified_both',
      candidateNotifiedAt: waResult.timestamp,
      candidateMessageSid: waResult.messageId,
    };
    match.updatedAt = waResult.timestamp;
    localStorage.setItem(MATCHES_STORAGE_KEY, JSON.stringify(all));
    saveMatchToSupabase(match).catch((err) => console.warn('Supabase WhatsApp status sync:', err));

    return {
      success: waResult.success,
      messageSid: waResult.messageId,
      timestamp: waResult.timestamp,
    };
  }

  const timestamp = new Date().toISOString();
  const messageSid = `wamid.MANUAL_${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
  return {
    success: true,
    messageSid,
    timestamp,
  };
};

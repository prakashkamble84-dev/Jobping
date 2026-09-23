import { supabase, getSupabaseClient } from './supabaseClient';
import {
  JobPosting,
  JobApplicantMatch,
  ApplicantCandidateSnapshot,
  MatchStage,
  JobPostingStatus,
  JobSkillRequirement,
} from '../types';

export interface CandidateRecord {
  id: string;
  fullName: string;
  headline?: string;
  email: string;
  phoneNumber?: string;
  currentCity?: string;
  preferredCities?: string[];
  workPreference?: string;
  experienceLevel?: string;
  yearsOfExperience?: number;
  expectedSalary?: string;
  education?: string;
  skills?: string[] | { name: string; normalizedKey: string; proficiency?: string; yearsUsed?: number; isPrimary?: boolean }[];
  languages?: string[];
  resumeUrl?: string;
  resumeText?: string;
  targetJob?: string;
  profileCompleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CandidateQueryFilters {
  search?: string;
  city?: string;
  minExp?: number;
  maxExp?: number;
  skills?: string[];
  limit?: number;
  offset?: number;
}

export interface JobQueryFilters {
  companyId?: string;
  status?: JobPostingStatus | 'all';
  department?: string;
  search?: string;
  workMode?: string;
  city?: string;
  limit?: number;
  offset?: number;
}

// ==========================================
// 1. CANDIDATES CRUD OPERATIONS
// ==========================================

/**
 * Insert or upsert a new Candidate record in Supabase
 */
export async function createCandidate(candidate: Partial<CandidateRecord>): Promise<CandidateRecord | null> {
  const client = getSupabaseClient();
  const id = candidate.id || `cand_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const now = new Date().toISOString();

  // Primary payload formatted for profiles/candidates table
  const payload = {
    id,
    full_name: candidate.fullName || 'Candidate',
    headline: candidate.headline || '',
    email: candidate.email || '',
    phone_number: candidate.phoneNumber || '',
    current_city: candidate.currentCity || '',
    preferred_cities: candidate.preferredCities || [],
    work_preference: candidate.workPreference || 'Hybrid',
    experience_level: candidate.experienceLevel || 'Fresher',
    years_of_experience: Number(candidate.yearsOfExperience) || 0,
    expected_salary: candidate.expectedSalary || '',
    education: candidate.education || '',
    skills: Array.isArray(candidate.skills)
      ? candidate.skills.map((s) => (typeof s === 'string' ? s : s.name))
      : [],
    languages: candidate.languages || [],
    resume_url: candidate.resumeUrl || null,
    resume_text: candidate.resumeText || '',
    target_job: candidate.targetJob || '',
    profile_completed: Boolean(candidate.profileCompleted),
    created_at: candidate.createdAt || now,
    updated_at: now,
  };

  try {
    // Attempt insert into candidates table first, then fallback to profiles if needed
    let { data, error } = await client
      .from('candidates')
      .upsert(payload, { onConflict: 'id' })
      .select()
      .maybeSingle();

    if (error && (error.code === '42P01' || error.message.includes('relation "candidates" does not exist'))) {
      // Fallback to profiles table
      const profilePayload = {
        id,
        full_name: candidate.fullName || 'Candidate',
        email: candidate.email || '',
        phone_number: candidate.phoneNumber || '',
        target_job: candidate.targetJob || candidate.headline || '',
        education: candidate.education || '',
        experience_level: candidate.experienceLevel || 'Fresher',
        preferred_city: candidate.currentCity || '',
        work_preference: candidate.workPreference || 'Hybrid',
        skills: payload.skills,
        languages: candidate.languages || [],
        resume_url: candidate.resumeUrl || null,
        resume_text: candidate.resumeText || '',
        profile_completed: Boolean(candidate.profileCompleted),
        created_at: candidate.createdAt || now,
        updated_at: now,
      };

      const profileRes = await client
        .from('profiles')
        .upsert(profilePayload, { onConflict: 'id' })
        .select()
        .maybeSingle();

      if (profileRes.error) {
        console.warn('Error saving profile candidate:', profileRes.error.message);
        return null;
      }
      data = profileRes.data;
    } else if (error) {
      console.warn('Error creating candidate:', error.message);
      return null;
    }

    return mapDbRowToCandidate(data || payload);
  } catch (err) {
    console.error('Failed to create candidate:', err);
    return null;
  }
}

/**
 * Fetch a single Candidate by ID
 */
export async function getCandidateById(id: string): Promise<CandidateRecord | null> {
  const client = getSupabaseClient();
  try {
    // Try candidates table
    const { data: candData, error: candError } = await client
      .from('candidates')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (!candError && candData) {
      return mapDbRowToCandidate(candData);
    }

    // Try profiles table
    const { data: profData, error: profError } = await client
      .from('profiles')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (!profError && profData) {
      return mapDbRowToCandidate(profData);
    }

    return null;
  } catch (err) {
    console.warn('Error getting candidate by id:', err);
    return null;
  }
}

/**
 * List all Candidates with optional filters
 */
export async function getAllCandidates(filters: CandidateQueryFilters = {}): Promise<CandidateRecord[]> {
  const client = getSupabaseClient();
  try {
    let query = client.from('candidates').select('*');

    if (filters.city) {
      query = query.ilike('current_city', `%${filters.city}%`);
    }
    if (filters.minExp !== undefined) {
      query = query.gte('years_of_experience', filters.minExp);
    }
    if (filters.maxExp !== undefined) {
      query = query.lte('years_of_experience', filters.maxExp);
    }
    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error && (error.code === '42P01' || error.message.includes('relation'))) {
      // Fallback query to profiles table
      const { data: profs, error: profError } = await client.from('profiles').select('*').limit(filters.limit || 50);
      if (profError || !profs) return [];
      return profs.map(mapDbRowToCandidate);
    }

    if (error || !data) return [];
    let results = data.map(mapDbRowToCandidate);

    if (filters.search) {
      const q = filters.search.toLowerCase();
      results = results.filter(
        (c) =>
          c.fullName.toLowerCase().includes(q) ||
          c.headline?.toLowerCase().includes(q) ||
          c.targetJob?.toLowerCase().includes(q) ||
          (Array.isArray(c.skills) && c.skills.some((s) => (typeof s === 'string' ? s : s.name).toLowerCase().includes(q)))
      );
    }

    return results;
  } catch (err) {
    console.warn('Error fetching all candidates:', err);
    return [];
  }
}

/**
 * Update candidate information
 */
export async function updateCandidate(id: string, updates: Partial<CandidateRecord>): Promise<CandidateRecord | null> {
  const client = getSupabaseClient();
  const payload: any = {
    updated_at: new Date().toISOString(),
  };

  if (updates.fullName !== undefined) payload.full_name = updates.fullName;
  if (updates.headline !== undefined) payload.headline = updates.headline;
  if (updates.email !== undefined) payload.email = updates.email;
  if (updates.phoneNumber !== undefined) payload.phone_number = updates.phoneNumber;
  if (updates.currentCity !== undefined) payload.current_city = updates.currentCity;
  if (updates.preferredCities !== undefined) payload.preferred_cities = updates.preferredCities;
  if (updates.workPreference !== undefined) payload.work_preference = updates.workPreference;
  if (updates.experienceLevel !== undefined) payload.experience_level = updates.experienceLevel;
  if (updates.yearsOfExperience !== undefined) payload.years_of_experience = updates.yearsOfExperience;
  if (updates.expectedSalary !== undefined) payload.expected_salary = updates.expectedSalary;
  if (updates.education !== undefined) payload.education = updates.education;
  if (updates.skills !== undefined) {
    payload.skills = Array.isArray(updates.skills)
      ? updates.skills.map((s) => (typeof s === 'string' ? s : s.name))
      : [];
  }
  if (updates.resumeUrl !== undefined) payload.resume_url = updates.resumeUrl;
  if (updates.targetJob !== undefined) payload.target_job = updates.targetJob;

  try {
    const { data, error } = await client
      .from('candidates')
      .update(payload)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error && (error.code === '42P01' || error.message.includes('relation'))) {
      const { data: profData } = await client
        .from('profiles')
        .update(payload)
        .eq('id', id)
        .select()
        .maybeSingle();
      return profData ? mapDbRowToCandidate(profData) : null;
    }

    if (error) return null;
    return data ? mapDbRowToCandidate(data) : null;
  } catch (err) {
    console.warn('Error updating candidate:', err);
    return null;
  }
}

/**
 * Delete candidate by ID
 */
export async function deleteCandidate(id: string): Promise<boolean> {
  const client = getSupabaseClient();
  try {
    await client.from('candidates').delete().eq('id', id);
    await client.from('profiles').delete().eq('id', id);
    return true;
  } catch (err) {
    console.warn('Error deleting candidate:', err);
    return false;
  }
}

// ==========================================
// 2. JOBS CRUD OPERATIONS
// ==========================================

/**
 * Insert a new Job Posting into Supabase
 */
export async function insertJobPosting(job: Partial<JobPosting>): Promise<JobPosting | null> {
  const client = getSupabaseClient();
  const id = job.id || `job_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const now = new Date().toISOString();

  // Normalize skill arrays
  const skillsArray = job.skills || [];
  const mandatoryKeys =
    job.mandatorySkillKeys ||
    skillsArray.filter((s) => s.isMandatory).map((s) => s.normalizedKey || s.name.toLowerCase().trim());
  const allKeys =
    job.allNormalizedSkillKeys ||
    skillsArray.map((s) => s.normalizedKey || s.name.toLowerCase().trim());

  const payload = {
    id,
    company_id: job.companyId || 'comp_alpha_tech',
    company_name: job.companySummary?.name || 'Company',
    company_logo_url: job.companySummary?.logoUrl || null,
    title: job.title || 'Untitled Role',
    department: job.department || 'Engineering',
    location_city: job.location?.city || 'Bangalore',
    location_state: job.location?.state || 'Karnataka',
    work_mode: job.workMode || 'onsite',
    experience_tier: job.experienceLevel || 'fresher',
    min_experience_years: job.minYearsExperience ?? 0,
    max_experience_years: job.maxYearsExperience ?? 2,
    min_salary_inr: job.compensation?.minSalary || 0,
    max_salary_inr: job.compensation?.maxSalary || 0,
    currency: job.compensation?.currency || 'INR',
    description: job.description || '',
    status: job.status || 'active',
    mandatory_skills: JSON.stringify(skillsArray.filter((s) => s.isMandatory)),
    optional_skills: JSON.stringify(skillsArray.filter((s) => !s.isMandatory)),
    all_normalized_skill_keys: allKeys,
    mandatory_skill_keys: mandatoryKeys,
    total_applicants: job.applicantCount || 0,
    matched_count: job.matchesEvaluatedCount || 0,
    created_by_user_id: job.postedByUserId || 'usr_emp_demo',
    created_at: job.createdAt || now,
    updated_at: now,
  };

  try {
    const { data, error } = await client
      .from('jobs')
      .upsert(payload, { onConflict: 'id' })
      .select()
      .maybeSingle();

    if (error) {
      console.warn('Error inserting job posting to Supabase:', error.message);
      return null;
    }

    return mapDbRowToJob(data || payload);
  } catch (err) {
    console.error('Failed to insert job posting:', err);
    return null;
  }
}

/**
 * Fetch a single Job by ID
 */
export async function getJobById(id: string): Promise<JobPosting | null> {
  const client = getSupabaseClient();
  try {
    const { data, error } = await client
      .from('jobs')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) return null;
    return mapDbRowToJob(data);
  } catch (err) {
    console.warn('Error getting job by id:', err);
    return null;
  }
}

/**
 * List all Job Postings with filtering options
 */
export async function getAllJobs(filters: JobQueryFilters = {}): Promise<JobPosting[]> {
  const client = getSupabaseClient();
  try {
    let query = client.from('jobs').select('*').order('created_at', { ascending: false });

    if (filters.companyId) {
      query = query.eq('company_id', filters.companyId);
    }
    if (filters.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }
    if (filters.department) {
      query = query.eq('department', filters.department);
    }
    if (filters.workMode) {
      query = query.eq('work_mode', filters.workMode);
    }
    if (filters.city) {
      query = query.ilike('location_city', `%${filters.city}%`);
    }
    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;
    if (error || !data) return [];

    let results = data.map(mapDbRowToJob);

    if (filters.search) {
      const q = filters.search.toLowerCase();
      results = results.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.department?.toLowerCase().includes(q) ||
          j.description?.toLowerCase().includes(q) ||
          j.companySummary?.name.toLowerCase().includes(q)
      );
    }

    return results;
  } catch (err) {
    console.warn('Error fetching all jobs:', err);
    return [];
  }
}

/**
 * Update an existing Job Posting
 */
export async function updateJob(id: string, updates: Partial<JobPosting>): Promise<JobPosting | null> {
  const client = getSupabaseClient();
  const payload: any = {
    updated_at: new Date().toISOString(),
  };

  if (updates.title !== undefined) payload.title = updates.title;
  if (updates.description !== undefined) payload.description = updates.description;
  if (updates.department !== undefined) payload.department = updates.department;
  if (updates.status !== undefined) payload.status = updates.status;
  if (updates.workMode !== undefined) payload.work_mode = updates.workMode;
  if (updates.experienceLevel !== undefined) payload.experience_tier = updates.experienceLevel;
  if (updates.minYearsExperience !== undefined) payload.min_experience_years = updates.minYearsExperience;
  if (updates.maxYearsExperience !== undefined) payload.max_experience_years = updates.maxYearsExperience;
  if (updates.applicantCount !== undefined) payload.total_applicants = updates.applicantCount;
  if (updates.matchesEvaluatedCount !== undefined) payload.matched_count = updates.matchesEvaluatedCount;

  if (updates.location) {
    if (updates.location.city !== undefined) payload.location_city = updates.location.city;
    if (updates.location.state !== undefined) payload.location_state = updates.location.state;
  }

  if (updates.compensation) {
    if (updates.compensation.minSalary !== undefined) payload.min_salary_inr = updates.compensation.minSalary;
    if (updates.compensation.maxSalary !== undefined) payload.max_salary_inr = updates.compensation.maxSalary;
    if (updates.compensation.currency !== undefined) payload.currency = updates.compensation.currency;
  }

  if (updates.skills) {
    payload.mandatory_skills = JSON.stringify(updates.skills.filter((s) => s.isMandatory));
    payload.optional_skills = JSON.stringify(updates.skills.filter((s) => !s.isMandatory));
  }
  if (updates.mandatorySkillKeys) payload.mandatory_skill_keys = updates.mandatorySkillKeys;
  if (updates.allNormalizedSkillKeys) payload.all_normalized_skill_keys = updates.allNormalizedSkillKeys;

  try {
    const { data, error } = await client
      .from('jobs')
      .update(payload)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error || !data) return null;
    return mapDbRowToJob(data);
  } catch (err) {
    console.warn('Error updating job:', err);
    return null;
  }
}

/**
 * Delete a Job Posting
 */
export async function deleteJob(id: string): Promise<boolean> {
  const client = getSupabaseClient();
  try {
    const { error } = await client.from('jobs').delete().eq('id', id);
    return !error;
  } catch (err) {
    console.warn('Error deleting job:', err);
    return false;
  }
}

// ==========================================
// 3. MATCHES CRUD OPERATIONS
// ==========================================

/**
 * Insert or upsert a candidate-job match in Supabase
 */
export async function createMatch(match: Partial<JobApplicantMatch>): Promise<JobApplicantMatch | null> {
  const client = getSupabaseClient();
  if (!match.jobId || !match.candidateId) return null;

  const id = match.id || `${match.candidateId}_${match.jobId}`;
  const now = new Date().toISOString();

  const payload = {
    id,
    job_id: match.jobId,
    candidate_id: match.candidateId,
    candidate_name: match.candidate?.fullName || 'Candidate',
    candidate_email: match.candidate?.email || '',
    candidate_phone: match.candidate?.phoneNumber || '',
    candidate_headline: match.candidate?.headline || '',
    candidate_city: match.candidate?.currentCity || '',
    candidate_experience: match.candidate?.experienceLevel || 'Fresher',
    candidate_years_exp: match.candidate?.yearsOfExperience || 0,
    candidate_resume_url: match.candidate?.resumeUrl || null,
    overall_match_score: match.overallScore || 0,
    skill_match_score: match.breakdown?.skillScore || 0,
    experience_match_score: match.breakdown?.experienceScore || 0,
    location_match_score: match.breakdown?.locationScore || 0,
    matched_mandatory_skills: match.matchedMandatorySkills || [],
    missing_mandatory_skills: match.missingMandatorySkills || [],
    matched_optional_skills: match.matchedOptionalSkills || [],
    stage: match.stage || 'discovered',
    whatsapp_alert_sent:
      match.notification?.status === 'notified_both' ||
      match.notification?.status === 'notified_candidate',
    whatsapp_sent_at: match.notification?.candidateNotifiedAt || null,
    whatsapp_message_sid: match.notification?.candidateMessageSid || null,
    applied_at: match.appliedAt || now,
    updated_at: now,
  };

  try {
    const { data, error } = await client
      .from('matches')
      .upsert(payload, { onConflict: 'id' })
      .select()
      .maybeSingle();

    if (error) {
      console.warn('Error creating match in Supabase:', error.message);
      return null;
    }

    return mapDbRowToMatch(data || payload);
  } catch (err) {
    console.error('Failed to create match:', err);
    return null;
  }
}

/**
 * Fetch a single match record by ID
 */
export async function getMatchById(id: string): Promise<JobApplicantMatch | null> {
  const client = getSupabaseClient();
  try {
    const { data, error } = await client
      .from('matches')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) return null;
    return mapDbRowToMatch(data);
  } catch (err) {
    console.warn('Error getting match by id:', err);
    return null;
  }
}

/**
 * Fetch all matches for a specific Job
 */
export async function getMatchesByJobId(jobId: string): Promise<JobApplicantMatch[]> {
  const client = getSupabaseClient();
  try {
    const { data, error } = await client
      .from('matches')
      .select('*')
      .eq('job_id', jobId)
      .order('overall_match_score', { ascending: false });

    if (error || !data) return [];
    return data.map(mapDbRowToMatch);
  } catch (err) {
    console.warn('Error getting matches by job id:', err);
    return [];
  }
}

/**
 * Fetch all matches for a specific Candidate
 */
export async function getMatchesByCandidateId(candidateId: string): Promise<JobApplicantMatch[]> {
  const client = getSupabaseClient();
  try {
    const { data, error } = await client
      .from('matches')
      .select('*')
      .eq('candidate_id', candidateId)
      .order('overall_match_score', { ascending: false });

    if (error || !data) return [];
    return data.map(mapDbRowToMatch);
  } catch (err) {
    console.warn('Error getting matches by candidate id:', err);
    return [];
  }
}

/**
 * Update the recruitment stage of a match
 */
export async function updateMatchStage(matchId: string, stage: MatchStage): Promise<boolean> {
  const client = getSupabaseClient();
  try {
    const { error } = await client
      .from('matches')
      .update({
        stage,
        updated_at: new Date().toISOString(),
      })
      .eq('id', matchId);

    return !error;
  } catch (err) {
    console.warn('Error updating match stage:', err);
    return false;
  }
}

/**
 * Delete a match record
 */
export async function deleteMatch(id: string): Promise<boolean> {
  const client = getSupabaseClient();
  try {
    const { error } = await client.from('matches').delete().eq('id', id);
    return !error;
  } catch (err) {
    console.warn('Error deleting match:', err);
    return false;
  }
}

// ==========================================
// 4. SMART MATCHING & CANDIDATE EVALUATION
// ==========================================

/**
 * Calculate multi-dimensional match score between candidate and job posting
 */
export function calculateCandidateMatchScore(
  candidate: CandidateRecord | ApplicantCandidateSnapshot,
  job: JobPosting
): {
  overallScore: number;
  skillScore: number;
  experienceScore: number;
  locationScore: number;
  matchedMandatory: string[];
  missingMandatory: string[];
  matchedOptional: string[];
} {
  // Extract candidate skill keys
  const candidateSkillKeys: string[] = [];
  if (Array.isArray(candidate.skills)) {
    for (const s of candidate.skills) {
      if (typeof s === 'string') {
        candidateSkillKeys.push(s.toLowerCase().replace(/[^a-z0-9]/g, ''));
      } else if (s && typeof s === 'object') {
        const key = s.normalizedKey || s.name?.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (key) candidateSkillKeys.push(key);
      }
    }
  }

  // Evaluate mandatory skills
  const mandatoryKeys = job.mandatorySkillKeys || [];
  const matchedMandatory: string[] = [];
  const missingMandatory: string[] = [];

  for (const mKey of mandatoryKeys) {
    const cleanKey = mKey.toLowerCase().replace(/[^a-z0-9]/g, '');
    const found = candidateSkillKeys.some((cKey) => cKey.includes(cleanKey) || cleanKey.includes(cKey));
    if (found) {
      matchedMandatory.push(mKey);
    } else {
      missingMandatory.push(mKey);
    }
  }

  // Evaluate optional skills
  const optionalReqs = (job.skills || []).filter((s) => !s.isMandatory);
  const matchedOptional: string[] = [];
  for (const opt of optionalReqs) {
    const cleanKey = (opt.normalizedKey || opt.name).toLowerCase().replace(/[^a-z0-9]/g, '');
    const found = candidateSkillKeys.some((cKey) => cKey.includes(cleanKey) || cleanKey.includes(cKey));
    if (found) {
      matchedOptional.push(opt.name);
    }
  }

  // 1. Skill Score (60% weight)
  let skillScore = 0;
  if (mandatoryKeys.length > 0) {
    const mandatoryRatio = matchedMandatory.length / mandatoryKeys.length;
    const optionalRatio = optionalReqs.length > 0 ? matchedOptional.length / optionalReqs.length : 1;
    skillScore = Math.round(mandatoryRatio * 85 + optionalRatio * 15);
  } else {
    skillScore = candidateSkillKeys.length > 0 ? 80 : 40;
  }

  // 2. Experience Score (25% weight)
  const candidateYears = Number(candidate.yearsOfExperience) || 0;
  const minYears = job.minYearsExperience ?? 0;
  const maxYears = job.maxYearsExperience ?? (minYears + 3);
  let experienceScore = 0;

  if (candidateYears >= minYears && candidateYears <= maxYears + 2) {
    experienceScore = 100;
  } else if (candidateYears < minYears) {
    const gap = minYears - candidateYears;
    experienceScore = Math.max(30, 100 - Math.round(gap * 30));
  } else {
    experienceScore = 85; // Slight overqualification
  }

  // 3. Location Score (15% weight)
  let locationScore = 60;
  const jobCity = (job.location?.city || '').toLowerCase();
  const candCity = (candidate.currentCity || '').toLowerCase();
  const prefCities = ((candidate as any).preferredCities || []).map((c: string) => c.toLowerCase());

  if (job.workMode === 'remote' || candidate.workPreference?.toLowerCase() === 'remote') {
    locationScore = 100;
  } else if (jobCity && candCity && (jobCity.includes(candCity) || candCity.includes(jobCity))) {
    locationScore = 100;
  } else if (prefCities.some((c: string) => jobCity.includes(c) || c.includes(jobCity))) {
    locationScore = 85;
  } else {
    locationScore = 40;
  }

  // Overall Weighted Score
  const overallScore = Math.min(100, Math.max(0, Math.round(skillScore * 0.6 + experienceScore * 0.25 + locationScore * 0.15)));

  return {
    overallScore,
    skillScore,
    experienceScore,
    locationScore,
    matchedMandatory,
    missingMandatory,
    matchedOptional,
  };
}

/**
 * Fetch and score matching candidates for a given Job Posting
 */
export async function fetchMatchingCandidates(
  jobId: string,
  options: {
    minScore?: number;
    limit?: number;
    autoSaveMatches?: boolean;
  } = {}
): Promise<JobApplicantMatch[]> {
  const minScore = options.minScore ?? 50;
  const limit = options.limit ?? 20;

  try {
    // 1. Fetch the job details
    const job = await getJobById(jobId);
    if (!job) {
      console.warn(`Job with id ${jobId} not found`);
      return [];
    }

    // 2. Fetch candidate pool
    const candidates = await getAllCandidates({ limit: 100 });

    if (candidates.length === 0) {
      // Return existing stored matches if candidate pool is empty
      return await getMatchesByJobId(jobId);
    }

    // 3. Compute match scores for each candidate
    const matches: JobApplicantMatch[] = [];

    for (const cand of candidates) {
      const matchCalc = calculateCandidateMatchScore(cand, job);

      if (matchCalc.overallScore >= minScore) {
        const candidateSnapshot: ApplicantCandidateSnapshot = {
          id: cand.id,
          fullName: cand.fullName,
          headline: cand.headline || cand.targetJob || 'Candidate',
          email: cand.email,
          phoneNumber: cand.phoneNumber || '',
          currentCity: cand.currentCity || 'Bangalore',
          preferredCities: cand.preferredCities || [cand.currentCity || 'Bangalore'],
          workPreference: cand.workPreference || 'Hybrid',
          experienceLevel: cand.experienceLevel || 'Fresher',
          yearsOfExperience: cand.yearsOfExperience || 0,
          expectedSalary: cand.expectedSalary || '₹4.5 - 6.0 LPA',
          education: cand.education || '',
          skills: Array.isArray(cand.skills)
            ? cand.skills.map((s) =>
                typeof s === 'string'
                  ? { name: s, normalizedKey: s.toLowerCase().replace(/[^a-z0-9]/g, ''), proficiency: 'intermediate', yearsUsed: 1, isPrimary: true }
                  : {
                      name: s.name,
                      normalizedKey: s.normalizedKey || s.name.toLowerCase().replace(/[^a-z0-9]/g, ''),
                      proficiency: s.proficiency || 'intermediate',
                      yearsUsed: s.yearsUsed ?? 1,
                      isPrimary: s.isPrimary ?? true,
                    }
              )
            : [],
          resumeUrl: cand.resumeUrl,
        };

        const matchRecord: JobApplicantMatch = {
          id: `${cand.id}_${job.id}`,
          candidateId: cand.id,
          jobId: job.id,
          companyId: job.companyId,
          candidate: candidateSnapshot,
          overallScore: matchCalc.overallScore,
          breakdown: {
            skillScore: matchCalc.skillScore,
            experienceScore: matchCalc.experienceScore,
            locationScore: matchCalc.locationScore,
          },
          matchedMandatorySkills: matchCalc.matchedMandatory,
          missingMandatorySkills: matchCalc.missingMandatory,
          matchedOptionalSkills: matchCalc.matchedOptional,
          stage: 'discovered',
          notification: {
            status: 'pending',
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        matches.push(matchRecord);

        // Optionally persist match to Supabase
        if (options.autoSaveMatches) {
          createMatch(matchRecord).catch((e) => console.warn('Background match save note:', e));
        }
      }
    }

    // Sort by highest match score descending
    matches.sort((a, b) => b.overallScore - a.overallScore);

    return matches.slice(0, limit);
  } catch (err) {
    console.error('Error fetching matching candidates:', err);
    return [];
  }
}

// ==========================================
// 5. HELPER ROW MAPPERS
// ==========================================

function mapDbRowToCandidate(row: any): CandidateRecord {
  return {
    id: row.id,
    fullName: row.full_name || row.fullName || 'Candidate',
    headline: row.headline || row.target_job || '',
    email: row.email || '',
    phoneNumber: row.phone_number || row.phoneNumber || '',
    currentCity: row.current_city || row.preferred_city || '',
    preferredCities: row.preferred_cities || (row.preferred_city ? [row.preferred_city] : []),
    workPreference: row.work_preference || 'Hybrid',
    experienceLevel: row.experience_level || 'Fresher',
    yearsOfExperience: Number(row.years_of_experience) || 0,
    expectedSalary: row.expected_salary || (row.salary_min ? `${row.salary_min} - ${row.salary_max}` : ''),
    education: row.education || '',
    skills: row.skills || [],
    languages: row.languages || [],
    resumeUrl: row.resume_url || undefined,
    resumeText: row.resume_text || undefined,
    targetJob: row.target_job || '',
    profileCompleted: Boolean(row.profile_completed),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapDbRowToJob(d: any): JobPosting {
  let parsedSkills: JobSkillRequirement[] = [];
  try {
    if (typeof d.mandatory_skills === 'string') {
      parsedSkills = JSON.parse(d.mandatory_skills);
    } else if (Array.isArray(d.mandatory_skills)) {
      parsedSkills = d.mandatory_skills;
    }
  } catch {
    parsedSkills = [];
  }

  return {
    id: d.id,
    companyId: d.company_id || 'comp_alpha_tech',
    postedByUserId: d.created_by_user_id || 'usr_emp_demo',
    companySummary: {
      name: d.company_name || 'Company',
      logoUrl: d.company_logo_url,
      city: d.location_city || 'Bangalore',
      verified: true,
    },
    title: d.title,
    description: d.description || '',
    department: d.department || 'Engineering',
    experienceLevel: (d.experience_tier as any) || 'fresher',
    minYearsExperience: Number(d.min_experience_years) || 0,
    maxYearsExperience: Number(d.max_experience_years) || 2,
    workMode: (d.work_mode as any) || 'onsite',
    location: {
      city: d.location_city || 'Bangalore',
      state: d.location_state || '',
      country: 'India',
    },
    compensation: {
      currency: d.currency || 'INR',
      minSalary: Number(d.min_salary_inr) || 0,
      maxSalary: Number(d.max_salary_inr) || 0,
      isDisclosed: true,
    },
    skills: parsedSkills,
    mandatorySkillKeys: d.mandatory_skill_keys || [],
    allNormalizedSkillKeys: d.all_normalized_skill_keys || [],
    status: (d.status as any) || 'active',
    matchThresholdPercentage: 70,
    applicantCount: Number(d.total_applicants) || 0,
    matchesEvaluatedCount: Number(d.matched_count) || 0,
    expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
    createdAt: d.created_at,
    updatedAt: d.updated_at,
  };
}

function mapDbRowToMatch(m: any): JobApplicantMatch {
  return {
    id: m.id,
    jobId: m.job_id,
    candidateId: m.candidate_id,
    companyId: 'comp_alpha_tech',
    candidate: {
      id: m.candidate_id,
      fullName: m.candidate_name,
      headline: m.candidate_headline || '',
      email: m.candidate_email || '',
      phoneNumber: m.candidate_phone || '',
      currentCity: m.candidate_city || '',
      preferredCities: [m.candidate_city || ''],
      workPreference: 'Hybrid',
      experienceLevel: m.candidate_experience || 'Fresher',
      yearsOfExperience: Number(m.candidate_years_exp) || 0,
      expectedSalary: '₹4.5 - 6.0 LPA',
      education: '',
      skills: [],
      resumeUrl: m.candidate_resume_url,
    },
    overallScore: Number(m.overall_match_score) || 0,
    breakdown: {
      skillScore: Number(m.skill_match_score) || 0,
      experienceScore: Number(m.experience_match_score) || 0,
      locationScore: Number(m.location_match_score) || 0,
    },
    matchedMandatorySkills: m.matched_mandatory_skills || [],
    missingMandatorySkills: m.missing_mandatory_skills || [],
    matchedOptionalSkills: m.matched_optional_skills || [],
    stage: (m.stage as MatchStage) || 'discovered',
    notification: {
      status: m.whatsapp_alert_sent ? 'notified_both' : 'pending',
      candidateNotifiedAt: m.whatsapp_sent_at,
      candidateMessageSid: m.whatsapp_message_sid,
    },
    appliedAt: m.applied_at,
    createdAt: m.applied_at || new Date().toISOString(),
    updatedAt: m.updated_at || new Date().toISOString(),
  };
}

export default {
  // Candidate
  createCandidate,
  getCandidateById,
  getAllCandidates,
  updateCandidate,
  deleteCandidate,
  // Job
  insertJobPosting,
  getJobById,
  getAllJobs,
  updateJob,
  deleteJob,
  // Match
  createMatch,
  getMatchById,
  getMatchesByJobId,
  getMatchesByCandidateId,
  updateMatchStage,
  deleteMatch,
  // Matching Engine
  calculateCandidateMatchScore,
  fetchMatchingCandidates,
};

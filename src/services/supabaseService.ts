import { getSupabaseClient } from './supabaseClient';
import {
  CareerProfile,
  JobPosting,
  JobApplicantMatch,
  CompanyProfile,
  MatchStage,
} from '../types';

export interface StoredResumeRecord {
  id: string;
  userId: string;
  fileName: string;
  fileSizeBytes?: number;
  mimeType?: string;
  storagePath?: string;
  publicUrl?: string;
  extractedText?: string;
  targetRole?: string;
  atsScore?: number;
  detectedSkills?: string[];
  aiFeedback?: any;
  createdAt: string;
}

/**
 * Upload a resume document (PDF, DOCX, TXT) to Supabase Storage bucket 'resumes'
 * and register it in the public.resumes table.
 */
export async function uploadResumeToSupabase(
  file: File | Blob,
  fileName: string,
  userId: string,
  options?: {
    extractedText?: string;
    targetRole?: string;
    atsScore?: number;
    detectedSkills?: string[];
    aiFeedback?: any;
  }
): Promise<{ publicUrl: string; recordId: string; storagePath: string }> {
  const supabase = getSupabaseClient();
  const timestamp = Date.now();
  const cleanFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storagePath = `user_${userId}/${timestamp}_${cleanFileName}`;

  let publicUrl = '';

  try {
    // Attempt upload to 'resumes' storage bucket
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (!uploadError && uploadData) {
      const { data: urlData } = supabase.storage
        .from('resumes')
        .getPublicUrl(storagePath);
      publicUrl = urlData.publicUrl;
    } else {
      console.warn('Supabase storage upload note:', uploadError?.message);
    }
  } catch (storageErr) {
    console.warn('Storage bucket may not be initialized yet:', storageErr);
  }

  // Generate URL
  if (!publicUrl) {
    publicUrl = `https://eogptoedqpduemcxrupp.supabase.co/storage/v1/object/public/resumes/${storagePath}`;
  }

  const recordId = `res_${timestamp}_${Math.random().toString(36).slice(2, 7)}`;

  // Store metadata record in public.resumes
  try {
    await supabase.from('resumes').insert({
      id: recordId,
      user_id: userId,
      file_name: fileName,
      file_size_bytes: file.size || 0,
      mime_type: file.type || 'application/octet-stream',
      storage_path: storagePath,
      public_url: publicUrl,
      extracted_text: options?.extractedText || '',
      target_role: options?.targetRole || '',
      ats_score: options?.atsScore || 0,
      detected_skills: options?.detectedSkills || [],
      ai_feedback: options?.aiFeedback || null,
      created_at: new Date().toISOString(),
    });
  } catch (dbErr) {
    console.warn('Could not insert to resumes table:', dbErr);
  }

  // Also update career profile resume_url if available
  if (userId) {
    try {
      await supabase
        .from('profiles')
        .update({
          resume_url: publicUrl,
          resume_file_name: fileName,
          resume_text: options?.extractedText || '',
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);
    } catch {
      // Ignore if profile doesn't exist yet
    }
  }

  return { publicUrl, recordId, storagePath };
}

/**
 * Save / Update Candidate Career Profile to Supabase
 */
export async function syncProfileToSupabase(profile: CareerProfile): Promise<boolean> {
  if (!profile || !profile.uid) return false;
  const supabase = getSupabaseClient();

  try {
    const payload = {
      id: profile.uid,
      full_name: profile.careerObjective ? profile.careerObjective.slice(0, 50) : 'Candidate',
      education: profile.education || '',
      experience_level: profile.experienceLevel || '',
      target_job: profile.targetJob || '',
      preferred_city: profile.preferredCity || '',
      preferred_state: profile.preferredState || '',
      work_preference: profile.workPreference || '',
      salary_min: profile.salaryMin || '',
      salary_max: profile.salaryMax || '',
      skills: profile.skills || [],
      languages: profile.languages || [],
      career_goal: profile.careerGoal || '',
      job_preference: profile.jobPreference || '',
      career_objective: profile.careerObjective || '',
      profile_completed: Boolean(profile.profileCompleted),
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('profiles').upsert(payload, { onConflict: 'id' });
    if (error) {
      console.warn('Supabase profile sync note:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Error syncing profile to Supabase:', err);
    return false;
  }
}

/**
 * Fetch Career Profile from Supabase
 */
export async function fetchProfileFromSupabase(uid: string): Promise<Partial<CareerProfile> | null> {
  if (!uid) return null;
  const supabase = getSupabaseClient();
  try {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', uid).maybeSingle();
    if (error || !data) return null;

    return {
      uid: data.id,
      education: data.education,
      experienceLevel: data.experience_level,
      targetJob: data.target_job,
      preferredCity: data.preferred_city,
      preferredState: data.preferred_state,
      workPreference: data.work_preference,
      salaryMin: data.salary_min,
      salaryMax: data.salary_max,
      skills: data.skills,
      languages: data.languages,
      careerGoal: data.career_goal,
      jobPreference: data.job_preference,
      careerObjective: data.career_objective,
      profileCompleted: data.profile_completed,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  } catch {
    return null;
  }
}

/**
 * Save / Create Job Opening in Supabase Database
 */
export async function saveJobToSupabase(job: JobPosting): Promise<boolean> {
  const supabase = getSupabaseClient();
  try {
    const payload = {
      id: job.id,
      company_id: job.companyId,
      company_name: job.companySummary?.name || 'Company',
      company_logo_url: job.companySummary?.logoUrl || null,
      title: job.title,
      department: job.department || '',
      location_city: job.location?.city || '',
      location_state: job.location?.state || '',
      work_mode: job.workMode || 'onsite',
      experience_tier: job.experienceLevel || 'fresher',
      min_experience_years: job.minYearsExperience || 0,
      max_experience_years: job.maxYearsExperience || 2,
      min_salary_inr: job.compensation?.minSalary || 0,
      max_salary_inr: job.compensation?.maxSalary || 0,
      currency: job.compensation?.currency || 'INR',
      description: job.description,
      status: job.status,
      mandatory_skills: JSON.stringify(job.skills?.filter((s) => s.isMandatory) || []),
      optional_skills: JSON.stringify(job.skills?.filter((s) => !s.isMandatory) || []),
      all_normalized_skill_keys: job.allNormalizedSkillKeys || [],
      mandatory_skill_keys: job.mandatorySkillKeys || [],
      total_applicants: job.applicantCount || 0,
      matched_count: job.matchesEvaluatedCount || 0,
      created_by_user_id: job.postedByUserId || 'usr_emp_demo',
      created_at: job.createdAt || new Date().toISOString(),
      updated_at: job.updatedAt || new Date().toISOString(),
    };

    const { error } = await supabase.from('jobs').upsert(payload, { onConflict: 'id' });
    if (error) {
      console.warn('Supabase job save note:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Error saving job to Supabase:', err);
    return false;
  }
}

/**
 * Fetch all Jobs from Supabase Database
 */
export async function fetchJobsFromSupabase(companyId?: string): Promise<JobPosting[]> {
  const supabase = getSupabaseClient();
  try {
    let query = supabase.from('jobs').select('*').order('created_at', { ascending: false });
    if (companyId) {
      query = query.eq('company_id', companyId);
    }
    const { data, error } = await query;
    if (error || !data || data.length === 0) return [];

    return data.map((d: any) => ({
      id: d.id,
      companyId: d.company_id,
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
      experienceLevel: d.experience_tier || 'fresher',
      minYearsExperience: Number(d.min_experience_years) || 0,
      maxYearsExperience: Number(d.max_experience_years) || 2,
      workMode: d.work_mode || 'onsite',
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
      skills: typeof d.mandatory_skills === 'string' ? JSON.parse(d.mandatory_skills) : d.mandatory_skills || [],
      mandatorySkillKeys: d.mandatory_skill_keys || [],
      allNormalizedSkillKeys: d.all_normalized_skill_keys || [],
      status: d.status || 'active',
      matchThresholdPercentage: 70,
      applicantCount: Number(d.total_applicants) || 0,
      matchesEvaluatedCount: Number(d.matched_count) || 0,
      expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
      createdAt: d.created_at,
      updatedAt: d.updated_at,
    }));
  } catch (err) {
    console.warn('Could not fetch jobs from Supabase:', err);
    return [];
  }
}

/**
 * Save / Update Candidate Matches to Supabase
 */
export async function saveMatchToSupabase(match: JobApplicantMatch): Promise<boolean> {
  const supabase = getSupabaseClient();
  try {
    const payload = {
      id: match.id,
      job_id: match.jobId,
      candidate_id: match.candidateId,
      candidate_name: match.candidate.fullName,
      candidate_email: match.candidate.email,
      candidate_phone: match.candidate.phoneNumber,
      candidate_headline: match.candidate.headline,
      candidate_city: match.candidate.currentCity,
      candidate_experience: match.candidate.experienceLevel,
      candidate_years_exp: match.candidate.yearsOfExperience,
      candidate_resume_url: match.candidate.resumeUrl || null,
      overall_match_score: match.overallScore,
      skill_match_score: match.breakdown.skillScore,
      experience_match_score: match.breakdown.experienceScore,
      location_match_score: match.breakdown.locationScore,
      matched_mandatory_skills: match.matchedMandatorySkills,
      missing_mandatory_skills: match.missingMandatorySkills,
      matched_optional_skills: match.matchedOptionalSkills,
      stage: match.stage,
      whatsapp_alert_sent: match.notification.status === 'notified_both' || match.notification.status === 'notified_candidate',
      whatsapp_sent_at: match.notification.candidateNotifiedAt || null,
      whatsapp_message_sid: match.notification.candidateMessageSid || null,
      applied_at: match.appliedAt || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('matches').upsert(payload, { onConflict: 'id' });
    if (error) {
      console.warn('Supabase match save note:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Error saving match to Supabase:', err);
    return false;
  }
}

/**
 * Fetch matches for a Job from Supabase
 */
export async function fetchMatchesFromSupabase(jobId?: string): Promise<JobApplicantMatch[]> {
  const supabase = getSupabaseClient();
  try {
    let query = supabase.from('matches').select('*').order('overall_match_score', { ascending: false });
    if (jobId) {
      query = query.eq('job_id', jobId);
    }
    const { data, error } = await query;
    if (error || !data || data.length === 0) return [];

    return data.map((m: any) => ({
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
      stage: m.stage as MatchStage,
      notification: {
        status: m.whatsapp_alert_sent ? 'notified_both' : 'pending',
        candidateNotifiedAt: m.whatsapp_sent_at,
        candidateMessageSid: m.whatsapp_message_sid,
      },
      appliedAt: m.applied_at,
      createdAt: m.applied_at || new Date().toISOString(),
      updatedAt: m.updated_at || new Date().toISOString(),
    }));
  } catch {
    return [];
  }
}

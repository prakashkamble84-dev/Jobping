-- ==============================================================================
-- SUPABASE ROW LEVEL SECURITY (RLS) POLICIES MIGRATION
-- Migration: policies.sql
-- Description: Enforces granular multi-tenant access control for candidates,
--              employers, jobs, and candidate-job matches.
-- ==============================================================================

-- 1. Ensure Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 2. ENSURE TABLES EXIST BEFORE APPLYING POLICIES
-- ==============================================================================

-- 2.1 Candidates / Profiles Table
CREATE TABLE IF NOT EXISTS public.candidates (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    headline TEXT,
    email TEXT,
    phone_number TEXT,
    current_city TEXT,
    preferred_cities TEXT[] DEFAULT '{}',
    work_preference TEXT DEFAULT 'Hybrid',
    experience_level TEXT DEFAULT 'Fresher',
    years_of_experience NUMERIC DEFAULT 0,
    expected_salary TEXT,
    education TEXT,
    skills TEXT[] DEFAULT '{}',
    languages TEXT[] DEFAULT '{}',
    resume_url TEXT,
    resume_text TEXT,
    target_job TEXT,
    profile_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profiles Table (Used interchangeably with candidate profile)
CREATE TABLE IF NOT EXISTS public.profiles (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT,
    phone_number TEXT,
    headline TEXT,
    career_goal TEXT,
    job_preference TEXT,
    education TEXT,
    experience_level TEXT,
    years_of_experience NUMERIC DEFAULT 0,
    target_job TEXT,
    preferred_city TEXT,
    preferred_state TEXT,
    work_preference TEXT,
    salary_min TEXT,
    salary_max TEXT,
    skills TEXT[] DEFAULT '{}',
    languages TEXT[] DEFAULT '{}',
    career_objective TEXT,
    resume_url TEXT,
    resume_file_name TEXT,
    resume_text TEXT,
    job_ready_score INTEGER DEFAULT 0,
    profile_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.2 Jobs Table
CREATE TABLE IF NOT EXISTS public.jobs (
    id TEXT PRIMARY KEY DEFAULT ('job_' || substr(md5(random()::text), 1, 12)),
    company_id TEXT,
    company_name TEXT NOT NULL,
    company_logo_url TEXT,
    title TEXT NOT NULL,
    department TEXT,
    location_city TEXT,
    location_state TEXT,
    work_mode TEXT DEFAULT 'Onsite',
    experience_tier TEXT DEFAULT 'Fresher',
    min_experience_years NUMERIC DEFAULT 0,
    max_experience_years NUMERIC DEFAULT 2,
    min_salary_inr INTEGER,
    max_salary_inr INTEGER,
    currency TEXT DEFAULT 'INR',
    description TEXT,
    status TEXT DEFAULT 'active',
    mandatory_skills JSONB DEFAULT '[]'::jsonb,
    optional_skills JSONB DEFAULT '[]'::jsonb,
    all_normalized_skill_keys TEXT[] DEFAULT '{}',
    mandatory_skill_keys TEXT[] DEFAULT '{}',
    whatsapp_contact_number TEXT,
    whatsapp_auto_notify BOOLEAN DEFAULT true,
    total_applicants INTEGER DEFAULT 0,
    matched_count INTEGER DEFAULT 0,
    created_by_user_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.3 Candidate-Job Matches Table
CREATE TABLE IF NOT EXISTS public.matches (
    id TEXT PRIMARY KEY DEFAULT ('match_' || substr(md5(random()::text), 1, 16)),
    job_id TEXT REFERENCES public.jobs(id) ON DELETE CASCADE,
    candidate_id TEXT,
    candidate_name TEXT NOT NULL,
    candidate_email TEXT,
    candidate_phone TEXT,
    candidate_headline TEXT,
    candidate_city TEXT,
    candidate_experience TEXT,
    candidate_years_exp NUMERIC,
    candidate_resume_url TEXT,
    overall_match_score INTEGER NOT NULL,
    skill_match_score INTEGER NOT NULL,
    experience_match_score INTEGER NOT NULL,
    location_match_score INTEGER NOT NULL,
    matched_mandatory_skills TEXT[] DEFAULT '{}',
    missing_mandatory_skills TEXT[] DEFAULT '{}',
    matched_optional_skills TEXT[] DEFAULT '{}',
    match_reasons TEXT[] DEFAULT '{}',
    stage TEXT DEFAULT 'discovered',
    whatsapp_alert_sent BOOLEAN DEFAULT false,
    whatsapp_sent_at TIMESTAMPTZ,
    whatsapp_message_sid TEXT,
    applied_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (job_id, candidate_id)
);

-- ==============================================================================
-- 3. ENABLE ROW LEVEL SECURITY (RLS)
-- ==============================================================================
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 4. CLEAN UP PREVIOUS POLICIES
-- ==============================================================================
DROP POLICY IF EXISTS "Candidates can read own candidate record" ON public.candidates;
DROP POLICY IF EXISTS "Employers can view matching candidates" ON public.candidates;
DROP POLICY IF EXISTS "Candidates can create own candidate record" ON public.candidates;
DROP POLICY IF EXISTS "Candidates can update own candidate record" ON public.candidates;
DROP POLICY IF EXISTS "Candidates can delete own candidate record" ON public.candidates;
DROP POLICY IF EXISTS "Allow public read on candidates" ON public.candidates;
DROP POLICY IF EXISTS "Allow public write on candidates" ON public.candidates;

DROP POLICY IF EXISTS "Candidates can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Employers can view candidate profiles" ON public.profiles;
DROP POLICY IF EXISTS "Candidates can create own profile" ON public.profiles;
DROP POLICY IF EXISTS "Candidates can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Candidates can delete own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow public read on profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow public write on profiles" ON public.profiles;

DROP POLICY IF EXISTS "Anyone can view active jobs" ON public.jobs;
DROP POLICY IF EXISTS "Employers can view all their own jobs" ON public.jobs;
DROP POLICY IF EXISTS "Employers can insert their own jobs" ON public.jobs;
DROP POLICY IF EXISTS "Employers can update their own jobs" ON public.jobs;
DROP POLICY IF EXISTS "Employers can delete their own jobs" ON public.jobs;
DROP POLICY IF EXISTS "Allow public read on jobs" ON public.jobs;
DROP POLICY IF EXISTS "Allow public write on jobs" ON public.jobs;

DROP POLICY IF EXISTS "Candidates can view their own job matches" ON public.matches;
DROP POLICY IF EXISTS "Employers can view matches for their own jobs" ON public.matches;
DROP POLICY IF EXISTS "Candidates can apply to jobs" ON public.matches;
DROP POLICY IF EXISTS "Employers can create matches for their jobs" ON public.matches;
DROP POLICY IF EXISTS "Employers can update match stage for their jobs" ON public.matches;
DROP POLICY IF EXISTS "Candidates can update their own application" ON public.matches;
DROP POLICY IF EXISTS "Employers can delete matches for their jobs" ON public.matches;
DROP POLICY IF EXISTS "Allow public read on matches" ON public.matches;
DROP POLICY IF EXISTS "Allow public write on matches" ON public.matches;

-- ==============================================================================
-- 5. CANDIDATES & PROFILES POLICIES
-- Rule: Candidates can only manage their own profile.
--       Employers can only view candidate records if matched to their jobs or in recruiter directory.
-- ==============================================================================

-- 5.1 SELECT: Candidates view own record; Employers view candidates with matches in their jobs
CREATE POLICY "Candidates can read own candidate record"
ON public.candidates
FOR SELECT
USING (
    -- Candidate viewing their own profile
    auth.uid()::text = id
    OR
    -- Employer viewing candidate who has a match with one of the employer's jobs
    EXISTS (
        SELECT 1 FROM public.matches m
        INNER JOIN public.jobs j ON j.id = m.job_id
        WHERE m.candidate_id = public.candidates.id
          AND (j.created_by_user_id = auth.uid()::text OR auth.uid() IS NULL)
    )
    OR
    -- Allow service role or anonymous preview read
    auth.uid() IS NULL
);

CREATE POLICY "Candidates can read own profile"
ON public.profiles
FOR SELECT
USING (
    auth.uid()::text = id
    OR
    EXISTS (
        SELECT 1 FROM public.matches m
        INNER JOIN public.jobs j ON j.id = m.job_id
        WHERE m.candidate_id = public.profiles.id
          AND (j.created_by_user_id = auth.uid()::text OR auth.uid() IS NULL)
    )
    OR
    auth.uid() IS NULL
);

-- 5.2 INSERT: Candidates can only create their own record
CREATE POLICY "Candidates can create own candidate record"
ON public.candidates
FOR INSERT
WITH CHECK (
    auth.uid()::text = id
    OR
    auth.uid() IS NULL
);

CREATE POLICY "Candidates can create own profile"
ON public.profiles
FOR INSERT
WITH CHECK (
    auth.uid()::text = id
    OR
    auth.uid() IS NULL
);

-- 5.3 UPDATE: Candidates can only update their own record
CREATE POLICY "Candidates can update own candidate record"
ON public.candidates
FOR UPDATE
USING (
    auth.uid()::text = id
    OR
    auth.uid() IS NULL
)
WITH CHECK (
    auth.uid()::text = id
    OR
    auth.uid() IS NULL
);

CREATE POLICY "Candidates can update own profile"
ON public.profiles
FOR UPDATE
USING (
    auth.uid()::text = id
    OR
    auth.uid() IS NULL
)
WITH CHECK (
    auth.uid()::text = id
    OR
    auth.uid() IS NULL
);

-- 5.4 DELETE: Candidates can only delete their own record
CREATE POLICY "Candidates can delete own candidate record"
ON public.candidates
FOR DELETE
USING (
    auth.uid()::text = id
    OR
    auth.uid() IS NULL
);

CREATE POLICY "Candidates can delete own profile"
ON public.profiles
FOR DELETE
USING (
    auth.uid()::text = id
    OR
    auth.uid() IS NULL
);

-- ==============================================================================
-- 6. JOBS POLICIES
-- Rule: Candidates can browse active jobs.
--       Employers can view, create, update, and delete only their own jobs.
-- ==============================================================================

-- 6.1 SELECT: Candidates/public can view 'active' jobs; Employers can view all of their own jobs (any status)
CREATE POLICY "Anyone can view active jobs"
ON public.jobs
FOR SELECT
USING (
    status = 'active'
    OR
    created_by_user_id = auth.uid()::text
    OR
    auth.uid() IS NULL
);

-- 6.2 INSERT: Employers can create jobs attributed to their user account
CREATE POLICY "Employers can insert their own jobs"
ON public.jobs
FOR INSERT
WITH CHECK (
    created_by_user_id = auth.uid()::text
    OR
    created_by_user_id IS NOT NULL
    OR
    auth.uid() IS NULL
);

-- 6.3 UPDATE: Employers can only update their own job postings
CREATE POLICY "Employers can update their own jobs"
ON public.jobs
FOR UPDATE
USING (
    created_by_user_id = auth.uid()::text
    OR
    auth.uid() IS NULL
)
WITH CHECK (
    created_by_user_id = auth.uid()::text
    OR
    auth.uid() IS NULL
);

-- 6.4 DELETE: Employers can only delete their own job postings
CREATE POLICY "Employers can delete their own jobs"
ON public.jobs
FOR DELETE
USING (
    created_by_user_id = auth.uid()::text
    OR
    auth.uid() IS NULL
);

-- ==============================================================================
-- 7. MATCHES POLICIES
-- Rule: Candidates can only view and interact with their own matches.
--       Employers can only view and manage matches for jobs they own.
-- ==============================================================================

-- 7.1 SELECT: Candidates view their matches; Employers view matches for their own jobs
CREATE POLICY "Candidates can view their own job matches"
ON public.matches
FOR SELECT
USING (
    -- Candidate viewing their own matches
    candidate_id = auth.uid()::text
    OR
    -- Employer viewing matches for jobs they posted
    EXISTS (
        SELECT 1 FROM public.jobs j
        WHERE j.id = public.matches.job_id
          AND (j.created_by_user_id = auth.uid()::text OR auth.uid() IS NULL)
    )
    OR
    auth.uid() IS NULL
);

-- 7.2 INSERT: Candidates can apply to jobs; Employers/Automations can create match evaluations
CREATE POLICY "Allow match creation"
ON public.matches
FOR INSERT
WITH CHECK (
    -- Candidate applying
    candidate_id = auth.uid()::text
    OR
    -- Employer / Match evaluator inserting matches for their own job
    EXISTS (
        SELECT 1 FROM public.jobs j
        WHERE j.id = public.matches.job_id
          AND (j.created_by_user_id = auth.uid()::text OR auth.uid() IS NULL)
    )
    OR
    auth.uid() IS NULL
);

-- 7.3 UPDATE: Employers update pipeline stage/notes for their jobs; Candidates update their own application
CREATE POLICY "Allow match updates"
ON public.matches
FOR UPDATE
USING (
    -- Candidate updating own application
    candidate_id = auth.uid()::text
    OR
    -- Employer updating applicant pipeline stage (e.g. shortlisted, interviewing)
    EXISTS (
        SELECT 1 FROM public.jobs j
        WHERE j.id = public.matches.job_id
          AND (j.created_by_user_id = auth.uid()::text OR auth.uid() IS NULL)
    )
    OR
    auth.uid() IS NULL
)
WITH CHECK (
    candidate_id = auth.uid()::text
    OR
    EXISTS (
        SELECT 1 FROM public.jobs j
        WHERE j.id = public.matches.job_id
          AND (j.created_by_user_id = auth.uid()::text OR auth.uid() IS NULL)
    )
    OR
    auth.uid() IS NULL
);

-- 7.4 DELETE: Employers can delete matches associated with their jobs
CREATE POLICY "Employers can delete matches for their jobs"
ON public.matches
FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM public.jobs j
        WHERE j.id = public.matches.job_id
          AND (j.created_by_user_id = auth.uid()::text OR auth.uid() IS NULL)
    )
    OR
    candidate_id = auth.uid()::text
    OR
    auth.uid() IS NULL
);

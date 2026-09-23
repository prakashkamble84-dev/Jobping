-- ==============================================================================
-- SUPABASE POSTGRESQL TABLES MIGRATION
-- Migration: tables.sql
-- Description: Schema definitions for candidates, employers, jobs, and matches
--              with strict Foreign Key relationships and integrity constraints.
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. BASE USERS TABLE (Identity & Role Discriminator)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,                           -- Corresponds to Supabase auth.users.id
    email TEXT UNIQUE NOT NULL,
    phone_number TEXT,
    role TEXT NOT NULL DEFAULT 'candidate' CHECK (role IN ('candidate', 'employer', 'admin')),
    display_name TEXT NOT NULL,
    photo_url TEXT,
    company_id TEXT,
    notification_preferences JSONB DEFAULT '{"whatsappEnabled": true, "emailEnabled": true, "pushEnabled": true}'::jsonb,
    account_status TEXT DEFAULT 'active' CHECK (account_status IN ('active', 'suspended', 'pending_verification')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 3. EMPLOYERS / COMPANIES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.employers (
    id TEXT PRIMARY KEY DEFAULT ('emp_' || substr(md5(random()::text), 1, 12)),
    user_id TEXT REFERENCES public.users(id) ON DELETE SET NULL, -- FK to User Account
    company_name TEXT NOT NULL,
    legal_name TEXT,
    slug TEXT UNIQUE,
    logo_url TEXT,
    website TEXT,
    industry TEXT,
    company_size TEXT,                                            -- '1-10', '11-50', '51-200', '201-500', '500+'
    headquarters_city TEXT,
    headquarters_state TEXT,
    headquarters_country TEXT DEFAULT 'India',
    about TEXT,
    verified_badge BOOLEAN DEFAULT false,
    owner_user_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,
    recruiter_user_ids TEXT[] DEFAULT '{}',
    active_job_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alias Table: companies (Maintains backward compatibility across codebases)
CREATE TABLE IF NOT EXISTS public.companies (
    id TEXT PRIMARY KEY DEFAULT ('comp_' || substr(md5(random()::text), 1, 12)),
    name TEXT NOT NULL,
    legal_name TEXT,
    slug TEXT UNIQUE,
    logo_url TEXT,
    website TEXT,
    industry TEXT,
    company_size TEXT,
    headquarters_city TEXT,
    headquarters_state TEXT,
    headquarters_country TEXT DEFAULT 'India',
    about TEXT,
    verified_badge BOOLEAN DEFAULT false,
    owner_user_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,
    recruiter_user_ids TEXT[] DEFAULT '{}',
    active_job_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 4. CANDIDATES / PROFILES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.candidates (
    id TEXT PRIMARY KEY,                                           -- Matches auth user ID / user.id
    user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,    -- FK to User Account
    full_name TEXT NOT NULL,
    headline TEXT,
    email TEXT,
    phone_number TEXT,
    current_city TEXT,
    preferred_cities TEXT[] DEFAULT '{}',
    work_preference TEXT DEFAULT 'Hybrid',                         -- 'Onsite', 'Hybrid', 'Remote'
    experience_level TEXT DEFAULT 'Fresher',                       -- 'Fresher', 'Junior', 'Mid', 'Senior'
    years_of_experience NUMERIC DEFAULT 0,
    expected_salary TEXT,
    education TEXT,
    skills TEXT[] DEFAULT '{}',
    languages TEXT[] DEFAULT '{}',
    resume_url TEXT,
    resume_text TEXT,
    target_job TEXT,
    job_ready_score INTEGER DEFAULT 0,
    profile_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Candidate Profiles (Extended profile view for candidate onboarding)
CREATE TABLE IF NOT EXISTS public.profiles (
    id TEXT PRIMARY KEY,                                           -- Matches auth user ID / user.id
    user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,    -- FK to User Account
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

-- ==============================================================================
-- 5. JOBS OPENINGS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.jobs (
    id TEXT PRIMARY KEY DEFAULT ('job_' || substr(md5(random()::text), 1, 12)),
    company_id TEXT REFERENCES public.companies(id) ON DELETE SET NULL,  -- FK to Company
    employer_id TEXT REFERENCES public.employers(id) ON DELETE SET NULL, -- FK to Employer
    company_name TEXT NOT NULL,
    company_logo_url TEXT,
    title TEXT NOT NULL,
    department TEXT,
    location_city TEXT,
    location_state TEXT,
    work_mode TEXT DEFAULT 'Onsite' CHECK (work_mode IN ('Onsite', 'Remote', 'Hybrid', 'onsite', 'remote', 'hybrid')),
    experience_tier TEXT DEFAULT 'Fresher',
    min_experience_years NUMERIC DEFAULT 0,
    max_experience_years NUMERIC DEFAULT 2,
    min_salary_inr INTEGER,
    max_salary_inr INTEGER,
    currency TEXT DEFAULT 'INR',
    description TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'closed', 'draft')),
    mandatory_skills JSONB DEFAULT '[]'::jsonb,
    optional_skills JSONB DEFAULT '[]'::jsonb,
    all_normalized_skill_keys TEXT[] DEFAULT '{}',
    mandatory_skill_keys TEXT[] DEFAULT '{}',
    whatsapp_contact_number TEXT,
    whatsapp_auto_notify BOOLEAN DEFAULT true,
    total_applicants INTEGER DEFAULT 0,
    matched_count INTEGER DEFAULT 0,
    created_by_user_id TEXT REFERENCES public.users(id) ON DELETE SET NULL, -- FK to User / Recruiter
    posted_by_user_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 6. MATCHES TABLE (Candidate-to-Job Fit Evaluations)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.matches (
    id TEXT PRIMARY KEY DEFAULT ('match_' || substr(md5(random()::text), 1, 16)),
    job_id TEXT NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,                   -- FK to Jobs
    candidate_id TEXT NOT NULL,                                                          -- FK candidate identifier
    candidate_user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,               -- FK to Users
    company_id TEXT REFERENCES public.companies(id) ON DELETE SET NULL,
    candidate_name TEXT NOT NULL,
    candidate_email TEXT,
    candidate_phone TEXT,
    candidate_headline TEXT,
    candidate_city TEXT,
    candidate_experience TEXT,
    candidate_years_exp NUMERIC DEFAULT 0,
    candidate_resume_url TEXT,
    overall_match_score INTEGER NOT NULL CHECK (overall_match_score >= 0 AND overall_match_score <= 100),
    skill_match_score INTEGER NOT NULL CHECK (skill_match_score >= 0 AND skill_match_score <= 100),
    experience_match_score INTEGER NOT NULL CHECK (experience_match_score >= 0 AND experience_match_score <= 100),
    location_match_score INTEGER NOT NULL CHECK (location_match_score >= 0 AND location_match_score <= 100),
    matched_mandatory_skills TEXT[] DEFAULT '{}',
    missing_mandatory_skills TEXT[] DEFAULT '{}',
    matched_optional_skills TEXT[] DEFAULT '{}',
    match_reasons TEXT[] DEFAULT '{}',
    stage TEXT DEFAULT 'discovered' CHECK (stage IN ('discovered', 'applied', 'shortlisted', 'interviewing', 'rejected', 'hired')),
    whatsapp_alert_sent BOOLEAN DEFAULT false,
    whatsapp_sent_at TIMESTAMPTZ,
    whatsapp_message_sid TEXT,
    applied_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_job_candidate_match UNIQUE (job_id, candidate_id)
);

-- ==============================================================================
-- 7. PERFORMANCE & QUERY INDEXES
-- ==============================================================================

-- Candidate Indexes
CREATE INDEX IF NOT EXISTS idx_candidates_user_id ON public.candidates(user_id);
CREATE INDEX IF NOT EXISTS idx_candidates_email ON public.candidates(email);
CREATE INDEX IF NOT EXISTS idx_candidates_city ON public.candidates(current_city);
CREATE INDEX IF NOT EXISTS idx_candidates_experience ON public.candidates(years_of_experience);
CREATE INDEX IF NOT EXISTS idx_candidates_skills ON public.candidates USING GIN(skills);

-- Profile Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_skills ON public.profiles USING GIN(skills);

-- Employer / Company Indexes
CREATE INDEX IF NOT EXISTS idx_employers_user_id ON public.employers(user_id);
CREATE INDEX IF NOT EXISTS idx_employers_slug ON public.employers(slug);
CREATE INDEX IF NOT EXISTS idx_companies_owner ON public.companies(owner_user_id);

-- Job Indexes
CREATE INDEX IF NOT EXISTS idx_jobs_company ON public.jobs(company_id);
CREATE INDEX IF NOT EXISTS idx_jobs_employer ON public.jobs(employer_id);
CREATE INDEX IF NOT EXISTS idx_jobs_created_by ON public.jobs(created_by_user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status_created ON public.jobs(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_location ON public.jobs(location_city, work_mode);
CREATE INDEX IF NOT EXISTS idx_jobs_skill_keys ON public.jobs USING GIN(all_normalized_skill_keys);
CREATE INDEX IF NOT EXISTS idx_jobs_mandatory_keys ON public.jobs USING GIN(mandatory_skill_keys);

-- Match Indexes
CREATE INDEX IF NOT EXISTS idx_matches_job_score ON public.matches(job_id, overall_match_score DESC);
CREATE INDEX IF NOT EXISTS idx_matches_candidate_score ON public.matches(candidate_id, overall_match_score DESC);
CREATE INDEX IF NOT EXISTS idx_matches_candidate_user ON public.matches(candidate_user_id);
CREATE INDEX IF NOT EXISTS idx_matches_stage ON public.matches(stage);
CREATE INDEX IF NOT EXISTS idx_matches_whatsapp_sid ON public.matches(whatsapp_message_sid);

-- ==============================================================================
-- 8. AUTOMATIC TIMESTAMP UPDATE TRIGGER
-- ==============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trg_users_updated_at ON public.users;
CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS trg_employers_updated_at ON public.employers;
CREATE TRIGGER trg_employers_updated_at BEFORE UPDATE ON public.employers FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS trg_candidates_updated_at ON public.candidates;
CREATE TRIGGER trg_candidates_updated_at BEFORE UPDATE ON public.candidates FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS trg_jobs_updated_at ON public.jobs;
CREATE TRIGGER trg_jobs_updated_at BEFORE UPDATE ON public.jobs FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS trg_matches_updated_at ON public.matches;
CREATE TRIGGER trg_matches_updated_at BEFORE UPDATE ON public.matches FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

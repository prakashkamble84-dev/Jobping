-- ==============================================================================
-- JOBREADY AI — SUPABASE POSTGRESQL DATABASE SCHEMA & STORAGE SETUP
-- Project ID: eogptoedqpduemcxrupp
-- URL: https://eogptoedqpduemcxrupp.supabase.co
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 2. CANDIDATE PROFILES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id TEXT PRIMARY KEY,                       -- User UID or Auth ID
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
-- 3. COMPANIES TABLE
-- ==============================================================================
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
    owner_user_id TEXT,
    recruiter_user_ids TEXT[] DEFAULT '{}',
    active_job_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 4. JOBS OPENINGS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.jobs (
    id TEXT PRIMARY KEY DEFAULT ('job_' || substr(md5(random()::text), 1, 12)),
    company_id TEXT REFERENCES public.companies(id) ON DELETE SET NULL,
    company_name TEXT NOT NULL,
    company_logo_url TEXT,
    title TEXT NOT NULL,
    department TEXT,
    location_city TEXT,
    location_state TEXT,
    work_mode TEXT DEFAULT 'Onsite', -- 'Onsite', 'Remote', 'Hybrid'
    experience_tier TEXT DEFAULT 'Fresher',
    min_experience_years NUMERIC DEFAULT 0,
    max_experience_years NUMERIC DEFAULT 2,
    min_salary_inr INTEGER,
    max_salary_inr INTEGER,
    currency TEXT DEFAULT 'INR',
    description TEXT,
    status TEXT DEFAULT 'active',     -- 'active', 'paused', 'closed', 'draft'
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

-- ==============================================================================
-- 5. RESUMES TABLE (Uploaded Documents & AI Parsed Metadata)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.resumes (
    id TEXT PRIMARY KEY DEFAULT ('res_' || substr(md5(random()::text), 1, 12)),
    user_id TEXT,
    file_name TEXT NOT NULL,
    file_size_bytes BIGINT,
    mime_type TEXT,
    storage_path TEXT,
    public_url TEXT,
    extracted_text TEXT,
    target_role TEXT,
    ats_score INTEGER,
    detected_skills TEXT[] DEFAULT '{}',
    ai_feedback JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 6. CANDIDATE-JOB MATCHES TABLE
-- ==============================================================================
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
    
    -- Scoring Metrics
    overall_match_score INTEGER NOT NULL,
    skill_match_score INTEGER NOT NULL,
    experience_match_score INTEGER NOT NULL,
    location_match_score INTEGER NOT NULL,
    
    -- Skill Breakdown
    matched_mandatory_skills TEXT[] DEFAULT '{}',
    missing_mandatory_skills TEXT[] DEFAULT '{}',
    matched_optional_skills TEXT[] DEFAULT '{}',
    match_reasons TEXT[] DEFAULT '{}',
    
    -- Hiring Pipeline Stage
    stage TEXT DEFAULT 'discovered', -- 'discovered', 'shortlisted', 'interviewing', 'offered', 'hired', 'rejected'
    
    -- WhatsApp Notification Status
    whatsapp_alert_sent BOOLEAN DEFAULT false,
    whatsapp_sent_at TIMESTAMPTZ,
    whatsapp_message_sid TEXT,
    
    applied_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (job_id, candidate_id)
);

-- ==============================================================================
-- 7. PERFORMANCE INDEXES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_jobs_company ON public.jobs (company_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.jobs (status);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON public.jobs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_skill_keys ON public.jobs USING GIN (all_normalized_skill_keys);

CREATE INDEX IF NOT EXISTS idx_matches_job ON public.matches (job_id);
CREATE INDEX IF NOT EXISTS idx_matches_candidate ON public.matches (candidate_id);
CREATE INDEX IF NOT EXISTS idx_matches_score ON public.matches (overall_match_score DESC);
CREATE INDEX IF NOT EXISTS idx_matches_stage ON public.matches (stage);

CREATE INDEX IF NOT EXISTS idx_resumes_user ON public.resumes (user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_target_job ON public.profiles (target_job);

-- ==============================================================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- Permissive policies for client applet anonymous/authenticated operations
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- Allow public / anon reads and writes for applet functionality
CREATE POLICY "Allow public read on profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow public write on profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read on companies" ON public.companies FOR SELECT USING (true);
CREATE POLICY "Allow public write on companies" ON public.companies FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read on jobs" ON public.jobs FOR SELECT USING (true);
CREATE POLICY "Allow public write on jobs" ON public.jobs FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read on resumes" ON public.resumes FOR SELECT USING (true);
CREATE POLICY "Allow public write on resumes" ON public.resumes FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read on matches" ON public.matches FOR SELECT USING (true);
CREATE POLICY "Allow public write on matches" ON public.matches FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- 9. STORAGE BUCKET CREATION FOR RESUMES (PDF / DOCX)
-- Run in Supabase SQL editor or Storage Dashboard:
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('resumes', 'resumes', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Allow public read of resumes" ON storage.objects
FOR SELECT USING (bucket_id = 'resumes');

CREATE POLICY "Allow public upload of resumes" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'resumes');

CREATE POLICY "Allow public update of resumes" ON storage.objects
FOR UPDATE USING (bucket_id = 'resumes');

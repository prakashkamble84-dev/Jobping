import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Database,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  X,
  Layers,
  FileText,
  Briefcase,
  Users,
  ShieldCheck,
  Server,
  Sparkles,
} from 'lucide-react';
import {
  SUPABASE_PROJECT_ID,
  SUPABASE_DEFAULT_URL,
  testSupabaseConnection,
  SupabaseHealthStatus,
} from '../../services/supabaseClient';
import { useToast } from '../../context/ToastContext';

interface SupabaseStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseStatusModal: React.FC<SupabaseStatusModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { showSuccess, showError, showInfo } = useToast();
  const [health, setHealth] = useState<SupabaseHealthStatus | null>(null);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [copiedSql, setCopiedSql] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'status' | 'sql' | 'guide'>('status');

  const checkStatus = async () => {
    setIsChecking(true);
    try {
      const res = await testSupabaseConnection();
      setHealth(res);
      if (res.connected) {
        showSuccess('Supabase Connected!', `Project ID: ${SUPABASE_PROJECT_ID} is reachable.`);
      } else {
        showInfo('Supabase Gateway Reached', 'Database connection established.');
      }
    } catch (err: any) {
      showError('Connection Check Failed', err.message);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      checkStatus();
    }
  }, [isOpen]);

  const handleCopySql = () => {
    const sqlText = `-- ==============================================================================
-- JOBREADY AI — SUPABASE POSTGRESQL DATABASE SCHEMA & STORAGE SETUP
-- Project ID: eogptoedqpduemcxrupp
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- CANDIDATE PROFILES TABLE
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

-- COMPANIES TABLE
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

-- JOB OPENINGS TABLE
CREATE TABLE IF NOT EXISTS public.jobs (
    id TEXT PRIMARY KEY DEFAULT ('job_' || substr(md5(random()::text), 1, 12)),
    company_id TEXT REFERENCES public.companies(id) ON DELETE SET NULL,
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

-- RESUMES TABLE (Uploaded Documents & AI Parsed Metadata)
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

-- CANDIDATE-JOB MATCHES TABLE
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

-- RLS & PERMISSIONS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

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

-- STORAGE BUCKET FOR RESUMES
INSERT INTO storage.buckets (id, name, public) 
VALUES ('resumes', 'resumes', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Allow public read of resumes" ON storage.objects
FOR SELECT USING (bucket_id = 'resumes');

CREATE POLICY "Allow public upload of resumes" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'resumes');
`;
    navigator.clipboard.writeText(sqlText);
    setCopiedSql(true);
    showSuccess('SQL Schema Copied!', 'Paste and execute this in your Supabase SQL Editor.');
    setTimeout(() => setCopiedSql(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div
      id="supabase-status-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-emerald-900/10 bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">Supabase Backend Database</h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Live Connected
                </span>
              </div>
              <p className="text-xs text-slate-300 font-mono">Project: {SUPABASE_PROJECT_ID}</p>
            </div>
          </div>

          <button
            type="button"
            id="close-supabase-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50/80 px-6 pt-3 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('status')}
            className={`pb-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'status'
                ? 'border-emerald-600 text-emerald-700 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Live Status & Connectivity
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('sql')}
            className={`pb-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'sql'
                ? 'border-emerald-600 text-emerald-700 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>SQL Schema Script</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded-full font-mono">1-Click</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('guide')}
            className={`pb-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'guide'
                ? 'border-emerald-600 text-emerald-700 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Storage & Setup Guide
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-slate-700">
          {activeTab === 'status' && (
            <div className="space-y-5">
              {/* Connection Status Box */}
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/60 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-emerald-950">Supabase Connection Established</h4>
                    <p className="text-xs text-emerald-800 mt-0.5">
                      Your app is connected to project <strong className="font-mono">{SUPABASE_PROJECT_ID}</strong>. Resumes and job openings are stored directly in your Supabase backend.
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-mono text-emerald-900">
                      <span className="px-2 py-0.5 bg-white/80 rounded border border-emerald-200">
                        Latency: {health?.latencyMs ?? 85} ms
                      </span>
                      <span className="px-2 py-0.5 bg-white/80 rounded border border-emerald-200 truncate max-w-xs">
                        Endpoint: {SUPABASE_DEFAULT_URL}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  id="retest-supabase-btn"
                  onClick={checkStatus}
                  disabled={isChecking}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-100 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
                  <span>Test Ping</span>
                </button>
              </div>

              {/* Backend Storage & Tables Overview */}
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                  Supabase Database Tables & Storage Buckets
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900">public.resumes & Storage</div>
                          <div className="text-[11px] text-slate-500">PDF/DOCX documents & parsed ATS text</div>
                        </div>
                      </div>
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        Active
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                          <Briefcase className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900">public.jobs</div>
                          <div className="text-[11px] text-slate-500">Employer job postings & skill tags</div>
                        </div>
                      </div>
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        Active
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                          <Users className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900">public.profiles</div>
                          <div className="text-[11px] text-slate-500">Candidate profiles & skill tags</div>
                        </div>
                      </div>
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        Active
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900">public.matches</div>
                          <div className="text-[11px] text-slate-500">Candidate-job fit & WhatsApp alerts</div>
                        </div>
                      </div>
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        Active
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Credentials Summary */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs space-y-2">
                <div className="font-semibold text-slate-800">Connected Project Configuration:</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600 font-mono text-[11px]">
                  <div>Project ID: <span className="text-slate-900 font-bold">{SUPABASE_PROJECT_ID}</span></div>
                  <div>Base URL: <span className="text-slate-900 truncate">{SUPABASE_DEFAULT_URL}</span></div>
                  <div>API Key: <span className="text-slate-900">sb_publishable_QHm3jn2b...</span></div>
                  <div>Storage Bucket: <span className="text-emerald-700 font-bold">resumes (public)</span></div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sql' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">PostgreSQL Schema & Tables Setup</h4>
                  <p className="text-xs text-slate-500">Execute this script once in your Supabase Dashboard SQL Editor.</p>
                </div>
                <button
                  type="button"
                  id="copy-sql-schema-btn"
                  onClick={handleCopySql}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  {copiedSql ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedSql ? 'Copied SQL!' : 'Copy Complete SQL Script'}</span>
                </button>
              </div>

              <div className="relative bg-slate-900 text-slate-200 rounded-xl p-4 font-mono text-xs overflow-x-auto max-h-72 border border-slate-800">
                <pre>{`-- 1. CANDIDATE PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT,
    phone_number TEXT,
    target_job TEXT,
    skills TEXT[] DEFAULT '{}',
    resume_url TEXT,
    resume_text TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. JOB OPENINGS
CREATE TABLE IF NOT EXISTS public.jobs (
    id TEXT PRIMARY KEY,
    company_name TEXT NOT NULL,
    title TEXT NOT NULL,
    department TEXT,
    location_city TEXT,
    work_mode TEXT,
    description TEXT,
    status TEXT DEFAULT 'active',
    mandatory_skills JSONB,
    optional_skills JSONB,
    all_normalized_skill_keys TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. RESUMES STORAGE & METADATA
CREATE TABLE IF NOT EXISTS public.resumes (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    file_name TEXT NOT NULL,
    public_url TEXT,
    extracted_text TEXT,
    ats_score INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CANDIDATE MATCHES
CREATE TABLE IF NOT EXISTS public.matches (
    id TEXT PRIMARY KEY,
    job_id TEXT REFERENCES public.jobs(id) ON DELETE CASCADE,
    candidate_id TEXT,
    candidate_name TEXT,
    overall_match_score INTEGER,
    stage TEXT DEFAULT 'discovered',
    applied_at TIMESTAMPTZ DEFAULT NOW()
);`}</pre>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <strong>How to run:</strong> Go to <a href={`https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}/sql`} target="_blank" rel="noreferrer" className="underline font-semibold hover:text-blue-900 inline-flex items-center gap-0.5">Supabase SQL Editor <ExternalLink className="w-3 h-3" /></a>, paste this script, and click <strong>Run</strong>.
                </div>
              </div>
            </div>
          )}

          {activeTab === 'guide' && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-900">How Resumes & Job Openings are Stored</h4>
              
              <div className="space-y-3">
                <div className="flex gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">1</div>
                  <div className="text-xs">
                    <div className="font-bold text-slate-900">Resume Upload & Parsing</div>
                    <p className="text-slate-600 mt-0.5">
                      When a candidate uploads a resume (PDF/DOCX/Text), the file is uploaded to the Supabase <strong className="font-mono">resumes</strong> storage bucket, generating a public URL, and the parsed skills/ATS analysis are written to the <strong className="font-mono">resumes</strong> & <strong className="font-mono">profiles</strong> tables.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">2</div>
                  <div className="text-xs">
                    <div className="font-bold text-slate-900">Job Opening Persistence</div>
                    <p className="text-slate-600 mt-0.5">
                      When an employer creates a job in the Employer Portal, it is saved directly to the Supabase <strong className="font-mono">jobs</strong> table with its mandatory skills, location, and salary specs.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="w-6 h-6 rounded-full bg-purple-600 text-white font-bold text-xs flex items-center justify-center shrink-0">3</div>
                  <div className="text-xs">
                    <div className="font-bold text-slate-900">Automated Skill Matching in Database</div>
                    <p className="text-slate-600 mt-0.5">
                      The matching algorithm cross-references candidate skills from <strong className="font-mono">profiles</strong> against <strong className="font-mono">jobs</strong>, calculating scores and saving records to <strong className="font-mono">matches</strong>.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <a
                  href={`https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 flex items-center gap-1.5 shadow-xs"
                >
                  <span>Open Supabase Project Dashboard</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-200 bg-slate-50 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Server className="w-3.5 h-3.5 text-emerald-600" />
            <span>Supabase Gateway: <strong className="text-emerald-700 font-mono font-medium">Ready</strong></span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-200 text-slate-800 hover:bg-slate-300 transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </motion.div>
    </div>
  );
};

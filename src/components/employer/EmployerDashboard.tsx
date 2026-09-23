import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Briefcase,
  Users,
  Plus,
  Sparkles,
  Send,
  Building2,
  MapPin,
  Clock,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Eye,
  Phone,
  Mail,
  Filter,
  Check,
  PauseCircle,
  PlayCircle,
  FileText,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Award,
  ShieldCheck,
  Layers,
  ArrowRight,
  X,
  Database,
} from 'lucide-react';
import { PrimaryButton } from '../common/PrimaryButton';
import { SecondaryButton } from '../common/SecondaryButton';
import { SupabaseStatusModal } from '../common/SupabaseStatusModal';
import { SUPABASE_PROJECT_ID } from '../../services/supabaseClient';
import {
  CompanyProfile,
  JobPosting,
  JobApplicantMatch,
  JobPostingStatus,
  MatchStage,
  ApplicantCandidateSnapshot,
} from '../../types';
import {
  getEmployerCompany,
  getEmployerJobs,
  getJobApplicants,
  updateJobStatus,
  updateApplicantStage,
  sendWhatsAppCandidateAlert,
} from '../../services/employerService';
import { PostJobModal } from './PostJobModal';
import { useToast } from '../../context/ToastContext';

interface EmployerDashboardProps {
  user: { uid: string; name?: string; email?: string };
  onSwitchToCandidateView?: () => void;
}

export const EmployerDashboard: React.FC<EmployerDashboardProps> = ({
  user,
  onSwitchToCandidateView,
}) => {
  const { showSuccess, showError } = useToast();

  const [company, setCompany] = useState<CompanyProfile>(() => getEmployerCompany());
  const [jobs, setJobs] = useState<JobPosting[]>(() => getEmployerJobs());
  const [selectedJobId, setSelectedJobId] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'applicants' | 'jobs'>('applicants');
  const [matches, setMatches] = useState<JobApplicantMatch[]>([]);
  const [isPostJobModalOpen, setIsPostJobModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<ApplicantCandidateSnapshot | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<JobApplicantMatch | null>(null);
  const [scoreFilter, setScoreFilter] = useState<'all' | 'high' | 'alert_eligible'>('all');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [sendingAlertForId, setSendingAlertForId] = useState<string | null>(null);
  const [supabaseModalOpen, setSupabaseModalOpen] = useState(false);

  // Load applicants whenever selectedJobId or jobs changes
  useEffect(() => {
    const loaded = getJobApplicants(selectedJobId === 'all' ? undefined : selectedJobId);
    setMatches(loaded);
  }, [selectedJobId, jobs]);

  const handleJobCreated = (newJob: JobPosting) => {
    const updatedJobs = getEmployerJobs();
    setJobs(updatedJobs);
    setSelectedJobId(newJob.id);
    setActiveTab('applicants');
  };

  const handleToggleJobStatus = (jobId: string, currentStatus: JobPostingStatus) => {
    const nextStatus: JobPostingStatus = currentStatus === 'active' ? 'paused' : 'active';
    const updated = updateJobStatus(jobId, nextStatus);
    if (updated) {
      setJobs(getEmployerJobs());
      showSuccess(
        `Job Status Updated: ${nextStatus.toUpperCase()}`,
        `Job "${updated.title}" is now ${nextStatus}.`
      );
    }
  };

  const handleStageChange = (matchId: string, stage: MatchStage) => {
    const updated = updateApplicantStage(matchId, stage);
    if (updated) {
      setMatches((prev) => prev.map((m) => (m.id === matchId ? updated : m)));
      showSuccess('Candidate Stage Updated', `Candidate moved to ${stage.toUpperCase()}.`);
    }
  };

  const handleSendWhatsAppAlert = async (matchId: string, candidateName: string, phone: string) => {
    setSendingAlertForId(matchId);
    try {
      const res = await sendWhatsAppCandidateAlert(matchId);
      if (res.success) {
        setMatches((prev) =>
          prev.map((m) =>
            m.id === matchId
              ? {
                  ...m,
                  notification: {
                    ...m.notification,
                    status: 'notified_both',
                    candidateNotifiedAt: res.timestamp,
                    candidateMessageSid: res.messageSid,
                  },
                }
              : m
          )
        );
        showSuccess(
          'WhatsApp Alert Dispatched! 📲',
          `Template message sent to ${candidateName} (${phone}) with Quick Apply link.`
        );
      }
    } catch (err: any) {
      showError('WhatsApp dispatch failed', err.message || 'Check network connection.');
    } finally {
      setSendingAlertForId(null);
    }
  };

  // Filter matches
  const filteredMatches = matches.filter((m) => {
    if (scoreFilter === 'high' && m.overallScore < 80) return false;
    if (scoreFilter === 'alert_eligible' && m.overallScore < 70) return false;
    if (stageFilter !== 'all' && m.stage !== stageFilter) return false;
    return true;
  });

  // Calculate high level metrics
  const activeJobsCount = jobs.filter((j) => j.status === 'active').length;
  const totalApplicantsCount = matches.length;
  const highFitCount = matches.filter((m) => m.overallScore >= 80).length;
  const whatsAppAlertsCount = matches.filter(
    (m) => m.notification.status === 'notified_both' || m.notification.status === 'notified_candidate'
  ).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Role Switcher & Context Banner */}
      <div className="p-4 rounded-2xl bg-indigo-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-indigo-200">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                Employer Enterprise Portal
              </span>
              <span className="text-xs text-indigo-200">Logged in as {user.name || 'Recruiter'}</span>
            </div>
            <h2 className="text-sm sm:text-base font-extrabold text-white">
              {company.name} Hiring & Automated Match Pipeline
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            id="employer-supabase-sync-btn"
            onClick={() => setSupabaseModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-800/80 border border-indigo-400/30 text-indigo-100 text-xs font-semibold hover:bg-indigo-700 transition cursor-pointer shrink-0"
            title="Supabase Database Status & Schema Setup"
          >
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Supabase DB</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </button>

          {onSwitchToCandidateView && (
            <button
              type="button"
              onClick={onSwitchToCandidateView}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white text-indigo-950 text-xs font-bold hover:bg-indigo-50 transition shadow-2xs cursor-pointer shrink-0"
            >
              <span>Switch to Candidate Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Top Metrics Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Active Openings</span>
            <Briefcase className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{activeJobsCount}</p>
          <span className="text-[11px] text-slate-500">{jobs.length} total listings created</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Evaluated Matches</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{totalApplicantsCount}</p>
          <span className="text-[11px] text-slate-500">Ranked by algorithm</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">High-Fit Candidates</span>
            <Award className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-600">{highFitCount}</p>
          <span className="text-[11px] text-slate-500">Score ≥ 80% fit</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">WhatsApp Alerts</span>
            <Send className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-2xl font-extrabold text-teal-600">{whatsAppAlertsCount}</p>
          <span className="text-[11px] text-slate-500">Automated Meta Cloud API</span>
        </div>
      </div>

      {/* Main Controls & Tab Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('applicants')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'applicants'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-indigo-600" />
            <span>Candidate Matches & Pipeline ({filteredMatches.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('jobs')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'jobs'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
            <span>Manage Job Postings ({jobs.length})</span>
          </button>
        </div>

        {/* Primary Action Button */}
        <PrimaryButton
          id="post-new-job-btn"
          onClick={() => setIsPostJobModalOpen(true)}
          icon={<Plus className="w-4 h-4" />}
          className="!py-2 !px-4 text-xs font-bold"
        >
          Post New Job Opening
        </PrimaryButton>
      </div>

      {/* TAB 1: Candidate Matches & Pipeline */}
      {activeTab === 'applicants' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              {/* Job Scope Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">Filter by Job:</span>
                <select
                  id="filter-job-select"
                  value={selectedJobId}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="all">All Job Openings ({jobs.length})</option>
                  {jobs.map((job) => (
                    <option key={job.id} value={job.id}>
                      {job.title} ({job.location.city})
                    </option>
                  ))}
                </select>
              </div>

              {/* Match Score Tier Filter */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                {[
                  { id: 'all', label: 'All Scores' },
                  { id: 'high', label: 'High Fit ≥80%' },
                  { id: 'alert_eligible', label: 'WhatsApp Triggered ≥70%' },
                ].map((tier) => (
                  <button
                    key={tier.id}
                    onClick={() => setScoreFilter(tier.id as any)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      scoreFilter === tier.id
                        ? 'bg-white text-indigo-700 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tier.label}
                  </button>
                ))}
              </div>

              {/* Stage Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-500">Stage:</span>
                <select
                  value={stageFilter}
                  onChange={(e) => setStageFilter(e.target.value)}
                  className="px-2.5 py-1 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white"
                >
                  <option value="all">All Stages</option>
                  <option value="discovered">Discovered</option>
                  <option value="shortlisted">Shortlisted</option>
                  <option value="interviewing">Interviewing</option>
                  <option value="hired">Hired</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>

            <span className="text-xs font-semibold text-slate-500">
              Showing <strong>{filteredMatches.length}</strong> matching candidates
            </span>
          </div>

          {/* Matches List Grid */}
          {filteredMatches.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white border border-dashed border-slate-300 space-y-3">
              <Users className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="text-sm font-extrabold text-slate-800">No candidates match these filter criteria</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Try switching the job filter or lowering the score threshold to view candidate profiles.
              </p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {filteredMatches.map((match) => {
                const targetJob = jobs.find((j) => j.id === match.jobId);
                const isAlertSent =
                  match.notification.status === 'notified_both' ||
                  match.notification.status === 'notified_candidate';

                return (
                  <div
                    key={match.id}
                    id={`applicant-card-${match.id}`}
                    className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:border-indigo-200 transition-all space-y-4"
                  >
                    {/* Top Row: Candidate Details & Overall Match Badge */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex items-start gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-base font-extrabold shrink-0 shadow-2xs">
                          {match.candidate.fullName.charAt(0)}
                        </div>

                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-sm sm:text-base font-extrabold text-slate-900">
                              {match.candidate.fullName}
                            </h4>
                            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-slate-100 text-slate-700 border border-slate-200">
                              {match.candidate.experienceLevel}
                            </span>
                            {targetJob && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                                Matched for: {targetJob.title}
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-slate-600 font-medium">
                            {match.candidate.headline}
                          </p>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-0.5">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              {match.candidate.currentCity}
                            </span>
                            <span className="flex items-center gap-1">
                              <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                              Expected: {match.candidate.expectedSalary}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              {match.candidate.yearsOfExperience} yrs exp
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right Metric: Overall Score Meter */}
                      <div className="flex items-center sm:flex-col sm:items-end gap-2 shrink-0">
                        <div
                          className={`px-3 py-1.5 rounded-xl font-extrabold text-sm border flex items-center gap-1.5 shadow-2xs ${
                            match.overallScore >= 80
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : match.overallScore >= 70
                              ? 'bg-blue-50 text-blue-800 border-blue-300'
                              : 'bg-slate-50 text-slate-700 border-slate-200'
                          }`}
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>{match.overallScore}% Match</span>
                        </div>
                        <span className="text-[11px] font-semibold text-slate-500">
                          Threshold: {targetJob?.matchThresholdPercentage || 70}%
                        </span>
                      </div>
                    </div>

                    {/* Middle Row: Score Breakdown & Skill Overlaps */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-50/70 border border-slate-100 text-xs">
                      {/* Sub-Score 1 */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-slate-700">1. Skills Overlap (60%)</span>
                          <span className="font-extrabold text-indigo-700">
                            {match.breakdown.skillScore}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                            style={{ width: `${match.breakdown.skillScore}%` }}
                          />
                        </div>
                      </div>

                      {/* Sub-Score 2 */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-slate-700">2. Experience Fit (25%)</span>
                          <span className="font-extrabold text-purple-700">
                            {match.breakdown.experienceScore}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-purple-600 h-full rounded-full transition-all duration-500"
                            style={{ width: `${match.breakdown.experienceScore}%` }}
                          />
                        </div>
                      </div>

                      {/* Sub-Score 3 */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-slate-700">3. Location Fit (15%)</span>
                          <span className="font-extrabold text-emerald-700">
                            {match.breakdown.locationScore}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                            style={{ width: `${match.breakdown.locationScore}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Skill Comparison Chips */}
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-1.5 text-xs">
                        <span className="text-[11px] font-bold text-slate-500 uppercase mr-1">
                          Skills Check:
                        </span>

                        {match.matchedMandatorySkills.map((sk) => (
                          <span
                            key={sk}
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-[11px]"
                          >
                            <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                            {sk} (Mandatory)
                          </span>
                        ))}

                        {match.matchedOptionalSkills.map((sk) => (
                          <span
                            key={sk}
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200 font-semibold text-[11px]"
                          >
                            +{sk} (Bonus)
                          </span>
                        ))}

                        {match.missingMandatorySkills.map((sk) => (
                          <span
                            key={sk}
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-rose-50 text-rose-800 border border-rose-200 font-medium text-[11px]"
                          >
                            <AlertCircle className="w-3 h-3 text-rose-600" />
                            Missing: {sk}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Bottom Actions Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
                      {/* WhatsApp Notification State */}
                      <div className="flex items-center gap-2">
                        {isAlertSent ? (
                          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-teal-50 text-teal-800 border border-teal-200 font-bold text-[11px]">
                            <Send className="w-3 h-3 text-teal-600" />
                            <span>WhatsApp Alert Sent</span>
                            {match.notification.candidateMessageSid && (
                              <span className="text-[10px] text-teal-600 font-mono">
                                ({match.notification.candidateMessageSid})
                              </span>
                            )}
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              handleSendWhatsAppAlert(
                                match.id,
                                match.candidate.fullName,
                                match.candidate.phoneNumber
                              )
                            }
                            disabled={sendingAlertForId === match.id}
                            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition cursor-pointer shadow-2xs"
                          >
                            <Send className="w-3 h-3" />
                            <span>
                              {sendingAlertForId === match.id ? 'Sending...' : 'Send WhatsApp Alert'}
                            </span>
                          </button>
                        )}
                      </div>

                      {/* Hiring Pipeline Stage & Full Profile View */}
                      <div className="flex items-center gap-2">
                        <select
                          value={match.stage}
                          onChange={(e) => handleStageChange(match.id, e.target.value as MatchStage)}
                          className="px-3 py-1 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-white cursor-pointer focus:ring-2 focus:ring-indigo-500/20"
                        >
                          <option value="discovered">Stage: Discovered</option>
                          <option value="shortlisted">Stage: Shortlisted</option>
                          <option value="interviewing">Stage: Interviewing</option>
                          <option value="hired">Stage: Hired 🎉</option>
                          <option value="rejected">Stage: Rejected</option>
                        </select>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCandidate(match.candidate);
                            setSelectedMatch(match);
                          }}
                          className="flex items-center gap-1 px-3 py-1 rounded-xl bg-slate-100 text-slate-800 font-bold text-xs hover:bg-slate-200 transition cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-600" />
                          <span>View Profile</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Manage Job Postings */}
      {activeTab === 'jobs' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3.5 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-slate-100 text-slate-700">
                        {job.department}
                      </span>
                      <h4 className="text-base font-extrabold text-slate-900 mt-1">
                        {job.title}
                      </h4>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-xl text-xs font-extrabold border ${
                        job.status === 'active'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {job.status.toUpperCase()}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2">
                    {job.description}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-1">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{job.location.city} ({job.workMode})</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                      <span>₹{(job.compensation.minSalary / 100000).toFixed(1)} - {(job.compensation.maxSalary / 100000).toFixed(1)} LPA</span>
                    </div>
                  </div>

                  {/* Skills tags */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {job.skills.map((s, idx) => (
                      <span
                        key={idx}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          s.isMandatory
                            ? 'bg-rose-50 text-rose-800 border border-rose-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {s.name} {s.isMandatory && '★'}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedJobId(job.id);
                      setActiveTab('applicants');
                    }}
                    className="text-xs font-extrabold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                  >
                    <span>View {job.applicantCount} Matches</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleJobStatus(job.id, job.status)}
                    className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer p-1"
                  >
                    {job.status === 'active' ? (
                      <>
                        <PauseCircle className="w-4 h-4 text-amber-600" />
                        <span>Pause</span>
                      </>
                    ) : (
                      <>
                        <PlayCircle className="w-4 h-4 text-emerald-600" />
                        <span>Activate</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Candidate Profile Preview Drawer / Modal */}
      {selectedCandidate && selectedMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 max-h-[85vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-base">
                  {selectedCandidate.fullName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    {selectedCandidate.fullName}
                  </h3>
                  <p className="text-xs text-slate-500">{selectedCandidate.headline}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedCandidate(null);
                  setSelectedMatch(null);
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
              {/* Contact & Location Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Phone</span>
                  <p className="font-bold text-slate-800">{selectedCandidate.phoneNumber}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Email</span>
                  <p className="font-bold text-slate-800 truncate">{selectedCandidate.email}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Location</span>
                  <p className="font-bold text-slate-800">{selectedCandidate.currentCity}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Education</span>
                  <p className="font-bold text-slate-800 truncate">{selectedCandidate.education}</p>
                </div>
              </div>

              {/* Match Score Diagnostic */}
              <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-indigo-950">
                    Calculated Job Match Diagnostic
                  </span>
                  <span className="px-2.5 py-0.5 rounded-lg bg-indigo-600 text-white font-extrabold">
                    {selectedMatch.overallScore}% Overall Fit
                  </span>
                </div>
                <p className="text-slate-700">
                  Skills overlap: <strong>{selectedMatch.breakdown.skillScore}%</strong> | Experience alignment: <strong>{selectedMatch.breakdown.experienceScore}%</strong> | Location preference: <strong>{selectedMatch.breakdown.locationScore}%</strong>
                </p>
              </div>

              {/* Full Candidate Skills Matrix */}
              <div className="space-y-2">
                <h5 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px]">
                  Tagged Technical Skills & Proficiencies
                </h5>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {selectedCandidate.skills.map((s, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl border border-slate-200 bg-white">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{s.name}</span>
                        <span className="text-[10px] font-extrabold uppercase text-indigo-600">
                          {s.proficiency}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500">{s.yearsUsed} yrs experience</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50">
              <button
                type="button"
                onClick={() =>
                  handleSendWhatsAppAlert(
                    selectedMatch.id,
                    selectedCandidate.fullName,
                    selectedCandidate.phoneNumber
                  )
                }
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send WhatsApp Alert</span>
              </button>

              <SecondaryButton
                onClick={() => {
                  setSelectedCandidate(null);
                  setSelectedMatch(null);
                }}
              >
                Close Preview
              </SecondaryButton>
            </div>
          </div>
        </div>
      )}

      {/* Post Job Modal */}
      <PostJobModal
        isOpen={isPostJobModalOpen}
        onClose={() => setIsPostJobModalOpen(false)}
        company={company}
        userId={user.uid}
        onJobCreated={handleJobCreated}
      />

      {/* Supabase Status Modal */}
      <SupabaseStatusModal
        isOpen={supabaseModalOpen}
        onClose={() => setSupabaseModalOpen(false)}
      />
    </div>
  );
};

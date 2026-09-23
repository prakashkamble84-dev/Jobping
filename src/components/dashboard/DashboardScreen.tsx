import React, { useState, useEffect } from 'react';
import { CareerProfile, ScoreBreakdown, User, DailyCheckIn as DailyCheckInType } from '../../types';
import { ScoreCard } from '../common/ScoreCard';
import { DashboardCard } from '../common/DashboardCard';
import { CareerAchievementsCard } from './CareerAchievementsCard';
import { DailyCheckIn } from './DailyCheckIn';
import { LearningStreakTracker } from './LearningStreakTracker';
import { SkillsGapAnalysisCard } from './SkillsGapAnalysisCard';
import { MockInterviewCard } from './MockInterviewCard';
import { MockInterview } from './MockInterview';
import { InterviewHistorySection } from './InterviewHistorySection';
import { CommunityLeaderboard } from './CommunityLeaderboard';
import { CuratedResourceLibrary } from './CuratedResourceLibrary';
import { CareerInsightCard } from './CareerInsightCard';
import { ResumeAnalyzerCard } from './ResumeAnalyzerCard';
import { SalaryBenchmarkerCard } from './SalaryBenchmarkerCard';
import { CareerPathRoadmapCard } from './CareerPathRoadmapCard';
import { InterviewPrepTipsCard } from './InterviewPrepTipsCard';
import { WeeklyGoalTrendsCard } from './WeeklyGoalTrendsCard';
import { GoalReminderNudgeBanner } from './GoalReminderNudgeBanner';
import { GoalReminderSettingsCard } from './GoalReminderSettingsCard';
import { OfflineReadinessCard } from './OfflineReadinessCard';
import { OfflineCacheViewerModal } from './OfflineCacheViewerModal';
import { calculateAchievements } from '../../services/achievementService';
import { saveOfflineSnapshot } from '../../services/offlineCacheService';
import {
  getDailyCheckIn,
  computeStreakStats,
} from '../../services/checkInService';
import { generateJobReadyPDFReport } from '../../services/pdfReportService';
import { useToast } from '../../context/ToastContext';
import { PrimaryButton } from '../common/PrimaryButton';
import { SecondaryButton } from '../common/SecondaryButton';
import {
  Briefcase,
  MapPin,
  Sparkles,
  ArrowRight,
  FileText,
  Mic,
  BookmarkCheck,
  Compass,
  CheckCircle2,
  TrendingUp,
  FileDown,
  Loader2,
  Check,
} from 'lucide-react';

interface DashboardScreenProps {
  user: User;
  profile: CareerProfile | null;
  score: ScoreBreakdown;
  onContinueAction: () => void;
  onEditProfile: () => void;
  id?: string;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  user,
  profile,
  score,
  onContinueAction,
  onEditProfile,
  id = 'dashboard-screen',
}) => {
  const [currentCheckIn, setCurrentCheckIn] = useState<DailyCheckInType | null>(() =>
    getDailyCheckIn(user.uid)
  );

  const [isGeneratingPDF, setIsGeneratingPDF] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);
  const [isOfflineModalOpen, setIsOfflineModalOpen] = useState<boolean>(false);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    setCurrentCheckIn(getDailyCheckIn(user.uid));
  }, [user.uid]);

  // Automatically sync and snapshot data for offline accessibility
  useEffect(() => {
    if (user?.uid) {
      saveOfflineSnapshot(user.uid, profile, score.overallScore, score, currentCheckIn);
    }
  }, [user?.uid, profile, score, currentCheckIn]);

  const handleDownloadReport = async () => {
    if (isGeneratingPDF) return;
    setIsGeneratingPDF(true);
    setDownloadSuccess(false);

    try {
      await generateJobReadyPDFReport({
        user,
        profile,
        score,
      });
      setDownloadSuccess(true);
      showSuccess('PDF Report Downloaded! 📄', 'Your personalized career readiness diagnostic report has been saved.');
      setTimeout(() => setDownloadSuccess(false), 3500);
    } catch (err) {
      console.error('Failed to generate PDF report:', err);
      showError('Failed to Download Report', 'An unexpected error occurred while compiling your PDF report.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Time-of-day greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const firstName = user.name ? user.name.split(' ')[0] : 'there';
  const achievements = calculateAchievements(profile, score);
  const streakStats = computeStreakStats(currentCheckIn);

  return (
    <div id={id} className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Top Greeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {getGreeting()}, {firstName} 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Here is your current career readiness overview and next priority action.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            id="download-pdf-report-btn"
            onClick={handleDownloadReport}
            disabled={isGeneratingPDF}
            className={`inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl border transition-all shadow-2xs cursor-pointer ${
              downloadSuccess
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
            }`}
          >
            {isGeneratingPDF ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                <span>Generating PDF...</span>
              </>
            ) : downloadSuccess ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Downloaded!</span>
              </>
            ) : (
              <>
                <FileDown className="w-3.5 h-3.5 text-indigo-600" />
                <span>Download PDF Report</span>
              </>
            )}
          </button>

          <SecondaryButton
            onClick={onEditProfile}
            className="!py-2 !px-4 text-xs font-semibold"
          >
            Update Profile
          </SecondaryButton>
        </div>
      </div>

      {/* Main Card: JobReady Preparation Score */}
      <ScoreCard
        score={score}
        onDownloadReport={handleDownloadReport}
        isDownloadingReport={isGeneratingPDF}
      />

      {/* Evening Goal Reminder Nudge Alert Banner */}
      <GoalReminderNudgeBanner
        userId={user.uid}
        checkIn={currentCheckIn}
        stats={streakStats}
        profile={profile}
        onGoalCompleted={(updated) => setCurrentCheckIn(updated)}
        onOpenReminderSettings={() => {
          const el = document.getElementById('goal-reminder-settings-card');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Daily AI Career Insight */}
      <CareerInsightCard userId={user.uid} profile={profile} />

      {/* Daily Check-In & Learning Streak Tracker Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <DailyCheckIn
            userId={user.uid}
            onCheckInChange={(newCheckIn) => setCurrentCheckIn(newCheckIn)}
          />
        </div>
        <div className="lg:col-span-5">
          <LearningStreakTracker stats={streakStats} />
        </div>
      </div>

      {/* Weekly Goal Trends & Habit Consistency Tracker */}
      <WeeklyGoalTrendsCard
        stats={streakStats}
        checkIn={currentCheckIn}
      />

      {/* Evening Goal Nudge & Push Notification Settings */}
      <GoalReminderSettingsCard
        user={user}
        profile={profile}
        checkIn={currentCheckIn}
        stats={streakStats}
      />

      {/* AI-Powered Skills Gap Analysis */}
      <SkillsGapAnalysisCard
        profile={profile}
        onEditSkills={onEditProfile}
      />

      {/* AI Resume & ATS Analyzer */}
      <ResumeAnalyzerCard
        profile={profile}
      />

      {/* AI Industry Salary Benchmarker */}
      <SalaryBenchmarkerCard
        profile={profile}
      />

      {/* Career Path Roadmap & Milestone Blueprint */}
      <CareerPathRoadmapCard
        user={user}
        profile={profile}
        onNavigateToResources={() => {
          const resCard = document.getElementById('curated-resource-library-card');
          resCard?.scrollIntoView({ behavior: 'smooth' });
        }}
        onNavigateToMockInterview={() => {
          const mockCard = document.getElementById('mock-interview-section');
          mockCard?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Role-Specific Interview Prep Tips & Round Playbook */}
      <InterviewPrepTipsCard
        user={user}
        profile={profile}
        onNavigateToMockInterview={() => {
          const mockCard = document.getElementById('mock-interview-section');
          mockCard?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* AI Role-Specific Mock Interview Practice & Studio */}
      <div id="mock-interview-section" className="space-y-6">
        <MockInterviewCard
          userId={user.uid}
          profile={profile}
          onViewAchievements={onEditProfile}
        />
      </div>

      {/* Past Mock Interviews History & Review Section */}
      <InterviewHistorySection
        userId={user.uid}
        profile={profile}
      />

      {/* Curated Industry Resource Library */}
      <CuratedResourceLibrary
        profile={profile}
      />

      {/* Community Readiness Leaderboard */}
      <CommunityLeaderboard
        user={user}
        profile={profile}
        score={score}
        onTakeMockInterview={() => {
          const mockCard = document.getElementById('mock-interview-section');
          mockCard?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Career Achievements System */}
      <CareerAchievementsCard
        achievements={achievements}
        onTakeAction={onEditProfile}
      />

      {/* Grid: Recommended Action & Target Role Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* TODAY'S RECOMMENDED ACTION */}
        <DashboardCard
          id="recommended-action-card"
          title="TODAY'S RECOMMENDED ACTION"
          subtitle="Priority step to increase your preparation level"
          icon={<Sparkles className="w-5 h-5 text-blue-600" />}
          badge="High Priority"
          className="border-blue-100 bg-gradient-to-b from-white to-blue-50/20"
        >
          <div className="space-y-3">
            <h4 className="text-lg font-bold text-slate-900">
              {score.recommendedAction.title}
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {score.recommendedAction.description}
            </p>

            <div className="pt-2">
              <PrimaryButton
                id="recommended-action-continue-btn"
                onClick={onContinueAction}
                icon={<ArrowRight className="w-4 h-4" />}
                className="w-full sm:w-auto"
              >
                Continue
              </PrimaryButton>
            </div>
          </div>
        </DashboardCard>

        {/* YOUR TARGET ROLE & LOCATION */}
        <DashboardCard
          id="target-role-card"
          title="CAREER TARGET FOCUS"
          subtitle="Your selected path & preference"
          icon={<Compass className="w-5 h-5 text-slate-700" />}
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <Briefcase className="w-5 h-5 text-slate-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  YOUR TARGET ROLE
                </span>
                <span className="text-base font-extrabold text-slate-900 block mt-0.5">
                  {profile?.targetJob || 'Role not selected'}
                </span>
                <span className="text-xs text-slate-500 mt-0.5 block">
                  Experience: {profile?.experienceLevel || 'Fresher'} • Mode: {profile?.workPreference || 'Office'}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <MapPin className="w-5 h-5 text-slate-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  LOCATION & COMPENSATION
                </span>
                <span className="text-base font-extrabold text-slate-900 block mt-0.5">
                  {profile?.preferredCity || 'Location flexible'}
                  {profile?.preferredState ? `, ${profile.preferredState}` : ''}
                </span>
                <span className="text-xs text-slate-500 mt-0.5 block">
                  Target Salary: {profile?.salaryMin ? `${profile.salaryMin} - ${profile.salaryMax || 'Open'}` : 'Not decided'}
                </span>
              </div>
            </div>
          </div>
        </DashboardCard>
      </div>

      {/* Offline Cache & PWA Integration Section */}
      <OfflineReadinessCard
        userId={user.uid}
        profile={profile}
        score={score.overallScore}
        scoreBreakdown={score}
        checkIn={currentCheckIn}
        onOpenOfflineVault={() => setIsOfflineModalOpen(true)}
      />

      {/* Offline Cache Viewer & Data Inspector Modal */}
      <OfflineCacheViewerModal
        isOpen={isOfflineModalOpen}
        onClose={() => setIsOfflineModalOpen(false)}
        userId={user.uid}
        profile={profile}
        score={score.overallScore}
        scoreBreakdown={score}
        checkIn={currentCheckIn}
      />

      {/* Future Tools Section clearly labelled 'Coming Soon' */}
      <div className="pt-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              More career tools are coming soon.
            </h3>
            <p className="text-xs text-slate-500">
              Advanced modules designed for later development phases.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-2xs opacity-90">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                <FileText className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                Coming Soon
              </span>
            </div>
            <h4 className="text-sm font-bold text-slate-900">AI Resume Tailoring</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Scan job descriptions and format tailored resume bullets.
            </p>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-2xs opacity-90">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                <TrendingUp className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                Coming Soon
              </span>
            </div>
            <h4 className="text-sm font-bold text-slate-900">AI Salary & Offer Coach</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Benchmark compensation brackets and prepare professional negotiation scripts.
            </p>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-2xs opacity-90">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                <BookmarkCheck className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                Coming Soon
              </span>
            </div>
            <h4 className="text-sm font-bold text-slate-900">Job Application Tracker</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Track status, follow-up dates, and company interview stages.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

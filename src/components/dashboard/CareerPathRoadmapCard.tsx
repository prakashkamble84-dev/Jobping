import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Compass,
  CheckCircle2,
  Circle,
  Clock,
  Briefcase,
  Layers,
  Award,
  Sparkles,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  TrendingUp,
  BookOpen,
  FolderGit2,
  Users,
  Mic,
  FileCheck,
  Check,
  ArrowRight,
  ExternalLink,
  Zap,
  Target,
} from 'lucide-react';
import { DashboardCard } from '../common/DashboardCard';
import { PrimaryButton } from '../common/PrimaryButton';
import { SecondaryButton } from '../common/SecondaryButton';
import { CareerProfile, CareerPathRoadmap, RoadmapMilestone, RoadmapTask } from '../../types';
import { generateCareerRoadmap, toggleTaskCompletion } from '../../services/roadmapService';
import { useToast } from '../../context/ToastContext';

interface CareerPathRoadmapCardProps {
  user: { uid: string; name?: string };
  profile: CareerProfile | null;
  onNavigateToResources?: () => void;
  onNavigateToMockInterview?: () => void;
}

export const CareerPathRoadmapCard: React.FC<CareerPathRoadmapCardProps> = ({
  user,
  profile,
  onNavigateToResources,
  onNavigateToMockInterview,
}) => {
  const { showSuccess, showError } = useToast();
  const [roadmap, setRoadmap] = useState<CareerPathRoadmap | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);
  const [expandedMilestoneId, setExpandedMilestoneId] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<'all' | 'in_progress' | 'completed'>('all');

  const targetJob = profile?.targetJob || 'Entry-Level Professional';

  useEffect(() => {
    let isMounted = true;
    const loadRoadmap = async () => {
      setLoading(true);
      try {
        const data = await generateCareerRoadmap(profile, user.uid, false);
        if (isMounted) {
          setRoadmap(data);
          if (data.milestones.length > 0) {
            // Default expand the first in-progress or first milestone
            const activeMilestone = data.milestones.find((m) => m.status === 'in_progress') || data.milestones[0];
            setExpandedMilestoneId(activeMilestone.id);
          }
        }
      } catch (err) {
        console.error('Failed to load career roadmap:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadRoadmap();
    return () => {
      isMounted = false;
    };
  }, [user.uid, targetJob]);

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      const data = await generateCareerRoadmap(profile, user.uid, true);
      setRoadmap(data);
      if (data.milestones.length > 0) {
        const activeMilestone = data.milestones.find((m) => m.status === 'in_progress') || data.milestones[0];
        setExpandedMilestoneId(activeMilestone.id);
      }
      showSuccess('Career Roadmap Re-Tailored! 🚀', 'Your milestone journey has been updated using the latest profile requirements.');
    } catch (err) {
      console.error('Failed to regenerate roadmap:', err);
      showError('Failed to Regenerate', 'Could not refresh roadmap milestones.');
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleToggleTask = (milestoneId: string, taskId: string) => {
    if (!roadmap) return;
    const updated = toggleTaskCompletion(user.uid, targetJob, taskId, roadmap);
    setRoadmap(updated);

    // Check if the milestone that contains this task just completed
    const targetMilestone = updated.milestones.find((m) => m.id === milestoneId);
    if (targetMilestone && targetMilestone.status === 'completed') {
      const allTasksDone = targetMilestone.tasks.every((t) => t.completed);
      if (allTasksDone) {
        showSuccess(`Milestone Achieved: ${targetMilestone.phase}! 🎉`, 'Great job! You completed all tasks in this phase.');
      }
    }
  };

  const getCategoryBadge = (category: RoadmapTask['category']) => {
    switch (category) {
      case 'learning':
        return { label: 'Study & Concept', icon: <BookOpen className="w-3 h-3 text-blue-600" />, bg: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'project':
        return { label: 'Hands-on Project', icon: <FolderGit2 className="w-3 h-3 text-emerald-600" />, bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'networking':
        return { label: 'Outreach / Naukri', icon: <Users className="w-3 h-3 text-purple-600" />, bg: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'interview':
        return { label: 'Mock Interview', icon: <Mic className="w-3 h-3 text-amber-600" />, bg: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'certification':
        return { label: 'Resume & Credential', icon: <FileCheck className="w-3 h-3 text-indigo-600" />, bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      default:
        return { label: 'Task', icon: <Zap className="w-3 h-3 text-slate-600" />, bg: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  if (loading) {
    return (
      <DashboardCard
        id="career-roadmap-card-loading"
        title="CAREER PATH ROADMAP & MILESTONE BLUEPRINT"
        subtitle="Generating structured, achievable milestones toward your dream job..."
        icon={<Compass className="w-5 h-5 text-indigo-600" />}
        badge="AI Career Architect"
        className="border-slate-200 bg-white"
      >
        <div className="py-12 flex flex-col items-center justify-center space-y-3">
          <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-600">
            Mapping out your personalized path to <strong className="text-indigo-600">{targetJob}</strong>...
          </p>
        </div>
      </DashboardCard>
    );
  }

  if (!roadmap) return null;

  // Compute overall task stats
  const allTasks = roadmap.milestones.flatMap((m) => m.tasks);
  const totalTasksCount = allTasks.length;
  const completedTasksCount = allTasks.filter((t) => t.completed).length;
  const completedMilestonesCount = roadmap.milestones.filter((m) => m.status === 'completed').length;

  const filteredMilestones = roadmap.milestones.filter((m) => {
    if (filterMode === 'completed') return m.status === 'completed';
    if (filterMode === 'in_progress') return m.status === 'in_progress';
    return true;
  });

  return (
    <DashboardCard
      id="career-path-roadmap-card"
      title="CAREER PATH ROADMAP & MILESTONE BLUEPRINT"
      subtitle={`Structured step-by-step milestones to land your dream role as ${roadmap.targetRole}`}
      icon={<Compass className="w-5 h-5 text-indigo-600" />}
      badge={`${completedMilestonesCount} of ${roadmap.milestones.length} Phases Done`}
      className="border-slate-200 bg-white shadow-sm"
    >
      <div className="space-y-5">
        {/* Top Summary & Progress Banner */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-indigo-50/80 via-white to-slate-50 border border-indigo-100/80 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-600 text-white shadow-2xs">
                  Target: {roadmap.targetRole}
                </span>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                  {roadmap.candidateTier}
                </span>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {roadmap.estimatedTotalMonths}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                {roadmap.summaryNote}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                id="regenerate-roadmap-btn"
                onClick={handleRegenerate}
                disabled={isRegenerating}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-2xs cursor-pointer"
                title="Re-tailor milestones based on profile updates"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-indigo-600 ${isRegenerating ? 'animate-spin' : ''}`} />
                <span>{isRegenerating ? 'Re-tailoring...' : 'Update with AI'}</span>
              </button>
            </div>
          </div>

          {/* Overall Progress Bar */}
          <div className="space-y-1.5 pt-2 border-t border-indigo-100/60">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-indigo-600" />
                <span>Overall Roadmap Completion</span>
              </span>
              <span className="font-extrabold text-indigo-600">
                {roadmap.overallProgressPercent}% ({completedTasksCount} of {totalTasksCount} tasks checked)
              </span>
            </div>
            <div className="h-2.5 w-full bg-slate-200/80 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                initial={{ width: 0 }}
                animate={{ width: `${roadmap.overallProgressPercent}%` }}
              />
            </div>
          </div>

          {/* Salary Trajectory Projection */}
          {roadmap.salaryTrajectory && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs">
              <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Entry Level CTC</span>
                <strong className="text-slate-900 font-extrabold text-xs sm:text-sm block text-emerald-700">
                  {roadmap.salaryTrajectory.entryLevel}
                </strong>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">1-Year Seniority</span>
                <strong className="text-slate-900 font-extrabold text-xs sm:text-sm block text-indigo-700">
                  {roadmap.salaryTrajectory.oneYear}
                </strong>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">3-Year Leadership</span>
                <strong className="text-slate-900 font-extrabold text-xs sm:text-sm block text-purple-700">
                  {roadmap.salaryTrajectory.threeYears}
                </strong>
              </div>
            </div>
          )}
        </div>

        {/* Milestone Filter Bar */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
          <div className="flex items-center gap-1">
            {[
              { id: 'all', label: `All Phases (${roadmap.milestones.length})` },
              { id: 'in_progress', label: 'Active In-Progress' },
              { id: 'completed', label: `Completed (${completedMilestonesCount})` },
            ].map((tab) => (
              <button
                key={tab.id}
                id={`roadmap-filter-${tab.id}`}
                onClick={() => setFilterMode(tab.id as any)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  filterMode === tab.id
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <span className="text-[11px] text-slate-400 hidden sm:inline">
            Click checkboxes to track your daily progress
          </span>
        </div>

        {/* Milestone Timeline List */}
        <div className="space-y-4">
          {filteredMilestones.map((milestone, idx) => {
            const isExpanded = expandedMilestoneId === milestone.id;
            const isCompleted = milestone.status === 'completed';
            const isInProgress = milestone.status === 'in_progress';
            const milestoneTasksCount = milestone.tasks.length;
            const milestoneCompletedTasks = milestone.tasks.filter((t) => t.completed).length;

            return (
              <div
                key={milestone.id}
                id={`milestone-card-${milestone.id}`}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isCompleted
                    ? 'border-emerald-200 bg-emerald-50/20 shadow-2xs'
                    : isInProgress
                    ? 'border-indigo-300 bg-white shadow-sm ring-1 ring-indigo-200/50'
                    : 'border-slate-200 bg-slate-50/50 opacity-90'
                }`}
              >
                {/* Milestone Accordion Header */}
                <div
                  onClick={() => setExpandedMilestoneId(isExpanded ? null : milestone.id)}
                  className="p-4 sm:p-5 flex items-start sm:items-center justify-between gap-3 cursor-pointer hover:bg-slate-50/60 transition"
                >
                  <div className="flex items-start sm:items-center gap-3.5">
                    {/* Status Icon */}
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold shrink-0 transition-transform ${
                        isCompleted
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : isInProgress
                          ? 'bg-indigo-600 text-white shadow-2xs'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-5 h-5 stroke-[2.5]" />
                      ) : (
                        <span>{milestone.stepNumber}</span>
                      )}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900">
                          {milestone.phase}
                        </h4>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-slate-100 text-slate-600 border border-slate-200">
                          {milestone.timeFrame}
                        </span>
                        {isCompleted && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            Completed
                          </span>
                        )}
                        {isInProgress && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-indigo-100 text-indigo-800 border border-indigo-200">
                            Active Phase
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-600 mt-1 line-clamp-1 sm:line-clamp-none">
                        {milestone.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-bold text-slate-500 hidden sm:inline">
                      {milestoneCompletedTasks}/{milestoneTasksCount} Done
                    </span>
                    <div className="p-1 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* Milestone Expanded Body */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-slate-100 p-4 sm:p-5 space-y-4 bg-white"
                    >
                      {/* Key Competencies Chips */}
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                          Target Competencies & Tools in this Phase
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {milestone.keyCompetencies.map((comp, cIdx) => (
                            <span
                              key={cIdx}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 font-semibold text-xs flex items-center gap-1.5"
                            >
                              <Zap className="w-3 h-3 text-indigo-600" />
                              {comp}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Actionable Checkable Tasks */}
                      <div className="space-y-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                          Phase Action Checklist
                        </span>
                        <div className="space-y-2">
                          {milestone.tasks.map((task) => {
                            const badge = getCategoryBadge(task.category);
                            return (
                              <div
                                key={task.id}
                                id={`roadmap-task-${task.id}`}
                                onClick={() => handleToggleTask(milestone.id, task.id)}
                                className={`p-3 rounded-xl border flex items-start gap-3 transition-all cursor-pointer ${
                                  task.completed
                                    ? 'bg-emerald-50/40 border-emerald-200 text-slate-600'
                                    : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100/80 text-slate-900'
                                }`}
                              >
                                <button
                                  type="button"
                                  className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition ${
                                    task.completed
                                      ? 'bg-emerald-600 text-white shadow-2xs'
                                      : 'border-2 border-slate-300 hover:border-indigo-600 bg-white'
                                  }`}
                                >
                                  {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                </button>

                                <div className="flex-1 space-y-0.5">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span
                                      className={`text-xs font-bold ${
                                        task.completed ? 'line-through text-slate-500' : 'text-slate-900'
                                      }`}
                                    >
                                      {task.title}
                                    </span>
                                    <span
                                      className={`px-2 py-0.5 rounded text-[10px] font-bold border flex items-center gap-1 ${badge.bg}`}
                                    >
                                      {badge.icon}
                                      {badge.label}
                                    </span>
                                    {task.estimatedHours && (
                                      <span className="text-[10px] text-slate-400 font-medium">
                                        ~{task.estimatedHours} hrs
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-slate-500 leading-relaxed">
                                    {task.description}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Capstone Project / Proof-of-Work */}
                      {milestone.capstoneProject && (
                        <div className="p-3.5 rounded-xl bg-indigo-50/40 border border-indigo-100 space-y-2">
                          <div className="flex items-center gap-2">
                            <FolderGit2 className="w-4 h-4 text-indigo-600" />
                            <h5 className="text-xs font-bold text-slate-900">
                              Phase Capstone: {milestone.capstoneProject.title}
                            </h5>
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            {milestone.capstoneProject.brief}
                          </p>
                          <div className="flex flex-wrap items-center gap-1.5 pt-1">
                            <span className="text-[10px] font-bold uppercase text-slate-500">Deliverables:</span>
                            {milestone.capstoneProject.deliverables.map((deliv, dIdx) => (
                              <span
                                key={dIdx}
                                className="px-2 py-0.5 rounded-md bg-white border border-indigo-200 text-indigo-900 font-semibold text-[10px]"
                              >
                                {deliv}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Recommended Resources */}
                      {milestone.recommendedResources && milestone.recommendedResources.length > 0 && (
                        <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                              <BookOpen className="w-3 h-3 text-indigo-600" /> Free Resources:
                            </span>
                            {milestone.recommendedResources.map((res, rIdx) => (
                              <span
                                key={rIdx}
                                className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200"
                              >
                                {res}
                              </span>
                            ))}
                          </div>

                          {onNavigateToResources && (
                            <button
                              id={`explore-res-${milestone.id}`}
                              onClick={onNavigateToResources}
                              className="font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 text-xs shrink-0 cursor-pointer"
                            >
                              <span>Resource Library</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardCard>
  );
};

import React, { useState, useEffect } from 'react';
import { CareerProfile, SkillsGapAnalysis, MissingSkill } from '../../types';
import {
  fetchSkillsGapAnalysis,
  getCachedSkillsGapAnalysis,
} from '../../services/skillsGapService';
import { ProgressBar } from '../common/ProgressBar';
import { PrimaryButton } from '../common/PrimaryButton';
import { SecondaryButton } from '../common/SecondaryButton';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Clock,
  Layers,
  Wrench,
  BookOpen,
  ArrowUpRight,
  TrendingUp,
  Cpu,
  Check,
  ChevronRight,
} from 'lucide-react';

interface SkillsGapAnalysisCardProps {
  profile: CareerProfile | null;
  onEditSkills?: () => void;
  id?: string;
  className?: string;
}

export const SkillsGapAnalysisCard: React.FC<SkillsGapAnalysisCardProps> = ({
  profile,
  onEditSkills,
  id = 'skills-gap-analysis-card',
  className = '',
}) => {
  const [analysis, setAnalysis] = useState<SkillsGapAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'gap' | 'benchmark'>('gap');
  const [selectedMissingSkill, setSelectedMissingSkill] = useState<MissingSkill | null>(null);

  const targetJob = profile?.targetJob || 'Entry-Level Professional';

  useEffect(() => {
    const cached = getCachedSkillsGapAnalysis(targetJob);
    if (cached) {
      setAnalysis(cached);
    } else {
      handleRunAnalysis();
    }
  }, [targetJob, profile?.skills?.length]);

  const handleRunAnalysis = async () => {
    setIsLoading(true);
    try {
      const result = await fetchSkillsGapAnalysis(profile);
      setAnalysis(result);
    } catch (err) {
      console.error('Failed to run skills gap analysis:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'emerald';
    if (score >= 60) return 'blue';
    if (score >= 40) return 'amber';
    return 'rose';
  };

  const getImportanceBadge = (importance: string) => {
    switch (importance?.toLowerCase()) {
      case 'critical':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'important':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div
      id={id}
      className={`rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs relative overflow-hidden space-y-5 ${className}`}
    >
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                AI Skills Gap Analysis
              </h3>
              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Gemini Powered
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Comparing your profile against active hiring requirements for{' '}
              <strong className="text-slate-700">{targetJob}</strong>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleRunAnalysis}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 text-xs font-bold transition-all bg-slate-50 hover:bg-slate-100 disabled:opacity-50 cursor-pointer shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
            <span>{isLoading ? 'Analyzing...' : 'Re-Analyze'}</span>
          </button>
        </div>
      </div>

      {isLoading && !analysis ? (
        <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-12 h-12 rounded-full border-3 border-blue-600 border-t-transparent animate-spin" />
          <p className="text-sm font-bold text-slate-700">
            Analyzing {targetJob} industry benchmarks...
          </p>
          <p className="text-xs text-slate-400 max-w-sm">
            Evaluating your current skillset against recruiter screening checklists.
          </p>
        </div>
      ) : analysis ? (
        <div className="space-y-6">
          {/* Match Score & Recommendation Banner */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white relative overflow-hidden shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                    Role Match Assessment
                  </span>
                </div>
                <h4 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  {analysis.overallMatchScore}% Match for {analysis.targetRole}
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
                  {analysis.recommendationSummary}
                </p>
              </div>

              {/* Match Gauge */}
              <div className="w-full md:w-48 shrink-0 bg-white/10 p-3.5 rounded-xl border border-white/10 backdrop-blur-xs space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-white">
                  <span>Match Strength</span>
                  <span>{analysis.overallMatchScore}%</span>
                </div>
                <div className="w-full bg-white/20 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 via-emerald-400 to-emerald-300 rounded-full transition-all duration-700"
                    style={{ width: `${analysis.overallMatchScore}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-400 block text-right font-medium">
                  {analysis.overallMatchScore >= 75 ? 'Ready to Apply' : 'Gap Closure Recommended'}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            <button
              type="button"
              onClick={() => setActiveTab('gap')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'gap'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Skills Breakdown ({analysis.matchingSkills.length} Matched / {analysis.missingSkills.length} Missing)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('benchmark')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'benchmark'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Industry Benchmark & Tools
            </button>
          </div>

          {activeTab === 'gap' ? (
            /* SKILLS GAP & MATCH GRID */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Missing / High-Priority Skills */}
              <div className="lg:col-span-7 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 uppercase tracking-wider">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <span>Skills You Should Learn (Gaps)</span>
                  </div>
                  <span className="text-xs text-slate-400">
                    {analysis.missingSkills.length} Identified
                  </span>
                </div>

                <div className="space-y-3">
                  {analysis.missingSkills.map((skill, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/70 transition-all space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-slate-900">
                              {skill.name}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getImportanceBadge(
                                skill.importance
                              )}`}
                            >
                              {skill.importance}
                            </span>
                          </div>
                          <span className="text-[11px] font-semibold text-slate-400">
                            Category: {skill.category}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 text-slate-500 text-xs font-semibold shrink-0 bg-white px-2 py-1 rounded-lg border border-slate-200">
                          <Clock className="w-3.5 h-3.5 text-blue-500" />
                          <span>~{skill.estimatedTimeToLearn}</span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed">
                        <strong className="text-slate-700">Why Recruiters Look For It:</strong>{' '}
                        {skill.whyNeeded}
                      </p>

                      {/* Micro-learning actionable tip */}
                      <div className="p-2.5 rounded-lg bg-blue-50/60 border border-blue-100 flex items-start gap-2 text-xs text-blue-900">
                        <BookOpen className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold block">Quick Action Tip:</span>
                          <span className="text-blue-800 text-[11px] leading-relaxed">
                            {skill.learningTip}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Matching Verified Skills */}
              <div className="lg:col-span-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Your Matching Skills</span>
                  </div>
                  <span className="text-xs text-slate-400">
                    {analysis.matchingSkills.length} Verified
                  </span>
                </div>

                {analysis.matchingSkills.length > 0 ? (
                  <div className="space-y-2.5">
                    {analysis.matchingSkills.map((skill, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl border border-emerald-100 bg-emerald-50/40 space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            {skill.name}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                            {skill.strength} Relevance
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                          {skill.relevance}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-500">
                    No matching skills recorded yet. Update your profile skills to view direct matches.
                  </div>
                )}

                {onEditSkills && (
                  <div className="pt-2">
                    <SecondaryButton
                      onClick={onEditSkills}
                      className="w-full text-xs !py-2 justify-center"
                    >
                      Update Profile Skills
                    </SecondaryButton>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* INDUSTRY BENCHMARK & TOOLS VIEW */
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Entry-Level Hiring Standard
                </h4>
                <p className="text-sm font-semibold text-slate-800 leading-relaxed">
                  {analysis.industryBenchmark.entryLevelExpectation}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* In-Demand Tools */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
                    <Wrench className="w-4 h-4 text-blue-600" />
                    <span>In-Demand Tools & Software</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {analysis.industryBenchmark.inDemandTools.map((tool, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 text-xs font-bold"
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Daily Workplace Tasks */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
                    <Layers className="w-4 h-4 text-indigo-600" />
                    <span>Typical Daily Job Responsibilities</span>
                  </div>
                  <ul className="space-y-1.5 pt-1">
                    {analysis.industryBenchmark.typicalDailyTasks.map((task, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 text-xs text-slate-600"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                        <span>{task}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};

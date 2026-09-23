import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  IndianRupee,
  TrendingUp,
  MapPin,
  Briefcase,
  Sparkles,
  RefreshCw,
  Award,
  HelpCircle,
  Lightbulb,
  Building2,
  ChevronRight,
  ArrowUpRight,
  CheckCircle2,
  SlidersHorizontal,
} from 'lucide-react';
import { CareerProfile, SalaryBenchmarkResult } from '../../types';
import { DashboardCard } from '../common/DashboardCard';
import { PrimaryButton } from '../common/PrimaryButton';
import {
  fetchSalaryBenchmark,
  POPULAR_INDIAN_CITIES,
  POPULAR_EXPERIENCE_LEVELS,
} from '../../services/salaryBenchmarkService';
import { useToast } from '../../context/ToastContext';

interface SalaryBenchmarkerCardProps {
  profile: CareerProfile | null;
}

export const SalaryBenchmarkerCard: React.FC<SalaryBenchmarkerCardProps> = ({ profile }) => {
  const { showSuccess, showError } = useToast();

  const [selectedCity, setSelectedCity] = useState<string>(
    profile?.preferredCity || 'Bengaluru'
  );
  const [selectedExp, setSelectedExp] = useState<string>(
    profile?.experienceLevel || 'Fresher (0–1 yrs)'
  );
  const [displayUnit, setDisplayUnit] = useState<'monthly' | 'annual'>('monthly');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [benchmark, setBenchmark] = useState<SalaryBenchmarkResult | null>(null);
  const [showCustomControls, setShowCustomControls] = useState<boolean>(false);
  const [customJobInput, setCustomJobInput] = useState<string>(profile?.targetJob || 'Frontend Developer');

  const targetJob = profile?.targetJob || customJobInput || 'Frontend Developer';

  const loadBenchmarkData = async (forceRefresh = false) => {
    setIsLoading(true);
    try {
      const data = await fetchSalaryBenchmark(
        {
          targetJob,
          preferredCity: selectedCity,
          preferredState: profile?.preferredState,
          experienceLevel: selectedExp,
          education: profile?.education,
          skills: profile?.skills,
        },
        forceRefresh
      );
      setBenchmark(data);
      if (forceRefresh) {
        showSuccess('Salary data refreshed', `Updated benchmark estimates for ${targetJob} in ${selectedCity}.`);
      }
    } catch (err: any) {
      console.error(err);
      showError('Could not load salary estimates', 'Please check your connection or retry.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (profile?.preferredCity) {
      setSelectedCity(profile.preferredCity);
    }
    if (profile?.experienceLevel) {
      setSelectedExp(profile.experienceLevel);
    }
    if (profile?.targetJob) {
      setCustomJobInput(profile.targetJob);
    }
  }, [profile]);

  useEffect(() => {
    loadBenchmarkData();
  }, [targetJob, selectedCity, selectedExp]);

  const getDemandColor = (level: string) => {
    switch (level) {
      case 'Very High':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'High':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  return (
    <DashboardCard
      id="salary-benchmarker-card"
      title="INDUSTRY SALARY BENCHMARKER"
      subtitle="AI-estimated market compensation ranges, city differentials & high-paying skill boosters"
      icon={<IndianRupee className="w-5 h-5 text-emerald-600" />}
      badge="Gemini 3.8 Flash"
      className="border-emerald-100 bg-gradient-to-b from-white via-emerald-50/15 to-white shadow-sm"
    >
      <div className="space-y-5">
        {/* Top Controls Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 shadow-2xs text-xs font-semibold text-slate-800">
              <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
              <span>{targetJob}</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 shadow-2xs text-xs font-medium text-slate-700">
              <MapPin className="w-3.5 h-3.5 text-rose-500" />
              <span>{selectedCity}</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 shadow-2xs text-xs font-medium text-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>{selectedExp}</span>
            </div>

            <button
              id="toggle-salary-filters-btn"
              onClick={() => setShowCustomControls(!showCustomControls)}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-indigo-600 hover:bg-indigo-50 border border-transparent hover:border-indigo-100 transition-colors flex items-center gap-1"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{showCustomControls ? 'Hide Filters' : 'Compare Locations / Exp'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2 self-end lg:self-auto">
            {/* Monthly vs Annual CTC Toggle */}
            <div className="inline-flex p-0.5 rounded-lg bg-slate-200/80 text-xs font-semibold">
              <button
                id="salary-unit-monthly-btn"
                onClick={() => setDisplayUnit('monthly')}
                className={`px-3 py-1 rounded-md transition-all ${
                  displayUnit === 'monthly'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ₹ / Month
              </button>
              <button
                id="salary-unit-annual-btn"
                onClick={() => setDisplayUnit('annual')}
                className={`px-3 py-1 rounded-md transition-all ${
                  displayUnit === 'annual'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Annual CTC (LPA)
              </button>
            </div>

            <button
              id="refresh-salary-benchmark-btn"
              onClick={() => loadBenchmarkData(true)}
              disabled={isLoading}
              title="Refresh with fresh AI estimate"
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200/70 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-indigo-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* Expandable Custom Selector Drawer */}
        <AnimatePresence>
          {showCustomControls && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 rounded-xl bg-indigo-50/40 border border-indigo-100 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                      Compare City / Region
                    </label>
                    <select
                      id="salary-city-select"
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      className="w-full text-xs font-medium bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-indigo-500 outline-hidden"
                    >
                      {POPULAR_INDIAN_CITIES.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                      Experience Bracket
                    </label>
                    <select
                      id="salary-exp-select"
                      value={selectedExp}
                      onChange={(e) => setSelectedExp(e.target.value)}
                      className="w-full text-xs font-medium bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-indigo-500 outline-hidden"
                    >
                      {POPULAR_EXPERIENCE_LEVELS.map((exp) => (
                        <option key={exp} value={exp}>
                          {exp}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                      Target Job Title
                    </label>
                    <input
                      id="salary-role-input"
                      type="text"
                      value={customJobInput}
                      onChange={(e) => setCustomJobInput(e.target.value)}
                      placeholder="e.g. Sales Executive, Java Dev"
                      className="w-full text-xs font-medium bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-indigo-500 outline-hidden"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading State */}
        {isLoading && !benchmark && (
          <div className="py-12 flex flex-col items-center justify-center space-y-3">
            <RefreshCw className="w-7 h-7 text-emerald-600 animate-spin" />
            <p className="text-xs sm:text-sm font-semibold text-slate-600">
              Gathering real-time market compensation benchmarks for {targetJob}...
            </p>
          </div>
        )}

        {/* Main Benchmark Display */}
        {benchmark && (
          <div className="space-y-5">
            {/* Primary Highlight Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 text-white shadow-md relative overflow-hidden">
              <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-44 h-44 bg-white/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/20 text-white backdrop-blur-xs border border-white/20">
                      Estimated Market Median
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${getDemandColor(
                        benchmark.marketDemand.level
                      )}`}
                    >
                      {benchmark.marketDemand.level} Demand
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2 mt-1">
                    <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                      {displayUnit === 'monthly'
                        ? benchmark.monthlyRange.formattedMedian
                        : `${benchmark.annualLpaRange.median} LPA`}
                    </h3>
                    <span className="text-sm font-medium text-emerald-100">
                      {displayUnit === 'monthly' ? '/ month (in-hand/gross)' : 'Annual CTC Package'}
                    </span>
                  </div>

                  <p className="text-xs text-emerald-100/90 mt-1 max-w-xl">
                    Expected spread: {displayUnit === 'monthly' ? `${benchmark.monthlyRange.formattedMin} to ${benchmark.monthlyRange.formattedMax}` : benchmark.annualLpaRange.formatted} based on candidate skills & interview performance in {benchmark.location}.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0 bg-white/10 p-3.5 rounded-xl border border-white/15 backdrop-blur-xs text-xs">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-emerald-100/80">25th Percentile:</span>
                    <strong className="font-bold">
                      {displayUnit === 'monthly' ? benchmark.monthlyRange.formattedMin : `${benchmark.annualLpaRange.min} LPA`}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-emerald-100/80">90th Percentile:</span>
                    <strong className="font-bold text-amber-300">
                      {displayUnit === 'monthly' ? benchmark.monthlyRange.formattedMax : `${benchmark.annualLpaRange.max} LPA`}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Progress Visual Bar */}
              <div className="mt-5 pt-4 border-t border-white/15">
                <div className="flex justify-between text-[11px] text-emerald-100/90 mb-1.5 font-medium">
                  <span>Entry Range</span>
                  <span className="font-bold text-white">Market Average</span>
                  <span>Top 10% Bracket</span>
                </div>
                <div className="h-2.5 w-full bg-white/20 rounded-full overflow-hidden flex">
                  <div className="h-full bg-emerald-300 w-1/3 border-r border-white/30" />
                  <div className="h-full bg-emerald-400 w-1/3 border-r border-white/30" />
                  <div className="h-full bg-amber-400 w-1/3" />
                </div>
              </div>
            </div>

            {/* Three Percentile Breakdown Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {benchmark.percentileTiers.map((tier, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border transition-all ${
                    idx === 1
                      ? 'bg-emerald-50/40 border-emerald-200 shadow-2xs'
                      : idx === 2
                      ? 'bg-amber-50/40 border-amber-200'
                      : 'bg-slate-50/70 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                      {tier.tier}
                    </span>
                    {idx === 2 && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-amber-100 text-amber-800">
                        Top Bracket
                      </span>
                    )}
                  </div>
                  <div className="text-base font-extrabold text-slate-900 mb-1.5">
                    {tier.amount}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {tier.description}
                  </p>
                </div>
              ))}
            </div>

            {/* High-Impact Salary Boosters */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-indigo-600" />
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Top High-Impact Salary Boosters (+15% to +35% Potential)
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {benchmark.topSalaryBoosters.map((booster, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs hover:border-indigo-200 transition-colors flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-xs font-bold text-slate-800 line-clamp-1">
                          {booster.skillOrFactor}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-100 shrink-0">
                          {booster.potentialIncrease}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed mt-1">
                        {booster.tip}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Location Differential & Negotiation Tips in 2-Column Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Location Comparison */}
              <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 space-y-3">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-slate-700" />
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Location Comparison Benchmarks
                  </h4>
                </div>

                <div className="space-y-2">
                  {benchmark.locationComparison.map((loc, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200/70 text-xs"
                    >
                      <span className="font-semibold text-slate-800">{loc.city}</span>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-slate-900">{loc.medianMonthly}</span>
                        <span className="text-[11px] font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                          {loc.diffPercentage}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fresher & Candidate Negotiation Tactics */}
              <div className="p-4 rounded-xl bg-indigo-50/30 border border-indigo-100 space-y-3">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-indigo-600" />
                  <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wider">
                    Smart Salary Negotiation Tactics
                  </h4>
                </div>

                <div className="space-y-2">
                  {benchmark.negotiationTips.map((tip, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="leading-snug">{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardCard>
  );
};

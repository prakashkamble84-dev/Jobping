import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import {
  TrendingUp,
  Calendar,
  CheckCircle2,
  Clock,
  Flame,
  Award,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { DailyCheckIn, StreakStats } from '../../types';
import { DashboardCard } from '../common/DashboardCard';

interface WeeklyGoalTrendsCardProps {
  stats: StreakStats;
  checkIn: DailyCheckIn | null;
}

interface ChartDayData {
  day: string;
  fullDate: string;
  completed: number; // 1 for complete, 0.3 for pending, 0 for missed
  status: 'completed' | 'today-pending' | 'missed' | 'future';
  label: string;
  isToday: boolean;
  scoreEarned: number;
}

export const WeeklyGoalTrendsCard: React.FC<WeeklyGoalTrendsCardProps> = ({ stats, checkIn }) => {
  // Transform weeklyDays from stats into recharts friendly data
  const chartData: ChartDayData[] = useMemo(() => {
    return stats.weeklyDays.map((item) => {
      const isCompleted = item.status === 'completed';
      const isPending = item.status === 'today-pending';

      return {
        day: item.dayName,
        fullDate: item.dateString,
        completed: isCompleted ? 100 : isPending ? 35 : 8,
        status: item.status,
        label: isCompleted
          ? 'Goal Completed'
          : isPending
          ? 'Pending Today'
          : 'Goal Missed',
        isToday: item.isToday,
        scoreEarned: isCompleted ? 5 : 0,
      };
    });
  }, [stats.weeklyDays]);

  const completedCount = useMemo(() => {
    return stats.weeklyDays.filter((d) => d.status === 'completed').length;
  }, [stats.weeklyDays]);

  const completionPercentage = Math.round((completedCount / 7) * 100);

  const getConsistencyTier = (pct: number) => {
    if (pct >= 85) return { title: 'High Consistency', color: 'text-emerald-700 bg-emerald-50 border-emerald-200', desc: 'Outstanding habit discipline! You are in the top 10% of consistent learners.' };
    if (pct >= 55) return { title: 'Steady Momentum', color: 'text-blue-700 bg-blue-50 border-blue-200', desc: 'Solid consistency. Completing 1-2 more goals this week will unlock master tier.' };
    if (pct >= 25) return { title: 'Building Habit', color: 'text-amber-700 bg-amber-50 border-amber-200', desc: 'You are on track. Daily 15-minute check-ins build long-term career readiness.' };
    return { title: 'Getting Started', color: 'text-slate-700 bg-slate-50 border-slate-200', desc: 'Set and log a simple daily goal today to ignite your weekly streak!' };
  };

  const consistencyTier = getConsistencyTier(completionPercentage);

  // Custom Tooltip component
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data: ChartDayData = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs space-y-1 z-50">
          <div className="flex items-center justify-between gap-3">
            <span className="font-bold text-slate-200">{data.day} ({data.fullDate})</span>
            {data.isToday && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-500 text-white">
                Today
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 font-medium">
            {data.status === 'completed' ? (
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Goal Completed (+5 pts)
              </span>
            ) : data.status === 'today-pending' ? (
              <span className="text-amber-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> In Progress / Pending Check-In
              </span>
            ) : (
              <span className="text-slate-400 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> No Goal Logged
              </span>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <DashboardCard
      id="weekly-goal-trends-card"
      title="WEEKLY GOAL TRENDS & HABIT TRACKER"
      subtitle="Visual consistency of daily career-building goals across the past 7 days"
      icon={<TrendingUp className="w-5 h-5 text-indigo-600" />}
      badge="Past 7 Days"
      className="border-slate-200 bg-white shadow-sm"
    >
      <div className="space-y-5">
        {/* Top Summary Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">Weekly Goals</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="text-xl font-extrabold text-slate-900">
              {completedCount} <span className="text-xs font-semibold text-slate-500">/ 7 Days</span>
            </div>
            <div className="text-[11px] text-emerald-600 font-medium mt-0.5">
              {completionPercentage}% consistency
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">Active Streak</span>
              <Flame className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <div className="text-xl font-extrabold text-slate-900">
              {stats.currentStreak} <span className="text-xs font-semibold text-slate-500">Days</span>
            </div>
            <div className="text-[11px] text-slate-500 font-medium mt-0.5">
              Best: {stats.bestStreak} days
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">Readiness Points</span>
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            </div>
            <div className="text-xl font-extrabold text-indigo-600">
              +{completedCount * 5} <span className="text-xs font-semibold text-slate-500">pts</span>
            </div>
            <div className="text-[11px] text-slate-500 font-medium mt-0.5">
              Earned this week
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">Habit Status</span>
              <Award className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <div className="text-sm font-extrabold text-slate-900 truncate">
              {consistencyTier.title}
            </div>
            <div className="text-[11px] text-slate-500 font-medium mt-0.5">
              {stats.nextMilestone.daysRemaining} days to milestone
            </div>
          </div>
        </div>

        {/* Bar Chart Section */}
        <div className="p-4 sm:p-5 rounded-xl bg-slate-50/60 border border-slate-200/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Daily Goal Execution
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${consistencyTier.color}`}>
                {consistencyTier.title}
              </span>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-3 text-[11px] font-medium text-slate-600">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-emerald-600" />
                <span>Completed</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-amber-400" />
                <span>Today (Pending)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-slate-300" />
                <span>Missed</span>
              </div>
            </div>
          </div>

          {/* Simple Recharts Bar Chart */}
          <div className="h-44 w-full" id="weekly-goal-bar-chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                />
                <YAxis
                  domain={[0, 100]}
                  ticks={[0, 50, 100]}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => (val === 100 ? 'Done' : val === 0 ? '0' : '')}
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99, 102, 241, 0.06)' }} />
                <Bar dataKey="completed" radius={[6, 6, 2, 2]} maxBarSize={38}>
                  {chartData.map((entry, index) => {
                    let fillColor = '#cbd5e1'; // Missed
                    if (entry.status === 'completed') {
                      fillColor = entry.isToday ? '#059669' : '#10b981'; // Emerald
                    } else if (entry.status === 'today-pending') {
                      fillColor = '#f59e0b'; // Amber
                    }
                    return (
                      <Cell
                        key={`cell-${index}`}
                        fill={fillColor}
                        className="transition-all duration-300 hover:opacity-85 cursor-pointer"
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600">
            <p className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span>{consistencyTier.desc}</span>
            </p>
            {checkIn?.goal && (
              <span className="text-[11px] text-slate-500 font-medium shrink-0">
                Today’s Goal: <strong className="text-slate-800 font-semibold">{checkIn.goal.length > 30 ? checkIn.goal.substring(0, 28) + '...' : checkIn.goal}</strong>
              </span>
            )}
          </div>
        </div>
      </div>
    </DashboardCard>
  );
};

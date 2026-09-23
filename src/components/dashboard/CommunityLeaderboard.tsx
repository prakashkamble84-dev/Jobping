import React, { useState } from 'react';
import { User, CareerProfile, ScoreBreakdown, LeaderboardEntry } from '../../types';
import { getLeaderboardData } from '../../services/leaderboardService';
import {
  Trophy,
  Medal,
  Flame,
  Award,
  TrendingUp,
  ArrowUp,
  ArrowDown,
  Minus,
  Users,
  Target,
  Sparkles,
  Zap,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';

interface CommunityLeaderboardProps {
  user: User;
  profile: CareerProfile | null;
  score: ScoreBreakdown;
  onTakeMockInterview?: () => void;
  id?: string;
  className?: string;
}

export const CommunityLeaderboard: React.FC<CommunityLeaderboardProps> = ({
  user,
  profile,
  score,
  onTakeMockInterview,
  id = 'community-leaderboard-section',
  className = '',
}) => {
  const [filter, setFilter] = useState<'all' | 'same_role' | 'tier'>('all');
  const [showBoostModal, setShowBoostModal] = useState<boolean>(false);

  const { entries, currentUserRank, totalParticipants, topPercentile } =
    getLeaderboardData(user, profile, score, filter);

  const topThree = entries.slice(0, 3);
  const remainingEntries = entries.slice(3);

  const getTierBadge = (tier: LeaderboardEntry['tier']) => {
    switch (tier) {
      case 'Elite (90+)':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Champion (80+)':
        return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'Pro (70+)':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <span className="w-7 h-7 rounded-full bg-amber-100 text-amber-600 border border-amber-300 font-extrabold flex items-center justify-center text-xs shadow-2xs">
          🥇 1
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 border border-slate-300 font-extrabold flex items-center justify-center text-xs shadow-2xs">
          🥈 2
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="w-7 h-7 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-extrabold flex items-center justify-center text-xs shadow-2xs">
          🥉 3
        </span>
      );
    }
    return (
      <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center text-xs">
        #{rank}
      </span>
    );
  };

  return (
    <div
      id={id}
      className={`rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 shadow-xs space-y-6 ${className}`}
    >
      {/* Header & Filter Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-amber-100 text-amber-700">
              <Trophy className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Peer Benchmarking & Motivation
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Community Readiness Leaderboard
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Rankings reflect JobReady readiness scores, active learning streaks, and completed skill assessments.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl self-start md:self-auto text-xs font-semibold">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Peers
          </button>
          <button
            type="button"
            onClick={() => setFilter('same_role')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              filter === 'same_role'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            My Target Role
          </button>
          <button
            type="button"
            onClick={() => setFilter('tier')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              filter === 'tier'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            My Tier
          </button>
        </div>
      </div>

      {/* User Standing Motivation Banner */}
      <div className="rounded-xl p-4 sm:p-5 bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/30 border border-indigo-400/40 flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-200">
                  Your Current Standing
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-500/40 text-indigo-100 border border-indigo-400/30">
                  Top {topPercentile}% Peer Rank
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mt-0.5">
                Rank #{currentUserRank} of {totalParticipants.toLocaleString()} candidates
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right sm:text-left pr-3 border-r border-indigo-700/60">
              <span className="block text-[11px] text-indigo-300 font-medium">Readiness Score</span>
              <span className="text-xl font-extrabold text-white">{score.overallScore}/100</span>
            </div>
            {onTakeMockInterview && (
              <button
                type="button"
                onClick={onTakeMockInterview}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                <span>Boost My Rank</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Top 3 Podium Highlights (Visible when in "All" or when 3+ entries available) */}
      {topThree.length >= 3 && filter === 'all' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
          {/* Silver - Rank 2 */}
          <div className="order-2 sm:order-1 rounded-xl p-4 bg-slate-50 border border-slate-200 flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-2.5 left-2.5 text-xs font-extrabold text-slate-400">#2</div>
            <div className="w-11 h-11 rounded-full bg-slate-200 border-2 border-slate-300 text-slate-800 flex items-center justify-center font-bold text-sm shadow-2xs mb-2">
              🥈
            </div>
            <h4 className="font-bold text-slate-900 text-sm truncate max-w-full">
              {topThree[1].name}
            </h4>
            <p className="text-[11px] text-slate-500 truncate max-w-full mt-0.5">
              {topThree[1].targetRole}
            </p>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs font-black text-slate-800 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
                {topThree[1].readinessScore} pts
              </span>
              <span className="inline-flex items-center text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-lg border border-orange-200">
                <Flame className="w-3 h-3 mr-0.5 fill-orange-500" />
                {topThree[1].streakDays}d
              </span>
            </div>
          </div>

          {/* Gold - Rank 1 (Tallest / Prominent) */}
          <div className="order-1 sm:order-2 rounded-xl p-4 bg-gradient-to-b from-amber-50/80 to-amber-100/30 border-2 border-amber-300 flex flex-col items-center text-center relative shadow-xs">
            <div className="absolute -top-3 px-2.5 py-0.5 rounded-full bg-amber-400 text-amber-950 font-extrabold text-[10px] shadow-2xs">
              LEADER
            </div>
            <div className="w-13 h-13 rounded-full bg-amber-400 border-2 border-amber-500 text-amber-950 flex items-center justify-center font-bold text-base shadow-sm mb-2 mt-1">
              👑
            </div>
            <h4 className="font-extrabold text-slate-900 text-sm truncate max-w-full">
              {topThree[0].name}
            </h4>
            <p className="text-[11px] text-amber-800 font-medium truncate max-w-full mt-0.5">
              {topThree[0].targetRole}
            </p>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs font-black text-amber-900 bg-white px-2.5 py-1 rounded-lg border border-amber-300 shadow-2xs">
                {topThree[0].readinessScore} pts
              </span>
              <span className="inline-flex items-center text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-lg border border-orange-200">
                <Flame className="w-3 h-3 mr-0.5 fill-orange-500" />
                {topThree[0].streakDays}d
              </span>
            </div>
          </div>

          {/* Bronze - Rank 3 */}
          <div className="order-3 sm:order-3 rounded-xl p-4 bg-slate-50 border border-slate-200 flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-2.5 left-2.5 text-xs font-extrabold text-slate-400">#3</div>
            <div className="w-11 h-11 rounded-full bg-amber-100 border-2 border-amber-200 text-amber-900 flex items-center justify-center font-bold text-sm shadow-2xs mb-2">
              🥉
            </div>
            <h4 className="font-bold text-slate-900 text-sm truncate max-w-full">
              {topThree[2].name}
            </h4>
            <p className="text-[11px] text-slate-500 truncate max-w-full mt-0.5">
              {topThree[2].targetRole}
            </p>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs font-black text-slate-800 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
                {topThree[2].readinessScore} pts
              </span>
              <span className="inline-flex items-center text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-lg border border-orange-200">
                <Flame className="w-3 h-3 mr-0.5 fill-orange-500" />
                {topThree[2].streakDays}d
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 font-bold uppercase tracking-wider text-[10px]">
              <th className="py-3 px-3.5 text-center w-14">Rank</th>
              <th className="py-3 px-4">Candidate</th>
              <th className="py-3 px-4 hidden md:table-cell">Target Role</th>
              <th className="py-3 px-3 text-center">Streak</th>
              <th className="py-3 px-3 text-center hidden sm:table-cell">Tier</th>
              <th className="py-3 px-4 text-right">Readiness</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {entries.map((entry) => {
              const isMe = entry.isCurrentUser;
              return (
                <tr
                  key={entry.id}
                  className={`transition-colors ${
                    isMe
                      ? 'bg-indigo-50/80 hover:bg-indigo-50 font-semibold border-l-4 border-l-indigo-600'
                      : 'hover:bg-slate-50/80 text-slate-700'
                  }`}
                >
                  {/* Rank */}
                  <td className="py-3 px-3.5 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {getRankBadge(entry.rank)}
                    </div>
                  </td>

                  {/* Candidate Name & Info */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0 ${entry.avatarColor}`}
                      >
                        {entry.name.slice(0, 1)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`truncate ${
                              isMe ? 'text-indigo-950 font-bold' : 'text-slate-900 font-semibold'
                            }`}
                          >
                            {entry.name}
                          </span>
                          {isMe && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-indigo-600 text-white tracking-wider uppercase">
                              YOU
                            </span>
                          )}
                        </div>
                        <span className="block text-[10px] text-slate-400 truncate">
                          {entry.collegeOrLocation}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Target Role */}
                  <td className="py-3 px-4 hidden md:table-cell">
                    <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium truncate max-w-[180px]">
                      {entry.targetRole}
                    </span>
                  </td>

                  {/* Streak */}
                  <td className="py-3 px-3 text-center">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
                      <Flame className="w-3 h-3 fill-orange-500 text-orange-500" />
                      {entry.streakDays}d
                    </span>
                  </td>

                  {/* Tier */}
                  <td className="py-3 px-3 text-center hidden sm:table-cell">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${getTierBadge(
                        entry.tier
                      )}`}
                    >
                      {entry.tier.split('(')[0].trim()}
                    </span>
                  </td>

                  {/* Readiness Score */}
                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex items-baseline gap-1">
                      <span
                        className={`text-sm font-extrabold ${
                          isMe ? 'text-indigo-700' : 'text-slate-900'
                        }`}
                      >
                        {entry.readinessScore}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold">/100</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Gamification Tips on how to gain rank */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
        <div className="flex items-center gap-2 font-bold text-slate-800 mb-2">
          <Zap className="w-4 h-4 text-amber-500" />
          <span>How to climb the Community Leaderboard:</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
            <span>
              <strong>+10 pts:</strong> Complete a simulated AI Mock Interview with high readiness score.
            </span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
            <span>
              <strong>+5 pts:</strong> Check off daily learning goals to preserve your streak.
            </span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
            <span>
              <strong>+5 pts:</strong> Add verified technical & workplace skills to your profile.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

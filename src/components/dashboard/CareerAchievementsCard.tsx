import React, { useState } from 'react';
import { AchievementBadge } from '../../types';
import { Modal } from '../common/Modal';
import { PrimaryButton } from '../common/PrimaryButton';
import { ProgressBar } from '../common/ProgressBar';
import {
  Award,
  UserCheck,
  Layers,
  Compass,
  Globe,
  Target,
  Cpu,
  TrendingUp,
  Crown,
  Lock,
  Sparkles,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';

interface CareerAchievementsCardProps {
  achievements: AchievementBadge[];
  onTakeAction?: () => void;
  id?: string;
  className?: string;
}

export const CareerAchievementsCard: React.FC<CareerAchievementsCardProps> = ({
  achievements,
  onTakeAction,
  id = 'career-achievements-card',
  className = '',
}) => {
  const [selectedBadge, setSelectedBadge] = useState<AchievementBadge | null>(null);
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');

  const unlockedCount = achievements.filter((a) => a.isUnlocked).length;
  const totalCount = achievements.length;
  const completionRatio = Math.round((unlockedCount / totalCount) * 100);

  const filteredAchievements = achievements.filter((badge) => {
    if (filter === 'unlocked') return badge.isUnlocked;
    if (filter === 'locked') return !badge.isUnlocked;
    return true;
  });

  const getBadgeIcon = (iconName: string, isUnlocked: boolean, tier: AchievementBadge['tier']) => {
    const iconProps = { className: 'w-5 h-5' };
    let iconElement = <Award {...iconProps} />;

    switch (iconName) {
      case 'UserCheck':
        iconElement = <UserCheck {...iconProps} />;
        break;
      case 'Layers':
        iconElement = <Layers {...iconProps} />;
        break;
      case 'Compass':
        iconElement = <Compass {...iconProps} />;
        break;
      case 'Globe':
        iconElement = <Globe {...iconProps} />;
        break;
      case 'Target':
        iconElement = <Target {...iconProps} />;
        break;
      case 'Cpu':
        iconElement = <Cpu {...iconProps} />;
        break;
      case 'TrendingUp':
        iconElement = <TrendingUp {...iconProps} />;
        break;
      case 'Award':
        iconElement = <Award {...iconProps} />;
        break;
      case 'Crown':
        iconElement = <Crown {...iconProps} />;
        break;
      default:
        iconElement = <Award {...iconProps} />;
    }

    if (!isUnlocked) {
      return (
        <div className="w-11 h-11 rounded-2xl bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center relative">
          {iconElement}
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-slate-300 rounded-full flex items-center justify-center text-slate-700">
            <Lock className="w-2.5 h-2.5" />
          </div>
        </div>
      );
    }

    const tierClasses = {
      bronze: 'bg-amber-100 text-amber-800 border-amber-300 ring-2 ring-amber-400/20',
      silver: 'bg-slate-100 text-slate-800 border-slate-300 ring-2 ring-slate-400/20',
      gold: 'bg-yellow-100 text-yellow-900 border-yellow-300 ring-2 ring-yellow-400/30',
      platinum: 'bg-indigo-100 text-indigo-900 border-indigo-300 ring-2 ring-indigo-400/30',
    };

    return (
      <div
        className={`w-11 h-11 rounded-2xl border flex items-center justify-center shadow-xs transition-transform group-hover:scale-105 ${tierClasses[tier]}`}
      >
        {iconElement}
      </div>
    );
  };

  const getTierBadge = (tier: AchievementBadge['tier']) => {
    const tierConfig = {
      bronze: { bg: 'bg-amber-100 text-amber-900', label: 'Bronze' },
      silver: { bg: 'bg-slate-200 text-slate-800', label: 'Silver' },
      gold: { bg: 'bg-yellow-100 text-yellow-900', label: 'Gold' },
      platinum: { bg: 'bg-indigo-100 text-indigo-900', label: 'Platinum' },
    };
    const c = tierConfig[tier];
    return (
      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${c.bg}`}>
        {c.label}
      </span>
    );
  };

  return (
    <div
      id={id}
      className={`rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs ${className}`}
    >
      {/* Header section with count and progress */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
              <Award className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Career Achievements
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Unlock virtual milestone badges as you enhance your profile and readiness score.
          </p>
        </div>

        <div className="flex flex-col items-start sm:items-end min-w-[160px]">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
            <span className="text-amber-600 font-extrabold text-sm">{unlockedCount}</span>
            <span className="text-slate-400">/</span>
            <span>{totalCount} Badges Unlocked</span>
          </div>
          <ProgressBar
            value={completionRatio}
            showPercentage={false}
            size="sm"
            color="amber"
            className="w-full sm:w-36 mt-1.5"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 my-4">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
            filter === 'all'
              ? 'bg-slate-900 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          All ({totalCount})
        </button>
        <button
          type="button"
          onClick={() => setFilter('unlocked')}
          className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
            filter === 'unlocked'
              ? 'bg-emerald-600 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Unlocked ({unlockedCount})
        </button>
        <button
          type="button"
          onClick={() => setFilter('locked')}
          className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
            filter === 'locked'
              ? 'bg-slate-700 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          In Progress ({totalCount - unlockedCount})
        </button>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredAchievements.map((badge) => (
          <div
            key={badge.id}
            onClick={() => setSelectedBadge(badge)}
            className={`group p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 relative overflow-hidden ${
              badge.isUnlocked
                ? 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
                : 'border-slate-200/80 bg-slate-50/50 hover:bg-slate-100/60'
            }`}
          >
            {getBadgeIcon(badge.iconName, badge.isUnlocked, badge.tier)}

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1 mb-0.5">
                <h4 className="text-xs font-bold text-slate-900 truncate">
                  {badge.title}
                </h4>
                {getTierBadge(badge.tier)}
              </div>

              <p className="text-[11px] text-slate-500 line-clamp-1 leading-snug">
                {badge.description}
              </p>

              {badge.isUnlocked ? (
                <div className="flex items-center gap-1 mt-1.5 text-[10px] font-bold text-emerald-700">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Unlocked</span>
                </div>
              ) : (
                <div className="mt-1.5">
                  <div className="flex justify-between text-[10px] font-semibold text-slate-500 mb-0.5">
                    <span>Progress</span>
                    <span>{badge.progressPercent}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${badge.progressPercent}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Badge Detail Modal */}
      <Modal
        isOpen={Boolean(selectedBadge)}
        onClose={() => setSelectedBadge(null)}
        maxWidth="sm"
        title="Achievement Details"
      >
        {selectedBadge && (
          <div className="space-y-4 text-center">
            <div className="flex justify-center pt-2">
              {getBadgeIcon(selectedBadge.iconName, selectedBadge.isUnlocked, selectedBadge.tier)}
            </div>

            <div>
              <div className="flex items-center justify-center gap-2 mb-1">
                <h3 className="text-lg font-black text-slate-900">{selectedBadge.title}</h3>
                {getTierBadge(selectedBadge.tier)}
              </div>
              <p className="text-xs text-slate-600">{selectedBadge.description}</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-left space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Unlock Requirement
              </div>
              <p className="text-xs font-semibold text-slate-800">
                {selectedBadge.requirement}
              </p>

              <div className="pt-2">
                <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                  <span>Current Progress</span>
                  <span>{selectedBadge.progressPercent}%</span>
                </div>
                <ProgressBar
                  value={selectedBadge.progressPercent}
                  showPercentage={false}
                  size="sm"
                  color={selectedBadge.isUnlocked ? 'emerald' : 'amber'}
                />
              </div>
            </div>

            {selectedBadge.isUnlocked ? (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>You have unlocked this career badge!</span>
              </div>
            ) : (
              <PrimaryButton
                onClick={() => {
                  setSelectedBadge(null);
                  if (onTakeAction) onTakeAction();
                }}
                className="w-full text-xs !py-2.5"
                icon={<ChevronRight className="w-4 h-4" />}
              >
                Update Profile to Unlock
              </PrimaryButton>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

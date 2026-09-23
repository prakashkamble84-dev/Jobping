import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  HardDrive,
  CheckCircle2,
  Bookmark,
  UserCheck,
  Target,
  Clock,
  Sparkles,
  RefreshCw,
  X,
  ExternalLink,
  Briefcase,
  Award,
  Zap,
} from 'lucide-react';
import { OfflineAppSnapshot, getOfflineSnapshot, saveOfflineSnapshot } from '../../services/offlineCacheService';
import { CareerProfile, ScoreBreakdown, DailyCheckIn, StreakStats, ResourceItem } from '../../types';
import { PrimaryButton } from '../common/PrimaryButton';
import { SecondaryButton } from '../common/SecondaryButton';
import { useToast } from '../../context/ToastContext';

interface OfflineCacheViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  profile: CareerProfile | null;
  score: number;
  scoreBreakdown: ScoreBreakdown | null;
  checkIn: DailyCheckIn | null;
}

export const OfflineCacheViewerModal: React.FC<OfflineCacheViewerModalProps> = ({
  isOpen,
  onClose,
  userId,
  profile,
  score,
  scoreBreakdown,
  checkIn,
}) => {
  const { showSuccess } = useToast();
  const [snapshot, setSnapshot] = useState<OfflineAppSnapshot | null>(() =>
    getOfflineSnapshot(userId)
  );
  const [activeTab, setActiveTab] = useState<'overview' | 'resources' | 'profile' | 'score'>('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSnapshot(getOfflineSnapshot(userId));
    }
  }, [isOpen, userId]);

  if (!isOpen) return null;

  const handleManualSync = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      const fresh = saveOfflineSnapshot(userId, profile, score, scoreBreakdown, checkIn);
      setSnapshot(fresh);
      setIsRefreshing(false);
      showSuccess('Offline Cache Refreshed!', 'Your latest scores, profile, and saved resources are stored for offline use.');
    }, 400);
  };

  const cachedProfile = snapshot?.profile || profile;
  const cachedScore = snapshot?.score ?? score;
  const cachedBreakdown = snapshot?.scoreBreakdown || scoreBreakdown;
  const cachedResources = snapshot?.bookmarkedResources || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] flex flex-col"
        id="offline-cache-modal"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Offline Cache & Service Worker Vault
              </h3>
              <p className="text-xs text-slate-500">
                Data cached locally on your device for low-connectivity & offline readiness
              </p>
            </div>
          </div>
          <button
            id="close-offline-modal-btn"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sync Status Banner */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs shrink-0">
          <div className="flex items-center gap-2 text-slate-700">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>
              Last Offline Snapshot:{' '}
              <strong className="text-slate-900">
                {snapshot?.lastSyncedAt
                  ? new Date(snapshot.lastSyncedAt).toLocaleString()
                  : 'Not yet recorded'}
              </strong>
            </span>
          </div>

          <button
            id="manual-refresh-cache-btn"
            onClick={handleManualSync}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-slate-300 font-bold text-slate-800 hover:bg-slate-50 transition shadow-2xs cursor-pointer text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-indigo-600 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Syncing...' : 'Sync Latest Now'}</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 border-b border-slate-200 shrink-0 overflow-x-auto pb-1">
          {[
            { id: 'overview', label: 'Vault Overview', icon: <Zap className="w-3.5 h-3.5" /> },
            { id: 'score', label: `Readiness Score (${cachedScore})`, icon: <Award className="w-3.5 h-3.5" /> },
            { id: 'profile', label: 'Cached Profile', icon: <UserCheck className="w-3.5 h-3.5" /> },
            { id: 'resources', label: `Saved Resources (${cachedResources.length})`, icon: <Bookmark className="w-3.5 h-3.5" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              id={`offline-tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4 text-xs">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                  <div className="text-emerald-700 font-bold flex items-center gap-1.5 mb-1">
                    <CheckCircle2 className="w-4 h-4" /> Score Vault
                  </div>
                  <div className="text-lg font-extrabold text-emerald-900">
                    {cachedScore}/100
                  </div>
                  <div className="text-[11px] text-emerald-600 mt-0.5">
                    Breakdown cached
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200">
                  <div className="text-indigo-700 font-bold flex items-center gap-1.5 mb-1">
                    <CheckCircle2 className="w-4 h-4" /> Profile Details
                  </div>
                  <div className="text-sm font-extrabold text-indigo-900 truncate">
                    {cachedProfile?.targetJob || 'Configured'}
                  </div>
                  <div className="text-[11px] text-indigo-600 mt-0.5">
                    {cachedProfile?.skills?.length || 0} skills stored
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-purple-50 border border-purple-200">
                  <div className="text-purple-700 font-bold flex items-center gap-1.5 mb-1">
                    <CheckCircle2 className="w-4 h-4" /> Career Roadmap
                  </div>
                  <div className="text-sm font-extrabold text-purple-900 truncate">
                    Milestone Blueprint
                  </div>
                  <div className="text-[11px] text-purple-600 mt-0.5">
                    Tasks & phases cached
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                  <div className="text-amber-700 font-bold flex items-center gap-1.5 mb-1">
                    <CheckCircle2 className="w-4 h-4" /> Resource Catalog
                  </div>
                  <div className="text-lg font-extrabold text-amber-900">
                    {cachedResources.length} Saved
                  </div>
                  <div className="text-[11px] text-amber-600 mt-0.5">
                    Full catalog offline
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                  How Offline Caching Works in JobReady AI
                </h4>
                <p className="text-slate-600 leading-relaxed">
                  Our Service Worker precaches all application assets, web fonts, and dynamic JavaScript bundles. Every time your readiness score updates or you bookmark a study resource, a local snapshot is saved to high-speed client storage. Even without cell reception or Wi-Fi, you can access your career roadmaps and review preparation metrics.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'score' && (
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 uppercase tracking-wider font-bold">Overall Score</span>
                  <div className="text-2xl font-black text-indigo-600">{cachedScore} / 100</div>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">
                  Cached Offline
                </span>
              </div>

              {cachedBreakdown && (
                <div className="space-y-2">
                  <span className="font-bold text-slate-800">Cached Factor Breakdown</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                      <span className="text-slate-500 text-[11px]">Profile Completeness:</span>
                      <strong className="block text-slate-900 text-sm font-bold">{cachedBreakdown.profileCompletionScore} pts</strong>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                      <span className="text-slate-500 text-[11px]">Skills & Match:</span>
                      <strong className="block text-slate-900 text-sm font-bold">{cachedBreakdown.skillsScore} pts</strong>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                      <span className="text-slate-500 text-[11px]">Career Goal Clarity:</span>
                      <strong className="block text-slate-900 text-sm font-bold">{cachedBreakdown.careerGoalScore} pts</strong>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                      <span className="text-slate-500 text-[11px]">Target Role Alignment:</span>
                      <strong className="block text-slate-900 text-sm font-bold">{cachedBreakdown.targetJobScore} pts</strong>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="space-y-3">
              {cachedProfile ? (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <div>
                      <span className="text-slate-500 text-[11px] block">Target Role</span>
                      <strong className="text-slate-900 font-bold">{cachedProfile.targetJob}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[11px] block">Qualification</span>
                      <strong className="text-slate-900 font-bold">{cachedProfile.education}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[11px] block">Experience</span>
                      <strong className="text-slate-900 font-bold">{cachedProfile.experienceLevel}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[11px] block">Location</span>
                      <strong className="text-slate-900 font-bold">{cachedProfile.preferredCity}, {cachedProfile.preferredState}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[11px] block">Work Mode</span>
                      <strong className="text-slate-900 font-bold">{cachedProfile.workPreference}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[11px] block">Target Salary</span>
                      <strong className="text-slate-900 font-bold">{cachedProfile.salaryMin} - {cachedProfile.salaryMax}</strong>
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-500 text-[11px] block mb-1">Key Skills</span>
                    <div className="flex flex-wrap gap-1.5">
                      {cachedProfile.skills.map((s, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-800 font-semibold text-[11px]">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-slate-500">No profile snapshot stored.</p>
              )}
            </div>
          )}

          {activeTab === 'resources' && (
            <div className="space-y-3">
              {cachedResources.length > 0 ? (
                <div className="space-y-2">
                  {cachedResources.map((res) => (
                    <div key={res.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{res.title}</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800">
                          {res.category}
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px]">{res.description}</p>
                      <div className="flex items-center gap-3 text-[10px] text-slate-500 pt-1">
                        <span>Provider: <strong>{res.provider}</strong></span>
                        <span>Pricing: <strong>{res.pricing}</strong></span>
                        <span>Duration: <strong>{res.estimatedDuration}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-slate-500 space-y-2">
                  <Bookmark className="w-8 h-8 mx-auto text-slate-300" />
                  <p>You haven't bookmarked any resources yet.</p>
                  <p className="text-[11px] text-slate-400">Bookmark items in the Resource Library to access their details offline.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex justify-end shrink-0">
          <SecondaryButton
            id="close-offline-vault-footer-btn"
            onClick={onClose}
            className="text-xs py-2 px-4"
          >
            Close Vault
          </SecondaryButton>
        </div>
      </motion.div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  Wifi,
  WifiOff,
  HardDrive,
  Download,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { DashboardCard } from '../common/DashboardCard';
import { PWAInstallButton } from '../common/PWAInstallButton';
import { PrimaryButton } from '../common/PrimaryButton';
import { SecondaryButton } from '../common/SecondaryButton';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { saveOfflineSnapshot, getLastOfflineSyncTime } from '../../services/offlineCacheService';
import { CareerProfile, ScoreBreakdown, DailyCheckIn } from '../../types';
import { useToast } from '../../context/ToastContext';

interface OfflineReadinessCardProps {
  userId: string;
  profile: CareerProfile | null;
  score: number;
  scoreBreakdown: ScoreBreakdown | null;
  checkIn: DailyCheckIn | null;
  onOpenOfflineVault: () => void;
}

export const OfflineReadinessCard: React.FC<OfflineReadinessCardProps> = ({
  userId,
  profile,
  score,
  scoreBreakdown,
  checkIn,
  onOpenOfflineVault,
}) => {
  const isOnline = useOnlineStatus();
  const { showSuccess } = useToast();
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(getLastOfflineSyncTime);

  const handleSyncNow = () => {
    setIsSyncing(true);
    setTimeout(() => {
      const snapshot = saveOfflineSnapshot(userId, profile, score, scoreBreakdown, checkIn);
      setLastSync(snapshot.lastSyncedAt);
      setIsSyncing(false);
      showSuccess('Offline Vault Updated!', 'Your readiness score, profile, and bookmarks are cached locally.');
    }, 400);
  };

  const formattedSyncTime = lastSync
    ? new Date(lastSync).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'Synced on load';

  return (
    <DashboardCard
      id="offline-readiness-card"
      title="OFFLINE CACHE & PROGRESSIVE WEB APP (PWA)"
      subtitle="Access your readiness score, saved study roadmaps, and profile even with low or no internet"
      icon={<HardDrive className="w-5 h-5 text-indigo-600" />}
      badge={isOnline ? 'Online Synced' : 'Offline Mode'}
      className="border-slate-200 bg-white shadow-sm"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Connection Status Indicator */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0 ${
              isOnline ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700 animate-pulse'
            }`}>
              {isOnline ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                Network Status
              </span>
              <span className={`text-sm font-extrabold ${isOnline ? 'text-emerald-700' : 'text-amber-700'}`}>
                {isOnline ? 'Connected (High Speed)' : 'Offline / Poor Signal'}
              </span>
            </div>
          </div>

          {/* Service Worker Cache Status */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                Offline Snapshot
              </span>
              <span className="text-sm font-extrabold text-slate-900">
                Score & Profile Cached
              </span>
              <span className="text-[10px] text-slate-500 block">
                Last sync: {formattedSyncTime}
              </span>
            </div>
          </div>

          {/* Offline Assets */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                Service Worker Cache
              </span>
              <span className="text-sm font-extrabold text-slate-900">
                Workbox 7+ Active
              </span>
              <span className="text-[10px] text-emerald-600 font-semibold block">
                Ready for offline launch
              </span>
            </div>
          </div>
        </div>

        {/* Action Row */}
        <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-slate-700 space-y-0.5">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Install to Home Screen or Desktop for instant offline access</span>
            </div>
            <p className="text-slate-600 text-[11px]">
              Works like a native application with zero loading lag, background synchronization, and full offline caching.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <PWAInstallButton variant="button" />

            <SecondaryButton
              id="inspect-offline-cache-btn"
              onClick={onOpenOfflineVault}
              className="text-xs py-2 px-3 bg-white hover:bg-slate-50"
            >
              Inspect Cached Vault
            </SecondaryButton>

            <button
              id="sync-offline-cache-btn"
              onClick={handleSyncNow}
              disabled={isSyncing}
              title="Sync latest score and profile to offline cache"
              className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 transition cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 text-indigo-600 ${isSyncing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    </DashboardCard>
  );
};

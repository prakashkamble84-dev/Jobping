import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { WifiOff, Wifi, HardDrive, CheckCircle2, AlertCircle, RefreshCw, X } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { getLastOfflineSyncTime } from '../../services/offlineCacheService';

interface OfflineIndicatorProps {
  onOpenOfflineVault?: () => void;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ onOpenOfflineVault }) => {
  const isOnline = useOnlineStatus();
  const [dismissed, setDismissed] = useState(false);
  const lastSyncTime = getLastOfflineSyncTime();

  const formattedTime = lastSyncTime
    ? new Date(lastSyncTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'Recently';

  if (isOnline) {
    return null;
  }

  if (dismissed) {
    // Render a small floating pill so user still knows they are offline
    return (
      <div
        id="offline-floating-pill"
        onClick={() => setDismissed(false)}
        className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-full bg-amber-600 px-3 py-1.5 text-[11px] font-bold text-white shadow-xl cursor-pointer hover:bg-amber-700 transition"
      >
        <WifiOff className="w-3.5 h-3.5 animate-pulse" />
        <span>Offline Mode Active</span>
      </div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        id="offline-notification-banner"
        className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 rounded-2xl border border-amber-300 bg-slate-900 text-white p-4 shadow-2xl space-y-2.5"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
              <WifiOff className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                  Offline Mode Active
                </h4>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Cached Vault
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                You have a poor or offline connection. Your saved readiness score, profile, and study resources remain accessible from your local service worker cache.
              </p>
            </div>
          </div>

          <button
            id="dismiss-offline-banner-btn"
            onClick={() => setDismissed(true)}
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <HardDrive className="w-3 h-3 text-emerald-400" />
            <span>Last Synced: {formattedTime}</span>
          </span>

          {onOpenOfflineVault && (
            <button
              id="view-offline-vault-btn"
              onClick={onOpenOfflineVault}
              className="font-bold text-amber-400 hover:text-amber-300 underline underline-offset-2 transition cursor-pointer"
            >
              Inspect Offline Data
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

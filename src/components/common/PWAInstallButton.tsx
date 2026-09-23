import React, { useState } from 'react';
import { Download, Smartphone, X, CheckCircle2, Sparkles, Share2 } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'button' | 'compact' | 'banner';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  className = '',
  variant = 'button',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  // If already running as installed standalone app, suppress
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    setIsInstalling(true);
    try {
      await install();
    } finally {
      setIsInstalling(false);
    }
  };

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    if (variant === 'compact') {
      return (
        <button
          id="pwa-install-compact-btn"
          onClick={handleInstallClick}
          disabled={isInstalling}
          title="Install JobReady AI on your device"
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-all cursor-pointer ${className}`}
        >
          <Download className="w-3.5 h-3.5" />
          <span>{isInstalling ? 'Installing...' : 'Install App'}</span>
        </button>
      );
    }

    return (
      <button
        id="pwa-install-main-btn"
        onClick={handleInstallClick}
        disabled={isInstalling}
        className={`flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 transition-all cursor-pointer active:scale-98 ${className}`}
      >
        <Download className="w-4 h-4" />
        <span>{isInstalling ? 'Installing App...' : 'Install App for Offline Access'}</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          id="pwa-install-ios-btn"
          onClick={() => setShowIOSGuide(true)}
          className={`flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs cursor-pointer ${className}`}
        >
          <Smartphone className="w-3.5 h-3.5 text-indigo-600" />
          <span>Install on iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-base font-bold text-slate-900">Install on iPhone / iPad</h3>
                </div>
                <button
                  id="close-ios-pwa-guide-btn"
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-600">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0 text-[10px]">
                    1
                  </span>
                  <div>
                    Tap the <strong>Share</strong> icon in the bottom Safari toolbar (<Share2 className="w-3.5 h-3.5 inline text-indigo-600" />).
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0 text-[10px]">
                    2
                  </span>
                  <div>
                    Scroll down and tap <strong>Add to Home Screen</strong>.
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    Access your readiness scores, saved resources, and profile anytime without network delays.
                  </div>
                </div>
              </div>

              <button
                id="done-ios-pwa-guide-btn"
                onClick={() => setShowIOSGuide(false)}
                className="w-full rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white hover:bg-indigo-700 transition"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};

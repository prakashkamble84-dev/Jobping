import React, { useEffect, useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { ToastItem, ToastType } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import {
  Flame,
  CheckCircle2,
  Info,
  AlertTriangle,
  XCircle,
  X,
  Sparkles,
  ArrowRight,
  Trophy,
} from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div
      aria-live="polite"
      id="jobready-toast-container"
      className="fixed top-4 right-4 z-[9999] flex flex-col gap-2.5 max-w-sm sm:max-w-md w-full pointer-events-none px-3 sm:px-0"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
};

interface ToastCardProps {
  toast: ToastItem;
  onDismiss: () => void;
}

const ToastCard: React.FC<ToastCardProps> = ({ toast, onDismiss }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [progress, setProgress] = useState(100);
  const duration = toast.duration || 5500;
  const onDismissRef = React.useRef(onDismiss);
  onDismissRef.current = onDismiss;

  useEffect(() => {
    if (duration <= 0) return;

    const intervalTime = 50;
    const step = (intervalTime / duration) * 100;

    const timer = setInterval(() => {
      if (!isHovered) {
        setProgress((prev) => {
          const next = prev - step;
          if (next <= 0) {
            clearInterval(timer);
            // Defer dismissal to microtask/next tick so it does not update ToastProvider during ToastCard's state dispatch
            setTimeout(() => {
              onDismissRef.current();
            }, 0);
            return 0;
          }
          return next;
        });
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [duration, isHovered]);

  const getStyleForType = (type: ToastType) => {
    switch (type) {
      case 'celebration':
        return {
          container:
            'bg-slate-900/95 text-white border-amber-400/40 shadow-xl shadow-amber-950/20 ring-1 ring-amber-400/30',
          iconBg: 'bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-xs',
          progressBar: 'bg-gradient-to-r from-amber-400 via-orange-400 to-amber-300',
          icon: Flame,
          badgeBg: 'bg-amber-400/20 text-amber-300 border-amber-400/30',
        };
      case 'success':
        return {
          container:
            'bg-white text-slate-900 border-emerald-200 shadow-lg shadow-slate-900/5 ring-1 ring-emerald-500/10',
          iconBg: 'bg-emerald-100 text-emerald-700',
          progressBar: 'bg-emerald-500',
          icon: CheckCircle2,
          badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        };
      case 'info':
        return {
          container:
            'bg-white text-slate-900 border-blue-200 shadow-lg shadow-slate-900/5 ring-1 ring-blue-500/10',
          iconBg: 'bg-blue-100 text-blue-700',
          progressBar: 'bg-blue-500',
          icon: Info,
          badgeBg: 'bg-blue-100 text-blue-800 border-blue-200',
        };
      case 'warning':
        return {
          container:
            'bg-white text-slate-900 border-amber-200 shadow-lg shadow-slate-900/5 ring-1 ring-amber-500/10',
          iconBg: 'bg-amber-100 text-amber-700',
          progressBar: 'bg-amber-500',
          icon: AlertTriangle,
          badgeBg: 'bg-amber-100 text-amber-800 border-amber-200',
        };
      case 'error':
        return {
          container:
            'bg-white text-slate-900 border-rose-200 shadow-lg shadow-slate-900/5 ring-1 ring-rose-500/10',
          iconBg: 'bg-rose-100 text-rose-700',
          progressBar: 'bg-rose-500',
          icon: XCircle,
          badgeBg: 'bg-rose-100 text-rose-800 border-rose-200',
        };
      default:
        return {
          container: 'bg-white text-slate-900 border-slate-200 shadow-lg',
          iconBg: 'bg-slate-100 text-slate-700',
          progressBar: 'bg-slate-700',
          icon: Sparkles,
          badgeBg: 'bg-slate-100 text-slate-800 border-slate-200',
        };
    }
  };

  const style = getStyleForType(toast.type);
  const Icon = style.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -15, scale: 0.92, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`pointer-events-auto relative overflow-hidden rounded-2xl border backdrop-blur-md p-4 transition-all ${style.container}`}
    >
      {/* Decorative Celebration Confetti Sparkles Background */}
      {toast.type === 'celebration' && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-25">
          <div className="absolute -top-4 -right-4 w-20 h-20 bg-amber-500 rounded-full blur-xl" />
          <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-orange-500 rounded-full blur-xl" />
        </div>
      )}

      <div className="relative flex items-start gap-3">
        {/* Left Icon Pill */}
        <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${style.iconBg}`}>
          {toast.type === 'celebration' ? (
            <Flame className="w-5 h-5 fill-white text-white animate-pulse" />
          ) : (
            <Icon className="w-5 h-5" />
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 min-w-0 pr-6">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <h4
              className={`text-sm font-extrabold tracking-tight ${
                toast.type === 'celebration' ? 'text-amber-300' : 'text-slate-900'
              }`}
            >
              {toast.title}
            </h4>

            {toast.badge && (
              <span
                className={`inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${style.badgeBg}`}
              >
                {toast.type === 'celebration' && <Trophy className="w-3 h-3 text-amber-300" />}
                {toast.badge}
              </span>
            )}
          </div>

          {toast.message && (
            <p
              className={`text-xs leading-relaxed mt-1 ${
                toast.type === 'celebration' ? 'text-slate-200' : 'text-slate-600'
              }`}
            >
              {toast.message}
            </p>
          )}

          {/* Action button if provided */}
          {toast.action && (
            <div className="mt-2.5">
              <button
                type="button"
                onClick={() => {
                  toast.action?.onClick();
                  onDismiss();
                }}
                className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  toast.type === 'celebration'
                    ? 'bg-amber-400 text-slate-950 hover:bg-amber-300 shadow-2xs'
                    : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}
              >
                <span>{toast.action.label}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Close notification"
          className={`absolute top-0 right-0 p-1 rounded-lg transition-colors cursor-pointer ${
            toast.type === 'celebration'
              ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
          }`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Animated Countdown Progress Bar */}
      {duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10">
          <div
            className={`h-full transition-all duration-75 ease-linear ${style.progressBar}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </motion.div>
  );
};

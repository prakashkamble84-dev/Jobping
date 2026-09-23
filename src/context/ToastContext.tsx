import React, { createContext, useContext, useState, useCallback } from 'react';
import { ToastItem, ToastType } from '../types';

interface ToastContextType {
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, 'id'>) => string;
  removeToast: (id: string) => void;
  showGoalCompletionCelebration: (goalTitle: string, streakDays: number, onAction?: () => void) => void;
  showSuccess: (title: string, message?: string) => void;
  showInfo: (title: string, message?: string) => void;
  showError: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (toast: Omit<ToastItem, 'id'>) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const newToast: ToastItem = {
        ...toast,
        id,
        duration: toast.duration !== undefined ? toast.duration : 5500,
      };

      setToasts((prev) => [...prev, newToast]);
      return id;
    },
    []
  );

  const showGoalCompletionCelebration = useCallback(
    (goalTitle: string, streakDays: number, onAction?: () => void) => {
      const streakText = streakDays > 0 ? `${streakDays} Day${streakDays > 1 ? 's' : ''} Active Streak` : 'Streak Started!';

      addToast({
        type: 'celebration',
        title: streakDays > 1 ? `🎉 Goal Crushed! ${streakDays}-Day Streak!` : '🎉 Daily Goal Completed!',
        message: `"${goalTitle.length > 55 ? goalTitle.substring(0, 52) + '...' : goalTitle}" — Great job logging today’s learning focus! You earned +5 readiness points.`,
        streakCount: streakDays,
        badge: streakText,
        duration: 6000,
        action: onAction
          ? {
              label: 'View Streak Stats',
              onClick: onAction,
            }
          : undefined,
      });
    },
    [addToast]
  );

  const showSuccess = useCallback(
    (title: string, message?: string) => {
      addToast({
        type: 'success',
        title,
        message,
        duration: 4000,
      });
    },
    [addToast]
  );

  const showInfo = useCallback(
    (title: string, message?: string) => {
      addToast({
        type: 'info',
        title,
        message,
        duration: 4000,
      });
    },
    [addToast]
  );

  const showError = useCallback(
    (title: string, message?: string) => {
      addToast({
        type: 'error',
        title,
        message,
        duration: 5000,
      });
    },
    [addToast]
  );

  return (
    <ToastContext.Provider
      value={{
        toasts,
        addToast,
        removeToast,
        showGoalCompletionCelebration,
        showSuccess,
        showInfo,
        showError,
      }}
    >
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

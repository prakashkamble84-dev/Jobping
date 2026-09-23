import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { SecondaryButton } from './SecondaryButton';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
  id?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'We encountered an error processing your request. Please try again.',
  onRetry,
  className = '',
  id = 'error-state',
}) => {
  return (
    <div
      id={id}
      className={`rounded-2xl border border-rose-200 bg-rose-50/50 p-6 text-center flex flex-col items-center justify-center max-w-md mx-auto my-6 ${className}`}
    >
      <div className="w-12 h-12 rounded-2xl bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-600 mb-3">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h4 className="text-base font-bold text-slate-900 tracking-tight">{title}</h4>
      <p className="text-xs text-slate-600 mt-1 mb-4 leading-relaxed max-w-xs">{message}</p>
      {onRetry && (
        <SecondaryButton
          onClick={onRetry}
          icon={<RefreshCw className="w-4 h-4" />}
          className="text-xs !py-2 bg-white"
        >
          Try Again
        </SecondaryButton>
      )}
    </div>
  );
};

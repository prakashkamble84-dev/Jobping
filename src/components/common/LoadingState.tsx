import React from 'react';

interface LoadingStateProps {
  message?: string;
  subtext?: string;
  fullScreen?: boolean;
  className?: string;
  id?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading...',
  subtext = 'Please wait while we prepare your information',
  fullScreen = false,
  className = '',
  id = 'loading-state',
}) => {
  const container = fullScreen
    ? 'fixed inset-0 z-50 bg-white/90 backdrop-blur-xs flex items-center justify-center'
    : 'py-12 flex items-center justify-center';

  return (
    <div id={id} className={`${container} ${className}`}>
      <div className="flex flex-col items-center text-center max-w-sm px-4">
        <div className="relative mb-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-sm animate-pulse">
            <span className="font-extrabold text-xl">J</span>
          </div>
          <div className="absolute -inset-1 rounded-2xl border-2 border-blue-600 animate-spin border-t-transparent" />
        </div>
        <h4 className="text-base font-bold text-slate-900 tracking-tight">{message}</h4>
        {subtext && <p className="text-xs text-slate-500 mt-1">{subtext}</p>}
      </div>
    </div>
  );
};

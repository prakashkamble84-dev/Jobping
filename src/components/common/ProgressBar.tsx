import React from 'react';

interface ProgressBarProps {
  value: number; // 0 to 100
  label?: string;
  sublabel?: string;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'blue' | 'emerald' | 'amber';
  className?: string;
  id?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  label,
  sublabel,
  showPercentage = true,
  size = 'md',
  color = 'blue',
  className = '',
  id,
}) => {
  const clamped = Math.min(100, Math.max(0, Math.round(value)));

  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-3.5',
  };

  const barColors = {
    primary: 'bg-slate-900',
    blue: 'bg-blue-600',
    emerald: 'bg-emerald-600',
    amber: 'bg-amber-500',
  };

  return (
    <div id={id} className={`w-full ${className}`}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between mb-1.5 text-xs font-semibold">
          <div className="text-slate-700">
            {label}
            {sublabel && <span className="ml-1.5 font-normal text-slate-500">{sublabel}</span>}
          </div>
          {showPercentage && <span className="text-slate-900 font-bold">{clamped}%</span>}
        </div>
      )}
      <div className={`w-full bg-slate-100 rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${barColors[color]}`}
          style={{ width: `${clamped}%` }}
          role="progressbar"
          aria-valuenow={clamped}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
};

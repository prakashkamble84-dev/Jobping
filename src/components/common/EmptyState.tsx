import React from 'react';
import { Sparkles } from 'lucide-react';
import { PrimaryButton } from './PrimaryButton';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  className?: string;
  id?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  icon,
  className = '',
  id = 'empty-state',
}) => {
  return (
    <div
      id={id}
      className={`rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-8 text-center flex flex-col items-center justify-center my-4 ${className}`}
    >
      <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 shadow-2xs mb-3">
        {icon || <Sparkles className="w-6 h-6 text-slate-400" />}
      </div>
      <h4 className="text-base font-bold text-slate-900 tracking-tight">{title}</h4>
      <p className="text-xs text-slate-500 mt-1 max-w-sm leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <PrimaryButton
          onClick={onAction}
          className="mt-4 !py-2 !px-4 text-xs"
        >
          {actionLabel}
        </PrimaryButton>
      )}
    </div>
  );
};

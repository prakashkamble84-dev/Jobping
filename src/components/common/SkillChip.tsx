import React from 'react';
import { X, Plus, Check } from 'lucide-react';

interface SkillChipProps {
  label: string;
  selected?: boolean;
  onToggle?: () => void;
  onRemove?: () => void;
  size?: 'sm' | 'md';
  disabled?: boolean;
  id?: string;
}

export const SkillChip: React.FC<SkillChipProps> = ({
  label,
  selected = false,
  onToggle,
  onRemove,
  size = 'md',
  disabled = false,
  id,
}) => {
  const isInteractive = Boolean(onToggle || onRemove);

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-1 gap-1 min-h-[30px]',
    md: 'text-sm px-3.5 py-1.5 gap-1.5 min-h-[36px]',
  };

  if (onRemove) {
    return (
      <span
        id={id}
        className={`inline-flex items-center rounded-xl font-medium transition-all bg-slate-100 border border-slate-200 text-slate-800 ${sizeClasses[size]}`}
      >
        <span>{label}</span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          disabled={disabled}
          className="p-0.5 rounded-md hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors focus:outline-none focus:ring-1 focus:ring-slate-400"
          aria-label={`Remove ${label}`}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </span>
    );
  }

  if (onToggle) {
    return (
      <button
        type="button"
        id={id}
        onClick={onToggle}
        disabled={disabled}
        className={`inline-flex items-center rounded-xl font-medium transition-all cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-blue-600/30 ${
          sizeClasses[size]
        } ${
          selected
            ? 'bg-blue-50 border border-blue-500 text-blue-900 font-semibold shadow-xs'
            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
        }`}
      >
        {selected ? (
          <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
        ) : (
          <Plus className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        )}
        <span>{label}</span>
      </button>
    );
  }

  // Display only
  return (
    <span
      id={id}
      className={`inline-flex items-center rounded-xl font-medium bg-slate-100/80 border border-slate-200/80 text-slate-700 ${sizeClasses[size]}`}
    >
      {label}
    </span>
  );
};

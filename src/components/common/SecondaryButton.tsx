import React from 'react';

interface SecondaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  isLoading?: boolean;
  icon?: React.ReactNode;
  variant?: 'outline' | 'ghost';
}

export const SecondaryButton: React.FC<SecondaryButtonProps> = ({
  children,
  isLoading = false,
  icon,
  variant = 'outline',
  className = '',
  disabled,
  id,
  ...props
}) => {
  const styles =
    variant === 'outline'
      ? 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 focus:ring-slate-200'
      : 'bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900 focus:ring-slate-100';

  return (
    <button
      id={id}
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 min-h-[44px] rounded-xl text-sm font-semibold tracking-wide transition-all duration-150 focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${styles} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="inline-flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Please wait...
        </span>
      ) : (
        <>
          {icon && <span className="shrink-0">{icon}</span>}
          <span>{children}</span>
        </>
      )}
    </button>
  );
};

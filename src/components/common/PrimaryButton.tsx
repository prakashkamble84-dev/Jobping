import React from 'react';

interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  isLoading?: boolean;
  icon?: React.ReactNode;
  variant?: 'primary' | 'navy' | 'accent' | 'danger';
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  children,
  isLoading = false,
  icon,
  variant = 'primary',
  className = '',
  disabled,
  id,
  ...props
}) => {
  const variantStyles = {
    primary:
      'bg-brand-green hover:bg-brand-green-dark text-white shadow-md shadow-brand-green/25 hover:shadow-brand-green/40 focus:ring-brand-green/30 active:scale-[0.98]',
    navy:
      'bg-brand-navy hover:bg-brand-navy-light text-white shadow-md shadow-brand-navy/20 focus:ring-brand-navy/30 active:scale-[0.98]',
    accent:
      'bg-brand-orange hover:bg-amber-600 text-white shadow-md shadow-brand-orange/25 focus:ring-brand-orange/30 active:scale-[0.98]',
    danger:
      'bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/25 focus:ring-rose-600/30 active:scale-[0.98]',
  };

  return (
    <button
      id={id}
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 min-h-[42px] rounded-xl text-sm font-bold tracking-wide transition-all duration-150 focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <svg
            className="animate-spin h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Loading...</span>
        </>
      ) : (
        <>
          {icon && <span className="shrink-0">{icon}</span>}
          <span>{children}</span>
        </>
      )}
    </button>
  );
};

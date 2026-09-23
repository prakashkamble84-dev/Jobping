import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  className?: string;
  id?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showTagline = false,
  className = '',
  id = 'brand-logo',
}) => {
  const iconDimensions = {
    sm: { box: 'w-8 h-8', svg: 'w-5 h-5', bolt: 'w-5 h-5' },
    md: { box: 'w-10 h-10', svg: 'w-6 h-6', bolt: 'w-6 h-6' },
    lg: { box: 'w-12 h-12', svg: 'w-7 h-7', bolt: 'w-7 h-7' },
  };

  const textSizes = {
    sm: 'text-base sm:text-lg',
    md: 'text-xl sm:text-2xl',
    lg: 'text-2xl sm:text-3xl',
  };

  const taglineSizes = {
    sm: 'text-[9px]',
    md: 'text-[10px]',
    lg: 'text-xs',
  };

  const currentIcon = iconDimensions[size];

  return (
    <div id={id} className={`flex items-center gap-2.5 sm:gap-3 ${className}`}>
      {/* JobPing Dual Bubble + Bolt Icon */}
      <div
        className={`relative ${currentIcon.box} flex items-center justify-center shrink-0 select-none`}
        aria-label="JobPing Logo Icon"
      >
        {/* Soft rounded card backdrop */}
        <div className="absolute inset-0 bg-slate-100/90 rounded-xl" />

        {/* Left Candidate Bubble (Bright Blue #0088FF) */}
        <svg
          className="absolute -left-0.5 bottom-0.5 w-[62%] h-[62%] text-brand-blue"
          viewBox="0 0 32 32"
          fill="currentColor"
        >
          <path d="M16 2C8.268 2 2 7.82 2 15c0 3.297 1.312 6.309 3.52 8.574L4 29l6.398-1.785C12.13 27.734 14.02 28 16 28c7.732 0 14-5.82 14-13S23.732 2 16 2z" />
          <circle cx="16" cy="11" r="3.5" fill="white" />
          <path
            d="M10 21c0-3 3-4 6-4s6 1 6 4"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
        </svg>

        {/* Right Employer/Job Bubble (Warm Orange #FF7A00) */}
        <svg
          className="absolute -right-0.5 top-0.5 w-[62%] h-[62%] text-brand-orange"
          viewBox="0 0 32 32"
          fill="currentColor"
        >
          <path d="M16 2C8.268 2 2 7.82 2 15c0 3.297 1.312 6.309 3.52 8.574L4 29l6.398-1.785C12.13 27.734 14.02 28 16 28c7.732 0 14-5.82 14-13S23.732 2 16 2z" />
          <rect x="9" y="12" width="14" height="10" rx="2" fill="white" />
          <path
            d="M13 12V10a2 2 0 012-2h2a2 2 0 012 2v2"
            stroke="white"
            strokeWidth="1.8"
            fill="none"
          />
        </svg>

        {/* Center Energetic Lightning Bolt (Emerald Green #00B074) */}
        <svg
          className="absolute z-10 w-[70%] h-[70%] text-brand-green filter drop-shadow-[0_2px_4px_rgba(0,176,116,0.35)]"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
      </div>

      {/* Brand Wordmark and Tagline */}
      <div className="flex flex-col justify-center">
        <div className={`flex items-center font-black tracking-tight leading-none ${textSizes[size]}`}>
          <span className="text-brand-navy">Job</span>
          <span className="text-brand-green relative inline-flex items-center">
            P
            <span className="relative inline-block">
              i
              <span className="absolute -top-1 right-0 text-[9px] text-brand-green leading-none">⚡</span>
            </span>
            n
            <span className="relative inline-block">
              g
              <span className="absolute -top-1 -right-0.5 text-[9px] text-brand-green leading-none">⚡</span>
            </span>
          </span>
        </div>

        {showTagline && (
          <span
            className={`font-bold text-slate-500 tracking-wide uppercase mt-0.5 leading-none ${taglineSizes[size]}`}
          >
            Instant Match. Real-Time Alert.
          </span>
        )}
      </div>
    </div>
  );
};

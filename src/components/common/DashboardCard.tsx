import React from 'react';

interface DashboardCardProps {
  title?: string;
  subtitle?: string;
  badge?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  id?: string;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  subtitle,
  badge,
  icon,
  children,
  footer,
  className = '',
  id,
}) => {
  return (
    <div
      id={id}
      className={`rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs flex flex-col justify-between ${className}`}
    >
      <div>
        {(title || icon || badge) && (
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              {icon && (
                <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200/60 flex items-center justify-center text-slate-700 shrink-0">
                  {icon}
                </div>
              )}
              <div>
                {title && (
                  <h3 className="text-base font-bold text-slate-900 tracking-tight">
                    {title}
                  </h3>
                )}
                {subtitle && (
                  <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
                )}
              </div>
            </div>
            {badge && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                {badge}
              </span>
            )}
          </div>
        )}
        <div>{children}</div>
      </div>
      {footer && <div className="mt-5 pt-4 border-t border-slate-100">{footer}</div>}
    </div>
  );
};

import React from 'react';
import { LayoutDashboard, User as UserIcon, LogOut, Award, Sparkles, Building2, Zap, Briefcase } from 'lucide-react';
import { ActiveScreen, User } from '../../types';

interface SidebarProps {
  activeScreen: ActiveScreen;
  onNavigate: (screen: ActiveScreen) => void;
  user: User;
  onLogout: () => void;
  id?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeScreen,
  onNavigate,
  user,
  onLogout,
  id = 'desktop-sidebar',
}) => {
  return (
    <aside
      id={id}
      className="hidden lg:flex flex-col justify-between w-64 shrink-0 border-r border-slate-200 bg-white min-h-[calc(100vh-5rem)] p-4"
    >
      <div className="space-y-6">
        {/* Navigation Items */}
        <div className="space-y-1">
          <button
            type="button"
            id="sidebar-nav-home"
            onClick={() => onNavigate('dashboard')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
              activeScreen === 'dashboard'
                ? 'bg-brand-navy text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-brand-navy'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            <span>Candidate Portal</span>
          </button>

          <button
            type="button"
            id="sidebar-nav-employer"
            onClick={() => onNavigate('employer')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
              activeScreen === 'employer'
                ? 'bg-brand-green text-white shadow-xs'
                : 'text-brand-green-dark hover:bg-brand-green-light hover:text-emerald-900'
            }`}
          >
            <Building2 className="w-4 h-4 shrink-0" />
            <span>Employer Portal</span>
          </button>

          <button
            type="button"
            id="sidebar-nav-profile"
            onClick={() => onNavigate('profile')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
              activeScreen === 'profile'
                ? 'bg-brand-navy text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-brand-navy'
            }`}
          >
            <UserIcon className="w-4 h-4 shrink-0" />
            <span>Profile</span>
          </button>
        </div>

        {/* Real-time Job Alert Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-brand-navy to-slate-900 text-white shadow-xs">
          <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-wider text-brand-green mb-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-green opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-green" />
            </span>
            <span>Real-Time Alert Ping</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed mb-3">
            Get instant match alerts the second top companies post new entry-level &amp; tech roles.
          </p>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-brand-orange bg-brand-orange/20 px-2 py-0.5 rounded-md border border-brand-orange/30">
            <Zap className="w-3 h-3 fill-brand-orange" /> Instant Match Active
          </span>
        </div>
      </div>

      {/* User Account footer */}
      <div className="pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100 mb-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-brand-navy text-white flex items-center justify-center text-xs font-bold shrink-0 ring-2 ring-brand-green/30">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
              <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
};

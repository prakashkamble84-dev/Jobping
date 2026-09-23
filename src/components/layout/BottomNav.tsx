import React from 'react';
import { LayoutDashboard, User as UserIcon, Building2 } from 'lucide-react';
import { ActiveScreen } from '../../types';

interface BottomNavProps {
  activeScreen: ActiveScreen;
  onNavigate: (screen: ActiveScreen) => void;
  id?: string;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeScreen,
  onNavigate,
  id = 'mobile-bottom-nav',
}) => {
  return (
    <nav
      id={id}
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-6 py-2 flex items-center justify-around shadow-lg"
    >
      <button
        type="button"
        id="mobile-nav-home"
        onClick={() => onNavigate('dashboard')}
        className={`flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-xl transition-all cursor-pointer min-h-[44px] ${
          activeScreen === 'dashboard'
            ? 'text-brand-green font-bold'
            : 'text-slate-500 hover:text-brand-navy font-medium'
        }`}
      >
        <LayoutDashboard className={`w-5 h-5 ${activeScreen === 'dashboard' ? 'stroke-[2.5]' : 'stroke-2'}`} />
        <span className="text-[11px]">Candidate</span>
      </button>

      <button
        type="button"
        id="mobile-nav-employer"
        onClick={() => onNavigate('employer')}
        className={`flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-xl transition-all cursor-pointer min-h-[44px] ${
          activeScreen === 'employer'
            ? 'text-brand-green font-bold'
            : 'text-slate-500 hover:text-brand-navy font-medium'
        }`}
      >
        <Building2 className={`w-5 h-5 ${activeScreen === 'employer' ? 'stroke-[2.5]' : 'stroke-2'}`} />
        <span className="text-[11px]">Employer</span>
      </button>

      <button
        type="button"
        id="mobile-nav-profile"
        onClick={() => onNavigate('profile')}
        className={`flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-xl transition-all cursor-pointer min-h-[44px] ${
          activeScreen === 'profile'
            ? 'text-brand-green font-bold'
            : 'text-slate-500 hover:text-brand-navy font-medium'
        }`}
      >
        <UserIcon className={`w-5 h-5 ${activeScreen === 'profile' ? 'stroke-[2.5]' : 'stroke-2'}`} />
        <span className="text-[11px]">Profile</span>
      </button>
    </nav>
  );
};

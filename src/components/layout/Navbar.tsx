import React, { useState } from 'react';
import { BrandLogo } from '../common/BrandLogo';
import { PrimaryButton } from '../common/PrimaryButton';
import { SecondaryButton } from '../common/SecondaryButton';
import { User, ActiveScreen } from '../../types';
import {
  LayoutDashboard,
  User as UserIcon,
  LogOut,
  Sparkles,
  Building2,
  Database,
  PlusCircle,
  Menu,
  X,
  Zap,
  Briefcase,
  Search,
  Tag,
} from 'lucide-react';
import { PWAInstallButton } from '../common/PWAInstallButton';
import { SupabaseStatusModal } from '../common/SupabaseStatusModal';

interface NavbarProps {
  user: User | null;
  activeScreen: ActiveScreen;
  onNavigate: (screen: ActiveScreen) => void;
  onOpenAuth: (mode: 'signin' | 'signup') => void;
  onLogout: () => void;
  onLoadDemo: () => void;
  id?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeScreen,
  onNavigate,
  onOpenAuth,
  onLogout,
  onLoadDemo,
  id = 'app-navbar',
}) => {
  const [supabaseModalOpen, setSupabaseModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Top Real-Time Alert Banner */}
      <div className="bg-brand-navy text-white text-[11px] font-semibold py-1.5 px-4 text-center flex items-center justify-center gap-2 border-b border-brand-navy-light/60">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping-slow absolute inline-flex h-full w-full rounded-full bg-brand-green opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-green" />
        </span>
        <span className="text-brand-green font-extrabold uppercase tracking-wider text-[10px]">
          JobPing Alert
        </span>
        <span className="text-slate-300 hidden sm:inline">•</span>
        <span className="text-slate-200">
          Instant Match &amp; Real-Time Notifications Active
        </span>
        <span className="text-brand-orange font-bold hidden md:inline ml-1">
          ⚡ 2,400+ Matches Today
        </span>
      </div>

      <header
        id={id}
        className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Logo with Tagline */}
          <div
            onClick={() => onNavigate(user ? 'dashboard' : 'landing')}
            className="cursor-pointer select-none py-1"
          >
            <BrandLogo size="md" showTagline />
          </div>

          {/* Center Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2">
            <button
              type="button"
              onClick={() => onNavigate(user ? 'dashboard' : 'landing')}
              className={`px-3 py-2 text-xs xl:text-sm font-bold transition-all rounded-xl cursor-pointer ${
                activeScreen === 'landing' || activeScreen === 'dashboard'
                  ? 'text-brand-green bg-brand-green-light/60'
                  : 'text-slate-700 hover:text-brand-navy hover:bg-slate-100'
              }`}
            >
              Find Jobs
            </button>

            <button
              type="button"
              onClick={() => onNavigate('employer')}
              className={`px-3 py-2 text-xs xl:text-sm font-bold transition-all rounded-xl flex items-center gap-1.5 cursor-pointer ${
                activeScreen === 'employer'
                  ? 'text-brand-green bg-brand-green-light/60'
                  : 'text-slate-700 hover:text-brand-navy hover:bg-slate-100'
              }`}
            >
              <span>Post a Job</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-brand-orange text-white uppercase tracking-wider">
                Fast
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (user) {
                  onNavigate('dashboard');
                } else {
                  onOpenAuth('signin');
                }
              }}
              className="px-3 py-2 text-xs xl:text-sm font-bold text-slate-700 hover:text-brand-navy hover:bg-slate-100 transition-all rounded-xl cursor-pointer"
            >
              Companies
            </button>

            <button
              type="button"
              onClick={() => {
                if (user) {
                  onNavigate('employer');
                } else {
                  onOpenAuth('signin');
                }
              }}
              className="px-3 py-2 text-xs xl:text-sm font-bold text-slate-700 hover:text-brand-navy hover:bg-slate-100 transition-all rounded-xl cursor-pointer"
            >
              Pricing
            </button>
          </nav>

          {/* Right Navigation & Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Supabase Connected Pill */}
            <button
              type="button"
              id="supabase-nav-status-btn"
              onClick={() => setSupabaseModalOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-brand-green-light text-brand-green-dark border border-brand-green/30 hover:bg-emerald-100 transition-colors cursor-pointer"
              title="Supabase Database Live Connected"
            >
              <Database className="w-3.5 h-3.5 text-brand-green" />
              <span className="hidden md:inline text-[11px]">Database</span>
              <span className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse" />
            </button>

            <PWAInstallButton variant="compact" className="hidden xl:inline-flex" />

            {user ? (
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Logged in Desktop Tabs */}
                <div className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                  <button
                    type="button"
                    id="nav-tab-candidate"
                    onClick={() => onNavigate('dashboard')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activeScreen === 'dashboard'
                        ? 'bg-brand-navy text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    Candidate
                  </button>
                  <button
                    type="button"
                    id="nav-tab-employer"
                    onClick={() => onNavigate('employer')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activeScreen === 'employer'
                        ? 'bg-brand-green text-white shadow-2xs'
                        : 'text-brand-green-dark hover:text-emerald-900 bg-brand-green-light/80'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    Employer Portal
                  </button>
                  <button
                    type="button"
                    id="nav-tab-profile"
                    onClick={() => onNavigate('profile')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activeScreen === 'profile'
                        ? 'bg-brand-navy text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <UserIcon className="w-3.5 h-3.5" />
                    Profile
                  </button>
                </div>

                <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                  <div
                    onClick={() => onNavigate('profile')}
                    className="hidden sm:flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    <div className="w-8 h-8 rounded-lg bg-brand-navy text-white flex items-center justify-center text-xs font-bold ring-2 ring-brand-green/30">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="text-xs font-bold text-slate-800 max-w-[110px] truncate">
                      {user.name}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={onLogout}
                    className="py-1.5 px-2.5 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-1 cursor-pointer"
                    title="Sign Out"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={onLoadDemo}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-brand-blue bg-brand-blue-light hover:bg-blue-100 transition-colors border border-blue-200 cursor-pointer"
                  title="Quick preview with Rahul Sharma (Fresher sample)"
                >
                  <Sparkles className="w-3.5 h-3.5 text-brand-blue" />
                  <span className="hidden md:inline">Demo Account</span>
                  <span className="md:hidden">Demo</span>
                </button>

                <SecondaryButton
                  id="nav-login-btn"
                  onClick={() => onOpenAuth('signin')}
                  className="!py-2 !px-3.5 text-xs font-bold text-slate-700 hover:text-brand-navy"
                >
                  Sign In
                </SecondaryButton>

                <PrimaryButton
                  id="nav-post-vacancy-btn"
                  onClick={() => onNavigate('employer')}
                  icon={<PlusCircle className="w-3.5 h-3.5 text-white" />}
                  className="!py-2 !px-4 text-xs font-bold bg-brand-green hover:bg-brand-green-dark shadow-md shadow-brand-green/25"
                >
                  <span className="hidden xs:inline">Post a Vacancy</span>
                  <span className="xs:hidden">Post Job</span>
                </PrimaryButton>
              </div>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Panel */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-lg">
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigate(user ? 'dashboard' : 'landing');
                }}
                className="w-full text-left px-3 py-2 text-sm font-bold text-slate-800 rounded-xl hover:bg-slate-100 flex items-center justify-between"
              >
                <span>Find Jobs</span>
                <Search className="w-4 h-4 text-brand-blue" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigate('employer');
                }}
                className="w-full text-left px-3 py-2 text-sm font-bold text-slate-800 rounded-xl hover:bg-slate-100 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span>Post a Job</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-brand-orange text-white uppercase">
                    Fast
                  </span>
                </div>
                <Briefcase className="w-4 h-4 text-brand-orange" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigate('employer');
                }}
                className="w-full text-left px-3 py-2 text-sm font-bold text-slate-800 rounded-xl hover:bg-slate-100"
              >
                Companies &amp; Hiring
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigate('employer');
                }}
                className="w-full text-left px-3 py-2 text-sm font-bold text-slate-800 rounded-xl hover:bg-slate-100"
              >
                Pricing &amp; Plans
              </button>
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-2">
              {!user ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAuth('signin');
                    }}
                    className="w-full py-2.5 text-center text-sm font-bold text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50"
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onNavigate('employer');
                    }}
                    className="w-full py-2.5 text-center text-sm font-bold text-white bg-brand-green rounded-xl shadow-md flex items-center justify-center gap-2"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Post a Vacancy</span>
                  </button>
                </>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 px-2 py-1 text-xs text-slate-600 font-semibold">
                    <div className="w-6 h-6 rounded bg-brand-navy text-white flex items-center justify-center font-bold text-[10px]">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="truncate">{user.email}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full py-2 text-center text-xs font-bold text-rose-600 bg-rose-50 rounded-xl"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      <SupabaseStatusModal
        isOpen={supabaseModalOpen}
        onClose={() => setSupabaseModalOpen(false)}
      />
    </>
  );
};

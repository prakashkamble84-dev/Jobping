import React, { useState, useEffect } from 'react';
import { User, CareerProfile, ActiveScreen, AuthMode } from './types';
import { onAuthStateChange, logoutUser, loadDemoAccount } from './services/authService';
import { getCareerProfile } from './services/profileService';
import { calculateJobReadyScore } from './services/scoreCalculator';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { BottomNav } from './components/layout/BottomNav';
import { LandingScreen } from './components/landing/LandingScreen';
import { OnboardingWizard } from './components/onboarding/OnboardingWizard';
import { DashboardScreen } from './components/dashboard/DashboardScreen';
import { ProfileScreen } from './components/profile/ProfileScreen';
import { EmployerDashboard } from './components/employer/EmployerDashboard';
import { AuthModal } from './components/auth/AuthModal';
import { EditProfileModal } from './components/profile/EditProfileModal';
import { LoadingState } from './components/common/LoadingState';
import { ToastProvider } from './context/ToastContext';
import { ToastContainer } from './components/common/ToastContainer';
import { OfflineIndicator } from './components/common/OfflineIndicator';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentProfile, setCurrentProfile] = useState<CareerProfile | null>(null);
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>('landing');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<AuthMode>('signup');
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Subscribe to authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (user: User | null) => {
      setCurrentUser(user);
      if (user) {
        try {
          const profile = await getCareerProfile(user.uid);
          setCurrentProfile(profile);

          if (!profile || !profile.profileCompleted) {
            setActiveScreen('onboarding');
          } else {
            setActiveScreen('dashboard');
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
          setActiveScreen('onboarding');
        }
      } else {
        setCurrentProfile(null);
        setActiveScreen('landing');
      }
      setInitialLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleOpenAuth = (mode: AuthMode = 'signup') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const handleAuthSuccess = (user: User, isNewUser?: boolean) => {
    setCurrentUser(user);
    if (isNewUser) {
      setActiveScreen('onboarding');
    } else {
      getCareerProfile(user.uid).then((p) => {
        setCurrentProfile(p);
        if (p && p.profileCompleted) {
          setActiveScreen('dashboard');
        } else {
          setActiveScreen('onboarding');
        }
      });
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      setCurrentUser(null);
      setCurrentProfile(null);
      setActiveScreen('landing');
    } catch (err) {
      console.error('Failed to log out:', err);
    }
  };

  const handleLoadDemo = async () => {
    try {
      setInitialLoading(true);
      const { user, profile } = await loadDemoAccount();
      setCurrentUser(user);
      setCurrentProfile(profile);
      setActiveScreen('dashboard');
    } catch (err) {
      console.error('Failed to load demo account:', err);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleOnboardingComplete = (savedProfile: CareerProfile) => {
    setCurrentProfile(savedProfile);
    setActiveScreen('dashboard');
  };

  const handleProfileUpdated = (updatedProfile: CareerProfile) => {
    setCurrentProfile(updatedProfile);
  };

  const handleContinueAction = () => {
    const score = calculateJobReadyScore(currentProfile);
    if (score.recommendedAction.actionField === 'onboarding') {
      setActiveScreen('onboarding');
    } else {
      setEditProfileOpen(true);
    }
  };

  if (initialLoading) {
    return (
      <LoadingState
        fullScreen
        message="Starting JobReady AI..."
        subtext="Loading your career workspace"
      />
    );
  }

  const score = calculateJobReadyScore(currentProfile);

  return (
    <ToastProvider>
      <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
        {/* Global Toast Notifications */}
        <ToastContainer />

        {/* Top Navbar */}
        <Navbar
          user={currentUser}
          activeScreen={activeScreen}
          onNavigate={setActiveScreen}
          onOpenAuth={handleOpenAuth}
          onLogout={handleLogout}
          onLoadDemo={handleLoadDemo}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex">
          {/* Desktop Sidebar (Only shown when logged in and not on landing or onboarding) */}
          {currentUser && (activeScreen === 'dashboard' || activeScreen === 'profile' || activeScreen === 'employer') && (
            <Sidebar
              activeScreen={activeScreen}
              onNavigate={setActiveScreen}
              user={currentUser}
              onLogout={handleLogout}
            />
          )}

          <main className="flex-1 pb-20 lg:pb-10 overflow-x-hidden">
            {activeScreen === 'landing' && (
              <LandingScreen
                onGetStarted={() => handleOpenAuth('signup')}
                onLogin={() => handleOpenAuth('signin')}
                onLoadDemo={handleLoadDemo}
              />
            )}

            {activeScreen === 'onboarding' && currentUser && (
              <OnboardingWizard
                user={currentUser}
                initialProfile={currentProfile}
                onComplete={handleOnboardingComplete}
              />
            )}

            {activeScreen === 'dashboard' && currentUser && (
              <DashboardScreen
                user={currentUser}
                profile={currentProfile}
                score={score}
                onContinueAction={handleContinueAction}
                onEditProfile={() => setEditProfileOpen(true)}
              />
            )}

            {activeScreen === 'employer' && currentUser && (
              <EmployerDashboard
                user={currentUser}
                onSwitchToCandidateView={() => setActiveScreen('dashboard')}
              />
            )}

            {activeScreen === 'profile' && currentUser && (
              <ProfileScreen
                user={currentUser}
                profile={currentProfile}
                score={score}
                onEditProfile={() => setEditProfileOpen(true)}
                onLogout={handleLogout}
              />
            )}
          </main>
        </div>

        {/* Mobile Bottom Navigation (Only when authenticated) */}
        {currentUser && (activeScreen === 'dashboard' || activeScreen === 'profile' || activeScreen === 'employer') && (
          <BottomNav activeScreen={activeScreen} onNavigate={setActiveScreen} />
        )}

        {/* Auth Modal */}
        <AuthModal
          isOpen={authModalOpen}
          initialMode={authModalMode}
          onClose={() => setAuthModalOpen(false)}
          onSuccess={handleAuthSuccess}
        />

        {/* Edit Profile Modal */}
        {currentUser && (
          <EditProfileModal
            isOpen={editProfileOpen}
            onClose={() => setEditProfileOpen(false)}
            profile={currentProfile}
            onProfileUpdated={handleProfileUpdated}
          />
        )}

        {/* Global Offline Network Status Indicator */}
        <OfflineIndicator />
      </div>
    </ToastProvider>
  );
}

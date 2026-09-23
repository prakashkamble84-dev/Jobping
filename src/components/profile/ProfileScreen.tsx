import React from 'react';
import { CareerProfile, ScoreBreakdown, User } from '../../types';
import { ProfileCard } from '../common/ProfileCard';
import { ScoreCard } from '../common/ScoreCard';

interface ProfileScreenProps {
  user: User;
  profile: CareerProfile | null;
  score: ScoreBreakdown;
  onEditProfile: () => void;
  onLogout: () => void;
  id?: string;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  user,
  profile,
  score,
  onEditProfile,
  onLogout,
  id = 'profile-screen',
}) => {
  return (
    <div id={id} className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Career Profile
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage your personal qualifications, career goals, and readiness information.
          </p>
        </div>
      </div>

      {/* Main Profile Info Card */}
      <ProfileCard
        user={user}
        profile={profile}
        onEdit={onEditProfile}
        onLogout={onLogout}
      />

      {/* Preparation Score Context */}
      <div>
        <h3 className="text-base font-bold text-slate-900 mb-3 tracking-tight">
          Current Readiness Breakdown
        </h3>
        <ScoreCard score={score} />
      </div>
    </div>
  );
};

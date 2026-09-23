import React from 'react';
import { CareerProfile, User } from '../../types';
import { ProgressBar } from './ProgressBar';
import { calculateProfileCompletion } from '../../services/scoreCalculator';
import { MapPin, Briefcase, GraduationCap, Globe, Edit3, LogOut, CheckCircle } from 'lucide-react';
import { PrimaryButton } from './PrimaryButton';
import { SecondaryButton } from './SecondaryButton';
import { SkillChip } from './SkillChip';

interface ProfileCardProps {
  user: User;
  profile: CareerProfile | null;
  onEdit: () => void;
  onLogout: () => void;
  id?: string;
  className?: string;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  user,
  profile,
  onEdit,
  onLogout,
  id = 'user-profile-card',
  className = '',
}) => {
  const completionPercentage = calculateProfileCompletion(profile);

  return (
    <div
      id={id}
      className={`rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs ${className}`}
    >
      {/* Header section with User Info and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-xl shadow-xs shrink-0">
            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">{user.name}</h2>
              {user.uid.startsWith('demo-') && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">
                  Demo Account
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">{user.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <PrimaryButton
            id="profile-edit-btn"
            onClick={onEdit}
            icon={<Edit3 className="w-4 h-4" />}
            className="!py-2 !px-4 text-xs"
          >
            Edit Profile
          </PrimaryButton>
          <SecondaryButton
            id="profile-logout-btn"
            onClick={onLogout}
            icon={<LogOut className="w-4 h-4" />}
            className="!py-2 !px-3.5 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
          >
            Logout
          </SecondaryButton>
        </div>
      </div>

      {/* Profile Completion banner */}
      <div className="my-6 p-4 rounded-xl bg-blue-50/70 border border-blue-100/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1.5">
            <CheckCircle className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">
              Profile Completion: {completionPercentage}%
            </span>
          </div>
          <ProgressBar
            value={completionPercentage}
            showPercentage={false}
            size="sm"
            color="blue"
            className="mt-1"
          />
        </div>
        <p className="text-xs text-blue-800 font-medium max-w-sm">
          Complete your profile to improve your readiness score and recommendations.
        </p>
      </div>

      {/* Profile Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {/* Education & Experience */}
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              <GraduationCap className="w-4 h-4 text-slate-700" />
              <span>Highest Education</span>
            </div>
            <p className="text-sm font-semibold text-slate-900">
              {profile?.education || 'Not specified'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              <Briefcase className="w-4 h-4 text-slate-700" />
              <span>Experience & Target Role</span>
            </div>
            <p className="text-sm font-semibold text-slate-900">
              {profile?.targetJob || 'Role not selected'}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Experience level: <span className="font-medium text-slate-700">{profile?.experienceLevel || 'Fresher'}</span> • Looking for: <span className="font-medium text-slate-700">{profile?.jobPreference || 'First Job'}</span>
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              <MapPin className="w-4 h-4 text-slate-700" />
              <span>Location & Work Preference</span>
            </div>
            <p className="text-sm font-semibold text-slate-900">
              {profile?.preferredCity ? `${profile.preferredCity}${profile.preferredState ? `, ${profile.preferredState}` : ''}` : 'Location not specified'}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Mode: <span className="font-medium text-slate-700">{profile?.workPreference || 'Office'}</span> • Expected salary: <span className="font-medium text-slate-700">{profile?.salaryMin ? `${profile.salaryMin} - ${profile.salaryMax || 'Open'}` : 'Not decided'}</span>
            </p>
          </div>
        </div>

        {/* Skills, Languages & Career Goal */}
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
              Skills ({profile?.skills?.length || 0})
            </div>
            {profile?.skills && profile.skills.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {profile.skills.map((skill) => (
                  <SkillChip key={skill} label={skill} size="sm" />
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No skills listed yet.</p>
            )}
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              <Globe className="w-4 h-4 text-slate-700" />
              <span>Languages</span>
            </div>
            {profile?.languages && profile.languages.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {profile.languages.map((lang) => (
                  <span
                    key={lang}
                    className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-800"
                  >
                    {lang}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No languages specified.</p>
            )}
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Career Goal & Objective
            </div>
            <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
              &ldquo;{profile?.careerGoal || profile?.careerObjective || 'No career goal description added yet.'}&rdquo;
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

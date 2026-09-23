import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { InputField } from '../common/InputField';
import { SelectField } from '../common/SelectField';
import { PrimaryButton } from '../common/PrimaryButton';
import { SecondaryButton } from '../common/SecondaryButton';
import { SkillChip } from '../common/SkillChip';
import { CareerProfile } from '../../types';
import { saveCareerProfile } from '../../services/profileService';
import { Plus, CheckCircle, AlertCircle } from 'lucide-react';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: CareerProfile | null;
  onProfileUpdated: (updated: CareerProfile) => void;
  id?: string;
}

const EDUCATION_OPTIONS = [
  '10th',
  '12th',
  'ITI',
  'Diploma',
  'Graduate',
  'Post Graduate',
  'Other',
];

const EXPERIENCE_OPTIONS = [
  'Fresher',
  'Less than 1 year',
  '1–3 years',
  '3–5 years',
  '5+ years',
];

const TARGET_JOB_OPTIONS = [
  'Sales Executive',
  'Customer Service Executive',
  'Accountant',
  'Back Office Executive',
  'Data Entry Operator',
  'Digital Marketing Executive',
  'HR Executive',
  'Banking',
  'Retail',
  'IT',
  'Other',
];

const WORK_PREFERENCE_OPTIONS = ['Office', 'Remote', 'Hybrid', 'Any'];
const JOB_PREFERENCE_OPTIONS = ['First Job', 'Better Job', 'Career Change', 'Internship', 'Part-time Work'];

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onProfileUpdated,
  id = 'edit-profile-modal',
}) => {
  const [jobPreference, setJobPreference] = useState(profile?.jobPreference || 'First Job');
  const [education, setEducation] = useState(profile?.education || 'Graduate');
  const [experienceLevel, setExperienceLevel] = useState(profile?.experienceLevel || 'Fresher');
  const [targetJob, setTargetJob] = useState(profile?.targetJob || 'Sales Executive');
  const [preferredCity, setPreferredCity] = useState(profile?.preferredCity || '');
  const [preferredState, setPreferredState] = useState(profile?.preferredState || '');
  const [workPreference, setWorkPreference] = useState(profile?.workPreference || 'Office');
  const [salaryMin, setSalaryMin] = useState(profile?.salaryMin || '₹15,000 / month');
  const [salaryMax, setSalaryMax] = useState(profile?.salaryMax || '₹25,000 / month');
  const [careerGoal, setCareerGoal] = useState(profile?.careerGoal || '');
  const [skills, setSkills] = useState<string[]>(profile?.skills || []);
  const [newSkill, setNewSkill] = useState('');
  const [languages, setLanguages] = useState<string[]>(profile?.languages || []);
  const [newLanguage, setNewLanguage] = useState('');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Sync state when modal opens
  React.useEffect(() => {
    if (profile) {
      setJobPreference(profile.jobPreference || 'First Job');
      setEducation(profile.education || 'Graduate');
      setExperienceLevel(profile.experienceLevel || 'Fresher');
      setTargetJob(profile.targetJob || 'Sales Executive');
      setPreferredCity(profile.preferredCity || '');
      setPreferredState(profile.preferredState || '');
      setWorkPreference(profile.workPreference || 'Office');
      setSalaryMin(profile.salaryMin || '');
      setSalaryMax(profile.salaryMax || '');
      setCareerGoal(profile.careerGoal || profile.careerObjective || '');
      setSkills(profile.skills || []);
      setLanguages(profile.languages || []);
    }
    setError(null);
    setSuccess(false);
  }, [profile, isOpen]);

  const handleAddSkill = () => {
    const trimmed = newSkill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const handleAddLanguage = () => {
    const trimmed = newLanguage.trim();
    if (trimmed && !languages.includes(trimmed)) {
      setLanguages([...languages, trimmed]);
      setNewLanguage('');
    }
  };

  const handleRemoveLanguage = (lang: string) => {
    setLanguages(languages.filter((l) => l !== lang));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.uid) return;

    setSaving(true);
    setError(null);

    try {
      const updated = await saveCareerProfile(profile.uid, {
        jobPreference,
        education,
        experienceLevel,
        targetJob,
        preferredCity,
        preferredState,
        workPreference,
        salaryMin,
        salaryMax,
        careerGoal,
        careerObjective: careerGoal,
        skills,
        languages,
        profileCompleted: true,
      });

      setSuccess(true);
      onProfileUpdated(updated);
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || 'Failed to save profile changes.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      id={id}
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="2xl"
      title="Edit Career Profile"
      subtitle="Update your education, career target, skills, and preferences."
    >
      <form onSubmit={handleSave} className="space-y-5">
        {success && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 text-xs text-emerald-900 font-bold">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Profile updated successfully.</span>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2.5 text-xs text-rose-800 font-medium">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SelectField
            label="What are you looking for?"
            options={JOB_PREFERENCE_OPTIONS}
            value={jobPreference}
            onChange={(e) => setJobPreference(e.target.value)}
          />

          <SelectField
            label="Highest Education"
            options={EDUCATION_OPTIONS}
            value={education}
            onChange={(e) => setEducation(e.target.value)}
          />

          <SelectField
            label="Experience Level"
            options={EXPERIENCE_OPTIONS}
            value={experienceLevel}
            onChange={(e) => setExperienceLevel(e.target.value)}
          />

          <SelectField
            label="Target Job Role"
            options={TARGET_JOB_OPTIONS}
            value={targetJob}
            onChange={(e) => setTargetJob(e.target.value)}
          />

          <InputField
            label="City"
            value={preferredCity}
            onChange={(e) => setPreferredCity(e.target.value)}
          />

          <InputField
            label="State"
            value={preferredState}
            onChange={(e) => setPreferredState(e.target.value)}
          />

          <SelectField
            label="Work Style Preference"
            options={WORK_PREFERENCE_OPTIONS}
            value={workPreference}
            onChange={(e) => setWorkPreference(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-2">
            <InputField
              label="Min Salary"
              value={salaryMin}
              placeholder="e.g. ₹15,000 / mo"
              onChange={(e) => setSalaryMin(e.target.value)}
            />
            <InputField
              label="Max Salary"
              value={salaryMax}
              placeholder="e.g. ₹25,000 / mo"
              onChange={(e) => setSalaryMax(e.target.value)}
            />
          </div>
        </div>

        {/* Skills editor */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Skills ({skills.length})
          </label>
          <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200 mb-2.5 min-h-[44px]">
            {skills.map((skill) => (
              <SkillChip
                key={skill}
                label={skill}
                onRemove={() => handleRemoveSkill(skill)}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add skill (e.g. Tally, Excel, Sales)..."
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSkill();
                }
              }}
              className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
            />
            <SecondaryButton
              type="button"
              onClick={handleAddSkill}
              disabled={!newSkill.trim()}
              icon={<Plus className="w-3.5 h-3.5" />}
              className="!py-1.5 !px-3 text-xs"
            >
              Add
            </SecondaryButton>
          </div>
        </div>

        {/* Languages editor */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Languages ({languages.length})
          </label>
          <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200 mb-2.5 min-h-[44px]">
            {languages.map((lang) => (
              <SkillChip
                key={lang}
                label={lang}
                onRemove={() => handleRemoveLanguage(lang)}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add language (e.g. English, Hindi, Marathi)..."
              value={newLanguage}
              onChange={(e) => setNewLanguage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddLanguage();
                }
              }}
              className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
            />
            <SecondaryButton
              type="button"
              onClick={handleAddLanguage}
              disabled={!newLanguage.trim()}
              icon={<Plus className="w-3.5 h-3.5" />}
              className="!py-1.5 !px-3 text-xs"
            >
              Add
            </SecondaryButton>
          </div>
        </div>

        {/* Career Goal */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Career Goal Statement
          </label>
          <textarea
            rows={3}
            value={careerGoal}
            onChange={(e) => setCareerGoal(e.target.value)}
            className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
            placeholder="Describe your career goal..."
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <SecondaryButton type="button" onClick={onClose} disabled={saving}>
            Cancel
          </SecondaryButton>
          <PrimaryButton type="submit" isLoading={saving} id="save-profile-btn">
            Save Changes
          </PrimaryButton>
        </div>
      </form>
    </Modal>
  );
};

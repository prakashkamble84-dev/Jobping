import React, { useState } from 'react';
import { CareerProfile, User } from '../../types';
import { PrimaryButton } from '../common/PrimaryButton';
import { SecondaryButton } from '../common/SecondaryButton';
import { InputField } from '../common/InputField';
import { ProgressBar } from '../common/ProgressBar';
import { SkillChip } from '../common/SkillChip';
import { saveCareerProfile } from '../../services/profileService';
import {
  Briefcase,
  GraduationCap,
  Clock,
  Target,
  MapPin,
  IndianRupee,
  Cpu,
  Globe,
  Compass,
  ArrowRight,
  ArrowLeft,
  Plus,
  Sparkles,
} from 'lucide-react';

interface OnboardingWizardProps {
  user: User;
  initialProfile?: CareerProfile | null;
  onComplete: (profile: CareerProfile) => void;
  id?: string;
}

const LOOKING_FOR_OPTIONS = [
  { id: 'first_job', label: 'First Job', desc: 'Starting my career journey' },
  { id: 'better_job', label: 'Better Job', desc: 'Seeking growth or higher pay' },
  { id: 'career_change', label: 'Career Change', desc: 'Transitioning to a new field' },
  { id: 'internship', label: 'Internship', desc: 'Gaining industry exposure' },
  { id: 'part_time', label: 'Part-time Work', desc: 'Flexible hourly or part-time role' },
];

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

const SUGGESTED_SKILLS = [
  'Communication',
  'MS Excel',
  'Tally',
  'Customer Service',
  'Sales',
  'English',
  'Hindi',
  'Marathi',
  'Computer Basics',
  'Digital Marketing',
  'Accounting',
  'Data Entry',
  'Leadership',
  'Teamwork',
];

const DEFAULT_LANGUAGES = ['English', 'Hindi', 'Marathi', 'Other'];

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  user,
  initialProfile,
  onComplete,
  id = 'onboarding-wizard',
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state for all 9 steps
  const [jobPreference, setJobPreference] = useState(initialProfile?.jobPreference || 'First Job');
  const [education, setEducation] = useState(initialProfile?.education || 'Graduate');
  const [educationOther, setEducationOther] = useState('');
  const [experienceLevel, setExperienceLevel] = useState(initialProfile?.experienceLevel || 'Fresher');
  const [targetJob, setTargetJob] = useState(initialProfile?.targetJob || 'Sales Executive');
  const [targetJobOther, setTargetJobOther] = useState('');
  const [city, setCity] = useState(initialProfile?.preferredCity || '');
  const [state, setState] = useState(initialProfile?.preferredState || '');
  const [workPreference, setWorkPreference] = useState(initialProfile?.workPreference || 'Office');
  const [salaryNotDecided, setSalaryNotDecided] = useState(!initialProfile?.salaryMin);
  const [salaryMin, setSalaryMin] = useState(initialProfile?.salaryMin || '₹15,000 / month');
  const [salaryMax, setSalaryMax] = useState(initialProfile?.salaryMax || '₹25,000 / month');
  const [skills, setSkills] = useState<string[]>(
    initialProfile?.skills && initialProfile.skills.length > 0
      ? initialProfile.skills
      : ['Communication', 'MS Excel', 'Customer Service']
  );
  const [customSkillInput, setCustomSkillInput] = useState('');
  const [languages, setLanguages] = useState<string[]>(
    initialProfile?.languages && initialProfile.languages.length > 0
      ? initialProfile.languages
      : ['English', 'Hindi']
  );
  const [customLanguageInput, setCustomLanguageInput] = useState('');
  const [careerGoal, setCareerGoal] = useState(
    initialProfile?.careerGoal || 'I want to start my career as a sales executive.'
  );

  const totalSteps = 9;
  const progressPercent = Math.round((currentStep / totalSteps) * 100);

  const toggleSkill = (skill: string) => {
    if (skills.includes(skill)) {
      setSkills(skills.filter((s) => s !== skill));
    } else {
      setSkills([...skills, skill]);
    }
  };

  const addCustomSkill = () => {
    const trimmed = customSkillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setCustomSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const toggleLanguage = (lang: string) => {
    if (languages.includes(lang)) {
      setLanguages(languages.filter((l) => l !== lang));
    } else {
      setLanguages([...languages, lang]);
    }
  };

  const addCustomLanguage = () => {
    const trimmed = customLanguageInput.trim();
    if (trimmed && !languages.includes(trimmed)) {
      setLanguages([...languages, trimmed]);
      setCustomLanguageInput('');
    }
  };

  const handleNext = () => {
    setError(null);
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleFinalSave();
    }
  };

  const handleBack = () => {
    setError(null);
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinalSave = async () => {
    setSaving(true);
    setError(null);

    const resolvedEducation = education === 'Other' && educationOther ? educationOther : education;
    const resolvedTargetJob = targetJob === 'Other' && targetJobOther ? targetJobOther : targetJob;

    try {
      const payload: Partial<CareerProfile> = {
        uid: user.uid,
        jobPreference,
        education: resolvedEducation,
        experienceLevel,
        targetJob: resolvedTargetJob,
        preferredCity: city.trim() || 'Any City',
        preferredState: state.trim() || 'India',
        workPreference,
        salaryMin: salaryNotDecided ? 'Not decided' : salaryMin,
        salaryMax: salaryNotDecided ? 'Not decided' : salaryMax,
        skills,
        languages,
        careerGoal: careerGoal.trim() || `I want to become a ${resolvedTargetJob}.`,
        careerObjective: careerGoal.trim(),
        profileCompleted: true,
      };

      const saved = await saveCareerProfile(user.uid, payload);
      onComplete(saved);
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || 'Failed to save career profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div id={id} className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
      {/* Progress header */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
          <span>Step {currentStep} of {totalSteps}</span>
          <span className="text-blue-600 font-extrabold">{progressPercent}% Completed</span>
        </div>
        <ProgressBar value={progressPercent} showPercentage={false} size="md" color="blue" />
      </div>

      {/* Main Form Container */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-xs">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-medium">
            {error}
          </div>
        )}

        {/* STEP 1: What are you looking for? */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                  What are you looking for?
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select your current career objective.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {LOOKING_FOR_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setJobPreference(opt.label)}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    jobPreference === opt.label
                      ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-600/20 shadow-xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <p className="font-bold text-slate-900 text-sm">{opt.label}</p>
                  <p className="text-xs text-slate-500 mt-1">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: Highest Education */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                  What is your highest education?
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tailored for 10th, 12th pass, ITI, Diploma, and graduates.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              {EDUCATION_OPTIONS.map((edu) => (
                <button
                  key={edu}
                  type="button"
                  onClick={() => setEducation(edu)}
                  className={`p-4 rounded-2xl border text-center transition-all cursor-pointer font-bold text-sm ${
                    education === edu
                      ? 'border-blue-600 bg-blue-50/60 text-blue-900 ring-2 ring-blue-600/20'
                      : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  {edu}
                </button>
              ))}
            </div>

            {education === 'Other' && (
              <InputField
                label="Specify Other Education"
                placeholder="e.g. Vocational Certification"
                value={educationOther}
                onChange={(e) => setEducationOther(e.target.value)}
                required
              />
            )}
          </div>
        )}

        {/* STEP 3: Experience */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                  Experience Level
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  How much professional work experience do you have?
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {EXPERIENCE_OPTIONS.map((exp) => (
                <button
                  key={exp}
                  type="button"
                  onClick={() => setExperienceLevel(exp)}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    experienceLevel === exp
                      ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-600/20'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <p className="font-bold text-slate-900 text-sm">{exp}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 4: Target Job */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                  Which job are you targeting?
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select your primary career aspiration.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 max-h-72 overflow-y-auto pr-1">
              {TARGET_JOB_OPTIONS.map((job) => (
                <button
                  key={job}
                  type="button"
                  onClick={() => setTargetJob(job)}
                  className={`p-3.5 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer ${
                    targetJob === job
                      ? 'border-blue-600 bg-blue-50/70 text-blue-900 ring-2 ring-blue-600/20'
                      : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  {job}
                </button>
              ))}
            </div>

            {targetJob === 'Other' && (
              <InputField
                label="Specify Target Job"
                placeholder="e.g. Warehouse Supervisor"
                value={targetJobOther}
                onChange={(e) => setTargetJobOther(e.target.value)}
                required
              />
            )}
          </div>
        )}

        {/* STEP 5: Preferred Work Location */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                  Preferred Work Location
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Where would you like to work?
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField
                label="City"
                placeholder="e.g. Mumbai, Pune, Bengaluru"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />
              <InputField
                label="State"
                placeholder="e.g. Maharashtra, Karnataka"
                value={state}
                onChange={(e) => setState(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Work Mode Preference
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {WORK_PREFERENCE_OPTIONS.map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setWorkPreference(mode)}
                    className={`py-3 px-4 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center ${
                      workPreference === mode
                        ? 'border-blue-600 bg-blue-50 text-blue-900 ring-2 ring-blue-600/20'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 6: Expected Salary */}
        {currentStep === 6 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                <IndianRupee className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                  Expected Salary
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Provide your salary expectation range or choose Not decided.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="salary-not-decided"
                  checked={salaryNotDecided}
                  onChange={(e) => setSalaryNotDecided(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
                />
                <label htmlFor="salary-not-decided" className="text-sm font-semibold text-slate-800 cursor-pointer">
                  Not decided yet (explore market standards)
                </label>
              </div>

              {!salaryNotDecided && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <InputField
                    label="Minimum Salary"
                    placeholder="e.g. ₹15,000 / month"
                    value={salaryMin}
                    onChange={(e) => setSalaryMin(e.target.value)}
                  />
                  <InputField
                    label="Maximum Salary"
                    placeholder="e.g. ₹25,000 / month"
                    value={salaryMax}
                    onChange={(e) => setSalaryMax(e.target.value)}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 7: Skills */}
        {currentStep === 7 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                  What skills do you have?
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select your key capabilities or add custom ones.
                </p>
              </div>
            </div>

            {/* Selected skills pills */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Your Selected Skills ({skills.length})
              </label>
              <div className="flex flex-wrap gap-2 p-3 rounded-2xl bg-slate-50 border border-slate-200 min-h-[50px]">
                {skills.length > 0 ? (
                  skills.map((skill) => (
                    <SkillChip
                      key={skill}
                      label={skill}
                      onRemove={() => removeSkill(skill)}
                    />
                  ))
                ) : (
                  <span className="text-xs text-slate-400 italic">
                    Click skills below or type custom skills to add.
                  </span>
                )}
              </div>
            </div>

            {/* Custom skill input */}
            <div className="flex gap-2">
              <InputField
                label="Add Custom Skill"
                placeholder="e.g. PowerBI, AutoCAD, POS Systems"
                value={customSkillInput}
                onChange={(e) => setCustomSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCustomSkill();
                  }
                }}
              />
              <div className="self-end mb-0.5">
                <SecondaryButton
                  onClick={addCustomSkill}
                  disabled={!customSkillInput.trim()}
                  icon={<Plus className="w-4 h-4" />}
                >
                  Add
                </SecondaryButton>
              </div>
            </div>

            {/* Suggested skills */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Suggested for {targetJob || 'your role'}
              </label>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_SKILLS.map((skill) => (
                  <SkillChip
                    key={skill}
                    label={skill}
                    selected={skills.includes(skill)}
                    onToggle={() => toggleSkill(skill)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 8: Languages */}
        {currentStep === 8 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                  Which languages can you communicate in?
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select all languages you are comfortable speaking or writing.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {DEFAULT_LANGUAGES.filter((l) => l !== 'Other').map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => toggleLanguage(lang)}
                  className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    languages.includes(lang)
                      ? 'border-blue-600 bg-blue-50 text-blue-900 ring-2 ring-blue-600/20'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {languages.includes(lang) ? `✓ ${lang}` : `+ ${lang}`}
                </button>
              ))}
            </div>

            {/* Custom language input */}
            <div className="flex gap-2 pt-2">
              <InputField
                label="Add Other Language"
                placeholder="e.g. Gujarati, Tamil, Telugu, Bengali"
                value={customLanguageInput}
                onChange={(e) => setCustomLanguageInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCustomLanguage();
                  }
                }}
              />
              <div className="self-end mb-0.5">
                <SecondaryButton
                  onClick={addCustomLanguage}
                  disabled={!customLanguageInput.trim()}
                  icon={<Plus className="w-4 h-4" />}
                >
                  Add
                </SecondaryButton>
              </div>
            </div>

            {/* Selected summary */}
            <div className="p-3 rounded-xl bg-slate-50 text-xs text-slate-700">
              <span className="font-bold">Active languages: </span>
              {languages.length > 0 ? languages.join(', ') : 'None selected'}
            </div>
          </div>
        )}

        {/* STEP 9: Career Goal */}
        {currentStep === 9 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                  Tell us about your career goal.
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Describe what role or industry milestones you want to achieve.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Career Goal Statement
              </label>
              <textarea
                id="career-goal-textarea"
                rows={4}
                className="w-full p-3.5 rounded-2xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                placeholder="e.g. I want to become a sales executive and grow into a client relationship manager in 3 years."
                value={careerGoal}
                onChange={(e) => setCareerGoal(e.target.value)}
              />
              <p className="mt-1.5 text-xs text-slate-500">
                Example: &ldquo;I want to start my career as a sales executive.&rdquo;
              </p>
            </div>

            <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-100 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-900 leading-relaxed font-medium">
                You&apos;re all set! Submitting will calculate your initial{' '}
                <span className="font-bold">JobReady Preparation Score</span> and take you to your dashboard.
              </p>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-8 border-t border-slate-100 mt-8">
          <div>
            {currentStep > 1 && (
              <SecondaryButton
                id="onboarding-back-btn"
                onClick={handleBack}
                icon={<ArrowLeft className="w-4 h-4" />}
              >
                Back
              </SecondaryButton>
            )}
          </div>

          <PrimaryButton
            id="onboarding-next-btn"
            onClick={handleNext}
            isLoading={saving}
            icon={currentStep === totalSteps ? <Sparkles className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
          >
            {currentStep === totalSteps ? 'Calculate My Score' : 'Next Step'}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
};

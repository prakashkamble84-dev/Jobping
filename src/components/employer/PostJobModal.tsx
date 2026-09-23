import React, { useState } from 'react';
import {
  X,
  Briefcase,
  Sparkles,
  Plus,
  Trash2,
  CheckCircle2,
  DollarSign,
  MapPin,
  Clock,
  Layers,
  Send,
  AlertCircle,
} from 'lucide-react';
import { PrimaryButton } from '../common/PrimaryButton';
import { SecondaryButton } from '../common/SecondaryButton';
import {
  CompanyProfile,
  JobPosting,
  JobSkillRequirement,
  JobExperienceLevel,
  JobWorkMode,
} from '../../types';
import { createEmployerJob } from '../../services/employerService';
import { useToast } from '../../context/ToastContext';

interface PostJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: CompanyProfile;
  userId: string;
  onJobCreated: (newJob: JobPosting) => void;
}

const POPULAR_SKILLS = [
  'React',
  'TypeScript',
  'Node.js',
  'JavaScript',
  'Tailwind CSS',
  'Python',
  'SQL',
  'MongoDB',
  'PostgreSQL',
  'AWS Cloud',
  'Docker',
  'Git / GitHub',
  'Figma UI/UX',
  'REST APIs',
  'Next.js',
];

export const PostJobModal: React.FC<PostJobModalProps> = ({
  isOpen,
  onClose,
  company,
  userId,
  onJobCreated,
}) => {
  const { showSuccess, showError } = useToast();

  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [description, setDescription] = useState('');
  const [experienceLevel, setExperienceLevel] = useState<JobExperienceLevel>('junior');
  const [minYearsExperience, setMinYearsExperience] = useState<number>(1);
  const [maxYearsExperience, setMaxYearsExperience] = useState<number>(3);
  const [workMode, setWorkMode] = useState<JobWorkMode>('hybrid');
  const [city, setCity] = useState(company.headquarters.city || 'Bangalore');
  const [state, setState] = useState(company.headquarters.state || 'Karnataka');
  const [minSalary, setMinSalary] = useState<number>(600000);
  const [maxSalary, setMaxSalary] = useState<number>(1200000);
  const [matchThreshold, setMatchThreshold] = useState<number>(75);
  const [skills, setSkills] = useState<JobSkillRequirement[]>([
    { name: 'React', normalizedKey: 'react', isMandatory: true, minYearsRequired: 1 },
    { name: 'TypeScript', normalizedKey: 'typescript', isMandatory: true, minYearsRequired: 1 },
    { name: 'Tailwind CSS', normalizedKey: 'tailwindcss', isMandatory: false, minYearsRequired: 0.5 },
  ]);
  const [customSkillInput, setCustomSkillInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleAddSkill = (skillName: string, isMandatory = true) => {
    const trimmed = skillName.trim();
    if (!trimmed) return;
    const normalizedKey = trimmed.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (skills.some((s) => s.normalizedKey === normalizedKey)) {
      showError('Skill already added', `${trimmed} is already in the requirements list.`);
      return;
    }
    setSkills([
      ...skills,
      {
        name: trimmed,
        normalizedKey,
        isMandatory,
        minYearsRequired: minYearsExperience,
      },
    ]);
    setCustomSkillInput('');
  };

  const handleRemoveSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const handleToggleMandatory = (index: number) => {
    const updated = [...skills];
    updated[index].isMandatory = !updated[index].isMandatory;
    setSkills(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      showError('Job title required', 'Please provide a clear job title.');
      return;
    }

    if (skills.length === 0) {
      showError('Skills required', 'Please add at least one required skill.');
      return;
    }

    setIsSubmitting(true);

    try {
      const mandatorySkillKeys = skills.filter((s) => s.isMandatory).map((s) => s.normalizedKey);
      const allNormalizedSkillKeys = skills.map((s) => s.normalizedKey);

      const result = createEmployerJob({
        companyId: company.id,
        postedByUserId: userId,
        companySummary: {
          name: company.name,
          logoUrl: company.logoUrl,
          city: city,
          verified: company.verifiedBadge,
        },
        title: title.trim(),
        description:
          description.trim() ||
          `We are hiring a passionate ${title} to join ${company.name} in ${city} (${workMode}).`,
        department,
        experienceLevel,
        minYearsExperience,
        maxYearsExperience,
        workMode,
        location: {
          city,
          state,
          country: 'India',
        },
        compensation: {
          currency: 'INR',
          minSalary,
          maxSalary,
          isDisclosed: true,
        },
        skills,
        mandatorySkillKeys,
        allNormalizedSkillKeys,
        status: 'active',
        matchThresholdPercentage: matchThreshold,
        expiresAt: new Date(Date.now() + 45 * 86400000).toISOString(),
      });

      showSuccess(
        'Job Published & Matching Triggered! 🚀',
        `Automated matching engine evaluated candidate pool. Found ${result.job.applicantCount} matching candidates.`
      );
      onJobCreated(result.job);
      onClose();
    } catch (err: any) {
      showError('Failed to publish job', err.message || 'Unknown error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div
        id="post-job-modal-container"
        className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Post New Job Opening</h3>
              <p className="text-xs text-slate-500">
                Publish opening for <strong className="text-slate-800">{company.name}</strong> & run instant candidate matching
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Section 1: Core Job Details */}
          <div className="space-y-4">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              1. Role & Department
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Job Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  id="job-title-input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Senior Frontend React Developer"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Department</label>
                <select
                  id="job-department-select"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                >
                  <option value="Engineering">Engineering & Tech</option>
                  <option value="Product & Design">Product & Design</option>
                  <option value="Data & Analytics">Data & Analytics</option>
                  <option value="Sales & Business">Sales & Business Dev</option>
                  <option value="Customer Operations">Customer Operations</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Experience Tier
                </label>
                <select
                  id="job-exp-tier-select"
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value as JobExperienceLevel)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                >
                  <option value="fresher">Fresher (0-1 yrs)</option>
                  <option value="junior">Junior (1-3 yrs)</option>
                  <option value="mid_level">Mid-Level (3-5 yrs)</option>
                  <option value="senior">Senior (5-8 yrs)</option>
                  <option value="lead">Lead / Executive (8+ yrs)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Min Experience (Years)
                </label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  step="0.5"
                  value={minYearsExperience}
                  onChange={(e) => setMinYearsExperience(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Work Mode
                </label>
                <select
                  id="job-workmode-select"
                  value={workMode}
                  onChange={(e) => setWorkMode(e.target.value as JobWorkMode)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                >
                  <option value="hybrid">Hybrid (Office + Remote)</option>
                  <option value="onsite">Onsite (Full Office)</option>
                  <option value="remote">100% Remote</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Location & Salary */}
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              2. Location & Compensation (Annual INR)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  City / Location
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Bangalore, Pune, Hyderabad"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Min Salary (INR)
                  </label>
                  <input
                    type="number"
                    step="50000"
                    value={minSalary}
                    onChange={(e) => setMinSalary(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Max Salary (INR)
                  </label>
                  <input
                    type="number"
                    step="50000"
                    value={maxSalary}
                    onChange={(e) => setMaxSalary(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Skill Requirements & Matching Weights */}
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                  3. Required Technical & Role Skills
                </h4>
                <p className="text-[11px] text-slate-500">
                  Toggle <strong>Mandatory</strong> for must-have hard requirements. Non-mandatory skills contribute bonus score.
                </p>
              </div>
            </div>

            {/* Added Skills List */}
            <div className="space-y-2">
              {skills.map((skill, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/70"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-900">{skill.name}</span>
                    <button
                      type="button"
                      onClick={() => handleToggleMandatory(idx)}
                      className={`px-2.5 py-0.5 rounded-md text-[10px] font-extrabold cursor-pointer transition ${
                        skill.isMandatory
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : 'bg-blue-100 text-blue-800 border border-blue-200'
                      }`}
                    >
                      {skill.isMandatory ? '★ Mandatory Must-Have' : 'Optional / Bonus'}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(idx)}
                    className="text-slate-400 hover:text-rose-600 transition p-1 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Custom Skill Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={customSkillInput}
                onChange={(e) => setCustomSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill(customSkillInput);
                  }
                }}
                placeholder="Type skill name & press Enter (e.g. Docker, GraphQL, Figma)"
                className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={() => handleAddSkill(customSkillInput)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition cursor-pointer"
              >
                Add Skill
              </button>
            </div>

            {/* Quick Skill Suggestion Chips */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Quick Add Suggestions:</span>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_SKILLS.filter(
                  (ps) => !skills.some((s) => s.normalizedKey === ps.toLowerCase().replace(/[^a-z0-9]/g, ''))
                ).slice(0, 8).map((ps) => (
                  <button
                    key={ps}
                    type="button"
                    onClick={() => handleAddSkill(ps, true)}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    {ps}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 4: WhatsApp Notification Match Threshold */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50/70 to-teal-50/50 border border-emerald-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <Send className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h5 className="text-xs font-extrabold text-emerald-950">
                    Automated WhatsApp Alert Trigger Threshold
                  </h5>
                  <p className="text-[11px] text-emerald-800">
                    Dispatches instant candidate and employer WhatsApp alerts when overall match score meets this threshold.
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-extrabold text-xs shadow-2xs">
                {matchThreshold}% Fit
              </span>
            </div>

            <input
              type="range"
              min="50"
              max="95"
              step="5"
              value={matchThreshold}
              onChange={(e) => setMatchThreshold(parseInt(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
          </div>

          {/* Section 5: Description */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">Job Description (Optional)</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Outline day-to-day responsibilities, perks, and team impact..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <SecondaryButton onClick={onClose} disabled={isSubmitting}>
              Cancel
            </SecondaryButton>

            <PrimaryButton
              type="submit"
              disabled={isSubmitting}
              icon={<Sparkles className="w-4 h-4 text-indigo-200" />}
            >
              {isSubmitting ? 'Publishing & Matching...' : 'Publish Job & Run Matching'}
            </PrimaryButton>
          </div>
        </form>
      </div>
    </div>
  );
};

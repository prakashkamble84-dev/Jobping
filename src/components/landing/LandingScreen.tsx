import React, { useState, useEffect, useRef } from 'react';
import { PrimaryButton } from '../common/PrimaryButton';
import { SecondaryButton } from '../common/SecondaryButton';
import {
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  Briefcase,
  Target,
  Compass,
  ChevronLeft,
  ChevronRight,
  Quote,
  Star,
  Building2,
  MapPin,
  Award,
  Search,
  Zap,
  BellRing,
  CheckCheck,
  Send,
  Clock,
} from 'lucide-react';

interface LandingScreenProps {
  onGetStarted: () => void;
  onLogin: () => void;
  onLoadDemo: () => void;
  id?: string;
}

const POPULAR_FILTERS = [
  { label: 'Remote', icon: '🌐', color: 'text-brand-green bg-brand-green-light border-brand-green/30' },
  { label: 'Full-time', icon: '💼', color: 'text-brand-blue bg-brand-blue-light border-brand-blue/30' },
  { label: '⚡ Tech & Engineering', icon: '', color: 'text-brand-green bg-brand-green-light border-brand-green/30' },
  { label: 'Marketing & Growth', icon: '', color: 'text-brand-orange bg-brand-orange-light border-brand-orange/30' },
  { label: 'Freshers & Entry Level', icon: '🎓', color: 'text-indigo-700 bg-indigo-50 border-indigo-200' },
  { label: 'Sales & BD', icon: '', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
];

const TARGET_AUDIENCE = [
  '12th Pass Students',
  'ITI Students',
  'Diploma Students',
  'College Graduates',
  'Freshers & Job Seekers',
  'Early-Career Professionals',
];

interface Testimonial {
  id: string;
  name: string;
  location: string;
  background: string;
  roleSecured: string;
  industry: string;
  scoreAchieved: number;
  quote: string;
  initials: string;
  color: string;
}

const SUCCESS_STORIES: Testimonial[] = [
  {
    id: 'story-1',
    name: 'Pooja Patil',
    location: 'Pune, Maharashtra',
    background: 'Graduate (B.Com)',
    roleSecured: 'Junior Accountant',
    industry: 'Financial Services',
    scoreAchieved: 88,
    quote:
      'The instant alert notified me within 2 minutes of the vacancy opening. The skills readiness scorecard helped me clear the technical round and secure my accounting job.',
    initials: 'PP',
    color: 'bg-brand-green',
  },
  {
    id: 'story-2',
    name: 'Amit Verma',
    location: 'Lucknow, Uttar Pradesh',
    background: '12th Pass + ITI',
    roleSecured: 'Customer Support Executive',
    industry: 'Telecom & BPO',
    scoreAchieved: 84,
    quote:
      'JobPing matched my profile to open positions instantly. The AI preparation and interview breakdown gave me the confidence to ace my interviews.',
    initials: 'AV',
    color: 'bg-brand-blue',
  },
  {
    id: 'story-3',
    name: 'Sneha Deshmukh',
    location: 'Nagpur, Maharashtra',
    background: 'Diploma in Computer Tech',
    roleSecured: 'IT Support & Helpdesk Specialist',
    industry: 'IT Services',
    scoreAchieved: 91,
    quote:
      'The real-time match engine benchmarked what employers look for. I increased my score from 58 to 91 and landed two interview pings in the same week.',
    initials: 'SD',
    color: 'bg-brand-navy',
  },
  {
    id: 'story-4',
    name: 'Rohan Sharma',
    location: 'Bengaluru, Karnataka',
    background: 'Fresher (BBA)',
    roleSecured: 'Business Development Executive',
    industry: 'E-Commerce & Retail',
    scoreAchieved: 86,
    quote:
      'When hiring managers posted jobs, JobPing alerted me right away. The structured STAR interview answers helped me crack the role smoothly.',
    initials: 'RS',
    color: 'bg-brand-orange',
  },
];

export const LandingScreen: React.FC<LandingScreenProps> = ({
  onGetStarted,
  onLogin,
  onLoadDemo,
  id = 'landing-screen',
}) => {
  const [searchTitle, setSearchTitle] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  const nextStory = () => {
    setCurrentStoryIndex((prev) => (prev + 1) % SUCCESS_STORIES.length);
  };

  const prevStory = () => {
    setCurrentStoryIndex((prev) => (prev - 1 + SUCCESS_STORIES.length) % SUCCESS_STORIES.length);
  };

  useEffect(() => {
    if (!isPaused) {
      autoPlayRef.current = setInterval(() => {
        nextStory();
      }, 6000);
    }
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [isPaused]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGetStarted();
  };

  const activeStory = SUCCESS_STORIES[currentStoryIndex];

  return (
    <div id={id} className="min-h-screen bg-white">
      {/* ================= HERO SECTION ================= */}
      <section className="relative overflow-hidden pt-10 pb-16 sm:pt-16 sm:pb-24 bg-gradient-to-b from-white via-brand-green-light/15 to-slate-50 border-b border-slate-100">
        {/* Ambient Brand Light Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full overflow-hidden pointer-events-none -z-10">
          <div className="absolute -top-24 left-1/4 w-96 h-96 bg-brand-green/10 rounded-full blur-3xl" />
          <div className="absolute top-1/3 right-10 w-80 h-80 bg-brand-blue/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-10 w-72 h-72 bg-brand-orange/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            {/* Live Instant Match Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white border border-slate-200/90 shadow-2xs text-xs font-bold text-slate-800">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-green opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-green" />
              </span>
              <span className="text-brand-navy">⚡ Instant Match Engine Active</span>
              <span className="h-3.5 w-px bg-slate-300" />
              <span className="text-brand-orange font-extrabold">Real-Time Alert Platform</span>
            </div>

            {/* High-Impact Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-brand-navy tracking-tight leading-[1.15]">
              Get Hired in a Flash with <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-green via-emerald-600 to-brand-blue">
                Real-Time Job Alerts
              </span>
            </h1>

            {/* Subheadline focusing on fast job matching and instant alerts */}
            <p className="text-lg sm:text-xl text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto">
              <strong className="text-brand-navy font-bold">JobPing</strong> instantly connects candidates and recruiters with millisecond notification alerts the moment a matching role opens.
            </p>

            {/* ================= CENTRAL SEARCH BAR ================= */}
            <div className="pt-2 pb-2">
              <form
                onSubmit={handleSearchSubmit}
                className="bg-white p-3 sm:p-4 rounded-2xl sm:rounded-3xl shadow-xl shadow-slate-200/80 border border-slate-200/90 max-w-3xl mx-auto text-left"
              >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                  {/* Field 1: Job Title / Skill */}
                  <div className="md:col-span-5 relative flex items-center px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100/80 transition-colors focus-within:bg-white focus-within:ring-2 focus-within:ring-brand-green">
                    <Search className="w-5 h-5 text-brand-blue shrink-0 mr-2.5" />
                    <div className="w-full">
                      <label htmlFor="hero-job-query" className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Job Title / Skill
                      </label>
                      <input
                        id="hero-job-query"
                        type="text"
                        value={searchTitle}
                        onChange={(e) => setSearchTitle(e.target.value)}
                        placeholder="e.g. React Developer, Sales, Tally"
                        className="w-full bg-transparent border-0 p-0 text-sm font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:ring-0"
                      />
                    </div>
                  </div>

                  {/* Field 2: Location */}
                  <div className="md:col-span-4 relative flex items-center px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100/80 transition-colors focus-within:bg-white focus-within:ring-2 focus-within:ring-brand-green">
                    <MapPin className="w-5 h-5 text-brand-orange shrink-0 mr-2.5" />
                    <div className="w-full">
                      <label htmlFor="hero-location-query" className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Location
                      </label>
                      <input
                        id="hero-location-query"
                        type="text"
                        value={searchLocation}
                        onChange={(e) => setSearchLocation(e.target.value)}
                        placeholder="e.g. Pune, Bengaluru, Remote"
                        className="w-full bg-transparent border-0 p-0 text-sm font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:ring-0"
                      />
                    </div>
                  </div>

                  {/* Search CTA Button */}
                  <div className="md:col-span-3">
                    <button
                      type="submit"
                      className="w-full h-12 flex items-center justify-center gap-2 px-5 font-bold text-white bg-brand-green hover:bg-brand-green-dark active:scale-[0.98] rounded-xl shadow-md shadow-brand-green/30 transition-all cursor-pointer"
                    >
                      <Zap className="w-4 h-4 fill-white" />
                      <span>Search Jobs</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Quick Filter Tags */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs">
              <span className="font-bold text-slate-500 mr-1 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-brand-orange" /> Popular Pings:
              </span>

              {POPULAR_FILTERS.map((filter) => (
                <button
                  key={filter.label}
                  type="button"
                  onClick={() => {
                    setSearchTitle(filter.label.replace('⚡', '').trim());
                    onGetStarted();
                  }}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border font-bold text-xs transition-all shadow-2xs hover:scale-105 cursor-pointer ${filter.color}`}
                >
                  {filter.icon && <span>{filter.icon}</span>}
                  <span>{filter.label}</span>
                </button>
              ))}
            </div>

            {/* Secondary Action CTAs & Demo Shortcut */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-4">
              <PrimaryButton
                id="hero-get-started-btn"
                onClick={onGetStarted}
                icon={<ArrowRight className="w-4 h-4" />}
                className="w-full sm:w-auto text-base !py-3.5 !px-8 shadow-md"
              >
                Instant Job Match
              </PrimaryButton>

              <SecondaryButton
                id="hero-login-btn"
                onClick={onLogin}
                className="w-full sm:w-auto text-base !py-3.5 !px-7 bg-white border-slate-300 hover:border-slate-400"
              >
                Candidate Login
              </SecondaryButton>
            </div>

            {/* Sample demo shortcut banner */}
            <div className="inline-flex items-center gap-2 text-xs text-slate-500 bg-white border border-slate-200/80 px-4 py-2 rounded-xl shadow-2xs">
              <span>Evaluating as a reviewer?</span>
              <button
                type="button"
                onClick={onLoadDemo}
                className="font-bold text-brand-blue hover:underline underline-offset-2 cursor-pointer"
              >
                Launch with Rahul Sharma (Fresher Sample)
              </button>
            </div>
          </div>

          {/* ================= REAL-TIME STATS ROW ================= */}
          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto">
            <div className="bg-white/90 backdrop-blur-sm p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-brand-green-light flex items-center justify-center text-brand-green shrink-0">
                <BellRing className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-black text-brand-navy">&lt; 45 Seconds</div>
                <p className="text-xs font-semibold text-slate-500">Average Match-to-Alert Speed</p>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-sm p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-brand-blue-light flex items-center justify-center text-brand-blue shrink-0">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-black text-brand-navy">18,500+</div>
                <p className="text-xs font-semibold text-slate-500">Verified Companies Hiring</p>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-sm p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-brand-orange-light flex items-center justify-center text-brand-orange shrink-0">
                <CheckCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-black text-brand-navy">94.2%</div>
                <p className="text-xs font-semibold text-slate-500">First-Week Interview Rate</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 3 CORE STEPS SECTION ================= */}
      <section className="py-16 sm:py-20 bg-slate-50/60 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-brand-navy tracking-tight">
              Instant Match. Real-Time Alert. Three Clear Steps.
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              Designed specifically to take the delay out of hiring and career preparation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-2xs hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-brand-green-light border border-brand-green/20 flex items-center justify-center text-brand-green mb-4">
                <Zap className="w-6 h-6 fill-brand-green" />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-brand-green shrink-0" />
                <h3 className="text-lg font-bold text-brand-navy">
                  1. Real-Time Profile Match
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Receive an objective 0–100 Readiness Score based on your qualifications, skills, and target job benchmark.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-2xs hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-brand-blue-light border border-brand-blue/20 flex items-center justify-center text-brand-blue mb-4">
                <Target className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-brand-blue shrink-0" />
                <h3 className="text-lg font-bold text-brand-navy">
                  2. Targeted Skill Drills
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Benchmark key technical and workplace abilities against verified roles in Tech, Sales, Operations, and Finance.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-2xs hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-brand-orange-light border border-brand-orange/20 flex items-center justify-center text-brand-orange mb-4">
                <BellRing className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-brand-orange shrink-0" />
                <h3 className="text-lg font-bold text-brand-navy">
                  3. Instant Recruiter Pings
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Get notified the exact second a matching vacancy opens and send tailored applications with 1-click readiness credentials.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SUCCESS STORIES / TESTIMONIALS CAROUSEL ================= */}
      <section
        id="success-stories-section"
        className="py-16 sm:py-24 bg-white border-b border-slate-100 overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-green-light border border-brand-green/30 text-brand-green-dark text-xs font-bold uppercase tracking-wider mb-3">
                <Award className="w-3.5 h-3.5 text-brand-green" />
                <span>Real Preparation, Real Outcomes</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-navy tracking-tight">
                Success Stories from JobPing Candidates
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-xl">
                See how job seekers prepared systematically and secured their target roles in record time.
              </p>
            </div>

            {/* Carousel Navigation Buttons */}
            <div className="flex items-center gap-2 self-start md:self-auto">
              <button
                type="button"
                id="testimonial-prev-btn"
                onClick={prevStory}
                className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
                aria-label="Previous story"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                id="testimonial-next-btn"
                onClick={nextStory}
                className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
                aria-label="Next story"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Main Featured Testimonial Card */}
          <div className="relative bg-slate-50/80 rounded-3xl border border-slate-200 p-6 sm:p-10 transition-all">
            <Quote className="absolute top-6 right-6 sm:top-10 sm:right-10 w-16 h-16 sm:w-20 sm:h-20 text-slate-200/80 pointer-events-none -z-0" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Column: Quote and Details */}
              <div className="lg:col-span-8 space-y-6">
                <div className="flex items-center gap-1 text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                  <span className="ml-2 text-xs font-bold text-slate-700">
                    Secured Target Role
                  </span>
                </div>

                <blockquote className="text-base sm:text-xl text-slate-800 font-medium leading-relaxed italic">
                  &ldquo;{activeStory.quote}&rdquo;
                </blockquote>

                <div className="flex items-center gap-4 pt-2">
                  <div
                    className={`w-12 h-12 rounded-2xl ${activeStory.color} text-white font-black text-lg flex items-center justify-center shrink-0 shadow-xs`}
                  >
                    {activeStory.initials}
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900">
                      {activeStory.name}
                    </h4>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                      <span>{activeStory.background}</span>
                      <span>•</span>
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{activeStory.location}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column: Verified Role & Score Badge Card */}
              <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/90 p-5 space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Secured Role
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified Placement
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-sm sm:text-base">
                    <Briefcase className="w-4 h-4 text-brand-green shrink-0" />
                    <span>{activeStory.roleSecured}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500 text-xs mt-1">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{activeStory.industry}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-brand-green-light/80 border border-brand-green/20 flex items-center justify-between">
                  <span className="text-xs font-bold text-brand-green-dark">
                    Readiness Score Reached
                  </span>
                  <span className="text-base font-black text-brand-green-dark">
                    {activeStory.scoreAchieved}/100
                  </span>
                </div>
              </div>
            </div>

            {/* Dots Pagination */}
            <div className="flex items-center justify-center gap-2 mt-8 pt-6 border-t border-slate-200/60">
              {SUCCESS_STORIES.map((story, idx) => (
                <button
                  key={story.id}
                  type="button"
                  onClick={() => setCurrentStoryIndex(idx)}
                  className={`h-2.5 rounded-full transition-all cursor-pointer ${
                    idx === currentStoryIndex
                      ? 'w-8 bg-brand-green'
                      : 'w-2.5 bg-slate-300 hover:bg-slate-400'
                  }`}
                  aria-label={`Go to story ${idx + 1} (${story.name})`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================= TARGET AUDIENCE ================= */}
      <section className="py-14 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
            Built for Aspirants &amp; Recruiters Across India
          </p>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 max-w-4xl mx-auto">
            {TARGET_AUDIENCE.map((aud) => (
              <span
                key={aud}
                className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-bold text-slate-700 hover:border-brand-green hover:text-brand-green transition-colors"
              >
                {aud}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ================= TRANSPARENCY & ETHICAL DISCLOSURE ================= */}
      <section className="py-12 bg-slate-50 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4 text-brand-green" />
            <span>Honest Career Platform Principles</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            JobPing is a real-time matching and career preparation guidance platform. We help you connect directly with genuine recruiters and build capabilities for competitive hiring benchmarks.
          </p>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="py-8 bg-brand-navy text-center border-t border-brand-navy-light text-white">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <div className="flex items-center justify-center gap-1.5 text-sm font-black">
            <span className="text-white">Job</span>
            <span className="text-brand-green">Ping</span>
            <span className="text-slate-400 text-xs font-normal ml-2">
              — Instant Match. Real-Time Alert.
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium">
            © {new Date().getFullYear()} JobPing Inc. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

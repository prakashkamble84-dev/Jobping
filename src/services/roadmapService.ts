import { CareerPathRoadmap, RoadmapMilestone, RoadmapTask, CareerProfile } from '../types';

const ROADMAP_CACHE_PREFIX = 'jobready_career_roadmap_';
const ROADMAP_COMPLETED_TASKS_PREFIX = 'jobready_completed_roadmap_tasks_';

export function getCompletedTaskIds(userId: string, targetRole: string): string[] {
  if (!userId) return [];
  try {
    const key = `${ROADMAP_COMPLETED_TASKS_PREFIX}${userId}_${encodeURIComponent(targetRole || 'default')}`;
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCompletedTaskIds(userId: string, targetRole: string, taskIds: string[]) {
  if (!userId) return;
  try {
    const key = `${ROADMAP_COMPLETED_TASKS_PREFIX}${userId}_${encodeURIComponent(targetRole || 'default')}`;
    localStorage.setItem(key, JSON.stringify(taskIds));
  } catch (e) {
    console.error('Failed to persist completed task IDs:', e);
  }
}

export function toggleTaskCompletion(
  userId: string,
  targetRole: string,
  taskId: string,
  currentRoadmap: CareerPathRoadmap
): CareerPathRoadmap {
  const currentCompleted = new Set(getCompletedTaskIds(userId, targetRole));
  if (currentCompleted.has(taskId)) {
    currentCompleted.delete(taskId);
  } else {
    currentCompleted.add(taskId);
  }

  const updatedTaskIds = Array.from(currentCompleted);
  saveCompletedTaskIds(userId, targetRole, updatedTaskIds);

  // Recalculate milestone statuses and overall percentage
  let totalTasks = 0;
  let completedTasksCount = 0;

  const updatedMilestones: RoadmapMilestone[] = currentRoadmap.milestones.map((m, mIndex) => {
    const updatedTasks = m.tasks.map((t) => {
      const isDone = updatedTaskIds.includes(t.id);
      totalTasks++;
      if (isDone) completedTasksCount++;
      return { ...t, completed: isDone };
    });

    const allMilestoneTasksDone = updatedTasks.length > 0 && updatedTasks.every((t) => t.completed);
    const anyMilestoneTasksDone = updatedTasks.some((t) => t.completed);

    let status: 'completed' | 'in_progress' | 'upcoming' = 'upcoming';
    if (allMilestoneTasksDone) {
      status = 'completed';
    } else if (anyMilestoneTasksDone || mIndex === 0) {
      status = 'in_progress';
    }

    return {
      ...m,
      tasks: updatedTasks,
      status,
    };
  });

  const overallPercent = totalTasks > 0 ? Math.round((completedTasksCount / totalTasks) * 100) : 0;

  const updatedRoadmap: CareerPathRoadmap = {
    ...currentRoadmap,
    overallProgressPercent: overallPercent,
    milestones: updatedMilestones,
  };

  saveCachedRoadmap(userId, targetRole, updatedRoadmap);
  return updatedRoadmap;
}

export function getCachedRoadmap(userId: string, targetRole: string): CareerPathRoadmap | null {
  if (!userId) return null;
  try {
    const key = `${ROADMAP_CACHE_PREFIX}${userId}_${encodeURIComponent(targetRole || 'default')}`;
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const roadmap = JSON.parse(raw) as CareerPathRoadmap;

    // Apply stored completed task statuses
    const completedIds = new Set(getCompletedTaskIds(userId, targetRole));
    let totalTasks = 0;
    let completedCount = 0;

    roadmap.milestones = roadmap.milestones.map((m, mIdx) => {
      const tasks = m.tasks.map((t) => {
        totalTasks++;
        const isDone = completedIds.has(t.id);
        if (isDone) completedCount++;
        return { ...t, completed: isDone };
      });
      const allDone = tasks.length > 0 && tasks.every((t) => t.completed);
      const anyDone = tasks.some((t) => t.completed);
      return {
        ...m,
        tasks,
        status: allDone ? 'completed' : anyDone || mIdx === 0 ? 'in_progress' : 'upcoming',
      };
    });

    roadmap.overallProgressPercent = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;
    return roadmap;
  } catch {
    return null;
  }
}

export function saveCachedRoadmap(userId: string, targetRole: string, roadmap: CareerPathRoadmap) {
  if (!userId) return;
  try {
    const key = `${ROADMAP_CACHE_PREFIX}${userId}_${encodeURIComponent(targetRole || 'default')}`;
    localStorage.setItem(key, JSON.stringify(roadmap));
  } catch (e) {
    console.error('Failed to cache roadmap:', e);
  }
}

// -------------------------------------------------------------
// PRIMARY SERVICE CALL (AI API + DETERMINISTIC ENGINE)
// -------------------------------------------------------------
export async function generateCareerRoadmap(
  userProfile: CareerProfile | null,
  userId: string,
  forceRefresh = false
): Promise<CareerPathRoadmap> {
  const targetRole = userProfile?.targetJob || 'Entry-Level Professional';

  // Check cache first if not forced
  if (!forceRefresh) {
    const cached = getCachedRoadmap(userId, targetRole);
    if (cached) {
      return cached;
    }
  }

  try {
    const res = await fetch('/api/career-roadmap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        targetJob: targetRole,
        education: userProfile?.education || 'Graduate',
        experienceLevel: userProfile?.experienceLevel || 'Fresher',
        skills: userProfile?.skills || [],
        preferredCity: userProfile?.preferredCity || 'Pan-India',
        workPreference: userProfile?.workPreference || 'Office',
        careerGoal: userProfile?.careerGoal || '',
      }),
    });

    if (res.ok) {
      const data: CareerPathRoadmap = await res.json();

      // Merge saved completed tasks into fresh AI milestones
      const completedIds = new Set(getCompletedTaskIds(userId, targetRole));
      let totalTasks = 0;
      let completedCount = 0;

      data.milestones = data.milestones.map((m, mIdx) => {
        const tasks = m.tasks.map((t) => {
          totalTasks++;
          const isDone = completedIds.has(t.id);
          if (isDone) completedCount++;
          return { ...t, completed: isDone };
        });
        const allDone = tasks.length > 0 && tasks.every((t) => t.completed);
        const anyDone = tasks.some((t) => t.completed);
        return {
          ...m,
          tasks,
          status: allDone ? 'completed' : anyDone || mIdx === 0 ? 'in_progress' : 'upcoming',
        };
      });

      data.overallProgressPercent = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;
      saveCachedRoadmap(userId, targetRole, data);
      return data;
    }
  } catch (err) {
    console.warn('Backend career roadmap API failed or offline, using tailored fallback:', err);
  }

  // Generate deterministic role-tailored fallback
  const fallbackRoadmap = generateRoleTailoredRoadmap(userProfile);
  const completedIds = new Set(getCompletedTaskIds(userId, targetRole));
  let totalTasks = 0;
  let completedCount = 0;

  fallbackRoadmap.milestones = fallbackRoadmap.milestones.map((m, mIdx) => {
    const tasks = m.tasks.map((t) => {
      totalTasks++;
      const isDone = completedIds.has(t.id);
      if (isDone) completedCount++;
      return { ...t, completed: isDone };
    });
    const allDone = tasks.length > 0 && tasks.every((t) => t.completed);
    const anyDone = tasks.some((t) => t.completed);
    return {
      ...m,
      tasks,
      status: allDone ? 'completed' : anyDone || mIdx === 0 ? 'in_progress' : 'upcoming',
    };
  });

  fallbackRoadmap.overallProgressPercent = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;
  saveCachedRoadmap(userId, targetRole, fallbackRoadmap);
  return fallbackRoadmap;
}

// -------------------------------------------------------------
// DETERMINISTIC FALLBACK GENERATOR FOR INDIAN EMPLOYMENT DOMAINS
// -------------------------------------------------------------
export function generateRoleTailoredRoadmap(profile: CareerProfile | null): CareerPathRoadmap {
  const role = (profile?.targetJob || 'Sales Executive').trim();
  const lowerRole = role.toLowerCase();
  const edu = profile?.education || 'Graduate';
  const exp = profile?.experienceLevel || 'Fresher';
  const skills = profile?.skills || [];
  const now = new Date().toISOString();

  // 1. SALES EXECUTIVE / B2B SALES / BD
  if (lowerRole.includes('sales') || lowerRole.includes('business development') || lowerRole.includes('bd executive')) {
    return {
      targetRole: role,
      candidateTier: `${exp} (${edu})`,
      currentEducation: edu,
      estimatedTotalMonths: '3 to 5 Months to First Offer',
      overallProgressPercent: 0,
      summaryNote: `A high-impact 4-phase execution blueprint designed specifically for ${edu} candidates targeting Corporate & Retail Sales in the Indian market.`,
      salaryTrajectory: {
        entryLevel: '₹2.4L - ₹3.6L CTC + Incentives',
        oneYear: '₹4.2L - ₹6.0L (Senior BD)',
        threeYears: '₹7.5L - ₹12.0L (Area Sales Manager)',
      },
      generatedAt: now,
      milestones: [
        {
          id: 'ms-sales-1',
          stepNumber: 1,
          phase: 'Phase 1: Sales Fundamentals & Lead Discovery',
          timeFrame: 'Weeks 1–3',
          description: 'Master the core Indian sales pipeline: lead prospecting, cold outreach scripts, CRM basics, and objection handling.',
          keyCompetencies: ['B2B & B2C Sales Cycles', 'Cold Calling & Email Outreach', 'CRM Software (Zoho / HubSpot)', 'Active Listening'],
          tasks: [
            { id: 'st-1-1', title: 'Learn the 5-Stage Sales Funnel', description: 'Prospecting, Qualifying (BANT), Pitching, Objection Handling, Closing.', completed: false, category: 'learning', estimatedHours: 6 },
            { id: 'st-1-2', title: 'Master Zoho CRM or HubSpot Free Tier', description: 'Practice logging 20 mock leads, deals, pipeline stages, and follow-up reminders.', completed: false, category: 'learning', estimatedHours: 8 },
            { id: 'st-1-3', title: 'Draft 3 Cold Calling & WhatsApp Scripts', description: 'Write concise Hindi + English pitch templates for real estate, edtech, or SaaS prospects.', completed: false, category: 'project', estimatedHours: 4 },
          ],
          capstoneProject: {
            title: 'Outbound Prospecting Simulation',
            brief: 'Create a target list of 25 local SMEs or tech startups with verified decision-maker emails and personalized phone pitch notes.',
            deliverables: ['Lead Tracker Spreadsheet (Google Sheets)', '3 Tailored Pitch Decks/Scripts'],
          },
          recommendedResources: ['HubSpot Inbound Sales Certification', 'Zoho CRM Academy', 'BANT Qualification Framework Guide'],
          status: 'in_progress',
        },
        {
          id: 'ms-sales-2',
          stepNumber: 2,
          phase: 'Phase 2: Product Demos, Negotiations & Objection Handling',
          timeFrame: 'Weeks 4–7',
          description: 'Learn high-converting product demonstrations, pricing defense, discount negotiations, and value-based selling.',
          keyCompetencies: ['Live Product Demo Delivery', 'Price Negotiation Tactics', 'Client Rapport Building', 'MS Excel Commercial Models'],
          tasks: [
            { id: 'st-2-1', title: 'Record a 5-Minute Virtual Product Pitch', description: 'Deliver a video pitch explaining a software or service ROI and review pacing.', completed: false, category: 'project', estimatedHours: 5 },
            { id: 'st-2-2', title: 'Practice Top 10 Indian Buyer Objections', description: '"Budget tight hai", "Send email first", "Competitor is cheaper", "Call next month".', completed: false, category: 'learning', estimatedHours: 8 },
            { id: 'st-2-3', title: 'Master Basic Quotation & Excel Calculations', description: 'Compute discounts, GST implications, and commission margins.', completed: false, category: 'learning', estimatedHours: 4 },
          ],
          capstoneProject: {
            title: 'End-to-End Sales Pitch Deck',
            brief: 'Produce a 10-slide high-converting commercial presentation addressing customer pain points, ROI, and closing timeline.',
            deliverables: ['Canva or PPT Sales Presentation', 'Recorded 5-min Audio Demo'],
          },
          recommendedResources: ['Challenger Sale Framework', 'Spin Selling Methodology (YouTube Summaries)', 'IIM Ahmedabad Sales & Marketing Case Studies'],
          status: 'upcoming',
        },
        {
          id: 'ms-sales-3',
          stepNumber: 3,
          phase: 'Phase 3: ATS Resume & Targeted Indian Job Applications',
          timeFrame: 'Weeks 8–10',
          description: 'Optimize resume with quota achievements, setup LinkedIn networking with Sales Directors, and apply on Naukri / Internshala.',
          keyCompetencies: ['Action-Oriented Resume Writing', 'LinkedIn Social Selling', 'Naukri.com SEO Profile Optimization'],
          tasks: [
            { id: 'st-3-1', title: 'Build ATS-Optimized Sales Resume', description: 'Highlight communication, lead generation metrics, Excel, and CRM competencies.', completed: false, category: 'certification', estimatedHours: 4 },
            { id: 'st-3-2', title: 'Connect with 20 Indian Sales Team Leads', description: 'Send customized connection requests on LinkedIn targeting high-growth startups and FMCG.', completed: false, category: 'networking', estimatedHours: 6 },
            { id: 'st-3-3', title: 'Submit 15 Verified Job Applications', description: 'Apply to verified Junior Sales and BD Executive openings with customized cover notes.', completed: false, category: 'networking', estimatedHours: 10 },
          ],
          capstoneProject: {
            title: 'Personal Sales Portfolio & Track Record',
            brief: 'Compile a 1-page PDF showcasing pitch scripts, CRM certifications, and mock sales achievements.',
            deliverables: ['1-Page Sales Dossier PDF', '100% Complete LinkedIn Profile'],
          },
          recommendedResources: ['JobReady AI Resume Tailorer', 'LinkedIn Sales Outreach Templates', 'Naukri Recruiter Search Keyword Guide'],
          status: 'upcoming',
        },
        {
          id: 'ms-sales-4',
          stepNumber: 4,
          phase: 'Phase 4: Sales Roleplay Interviews & Offer Negotiation',
          timeFrame: 'Weeks 11–14',
          description: 'Ace live mock sales scenarios ("Sell me this pen / SaaS subscription"), handle behavioral questions, and negotiate target CTC.',
          keyCompetencies: ['Mock Interview Roleplay', 'STAR Behavioral Answers', 'Fixed vs Variable Incentive Structure Negotiation'],
          tasks: [
            { id: 'st-4-1', title: 'Complete 3 Live AI Mock Sales Interviews', description: 'Practice roleplay objection scenarios using JobReady AI speech evaluator.', completed: false, category: 'interview', estimatedHours: 6 },
            { id: 'st-4-2', title: 'Prepare Answers for Common HR Questions', description: '"Tell me about yourself", "Why sales?", "How do you handle daily rejection?".', completed: false, category: 'interview', estimatedHours: 5 },
            { id: 'st-4-3', title: 'Evaluate Compensation & Incentive Letters', description: 'Learn the difference between Fixed Pay, Target Variable, and Retainer Contracts.', completed: false, category: 'learning', estimatedHours: 3 },
          ],
          capstoneProject: {
            title: 'First-90-Days Territory Sales Plan',
            brief: 'Draft an executive 30-60-90 day ramp-up plan to present to hiring managers during final rounds.',
            deliverables: ['30-60-90 Day Sales Strategy Document (2 Pages)'],
          },
          recommendedResources: ['JobReady AI Mock Interview Suite', 'Indian Tech Salary Benchmarking Guide', 'Sales Negotiation Playbook'],
          status: 'upcoming',
        },
      ],
    };
  }

  // 2. FRONTEND DEVELOPER / WEB DEVELOPER / REACT
  if (lowerRole.includes('frontend') || lowerRole.includes('front end') || lowerRole.includes('react') || lowerRole.includes('web dev')) {
    return {
      targetRole: role,
      candidateTier: `${exp} (${edu})`,
      currentEducation: edu,
      estimatedTotalMonths: '4 to 6 Months to Job Offer',
      overallProgressPercent: 0,
      summaryNote: `A structured web engineering roadmap tailored to modern Indian tech hiring bars (HTML5, Modern ES6+, React 19, Tailwind, and Portfolio Projects).`,
      salaryTrajectory: {
        entryLevel: '₹3.6L - ₹6.5L CTC',
        oneYear: '₹6.5L - ₹10.5L (Software Engineer)',
        threeYears: '₹12.0L - ₹20.0L (Senior Frontend / SDE-2)',
      },
      generatedAt: now,
      milestones: [
        {
          id: 'ms-fe-1',
          stepNumber: 1,
          phase: 'Phase 1: Web Foundations, Semantic HTML5 & Modern CSS',
          timeFrame: 'Weeks 1–4',
          description: 'Build fully responsive, accessible web layouts using modern Flexbox, CSS Grid, and utility-first Tailwind CSS.',
          keyCompetencies: ['Semantic HTML & Accessibility', 'CSS Flexbox & CSS Grid', 'Tailwind CSS', 'Mobile-First Responsive Layouts', 'Git & GitHub'],
          tasks: [
            { id: 'fe-1-1', title: 'Build 2 Pixel-Perfect Responsive Landing Pages', description: 'Replicate real SaaS hero sections with mobile drawers and clean typography.', completed: false, category: 'project', estimatedHours: 12 },
            { id: 'fe-1-2', title: 'Learn Git Version Control Workflow', description: 'Master branch management, commit messages, PRs, and GitHub Pages / Vercel deploys.', completed: false, category: 'learning', estimatedHours: 6 },
            { id: 'fe-1-3', title: 'Audit Semantic Markup & Lighthouse Scores', description: 'Ensure 95+ performance, accessibility, and SEO on desktop/mobile.', completed: false, category: 'learning', estimatedHours: 4 },
          ],
          capstoneProject: {
            title: 'Modern Responsive SaaS Showcase Landing Page',
            brief: 'Design and deploy a responsive agency website using Tailwind CSS with dark mode toggle and contact form validation.',
            deliverables: ['Live Vercel / GitHub URL', 'Clean GitHub Repo with README'],
          },
          recommendedResources: ['MDN Web Docs', 'Tailwind CSS Official Docs', 'freeCodeCamp Responsive Web Design'],
          status: 'in_progress',
        },
        {
          id: 'ms-fe-2',
          stepNumber: 2,
          phase: 'Phase 2: Deep Dive JavaScript (ES6+) & Async APIs',
          timeFrame: 'Weeks 5–8',
          description: 'Master core JavaScript concepts asked in technical screening rounds: Closures, Event Loop, Promises, Array methods, and DOM manipulation.',
          keyCompetencies: ['ES6+ (Destructuring, Spread, Modules)', 'Async/Await & Fetch API', 'DOM Event Delegation', 'Data Structures (Arrays, Maps, Sets)'],
          tasks: [
            { id: 'fe-2-1', title: 'Build an Interactive Vanilla JS Dashboard with REST API', description: 'Fetch external weather or currency APIs with search, debounce, and loading states.', completed: false, category: 'project', estimatedHours: 14 },
            { id: 'fe-2-2', title: 'Solve 25 Core JS Machine Coding Problems', description: 'Array flattener, debounce/throttle, memoize, deep clone, and promise polyfills.', completed: false, category: 'learning', estimatedHours: 16 },
            { id: 'fe-2-3', title: 'Understand JavaScript Execution Context & Closures', description: 'Master hoisting, prototype chaining, and memory leaks for Indian tech rounds.', completed: false, category: 'learning', estimatedHours: 8 },
          ],
          capstoneProject: {
            title: 'Real-Time Multi-Currency / Crypto Explorer App',
            brief: 'Build a single-page app utilizing Fetch API, localStorage caching, dynamic search filter, and responsive data cards.',
            deliverables: ['Live App URL on Netlify/Vercel', 'Zero console errors, responsive design'],
          },
          recommendedResources: ['JavaScript.info Guide', 'Namaste JavaScript by Akshay Saini (YouTube)', 'GreatFrontEnd JS Challenges'],
          status: 'upcoming',
        },
        {
          id: 'ms-fe-3',
          stepNumber: 3,
          phase: 'Phase 3: Production React, TypeScript & State Management',
          timeFrame: 'Weeks 9–14',
          description: 'Build scalable Single Page Applications using React 19, TypeScript, Custom Hooks, Zustand/Context, and REST integrations.',
          keyCompetencies: ['React Hooks (useState, useEffect, useMemo)', 'TypeScript Strict Typing', 'Form Validation (React Hook Form / Zod)', 'Vite / Next.js Setup'],
          tasks: [
            { id: 'fe-3-1', title: 'Build Full-Featured React E-Commerce or Job Portal App', description: 'Include cart/saved items, filtering, search, pagination, and mock checkout.', completed: false, category: 'project', estimatedHours: 25 },
            { id: 'fe-3-2', title: 'Convert JavaScript Project to TypeScript', description: 'Add strict interfaces, union types, generic hooks, and type-safe API responses.', completed: false, category: 'learning', estimatedHours: 10 },
            { id: 'fe-3-3', title: 'Implement Client-Side Routing & State Management', description: 'Use React Router v6 and Zustand or React Context for global persistence.', completed: false, category: 'learning', estimatedHours: 12 },
          ],
          capstoneProject: {
            title: 'Full Production React Web Application',
            brief: 'Deploy a polished SaaS dashboard or collaborative task management tool complete with authentication flow, responsive UI, and persistent state.',
            deliverables: ['Live Production Deployment', 'Well-documented GitHub Repo with architecture diagram'],
          },
          recommendedResources: ['React.dev Official Documentation', 'The Odin Project Full Stack JS', 'Epic React by Kent C. Dodds'],
          status: 'upcoming',
        },
        {
          id: 'ms-fe-4',
          stepNumber: 4,
          phase: 'Phase 4: Machine Coding Rounds, Tech Interviews & Hiring',
          timeFrame: 'Weeks 15–18',
          description: 'Master live 60-minute machine coding rounds, frontend system design fundamentals, and salary negotiation for entry tech roles.',
          keyCompetencies: ['Live Machine Coding Execution', 'Frontend Performance Optimization', 'Tech Screening Q&A', 'Resume Project Defense'],
          tasks: [
            { id: 'fe-4-1', title: 'Practice 10 Machine Coding Round Scenarios', description: 'Autocomplete search bar, nested comments system, infinite scroll list, star rating.', completed: false, category: 'interview', estimatedHours: 15 },
            { id: 'fe-4-2', title: 'Complete 3 Full AI Mock Technical Interviews', description: 'Simulate live coding problem walkthroughs and JavaScript architectural questions.', completed: false, category: 'interview', estimatedHours: 8 },
            { id: 'fe-4-3', title: 'Publish Developer Portfolio & Apply to 30 Companies', description: 'Target startups on Wellfound (AngelList), Instahyre, LinkedIn, and Naukri.', completed: false, category: 'networking', estimatedHours: 12 },
          ],
          capstoneProject: {
            title: 'Personal Developer Portfolio & Live Project Hub',
            brief: 'Clean developer showcase featuring 3 production project case studies, live demo links, Lighthouse 100 audit, and ATS resume download.',
            deliverables: ['Custom Portfolio Domain / Subdomain', '3 Featured GitHub Repositories with GIF Previews'],
          },
          recommendedResources: ['JobReady AI Mock Interviewer', 'Frontend Masters Machine Coding Playbook', 'Instahyre & Wellfound Tech Hiring Portals'],
          status: 'upcoming',
        },
      ],
    };
  }

  // 3. DATA ANALYST / BI / SQL / PYTHON
  if (lowerRole.includes('data') || lowerRole.includes('analyst') || lowerRole.includes('bi') || lowerRole.includes('analytics')) {
    return {
      targetRole: role,
      candidateTier: `${exp} (${edu})`,
      currentEducation: edu,
      estimatedTotalMonths: '3 to 5 Months to Offer',
      overallProgressPercent: 0,
      summaryNote: `End-to-end data analytics pathway covering Advanced Excel, SQL queries, Power BI dashboards, and Python exploratory data analysis.`,
      salaryTrajectory: {
        entryLevel: '₹3.5L - ₹5.5L CTC',
        oneYear: '₹5.5L - ₹8.5L (Data Analyst II)',
        threeYears: '₹9.0L - ₹16.0L (Senior BI / Analytics Specialist)',
      },
      generatedAt: now,
      milestones: [
        {
          id: 'ms-da-1',
          stepNumber: 1,
          phase: 'Phase 1: Advanced Excel & Business Problem Solving',
          timeFrame: 'Weeks 1–3',
          description: 'Master XLOOKUP, Pivot Tables, Conditional Aggregations (SUMIFS, COUNTIFS), and basic financial modeling in Microsoft Excel.',
          keyCompetencies: ['Advanced Excel & Google Sheets', 'Data Cleaning & Deduplication', 'Pivot Tables & Slicers', 'Descriptive Statistics'],
          tasks: [
            { id: 'da-1-1', title: 'Master Top 20 Excel Formulas for Business', description: 'XLOOKUP, INDEX/MATCH, IFERROR, DATEDIF, nested IFS, TRIM, TEXTJOIN.', completed: false, category: 'learning', estimatedHours: 8 },
            { id: 'da-1-2', title: 'Build an Interactive Sales Executive KPI Dashboard', description: 'Include interactive date filters, top 10 products chart, and margin trends in Excel.', completed: false, category: 'project', estimatedHours: 10 },
            { id: 'da-1-3', title: 'Learn Basic Data Storytelling & Executive Summaries', description: 'Write 1-page business insights identifying revenue leaks and high-margin segments.', completed: false, category: 'learning', estimatedHours: 4 },
          ],
          capstoneProject: {
            title: 'Indian Retail / E-commerce Excel Audit Report',
            brief: 'Clean and analyze a 10,000-row transactional dataset, building dynamic pivot summaries and revenue visualizations.',
            deliverables: ['Cleaned .xlsx Workbook with Macro/Formulas', 'Executive Summary Slide'],
          },
          recommendedResources: ['Chandoo.org Excel Tutorials', 'Excel Skills for Business (Coursera)', 'Kaggle Datasets'],
          status: 'in_progress',
        },
        {
          id: 'ms-da-2',
          stepNumber: 2,
          phase: 'Phase 2: Relational SQL Mastery for Data Extraction',
          timeFrame: 'Weeks 4–7',
          description: 'Write complex SQL queries (JOINs, GROUP BY, Window Functions, Common Table Expressions) tested by top analytics hiring firms.',
          keyCompetencies: ['PostgreSQL / MySQL', 'Complex Multi-Table JOINs', 'Window Functions (ROW_NUMBER, RANK, LAG/LEAD)', 'CTEs and Subqueries'],
          tasks: [
            { id: 'da-2-1', title: 'Solve 40 SQL Questions on LeetCode / HackerRank', description: 'Practice Easy & Medium SQL questions focusing on aggregations and window metrics.', completed: false, category: 'learning', estimatedHours: 16 },
            { id: 'da-2-2', title: 'Write Customer Retention & Churn Cohort Queries', description: 'Calculate Month-over-Month growth, repeat purchase rates, and churn metrics in SQL.', completed: false, category: 'project', estimatedHours: 12 },
            { id: 'da-2-3', title: 'Understand Database Schema Design & Normalization', description: 'Master Primary/Foreign keys, 3NF, indexing basics, and query optimization.', completed: false, category: 'learning', estimatedHours: 6 },
          ],
          capstoneProject: {
            title: 'Indian Banking / FinTech SQL Analytics Engine',
            brief: 'Write an end-to-end SQL script extracting monthly active users, loan delinquency ratios, and fraud flags.',
            deliverables: ['SQL Script (.sql) with documentation', 'Result Data Tables (.csv)'],
          },
          recommendedResources: ['SQLBolt Interactive Tutorial', 'StrataScratch Data Science SQL', 'Mode Analytics SQL Tutorial'],
          status: 'upcoming',
        },
        {
          id: 'ms-da-3',
          stepNumber: 3,
          phase: 'Phase 3: Interactive Power BI / Tableau Dashboards',
          timeFrame: 'Weeks 8–11',
          description: 'Build polished, interactive business intelligence dashboards with DAX calculations, automated data refreshes, and drill-through visual hierarchy.',
          keyCompetencies: ['Power BI Desktop / Tableau', 'DAX Measures & Calculated Columns', 'Data Modeling (Star Schema)', 'Visual Hierarchy & UI'],
          tasks: [
            { id: 'da-3-1', title: 'Build a Multi-Page Power BI Executive Dashboard', description: 'Create Overview, Regional Breakdown, and Customer Segment pages with cross-filtering.', completed: false, category: 'project', estimatedHours: 18 },
            { id: 'da-3-2', title: 'Master 10 Core DAX Formulas', description: 'CALCULATE, ALL, FILTER, SAMEPERIODLASTYEAR, TOTALYTD, DATEDIFF.', completed: false, category: 'learning', estimatedHours: 8 },
            { id: 'da-3-3', title: 'Publish Dashboard to Power BI Service / Tableau Public', description: 'Make portfolio interactive and shareable with hiring recruiters.', completed: false, category: 'project', estimatedHours: 4 },
          ],
          capstoneProject: {
            title: 'Live Healthcare or Logistics BI Dashboard Portfolio Piece',
            brief: 'Publish a 3-page interactive Power BI dashboard tracking hospital bed utilization or supply chain lead times.',
            deliverables: ['Live Tableau Public / Power BI Web Link', 'Walkthrough Video Presentation (3 mins)'],
          },
          recommendedResources: ['Microsoft Power BI Guided Learning', 'Maven Analytics Dashboard Course', 'Tableau Public Gallery'],
          status: 'upcoming',
        },
        {
          id: 'ms-da-4',
          stepNumber: 4,
          phase: 'Phase 4: Python for EDA, Portfolio Building & Interviews',
          timeFrame: 'Weeks 12–15',
          description: 'Perform exploratory data analysis using Pandas, NumPy, Seaborn in Jupyter Notebooks and practice case study technical interviews.',
          keyCompetencies: ['Python Data Analysis (Pandas, Matplotlib)', 'Jupyter Notebook Presentation', 'Guesstimate & Business Case Studies', 'Analytics Resume Prep'],
          tasks: [
            { id: 'da-4-1', title: 'Complete 2 Python Data Cleaning Case Studies on Kaggle', description: 'Handle missing values, outlier detection, data distribution graphs, and correlation heatmaps.', completed: false, category: 'project', estimatedHours: 14 },
            { id: 'da-4-2', title: 'Practice 10 Indian Analytics Guesstimates & Case Studies', description: '"Estimate the number of Swiggy deliveries in Bangalore per day", "Diagnose why revenue dropped 15%".', completed: false, category: 'interview', estimatedHours: 10 },
            { id: 'da-4-3', title: 'Complete Mock Analytics Interview on JobReady AI', description: 'Practice SQL live query explanation and business insight articulation.', completed: false, category: 'interview', estimatedHours: 6 },
          ],
          capstoneProject: {
            title: 'Comprehensive Data Analyst Portfolio Showcase',
            brief: 'Publish a GitHub repository and Notion/PDF portfolio featuring 3 diverse projects: Excel KPI sheet, SQL Cohort analysis, and Power BI live dashboard.',
            deliverables: ['Data Analyst Portfolio Link (GitHub + Tableau Public)', '1-Page ATS Analytics Resume'],
          },
          recommendedResources: ['JobReady AI Interview Evaluator', 'Kaggle Python Micro-Courses', 'Analytics India Magazine Career Hub'],
          status: 'upcoming',
        },
      ],
    };
  }

  // 4. GENERAL PROFESSIONAL / ENTRY LEVEL DEFAULT (Customer Support, Digital Marketing, Operations, HR, Generic)
  return {
    targetRole: role,
    candidateTier: `${exp} (${edu})`,
    currentEducation: edu,
    estimatedTotalMonths: '2 to 4 Months to Offer',
    overallProgressPercent: 0,
    summaryNote: `A practical milestone roadmap tailored for ${edu} candidates looking to break into the ${role} domain with recognized skills, portfolio assets, and interview confidence.`,
    salaryTrajectory: {
      entryLevel: '₹2.2L - ₹3.8L CTC',
      oneYear: '₹3.8L - ₹5.5L (Specialist / Team Lead)',
      threeYears: '₹6.0L - ₹10.0L (Department Manager)',
    },
    generatedAt: now,
    milestones: [
      {
        id: 'ms-gen-1',
        stepNumber: 1,
        phase: 'Phase 1: Domain Knowledge & Industry Tool Foundations',
        timeFrame: 'Weeks 1–3',
        description: `Learn the essential daily responsibilities, standard Indian workplace processes, and industry tools required for a successful ${role}.`,
        keyCompetencies: ['Domain Terminology & Workflows', 'Business Communication (English & Hindi)', 'MS Office Suite (Excel, Word, PowerPoint)', 'Digital Collaboration Tools (Slack, Google Workspace)'],
        tasks: [
          { id: 'gen-1-1', title: `Complete Foundations Course for ${role}`, description: 'Learn daily workflows, core deliverables, and customer/client relationship expectations.', completed: false, category: 'learning', estimatedHours: 8 },
          { id: 'gen-1-2', title: 'Master Microsoft Excel & Google Sheets Basics', description: 'Data entry, filters, sorting, basic formulas (VLOOKUP, SUM), and clean formatting.', completed: false, category: 'learning', estimatedHours: 6 },
          { id: 'gen-1-3', title: 'Draft 5 Standard Professional Email Templates', description: 'Client follow-ups, internal updates, escalations, and meeting agendas.', completed: false, category: 'project', estimatedHours: 4 },
        ],
        capstoneProject: {
          title: 'Standard Operating Procedure (SOP) Reference Guide',
          brief: 'Compile a 3-page document detailing best practices, escalation protocols, and daily checklists for your target role.',
          deliverables: ['3-Page SOP Document (.pdf or .docx)', 'Sample Workflow Diagram'],
        },
        recommendedResources: ['Coursera Professional Certificate Programs', 'Google Career Certificates', 'LinkedIn Learning Free Courses'],
        status: 'in_progress',
      },
      {
        id: 'ms-gen-2',
        stepNumber: 2,
        phase: 'Phase 2: Applied Practical Assignments & Case Scenarios',
        timeFrame: 'Weeks 4–7',
        description: `Execute hands-on realistic scenarios reflecting a real work day as a ${role} to prove operational competence.`,
        keyCompetencies: ['Problem Solving & Escalation Handling', 'Time Management & Prioritization', 'Data Reporting & Status Tracking', 'Stakeholder Communication'],
        tasks: [
          { id: 'gen-2-1', title: 'Complete 3 Real-World Workplace Simulations', description: 'Resolve mock operational bottlenecks, customer disputes, or project deadlines.', completed: false, category: 'project', estimatedHours: 10 },
          { id: 'gen-2-2', title: 'Earn a Recognized Free Industry Badge / Certificate', description: 'Complete a relevant credential on Google Digital Garage, HubSpot Academy, or Great Learning.', completed: false, category: 'certification', estimatedHours: 8 },
          { id: 'gen-2-3', title: 'Build a Weekly Progress & KPI Reporting Sheet', description: 'Create an automated dashboard tracking weekly metrics, resolved tickets, or task statuses.', completed: false, category: 'project', estimatedHours: 6 },
        ],
        capstoneProject: {
          title: 'Practical Work Sample Case Study',
          brief: 'Document a detailed case study resolving a complex operational challenge with measurable positive outcomes.',
          deliverables: ['Case Study Presentation (5-7 Slides in PPT/Canva)'],
        },
        recommendedResources: ['HubSpot Academy', 'Google Digital Garage', 'JobReady AI Career Resource Library'],
        status: 'upcoming',
      },
      {
        id: 'ms-gen-3',
        stepNumber: 3,
        phase: 'Phase 3: ATS Resume & Targeted Indian Job Outreach',
        timeFrame: 'Weeks 8–10',
        description: 'Build a recruiter-ready resume tailored to Indian hiring filters and expand networking across LinkedIn, Naukri, and Internshala.',
        keyCompetencies: ['ATS Resume Optimization', 'LinkedIn Branding & Networking', 'Naukri.com Profile Visibility Score', 'Targeted Application Strategy'],
        tasks: [
          { id: 'gen-3-1', title: `Optimize ATS Resume for ${role}`, description: 'Highlight action verbs, measurable outcomes, relevant certifications, and tools.', completed: false, category: 'certification', estimatedHours: 4 },
          { id: 'gen-3-2', title: 'Complete 100% of LinkedIn & Naukri Profile Fields', description: 'Add strong headline, summary, key skills, and sample project work.', completed: false, category: 'networking', estimatedHours: 5 },
          { id: 'gen-3-3', title: 'Reach Out to 15 HR Recruiters & Team Leads', description: 'Send concise, professional introduction messages highlighting availability and top skills.', completed: false, category: 'networking', estimatedHours: 8 },
        ],
        capstoneProject: {
          title: 'Professional Job Application Package',
          brief: 'Prepare a customized resume, cover letter template, and verified digital portfolio ready for immediate recruiter submission.',
          deliverables: ['1-Page ATS Resume PDF', 'Customized Cover Letter', 'LinkedIn Profile URL'],
        },
        recommendedResources: ['JobReady AI Resume Tailorer', 'Naukri Recruiter Search Guide', 'LinkedIn Job Seeker Toolkit'],
        status: 'upcoming',
      },
      {
        id: 'ms-gen-4',
        stepNumber: 4,
        phase: 'Phase 4: Behavioral Interviews, Salary Negotiation & Offer Acceptance',
        timeFrame: 'Weeks 11–13',
        description: 'Practice behavioral interview questions using the STAR technique, ace communication rounds, and negotiate your entry CTC.',
        keyCompetencies: ['STAR Method Behavioral Answers', 'Confidence & Clarity in English/Hindi', 'Salary & Compensation Breakdown Understanding', 'Offer Letter Due Diligence'],
        tasks: [
          { id: 'gen-4-1', title: 'Practice 15 Standard HR Interview Questions', description: '"Tell me about yourself", "Strengths/Weaknesses", "Why this company?", "Conflict resolution".', completed: false, category: 'interview', estimatedHours: 8 },
          { id: 'gen-4-2', title: 'Complete AI Speech & Mock Interview on JobReady AI', description: 'Get actionable feedback on pacing, confidence, clarity, and keyword coverage.', completed: false, category: 'interview', estimatedHours: 6 },
          { id: 'gen-4-3', title: 'Understand Indian CTC Components & Probation Terms', description: 'Review Basic, HRA, Provident Fund (PF), ESIC, Professional Tax, and notice periods.', completed: false, category: 'learning', estimatedHours: 4 },
        ],
        capstoneProject: {
          title: 'First-90-Days Job Success Roadmap',
          brief: 'Create a personal guide outlining learning milestones, supervisor check-ins, and key performance expectations for your new role.',
          deliverables: ['First-90-Days Action Plan (2 Pages)'],
        },
        recommendedResources: ['JobReady AI Mock Interview Hub', 'Glassdoor Indian Interview Archive', 'Indian Labor & PF Guidelines Guide'],
        status: 'upcoming',
      },
    ],
  };
}

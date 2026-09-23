import { ResourceItem, ResourceCategory, CareerProfile } from '../types';

const BOOKMARKED_RESOURCES_KEY = 'jobready_bookmarked_resources_ids';
const COMPLETED_RESOURCES_KEY = 'jobready_completed_resources_ids';

export const CURATED_RESOURCE_CATALOG: ResourceItem[] = [
  // -------------------------------------------------------------
  // 1. FRONTEND DEVELOPER & WEB DEVELOPMENT
  // -------------------------------------------------------------
  {
    id: 'fe-roadmap',
    title: 'Frontend Developer Roadmap (Interactive Guide)',
    description: 'Step-by-step visual roadmap with curated community links covering HTML5, CSS3, Modern JS (ES6+), React 19, and Next.js.',
    category: 'Study Materials',
    pricing: 'Free',
    provider: 'roadmap.sh',
    url: 'https://roadmap.sh/frontend',
    estimatedDuration: 'Self-paced (4-8 weeks)',
    difficulty: 'Beginner',
    tags: ['Frontend', 'HTML/CSS', 'JavaScript', 'React', 'Web Standards'],
    targetRoles: ['Frontend Developer', 'Full Stack Engineer', 'Web Developer', 'UI/UX Designer', 'Software Engineer'],
    rating: 4.9,
    learnerCount: '500k+ students',
    isFeatured: true,
  },
  {
    id: 'fe-the-odin-project',
    title: 'The Odin Project: Full Stack JavaScript Curriculum',
    description: 'World-renowned open-source full stack bootcamp focusing on hands-on git, responsive CSS flexbox/grid, Node.js, and React architecture.',
    category: 'Courses & Bootcamps',
    pricing: 'Free',
    provider: 'The Odin Project',
    url: 'https://www.theodinproject.com/paths/full-stack-javascript',
    estimatedDuration: '3-6 Months',
    difficulty: 'Intermediate',
    tags: ['Bootcamp', 'React', 'Node.js', 'Git', 'Portfolio Projects'],
    targetRoles: ['Frontend Developer', 'Full Stack Engineer', 'Web Developer', 'Software Engineer'],
    rating: 4.9,
    learnerCount: '350k+ graduates',
    isFeatured: true,
  },
  {
    id: 'fe-meta-cert',
    title: 'Meta Frontend Developer Professional Certificate',
    description: 'Official industry certification by Meta covering JavaScript, React, UI frameworks, version control, and capstone production deployment.',
    category: 'Certification Guides',
    pricing: 'Free with Audit',
    provider: 'Meta & Coursera',
    url: 'https://www.coursera.org/professional-certificates/meta-front-end-developer',
    estimatedDuration: '7 Months (6 hrs/wk)',
    difficulty: 'Beginner',
    tags: ['Certification', 'Meta', 'React', 'UI Frameworks', 'Resume Boost'],
    targetRoles: ['Frontend Developer', 'Web Developer', 'Software Engineer', 'Full Stack Engineer'],
    rating: 4.8,
    learnerCount: '210k+ enrolled',
    isFeatured: true,
  },
  {
    id: 'fe-javascript-info',
    title: 'JavaScript.info: Deep Dive Modern JavaScript',
    description: 'The master reference text covering event loop, closures, promises, async/await, prototypes, and browser DOM manipulation.',
    category: 'Study Materials',
    pricing: 'Free',
    provider: 'JavaScript.info',
    url: 'https://javascript.info/',
    estimatedDuration: '40 Hours',
    difficulty: 'Intermediate',
    tags: ['JavaScript', 'DOM', 'Async JS', 'Interview Prep'],
    targetRoles: ['Frontend Developer', 'Full Stack Engineer', 'Backend Developer'],
    rating: 4.9,
    learnerCount: '1M+ readers',
  },
  {
    id: 'fe-greatfrontend',
    title: 'Front End Interview Handbook & Coding Challenges',
    description: 'Curated technical interview questions, DOM challenges, UI system design templates, and behavioral answer strategies.',
    category: 'Interview Kits',
    pricing: 'Free',
    provider: 'GreatFrontEnd',
    url: 'https://www.greatfrontend.com/',
    estimatedDuration: '2-3 Weeks',
    difficulty: 'Intermediate',
    tags: ['Interview Prep', 'Algorithms', 'UI System Design', 'Live Coding'],
    targetRoles: ['Frontend Developer', 'Full Stack Engineer', 'Web Developer'],
    rating: 4.8,
    learnerCount: '80k+ candidates',
  },

  // -------------------------------------------------------------
  // 2. BACKEND & FULL STACK SOFTWARE ENGINEERING
  // -------------------------------------------------------------
  {
    id: 'be-roadmap',
    title: 'Backend Engineering Roadmap & Architecture Guide',
    description: 'Exhaustive guide to RESTful APIs, relational databases, caching, message queues (Kafka, RabbitMQ), and microservices.',
    category: 'Study Materials',
    pricing: 'Free',
    provider: 'roadmap.sh',
    url: 'https://roadmap.sh/backend',
    estimatedDuration: '6-10 Weeks',
    difficulty: 'Intermediate',
    tags: ['Backend', 'APIs', 'PostgreSQL', 'System Design', 'Docker'],
    targetRoles: ['Backend Developer', 'Full Stack Engineer', 'Software Engineer', 'DevOps Engineer'],
    rating: 4.9,
    learnerCount: '450k+ students',
    isFeatured: true,
  },
  {
    id: 'be-cs50',
    title: 'CS50: Introduction to Computer Science',
    description: 'Harvard University entry-level computer science course teaching algorithms, data structures, memory management, C, Python, and SQL.',
    category: 'Courses & Bootcamps',
    pricing: 'Free',
    provider: 'Harvard University (edX)',
    url: 'https://cs50.harvard.edu/x/',
    estimatedDuration: '10-12 Weeks',
    difficulty: 'All Levels',
    tags: ['CS Fundamentals', 'Algorithms', 'C', 'Python', 'SQL'],
    targetRoles: ['Software Engineer', 'Backend Developer', 'Full Stack Engineer', 'Data Analyst'],
    rating: 4.9,
    learnerCount: '3.5M+ students',
    isFeatured: true,
  },
  {
    id: 'be-aws-cloud-cert',
    title: 'AWS Certified Solutions Architect – Associate Study Guide',
    description: 'Comprehensive study blueprint, practice exams, and architectural labs for AWS EC2, S3, RDS, Lambda, and IAM security.',
    category: 'Certification Guides',
    pricing: 'Official Certification',
    provider: 'Amazon Web Services (AWS)',
    url: 'https://aws.amazon.com/certification/certified-solutions-architect-associate/',
    estimatedDuration: '2-3 Months',
    difficulty: 'Intermediate',
    tags: ['AWS', 'Cloud', 'Infrastructure', 'Certification', 'High In-Demand'],
    targetRoles: ['Backend Developer', 'Cloud Engineer', 'DevOps Engineer', 'Software Engineer', 'Full Stack Engineer'],
    rating: 4.9,
    learnerCount: '150k+ certified',
    isFeatured: true,
  },
  {
    id: 'be-neetcode-150',
    title: 'NeetCode 150: Data Structures & Algorithms Roadmap',
    description: 'Visual video walkthroughs and problem patterns for the most common LeetCode coding interview questions grouped by topic.',
    category: 'Interview Kits',
    pricing: 'Free',
    provider: 'NeetCode.io',
    url: 'https://neetcode.io/practice',
    estimatedDuration: '4-8 Weeks',
    difficulty: 'Intermediate',
    tags: ['DSA', 'LeetCode', 'Technical Interviews', 'Problem Solving'],
    targetRoles: ['Software Engineer', 'Backend Developer', 'Frontend Developer', 'Full Stack Engineer'],
    rating: 4.9,
    learnerCount: '300k+ engineers',
  },

  // -------------------------------------------------------------
  // 3. DATA ANALYST & BUSINESS INTELLIGENCE
  // -------------------------------------------------------------
  {
    id: 'da-google-cert',
    title: 'Google Data Analytics Professional Certificate',
    description: 'Industry-standard credential for entry-level data analysts covering SQL, R/Python, Spreadsheets, Tableau visualizations, and data cleaning.',
    category: 'Certification Guides',
    pricing: 'Free with Audit',
    provider: 'Google Career Certificates',
    url: 'https://www.coursera.org/professional-certificates/google-data-analytics',
    estimatedDuration: '6 Months (10 hrs/wk)',
    difficulty: 'Beginner',
    tags: ['SQL', 'Tableau', 'R', 'Data Cleaning', 'Google Cert'],
    targetRoles: ['Data Analyst', 'Business Analyst', 'Operations Analyst', 'Financial Analyst'],
    rating: 4.8,
    learnerCount: '1.2M+ enrolled',
    isFeatured: true,
  },
  {
    id: 'da-sqlzoo',
    title: 'SQLZoo: Interactive SQL Tutorials & Cheat Sheets',
    description: 'Interactive SQL exercises with immediate queries execution covering SELECT, JOIN, GROUP BY, HAVING, subqueries, and window functions.',
    category: 'Study Materials',
    pricing: 'Free',
    provider: 'SQLZoo.net',
    url: 'https://sqlzoo.net/',
    estimatedDuration: '15 Hours',
    difficulty: 'Beginner',
    tags: ['SQL', 'Relational DB', 'Queries', 'Practice Labs'],
    targetRoles: ['Data Analyst', 'Business Analyst', 'Backend Developer', 'QA Test Engineer'],
    rating: 4.7,
    learnerCount: '400k+ learners',
  },
  {
    id: 'da-powerbi-microsoft',
    title: 'Microsoft Certified: Power BI Data Analyst Associate (PL-300)',
    description: 'Official Microsoft learning path for preparing data models, DAX measures, interactive dashboards, and Power BI service workspaces.',
    category: 'Certification Guides',
    pricing: 'Official Certification',
    provider: 'Microsoft Learn',
    url: 'https://learn.microsoft.com/en-us/credentials/certifications/data-analyst-associate/',
    estimatedDuration: '6-8 Weeks',
    difficulty: 'Intermediate',
    tags: ['Power BI', 'DAX', 'Microsoft', 'Dashboards', 'Certification'],
    targetRoles: ['Data Analyst', 'Business Analyst', 'Operations Analyst'],
    rating: 4.8,
    learnerCount: '90k+ certified',
  },

  // -------------------------------------------------------------
  // 4. UI/UX DESIGN & PRODUCT DESIGN
  // -------------------------------------------------------------
  {
    id: 'ux-google-cert',
    title: 'Google UX Design Professional Certificate',
    description: 'Learn foundational design thinking, user research, wireframing, Figma prototyping, and usability testing with portfolio case studies.',
    category: 'Certification Guides',
    pricing: 'Free with Audit',
    provider: 'Google Career Certificates',
    url: 'https://www.coursera.org/professional-certificates/google-ux-design',
    estimatedDuration: '6 Months',
    difficulty: 'Beginner',
    tags: ['UI/UX', 'Figma', 'User Research', 'Wireframes', 'Google Cert'],
    targetRoles: ['UI/UX Designer', 'Product Designer', 'Frontend Developer', 'Graphic Designer'],
    rating: 4.8,
    learnerCount: '650k+ learners',
    isFeatured: true,
  },
  {
    id: 'ux-refactoring-ui',
    title: 'Refactoring UI: Visual Design Fundamentals for Developers',
    description: 'Practical visual design guide covering typographic scales, white-space balance, color palette curation, and accessible layout rules.',
    category: 'Study Materials',
    pricing: 'Free',
    provider: 'Tailwind Labs',
    url: 'https://www.refactoringui.com/',
    estimatedDuration: '2 Weeks',
    difficulty: 'All Levels',
    tags: ['UI Design', 'Typography', 'Hierarchy', 'Spacing'],
    targetRoles: ['UI/UX Designer', 'Frontend Developer', 'Product Designer'],
    rating: 4.9,
    learnerCount: '100k+ designers',
  },

  // -------------------------------------------------------------
  // 5. QA & SOFTWARE TESTING
  // -------------------------------------------------------------
  {
    id: 'qa-istqb-guide',
    title: 'ISTQB Certified Tester Foundation Level (CTFL) Guide',
    description: 'Standard syllabus, mock sample exam papers, and test design techniques (boundary value, equivalence partitioning) for QA testers.',
    category: 'Certification Guides',
    pricing: 'Official Certification',
    provider: 'ISTQB Official',
    url: 'https://www.istqb.org/certifications/certified-tester-foundation-level',
    estimatedDuration: '4 Weeks',
    difficulty: 'Beginner',
    tags: ['QA', 'Manual Testing', 'ISTQB', 'Bug Lifecycle', 'Test Cases'],
    targetRoles: ['QA Test Engineer', 'Software Tester', 'Automation Engineer'],
    rating: 4.7,
    learnerCount: '800k+ certified',
  },
  {
    id: 'qa-playwright-bootcamp',
    title: 'Playwright & Selenium Modern Automation Guide',
    description: 'Modern end-to-end testing handbook for writing automated UI & API tests with TypeScript, CI/CD integration, and parallel workers.',
    category: 'Study Materials',
    pricing: 'Free',
    provider: 'Playwright.dev',
    url: 'https://playwright.dev/docs/intro',
    estimatedDuration: '3 Weeks',
    difficulty: 'Intermediate',
    tags: ['Playwright', 'Automated Testing', 'TypeScript', 'E2E Testing'],
    targetRoles: ['QA Test Engineer', 'Automation Engineer', 'Full Stack Engineer'],
    rating: 4.9,
    learnerCount: '90k+ test engineers',
  },

  // -------------------------------------------------------------
  // 6. CUSTOMER SUPPORT & BUSINESS OPERATIONS
  // -------------------------------------------------------------
  {
    id: 'cs-zendesk-training',
    title: 'Zendesk Support Professional Learning Path',
    description: 'Official workflows for ticket triage, SLA compliance, customer de-escalation scripts, and omni-channel helpdesk management.',
    category: 'Certification Guides',
    pricing: 'Free',
    provider: 'Zendesk Training',
    url: 'https://training.zendesk.com/',
    estimatedDuration: '2 Weeks',
    difficulty: 'Beginner',
    tags: ['Customer Support', 'Helpdesk', 'Zendesk', 'SLA', 'Client Communication'],
    targetRoles: ['Customer Support Executive', 'Operations Associate', 'Technical Support Specialist'],
    rating: 4.6,
    learnerCount: '120k+ agents',
  },
  {
    id: 'cs-communication-masterclass',
    title: 'Business Communication & De-escalation Toolkit',
    description: 'Comprehensive communication playbook for professional email etiquette, active listening, conflict resolution, and CRM documentation.',
    category: 'Study Materials',
    pricing: 'Free',
    provider: 'HubSpot Academy',
    url: 'https://academy.hubspot.com/',
    estimatedDuration: '8 Hours',
    difficulty: 'All Levels',
    tags: ['Communication', 'De-escalation', 'CRM', 'Support Skills'],
    targetRoles: ['Customer Support Executive', 'Sales Executive', 'Operations Analyst', 'Human Resources Associate'],
    rating: 4.8,
    learnerCount: '250k+ students',
  },

  // -------------------------------------------------------------
  // 7. DIGITAL MARKETING & SALES
  // -------------------------------------------------------------
  {
    id: 'dm-google-digital-garage',
    title: 'Google Digital Marketing & E-Commerce Certificate',
    description: 'Covers SEO fundamentals, Google Ads, social media marketing campaigns, email automation, and conversion rate analytics.',
    category: 'Certification Guides',
    pricing: 'Free with Audit',
    provider: 'Google Career Certificates',
    url: 'https://www.coursera.org/professional-certificates/google-digital-marketing-ecommerce',
    estimatedDuration: '6 Months',
    difficulty: 'Beginner',
    tags: ['Marketing', 'SEO', 'Google Ads', 'Social Media', 'Analytics'],
    targetRoles: ['Digital Marketing Specialist', 'Content Creator', 'Sales Executive', 'Business Development Associate'],
    rating: 4.8,
    learnerCount: '450k+ marketers',
    isFeatured: true,
  },
  {
    id: 'dm-hubspot-inbound',
    title: 'HubSpot Inbound Marketing & Sales Certification',
    description: 'Learn organic lead generation, customer journey mapping, lead nurturing funnels, and CRM pipeline management.',
    category: 'Certification Guides',
    pricing: 'Free',
    provider: 'HubSpot Academy',
    url: 'https://academy.hubspot.com/courses/inbound-marketing',
    estimatedDuration: '10 Hours',
    difficulty: 'Beginner',
    tags: ['Inbound Marketing', 'Sales Pipeline', 'Lead Gen', 'Free Cert'],
    targetRoles: ['Digital Marketing Specialist', 'Sales Executive', 'Business Development Associate'],
    rating: 4.7,
    learnerCount: '300k+ certified',
  },

  // -------------------------------------------------------------
  // 8. GENERAL INTERVIEW KITS & RESUME PLAYBOOKS
  // -------------------------------------------------------------
  {
    id: 'gen-star-method-kit',
    title: 'The STAR Method Behavioral Interview Master Kit',
    description: 'Step-by-step breakdown of Situation, Task, Action, Result frameworks with 50+ real interview response scripts and templates.',
    category: 'Interview Kits',
    pricing: 'Free',
    provider: 'JobReady Academy',
    url: 'https://www.themuse.com/advice/star-interview-method',
    estimatedDuration: '3 Hours',
    difficulty: 'All Levels',
    tags: ['STAR Method', 'Behavioral Questions', 'HR Round', 'High Impact'],
    targetRoles: ['all'],
    rating: 4.9,
    learnerCount: '150k+ applicants',
    isFeatured: true,
  },
  {
    id: 'gen-ats-resume-playbook',
    title: 'ATS Resume Architecture & Keyword Matching Guide',
    description: 'Action-verb dictionaries, formatting rules for parsing software, and metric-driven bullet point formulas (Google XYZ format).',
    category: 'Study Materials',
    pricing: 'Free',
    provider: 'JobReady Career Lab',
    url: 'https://careers.google.com/how-we-hire/',
    estimatedDuration: '4 Hours',
    difficulty: 'All Levels',
    tags: ['ATS Resume', 'Action Verbs', 'Formatting', 'Recruiter Secrets'],
    targetRoles: ['all'],
    rating: 4.9,
    learnerCount: '200k+ candidates',
    isFeatured: true,
  },
];

export function getBookmarkedResourceIds(): string[] {
  try {
    const raw = localStorage.getItem(BOOKMARKED_RESOURCES_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

export function toggleResourceBookmark(resourceId: string): boolean {
  const current = getBookmarkedResourceIds();
  const exists = current.includes(resourceId);
  const updated = exists
    ? current.filter((id) => id !== resourceId)
    : [...current, resourceId];
  try {
    localStorage.setItem(BOOKMARKED_RESOURCES_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
  return !exists;
}

export function getCompletedResourceIds(): string[] {
  try {
    const raw = localStorage.getItem(COMPLETED_RESOURCES_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

export function toggleResourceCompleted(resourceId: string): boolean {
  const current = getCompletedResourceIds();
  const exists = current.includes(resourceId);
  const updated = exists
    ? current.filter((id) => id !== resourceId)
    : [...current, resourceId];
  try {
    localStorage.setItem(COMPLETED_RESOURCES_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
  return !exists;
}

export function getCuratedResourcesForProfile(
  profile: CareerProfile | null,
  options: {
    category?: ResourceCategory;
    searchQuery?: string;
    onlyBookmarked?: boolean;
    onlyRoleSpecific?: boolean;
  } = {}
): {
  matchedResources: ResourceItem[];
  roleSpecificCount: number;
  totalAvailableCount: number;
  targetJob: string;
} {
  const targetJob = profile?.targetJob?.trim() || 'Software Engineer';
  const bookmarkedIds = getBookmarkedResourceIds();

  const isMatchingRole = (resource: ResourceItem, job: string): boolean => {
    if (resource.targetRoles.includes('all')) return true;
    const lowerJob = job.toLowerCase();
    return resource.targetRoles.some(
      (role) =>
        lowerJob.includes(role.toLowerCase()) ||
        role.toLowerCase().includes(lowerJob)
    );
  };

  let resources = [...CURATED_RESOURCE_CATALOG];

  // Count how many match the user's specific target job
  const roleSpecific = resources.filter(
    (r) => !r.targetRoles.includes('all') && isMatchingRole(r, targetJob)
  );

  // Sorting: Prioritize role-specific items first, then general featured
  resources.sort((a, b) => {
    const aMatch = isMatchingRole(a, targetJob);
    const bMatch = isMatchingRole(b, targetJob);
    if (aMatch && !bMatch) return -1;
    if (!aMatch && bMatch) return 1;
    if (a.isFeatured && !b.isFeatured) return -1;
    if (!a.isFeatured && b.isFeatured) return 1;
    return (b.rating || 0) - (a.rating || 0);
  });

  // Apply category filter
  if (options.category && options.category !== 'All Resources') {
    resources = resources.filter((r) => r.category === options.category);
  }

  // Apply bookmarks only filter
  if (options.onlyBookmarked) {
    resources = resources.filter((r) => bookmarkedIds.includes(r.id));
  }

  // Apply role specific only filter
  if (options.onlyRoleSpecific) {
    resources = resources.filter((r) => isMatchingRole(r, targetJob));
  }

  // Apply search query filter
  if (options.searchQuery && options.searchQuery.trim() !== '') {
    const query = options.searchQuery.toLowerCase().trim();
    resources = resources.filter(
      (r) =>
        r.title.toLowerCase().includes(query) ||
        r.description.toLowerCase().includes(query) ||
        r.provider.toLowerCase().includes(query) ||
        r.tags.some((tag) => tag.toLowerCase().includes(query))
    );
  }

  return {
    matchedResources: resources,
    roleSpecificCount: roleSpecific.length,
    totalAvailableCount: CURATED_RESOURCE_CATALOG.length,
    targetJob,
  };
}

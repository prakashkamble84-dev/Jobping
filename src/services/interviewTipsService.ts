import { RoleInterviewPrepGuide, InterviewTipItem, CareerProfile } from '../types';

const BOOKMARKED_TIPS_KEY_PREFIX = 'jobready_bookmarked_tips_';
const CACHED_AI_GUIDE_PREFIX = 'jobready_ai_interview_guide_';

export const BASE_INTERVIEW_TIPS: Record<string, RoleInterviewPrepGuide> = {
  default: {
    targetRole: 'General Professional',
    roundTips: [
      {
        id: 'beh-star-1',
        roundType: 'behavioral',
        title: 'Mastering the STAR Storytelling Framework',
        categoryTag: 'STAR Method',
        summary: 'Structure every behavioral story with Situation, Task, Action, and Result to convey competence and leadership.',
        recommendedFramework: 'Situation (15%) ➔ Task (15%) ➔ Action (50% - Focus on YOUR specific actions) ➔ Result (20% - Metrics & impact)',
        sampleQuestion: 'Tell me about a time you had to deliver a critical project under a tight deadline or high pressure.',
        sampleAnswerTemplate: 'In my previous project at [Company/College], we had [Situation]. My responsibility was to [Task]. I immediately [Action 1: prioritized tasks], [Action 2: communicated proactively with stakeholders], and [Action 3: optimized the workflow]. As a result, we [Result: delivered 2 days ahead of schedule, with zero critical defects].',
        proTips: [
          'Always use "I" instead of "We" when explaining the Action part.',
          'Quantify your results with percentages, hours saved, or revenue generated.',
          'Keep the entire answer under 2 minutes to maintain the interviewer’s attention.'
        ],
        commonMistakesToAvoid: [
          'Spending 80% of the time explaining the background situation instead of your personal actions.',
          'Omitting the concrete result or learnings gained.'
        ]
      },
      {
        id: 'beh-conflict-2',
        roundType: 'behavioral',
        title: 'Handling Disagreements and Constructive Feedback',
        categoryTag: 'Conflict Resolution',
        summary: 'Demonstrate emotional intelligence, empathy, and focus on team objectives rather than ego.',
        recommendedFramework: 'Acknowledge Perspective ➔ Seek Common Ground ➔ Propose Objective Solution ➔ Positive Outcome',
        sampleQuestion: 'Describe a situation where you strongly disagreed with a team member or manager. How did you resolve it?',
        sampleAnswerTemplate: 'During [Project], my colleague and I had differing opinions on [Methodology A vs B]. Instead of debating, I scheduled a 1-on-1 discussion to understand their constraints. We outlined objective benchmarks, tested both approaches with a small pilot, and agreed on [Methodology], which improved our efficiency by 20%.',
        proTips: [
          'Focus on facts and data rather than personal emotions.',
          'Emphasize active listening and collaboration.'
        ],
        commonMistakesToAvoid: [
          'Badmouthing a past manager or colleague.',
          'Claiming you have never had any disagreements.'
        ]
      },
      {
        id: 'tech-thought-1',
        roundType: 'technical',
        title: 'Explaining Your Thought Process Out Loud',
        categoryTag: 'Problem Solving',
        summary: 'Interviewers evaluate your logical reasoning and problem breakdown skills more than memorized answers.',
        recommendedFramework: 'Clarify Constraints ➔ State Assumptions ➔ Propose High-Level Plan ➔ Execute Step-by-Step ➔ Validate & Optimize',
        sampleQuestion: 'How would you approach solving an unfamiliar technical problem or system bottleneck?',
        sampleAnswerTemplate: 'First, I ask clarifying questions to identify edge cases and constraints. Next, I break the problem into modular components. I start with a working baseline approach, analyze its trade-offs, and then optimize for performance and scalability.',
        proTips: [
          'Never jump into coding or execution in complete silence for more than 30 seconds.',
          'Ask clarifying questions before writing code or making system decisions.'
        ],
        commonMistakesToAvoid: [
          'Pretending to know something you don’t—it is better to say: "I haven\'t used tool X directly, but based on my experience with tool Y, here is how I would reason through it."'
        ]
      },
      {
        id: 'hr-pitch-1',
        roundType: 'hr',
        title: 'The 90-Second "Tell Me About Yourself" Elevator Pitch',
        categoryTag: 'Elevator Pitch',
        summary: 'The opening question sets the psychological anchor for the entire interview. Focus on Present ➔ Past ➔ Future.',
        recommendedFramework: 'Present (Who you are & current focus) ➔ Past (2 key achievements/projects) ➔ Future (Why this specific company & role excites you)',
        sampleQuestion: 'Could you walk me through your resume and introduce yourself?',
        sampleAnswerTemplate: 'I am a [Target Role / Qualification] with strong hands-on experience in [Top 2 Skills]. Most recently, I completed [Key Project / Internship], where I [Quantified Achievement]. Prior to that, I built foundational skills in [Domain]. I have been following [Company Name]\'s recent work in [Specific Product/Initiative], and I am excited to contribute my skills in [Key Skill] to your team.',
        proTips: [
          'Do not recite every line on your resume in chronological order.',
          'Tailor the final "Future" sentence to the company’s current hiring mission.'
        ],
        commonMistakesToAvoid: [
          'Sharing personal life history or hobbies that are irrelevant to the job qualifications.'
        ]
      },
      {
        id: 'hr-weakness-2',
        roundType: 'hr',
        title: 'Answering "What is Your Greatest Weakness?" with Authenticity',
        categoryTag: 'Self-Awareness',
        summary: 'Turn a genuine area of improvement into proof of growth mindset and proactive self-development.',
        recommendedFramework: 'Genuine Non-Critical Skill ➔ Context/Awareness ➔ Proactive Step Taken ➔ Measurable Improvement',
        sampleQuestion: 'What would you consider your biggest weakness or area for improvement?',
        sampleAnswerTemplate: 'In the past, I used to hesitate before delegating tasks or speaking up in large cross-functional meetings. Realizing this slowed down team velocity, I enrolled in public speaking practice and began preparing structured 3-bullet talking points before every sync. This has significantly increased my confidence in presenting to senior stakeholders.',
        proTips: [
          'Never use cliché answers like "I am a perfectionist" or "I work too hard".',
          'Pick a real technical or soft skill that is not a core disqualifier for the role, and show what you are actively doing to improve.'
        ]
      },
      {
        id: 'sal-negotiation-1',
        roundType: 'salary',
        title: 'Discussing CTC Expectations and Salary Ranges in India / Global Markets',
        categoryTag: 'Salary Anchor',
        summary: 'Navigate compensation questions with market data benchmarks without underselling or alienating the recruiter.',
        recommendedFramework: 'Market Range Benchmark ➔ Total Rewards Perspective ➔ Flexibility on In-Hand vs Fixed CTC',
        sampleQuestion: 'What are your CTC expectations for this position?',
        sampleAnswerTemplate: 'Based on current market benchmarks for [Role] with my skill set in [City/Remote], I am looking for a total compensation package in the range of [e.g., ₹6 LPA to ₹8.5 LPA / $70K - $85K]. However, for me, the right team culture, learning curve, and long-term career trajectory are equally important, and I am open to a competitive offer matching the role’s scope.',
        proTips: [
          'Research market medians beforehand using AmbitionBox, Glassdoor, and our AI Salary Benchmarker.',
          'Clarify the breakdown: Fixed Component, Variable/Performance Bonus, Health Insurance, and ESOPs.'
        ],
        commonMistakesToAvoid: [
          'Giving a single fixed rigid number too early before understanding the full job responsibilities.',
          'Saying "I am fine with whatever the company standard is"—this invites bottom-tier offers.'
        ]
      }
    ],
    highImpactChecklist: [
      'Test your camera, microphone, and internet connection 30 minutes before the call.',
      'Have 2 clean printed copies of your resume and a notebook with questions ready.',
      'Prepare 3 distinct STAR stories covering: Problem Solving, Teamwork, and Handling Setbacks.',
      'Look into the camera lens (not at your own screen tile) to maintain direct eye contact.',
      'Send a personalized 3-sentence thank-you email to the recruiter within 24 hours of the round.'
    ],
    elevatorPitchFormula: {
      hook: 'I am a passionate [Role] specialized in [Core Strengths].',
      proofPoints: 'Recently, I developed [Project/Achievement] which resulted in [Concrete Value/Metric].',
      targetAlignment: 'I am excited by [Company Name]\'s mission in [Domain] and ready to drive measurable outcomes from day one.'
    },
    questionsToAskInterviewer: [
      {
        category: 'First 90 Days Success',
        question: 'What would a top performer in this role accomplish in their first 90 days?',
        whyItWorks: 'Shows proactive goal orientation and helps you understand the hiring manager’s exact expectations.'
      },
      {
        category: 'Team & Culture',
        question: 'How does the team currently handle cross-functional collaboration and feedback?',
        whyItWorks: 'Reveals the real engineering/work culture and psychological safety of the organization.'
      },
      {
        category: 'Growth & Challenges',
        question: 'What is the biggest operational challenge the team is working on solving this quarter?',
        whyItWorks: 'Positions you as a collaborative problem solver ready to tackle existing pain points.'
      }
    ]
  },

  // Developer / Software Engineer
  developer: {
    targetRole: 'Software Engineer / Frontend / Full Stack',
    roundTips: [
      {
        id: 'dev-tech-1',
        roundType: 'technical',
        title: 'Live Coding & Data Structures Strategy',
        categoryTag: 'Live Coding',
        summary: 'Communicate constantly, write modular code, and talk through edge cases before typing.',
        recommendedFramework: 'Repeat the question ➔ Clarify inputs/outputs & edge cases (empty, null, duplicates) ➔ State Brute Force O(N) complexity ➔ Optimize with Hash Maps / Two Pointers ➔ Write clean code ➔ Dry run test cases',
        sampleQuestion: 'Given an array of integers, return indices of the two numbers such that they add up to a specific target.',
        sampleAnswerTemplate: 'I will start by clarifying if the array is sorted and if negative numbers or duplicate solutions exist. A brute force approach would take O(N^2) using nested loops. To optimize to O(N) time and O(N) space, I will use a Hash Map to store previously visited complements in a single pass.',
        proTips: [
          'Never write code without stating the Time & Space Big-O complexity.',
          'If you get stuck, explain where you are stuck—interviewers love to give micro-hints to see how well you take guidance.'
        ],
        commonMistakesToAvoid: [
          'Rushing to type code immediately without clarifying constraints.',
          'Ignoring variable naming (e.g. using a, b, c instead of meaningful names).'
        ]
      },
      {
        id: 'dev-sys-2',
        roundType: 'technical',
        title: 'System Design & Architecture Round',
        categoryTag: 'System Design',
        summary: 'Anchor your design on requirements: functional vs non-functional, data flow, caching, and database schemas.',
        recommendedFramework: 'Scope Requirements ➔ High-Level Architecture (Client, API Gateway, DB, Cache) ➔ Deep Dive into Core Bottlenecks ➔ Scalability & Resilience',
        sampleQuestion: 'Design a URL shortener like bit.ly or a scalable notifications system.',
        sampleAnswerTemplate: 'I will break this down into: 1. Read vs Write traffic ratio, 2. Storage capacity calculations for 5 years, 3. Base62 hashing algorithm, 4. Redis caching layer for top 20% viral links, and 5. Database sharding strategy by hash key.',
        proTips: [
          'Draw clear boxes and directional arrows when using virtual whiteboards like Excalidraw.',
          'Discuss CAP theorem trade-offs (Consistency vs Availability).'
        ]
      },
      {
        id: 'dev-beh-1',
        roundType: 'behavioral',
        title: 'Explaining a Tough Bug or Production Incident',
        categoryTag: 'Debugging & RCA',
        summary: 'Demonstrate structured Root Cause Analysis (RCA) and preventive measures rather than panicking.',
        recommendedFramework: 'Incident Discovery ➔ Triage & Rollback ➔ Deep Dive RCA ➔ Permanent Fix & Automated Regression Tests',
        sampleQuestion: 'Tell me about a challenging bug you encountered in production and how you fixed it.',
        sampleAnswerTemplate: 'In a previous React/Node app, users experienced unexpected authentication timeouts. I monitored APM logs, identified an unhandled race condition in JWT refresh tokens, deployed an immediate mitigation, and added end-to-end Cypress test coverage to permanently prevent regressions.',
        proTips: [
          'Highlight your monitoring, logging, and automated testing discipline.'
        ]
      },
      {
        id: 'dev-hr-1',
        roundType: 'hr',
        title: 'Why Do You Want to Work on Our Tech Stack?',
        categoryTag: 'Culture & Tech Fit',
        summary: 'Connect your personal passion for scalable architecture with the company’s product engineering roadmap.',
        proTips: [
          'Inspect their public GitHub repos or engineering blog posts before the call.',
          'Mention how your background in TypeScript/React/Cloud directly accelerates their feature delivery.'
        ]
      }
    ],
    highImpactChecklist: [
      'Have your IDE / VS Code / LeetCode sandbox ready with clean dark mode and legible font size.',
      'Prepare to explain 2 highlight projects from your GitHub profile in detail (architecture, trade-offs, deployment).',
      'Review Big-O complexities for Arrays, Hash Tables, Binary Trees, and Graphs.',
      'Be prepared to explain CORS, REST vs GraphQL, Async Event Loops, and Database Indexes.'
    ],
    elevatorPitchFormula: {
      hook: 'I am a Full Stack / Frontend Developer passionate about building high-performance web applications.',
      proofPoints: 'I have engineered responsive web apps with React, TypeScript, and Node.js that handle real-time state and achieve sub-second load times.',
      targetAlignment: 'I love [Company Name]\'s product architecture and look forward to contributing clean, test-driven code to your core features.'
    },
    questionsToAskInterviewer: [
      {
        category: 'Engineering Best Practices',
        question: 'What does your CI/CD pipeline and code review process look like on the engineering team?',
        whyItWorks: 'Demonstrates that you care deeply about code quality, automation, and peer reviews.'
      },
      {
        category: 'Tech Debt & Roadmap',
        question: 'How does the engineering team balance building new feature velocity with managing technical debt and refactoring?',
        whyItWorks: 'Shows maturity and long-term architectural foresight.'
      }
    ]
  },

  // Sales / Business Development
  sales: {
    targetRole: 'Inside Sales / Business Development / BDE',
    roundTips: [
      {
        id: 'sales-pitch-1',
        roundType: 'technical',
        title: 'Live Roleplay & Cold Pitch Simulation',
        categoryTag: 'Discovery & Pitch',
        summary: 'In sales interviews, managers will test you on live objection handling and consultative discovery questions.',
        recommendedFramework: 'Hook (Pattern Interrupt) ➔ Open-Ended Discovery (Identify Pain Points) ➔ Value Proposition (Not feature dumping) ➔ Call to Action (Book Demo)',
        sampleQuestion: 'Sell me this pen / Sell me our SaaS product as if I am a skeptical CTO.',
        sampleAnswerTemplate: 'Before talking about the product, I ask: "What is your primary bottleneck in managing team sales pipelines this quarter?" Once they share their challenge, I tailor the solution specifically to saving them 5 hours per rep each week.',
        proTips: [
          'Listen 70% of the time, speak 30%. Never talk over the interviewer during a roleplay.',
          'Always close with a firm next step (date, time, calendar invite).'
        ],
        commonMistakesToAvoid: [
          'Listing features without asking what the buyer actually needs.',
          'Getting defensive when the interviewer gives an objection like "We already use a competitor".'
        ]
      },
      {
        id: 'sales-objection-2',
        roundType: 'behavioral',
        title: 'Handling Price Objections & "We Have No Budget"',
        categoryTag: 'Objection Handling',
        summary: 'Reframe price into ROI (Return on Investment) and cost of inaction.',
        recommendedFramework: 'Acknowledge ➔ Isolate (Is budget the only constraint?) ➔ Value Reframe ➔ Flexible Proof of Concept',
        sampleQuestion: 'How do you handle a prospect saying your software is too expensive compared to alternatives?',
        sampleAnswerTemplate: 'I acknowledge their budget constraints and ask: "Aside from price, does this solution meet all your operational requirements?" Once isolated, I demonstrate how our automation saves ₹50,000 monthly in wasted manual hours, providing a 3x ROI in under 90 days.',
        proTips: [
          'Emphasize your familiarity with CRM tools like HubSpot, Salesforce, and LinkedIn Sales Navigator.'
        ]
      },
      {
        id: 'sales-target-3',
        roundType: 'hr',
        title: 'Demonstrating Quota Track Record & Resilience',
        categoryTag: 'Target Achievement',
        summary: 'Sales leaders hire for hunger, grit, coachability, and pipeline hygiene.',
        sampleQuestion: 'Tell me about a quarter when you were behind on quota. How did you react?',
        sampleAnswerTemplate: 'When I fell behind by 25% at mid-quarter, I analyzed my conversion funnel, doubled down on cold outreach volume by 40%, and partnered with marketing for warm inbound leads. I closed the quarter at 108% of target.',
        proTips: [
          'Know your exact metrics: Conversion rate, average deal size, calls per day, and quota attainment %.'
        ]
      }
    ],
    highImpactChecklist: [
      'Research the company’s target customer persona (ICP) and value proposition before the call.',
      'Show high energy, confident vocal projection, and pleasant smile throughout the meeting.',
      'Be prepared for a surprise roleplay: "Roleplay selling our tool to me right now".',
      'Have questions ready about sales cycles, average deal ticket size, and commission structures.'
    ],
    elevatorPitchFormula: {
      hook: 'I am a driven Business Development Specialist with a track record in consultative sales and B2B pipeline generation.',
      proofPoints: 'I have generated 120+ qualified leads and maintained a 28% demo conversion rate through outbound outreach.',
      targetAlignment: 'I am excited to expand [Company Name]\'s market footprint in the enterprise segment and exceed revenue targets.'
    },
    questionsToAskInterviewer: [
      {
        category: 'Sales Cycle & Inbound',
        question: 'What percentage of opportunities come from marketing inbounds versus outbound SDR prospecting?',
        whyItWorks: 'Reveals the health of the lead generation engine and sales pipeline maturity.'
      },
      {
        category: 'Top Performer Traits',
        question: 'What differentiates the top 10% account executives on your team from the rest of the floor?',
        whyItWorks: 'Signals high coachability and an ambition to be a top tier producer.'
      }
    ]
  },

  // Data Analyst
  data_analyst: {
    targetRole: 'Data Analyst / BI Engineer',
    roundTips: [
      {
        id: 'data-sql-1',
        roundType: 'technical',
        title: 'SQL Live Queries, Window Functions & CTEs',
        categoryTag: 'SQL Mastery',
        summary: 'Expect heavy testing on JOINs, GROUP BY, HAVING, RANK(), DENSE_RANK(), and LEAD/LAG window functions.',
        recommendedFramework: 'Understand Table Schema ➔ Identify Aggregation Level ➔ Write CTE or Subquery ➔ Filter & Group ➔ Validate with Edge Rows',
        sampleQuestion: 'Write a SQL query to find the 2nd highest salary in each department or calculate 7-day rolling revenue.',
        sampleAnswerTemplate: 'I will use a Common Table Expression (CTE) with DENSE_RANK() OVER (PARTITION BY dept_id ORDER BY salary DESC) as rank_val, then filter WHERE rank_val = 2 in the outer query.',
        proTips: [
          'Be crystal clear on the difference between LEFT JOIN, INNER JOIN, and FULL OUTER JOIN with NULL handling.',
          'Always explain how your query handles duplicate rankings or NULL records.'
        ]
      },
      {
        id: 'data-biz-2',
        roundType: 'technical',
        title: 'Translating Data Insights into Actionable Business Decisions',
        categoryTag: 'Business Acumen',
        summary: 'Stakeholders don’t care about raw numbers; they care about what action to take next to increase retention or revenue.',
        recommendedFramework: 'Observation (Data Trend) ➔ Root Cause Hypothesis ➔ Impact Sizing ➔ Actionable Business Recommendation',
        sampleQuestion: 'If our mobile app daily active users (DAU) dropped by 15% last week, how would you diagnose it?',
        sampleAnswerTemplate: 'I segment the drop by dimensions: Platform (iOS vs Android), Geography, New vs Returning users, and App Version. If isolated to Android, I check recent release builds for crash rates or payment gateway latency.',
        proTips: [
          'Mention your proficiency with Power BI, Tableau, or Excel Pivot Tables and DAX.'
        ]
      },
      {
        id: 'data-hr-1',
        roundType: 'hr',
        title: 'Working with Non-Technical Stakeholders',
        categoryTag: 'Communication',
        summary: 'Show that you can explain complex statistical variance or regression metrics in simple, executive-friendly language.',
        proTips: [
          'Use charts and visual dashboards instead of presenting raw SQL tables to senior leadership.'
        ]
      }
    ],
    highImpactChecklist: [
      'Brush up on SQL Window Functions (ROW_NUMBER, RANK, DENSE_RANK, LAG, LEAD, NTILE).',
      'Have 2 dashboard examples ready to walk through (KPIs chosen, visual hierarchy, business takeaways).',
      'Understand core business metrics: CAC, LTV, Churn Rate, Retention Cohorts, and Conversion Funnels.',
      'Be ready to explain statistical concepts like Mean vs Median, Normal Distribution, and A/B Test P-values.'
    ],
    elevatorPitchFormula: {
      hook: 'I am a Data Analyst passionate about turning raw complex datasets into high-impact visual stories and business growth.',
      proofPoints: 'I specialize in SQL, Power BI, Python, and statistical modeling, having built automated dashboards that cut reporting time by 60%.',
      targetAlignment: 'I want to help [Company Name] uncover revenue opportunities and optimize product metrics through data-driven decisions.'
    },
    questionsToAskInterviewer: [
      {
        category: 'Data Infrastructure',
        question: 'What is your current data stack (e.g. Snowflake, BigQuery, dbt) and how mature is your data governance?',
        whyItWorks: 'Shows deep technical curiosity and operational readiness.'
      },
      {
        category: 'Decision Impact',
        question: 'Can you share an example of a recent business decision that was directly influenced by data analysis?',
        whyItWorks: 'Helps you understand if the company is genuinely data-driven or just data-informed.'
      }
    ]
  }
};

/**
 * Retrieves the best matching interview prep guide for the user's target job role.
 */
export function getCuratedInterviewGuide(targetJob: string): RoleInterviewPrepGuide {
  const normalized = (targetJob || '').toLowerCase();

  if (
    normalized.includes('developer') ||
    normalized.includes('software') ||
    normalized.includes('frontend') ||
    normalized.includes('backend') ||
    normalized.includes('full stack') ||
    normalized.includes('web') ||
    normalized.includes('engineer') ||
    normalized.includes('coder') ||
    normalized.includes('react') ||
    normalized.includes('python')
  ) {
    return BASE_INTERVIEW_TIPS.developer;
  }

  if (
    normalized.includes('sales') ||
    normalized.includes('bde') ||
    normalized.includes('business development') ||
    normalized.includes('inside sales') ||
    normalized.includes('account executive') ||
    normalized.includes('tele') ||
    normalized.includes('marketing executive')
  ) {
    return BASE_INTERVIEW_TIPS.sales;
  }

  if (
    normalized.includes('data') ||
    normalized.includes('analyst') ||
    normalized.includes('business analyst') ||
    normalized.includes('bi') ||
    normalized.includes('analytics') ||
    normalized.includes('sql')
  ) {
    return BASE_INTERVIEW_TIPS.data_analyst;
  }

  return BASE_INTERVIEW_TIPS.default;
}

/**
 * Manages Bookmarked Tips in localStorage
 */
export function getBookmarkedTipIds(userId: string): string[] {
  try {
    const raw = localStorage.getItem(`${BOOKMARKED_TIPS_KEY_PREFIX}${userId || 'guest'}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function toggleTipBookmark(userId: string, tipId: string): string[] {
  const current = getBookmarkedTipIds(userId);
  let updated: string[];
  if (current.includes(tipId)) {
    updated = current.filter((id) => id !== tipId);
  } else {
    updated = [...current, tipId];
  }
  try {
    localStorage.setItem(`${BOOKMARKED_TIPS_KEY_PREFIX}${userId || 'guest'}`, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save bookmarked tip:', err);
  }
  return updated;
}

/**
 * Fetches AI-generated custom interview prep advice from server-side endpoint.
 */
export async function fetchAIInterviewTips(
  profile: CareerProfile | null,
  userId: string,
  roundFocus?: string
): Promise<RoleInterviewPrepGuide> {
  const targetJob = profile?.targetJob || 'Entry-Level Professional';
  const cacheKey = `${CACHED_AI_GUIDE_PREFIX}${userId}_${encodeURIComponent(targetJob)}_${roundFocus || 'all'}`;

  try {
    const response = await fetch('/api/interview-tips', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        targetJob,
        education: profile?.education || 'Graduate',
        skills: profile?.skills || [],
        experienceLevel: profile?.experienceLevel || 'Fresher',
        roundFocus: roundFocus || 'all',
      }),
    });

    if (response.ok) {
      const data: RoleInterviewPrepGuide = await response.json();
      if (data && data.roundTips && data.roundTips.length > 0) {
        localStorage.setItem(cacheKey, JSON.stringify(data));
        return data;
      }
    }
  } catch (err) {
    console.warn('Backend /api/interview-tips call failed, falling back to curated guide:', err);
  }

  // Check cached AI guide first
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch {}

  // Fallback to rich curated guide
  return getCuratedInterviewGuide(targetJob);
}

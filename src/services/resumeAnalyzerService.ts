import { ResumeAnalysisResult, SavedResumeAudit } from '../types';

const STORAGE_KEY_PREFIX = 'jobready_resume_audits_';

export interface SampleResumeTemplate {
  id: string;
  role: string;
  title: string;
  preview: string;
  fullText: string;
}

export const SAMPLE_RESUMES: SampleResumeTemplate[] = [
  {
    id: 'frontend-dev',
    role: 'Frontend Developer',
    title: 'Frontend Developer (Entry Level / Fresher)',
    preview: 'React, TypeScript, Tailwind CSS, Responsive Web Apps, REST APIs',
    fullText: `RAHUL SHARMA
Bengaluru, Karnataka | +91 98765 43210 | rahul.sharma@example.com | github.com/rahulsharma-dev | linkedin.com/in/rahulsharma-dev

CAREER OBJECTIVE
Enthusiastic and detail-oriented Frontend Developer seeking an entry-level software engineering role. Proficient in building responsive, accessible web applications using React, TypeScript, and modern CSS frameworks. Eager to contribute to scalable web products.

TECHNICAL SKILLS
- Languages & Frameworks: HTML5, CSS3, JavaScript (ES6+), TypeScript, React.js, Tailwind CSS
- Tools & Platforms: Git, GitHub, VS Code, Postman, Vite, Vercel
- Concepts: Responsive Design, RESTful API Integration, State Management, Clean Code

PROJECTS
1. Career Prep Portal & Dashboard (React, TypeScript, Tailwind CSS)
- Developed a high-performance web dashboard with real-time UI components and responsive layouts.
- Integrated RESTful APIs for asynchronous data handling with robust error state handling.
- Optimized bundle load speed and achieved 95+ Google Lighthouse performance score.

2. E-Commerce Product Catalog & Cart (React, JavaScript, Context API)
- Built interactive product filter, instant search, and local persistence cart checkout flow.
- Implemented accessible keyboard navigation and mobile-first responsive views.

EDUCATION
- Bachelor of Technology in Computer Science & Engineering (2021 – 2025)
  ABC Institute of Technology, Bengaluru (CGPA: 8.4/10)

CERTIFICATIONS
- Meta Frontend Developer Professional Certificate (Coursera)
- Responsive Web Design Certification (freeCodeCamp)`,
  },
  {
    id: 'customer-support',
    role: 'Customer Support Associate',
    title: 'Customer Support / Telecaller Associate',
    preview: 'Customer Engagement, Inbound Calls, CRM, Ticket Resolution, English/Hindi Fluency',
    fullText: `PRIYA PATEL
Pune, Maharashtra | +91 91234 56789 | priya.patel@example.com | linkedin.com/in/priyapatel-cs

PROFESSIONAL SUMMARY
Customer-centric and articulate Customer Support Representative with excellent communication skills in English and Hindi. Proven ability to handle high-volume customer inquiries, resolve escalations with empathy, and maintain high first-call resolution rates.

CORE COMPETENCIES
- Customer Relationship Management (CRM): Zoho Desk, Freshdesk basics
- Communication: Active listening, empathetic de-escalation, professional business email
- Operations: Inbound/Outbound calls, ticket logging, query troubleshooting, MS Excel
- Typing Speed: 38 WPM with 99% accuracy

WORK & PRACTICAL EXPERIENCE
Customer Support Executive (Internship) — Apex Services Ltd, Pune (6 Months)
- Managed 60+ customer inquiries daily via voice call and live chat with a 94% customer satisfaction score.
- Accurately logged customer feedback and tickets into CRM within 2 minutes of call completion.
- Collaborated with technical and billing teams to expedite resolution of complex user complaints.

EDUCATION
- Bachelor of Commerce (B.Com) — Savitribai Phule Pune University (Graduated 2024, 72%)
- Higher Secondary Certificate (12th Commerce) — Maharashtra State Board (2021, 78%)

LANGUAGES
- English (Fluent / Professional)
- Hindi (Native / Fluent)
- Marathi (Conversational)`,
  },
  {
    id: 'data-entry-mis',
    role: 'Data Entry & MIS Operator',
    title: 'Data Entry & MIS Executive',
    preview: 'Advanced Excel, VLOOKUP, Pivot Tables, Google Sheets, Data Cleaning & MIS Reports',
    fullText: `AMIT KUMAR
New Delhi, Delhi | +91 98111 22334 | amit.kumar.mis@example.com

CAREER OBJECTIVE
Dedicated and meticulous Data Entry & MIS Executive with advanced proficiency in Microsoft Excel and spreadsheet automation. Seeking a position where I can apply strong data validation, MIS reporting, and record management skills to ensure zero-error operations.

KEY SKILLS & TOOLS
- Spreadsheets: Microsoft Excel (VLOOKUP, XLOOKUP, Pivot Tables, Conditional Formatting, SUMIFS, COUNTIFS)
- Platforms: Google Sheets, Google Workspace, MS Office Suite (Word, PowerPoint)
- Data Hygiene: Data validation, duplicate removal, text-to-columns, database entry
- Typing: 45 WPM English typing with 99.5% accuracy

EXPERIENCE & ACADEMIC PROJECTS
MIS & Data Operations Assistant — Global Logistics Hub, Delhi (Academic Project & Trainee)
- Processed and updated daily logistics shipment records exceeding 450 rows per shift with 100% accuracy.
- Created automated weekly MIS summary dashboards using Excel Pivot Tables, reducing manual preparation time by 3 hours.
- Performed cross-verification of vendor invoices against purchase orders using VLOOKUP.

EDUCATION
- Diploma in Computer Applications (DCA) — National Skill Development Corporation (NSDC, 2023)
- Senior Secondary (12th Standard) — CBSE Board (2022)

ACHIEVEMENTS
- Certified in Advanced Excel & Office Automation (A Grade)`,
  },
  {
    id: 'technician-electrician',
    role: 'Industrial Electrician / Technician',
    title: 'ITI Industrial Electrician & Maintenance Technician',
    preview: 'Panel Wiring, Circuit Schematics, Multimeter, Preventive Maintenance, Safety Standards',
    fullText: `VIKRAM SINGH
Ahmedabad, Gujarat | +91 97234 11223 | vikram.iti.electrician@example.com

PROFESSIONAL PROFILE
Skilled and safety-certified Industrial Electrician (ITI Electrical Trade) with hands-on practical training in single-phase and three-phase motor wiring, control panel troubleshooting, and industrial preventive maintenance. Committed to strict Indian Electricity Rules and PPE workplace safety.

TECHNICAL SKILLS
- Electrical Systems: 3-Phase AC Motors, Star-Delta Starters, Transformers, Relays, MCB/MCCB
- Tools & Testing: Digital Multimeter, Megger Insulation Tester, Wire Strippers, Crimping Tools
- Blueprints: Electrical schematic reading, single-line wiring diagrams
- Safety: Lockout-Tagout (LOTO), Electrical Hazard Prevention, First Aid

PRACTICAL TRAINING & APPRENTICESHIP
Industrial Electrical Apprentice — Gujarat State Machinery Works (1 Year)
- Inspected and maintained 15+ industrial motor switchgears and distribution panels daily.
- Diagnosed circuit continuity faults using digital multimeters, reducing machine downtime during shift operations.
- Assisted senior electrical engineers in assembling and wiring 4 customized PLC control panels.
- Documented daily maintenance logs and safety inspection checklists with 100% compliance.

EDUCATION & CERTIFICATIONS
- ITI Trade Certificate in Electrician (NCVT Certified, 2 Year Course, 2022-2024, Distinction)
- 10th Standard (SSC) — Gujarat Secondary Board (2022)`,
  },
];

export async function analyzeResumeWithAI(params: {
  resumeText: string;
  targetJob: string;
  experienceLevel?: string;
  education?: string;
  skills?: string[];
}): Promise<ResumeAnalysisResult> {
  const response = await fetch('/api/resume-analyzer', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to analyze resume. Please try again.');
  }

  const result: ResumeAnalysisResult = await response.json();
  return result;
}

export function saveResumeAuditLocally(userId: string, result: ResumeAnalysisResult, fileName?: string): SavedResumeAudit {
  const auditId = 'audit_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
  const audit: SavedResumeAudit = {
    id: auditId,
    userId,
    fileName: fileName || `${result.targetRole.replace(/\s+/g, '_')}_Resume_Audit`,
    targetRole: result.targetRole,
    atsScore: result.atsScore,
    result,
    timestamp: new Date().toISOString(),
  };

  try {
    const storageKey = `${STORAGE_KEY_PREFIX}${userId}`;
    const existing = getSavedResumeAuditsLocally(userId);
    const updated = [audit, ...existing].slice(0, 10); // Keep latest 10 audits
    localStorage.setItem(storageKey, JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to save resume audit to localStorage', e);
  }

  return audit;
}

export function getSavedResumeAuditsLocally(userId: string): SavedResumeAudit[] {
  try {
    const storageKey = `${STORAGE_KEY_PREFIX}${userId}`;
    const raw = localStorage.getItem(storageKey);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to parse saved resume audits', e);
    return [];
  }
}

export function getLatestResumeAuditLocally(userId: string): SavedResumeAudit | null {
  const audits = getSavedResumeAuditsLocally(userId);
  return audits.length > 0 ? audits[0] : null;
}

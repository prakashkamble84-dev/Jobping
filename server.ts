import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Skills Gap Analysis Route using Gemini API
  app.post('/api/skills-gap-analysis', async (req, res) => {
    try {
      const { targetJob, education, experienceLevel, currentSkills, careerGoal } = req.body;

      if (!targetJob) {
        return res.status(400).json({ error: 'Target job role is required.' });
      }

      const userSkills = Array.isArray(currentSkills) ? currentSkills : [];
      const ai = getGenAI();

      if (!ai) {
        const fallbackAnalysis = generateFallbackAnalysis(targetJob, userSkills, education, experienceLevel);
        return res.json(fallbackAnalysis);
      }

      const prompt = `You are an expert career counselor and technical hiring specialist for the Indian job market (freshers, ITI, diploma, 12th pass, and college graduates).
Conduct a comprehensive, realistic Skills Gap Analysis for a candidate targeting the role: "${targetJob}".

Candidate Profile:
- Target Role: ${targetJob}
- Education: ${education || 'Not specified'}
- Experience Level: ${experienceLevel || 'Fresher / Entry-Level'}
- Current Skills: ${userSkills.length > 0 ? userSkills.join(', ') : 'None listed yet'}
- Career Goal: ${careerGoal || 'Secure an entry-level position and grow in the field'}

Instructions:
1. Compare the candidate's current skills against standard hiring requirements and top ATS filters used by recruiters in India for this exact role.
2. Calculate a realistic "overallMatchScore" (0-100) based on coverage of core and secondary skills.
3. Identify which current skills match well ("matchingSkills") and evaluate their relevance.
4. Identify 3 to 6 critical or important missing skills ("missingSkills"), providing actionable micro-learning tips and estimated time to learn for each.
5. Provide standard industry benchmark data (tools in demand, typical entry tasks, entry expectations).
6. Provide a concise, encouraging 2-3 sentence executive recommendation summary.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You are an elite Indian employment market analyst and career readiness coach. Always output structured JSON matching the requested schema.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              targetRole: { type: Type.STRING },
              overallMatchScore: { type: Type.INTEGER },
              matchingSkills: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    strength: { type: Type.STRING, description: 'High, Medium, or Developing' },
                    relevance: { type: Type.STRING, description: 'Why this skill helps for this role' },
                  },
                  required: ['name', 'strength', 'relevance'],
                },
              },
              missingSkills: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    importance: { type: Type.STRING, description: 'Critical, Important, or Nice to Have' },
                    category: { type: Type.STRING, description: 'Technical, Workplace, Tool, or Domain' },
                    whyNeeded: { type: Type.STRING },
                    learningTip: { type: Type.STRING },
                    estimatedTimeToLearn: { type: Type.STRING },
                  },
                  required: ['name', 'importance', 'category', 'whyNeeded', 'learningTip', 'estimatedTimeToLearn'],
                },
              },
              industryBenchmark: {
                type: Type.OBJECT,
                properties: {
                  inDemandTools: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  typicalDailyTasks: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  entryLevelExpectation: { type: Type.STRING },
                },
                required: ['inDemandTools', 'typicalDailyTasks', 'entryLevelExpectation'],
              },
              recommendationSummary: { type: Type.STRING },
            },
            required: [
              'targetRole',
              'overallMatchScore',
              'matchingSkills',
              'missingSkills',
              'industryBenchmark',
              'recommendationSummary',
            ],
          },
        },
      });

      const responseText = response.text || '{}';
      const parsedData = JSON.parse(responseText);
      return res.json(parsedData);
    } catch (error: any) {
      console.error('Error in skills gap analysis:', error);
      const { targetJob, currentSkills, education, experienceLevel } = req.body;
      const userSkills = Array.isArray(currentSkills) ? currentSkills : [];
      const fallbackAnalysis = generateFallbackAnalysis(targetJob || 'Target Role', userSkills, education, experienceLevel);
      return res.json(fallbackAnalysis);
    }
  });

  // Start Mock Interview Route using Gemini API
  app.post('/api/mock-interview/start', async (req, res) => {
    try {
      const { targetJob, experienceLevel, education, questionCount = 4 } = req.body;
      const ai = getGenAI();

      if (!ai) {
        const fallback = generateFallbackInterviewQuestions(targetJob || 'Customer Support', questionCount);
        return res.json(fallback);
      }

      const prompt = `You are a professional HR Interviewer and Technical Hiring Manager in India.
Generate an authentic, role-specific practice interview for the role of: "${targetJob || 'Entry-Level Associate'}".
Candidate Profile:
- Experience Level: ${experienceLevel || 'Fresher'}
- Education: ${education || 'Graduate / Diploma / ITI / 12th'}
- Number of Questions to generate: ${questionCount}

Instructions:
1. Generate ${questionCount} progressive questions:
   - Question 1: Self-introduction / Motivation for this specific role.
   - Question 2: Core functional / technical / tool question specific to ${targetJob}.
   - Question 3: Realistic customer, workplace, or scenario problem-solving question.
   - Question 4 (and beyond): Handling pressure, teamwork, or ethics in the workplace.
2. For each question, provide:
   - questionText: Clear, conversational interview question.
   - questionType: "introductory" | "technical" | "situational" | "behavioral"
   - contextTip: Helpful hint explaining what the interviewer is listening for.
   - idealAnswerKeyPoints: 2-3 key bullet points a strong candidate must cover.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You are an elite Indian corporate interviewer conducting mock interviews. Always output structured JSON matching the schema.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              roleTitle: { type: Type.STRING },
              introMessage: { type: Type.STRING },
              questions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.INTEGER },
                    questionText: { type: Type.STRING },
                    questionType: { type: Type.STRING },
                    contextTip: { type: Type.STRING },
                    idealAnswerKeyPoints: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                  },
                  required: ['id', 'questionText', 'questionType', 'contextTip', 'idealAnswerKeyPoints'],
                },
              },
            },
            required: ['roleTitle', 'introMessage', 'questions'],
          },
        },
      });

      const responseText = response.text || '{}';
      const parsedData = JSON.parse(responseText);
      return res.json(parsedData);
    } catch (error: any) {
      console.error('Error starting mock interview:', error);
      const { targetJob, questionCount = 4 } = req.body;
      const fallback = generateFallbackInterviewQuestions(targetJob || 'Entry-Level Role', questionCount);
      return res.json(fallback);
    }
  });

  // Evaluate Candidate Response in Real-time using Gemini API
  app.post('/api/mock-interview/evaluate', async (req, res) => {
    try {
      const { targetJob, questionText, questionType, candidateAnswer } = req.body;

      if (!candidateAnswer || candidateAnswer.trim().length === 0) {
        return res.status(400).json({ error: 'Candidate answer is required.' });
      }

      const ai = getGenAI();
      if (!ai) {
        const fallbackEval = generateFallbackEvaluation(questionText, candidateAnswer);
        return res.json(fallbackEval);
      }

      const prompt = `You are a supportive, high-standards Indian interview coach evaluating a candidate's response in real-time.
Target Role: ${targetJob || 'General Role'}
Interview Question: "${questionText}"
Question Type: ${questionType || 'general'}
Candidate's Response: "${candidateAnswer}"

Instructions:
1. Objectively evaluate the answer on clarity, relevance, confidence, and role alignment.
2. Score out of 100 (0-100).
3. Assign rating: "Excellent" (85-100), "Good" (65-84), "Needs Work" (below 65).
4. Provide constructive, encouraging feedback (2-3 sentences).
5. Identify 1 to 3 specific strengths in what the candidate said.
6. Identify 1 to 3 concrete improvement suggestions (e.g., adding metrics, using the STAR method, clarifying technical terms).
7. Write an exemplary, realistic "sampleBestAnswer" (3-4 sentences in natural spoken English) demonstrating how a top candidate would answer.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You are an encouraging Indian career interview coach. Always output structured JSON matching the schema.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.INTEGER },
              rating: { type: Type.STRING },
              feedback: { type: Type.STRING },
              strengths: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              improvements: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              sampleBestAnswer: { type: Type.STRING },
            },
            required: ['score', 'rating', 'feedback', 'strengths', 'improvements', 'sampleBestAnswer'],
          },
        },
      });

      const responseText = response.text || '{}';
      const parsedData = JSON.parse(responseText);
      return res.json(parsedData);
    } catch (error: any) {
      console.error('Error evaluating mock interview answer:', error);
      const { questionText, candidateAnswer } = req.body;
      const fallbackEval = generateFallbackEvaluation(questionText || 'Question', candidateAnswer || '');
      return res.json(fallbackEval);
    }
  });

  // Daily AI Career Insight Route using Gemini API
  app.post('/api/daily-career-insight', async (req, res) => {
    try {
      const { targetJob, experienceLevel, education, currentSkills, preferredCity } = req.body;
      const ai = getGenAI();

      if (!ai) {
        const fallback = generateFallbackCareerInsight(targetJob || 'Entry-Level Associate', experienceLevel, education, preferredCity);
        return res.json(fallback);
      }

      const prompt = `You are a career mentor and senior recruitment coach in India.
Provide exactly ONE fresh, high-impact, actionable daily career tip for a candidate with this profile:
- Target Job Role: "${targetJob || 'Entry-Level Associate'}"
- Experience Level: "${experienceLevel || 'Fresher'}"
- Education: "${education || 'Graduate / Diploma / ITI / 12th'}"
- Current Skills: ${Array.isArray(currentSkills) && currentSkills.length > 0 ? currentSkills.join(', ') : 'Not specified'}
- Preferred Location: "${preferredCity || 'India'}"

Instructions:
1. Make the tip specific and immediately applicable today (NOT generic platitudes like "work hard").
2. Assign a category: "Interview Strategy", "ATS & Resume", "Micro-Skill Upgrade", "Workplace Readiness", or "Hiring Insight".
3. Provide:
   - headline: Punchy, memorable 4-7 word headline.
   - category: One of the categories above.
   - actionableTip: 2-3 crisp sentences detailing the specific strategy or insight.
   - quickAction: A 5-minute task the user can do right now to put it into action.
   - impactTag: Short impact pill (e.g., "+20% Recruiter Callbacks", "Top Interview Differentiator", "High Demand in Job Market").`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You are an elite Indian employment coach providing daily career insights. Always output structured JSON matching the schema.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              headline: { type: Type.STRING },
              category: { type: Type.STRING },
              actionableTip: { type: Type.STRING },
              quickAction: { type: Type.STRING },
              impactTag: { type: Type.STRING },
            },
            required: ['headline', 'category', 'actionableTip', 'quickAction', 'impactTag'],
          },
        },
      });

      const responseText = response.text || '{}';
      const parsedData = JSON.parse(responseText);
      return res.json(parsedData);
    } catch (error: any) {
      console.error('Error generating daily career insight:', error);
      const { targetJob, experienceLevel, education, preferredCity } = req.body;
      const fallback = generateFallbackCareerInsight(targetJob || 'Entry-Level Associate', experienceLevel, education, preferredCity);
      return res.json(fallback);
    }
  });

  // AI Resume Analyzer & ATS Audit Route using Gemini API
  app.post('/api/resume-analyzer', async (req, res) => {
    try {
      const { resumeText, targetJob, experienceLevel, education, skills } = req.body;

      if (!resumeText || typeof resumeText !== 'string' || resumeText.trim().length < 20) {
        return res.status(400).json({ error: 'Please provide valid resume text (at least 20 characters).' });
      }

      const ai = getGenAI();
      if (!ai) {
        const fallback = generateFallbackResumeAnalysis(resumeText, targetJob || 'General Role', experienceLevel, education, skills);
        return res.json(fallback);
      }

      const prompt = `You are an elite Applicant Tracking System (ATS) auditor and senior recruitment specialist in India.
Analyze the following candidate resume text strictly tailored for the Target Role: "${targetJob || 'General Entry-Level'}".

Candidate Context:
- Target Job Role: ${targetJob || 'Not specified'}
- Experience Level: ${experienceLevel || 'Fresher / Entry Level'}
- Education: ${education || 'Graduate / Diploma / ITI / 12th'}
- Stated Skills: ${Array.isArray(skills) && skills.length > 0 ? skills.join(', ') : 'Not explicitly listed'}

Resume Content to Analyze:
"""
${resumeText.trim()}
"""

Instructions:
1. ATS Score (0-100): Calculate an objective, rigorous ATS score based on keyword coverage, clarity, structure, quantified achievements, and role alignment.
2. Score Grade: One of "Needs Major Work" (0-54), "Fair" (55-69), "Competitive" (70-84), "Top Tier" (85-100).
3. Role Match Percentage (0-100): How closely this resume matches hiring expectations for "${targetJob}".
4. Executive Summary: 2-3 concise sentences summarizing key impressions and primary blocker.
5. Strengths: 3 to 4 specific positive aspects detected in the resume text.
6. Critical Gaps: 3 to 4 high-priority shortcomings (e.g. missing essential tools, zero metrics, weak objective, missing certifications).
7. Section Reviews: Audit exactly 4-5 core sections:
   - "Contact & Header"
   - "Professional Summary / Objective"
   - "Work Experience & Projects"
   - "Technical & Domain Skills"
   - "Education & Credentials"
   For each section, provide status ("pass" | "warning" | "needs_work"), concise feedback, and actionable suggestion.
8. Keyword Analysis:
   - matchedKeywords: List 4-8 relevant keywords found in the resume.
   - missingHighPriorityKeywords: List 4-8 high-demand recruiter search terms missing for this role.
   - recommendedPlacementTips: 2-3 tips on where to naturally incorporate missing terms.
9. Bullet Point Rewrites: Identify 2 to 3 weak/generic bullet lines from the resume and rewrite them using the XYZ formula (Accomplished [X] as measured by [Y], by doing [Z]) with strong action verbs and metrics.
10. ATS Hygiene Checklist: 4 to 5 standard technical ATS criteria (e.g., "Standard Headings Used", "No Complex Tables / Graphic Traps", "Quantifiable Numbers Present", "Target Role Title Explicitly Present", "Clean Contact Details").
11. Action Plan: 4 to 5 numbered immediate steps the candidate can do in under 15 minutes to boost their ATS score by 15-20 points.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You are an expert ATS recruitment auditor and career resume coach. Always output structured JSON matching the schema.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              targetRole: { type: Type.STRING },
              atsScore: { type: Type.INTEGER },
              scoreGrade: { type: Type.STRING },
              roleMatchPercentage: { type: Type.INTEGER },
              executiveSummary: { type: Type.STRING },
              strengths: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              criticalGaps: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              sectionReviews: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    sectionName: { type: Type.STRING },
                    status: { type: Type.STRING, description: 'pass, warning, or needs_work' },
                    feedback: { type: Type.STRING },
                    suggestion: { type: Type.STRING },
                  },
                  required: ['sectionName', 'status', 'feedback', 'suggestion'],
                },
              },
              keywordAnalysis: {
                type: Type.OBJECT,
                properties: {
                  matchedKeywords: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  missingHighPriorityKeywords: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  recommendedPlacementTips: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                },
                required: ['matchedKeywords', 'missingHighPriorityKeywords', 'recommendedPlacementTips'],
              },
              bulletRewrites: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    originalBullet: { type: Type.STRING },
                    improvedBullet: { type: Type.STRING },
                    reason: { type: Type.STRING },
                    impactBoost: { type: Type.STRING },
                  },
                  required: ['originalBullet', 'improvedBullet', 'reason', 'impactBoost'],
                },
              },
              atsHygieneCheck: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    checkItem: { type: Type.STRING },
                    passed: { type: Type.BOOLEAN },
                    tip: { type: Type.STRING },
                  },
                  required: ['checkItem', 'passed', 'tip'],
                },
              },
              actionPlan: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: [
              'targetRole',
              'atsScore',
              'scoreGrade',
              'roleMatchPercentage',
              'executiveSummary',
              'strengths',
              'criticalGaps',
              'sectionReviews',
              'keywordAnalysis',
              'bulletRewrites',
              'atsHygieneCheck',
              'actionPlan',
            ],
          },
        },
      });

      const responseText = response.text || '{}';
      const parsedData = JSON.parse(responseText);
      parsedData.analyzedAt = new Date().toISOString();
      return res.json(parsedData);
    } catch (error: any) {
      console.error('Error in AI resume analyzer:', error);
      const { resumeText, targetJob, experienceLevel, education, skills } = req.body;
      const fallback = generateFallbackResumeAnalysis(resumeText || '', targetJob || 'General Role', experienceLevel, education, skills);
      return res.json(fallback);
    }
  });

  // Industry Salary Benchmarker Route using Gemini API
  app.post('/api/salary-benchmark', async (req, res) => {
    try {
      const { targetJob, experienceLevel, preferredCity, preferredState, education, skills } = req.body;

      if (!targetJob) {
        return res.status(400).json({ error: 'Target job role is required.' });
      }

      const locationStr = preferredCity ? (preferredState ? `${preferredCity}, ${preferredState}` : preferredCity) : 'India';
      const ai = getGenAI();

      if (!ai) {
        const fallback = generateFallbackSalaryBenchmark(targetJob, experienceLevel, preferredCity, preferredState, education);
        return res.json(fallback);
      }

      const prompt = `You are a premier compensation and talent intelligence analyst specializing in Indian employment markets (freshers, ITI, diploma, 12th pass, and degree holders).
Estimate realistic, authentic industry salary benchmarks for the following role:

Profile:
- Target Job: "${targetJob}"
- Location: "${locationStr}"
- Experience Level: "${experienceLevel || 'Fresher / Entry-Level (0-1 yrs)'}"
- Education: "${education || 'Graduate / Diploma / ITI'}"
- Core Skills: ${Array.isArray(skills) && skills.length > 0 ? skills.join(', ') : 'Standard entry-level stack'}

Instructions:
1. Provide authentic, highly realistic monthly compensation figures in Indian Rupees (INR) and Annual CTC in Lakhs Per Annum (LPA).
2. Calculate realistic numbers:
   - monthlyRange: min, median, max (raw numbers in INR) + formatted strings (e.g. "₹22,000", "₹30,000", "₹42,000")
   - annualLpaRange: min, median, max (in LPA float, e.g. 2.6, 3.6, 5.0) + formatted (e.g. "2.6 – 5.0 LPA")
3. percentileTiers: 3 tiers:
   - "25th Percentile (Entry Baseline)"
   - "50th Percentile (Market Median)"
   - "90th Percentile (Top Tier / Skilled)"
4. topSalaryBoosters: 3 specific high-demand skills or certifications that directly boost salary packages by 15-35% in this domain.
5. locationComparison: Compare current city with 3 key Indian hiring hubs (e.g. Bengaluru, Pune, Delhi NCR, or Tier-2 cities), showing difference % and median monthly salary.
6. marketDemand: Level ("Moderate" | "High" | "Very High") and a 1-sentence hiring trend.
7. negotiationTips: 3 crisp, polite negotiation tactics practical for candidates in India.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You are a veteran Indian compensation intelligence analyst. Always output structured JSON matching the schema.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              targetJob: { type: Type.STRING },
              location: { type: Type.STRING },
              experienceLevel: { type: Type.STRING },
              currency: { type: Type.STRING },
              monthlyRange: {
                type: Type.OBJECT,
                properties: {
                  min: { type: Type.NUMBER },
                  median: { type: Type.NUMBER },
                  max: { type: Type.NUMBER },
                  formattedMin: { type: Type.STRING },
                  formattedMedian: { type: Type.STRING },
                  formattedMax: { type: Type.STRING },
                },
                required: ['min', 'median', 'max', 'formattedMin', 'formattedMedian', 'formattedMax'],
              },
              annualLpaRange: {
                type: Type.OBJECT,
                properties: {
                  min: { type: Type.NUMBER },
                  median: { type: Type.NUMBER },
                  max: { type: Type.NUMBER },
                  formatted: { type: Type.STRING },
                },
                required: ['min', 'median', 'max', 'formatted'],
              },
              percentileTiers: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    tier: { type: Type.STRING },
                    amount: { type: Type.STRING },
                    description: { type: Type.STRING },
                  },
                  required: ['tier', 'amount', 'description'],
                },
              },
              topSalaryBoosters: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    skillOrFactor: { type: Type.STRING },
                    potentialIncrease: { type: Type.STRING },
                    tip: { type: Type.STRING },
                  },
                  required: ['skillOrFactor', 'potentialIncrease', 'tip'],
                },
              },
              locationComparison: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    city: { type: Type.STRING },
                    diffPercentage: { type: Type.STRING },
                    medianMonthly: { type: Type.STRING },
                  },
                  required: ['city', 'diffPercentage', 'medianMonthly'],
                },
              },
              marketDemand: {
                type: Type.OBJECT,
                properties: {
                  level: { type: Type.STRING },
                  hiringTrend: { type: Type.STRING },
                },
                required: ['level', 'hiringTrend'],
              },
              negotiationTips: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: [
              'targetJob',
              'location',
              'experienceLevel',
              'currency',
              'monthlyRange',
              'annualLpaRange',
              'percentileTiers',
              'topSalaryBoosters',
              'locationComparison',
              'marketDemand',
              'negotiationTips',
            ],
          },
        },
      });

      const responseText = response.text || '{}';
      const parsedData = JSON.parse(responseText);
      parsedData.estimatedAt = new Date().toISOString();
      return res.json(parsedData);
    } catch (error: any) {
      console.error('Error in salary benchmarker:', error);
      const { targetJob, experienceLevel, preferredCity, preferredState, education } = req.body;
      const fallback = generateFallbackSalaryBenchmark(targetJob || 'General Role', experienceLevel, preferredCity, preferredState, education);
      return res.json(fallback);
    }
  });

  // Career Path Roadmap Route using Gemini API
  app.post('/api/career-roadmap', async (req, res) => {
    try {
      const { targetJob, education, experienceLevel, skills, preferredCity, workPreference, careerGoal } = req.body;

      if (!targetJob) {
        return res.status(400).json({ error: 'Target job role is required.' });
      }

      const ai = getGenAI();
      if (!ai) {
        const fallback = generateServerFallbackRoadmap(targetJob, education, experienceLevel, skills);
        return res.json(fallback);
      }

      const prompt = `You are a premier career architect and hiring specialist for the Indian employment landscape (freshers, college graduates, diploma holders, and career transitioners).
Break down a candidate's journey into 4 progressive, achievable milestone phases toward landing their dream role: "${targetJob}".

Candidate Profile:
- Target Dream Role: ${targetJob}
- Current Education: ${education || 'Graduate'}
- Experience Level: ${experienceLevel || 'Fresher'}
- Current Skills: ${Array.isArray(skills) && skills.length > 0 ? skills.join(', ') : 'Not specified'}
- Preferred Location: ${preferredCity || 'Pan-India'}
- Work Mode: ${workPreference || 'Office'}
- Career Goal: ${careerGoal || 'Secure an entry-level position and accelerate career trajectory'}

Instructions:
1. Divide the career progression into 4 realistic phases:
   - Phase 1: Foundations & Core Literacy (Weeks 1-4)
   - Phase 2: Applied Practical Skills & Mini-Projects (Weeks 5-8)
   - Phase 3: Capstone Portfolio & ATS Optimization (Weeks 9-12)
   - Phase 4: Mock Interviews, Outreach & Offer Acquisition (Weeks 13-16)
2. For each milestone provide:
   - stepNumber (1, 2, 3, 4)
   - phase (e.g. "Phase 1: Foundations & Tooling")
   - timeFrame (e.g. "Weeks 1–3", "Weeks 4–7")
   - description (2-3 sentences explaining core objectives)
   - 3 to 4 keyCompetencies (tools, software, methodologies)
   - 3 actionable tasks (with id, title, description, completed: false, category: 'learning'|'project'|'networking'|'interview'|'certification', estimatedHours: number)
   - capstoneProject (title, brief, deliverables array)
   - 3 recommendedResources (course names, certification platforms, tutorials)
   - status: stepNumber === 1 ? 'in_progress' : 'upcoming'
3. Provide an authentic Indian market salaryTrajectory (entryLevel, oneYear, threeYears) in CTC and overall note.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You are an elite Indian employment market career coach. Always output structured JSON adhering strictly to the schema.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              targetRole: { type: Type.STRING },
              candidateTier: { type: Type.STRING },
              currentEducation: { type: Type.STRING },
              estimatedTotalMonths: { type: Type.STRING },
              overallProgressPercent: { type: Type.INTEGER },
              summaryNote: { type: Type.STRING },
              salaryTrajectory: {
                type: Type.OBJECT,
                properties: {
                  entryLevel: { type: Type.STRING },
                  oneYear: { type: Type.STRING },
                  threeYears: { type: Type.STRING },
                },
                required: ['entryLevel', 'oneYear', 'threeYears'],
              },
              milestones: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    stepNumber: { type: Type.INTEGER },
                    phase: { type: Type.STRING },
                    timeFrame: { type: Type.STRING },
                    description: { type: Type.STRING },
                    keyCompetencies: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    tasks: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          id: { type: Type.STRING },
                          title: { type: Type.STRING },
                          description: { type: Type.STRING },
                          completed: { type: Type.BOOLEAN },
                          category: { type: Type.STRING },
                          estimatedHours: { type: Type.INTEGER },
                        },
                        required: ['id', 'title', 'description', 'completed', 'category'],
                      },
                    },
                    capstoneProject: {
                      type: Type.OBJECT,
                      properties: {
                        title: { type: Type.STRING },
                        brief: { type: Type.STRING },
                        deliverables: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING },
                        },
                      },
                      required: ['title', 'brief', 'deliverables'],
                    },
                    recommendedResources: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    status: { type: Type.STRING },
                  },
                  required: ['id', 'stepNumber', 'phase', 'timeFrame', 'description', 'keyCompetencies', 'tasks', 'capstoneProject', 'recommendedResources', 'status'],
                },
              },
            },
            required: ['targetRole', 'candidateTier', 'currentEducation', 'estimatedTotalMonths', 'summaryNote', 'salaryTrajectory', 'milestones'],
          },
        },
      });

      const responseText = response.text || '{}';
      const parsedData = JSON.parse(responseText);
      parsedData.generatedAt = new Date().toISOString();
      return res.json(parsedData);
    } catch (error: any) {
      console.error('Error in career roadmap API:', error);
      const { targetJob, education, experienceLevel, skills } = req.body;
      const fallback = generateServerFallbackRoadmap(targetJob || 'Entry-Level Professional', education, experienceLevel, skills);
      return res.json(fallback);
    }
  });

  // AI-Powered Interview Prep Tips & Round Guidance
  app.post('/api/interview-tips', async (req, res) => {
    try {
      const { targetJob, education, skills, experienceLevel, roundFocus } = req.body;

      if (!targetJob) {
        return res.status(400).json({ error: 'Target job is required.' });
      }

      const ai = getGenAI();
      if (!ai) {
        // Return structured server fallback
        const fallback = generateServerFallbackInterviewTips(targetJob, education, skills);
        return res.json(fallback);
      }

      const prompt = `You are a world-class executive interview coach and senior hiring manager specialized in the Indian and global corporate landscape.
Create a comprehensive, role-specific Interview Preparation Guide and Round-by-Round Strategy Cheatsheet for a candidate targeting the role of: "${targetJob}".

Candidate Profile:
- Target Role: ${targetJob}
- Education: ${education || 'Graduate'}
- Experience Level: ${experienceLevel || 'Fresher / Entry-Level'}
- Skills: ${Array.isArray(skills) && skills.length > 0 ? skills.join(', ') : 'Standard domain fundamentals'}
- Focus Area: ${roundFocus || 'All Interview Rounds'}

Instructions:
1. Provide 6 to 8 highly actionable, round-by-round tips across:
   - behavioral (STAR Method stories, conflict resolution, handling failure)
   - technical (Domain-specific problem solving, live tests/roleplays, explaining logic out loud)
   - hr (90-second elevator pitch, "Why this company", career gaps, weakness without cliché)
   - salary (Negotiating CTC ranges, fixed vs variable in Indian market, not anchoring too low)
   - reverse_questions (Strategic questions to ask the interviewer)
   - dos_donts (Body language, virtual setup, thank-you notes)
2. Each tip must include:
   - id (unique string e.g. "tip-1")
   - roundType ("behavioral" | "technical" | "hr" | "salary" | "reverse_questions" | "dos_donts")
   - title (punchy title)
   - categoryTag (e.g. "STAR Method", "Live Coding", "Salary Anchor", "Elevator Pitch")
   - summary (2 sentences)
   - recommendedFramework (e.g., "Situation -> Task -> Action -> Result" or step-by-step logic)
   - sampleQuestion (realistic question asked for ${targetJob})
   - sampleAnswerTemplate (concrete, fill-in-the-blank or structured sample script)
   - proTips (3 bullet points)
   - commonMistakesToAvoid (2 bullet points)
3. highImpactChecklist: 5 crucial checklist items to execute 24 hours before the interview.
4. elevatorPitchFormula:
   - hook (1 sentence)
   - proofPoints (1-2 sentences with metrics)
   - targetAlignment (1 sentence connecting to company vision)
5. questionsToAskInterviewer: 3 high-impact questions (category, question, whyItWorks).`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You are an elite interview coaching intelligence model. Always output structured JSON adhering strictly to the schema.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              targetRole: { type: Type.STRING },
              roundTips: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    roundType: { type: Type.STRING },
                    title: { type: Type.STRING },
                    categoryTag: { type: Type.STRING },
                    summary: { type: Type.STRING },
                    recommendedFramework: { type: Type.STRING },
                    sampleQuestion: { type: Type.STRING },
                    sampleAnswerTemplate: { type: Type.STRING },
                    proTips: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    commonMistakesToAvoid: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                  },
                  required: ['id', 'roundType', 'title', 'categoryTag', 'summary', 'proTips'],
                },
              },
              highImpactChecklist: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              elevatorPitchFormula: {
                type: Type.OBJECT,
                properties: {
                  hook: { type: Type.STRING },
                  proofPoints: { type: Type.STRING },
                  targetAlignment: { type: Type.STRING },
                },
                required: ['hook', 'proofPoints', 'targetAlignment'],
              },
              questionsToAskInterviewer: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    category: { type: Type.STRING },
                    question: { type: Type.STRING },
                    whyItWorks: { type: Type.STRING },
                  },
                  required: ['category', 'question', 'whyItWorks'],
                },
              },
            },
            required: ['targetRole', 'roundTips', 'highImpactChecklist', 'elevatorPitchFormula', 'questionsToAskInterviewer'],
          },
        },
      });

      const responseText = response.text || '{}';
      const parsedData = JSON.parse(responseText);
      parsedData.generatedAt = new Date().toISOString();
      return res.json(parsedData);
    } catch (error: any) {
      console.error('Error in interview tips API:', error);
      const { targetJob, education, skills } = req.body;
      const fallback = generateServerFallbackInterviewTips(targetJob || 'General Professional', education, skills);
      return res.json(fallback);
    }
  });

  // ==========================================
  // Mock Interview Interactive Gemini Endpoints
  // ==========================================
  app.post('/api/mock-interview/start', async (req, res) => {
    try {
      const {
        targetJob,
        industry,
        education,
        experienceLevel,
        skills,
        readinessScore,
        readinessCategory,
        questionCount = 4,
      } = req.body;

      const jobTitle = targetJob || 'Professional Associate';
      const ai = getGenAI();

      if (!ai) {
        return res.json(generateFallbackMockInterviewStart(jobTitle, experienceLevel, education, skills, questionCount));
      }

      const prompt = `You are an elite Senior Hiring Manager and Interview Specialist conducting an interactive mock interview.
Tailor the interview specifically to the candidate's profile and readiness level.

Candidate Profile:
- Target Job: ${jobTitle}
- Industry/Domain: ${industry || 'Corporate / Technology / Services'}
- Education: ${education || 'Graduate'}
- Experience Level: ${experienceLevel || 'Fresher / Entry-Level'}
- Skills: ${Array.isArray(skills) && skills.length > 0 ? skills.join(', ') : 'Standard domain fundamentals'}
- Current Job Readiness Score: ${readinessScore || 65}/100 (${readinessCategory || 'Job Ready in Progress'})
- Number of Questions Requested: ${questionCount}

Instructions:
1. Generate ${questionCount} realistic, high-yield interview questions ranging from:
   - Question 1: Icebreaker / Background / Elevator Pitch ("Tell me about yourself and why you're interested in ${jobTitle}")
   - Question 2: Technical / Practical Domain Skill application question relevant to ${jobTitle}
   - Question 3: Behavioral / Situational problem solving (using STAR method)
   - Question 4: Pressure / Real-world scenario (handling tight deadlines, challenging customers, bugs, or conflicts)
2. Calibrate difficulty to match their experience level (${experienceLevel || 'Fresher'}) and readiness (${readinessScore || 65}/100).
3. Provide helpful guidance hints and sample bullet points for what a hiring manager looks for.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You are a professional hiring manager and interview coach. Always output structured JSON adhering strictly to the schema.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              roleTitle: { type: Type.STRING },
              introMessage: { type: Type.STRING },
              candidateReadinessLevel: { type: Type.STRING },
              questions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    questionText: { type: Type.STRING },
                    questionType: { type: Type.STRING, description: 'behavioral, technical, situational, or introduction' },
                    difficulty: { type: Type.STRING, description: 'Easy, Medium, Hard' },
                    expectedKeywords: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    interviewerIntent: { type: Type.STRING },
                    suggestedAnswerFramework: { type: Type.STRING },
                  },
                  required: ['id', 'questionText', 'questionType', 'difficulty', 'expectedKeywords', 'interviewerIntent'],
                },
              },
            },
            required: ['roleTitle', 'introMessage', 'questions'],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json(parsed);
    } catch (err: any) {
      console.error('Error in mock interview start:', err);
      const { targetJob, experienceLevel, education, skills, questionCount } = req.body;
      return res.json(generateFallbackMockInterviewStart(targetJob || 'Role', experienceLevel, education, skills, questionCount || 4));
    }
  });

  app.post('/api/mock-interview/evaluate', async (req, res) => {
    try {
      const { targetJob, questionText, questionType, candidateAnswer, experienceLevel, readinessScore } = req.body;

      if (!candidateAnswer || candidateAnswer.trim().length === 0) {
        return res.json({
          score: 15,
          feedback: 'No answer provided. In a live interview, taking a moment to structure your thoughts or asking for clarification is much better than staying silent.',
          strengths: ['Attempted session'],
          improvements: ['Provide a structured verbal answer with concrete examples.'],
          idealAnswerSample: `When answering "${questionText}", start with a direct summary, give 1 specific real-world example, and conclude with the impact.`,
          followUpPrompt: 'Could you share an experience where you had to learn a skill quickly on the job?',
        });
      }

      const ai = getGenAI();
      if (!ai) {
        return res.json(generateFallbackAnswerEvaluation(candidateAnswer, questionType));
      }

      const prompt = `You are a Senior Recruiter evaluating a candidate's answer during a mock interview.

Context:
- Target Job: ${targetJob || 'Professional Role'}
- Question Type: ${questionType || 'general'}
- Candidate Experience Level: ${experienceLevel || 'Fresher / Entry-Level'}
- Candidate's Job Readiness Score: ${readinessScore || 70}/100
- Question Asked: "${questionText}"
- Candidate's Response: "${candidateAnswer}"

Instructions:
1. Score the answer from 0 to 100 on realism, structure (STAR format where applicable), communication clarity, and domain relevance.
2. Provide 2-3 specific strengths of their answer.
3. Provide 2-3 actionable areas of improvement (e.g. adding quantifiable metrics, clearer structure, removing filler words).
4. Provide an "idealAnswerSample" that demonstrates how a top 5% candidate would answer this exact question concisely (90-120 words).
5. Suggest a smart follow-up question ("followUpPrompt") that a hiring manager would naturally ask next.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You are an insightful executive hiring coach. Always output structured JSON matching the schema.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.INTEGER },
              feedback: { type: Type.STRING },
              strengths: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              improvements: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              idealAnswerSample: { type: Type.STRING },
              followUpPrompt: { type: Type.STRING },
            },
            required: ['score', 'feedback', 'strengths', 'improvements', 'idealAnswerSample'],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json(parsed);
    } catch (err: any) {
      console.error('Error in mock interview evaluate:', err);
      return res.json(generateFallbackAnswerEvaluation(req.body.candidateAnswer || '', req.body.questionType));
    }
  });

  // WhatsApp Cloud API Webhook Endpoints
  const { handleWebhookVerification, handleWebhookEvent } = await import('./src/services/whatsappWebhook');
  app.get('/api/whatsapp/webhook', handleWebhookVerification);
  app.post('/api/whatsapp/webhook', handleWebhookEvent);

  // Vite middleware for dev / static for prod
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

function generateFallbackAnalysis(
  targetJob: string,
  userSkills: string[],
  education?: string,
  experienceLevel?: string
) {
  const normalizedRole = targetJob.toLowerCase();
  
  let coreRequired: { name: string; category: string; importance: string; tip: string; time: string; why: string }[] = [];
  let tools: string[] = ['MS Excel', 'Gmail & Google Workspace', 'WhatsApp for Business'];
  let tasks: string[] = ['Handling daily reports', 'Coordinating with team members', 'Resolving client or process queries'];

  if (normalizedRole.includes('tele') || normalizedRole.includes('bpo') || normalizedRole.includes('customer') || normalizedRole.includes('support')) {
    coreRequired = [
      { name: 'Customer Communication & Active Listening', category: 'Workplace', importance: 'Critical', tip: 'Practice mock phone greetings and empathetic query resolution.', time: '3-4 days', why: 'Essential for first-call resolution and customer satisfaction.' },
      { name: 'CRM & Ticketing Software (Zoho / Freshdesk)', category: 'Tool', importance: 'Important', tip: 'Watch free introductory walkthroughs of Zoho CRM or Zendesk.', time: '2-3 days', why: 'Used to log and track customer interactions.' },
      { name: 'English & Regional Verbal Fluency', category: 'Workplace', importance: 'Important', tip: 'Record daily 2-minute mock conversations on call scenarios.', time: '1-2 weeks', why: 'Enables clear communication across diverse customer bases.' },
      { name: 'Keyboard Typing Speed (25+ WPM)', category: 'Technical', importance: 'Important', tip: 'Use free typing practice tools 15 mins daily.', time: '1 week', why: 'Ensures fast notes taking during live calls.' },
    ];
    tools = ['Zoho Desk', 'MS Excel', 'Dialer Software', 'Google Sheets'];
    tasks = ['Answering inbound customer queries', 'Logging tickets in CRM', 'Escalating unresolved issues to tier-2 teams'];
  } else if (normalizedRole.includes('data') || normalizedRole.includes('excel') || normalizedRole.includes('analyst') || normalizedRole.includes('back office')) {
    coreRequired = [
      { name: 'Advanced Excel (VLOOKUP, XLOOKUP, Pivot Tables)', category: 'Technical', importance: 'Critical', tip: 'Practice creating pivot tables and lookup formulas with sample datasets.', time: '4-6 days', why: 'Fundamental requirement for all reporting and data cleanup jobs.' },
      { name: 'Data Validation & Cleaning', category: 'Technical', importance: 'Important', tip: 'Learn conditional formatting, text-to-columns, and remove duplicates in spreadsheets.', time: '2-3 days', why: 'Prevents data entry errors in corporate sheets.' },
      { name: 'Basic SQL / Database Queries', category: 'Technical', importance: 'Important', tip: 'Learn SELECT, WHERE, GROUP BY, and JOIN syntax.', time: '1-2 weeks', why: 'Helps retrieve records directly from production databases.' },
      { name: 'Business Report Formatting', category: 'Workplace', importance: 'Important', tip: 'Learn clean header formatting, currency formatting, and chart styling.', time: '2-3 days', why: 'Allows managers to immediately understand summary tables.' },
    ];
    tools = ['Microsoft Excel', 'Google Sheets', 'MySQL Workbench', 'Power BI (Basics)'];
    tasks = ['Preparing daily sales and operations MIS reports', 'Cleaning raw vendor data', 'Verifying transaction entries'];
  } else if (normalizedRole.includes('developer') || normalizedRole.includes('software') || normalizedRole.includes('web') || normalizedRole.includes('frontend')) {
    coreRequired = [
      { name: 'Git & GitHub Version Control', category: 'Tool', importance: 'Critical', tip: 'Practice git commit, push, pull, and branch workflows in terminal.', time: '3-5 days', why: 'Standard collaboration requirement across all development teams.' },
      { name: 'REST API Integration & Async JavaScript', category: 'Technical', importance: 'Critical', tip: 'Build a small project fetching and rendering data from a public API.', time: '5-7 days', why: 'Enables frontend components to connect with backend databases.' },
      { name: 'Responsive Web Design & Tailwind/CSS', category: 'Technical', importance: 'Important', tip: 'Build mobile-first layouts with flexbox and grid.', time: '4-5 days', why: 'Ensures application renders cleanly across mobile and desktop.' },
      { name: 'Component Debugging & Clean Code', category: 'Technical', importance: 'Important', tip: 'Use Chrome DevTools console and breakpoint debugger.', time: '3-4 days', why: 'Reduces runtime bugs and improves code maintainability.' },
    ];
    tools = ['VS Code', 'Git / GitHub', 'Chrome DevTools', 'Postman', 'Node.js'];
    tasks = ['Developing reusable UI components', 'Connecting frontend to REST APIs', 'Fixing UI layout defects and cross-browser bugs'];
  } else if (normalizedRole.includes('electrician') || normalizedRole.includes('technician') || normalizedRole.includes('fitter') || normalizedRole.includes('iti')) {
    coreRequired = [
      { name: 'Industrial Electrical Safety Standards (PPE, Lockout-Tagout)', category: 'Domain', importance: 'Critical', tip: 'Study standard Indian Electricity Rules and hazard prevention procedures.', time: '3-4 days', why: 'Mandatory workplace safety compliance.' },
      { name: 'Circuit Diagram & Blueprints Reading', category: 'Technical', importance: 'Critical', tip: 'Practice tracing standard single-line wiring schematics.', time: '1 week', why: 'Essential to diagnose and wire electrical control panels.' },
      { name: 'Multimeter & Testing Tools Troubleshooting', category: 'Tool', importance: 'Important', tip: 'Practice testing continuity, AC/DC voltage, and resistance safely.', time: '2-3 days', why: 'Primary method for detecting faulty lines and components.' },
      { name: 'Preventive Maintenance Documentation', category: 'Workplace', importance: 'Important', tip: 'Learn how to log daily machine health check checklists.', time: '2 days', why: 'Required by facility supervisors to prevent machine downtime.' },
    ];
    tools = ['Digital Multimeter', 'Insulated Tool Kit', 'Wire Strippers', 'Control Panel Enclosures'];
    tasks = ['Testing circuit continuity', 'Replacing worn wiring harnesses', 'Filling daily equipment maintenance logs'];
  } else {
    coreRequired = [
      { name: 'Job-Specific Technical Foundations', category: 'Technical', importance: 'Critical', tip: 'Review top 10 standard interview questions for ' + targetJob, time: '1 week', why: 'Direct requirement tested during recruiter screening rounds.' },
      { name: 'Professional Workplace Communication', category: 'Workplace', importance: 'Important', tip: 'Draft polite emails, meeting summaries, and follow-ups.', time: '3-4 days', why: 'Builds stakeholder confidence in your professional reliability.' },
      { name: 'Core Industry Software & Tools', category: 'Tool', importance: 'Important', tip: 'Learn the primary software suite used in ' + targetJob + ' roles.', time: '1 week', why: 'Reduces on-the-job training time required by employers.' },
      { name: 'Time & Task Management', category: 'Workplace', importance: 'Nice to Have', tip: 'Use daily task checklists and priority matrix (urgent vs important).', time: '2 days', why: 'Ensures dependable execution of daily work deliverables.' },
    ];
  }

  const matching: { name: string; strength: string; relevance: string }[] = [];
  const missing: any[] = [];

  const userSkillLower = userSkills.map(s => s.toLowerCase());

  coreRequired.forEach(req => {
    const isMatched = userSkillLower.some(us => 
      us.includes(req.name.toLowerCase().split(' ')[0]) || 
      req.name.toLowerCase().includes(us)
    );

    if (isMatched) {
      matching.push({
        name: req.name,
        strength: 'High',
        relevance: req.why,
      });
    } else {
      missing.push({
        name: req.name,
        importance: req.importance,
        category: req.category,
        whyNeeded: req.why,
        learningTip: req.tip,
        estimatedTimeToLearn: req.time,
      });
    }
  });

  // User skills that aren't in core list but still good
  userSkills.forEach(us => {
    if (!matching.some(m => m.name.toLowerCase().includes(us.toLowerCase()))) {
      matching.push({
        name: us,
        strength: 'Medium',
        relevance: 'Demonstrates foundational capability and willingness to learn.',
      });
    }
  });

  const matchRatio = matching.length / Math.max(1, (matching.length + missing.length));
  const score = Math.round(Math.min(95, Math.max(25, matchRatio * 100)));

  return {
    targetRole: targetJob,
    overallMatchScore: score,
    matchingSkills: matching,
    missingSkills: missing,
    industryBenchmark: {
      inDemandTools: tools,
      typicalDailyTasks: tasks,
      entryLevelExpectation: `Employers look for solid fundamentals in ${targetJob}, high reliability, and basic tool competency.`,
    },
    recommendationSummary: `Your profile has a solid foundation for ${targetJob}. Focusing on the highlighted critical skills will substantially increase your shortlist rate with hiring managers.`,
  };
}

function generateFallbackInterviewQuestions(targetJob: string, count: number) {
  const norm = targetJob.toLowerCase();
  let questions: Array<{ id: number; questionText: string; questionType: string; contextTip: string; idealAnswerKeyPoints: string[] }> = [];

  if (norm.includes('customer') || norm.includes('tele') || norm.includes('bpo') || norm.includes('support')) {
    questions = [
      {
        id: 1,
        questionText: 'Can you introduce yourself and explain why you want to work in customer support?',
        questionType: 'introductory',
        contextTip: 'State your education, language strengths, and natural empathy for helping people solve problems.',
        idealAnswerKeyPoints: ['Brief education & background', 'Passion for customer communication', 'Active listening skills'],
      },
      {
        id: 2,
        questionText: 'How would you handle an angry customer whose delivery or service is delayed by 3 days?',
        questionType: 'situational',
        contextTip: 'The interviewer is testing your composure, empathy, and structured de-escalation technique.',
        idealAnswerKeyPoints: ['Listen without interrupting & validate frustration', 'Apologize sincerely for the inconvenience', 'Provide a clear timeline or escalation action'],
      },
      {
        id: 3,
        questionText: 'If a customer asks a question you do not know the answer to, what will you do?',
        questionType: 'behavioral',
        contextTip: 'Show honesty, resourcefulness, and willingness to consult knowledge bases or team seniors.',
        idealAnswerKeyPoints: ['Never guess or give incorrect info', 'Politely place on brief hold while checking standard SOP/CRM', 'Provide exact verified resolution promptly'],
      },
      {
        id: 4,
        questionText: 'How do you maintain your energy and positive attitude during a high-volume shift of 60+ calls?',
        questionType: 'workplace',
        contextTip: 'Interviewer wants to see emotional resilience and work-readiness.',
        idealAnswerKeyPoints: ['Treat each customer as a fresh interaction', 'Take quick scheduled micro-breaks', 'Focus on resolution satisfaction'],
      },
    ];
  } else if (norm.includes('data') || norm.includes('excel') || norm.includes('analyst') || norm.includes('office')) {
    questions = [
      {
        id: 1,
        questionText: 'Tell me about yourself and your practical experience working with spreadsheets and datasets.',
        questionType: 'introductory',
        contextTip: 'Mention your education, typing speed, and key Excel functions you know well.',
        idealAnswerKeyPoints: ['Background & education', 'Familiarity with Excel / Google Sheets', 'Attention to zero data error tolerance'],
      },
      {
        id: 2,
        questionText: 'How would you use VLOOKUP or XLOOKUP to match sales records between two different sheets?',
        questionType: 'technical',
        contextTip: 'Explain the syntax simply: lookup value, table array, column index, and exact match false/0.',
        idealAnswerKeyPoints: ['Lookup key identifier', 'Table selection & exact match parameter', 'Handling #N/A errors with IFERROR'],
      },
      {
        id: 3,
        questionText: 'If you discover duplicate or mismatched customer rows in a master file, how do you fix it?',
        questionType: 'situational',
        contextTip: 'Show data hygiene habits: backup copies, conditional formatting, and remove duplicate tools.',
        idealAnswerKeyPoints: ['Keep original backup copy before changes', 'Use highlight duplicate rules', 'Audit and verify before final report generation'],
      },
      {
        id: 4,
        questionText: 'How do you ensure 100% accuracy when entering 500+ records under tight deadlines?',
        questionType: 'behavioral',
        contextTip: 'Highlight data validation rules, double-checking totals with SUM checks, and focus.',
        idealAnswerKeyPoints: ['Data validation constraints', 'Cross-verifying sum and row counts', 'Structured milestone checks'],
      },
    ];
  } else if (norm.includes('developer') || norm.includes('software') || norm.includes('web') || norm.includes('frontend')) {
    questions = [
      {
        id: 1,
        questionText: 'Introduce yourself and walk me through a technical project you built recently.',
        questionType: 'introductory',
        contextTip: 'Highlight tech stack (React, TypeScript, CSS), problem solved, and what you learned.',
        idealAnswerKeyPoints: ['Project purpose & tech stack', 'Your specific role & component logic', 'Challenges overcome'],
      },
      {
        id: 2,
        questionText: 'How do you handle asynchronous data fetching and API error states in frontend applications?',
        questionType: 'technical',
        contextTip: 'Discuss loading states, try/catch blocks, error boundaries, and UX feedback.',
        idealAnswerKeyPoints: ['Loading / pending UI indicators', 'Try-catch blocks & status code handling', 'Fallback states for empty or error data'],
      },
      {
        id: 3,
        questionText: 'What steps do you take when debugging a responsive CSS layout issue on mobile screens?',
        questionType: 'situational',
        contextTip: 'Mention Chrome DevTools device mode, flexbox/grid layout inspection, and overflow checking.',
        idealAnswerKeyPoints: ['Mobile viewport emulation in DevTools', 'Inspecting margin/padding collisions & overflow-x', 'Tailwind responsive breakpoints'],
      },
      {
        id: 4,
        questionText: 'How do you resolve a Git merge conflict when collaborating with another developer?',
        questionType: 'behavioral',
        contextTip: 'Demonstrate communication with teammate, analyzing conflict markers, and running tests.',
        idealAnswerKeyPoints: ['Inspect conflicting lines carefully', 'Communicate with teammate if intent is ambiguous', 'Run tests to ensure functionality remains intact'],
      },
    ];
  } else {
    questions = [
      {
        id: 1,
        questionText: `Please introduce yourself and explain what motivated you to pursue a career in ${targetJob}.`,
        questionType: 'introductory',
        contextTip: 'Focus on your educational foundation, key practical skills, and eagerness to contribute.',
        idealAnswerKeyPoints: ['Clear self introduction', 'Relevant skills for the role', 'Career growth motivation'],
      },
      {
        id: 2,
        questionText: `What are the most important daily skills or qualities required to succeed in ${targetJob}?`,
        questionType: 'technical',
        contextTip: 'Demonstrate understanding of the job role and employer expectations.',
        idealAnswerKeyPoints: ['Specific technical knowledge', 'Punctuality & reliability', 'Team collaboration'],
      },
      {
        id: 3,
        questionText: 'Describe a time you faced a difficult challenge or tight deadline. How did you handle it?',
        questionType: 'behavioral',
        contextTip: 'Use STAR method: Situation, Task, Action you took, and positive Result.',
        idealAnswerKeyPoints: ['Clear context setting', 'Proactive action and focus', 'Positive learning outcome'],
      },
      {
        id: 4,
        questionText: 'Where do you see yourself professionally in the next 2 to 3 years within our company?',
        questionType: 'behavioral',
        contextTip: 'Show stability, continuous learning desire, and commitment to the role.',
        idealAnswerKeyPoints: ['Mastering initial role deliverables', 'Taking on higher responsibilities', 'Continuous skill upskilling'],
      },
    ];
  }

  const selected = questions.slice(0, count);
  return {
    roleTitle: targetJob,
    introMessage: `Welcome to your AI Mock Interview for ${targetJob}. Answer clearly and naturally.`,
    questions: selected,
  };
}

function generateFallbackEvaluation(questionText: string, answer: string) {
  const words = answer.trim().split(/\s+/).length;
  let score = 70;
  let rating = 'Good';

  if (words < 8) {
    score = 50;
    rating = 'Needs Work';
  } else if (words >= 25 && words <= 120) {
    score = 85;
    rating = 'Excellent';
  } else if (words > 120) {
    score = 78;
    rating = 'Good';
  }

  return {
    score,
    rating,
    feedback: words < 8
      ? 'Your answer was too brief. Try to elaborate with specific examples, actions you took, and measurable results.'
      : 'Good structure and clear communication. You addressed the core question directly.',
    strengths: [
      'Direct and to-the-point response',
      'Professional and respectful tone',
    ],
    improvements: [
      'Provide 1 concrete example or metric from past experience/projects',
      'Use the STAR structure (Situation, Task, Action, Result) for situational questions',
    ],
    sampleBestAnswer: 'In my previous experience and projects, I prioritize clear communication, structured problem-solving, and double-checking deliverables against standards. For this role, I would bring that same disciplined focus and proactive learning mindset.',
  };
}

function generateFallbackCareerInsight(
  targetJob: string,
  experienceLevel?: string,
  education?: string,
  preferredCity?: string
) {
  const norm = (targetJob || '').toLowerCase();

  if (norm.includes('customer') || norm.includes('tele') || norm.includes('support') || norm.includes('bpo')) {
    return {
      headline: 'Master The 3-Second Empathetic Opening',
      category: 'Interview Strategy',
      actionableTip: 'Recruiters evaluate your opening 10 seconds for warmth, clarity, and pacing. Avoid rushing; state your name, acknowledge the caller politely, and assure prompt resolution.',
      quickAction: 'Record yourself saying a 10-second standard professional greeting on your phone and listen for vocal clarity.',
      impactTag: '+25% Recruiter Shortlist Rate',
    };
  } else if (norm.includes('data') || norm.includes('excel') || norm.includes('analyst') || norm.includes('office')) {
    return {
      headline: 'Add Measurable Numbers to Your Spreadsheets Experience',
      category: 'ATS & Resume',
      actionableTip: 'Recruiters scan for volume indicators in data roles. Instead of writing "Prepared Excel reports", specify "Managed daily MIS tracking 400+ transaction rows with XLOOKUP & Pivot Tables with 0% error rate".',
      quickAction: 'Update at least one bullet in your resume to include an exact dataset size or daily transaction count.',
      impactTag: '+30% ATS Score Boost',
    };
  } else if (norm.includes('developer') || norm.includes('software') || norm.includes('web') || norm.includes('frontend')) {
    return {
      headline: 'Link Live Demo URLs in Your Profile',
      category: 'Hiring Insight',
      actionableTip: 'In Indian tech hiring, hiring managers prioritize verified GitHub repositories and live deployed links over degree certificates alone. Having 2 working live projects puts you ahead of 80% of applicants.',
      quickAction: 'Verify that your top GitHub repo has a clear README with screenshot and a live preview URL.',
      impactTag: 'Top Interview Differentiator',
    };
  }

  return {
    headline: 'Align Your Profile Keywords with Active Job Posts',
    category: 'Workplace Readiness',
    actionableTip: `Hiring managers for ${targetJob} use automated screening filters for core tools and role competencies. Review 3 recent job postings in ${preferredCity || 'your city'} and ensure their primary keywords appear naturally in your profile summary.`,
    quickAction: 'Read one active job description for your target role and note down 3 common tools or keywords mentioned.',
    impactTag: '+20% Recruiter Callbacks',
  };
}

function generateFallbackResumeAnalysis(
  resumeText: string,
  targetJob: string,
  experienceLevel?: string,
  education?: string,
  skills?: string[]
) {
  const normText = resumeText.toLowerCase();
  const normRole = (targetJob || '').toLowerCase();

  // Role specific keywords dictionary
  let expectedKeywords: string[] = ['Communication', 'Teamwork', 'MS Excel', 'Problem Solving', 'Time Management', 'Documentation'];
  let roleTitleFound = normText.includes(normRole.split(' ')[0]);

  if (normRole.includes('customer') || normRole.includes('tele') || normRole.includes('bpo') || normRole.includes('support')) {
    expectedKeywords = ['Customer Support', 'CRM', 'Active Listening', 'Inbound Calls', 'Ticket Resolution', 'Zendesk', 'Client Communication', 'Escalations', 'SOP Compliance'];
  } else if (normRole.includes('data') || normRole.includes('excel') || normRole.includes('analyst') || normRole.includes('office')) {
    expectedKeywords = ['Microsoft Excel', 'VLOOKUP', 'Pivot Tables', 'MIS Reporting', 'Data Validation', 'Data Cleaning', 'SQL', 'Google Sheets', 'Accuracy'];
  } else if (normRole.includes('developer') || normRole.includes('software') || normRole.includes('web') || normRole.includes('frontend')) {
    expectedKeywords = ['React', 'TypeScript', 'JavaScript', 'HTML5', 'CSS3', 'Tailwind CSS', 'Git', 'REST API', 'Responsive Design', 'Component Architecture'];
  } else if (normRole.includes('electrician') || normRole.includes('technician') || normRole.includes('iti') || normRole.includes('fitter')) {
    expectedKeywords = ['Electrical Wiring', 'Safety Standards', 'Circuit Blueprints', 'Multimeter', 'Preventive Maintenance', 'Troubleshooting', 'Panel Assembly'];
  } else if (normRole.includes('qa') || normRole.includes('test')) {
    expectedKeywords = ['Manual Testing', 'Test Cases', 'Bug Reporting', 'JIRA', 'Regression Testing', 'API Testing', 'Postman', 'SDLC / STLC'];
  } else if (normRole.includes('design') || normRole.includes('ui') || normRole.includes('ux')) {
    expectedKeywords = ['Figma', 'Wireframing', 'Prototyping', 'User Research', 'Design Systems', 'Responsive UI', 'Information Architecture'];
  }

  const matchedKeywords: string[] = [];
  const missingKeywords: string[] = [];

  expectedKeywords.forEach(kw => {
    if (normText.includes(kw.toLowerCase())) {
      matchedKeywords.push(kw);
    } else {
      missingKeywords.push(kw);
    }
  });

  // Check for numbers / metrics (% or numbers or metrics)
  const numbersFound = (resumeText.match(/\d+%|\d+\s*(users|clients|records|calls|tickets|projects|months|years|days|hrs|wpm|k\+)/gi) || []).length;
  const hasContactInfo = normText.includes('@') || normText.includes('phone') || normText.includes('+91') || normText.includes('email');
  const hasEducation = normText.includes('education') || normText.includes('college') || normText.includes('university') || normText.includes('diploma') || normText.includes('iti') || normText.includes('school') || normText.includes('degree');
  const hasExperienceOrProjects = normText.includes('experience') || normText.includes('project') || normText.includes('work history') || normText.includes('internship') || normText.includes('academic project');
  const hasSkillsSection = normText.includes('skills') || normText.includes('technologies') || normText.includes('competencies') || normText.includes('tools');
  const hasSummary = normText.includes('summary') || normText.includes('objective') || normText.includes('profile');

  // Calculate ATS Score
  let calculatedScore = 50;
  if (matchedKeywords.length >= 3) calculatedScore += 15;
  if (matchedKeywords.length >= 5) calculatedScore += 10;
  if (numbersFound >= 2) calculatedScore += 10;
  if (hasContactInfo) calculatedScore += 5;
  if (hasEducation) calculatedScore += 5;
  if (hasExperienceOrProjects) calculatedScore += 5;
  if (hasSkillsSection) calculatedScore += 5;
  if (roleTitleFound) calculatedScore += 5;

  calculatedScore = Math.min(94, Math.max(35, calculatedScore));

  let grade: 'Needs Major Work' | 'Fair' | 'Competitive' | 'Top Tier' = 'Fair';
  if (calculatedScore < 55) grade = 'Needs Major Work';
  else if (calculatedScore < 70) grade = 'Fair';
  else if (calculatedScore < 85) grade = 'Competitive';
  else grade = 'Top Tier';

  const roleMatch = Math.round(Math.min(96, Math.max(30, (matchedKeywords.length / Math.max(1, expectedKeywords.length)) * 100 + (roleTitleFound ? 20 : 0))));

  return {
    targetRole: targetJob,
    atsScore: calculatedScore,
    scoreGrade: grade,
    roleMatchPercentage: roleMatch,
    executiveSummary: `Your resume demonstrates good foundational structure for ${targetJob}, but needs stronger quantification of accomplishments and better alignment with high-priority ATS keywords.`,
    strengths: [
      hasSkillsSection ? 'Clear skills categorization detected' : 'Good foundational background representation',
      matchedKeywords.length > 0 ? `Detected ${matchedKeywords.length} relevant industry keyword(s)` : 'Clear readable linear format',
      hasEducation ? 'Education and academic qualifications are clearly visible' : 'Direct and readable formatting',
      numbersFound > 0 ? 'Includes specific quantifiable metrics or timeline data' : 'Straightforward functional overview',
    ],
    criticalGaps: [
      missingKeywords.length > 0 ? `Missing key ATS search terms: ${missingKeywords.slice(0, 3).join(', ')}` : 'Lacks technical depth in project descriptions',
      numbersFound < 2 ? 'Lacks quantifiable metric proof (e.g. % efficiency, volume of tasks handled, project scale)' : 'Could expand on impact of deliverables',
      !roleTitleFound ? `Target job title "${targetJob}" is not explicitly prominent in the header or summary` : 'Summary could be punchier',
      'Action verbs in bullet points can be strengthened using the XYZ accomplishment formula',
    ],
    sectionReviews: [
      {
        sectionName: 'Contact & Header',
        status: hasContactInfo ? 'pass' : 'warning',
        feedback: hasContactInfo ? 'Contact details and location are accessible and easy for scanners to parse.' : 'Ensure full name, phone number, professional email, and LinkedIn/GitHub links are on top.',
        suggestion: 'Keep header strictly text-based. Avoid placing contact info inside header/footer boxes which some ATS parsers skip.',
      },
      {
        sectionName: 'Professional Summary / Objective',
        status: hasSummary ? 'pass' : 'warning',
        feedback: hasSummary ? 'Summary sets initial context but could highlight your core specialty more directly.' : 'A 2-line target summary at the top helps recruiters immediately identify your value.',
        suggestion: `Explicitly state "${targetJob}" in your first sentence alongside your top 2 skills.`,
      },
      {
        sectionName: 'Work Experience & Projects',
        status: hasExperienceOrProjects ? (numbersFound >= 2 ? 'pass' : 'warning') : 'needs_work',
        feedback: numbersFound >= 2 ? 'Projects have concrete metrics and deliverables.' : 'Experience entries describe daily duties rather than measurable achievements.',
        suggestion: 'Rewrite bullet points to begin with strong past-tense action verbs (Engineered, Spearheaded, Coordinated, Optimized) and add numbers.',
      },
      {
        sectionName: 'Technical & Domain Skills',
        status: matchedKeywords.length >= 3 ? 'pass' : 'warning',
        feedback: `Contains ${matchedKeywords.length} matched competencies for ${targetJob}.`,
        suggestion: `Add the missing high-demand keywords (${missingKeywords.slice(0, 3).join(', ')}) into a structured Skills section.`,
      },
      {
        sectionName: 'Education & Credentials',
        status: hasEducation ? 'pass' : 'warning',
        feedback: 'Educational qualification and graduation year are present.',
        suggestion: 'List degree name, institution, graduation year, and any relevant coursework or high GPA.',
      },
    ],
    keywordAnalysis: {
      matchedKeywords: matchedKeywords.length > 0 ? matchedKeywords : ['General Professionalism', 'Communication'],
      missingHighPriorityKeywords: missingKeywords.length > 0 ? missingKeywords : ['Agile Methodology', 'Process Improvement', 'Quality Assurance'],
      recommendedPlacementTips: [
        'Include high-frequency keywords in your Skills pill section and reiterate them naturally within Project bullet points.',
        `Include "${targetJob}" directly in your professional summary headline.`,
        'Avoid keyword stuffing; ensure each keyword is supported by at least one contextual project or task description.',
      ],
    },
    bulletRewrites: [
      {
        originalBullet: 'Responsible for handling daily tasks and coordinating with team members on assignments.',
        improvedBullet: `Spearheaded daily ${targetJob} workflows across a 5-member team, improving on-time deliverable completion rate by 22% through structured tracking.`,
        reason: 'Replaced passive phrase "Responsible for" with high-energy action verb "Spearheaded" and added a measurable % result.',
        impactBoost: '+35% Recruiter Engagement',
      },
      {
        originalBullet: 'Worked on projects and solved problems using software tools.',
        improvedBullet: `Engineered end-to-end ${targetJob} solutions utilizing ${matchedKeywords.slice(0, 2).join(' & ') || 'core tools'}, reducing error turnaround time by 30%.`,
        reason: 'Replaced vague "worked on" with technical verb and concrete tooling proof.',
        impactBoost: '+40% Technical Clarity',
      },
    ],
    atsHygieneCheck: [
      { checkItem: 'Standard section headings (Summary, Experience, Skills, Education)', passed: true, tip: 'Ensures standard parser categorization.' },
      { checkItem: 'No complex multi-column graphics or table traps', passed: true, tip: 'Single column layouts parse with 99.8% reliability.' },
      { checkItem: 'Quantifiable metrics & numbers present', passed: numbersFound >= 2, tip: 'Include volume indicators (e.g. 50+ tickets, 100% accuracy, 20% speed boost).' },
      { checkItem: 'Target job title present in summary/headline', passed: roleTitleFound, tip: `Ensure "${targetJob}" appears explicitly within the first 100 words.` },
      { checkItem: 'Clean text-based bullet points', passed: true, tip: 'Use standard bullet characters (•, -) rather than graphical icon glyphs.' },
    ],
    actionPlan: [
      `1. Place the exact title "${targetJob}" prominently in your 2-line header summary.`,
      `2. Insert missing keywords: ${missingKeywords.slice(0, 3).join(', ')} into your Technical Skills list.`,
      '3. Convert at least 3 bullet points to include quantifiable numbers (volume, percentages, or time saved).',
      '4. Verify that all dates are in standard Month YYYY or YYYY format.',
      '5. Export as a clean, text-selectable PDF or DOCX file before submitting.',
    ],
    analyzedAt: new Date().toISOString(),
  };
}

function generateFallbackSalaryBenchmark(
  targetJob: string,
  experienceLevel?: string,
  preferredCity?: string,
  preferredState?: string,
  education?: string
) {
  const city = preferredCity || 'India';
  const locationStr = preferredCity ? (preferredState ? `${preferredCity}, ${preferredState}` : preferredCity) : 'National Average';
  const roleLower = targetJob.toLowerCase();
  const expLower = (experienceLevel || 'fresher').toLowerCase();

  // Baseline monthly ranges (min, median, max) in INR for freshers
  let baseMin = 18000;
  let baseMed = 25000;
  let baseMax = 38000;

  if (roleLower.includes('software') || roleLower.includes('developer') || roleLower.includes('frontend') || roleLower.includes('backend') || roleLower.includes('engineer') || roleLower.includes('full stack')) {
    baseMin = 25000;
    baseMed = 38000;
    baseMax = 65000;
  } else if (roleLower.includes('data') || roleLower.includes('analytics') || roleLower.includes('analyst') || roleLower.includes('python')) {
    baseMin = 22000;
    baseMed = 34000;
    baseMax = 55000;
  } else if (roleLower.includes('sales') || roleLower.includes('business development') || roleLower.includes('bde')) {
    baseMin = 18000;
    baseMed = 28000;
    baseMax = 45000;
  } else if (roleLower.includes('support') || roleLower.includes('bpo') || roleLower.includes('telecalling') || roleLower.includes('customer service')) {
    baseMin = 16000;
    baseMed = 22000;
    baseMax = 32000;
  } else if (roleLower.includes('electrician') || roleLower.includes('technician') || roleLower.includes('iti') || roleLower.includes('fitter')) {
    baseMin = 15000;
    baseMed = 22000;
    baseMax = 32000;
  } else if (roleLower.includes('design') || roleLower.includes('ui') || roleLower.includes('ux') || roleLower.includes('graphic')) {
    baseMin = 20000;
    baseMed = 30000;
    baseMax = 48000;
  } else if (roleLower.includes('digital marketing') || roleLower.includes('seo') || roleLower.includes('social media')) {
    baseMin = 18000;
    baseMed = 26000;
    baseMax = 40000;
  }

  // Experience multiplier
  let expMultiplier = 1.0;
  if (expLower.includes('1–3') || expLower.includes('1-3') || expLower.includes('1 to 3')) {
    expMultiplier = 1.45;
  } else if (expLower.includes('3–5') || expLower.includes('3-5') || expLower.includes('3 to 5')) {
    expMultiplier = 2.1;
  } else if (expLower.includes('5+')) {
    expMultiplier = 3.0;
  }

  // Location multiplier
  let locMultiplier = 1.0;
  const isTier1 = /bengaluru|bangalore|mumbai|delhi|gurgaon|noida|hyderabad/i.test(city);
  const isTier2 = /pune|chennai|ahmedabad|kolkata|chandigarh|jaipur|indore/i.test(city);

  if (isTier1) {
    locMultiplier = 1.18;
  } else if (isTier2) {
    locMultiplier = 1.05;
  } else {
    locMultiplier = 0.92;
  }

  const minMonthly = Math.round((baseMin * expMultiplier * locMultiplier) / 500) * 500;
  const medMonthly = Math.round((baseMed * expMultiplier * locMultiplier) / 500) * 500;
  const maxMonthly = Math.round((baseMax * expMultiplier * locMultiplier) / 500) * 500;

  const minLPA = parseFloat(((minMonthly * 12) / 100000).toFixed(1));
  const medLPA = parseFloat(((medMonthly * 12) / 100000).toFixed(1));
  const maxLPA = parseFloat(((maxMonthly * 12) / 100000).toFixed(1));

  return {
    targetJob,
    location: locationStr,
    experienceLevel: experienceLevel || 'Fresher / Entry-Level',
    currency: 'INR',
    monthlyRange: {
      min: minMonthly,
      median: medMonthly,
      max: maxMonthly,
      formattedMin: `₹${minMonthly.toLocaleString('en-IN')}`,
      formattedMedian: `₹${medMonthly.toLocaleString('en-IN')}`,
      formattedMax: `₹${maxMonthly.toLocaleString('en-IN')}`,
    },
    annualLpaRange: {
      min: minLPA,
      median: medLPA,
      max: maxLPA,
      formatted: `${minLPA} – ${maxLPA} LPA`,
    },
    percentileTiers: [
      {
        tier: '25th Percentile (Entry Baseline)',
        amount: `₹${minMonthly.toLocaleString('en-IN')}/mo (${minLPA} LPA)`,
        description: 'Standard starting salary for candidates with foundational qualifications and standard internship/academic projects.',
      },
      {
        tier: '50th Percentile (Market Median)',
        amount: `₹${medMonthly.toLocaleString('en-IN')}/mo (${medLPA} LPA)`,
        description: 'Average pay for candidates who pass technical/aptitude rounds with solid portfolio proof and clear communication.',
      },
      {
        tier: '90th Percentile (Top Tier / Skilled)',
        amount: `₹${maxMonthly.toLocaleString('en-IN')}/mo (${maxLPA} LPA)`,
        description: 'Commanded by candidates with practical project deployments, certifications, or specialized high-demand tool experience.',
      },
    ],
    topSalaryBoosters: [
      {
        skillOrFactor: 'Verified Live Portfolio / GitHub Deployment',
        potentialIncrease: '+18% to +25%',
        tip: 'Recruiters fast-track offers when they can test 2 functioning projects on live URLs or verifiable credentials.',
      },
      {
        skillOrFactor: 'Industry Standard Certification',
        potentialIncrease: '+15% to +20%',
        tip: 'Recognized industry badges (AWS/GCP, NPTEL, Cisco, or Google Certifications) validate technical depth without prior brand prestige.',
      },
      {
        skillOrFactor: 'Targeted Tool Proficiency & Speed',
        potentialIncrease: '+12% to +18%',
        tip: 'Demonstrating modern automation tools, clean workflows, or fast turnaround speed directly justifies top-bracket offers.',
      },
    ],
    locationComparison: [
      {
        city: 'Bengaluru / Tech Hubs',
        diffPercentage: '+15% to +25%',
        medianMonthly: `₹${Math.round((medMonthly * 1.2) / 500) * 500}/mo`,
      },
      {
        city: 'Pune / Hyderabad / Mumbai',
        diffPercentage: '+8% to +15%',
        medianMonthly: `₹${Math.round((medMonthly * 1.1) / 500) * 500}/mo`,
      },
      {
        city: 'Tier 2 & 3 Emerging Hubs',
        diffPercentage: '-10% to -15% (lower living cost)',
        medianMonthly: `₹${Math.round((medMonthly * 0.88) / 500) * 500}/mo`,
      },
    ],
    marketDemand: {
      level: 'High' as const,
      hiringTrend: `Steady hiring demand for ${targetJob} with recruiters actively prioritizing candidates possessing hands-on practical execution.`,
    },
    negotiationTips: [
      'Research the market median before interview calls — quote a tight range (e.g. ₹25k–₹28k) rather than a single vague number.',
      'Tie your salary expectation directly to your immediate contribution (e.g. "I can start contributing on day 1 with my completed projects in X and Y").',
      'Inquire politely about performance review cycles, learning stipends, or quarterly appraisal intervals if starting at entry bracket.',
    ],
    estimatedAt: new Date().toISOString(),
  };
}

function generateServerFallbackRoadmap(
  targetJob: string,
  education?: string,
  experienceLevel?: string,
  skills?: string[]
) {
  const role = targetJob || 'Sales Executive';
  const lowerRole = role.toLowerCase();
  const edu = education || 'Graduate';
  const exp = experienceLevel || 'Fresher';
  const now = new Date().toISOString();

  if (lowerRole.includes('frontend') || lowerRole.includes('web') || lowerRole.includes('react')) {
    return {
      targetRole: role,
      candidateTier: `${exp} (${edu})`,
      currentEducation: edu,
      estimatedTotalMonths: '4 to 6 Months',
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
          phase: 'Phase 1: Web Foundations & Responsive UI',
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
            title: 'Real-Time Multi-Currency Explorer App',
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

  // Default / Sales / General
  return {
    targetRole: role,
    candidateTier: `${exp} (${edu})`,
    currentEducation: edu,
    estimatedTotalMonths: '3 to 5 Months',
    overallProgressPercent: 0,
    summaryNote: `A practical milestone roadmap tailored for ${edu} candidates looking to break into the ${role} domain with recognized skills, portfolio assets, and interview confidence.`,
    salaryTrajectory: {
      entryLevel: '₹2.4L - ₹3.8L CTC',
      oneYear: '₹4.0L - ₹6.0L',
      threeYears: '₹7.0L - ₹11.0L',
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

function generateServerFallbackInterviewTips(targetJob: string, education?: string, skills?: string[]) {
  const role = targetJob || 'General Professional';
  const lowerRole = role.toLowerCase();

  const isTech = lowerRole.includes('developer') || lowerRole.includes('software') || lowerRole.includes('frontend') || lowerRole.includes('backend') || lowerRole.includes('full stack') || lowerRole.includes('react') || lowerRole.includes('engineer');
  const isSales = lowerRole.includes('sales') || lowerRole.includes('bde') || lowerRole.includes('business development') || lowerRole.includes('marketing');
  const isData = lowerRole.includes('data') || lowerRole.includes('analyst') || lowerRole.includes('analytics') || lowerRole.includes('sql');

  return {
    targetRole: role,
    roundTips: [
      {
        id: 'tip-star-fallback',
        roundType: 'behavioral',
        title: 'Structuring Behavioral Responses with the STAR Formula',
        categoryTag: 'STAR Method',
        summary: 'Answer behavioral and situational questions with high structure: Situation, Task, Action, and Result.',
        recommendedFramework: 'Situation (15%) ➔ Task (15%) ➔ Action (50% - Focus on YOUR direct contribution) ➔ Result (20% - Metrics & learnings)',
        sampleQuestion: `Tell me about a time you handled a difficult challenge or deadline while working on a ${role} task.`,
        sampleAnswerTemplate: `In my project at [Company/College], we encountered [Situation]. My responsibility was to [Task]. I immediately [Action 1], [Action 2], and collaborated with [Team]. As a result, we [Result: saved X hours / delivered with 100% precision].`,
        proTips: [
          'Emphasize your personal actions using "I" instead of passive "We".',
          'Conclude with quantifiable metrics (time saved, revenue added, accuracy increased).',
          'Keep your answer concise within 90–120 seconds.',
        ],
        commonMistakesToAvoid: [
          'Spending too much time on background context instead of actionable steps.',
          'Forgetting to mention the final positive outcome or lessons learned.',
        ],
      },
      {
        id: 'tip-tech-fallback',
        roundType: 'technical',
        title: isTech ? 'Live Problem Solving & Architecture Rationale' : isSales ? 'Consultative Discovery & Pitch Roleplay' : isData ? 'SQL Query Reasoning & Metric Translation' : 'Domain Problem Solving & Case Study Approach',
        categoryTag: isTech ? 'Live Coding' : isSales ? 'Discovery & Pitch' : isData ? 'SQL & Insights' : 'Domain Mastery',
        summary: isTech
          ? 'Talk through your algorithm approach out loud before writing syntax. Clarify edge cases.'
          : isSales
          ? 'Focus 70% on asking discovery questions to uncover buyer pain points before pitching features.'
          : isData
          ? 'Explain your query logic clearly and tie dataset findings to revenue or retention business impact.'
          : 'Break down complex operational problems into modular, manageable components.',
        recommendedFramework: 'Clarify Constraints ➔ State Assumptions ➔ Propose Modular Solution ➔ Execute Step-by-Step ➔ Verify & Optimize',
        sampleQuestion: isTech
          ? `How would you optimize a slow API endpoint or solve an array manipulation problem?`
          : isSales
          ? `How do you handle a client saying "We are happy with our current vendor"?`
          : isData
          ? `How would you write a SQL query to identify top 5 churned customers and diagnose the drop?`
          : `Walk me through how you would prioritize competing urgent tasks under tight deadlines.`,
        sampleAnswerTemplate: isTech
          ? `I start by asking about data scale and edge cases. I discuss a baseline O(N^2) approach, then optimize using a Hash Map to achieve O(N) time complexity.`
          : isSales
          ? `I acknowledge their loyalty: "I respect that! May I ask what is working well, and is there any one area where you wish their turnaround was faster?"`
          : isData
          ? `I partition the data using CTEs and window functions, verify NULL edge cases, and translate the metrics into a clear visual dashboard.`
          : `I use the Eisenhower Matrix to separate urgent from important, communicate timelines with stakeholders, and execute the highest-impact items first.`,
        proTips: [
          'Never stay completely silent for more than 20 seconds while thinking.',
          'Ask clarifying questions to confirm the interviewer’s expectations.',
          'Be honest if you do not know a specific syntax, and explain how you would find it quickly.',
        ],
        commonMistakesToAvoid: [
          'Jumping to conclusions before understanding the core problem constraints.',
          'Becoming defensive when receiving hints or feedback during the round.',
        ],
      },
      {
        id: 'tip-hr-pitch-fallback',
        roundType: 'hr',
        title: 'The 90-Second "Tell Me About Yourself" Opening Pitch',
        categoryTag: 'Elevator Pitch',
        summary: 'Deliver a structured, memorable introduction highlighting your present skills, past achievements, and alignment with the company.',
        recommendedFramework: 'Present (Current Role/Expertise) ➔ Past (2 Key Achievements/Projects) ➔ Future (Why this specific company excites you)',
        sampleQuestion: 'Can you introduce yourself and walk me through your background?',
        sampleAnswerTemplate: `I am a ${role} with strong hands-on skills in [Top 2 Skills]. Recently, I built [Project/Internship achievement] which achieved [Concrete Outcome]. I have been following [Company Name]\'s work in [Domain], and I am eager to apply my strengths in [Skill] to accelerate your team's goals.`,
        proTips: [
          'Keep your introduction crisp and between 60 to 90 seconds.',
          'Do not read your resume verbatim; tell the story behind your career trajectory.',
          'End by connecting directly to the role you are interviewing for.',
        ],
        commonMistakesToAvoid: [
          'Giving unnecessary personal life history unrelated to the job.',
          'Sounding robotic or rehearsed without conversational warmth.',
        ],
      },
      {
        id: 'tip-salary-fallback',
        roundType: 'salary',
        title: 'Navigating CTC Discussions and Salary Anchoring',
        categoryTag: 'Salary Anchor',
        summary: 'Discuss compensation expectations using market research data while maintaining positive collaborative rapport.',
        recommendedFramework: 'Benchmark Range ➔ Total Package Perspective (Fixed + Variable + Benefits) ➔ Role Alignment',
        sampleQuestion: 'What are your salary expectations for this position?',
        sampleAnswerTemplate: `Based on current market benchmarks for ${role} in this location with my skill profile, I am looking for a package in the range of [e.g. ₹4.5L to ₹6.5L CTC]. However, the growth trajectory, team mentorship, and mission of [Company] are equally vital to me, and I am open to a competitive offer matching the scope.`,
        proTips: [
          'Quote a tight range based on market research rather than a single rigid number.',
          'Inquire about the breakup between Fixed CTC, Variable Incentive, Health Cover, and PF.',
          'Never initiate salary negotiations in the first 5 minutes of a preliminary technical screening.',
        ],
        commonMistakesToAvoid: [
          'Saying "I will accept whatever is standard" which leads to baseline low-end offers.',
          'Demanding aggressive multiples without demonstrating corresponding proof-of-work.',
        ],
      },
      {
        id: 'tip-reverse-q-fallback',
        roundType: 'reverse_questions',
        title: 'Asking High-Impact Reverse Questions at the End of the Round',
        categoryTag: 'Interviewer Questions',
        summary: 'When the interviewer asks "Do you have any questions for me?", ask strategic questions that prove your curiosity and ambition.',
        recommendedFramework: 'First 90 Days Expectations ➔ Team Culture & Bottlenecks ➔ Company Growth Horizon',
        sampleQuestion: 'What does success look like for someone in this role during their first 90 days?',
        sampleAnswerTemplate: 'I always like to understand performance expectations early: "What are the primary metrics or milestones a new joiner should hit in their first quarter to be considered a standout performer?"',
        proTips: [
          'Prepare at least 3 thoughtful questions before every interview.',
          'Ask about team workflow, engineering/sales cadence, or recent company milestones.',
        ],
        commonMistakesToAvoid: [
          'Saying "No, I don\'t have any questions, everything was clear."',
          'Asking exclusively about leaves, vacation days, or break timings in the first round.',
        ],
      },
      {
        id: 'tip-dos-donts-fallback',
        roundType: 'dos_donts',
        title: 'Essential Video & In-Person Interview Etiquette',
        categoryTag: 'Interview Etiquette',
        summary: 'Master the visual, environmental, and communicative details that project executive polish.',
        proTips: [
          'Test video lighting (light source in front of your face, not behind) and clear audio microphone 30 minutes prior.',
          'Look directly into the webcam lens during key statements to simulate eye contact.',
          'Send a customized, concise 3-sentence thank-you note within 24 hours of completing the interview.',
        ],
        commonMistakesToAvoid: [
          'Joining late without giving advance notice.',
          'Having noisy background environments or distracting virtual filters.',
        ],
      },
    ],
    highImpactChecklist: [
      `Review your resume line-by-line and prepare 2 stories for every project or skill listed.`,
      `Research the company's recent products, press releases, leadership team, and competitor landscape.`,
      `Prepare your 90-second "Tell me about yourself" pitch and practice delivering it smoothly.`,
      `Formulate 3 distinct STAR stories (Overcoming a technical challenge, Resolving team conflict, Delivering under pressure).`,
      `Test your laptop webcam, high-speed WiFi hotspot fallback, and quiet interview space.`,
    ],
    elevatorPitchFormula: {
      hook: `I am a proactive ${role} dedicated to driving measurable results and high craftsmanship.`,
      proofPoints: `I have built practical domain experience in [Key Skills], delivering completed projects with high reliability.`,
      targetAlignment: `I admire [Company Name]'s leadership and look forward to contributing my energy and skills to your team.`,
    },
    questionsToAskInterviewer: [
      {
        category: 'First 90 Days Success',
        question: 'What would a top performer in this role accomplish in their first 90 days?',
        whyItWorks: 'Signals high ambition, coachability, and proactive ownership of job responsibilities.',
      },
      {
        category: 'Team Dynamics & Culture',
        question: 'How does your team currently handle collaboration, code/peer reviews, and constructive feedback?',
        whyItWorks: 'Helps you understand the daily team vibe and psychological safety of the workplace.',
      },
      {
        category: 'Strategic Vision',
        question: 'What is the biggest opportunity or challenge your division is aiming to tackle this upcoming quarter?',
        whyItWorks: 'Positions you as a strategic partner interested in the bigger organizational picture.',
      },
    ],
    generatedAt: new Date().toISOString(),
  };
}

function generateFallbackMockInterviewStart(
  targetJob: string,
  experienceLevel?: string,
  education?: string,
  skills?: string[],
  questionCount: number = 4
) {
  const role = targetJob || 'Professional Role';
  const questions = [
    {
      id: 'q-1',
      questionText: `Can you introduce yourself and walk me through what motivates you to pursue this ${role} position?`,
      questionType: 'introduction',
      difficulty: 'Easy',
      expectedKeywords: ['Background', 'Skills', 'Passion', 'Company Interest', 'Strengths'],
      interviewerIntent: 'Assessing communication clarity, self-awareness, and career motivation.',
      suggestedAnswerFramework: 'Present (Current profile) -> Past (Key relevant projects) -> Future (Alignment with this role).',
    },
    {
      id: 'q-2',
      questionText: `What core tools or technical methods do you rely on when executing day-to-day deliverables in ${role}?`,
      questionType: 'technical',
      difficulty: 'Medium',
      expectedKeywords: skills && skills.length > 0 ? skills.slice(0, 4) : ['Tools', 'Best Practices', 'Troubleshooting', 'Efficiency'],
      interviewerIntent: 'Testing functional domain knowledge, tool mastery, and execution reliability.',
      suggestedAnswerFramework: 'Name specific tools -> Explain practical usage -> Give a concrete output metric.',
    },
    {
      id: 'q-3',
      questionText: 'Tell me about a time you faced a difficult roadblock or tight deadline. How did you resolve it?',
      questionType: 'behavioral',
      difficulty: 'Medium',
      expectedKeywords: ['Situation', 'Action Taken', 'Prioritization', 'Result', 'Learning'],
      interviewerIntent: 'Evaluating resilience, problem-solving under pressure, and accountability.',
      suggestedAnswerFramework: 'STAR Method: Situation -> Task -> Action (Focus on YOU) -> Positive Result.',
    },
    {
      id: 'q-4',
      questionText: 'If a client or team member strongly disagreed with your approach, how would you handle the situation constructively?',
      questionType: 'situational',
      difficulty: 'Hard',
      expectedKeywords: ['Active Listening', 'Empathy', 'Data / Evidence', 'Alignment', 'Professionalism'],
      interviewerIntent: 'Evaluating emotional intelligence, stakeholder management, and conflict resolution.',
      suggestedAnswerFramework: 'Acknowledge perspective -> Ask clarifying questions -> Present facts collaboratively -> Align on common goal.',
    },
  ];

  return {
    roleTitle: role,
    introMessage: `Welcome to your interactive mock interview for the ${role} role. I'll be asking you realistic questions tailored to your profile. Answer thoroughly and naturally!`,
    candidateReadinessLevel: experienceLevel || 'Entry-Level',
    questions: questions.slice(0, questionCount),
  };
}

function generateFallbackAnswerEvaluation(candidateAnswer: string, questionType?: string) {
  const wordCount = (candidateAnswer || '').trim().split(/\s+/).length;
  let score = 70;
  if (wordCount < 15) score = 45;
  else if (wordCount > 40) score = 82;

  return {
    score,
    feedback: `Good attempt! Your response shows good domain understanding with ${wordCount} words. To elevate it further, aim for clear STAR structuring and quantify your outcomes.`,
    strengths: [
      'Directly addressed the question prompt',
      'Demonstrated positive attitude and functional familiarity',
    ],
    improvements: [
      'Include specific quantifiable achievements (e.g. percentages, time saved)',
      'Structure the response clearly using Situation -> Action -> Result',
    ],
    idealAnswerSample:
      'In my recent project, I prioritized our deliverables by identifying critical dependencies, executed the core module with high attention to quality, and successfully delivered the outcome ahead of schedule with 99% accuracy.',
    followUpPrompt: 'Can you elaborate on a specific challenge you faced while executing this task?',
  };
}

startServer();


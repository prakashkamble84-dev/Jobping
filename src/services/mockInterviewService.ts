import {
  CareerProfile,
  InterviewQuestion,
  InterviewAnswerEvaluation,
  MockInterviewResult,
  AnsweredInterviewQuestion,
} from '../types';

const MOCK_INTERVIEW_STORAGE_PREFIX = 'jobready_mock_interview_history_';

export interface StartInterviewResponse {
  roleTitle: string;
  introMessage: string;
  questions: InterviewQuestion[];
}

export async function startMockInterview(
  profile: CareerProfile | null,
  questionCount: number = 4
): Promise<StartInterviewResponse> {
  const targetJob = profile?.targetJob || 'Entry-Level Associate';
  const education = profile?.education || 'Graduate / Diploma';
  const experienceLevel = profile?.experienceLevel || 'Fresher';

  const response = await fetch('/api/mock-interview/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      targetJob,
      education,
      experienceLevel,
      questionCount,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to start mock interview: ${response.statusText}`);
  }

  return response.json();
}

export async function evaluateInterviewAnswer(
  targetJob: string,
  question: InterviewQuestion,
  candidateAnswer: string
): Promise<InterviewAnswerEvaluation> {
  const response = await fetch('/api/mock-interview/evaluate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      targetJob,
      questionText: question.questionText,
      questionType: question.questionType,
      candidateAnswer,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to evaluate answer: ${response.statusText}`);
  }

  return response.json();
}

export function saveCompletedInterviewResult(
  userId: string,
  roleTitle: string,
  answers: AnsweredInterviewQuestion[]
): MockInterviewResult {
  const totalQuestions = answers.length;
  const sumScore = answers.reduce((acc, curr) => acc + (curr.evaluation.score || 0), 0);
  const overallScore = Math.round(sumScore / Math.max(1, totalQuestions));

  let grade: MockInterviewResult['grade'] = 'Needs Practice (C)';
  if (overallScore >= 88) grade = 'Interview Ready (A+)';
  else if (overallScore >= 75) grade = 'Strong Candidate (A)';
  else if (overallScore >= 60) grade = 'Good Foundation (B)';

  const result: MockInterviewResult = {
    id: `interview_${Date.now()}`,
    roleTitle,
    totalQuestions,
    overallScore,
    grade,
    answers,
    completedAt: new Date().toISOString(),
  };

  try {
    const existing = getInterviewHistory(userId);
    const updated = [result, ...existing].slice(0, 10);
    localStorage.setItem(`${MOCK_INTERVIEW_STORAGE_PREFIX}${userId}`, JSON.stringify(updated));
  } catch {
    // Ignore storage errors
  }

  return result;
}

export function getInterviewHistory(userId: string): MockInterviewResult[] {
  if (!userId) return [];
  try {
    const raw = localStorage.getItem(`${MOCK_INTERVIEW_STORAGE_PREFIX}${userId}`);
    if (!raw) return [];
    return JSON.parse(raw) as MockInterviewResult[];
  } catch {
    return [];
  }
}

export function deleteInterviewRecord(userId: string, interviewId: string): MockInterviewResult[] {
  if (!userId) return [];
  try {
    const existing = getInterviewHistory(userId);
    const updated = existing.filter((item) => item.id !== interviewId);
    localStorage.setItem(`${MOCK_INTERVIEW_STORAGE_PREFIX}${userId}`, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

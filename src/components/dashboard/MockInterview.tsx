import React, { useState, useEffect, useRef } from 'react';
import {
  CareerProfile,
  InterviewQuestion,
  InterviewAnswerEvaluation,
  MockInterviewResult,
  AnsweredInterviewQuestion,
  ScoreCategory,
} from '../../types';
import {
  startMockInterview,
  evaluateInterviewAnswer,
  saveCompletedInterviewResult,
  getInterviewHistory,
} from '../../services/mockInterviewService';
import { PrimaryButton } from '../common/PrimaryButton';
import { SecondaryButton } from '../common/SecondaryButton';
import { ProgressBar } from '../common/ProgressBar';
import {
  Mic,
  MicOff,
  Send,
  Sparkles,
  Award,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  RotateCcw,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Volume2,
  VolumeX,
  ChevronRight,
  Briefcase,
  GraduationCap,
  Lightbulb,
  Copy,
  Check,
  Zap,
  FileText,
  MessageSquare,
  ThumbsUp,
  Target,
  Download,
  Share2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export interface MockInterviewProps {
  userId: string;
  profile: CareerProfile | null;
  readinessScore?: number;
  readinessCategory?: ScoreCategory;
  onClose?: () => void;
  onInterviewComplete?: (result: MockInterviewResult) => void;
  className?: string;
}

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  evaluation?: InterviewAnswerEvaluation;
  questionMeta?: InterviewQuestion;
}

export const MockInterview: React.FC<MockInterviewProps> = ({
  userId,
  profile,
  readinessScore = 70,
  readinessCategory = 'Job Ready in Progress',
  onClose,
  onInterviewComplete,
  className = '',
}) => {
  // State management
  const [sessionState, setSessionState] = useState<'setup' | 'interview' | 'feedback' | 'summary'>('setup');
  const [questionCount, setQuestionCount] = useState<number>(4);
  const [interviewTrack, setInterviewTrack] = useState<string>(profile?.targetJob || 'Customer Support Associate');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'Adaptive' | 'Standard' | 'Challenging'>('Adaptive');

  const [loading, setLoading] = useState<boolean>(false);
  const [evaluating, setEvaluating] = useState<boolean>(false);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [candidateInput, setCandidateInput] = useState<string>('');
  const [answeredQuestions, setAnsweredQuestions] = useState<AnsweredInterviewQuestion[]>([]);
  const [finalResult, setFinalResult] = useState<MockInterviewResult | null>(null);
  const [summaryViewTab, setSummaryViewTab] = useState<'report' | 'transcript'>('report');
  const [expandedQuestionIdx, setExpandedQuestionIdx] = useState<number | null>(0);
  const [copiedSummary, setCopiedSummary] = useState<boolean>(false);

  // Speech recognition & synthesis
  const [isListening, setIsListening] = useState<boolean>(false);
  const [speechSupported, setSpeechSupported] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const recognitionRef = useRef<any>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages, evaluating]);

  // Speech Recognition setup
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setSpeechSupported(true);
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-IN'; // Optimized for Indian English accent

        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          if (currentTranscript.trim()) {
            setCandidateInput((prev) => {
              const cleaned = prev.endsWith(' ') || prev.length === 0 ? prev : `${prev} `;
              return cleaned + currentTranscript;
            });
          }
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch {
        setIsListening(false);
      }
    }
  };

  const speakText = (text: string) => {
    if (isMuted || typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  // Start interview session
  const handleStartSession = async () => {
    setLoading(true);
    try {
      const customProfile: CareerProfile = profile || {
        uid: userId,
        targetJob: interviewTrack,
        education: 'Graduate / Diploma',
        experienceLevel: 'Fresher',
        preferredCity: 'Pan-India',
        preferredState: '',
        workPreference: 'Hybrid',
        salaryMin: '',
        salaryMax: '',
        skills: ['Communication', 'MS Office', 'Problem Solving'],
        languages: ['English', 'Hindi'],
        careerGoal: `Start career as ${interviewTrack}`,
        jobPreference: 'First Job',
        careerObjective: '',
        profileCompleted: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const response = await startMockInterview(
        {
          ...customProfile,
          targetJob: interviewTrack,
        },
        questionCount
      );

      if (response && response.questions && response.questions.length > 0) {
        setQuestions(response.questions);
        setCurrentQuestionIndex(0);
        setAnsweredQuestions([]);

        const firstQ = response.questions[0];
        const welcomeMessage: ChatMessage = {
          id: `ai_welcome_${Date.now()}`,
          sender: 'ai',
          text: `Hello! I'm your AI Interviewer for the **${response.roleTitle}** position. Let's begin with our first question:\n\n**${firstQ.questionText}**`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          questionMeta: firstQ,
        };

        setChatMessages([welcomeMessage]);
        setSessionState('interview');
        speakText(`Hello! Let's begin. ${firstQ.questionText}`);
      }
    } catch (err) {
      console.error('Failed to start interview:', err);
    } finally {
      setLoading(false);
    }
  };

  // Submit answer and receive AI feedback
  const handleSendAnswer = async () => {
    if (!candidateInput.trim() || evaluating) return;
    const currentQ = questions[currentQuestionIndex];
    if (!currentQ) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    const answerText = candidateInput.trim();
    setCandidateInput('');

    // Add user message to chat
    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: answerText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setEvaluating(true);

    try {
      const evaluation = await evaluateInterviewAnswer(interviewTrack, currentQ, answerText);

      const answeredItem: AnsweredInterviewQuestion = {
        question: currentQ,
        candidateAnswer: answerText,
        evaluation,
        answeredAt: new Date().toISOString(),
      };

      const updatedAnswers = [...answeredQuestions, answeredItem];
      setAnsweredQuestions(updatedAnswers);

      const isLastQuestion = currentQuestionIndex >= questions.length - 1;

      // AI Response with feedback & next question
      if (!isLastQuestion) {
        const nextQ = questions[currentQuestionIndex + 1];
        const aiResponseMsg: ChatMessage = {
          id: `ai_eval_${Date.now()}`,
          sender: 'ai',
          text: `**Score: ${evaluation.score}/100** — ${evaluation.feedback}\n\n**Next Question (${currentQuestionIndex + 2}/${questions.length}):**\n${nextQ.questionText}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          evaluation,
          questionMeta: nextQ,
        };

        setChatMessages((prev) => [...prev, aiResponseMsg]);
        setCurrentQuestionIndex((prev) => prev + 1);
        speakText(`Good answer! Score is ${evaluation.score} out of 100. Next question: ${nextQ.questionText}`);
      } else {
        // Complete interview
        const result = saveCompletedInterviewResult(userId, interviewTrack, updatedAnswers);
        setFinalResult(result);
        if (onInterviewComplete) {
          onInterviewComplete(result);
        }

        const finalMsg: ChatMessage = {
          id: `ai_final_${Date.now()}`,
          sender: 'ai',
          text: `🎉 **Interview Completed!** You scored **${result.overallScore}/100** (${result.grade}).\n\nClick below to view your full hiring manager feedback report and score improvement plan.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          evaluation,
        };

        setChatMessages((prev) => [...prev, finalMsg]);
        setSessionState('summary');
        speakText(`Congratulations! You have completed your mock interview session with an overall score of ${result.overallScore} percent.`);
      }
    } catch (err) {
      console.error('Evaluation failed:', err);
    } finally {
      setEvaluating(false);
    }
  };

  const handleCopyText = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const currentQ = questions[currentQuestionIndex];

  return (
    <div className={`bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col ${className}`}>
      {/* Header Bar */}
      <div className="bg-slate-900 px-6 py-4 text-white flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold tracking-tight">AI Role-Specific Mock Interview</h3>
              <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                Gemini Powered
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Interactive question rounds tailored to your industry profile and {readinessCategory} status.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {sessionState === 'interview' && (
            <button
              onClick={() => setIsMuted(!isMuted)}
              title={isMuted ? 'Unmute Audio Voiceover' : 'Mute Audio Voiceover'}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-indigo-400" />}
            </button>
          )}

          {sessionState !== 'setup' && (
            <button
              onClick={() => {
                setSessionState('setup');
                setChatMessages([]);
                setAnsweredQuestions([]);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Session
            </button>
          )}

          {onClose && (
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-semibold"
            >
              Close
            </button>
          )}
        </div>
      </div>

      {/* Screen 1: Interview Setup & Configuration */}
      {sessionState === 'setup' && (
        <div className="p-6 md:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 space-y-1">
              <span className="text-[11px] font-bold uppercase text-indigo-600 tracking-wider block">
                Target Role
              </span>
              <p className="text-sm font-extrabold text-slate-900">{profile?.targetJob || interviewTrack}</p>
              <span className="text-xs text-slate-500">Industry: {profile?.targetJob || 'General Corporate'}</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-[11px] font-bold uppercase text-slate-500 tracking-wider block">
                Experience Tier
              </span>
              <p className="text-sm font-extrabold text-slate-900">{profile?.experienceLevel || 'Fresher'}</p>
              <span className="text-xs text-slate-500">Education: {profile?.education || 'Graduate'}</span>
            </div>

            <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-100 space-y-1">
              <span className="text-[11px] font-bold uppercase text-amber-700 tracking-wider block">
                Job Readiness Benchmark
              </span>
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-amber-600" />
                <p className="text-sm font-extrabold text-slate-900">{readinessScore}/100</p>
                <span className="text-xs text-amber-700 font-medium">({readinessCategory})</span>
              </div>
              <span className="text-xs text-slate-500">Questions calibrated to your readiness</span>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <h4 className="text-sm font-bold text-slate-900">Customize Your Interview Track</h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Interview Role Track
                </label>
                <input
                  type="text"
                  value={interviewTrack}
                  onChange={(e) => setInterviewTrack(e.target.value)}
                  placeholder="e.g. Frontend Developer, Sales Executive, Data Analyst"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Number of Questions
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { count: 3, label: '3 (Warmup)' },
                    { count: 4, label: '4 (Standard)' },
                    { count: 6, label: '6 (In-Depth)' },
                  ].map((opt) => (
                    <button
                      key={opt.count}
                      type="button"
                      onClick={() => setQuestionCount(opt.count)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                        questionCount === opt.count
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
            <h5 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              What to Expect in This Interactive Session:
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600">
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0 text-[10px]">
                  1
                </div>
                <span><strong>Role Questions:</strong> Introduction, domain skills, and STAR method situational prompts.</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0 text-[10px]">
                  2
                </div>
                <span><strong>Instant AI Scoring:</strong> Immediate constructive feedback, strengths & areas to refine.</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0 text-[10px]">
                  3
                </div>
                <span><strong>Hiring Manager Models:</strong> Review top 5% model answer templates for each prompt.</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <PrimaryButton
              onClick={handleStartSession}
              disabled={loading || !interviewTrack.trim()}
              icon={<Zap className="w-4 h-4" />}
              className="w-full sm:w-auto !py-3 !px-8 font-bold text-sm shadow-md shadow-indigo-600/20"
            >
              {loading ? 'Preparing Questions...' : 'Begin Mock Interview'}
            </PrimaryButton>
          </div>
        </div>
      )}

      {/* Screen 2: Interactive Interview Session */}
      {(sessionState === 'interview' || sessionState === 'summary') && (() => {
        const totalQuestions = questions.length || questionCount;
        const answeredCount = answeredQuestions.length;
        const currentDisplayQuestion = Math.min(currentQuestionIndex + 1, totalQuestions);
        const progressPercent = totalQuestions > 0 ? Math.round(((sessionState === 'summary' ? totalQuestions : answeredCount) / totalQuestions) * 100) : 0;
        const averageScore = answeredCount > 0 ? Math.round(answeredQuestions.reduce((acc, q) => acc + (q.evaluation?.score || 0), 0) / answeredCount) : null;

        return (
          <div className="flex flex-col h-[650px]">
            {/* Visual Progress Bar Component & Question Feedback */}
            <div className="px-6 py-3.5 bg-slate-50/90 border-b border-slate-200/90 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800">Track:</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-semibold text-[11px]">
                    {interviewTrack}
                  </span>
                  {averageScore !== null && (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[11px] flex items-center gap-1">
                      <Award className="w-3 h-3 text-emerald-600" />
                      Avg Score: {averageScore}/100
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 font-bold text-slate-700">
                  <span className="text-slate-900 font-extrabold">
                    {sessionState === 'summary' ? 'Session Complete' : `Question ${currentDisplayQuestion} of ${totalQuestions}`}
                  </span>
                  <span className="text-slate-400 font-normal">|</span>
                  <span className="text-indigo-600 font-semibold">
                    {answeredCount} of {totalQuestions} answered ({progressPercent}%)
                  </span>
                </div>
              </div>

              {/* Enhanced Visual Progress Bar */}
              <div className="space-y-2">
                <ProgressBar
                  value={progressPercent}
                  color="blue"
                  size="md"
                  showPercentage={false}
                  className="!mb-0"
                />

                {/* Question Step Interactive Badges */}
                <div className="flex items-center justify-between gap-1 sm:gap-2 pt-0.5">
                  {questions.map((q, idx) => {
                    const isAnswered = idx < answeredCount;
                    const isCurrent = idx === currentQuestionIndex && sessionState !== 'summary';
                    const answerEval = answeredQuestions[idx]?.evaluation;

                    return (
                      <div
                        key={q.id || idx}
                        className={`flex-1 flex items-center justify-center py-1 px-1.5 rounded-lg border text-[11px] font-bold transition-all ${
                          isAnswered
                            ? 'bg-emerald-50/80 border-emerald-200 text-emerald-800 shadow-2xs'
                            : isCurrent
                            ? 'bg-indigo-50 border-indigo-300 text-indigo-900 ring-2 ring-indigo-500/20 shadow-xs animate-pulse'
                            : 'bg-white border-slate-200 text-slate-400'
                        }`}
                        title={`Question ${idx + 1}: ${q.questionText}`}
                      >
                        <div className="flex items-center gap-1">
                          {isAnswered ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          ) : (
                            <span className="w-3.5 h-3.5 rounded-full border border-current flex items-center justify-center text-[9px]">
                              {idx + 1}
                            </span>
                          )}
                          <span className="hidden sm:inline">Q{idx + 1}</span>
                          {answerEval && (
                            <span className="text-[10px] px-1 py-0.2 bg-emerald-200/60 rounded text-emerald-900 ml-0.5">
                              {answerEval.score}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* View Mode Switcher for Summary State */}
            {sessionState === 'summary' && finalResult && (
              <div className="px-6 py-2.5 bg-indigo-50/70 border-b border-indigo-100 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSummaryViewTab('report')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      summaryViewTab === 'report'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Executive Summary Report
                  </button>
                  <button
                    onClick={() => setSummaryViewTab('transcript')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      summaryViewTab === 'transcript'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Full Chat Transcript
                  </button>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <button
                    onClick={() => {
                      const allStrengths = Array.from(
                        new Set(answeredQuestions.flatMap((q) => q.evaluation?.strengths || []))
                      );
                      const allImprovements = Array.from(
                        new Set(answeredQuestions.flatMap((q) => q.evaluation?.improvements || []))
                      );

                      const textReport = `===========================================
JOBREADY AI MOCK INTERVIEW PERFORMANCE REPORT
Role: ${finalResult.roleTitle}
Overall Score: ${finalResult.overallScore}/100 (${finalResult.grade})
Completed: ${new Date(finalResult.completedAt).toLocaleString()}
===========================================

KEY STRENGTHS:
${allStrengths.map((s, idx) => `• ${s}`).join('\n')}

AREAS FOR IMPROVEMENT:
${allImprovements.map((i, idx) => `• ${i}`).join('\n')}

QUESTION BREAKDOWN:
${answeredQuestions
  .map(
    (q, idx) => `
[Question ${idx + 1}] (${q.question.questionType})
Q: ${q.question.questionText}
Your Answer: ${q.candidateAnswer || ''}
Score: ${q.evaluation?.score || 0}/100
Feedback: ${q.evaluation?.feedback || 'N/A'}
Model Answer: ${q.evaluation?.idealAnswerSample || 'N/A'}
`
  )
  .join('\n-------------------------------------------')}
`;
                      navigator.clipboard.writeText(textReport);
                      setCopiedSummary(true);
                      setTimeout(() => setCopiedSummary(false), 2000);
                    }}
                    className="flex items-center gap-1 text-slate-700 hover:text-slate-900 bg-white border border-slate-200 px-2.5 py-1 rounded-md font-semibold text-[11px]"
                  >
                    {copiedSummary ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    {copiedSummary ? 'Copied Report!' : 'Copy Text Report'}
                  </button>
                </div>
              </div>
            )}

            {/* Session View: Summary Report Mode */}
            {sessionState === 'summary' && summaryViewTab === 'report' && finalResult ? (
              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/60">
                {/* Executive Score & Readiness Banner */}
                <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-md relative overflow-hidden">
                  <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 text-[11px] font-bold">
                        <Award className="w-3.5 h-3.5" />
                        Session Complete • {finalResult.roleTitle}
                      </div>
                      <h4 className="text-xl font-extrabold tracking-tight">
                        Hiring Manager Performance Assessment
                      </h4>
                      <p className="text-xs text-slate-300 max-w-xl">
                        Based on your responses across {answeredQuestions.length} interview questions, our AI
                        evaluator has benchmarked your readiness against industry standards.
                      </p>
                    </div>

                    <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-5 py-3.5 rounded-2xl border border-white/15 shrink-0">
                      <div className="text-center">
                        <span className="text-[10px] uppercase font-bold text-slate-300 block">Overall Score</span>
                        <div className="text-3xl font-black text-white">{finalResult.overallScore}/100</div>
                      </div>
                      <div className="h-9 w-px bg-white/20" />
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-300 block">Readiness Tier</span>
                        <span className="inline-block font-extrabold text-xs text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-400/30">
                          {finalResult.grade}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Highlights Grid: Strengths & Areas for Improvement */}
                {(() => {
                  const allStrengths = Array.from(
                    new Set(answeredQuestions.flatMap((q) => q.evaluation?.strengths || []))
                  );
                  const allImprovements = Array.from(
                    new Set(answeredQuestions.flatMap((q) => q.evaluation?.improvements || []))
                  );

                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Standout Strengths */}
                      <div className="p-4 rounded-2xl bg-white border border-emerald-200/80 shadow-2xs space-y-3">
                        <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-sm">
                          <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
                            <ThumbsUp className="w-4 h-4" />
                          </div>
                          <span>Standout Strengths ({allStrengths.length})</span>
                        </div>
                        <p className="text-xs text-slate-600">
                          Highlights you demonstrated during this mock interview round:
                        </p>
                        {allStrengths.length > 0 ? (
                          <ul className="space-y-2 text-xs">
                            {allStrengths.map((strength, sIdx) => (
                              <li
                                key={sIdx}
                                className="flex items-start gap-2 p-2 rounded-xl bg-emerald-50/70 border border-emerald-100 text-emerald-950"
                              >
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                <span className="font-medium leading-relaxed">{strength}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div className="p-3 bg-slate-50 text-slate-500 rounded-xl text-xs italic">
                            Complete full answers to identify key interview strengths.
                          </div>
                        )}
                      </div>

                      {/* Targeted Areas for Improvement */}
                      <div className="p-4 rounded-2xl bg-white border border-amber-200/80 shadow-2xs space-y-3">
                        <div className="flex items-center gap-2 text-amber-900 font-extrabold text-sm">
                          <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700">
                            <Target className="w-4 h-4" />
                          </div>
                          <span>Priority Areas to Improve ({allImprovements.length})</span>
                        </div>
                        <p className="text-xs text-slate-600">
                          Actionable adjustments to increase your score in actual hiring rounds:
                        </p>
                        {allImprovements.length > 0 ? (
                          <ul className="space-y-2 text-xs">
                            {allImprovements.map((improvement, iIdx) => (
                              <li
                                key={iIdx}
                                className="flex items-start gap-2 p-2 rounded-xl bg-amber-50/70 border border-amber-100 text-amber-950"
                              >
                                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                <span className="font-medium leading-relaxed">{improvement}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-semibold">
                            Excellent work! No major weaknesses flagged in this session.
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* Question-by-Question Deep Dive (Interactive Accordions) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-indigo-600" />
                      <span>Question Breakdown & Model Answers</span>
                    </h5>
                    <span className="text-xs text-slate-500 font-medium">
                      Click any question to view candidate answer & AI breakdown
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {answeredQuestions.map((item, qIdx) => {
                      const isExpanded = expandedQuestionIdx === qIdx;
                      const evalData = item.evaluation;

                      return (
                        <div
                          key={item.question.id || qIdx}
                          className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs transition-all"
                        >
                          <button
                            type="button"
                            onClick={() => setExpandedQuestionIdx(isExpanded ? null : qIdx)}
                            className="w-full px-4 py-3 text-left flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
                          >
                            <div className="flex items-center gap-2.5">
                              <span
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                  (evalData?.score || 0) >= 80
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : (evalData?.score || 0) >= 60
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                Q{qIdx + 1}
                              </span>
                              <div>
                                <span className="text-xs font-bold text-slate-900 line-clamp-1">
                                  {item.question.questionText}
                                </span>
                                <span className="text-[11px] text-slate-500">
                                  Category: {item.question.questionType}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                              <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                                {evalData?.score || 0}/100
                              </span>
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4 text-slate-400" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-slate-400" />
                              )}
                            </div>
                          </button>

                          {isExpanded && (
                            <div className="p-4 pt-0 border-t border-slate-100 space-y-3 text-xs bg-slate-50/40">
                              {/* Candidate Answer */}
                              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1 mt-3">
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                                  Your Response:
                                </span>
                                <p className="text-slate-800 leading-relaxed italic">"{item.candidateAnswer}"</p>
                              </div>

                              {/* AI Evaluator Feedback */}
                              {evalData?.feedback && (
                                <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 space-y-1">
                                  <span className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider block">
                                    AI Evaluator Feedback:
                                  </span>
                                  <p className="text-indigo-950 leading-relaxed">{evalData.feedback}</p>
                                </div>
                              )}

                              {/* Model Answer */}
                              {evalData?.idealAnswerSample && (
                                <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 space-y-1.5">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider">
                                      Model Top-Performer Answer:
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleCopyText(evalData.idealAnswerSample || '', qIdx)}
                                      className="text-[11px] font-bold text-emerald-800 hover:text-emerald-900 flex items-center gap-1"
                                    >
                                      {copiedIndex === qIdx ? (
                                        <Check className="w-3 h-3 text-emerald-600" />
                                      ) : (
                                        <Copy className="w-3 h-3" />
                                      )}
                                      Copy Answer
                                    </button>
                                  </div>
                                  <p className="text-emerald-950 leading-relaxed italic">
                                    "{evalData.idealAnswerSample}"
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 3-Step Next Action Plan */}
                <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm">
                    <Zap className="w-4 h-4 text-indigo-600" />
                    <span>Recommended Next Steps Before Live Interview</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                      <span className="font-bold text-slate-800 block">1. Practice STAR Structure</span>
                      <p className="text-slate-600">
                        Frame answers with clear Situation, Task, Action, and quantified Result metrics.
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                      <span className="font-bold text-slate-800 block">2. Review Curated Resources</span>
                      <p className="text-slate-600">
                        Review target job questions in the Curated Resource Library on your dashboard.
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                      <span className="font-bold text-slate-800 block">3. Repeat Mock Round</span>
                      <p className="text-slate-600">
                        Take a 4-question adaptive session again tomorrow to maintain your practice streak.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Chat / Dialogue Scroll Area */
              <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 max-w-3xl ${
                      msg.sender === 'user' ? 'ml-auto justify-end' : 'mr-auto justify-start'
                    }`}
                  >
                    {msg.sender === 'ai' && (
                      <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm font-bold text-xs">
                        AI
                      </div>
                    )}

                    <div
                      className={`rounded-2xl p-4 text-sm leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-white border border-slate-200 text-slate-800 shadow-sm'
                      }`}
                    >
                      <div className="whitespace-pre-line">{msg.text}</div>

                      {/* Question Framework Hint */}
                      {msg.questionMeta?.suggestedAnswerFramework && (
                        <div className="mt-3 pt-2.5 border-t border-slate-100 text-xs text-indigo-700 bg-indigo-50/50 p-2.5 rounded-lg flex items-start gap-1.5">
                          <Lightbulb className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                          <div>
                            <strong>Recommended Framework:</strong> {msg.questionMeta.suggestedAnswerFramework}
                          </div>
                        </div>
                      )}

                      {/* Question Evaluation Breakdown */}
                      {msg.evaluation && (
                        <div className="mt-3 pt-3 border-t border-slate-100 space-y-2 text-xs">
                          <div className="flex items-center gap-2 font-bold text-slate-900">
                            <Award className="w-4 h-4 text-indigo-600" />
                            <span>AI Hiring Manager Evaluation</span>
                          </div>

                          {msg.evaluation.strengths && msg.evaluation.strengths.length > 0 && (
                            <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-2.5 text-emerald-900 space-y-1">
                              <strong className="block text-emerald-800 font-bold">Key Strengths:</strong>
                              <ul className="list-disc pl-4 space-y-0.5">
                                {msg.evaluation.strengths.map((s, idx) => (
                                  <li key={idx}>{s}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {msg.evaluation.improvements && msg.evaluation.improvements.length > 0 && (
                            <div className="bg-amber-50 border border-amber-100 rounded-lg p-2.5 text-amber-900 space-y-1">
                              <strong className="block text-amber-800 font-bold">How to Improve:</strong>
                              <ul className="list-disc pl-4 space-y-0.5">
                                {msg.evaluation.improvements.map((imp, idx) => (
                                  <li key={idx}>{imp}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {msg.evaluation.idealAnswerSample && (
                            <div className="bg-indigo-50/70 border border-indigo-100 rounded-lg p-2.5 text-indigo-950 space-y-1">
                              <div className="flex items-center justify-between">
                                <strong className="text-indigo-900 font-bold">Model Answer (Top 5% Candidate):</strong>
                                <button
                                  onClick={() => handleCopyText(msg.evaluation?.idealAnswerSample || '', 999)}
                                  className="text-[11px] font-semibold text-indigo-700 hover:text-indigo-900 flex items-center gap-1"
                                >
                                  {copiedIndex === 999 ? (
                                    <Check className="w-3 h-3 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                  Copy
                                </button>
                              </div>
                              <p className="italic text-slate-700">"{msg.evaluation.idealAnswerSample}"</p>
                            </div>
                          )}
                        </div>
                      )}

                      <span
                        className={`block text-[10px] mt-1.5 ${
                          msg.sender === 'user' ? 'text-indigo-200 text-right' : 'text-slate-400'
                        }`}
                      >
                        {msg.timestamp}
                      </span>
                    </div>

                    {msg.sender === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-sm font-bold text-xs">
                        You
                      </div>
                    )}
                  </div>
                ))}

                {evaluating && (
                  <div className="flex items-center gap-3 text-slate-500 text-xs italic p-2 bg-white border border-slate-200 rounded-xl w-fit">
                    <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    <span>AI Interviewer is analyzing your response and structuring feedback...</span>
                  </div>
                )}
              </div>
            )}

          {/* User Input & Action Area */}
          {sessionState === 'interview' && (
            <div className="p-4 bg-white border-t border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
                <span>
                  Tip: Use the <strong>STAR Method</strong> (Situation, Task, Action, Result) for situational questions.
                </span>
                <span>{candidateInput.trim().split(/\s+/).filter(Boolean).length} words</span>
              </div>

              <div className="flex items-center gap-2">
                {speechSupported && (
                  <button
                    type="button"
                    onClick={toggleListening}
                    className={`p-3 rounded-xl border transition-all ${
                      isListening
                        ? 'bg-rose-50 border-rose-300 text-rose-600 animate-pulse'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                    title={isListening ? 'Stop Listening' : 'Speak Your Answer'}
                  >
                    {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>
                )}

                <textarea
                  rows={2}
                  value={candidateInput}
                  onChange={(e) => setCandidateInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendAnswer();
                    }
                  }}
                  placeholder="Type your answer here or click mic to speak..."
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
                />

                <PrimaryButton
                  onClick={handleSendAnswer}
                  disabled={!candidateInput.trim() || evaluating}
                  icon={<Send className="w-4 h-4" />}
                  className="!py-3 !px-5 font-bold"
                >
                  Send
                </PrimaryButton>
              </div>
            </div>
          )}

          {/* Summary Overview Link */}
          {sessionState === 'summary' && finalResult && (
            <div className="p-4 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-600" />
                <span className="text-sm font-bold text-slate-900">
                  Overall Score: {finalResult.overallScore}/100 ({finalResult.grade})
                </span>
              </div>

              <div className="flex items-center gap-2">
                <PrimaryButton
                  onClick={() => {
                    setSessionState('setup');
                    setChatMessages([]);
                    setAnsweredQuestions([]);
                  }}
                  icon={<RotateCcw className="w-4 h-4" />}
                  className="text-xs font-bold !py-2 !px-4"
                >
                  Start Another Session
                </PrimaryButton>
              </div>
            </div>
          )}
        </div>
      );
    })()}
  </div>
);
};

export default MockInterview;

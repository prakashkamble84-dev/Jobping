import React, { useState, useEffect, useRef } from 'react';
import {
  CareerProfile,
  InterviewQuestion,
  InterviewAnswerEvaluation,
  AnsweredInterviewQuestion,
  MockInterviewResult,
} from '../../types';
import {
  startMockInterview,
  evaluateInterviewAnswer,
  saveCompletedInterviewResult,
} from '../../services/mockInterviewService';
import { PrimaryButton } from '../common/PrimaryButton';
import { SecondaryButton } from '../common/SecondaryButton';
import { ProgressBar } from '../common/ProgressBar';
import {
  Mic,
  MicOff,
  Volume2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X,
  ArrowRight,
  RotateCcw,
  Trophy,
  Award,
  HelpCircle,
  Clock,
  BookOpen,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface MockInterviewModalProps {
  userId: string;
  profile: CareerProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onInterviewComplete?: (result: MockInterviewResult) => void;
}

export const MockInterviewModal: React.FC<MockInterviewModalProps> = ({
  userId,
  profile,
  isOpen,
  onClose,
  onInterviewComplete,
}) => {
  const [step, setStep] = useState<'setup' | 'question' | 'evaluation' | 'completed'>('setup');
  const [questionCount, setQuestionCount] = useState<number>(4);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [roleTitle, setRoleTitle] = useState<string>('');
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [currentAnswer, setCurrentAnswer] = useState<string>('');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [currentEvaluation, setCurrentEvaluation] = useState<InterviewAnswerEvaluation | null>(null);
  const [answeredQuestions, setAnsweredQuestions] = useState<AnsweredInterviewQuestion[]>([]);
  const [finalResult, setFinalResult] = useState<MockInterviewResult | null>(null);
  const [expandedReviewId, setExpandedReviewId] = useState<number | null>(null);

  const recognitionRef = useRef<any>(null);

  const targetJob = profile?.targetJob || 'Entry-Level Associate';

  useEffect(() => {
    if (isOpen) {
      setStep('setup');
      setCurrentIndex(0);
      setCurrentAnswer('');
      setCurrentEvaluation(null);
      setAnsweredQuestions([]);
      setFinalResult(null);
    }
  }, [isOpen]);

  // Handle Web Speech Recognition setup
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-IN';

        recognition.onresult = (event: any) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          if (transcript) {
            setCurrentAnswer((prev) => (prev ? `${prev} ${transcript}` : transcript));
          }
        };

        recognition.onerror = () => {
          setIsRecording(false);
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please type your answer directly.');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch {
        setIsRecording(false);
      }
    }
  };

  const handleSpeakQuestion = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.lang = 'en-IN';
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleStartInterview = async () => {
    setIsLoading(true);
    try {
      const data = await startMockInterview(profile, questionCount);
      setRoleTitle(data.roleTitle || targetJob);
      setQuestions(data.questions || []);
      setCurrentIndex(0);
      setCurrentAnswer('');
      setStep('question');
    } catch (err) {
      console.error('Failed to start interview:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!currentAnswer.trim() || isEvaluating) return;

    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }

    const currentQuestion = questions[currentIndex];
    setIsEvaluating(true);

    try {
      const evalResult = await evaluateInterviewAnswer(
        roleTitle || targetJob,
        currentQuestion,
        currentAnswer.trim()
      );

      setCurrentEvaluation(evalResult);

      const answeredItem: AnsweredInterviewQuestion = {
        question: currentQuestion,
        candidateAnswer: currentAnswer.trim(),
        evaluation: evalResult,
        answeredAt: new Date().toISOString(),
      };

      const updatedHistory = [...answeredQuestions, answeredItem];
      setAnsweredQuestions(updatedHistory);
      setStep('evaluation');

      // Check if it was the last question
      if (currentIndex + 1 >= questions.length) {
        const completed = saveCompletedInterviewResult(userId, roleTitle || targetJob, updatedHistory);
        setFinalResult(completed);
        if (onInterviewComplete) onInterviewComplete(completed);
      }
    } catch (err) {
      console.error('Failed to evaluate answer:', err);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setCurrentAnswer('');
      setCurrentEvaluation(null);
      setStep('question');
    } else {
      setStep('completed');
    }
  };

  if (!isOpen) return null;

  const currentQ = questions[currentIndex];
  const progressPercent = questions.length > 0 ? Math.round(((currentIndex + (step === 'evaluation' ? 1 : 0)) / questions.length) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div
        id="mock-interview-modal"
        className="relative w-full max-w-3xl rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col"
      >
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-900 leading-tight">
                AI Role-Specific Mock Interview
              </h3>
              <p className="text-[11px] text-slate-500">
                Target Role: <strong className="text-slate-700">{targetJob}</strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body Container */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {step === 'setup' && (
            /* SETUP PHASE */
            <div className="space-y-6 py-2">
              <div className="text-center max-w-lg mx-auto space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center mx-auto shadow-md">
                  <Sparkles className="w-7 h-7" />
                </div>
                <h4 className="text-xl font-black text-slate-900 tracking-tight">
                  Ready for your practice interview?
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Practice authentic interview questions for{' '}
                  <strong className="text-slate-900">{targetJob}</strong>. Answer by typing or speaking, and receive immediate AI scoring and hiring manager tips.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                  Select Interview Length
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setQuestionCount(3)}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      questionCount === 3
                        ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-600/20'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold text-slate-900">Quick Practice</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-800">
                        ~5 Mins
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">3 Core role & scenario questions</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setQuestionCount(5)}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      questionCount === 5
                        ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-600/20'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold text-slate-900">Full Simulation</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-indigo-100 text-indigo-800">
                        ~10 Mins
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">5 Comprehensive interview rounds</p>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <SecondaryButton onClick={onClose} className="text-xs !py-2.5 !px-4">
                  Cancel
                </SecondaryButton>
                <PrimaryButton
                  onClick={handleStartInterview}
                  disabled={isLoading}
                  icon={<ArrowRight className="w-4 h-4" />}
                  className="text-xs !py-2.5 !px-6"
                >
                  {isLoading ? 'Preparing Questions...' : 'Start Interview'}
                </PrimaryButton>
              </div>
            </div>
          )}

          {step === 'question' && currentQ && (
            /* QUESTION & ANSWERING PHASE */
            <div className="space-y-5">
              {/* Stepper & Progress */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                  <span>
                    Question {currentIndex + 1} of {questions.length}
                  </span>
                  <span className="capitalize text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                    {currentQ.questionType} Round
                  </span>
                </div>
                <ProgressBar value={progressPercent} showPercentage={false} size="sm" color="blue" />
              </div>

              {/* Question Box */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-tr from-slate-900 to-indigo-950 text-white space-y-3 shadow-xs">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-300 bg-blue-500/20 px-2 py-0.5 rounded-md border border-blue-400/30">
                      Interviewer Asking:
                    </span>
                    <h4 className="text-base sm:text-lg font-bold text-white leading-snug">
                      &ldquo;{currentQ.questionText}&rdquo;
                    </h4>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSpeakQuestion(currentQ.questionText)}
                    title="Listen to question audio"
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors shrink-0 cursor-pointer"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Context Coach Tip */}
                <div className="p-3 rounded-xl bg-white/10 border border-white/10 text-xs text-slate-200 flex items-start gap-2">
                  <HelpCircle className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-300 block">Recruiter Coach Hint:</span>
                    <span className="text-[11px] leading-relaxed text-slate-300">
                      {currentQ.contextTip}
                    </span>
                  </div>
                </div>
              </div>

              {/* Candidate Answer Box */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <label htmlFor="candidate-answer-input">Your Answer</label>
                  <button
                    type="button"
                    onClick={toggleRecording}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      isRecording
                        ? 'bg-rose-100 text-rose-700 animate-pulse border border-rose-200'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                    <span>{isRecording ? 'Listening (Click to Stop)' : 'Voice Mic Input'}</span>
                  </button>
                </div>

                <textarea
                  id="candidate-answer-input"
                  rows={4}
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  placeholder="Type your response here, or click 'Voice Mic Input' to speak naturally..."
                  className="w-full p-4 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-sm text-slate-900 leading-relaxed shadow-2xs"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <SecondaryButton
                  type="button"
                  onClick={() => setCurrentAnswer('')}
                  className="text-xs !py-2 !px-3"
                  disabled={!currentAnswer || isEvaluating}
                >
                  Clear Text
                </SecondaryButton>

                <PrimaryButton
                  type="button"
                  onClick={handleSubmitAnswer}
                  disabled={!currentAnswer.trim() || isEvaluating}
                  icon={<Sparkles className="w-4 h-4" />}
                  className="text-xs !py-2.5 !px-6"
                >
                  {isEvaluating ? 'Evaluating with AI...' : 'Submit & Get Feedback'}
                </PrimaryButton>
              </div>
            </div>
          )}

          {step === 'evaluation' && currentEvaluation && currentQ && (
            /* REAL-TIME EVALUATION PHASE */
            <div className="space-y-5 animate-fadeIn">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  AI Evaluation for Question {currentIndex + 1}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700">Answer Score:</span>
                  <span
                    className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                      currentEvaluation.score >= 80
                        ? 'bg-emerald-100 text-emerald-800'
                        : currentEvaluation.score >= 65
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {currentEvaluation.score}/100 • {currentEvaluation.rating}
                  </span>
                </div>
              </div>

              {/* Feedback Summary Card */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-2">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  Coach Feedback
                </h5>
                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                  {currentEvaluation.feedback}
                </p>
              </div>

              {/* Strengths & Improvements 2-Col */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl border border-emerald-100 bg-emerald-50/40 space-y-2">
                  <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    What You Did Well
                  </span>
                  <ul className="space-y-1">
                    {currentEvaluation.strengths.map((str, idx) => (
                      <li key={idx} className="text-xs text-slate-600 flex items-start gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3.5 rounded-xl border border-amber-100 bg-amber-50/40 space-y-2">
                  <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    Areas to Elevate
                  </span>
                  <ul className="space-y-1">
                    {currentEvaluation.improvements.map((imp, idx) => (
                      <li key={idx} className="text-xs text-slate-600 flex items-start gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                        <span>{imp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Sample Model Answer Box */}
              <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200/80 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <span>Model Answer from Hiring Manager</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed italic bg-white p-3 rounded-lg border border-blue-100">
                  &ldquo;{currentEvaluation.sampleBestAnswer}&rdquo;
                </p>
              </div>

              <div className="flex items-center justify-end pt-2">
                <PrimaryButton
                  type="button"
                  onClick={handleNextQuestion}
                  icon={<ArrowRight className="w-4 h-4" />}
                  className="text-xs !py-2.5 !px-6"
                >
                  {currentIndex + 1 < questions.length ? 'Next Question' : 'View Final Scorecard'}
                </PrimaryButton>
              </div>
            </div>
          )}

          {step === 'completed' && finalResult && (
            /* COMPLETED PERFORMANCE SCORECARD */
            <div className="space-y-6 py-2 animate-fadeIn">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-500 text-white flex items-center justify-center mx-auto shadow-md">
                  <Trophy className="w-8 h-8" />
                </div>
                <h4 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Mock Interview Completed!
                </h4>
                <p className="text-xs sm:text-sm text-slate-500">
                  Performance assessment for <strong className="text-slate-800">{finalResult.roleTitle}</strong>
                </p>
              </div>

              {/* Score Highlight Box */}
              <div className="p-5 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-around gap-4 text-center sm:text-left">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                    Overall Performance Score
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl sm:text-4xl font-black text-white">
                      {finalResult.overallScore}
                    </span>
                    <span className="text-sm font-bold text-slate-400">/ 100</span>
                  </div>
                </div>

                <div className="h-8 w-px bg-slate-800 hidden sm:block" />

                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                    Readiness Rating
                  </span>
                  <span className="text-base sm:text-lg font-extrabold text-amber-400 mt-1 block">
                    {finalResult.grade}
                  </span>
                </div>
              </div>

              {/* Question by Question Review Accordion */}
              <div className="space-y-3">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Detailed Question Breakdown
                </h5>
                <div className="space-y-2">
                  {finalResult.answers.map((item, idx) => {
                    const isExpanded = expandedReviewId === idx;
                    return (
                      <div
                        key={idx}
                        className="rounded-xl border border-slate-200 bg-slate-50/70 overflow-hidden"
                      >
                        <button
                          type="button"
                          onClick={() => setExpandedReviewId(isExpanded ? null : idx)}
                          className="w-full p-3.5 flex items-center justify-between text-left transition-colors hover:bg-slate-100 cursor-pointer"
                        >
                          <div className="flex items-center gap-2 min-w-0 pr-2">
                            <span className="text-xs font-bold text-blue-700 shrink-0">
                              Q{idx + 1}.
                            </span>
                            <span className="text-xs font-bold text-slate-900 truncate">
                              {item.question.questionText}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                              {item.evaluation.score}/100
                            </span>
                            {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                          </div>
                        </button>

                        {isExpanded && (
                          <div className="p-4 bg-white border-t border-slate-200 space-y-3 text-xs">
                            <div>
                              <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block mb-1">
                                Your Response:
                              </span>
                              <p className="text-slate-800 bg-slate-50 p-2.5 rounded-lg leading-relaxed">
                                {item.candidateAnswer}
                              </p>
                            </div>
                            <div>
                              <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block mb-1">
                                AI Feedback:
                              </span>
                              <p className="text-slate-700 leading-relaxed">
                                {item.evaluation.feedback}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <SecondaryButton
                  onClick={handleStartInterview}
                  icon={<RotateCcw className="w-3.5 h-3.5" />}
                  className="text-xs !py-2.5 !px-4"
                >
                  Practice Again
                </SecondaryButton>
                <PrimaryButton onClick={onClose} className="text-xs !py-2.5 !px-6">
                  Back to Dashboard
                </PrimaryButton>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

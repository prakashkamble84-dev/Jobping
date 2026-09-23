import React, { useState } from 'react';
import { MockInterviewResult } from '../../types';
import { PrimaryButton } from '../common/PrimaryButton';
import { SecondaryButton } from '../common/SecondaryButton';
import {
  X,
  Trophy,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Volume2,
  Sparkles,
  Award,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  HelpCircle,
} from 'lucide-react';

interface InterviewFeedbackModalProps {
  interview: MockInterviewResult | null;
  isOpen: boolean;
  onClose: () => void;
  onPracticeAgain?: (roleTitle: string) => void;
}

export const InterviewFeedbackModal: React.FC<InterviewFeedbackModalProps> = ({
  interview,
  isOpen,
  onClose,
  onPracticeAgain,
}) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  if (!isOpen || !interview) return null;

  const handleSpeak = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.lang = 'en-IN';
      window.speechSynthesis.speak(utterance);
    }
  };

  const getGradeTheme = (grade: string) => {
    if (grade.includes('A+')) {
      return {
        badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        text: 'text-emerald-700',
      };
    }
    if (grade.includes('A')) {
      return {
        badge: 'bg-blue-100 text-blue-800 border-blue-200',
        text: 'text-blue-700',
      };
    }
    if (grade.includes('B')) {
      return {
        badge: 'bg-amber-100 text-amber-800 border-amber-200',
        text: 'text-amber-700',
      };
    }
    return {
      badge: 'bg-rose-100 text-rose-800 border-rose-200',
      text: 'text-rose-700',
    };
  };

  const gradeTheme = getGradeTheme(interview.grade);
  const formattedDate = new Date(interview.completedAt).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const scores = interview.answers.map((a) => a.evaluation.score || 0);
  const bestAnswerScore = scores.length > 0 ? Math.max(...scores) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div
        id="interview-feedback-modal"
        className="relative w-full max-w-3xl rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0 pr-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-black text-slate-900 leading-tight truncate">
                Interview Feedback: {interview.roleTitle}
              </h3>
              <p className="text-[11px] text-slate-500">
                Completed on {formattedDate} • {interview.totalQuestions} Questions Analyzed
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* Summary Score Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-tr from-slate-900 via-slate-900 to-indigo-950 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-amber-400 border border-white/10 shrink-0">
                <Trophy className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                  Overall Interview Score
                </span>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-3xl font-black text-white">{interview.overallScore}</span>
                  <span className="text-sm font-semibold text-slate-400">/ 100</span>
                </div>
              </div>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2 border-t sm:border-t-0 border-white/10 pt-3 sm:pt-0">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Readiness Evaluation
              </span>
              <span className="text-xs sm:text-sm font-black px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-300/30">
                {interview.grade}
              </span>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Questions
              </span>
              <span className="text-lg font-black text-slate-800 mt-0.5 block">
                {interview.totalQuestions}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Highest Score
              </span>
              <span className="text-lg font-black text-emerald-600 mt-0.5 block">
                {bestAnswerScore}/100
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Average
              </span>
              <span className="text-lg font-black text-blue-600 mt-0.5 block">
                {interview.overallScore}%
              </span>
            </div>
          </div>

          {/* Detailed Question Reviews */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                Question-by-Question Advice
              </h4>
              <span className="text-[11px] text-slate-400">
                Click any question to view detailed feedback
              </span>
            </div>

            <div className="space-y-3">
              {interview.answers.map((item, idx) => {
                const isExpanded = expandedIndex === idx;
                const evalItem = item.evaluation;

                return (
                  <div
                    key={idx}
                    className={`rounded-2xl border transition-all ${
                      isExpanded
                        ? 'border-indigo-200 bg-indigo-50/10 ring-1 ring-indigo-200 shadow-2xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    {/* Accordion Row Header */}
                    <button
                      type="button"
                      onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                      className="w-full p-4 flex items-center justify-between text-left cursor-pointer gap-3"
                    >
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                          Q{idx + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                              {item.question.questionType || 'General'}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                            {item.question.questionText}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                            evalItem.score >= 80
                              ? 'bg-emerald-100 text-emerald-800'
                              : evalItem.score >= 65
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {evalItem.score}/100 • {evalItem.rating}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    </button>

                    {/* Accordion Expanded Content */}
                    {isExpanded && (
                      <div className="px-4 pb-4 pt-1 space-y-4 border-t border-slate-100 text-xs">
                        {/* Audio & Recruiter Context Tip */}
                        <div className="flex items-start justify-between gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                          <div className="flex items-start gap-2 flex-1">
                            <HelpCircle className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold text-slate-700 block">
                                What Recruiters Look For:
                              </span>
                              <p className="text-[11px] text-slate-600 leading-relaxed">
                                {item.question.contextTip || 'Demonstrate clarity, confidence, and structured problem solving.'}
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleSpeak(item.question.questionText)}
                            title="Listen to question"
                            className="p-1.5 rounded-lg bg-white hover:bg-slate-200 text-slate-600 transition-colors shrink-0 cursor-pointer border border-slate-200"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Candidate's Submitted Response */}
                        <div>
                          <span className="font-bold uppercase tracking-wider text-[10px] text-slate-400 block mb-1">
                            Your Submitted Response:
                          </span>
                          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/90 text-slate-800 leading-relaxed font-medium">
                            {item.candidateAnswer || 'No response recorded.'}
                          </div>
                        </div>

                        {/* AI Recruiter Feedback */}
                        <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100 space-y-1">
                          <span className="font-bold text-blue-900 flex items-center gap-1.5 text-xs">
                            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                            Recruiter Feedback & Analysis
                          </span>
                          <p className="text-xs text-slate-700 leading-relaxed">
                            {evalItem.feedback}
                          </p>
                        </div>

                        {/* Strengths & Improvements */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {evalItem.strengths && evalItem.strengths.length > 0 && (
                            <div className="p-3 rounded-xl border border-emerald-100 bg-emerald-50/40 space-y-1.5">
                              <span className="text-[11px] font-bold text-emerald-900 flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                Strong Points
                              </span>
                              <ul className="space-y-1">
                                {evalItem.strengths.map((s, sIdx) => (
                                  <li key={sIdx} className="text-[11px] text-slate-600 flex items-start gap-1.5">
                                    <span className="w-1 h-1 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                                    <span>{s}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {evalItem.improvements && evalItem.improvements.length > 0 && (
                            <div className="p-3 rounded-xl border border-amber-100 bg-amber-50/40 space-y-1.5">
                              <span className="text-[11px] font-bold text-amber-900 flex items-center gap-1.5">
                                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                                Growth Opportunities
                              </span>
                              <ul className="space-y-1">
                                {evalItem.improvements.map((imp, iIdx) => (
                                  <li key={iIdx} className="text-[11px] text-slate-600 flex items-start gap-1.5">
                                    <span className="w-1 h-1 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                                    <span>{imp}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>

                        {/* Model Answer from Recruiter */}
                        {evalItem.sampleBestAnswer && (
                          <div className="p-3.5 rounded-xl bg-slate-900 text-white space-y-1.5">
                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-400">
                              <BookOpen className="w-3.5 h-3.5" />
                              <span>Recommended Best Answer Framework:</span>
                            </div>
                            <p className="text-xs text-slate-200 leading-relaxed italic bg-white/5 p-2.5 rounded-lg border border-white/10">
                              &ldquo;{evalItem.sampleBestAnswer}&rdquo;
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

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            {onPracticeAgain ? (
              <SecondaryButton
                onClick={() => {
                  onClose();
                  onPracticeAgain(interview.roleTitle);
                }}
                icon={<Sparkles className="w-3.5 h-3.5" />}
                className="text-xs !py-2.5 !px-4"
              >
                Practice This Role Again
              </SecondaryButton>
            ) : (
              <div />
            )}

            <PrimaryButton onClick={onClose} className="text-xs !py-2.5 !px-6">
              Close Review
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  HelpCircle,
  Sparkles,
  Award,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  Bookmark,
  BookmarkCheck,
  Mic,
  ArrowRight,
  RefreshCw,
  Zap,
  MessageSquare,
  DollarSign,
  Users,
  Code2,
  Smile,
  Clock,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Target,
  FileCheck2,
} from 'lucide-react';
import { DashboardCard } from '../common/DashboardCard';
import { PrimaryButton } from '../common/PrimaryButton';
import { SecondaryButton } from '../common/SecondaryButton';
import { CareerProfile, InterviewRoundType, InterviewTipItem, RoleInterviewPrepGuide } from '../../types';
import {
  getCuratedInterviewGuide,
  getBookmarkedTipIds,
  toggleTipBookmark,
  fetchAIInterviewTips,
} from '../../services/interviewTipsService';
import { useToast } from '../../context/ToastContext';

interface InterviewPrepTipsCardProps {
  user: { uid: string; name?: string };
  profile: CareerProfile | null;
  onNavigateToMockInterview?: () => void;
}

export const InterviewPrepTipsCard: React.FC<InterviewPrepTipsCardProps> = ({
  user,
  profile,
  onNavigateToMockInterview,
}) => {
  const { showSuccess } = useToast();
  const targetJob = profile?.targetJob || 'Entry-Level Professional';

  const [activeRound, setActiveRound] = useState<InterviewRoundType | 'all' | 'checklist'>('all');
  const [guide, setGuide] = useState<RoleInterviewPrepGuide>(() => getCuratedInterviewGuide(targetJob));
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => getBookmarkedTipIds(user?.uid || 'guest'));
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedPitch, setCopiedPitch] = useState<boolean>(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState<boolean>(false);
  const [expandedTipIds, setExpandedTipIds] = useState<Record<string, boolean>>({});
  const [checkedChecklist, setCheckedChecklist] = useState<Record<number, boolean>>({});
  const [onlyBookmarks, setOnlyBookmarks] = useState<boolean>(false);

  useEffect(() => {
    // When target job changes, update base curated guide
    const base = getCuratedInterviewGuide(targetJob);
    setGuide(base);
    // Expand first 2 tips by default
    if (base.roundTips.length > 0) {
      setExpandedTipIds({
        [base.roundTips[0].id]: true,
        ...(base.roundTips[1] ? { [base.roundTips[1].id]: true } : {}),
      });
    }
  }, [targetJob]);

  const handleToggleBookmark = (tipId: string) => {
    const updated = toggleTipBookmark(user?.uid || 'guest', tipId);
    setBookmarkedIds(updated);
  };

  const handleCopyText = (text: string, id: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      showSuccess('Copied to Clipboard! 📋', 'Answer template is ready for your notes.');
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleCopyPitch = () => {
    const fullPitch = `${guide.elevatorPitchFormula.hook} ${guide.elevatorPitchFormula.proofPoints} ${guide.elevatorPitchFormula.targetAlignment}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(fullPitch);
      setCopiedPitch(true);
      showSuccess('Elevator Pitch Copied! 🚀', 'Practice delivering this in your 90-second intro.');
      setTimeout(() => setCopiedPitch(false), 2000);
    }
  };

  const handleGenerateAICheatsheet = async () => {
    setIsGeneratingAI(true);
    try {
      const aiGuide = await fetchAIInterviewTips(
        profile,
        user?.uid || 'guest',
        activeRound === 'all' ? undefined : activeRound
      );
      setGuide(aiGuide);
      // Expand all new tips
      const expanded: Record<string, boolean> = {};
      aiGuide.roundTips.forEach((t) => (expanded[t.id] = true));
      setExpandedTipIds(expanded);
      showSuccess('AI Interview Playbook Generated! 🧠', `Tailored specifically for ${targetJob}.`);
    } catch (err) {
      console.error('Failed to generate AI interview tips:', err);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedTipIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleChecklistItem = (idx: number) => {
    setCheckedChecklist((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  // Filter tips
  const filteredTips = guide.roundTips.filter((tip) => {
    if (onlyBookmarks && !bookmarkedIds.includes(tip.id)) return false;
    if (activeRound === 'all' || activeRound === 'checklist') return true;
    return tip.roundType === activeRound;
  });

  const getRoundBadge = (round: InterviewRoundType) => {
    switch (round) {
      case 'behavioral':
        return { label: 'Behavioral Round', icon: <Users className="w-3 h-3 text-purple-600" />, bg: 'bg-purple-50 text-purple-800 border-purple-200' };
      case 'technical':
        return { label: 'Technical & Domain', icon: <Code2 className="w-3 h-3 text-blue-600" />, bg: 'bg-blue-50 text-blue-800 border-blue-200' };
      case 'hr':
        return { label: 'HR & Cultural Fit', icon: <Smile className="w-3 h-3 text-emerald-600" />, bg: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
      case 'salary':
        return { label: 'Salary & CTC', icon: <DollarSign className="w-3 h-3 text-amber-600" />, bg: 'bg-amber-50 text-amber-800 border-amber-200' };
      case 'reverse_questions':
        return { label: 'Ask Interviewer', icon: <HelpCircle className="w-3 h-3 text-indigo-600" />, bg: 'bg-indigo-50 text-indigo-800 border-indigo-200' };
      case 'dos_donts':
        return { label: 'Etiquette & Setup', icon: <ShieldAlert className="w-3 h-3 text-rose-600" />, bg: 'bg-rose-50 text-rose-800 border-rose-200' };
      default:
        return { label: 'Round Tip', icon: <Zap className="w-3 h-3 text-slate-600" />, bg: 'bg-slate-50 text-slate-800 border-slate-200' };
    }
  };

  return (
    <DashboardCard
      id="interview-prep-tips-section"
      title="INTERVIEW PREP TIPS & ROUND PLAYBOOK"
      subtitle={`Curated frameworks, sample scripts, and proven strategies tailored for ${targetJob}`}
      icon={<MessageSquare className="w-5 h-5 text-indigo-600" />}
      badge="Recruiter Tested"
      className="border-slate-200 bg-white shadow-sm"
    >
      <div className="space-y-5">
        {/* Top Feature Banner: 90-Second Elevator Pitch Box */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-indigo-50/90 via-white to-purple-50/40 border border-indigo-100 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-slate-900">
                  Your Tailored 90-Second "Tell Me About Yourself" Formula
                </h4>
                <p className="text-xs text-slate-600">
                  The psychological anchor for opening any technical or HR interview round.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                id="copy-pitch-btn"
                onClick={handleCopyPitch}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-800 hover:bg-slate-50 transition shadow-2xs cursor-pointer"
              >
                {copiedPitch ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                    <span className="text-emerald-700">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Copy Script</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1 text-xs">
            <div className="p-3 rounded-xl bg-white border border-indigo-100 shadow-2xs">
              <span className="text-[10px] font-extrabold uppercase text-indigo-600 block mb-1">
                1. Present Hook (Who you are)
              </span>
              <p className="text-slate-700 leading-relaxed font-medium">
                "{guide.elevatorPitchFormula.hook}"
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white border border-indigo-100 shadow-2xs">
              <span className="text-[10px] font-extrabold uppercase text-purple-600 block mb-1">
                2. Past Proof-of-Work (Top 2 Wins)
              </span>
              <p className="text-slate-700 leading-relaxed font-medium">
                "{guide.elevatorPitchFormula.proofPoints}"
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white border border-indigo-100 shadow-2xs">
              <span className="text-[10px] font-extrabold uppercase text-emerald-600 block mb-1">
                3. Future Target (Why this company)
              </span>
              <p className="text-slate-700 leading-relaxed font-medium">
                "{guide.elevatorPitchFormula.targetAlignment}"
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls & AI Generator Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          {/* Round Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {[
              { id: 'all', label: 'All Rounds' },
              { id: 'behavioral', label: 'Behavioral (STAR)' },
              { id: 'technical', label: 'Technical / Domain' },
              { id: 'hr', label: 'HR & Culture' },
              { id: 'salary', label: 'Salary & CTC' },
              { id: 'reverse_questions', label: 'Ask Interviewer' },
              { id: 'checklist', label: '24hr Checklist' },
            ].map((tab) => (
              <button
                key={tab.id}
                id={`interview-tab-${tab.id}`}
                onClick={() => {
                  setActiveRound(tab.id as any);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                  activeRound === tab.id
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* AI Generator & Practice Actions */}
          <div className="flex items-center gap-2">
            <button
              id="toggle-saved-tips-btn"
              onClick={() => setOnlyBookmarks(!onlyBookmarks)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                onlyBookmarks
                  ? 'bg-amber-50 text-amber-800 border-amber-300 shadow-2xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${onlyBookmarks ? 'fill-amber-500 text-amber-500' : ''}`} />
              <span>Saved ({bookmarkedIds.length})</span>
            </button>

            <button
              id="ai-generate-cheatsheet-btn"
              onClick={handleGenerateAICheatsheet}
              disabled={isGeneratingAI}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition shadow-2xs cursor-pointer"
              title="Generate fresh AI interview cheatsheet for this target job"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingAI ? 'animate-spin' : ''}`} />
              <span>{isGeneratingAI ? 'Analyzing...' : 'AI Cheatsheet'}</span>
            </button>

            {onNavigateToMockInterview && (
              <button
                id="mock-practice-jump-btn"
                onClick={onNavigateToMockInterview}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition shadow-2xs cursor-pointer"
                title="Practice live with AI Mock Interviewer"
              >
                <Mic className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Practice Live</span>
              </button>
            )}
          </div>
        </div>

        {/* 24-Hour High-Impact Checklist View */}
        {activeRound === 'checklist' && (
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
            <div className="flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-indigo-600" />
              <div>
                <h4 className="text-sm font-extrabold text-slate-900">
                  24-Hour Pre-Interview Readiness Checklist
                </h4>
                <p className="text-xs text-slate-500">
                  Tick off each essential checkpoint before your scheduled interview call.
                </p>
              </div>
            </div>

            <div className="space-y-2.5">
              {guide.highImpactChecklist.map((item, idx) => {
                const isChecked = !!checkedChecklist[idx];
                return (
                  <div
                    key={idx}
                    id={`checklist-item-${idx}`}
                    onClick={() => toggleChecklistItem(idx)}
                    className={`p-3 rounded-xl border flex items-start gap-3 transition cursor-pointer ${
                      isChecked
                        ? 'bg-emerald-50/60 border-emerald-200 text-slate-600'
                        : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-900'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition ${
                        isChecked
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'border-2 border-slate-300 bg-white'
                      }`}
                    >
                      {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <span className={`text-xs font-semibold ${isChecked ? 'line-through text-slate-500' : 'text-slate-800'}`}>
                      {item}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Reverse Questions View */}
        {activeRound === 'reverse_questions' && (
          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center gap-2 text-xs text-indigo-900 font-semibold">
              <HelpCircle className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>
                Asking insightful reverse questions at the end of the round proves high intellectual curiosity and separates top-tier candidates.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {guide.questionsToAskInterviewer.map((q, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-slate-100 text-slate-700 border border-slate-200 inline-block">
                      {q.category}
                    </span>
                    <h5 className="text-xs font-bold text-slate-900 leading-snug">
                      "{q.question}"
                    </h5>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600">
                    <strong className="text-indigo-600 font-bold block mb-0.5">Why this works:</strong>
                    {q.whyItWorks}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tips Accordion Cards List */}
        {activeRound !== 'checklist' && (
          <div className="space-y-3.5">
            {filteredTips.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-slate-50 border border-dashed border-slate-200 space-y-2">
                <Bookmark className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs font-bold text-slate-600">No saved tips found in this category.</p>
                <p className="text-[11px] text-slate-400">Click the bookmark icon on any tip card to save it for quick review.</p>
              </div>
            ) : (
              filteredTips.map((tip) => {
                const isExpanded = !!expandedTipIds[tip.id];
                const isBookmarked = bookmarkedIds.includes(tip.id);
                const badge = getRoundBadge(tip.roundType);

                return (
                  <div
                    key={tip.id}
                    id={`interview-tip-${tip.id}`}
                    className="rounded-2xl border border-slate-200 bg-white overflow-hidden transition-all duration-200 shadow-2xs hover:border-slate-300"
                  >
                    {/* Header */}
                    <div
                      onClick={() => toggleExpand(tip.id)}
                      className="p-4 sm:p-4.5 flex items-start justify-between gap-3 cursor-pointer hover:bg-slate-50/60 transition"
                    >
                      <div className="flex items-start gap-3">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleBookmark(tip.id);
                          }}
                          className="mt-0.5 text-slate-400 hover:text-amber-500 transition cursor-pointer shrink-0"
                          title={isBookmarked ? 'Remove bookmark' : 'Bookmark tip'}
                        >
                          <Bookmark
                            className={`w-4 h-4 ${
                              isBookmarked ? 'fill-amber-500 text-amber-500' : ''
                            }`}
                          />
                        </button>

                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                              {tip.title}
                            </h4>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold border flex items-center gap-1 ${badge.bg}`}
                            >
                              {badge.icon}
                              {badge.label}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-slate-100 text-slate-700 border border-slate-200">
                              {tip.categoryTag}
                            </span>
                          </div>

                          <p className="text-xs text-slate-600 line-clamp-1 sm:line-clamp-none">
                            {tip.summary}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className="p-1 rounded-lg bg-slate-100 text-slate-500">
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      </div>
                    </div>

                    {/* Expanded Body */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="border-t border-slate-100 p-4 sm:p-5 space-y-4 bg-slate-50/40 text-xs"
                        >
                          {/* Recommended Framework Pill */}
                          {tip.recommendedFramework && (
                            <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-100">
                              <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-700 block mb-1">
                                Recommended Thinking Framework
                              </span>
                              <p className="text-indigo-950 font-bold text-xs">
                                {tip.recommendedFramework}
                              </p>
                            </div>
                          )}

                          {/* Sample Question & Answer Script */}
                          {tip.sampleQuestion && (
                            <div className="space-y-2">
                              <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1.5 shadow-2xs">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-extrabold uppercase text-slate-400">
                                    Sample Question Asked
                                  </span>
                                </div>
                                <p className="font-bold text-slate-900">
                                  "{tip.sampleQuestion}"
                                </p>
                              </div>

                              {tip.sampleAnswerTemplate && (
                                <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-2 shadow-2xs">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-extrabold uppercase text-emerald-700 font-mono">
                                      Sample Answer Structure / Script
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleCopyText(tip.sampleAnswerTemplate!, tip.id)}
                                      className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer"
                                    >
                                      {copiedId === tip.id ? (
                                        <>
                                          <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                                          <span className="text-emerald-700">Copied</span>
                                        </>
                                      ) : (
                                        <>
                                          <Copy className="w-3 h-3" />
                                          <span>Copy Script</span>
                                        </>
                                      )}
                                    </button>
                                  </div>
                                  <p className="text-slate-700 leading-relaxed font-normal whitespace-pre-line bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-xs">
                                    {tip.sampleAnswerTemplate}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Pro Tips & Mistakes Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                            {/* Pro Tips */}
                            <div className="p-3.5 rounded-xl bg-white border border-emerald-100 space-y-2 shadow-2xs">
                              <span className="text-[11px] font-extrabold text-emerald-800 flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>High-Impact Pro Tips</span>
                              </span>
                              <ul className="space-y-1.5 text-slate-700">
                                {tip.proTips.map((pt, pIdx) => (
                                  <li key={pIdx} className="flex items-start gap-1.5 text-[11px]">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                                    <span>{pt}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Common Mistakes */}
                            {tip.commonMistakesToAvoid && tip.commonMistakesToAvoid.length > 0 && (
                              <div className="p-3.5 rounded-xl bg-white border border-rose-100 space-y-2 shadow-2xs">
                                <span className="text-[11px] font-extrabold text-rose-800 flex items-center gap-1.5">
                                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                                  <span>Common Pitfalls to Avoid</span>
                                </span>
                                <ul className="space-y-1.5 text-slate-700">
                                  {tip.commonMistakesToAvoid.map((cm, cIdx) => (
                                    <li key={cIdx} className="flex items-start gap-1.5 text-[11px]">
                                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                                      <span>{cm}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </DashboardCard>
  );
};

import { jsPDF } from 'jspdf';
import {
  CareerProfile,
  ScoreBreakdown,
  User,
  MockInterviewResult,
  SkillsGapAnalysis,
  MatchingSkill,
  MissingSkill,
} from '../types';
import { fetchSkillsGapAnalysis } from './skillsGapService';
import { getInterviewHistory } from './mockInterviewService';

export interface GeneratePDFReportOptions {
  user: User;
  profile: CareerProfile | null;
  score: ScoreBreakdown;
  skillsGap?: SkillsGapAnalysis | null;
  interviews?: MockInterviewResult[];
}

export async function generateJobReadyPDFReport({
  user,
  profile,
  score,
  skillsGap: customSkillsGap,
  interviews: customInterviews,
}: GeneratePDFReportOptions): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  // Retrieve skill gaps if not passed
  let gapReport: SkillsGapAnalysis | null = customSkillsGap || null;
  if (!gapReport && profile) {
    try {
      gapReport = await fetchSkillsGapAnalysis(profile);
    } catch {
      gapReport = null;
    }
  }

  // Retrieve interviews if not passed
  const interviews = customInterviews || getInterviewHistory(user.uid);

  let currentY = margin;

  // Header banner
  doc.setFillColor(30, 41, 59); // Slate-800
  doc.roundedRect(margin, currentY, contentWidth, 24, 3, 3, 'F');

  // Brand title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('JobReady', margin + 6, currentY + 11);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184); // Slate-400
  doc.text('CAREER READINESS & COMPETENCY REPORT', margin + 6, currentY + 17);

  // Report Date & ID on right
  const dateFormatted = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  doc.setFontSize(8);
  doc.setTextColor(226, 232, 240);
  doc.text(`Generated: ${dateFormatted}`, pageWidth - margin - 6, currentY + 11, {
    align: 'right',
  });
  doc.setTextColor(148, 163, 184);
  doc.text(`Ref ID: JR-${user.uid.slice(0, 8).toUpperCase()}`, pageWidth - margin - 6, currentY + 17, {
    align: 'right',
  });

  currentY += 28;

  // 1. Candidate & Target Role Summary Card
  doc.setFillColor(248, 250, 252); // Slate-50
  doc.setDrawColor(226, 232, 240); // Slate-200
  doc.roundedRect(margin, currentY, contentWidth, 26, 2, 2, 'FD');

  const candidateName = user.name || 'Candidate';
  const targetJob = profile?.targetJob || 'Entry-Level Associate';
  const experience = profile?.experienceLevel || 'Fresher';
  const education = profile?.education || 'Graduate / Diploma';
  const location = profile?.preferredCity || 'India';

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42); // Slate-900
  doc.text(candidateName, margin + 5, currentY + 7);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105); // Slate-600
  doc.text(`Email: ${user.email || 'N/A'}`, margin + 5, currentY + 13);
  doc.text(`Target Job: ${targetJob} (${experience})`, margin + 5, currentY + 19);

  // Right column inside candidate box
  doc.text(`Education: ${education}`, margin + contentWidth / 2 + 5, currentY + 13);
  doc.text(`Preferred Location: ${location}`, margin + contentWidth / 2 + 5, currentY + 19);

  currentY += 30;

  // 2. JobReady Readiness Scorecard
  doc.setFillColor(238, 242, 255); // Indigo-50
  doc.setDrawColor(199, 210, 254); // Indigo-200
  doc.roundedRect(margin, currentY, contentWidth, 34, 2, 2, 'FD');

  // Big Overall Score Circle Box
  doc.setFillColor(79, 70, 229); // Indigo-600
  doc.roundedRect(margin + 5, currentY + 5, 24, 24, 2, 2, 'F');
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(`${score.overallScore}`, margin + 17, currentY + 17, { align: 'center' });
  doc.setFontSize(7);
  doc.text('/ 100', margin + 17, currentY + 23, { align: 'center' });

  // Score description text
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 27, 75);
  doc.text('Overall Job Readiness Index', margin + 34, currentY + 10);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(79, 70, 229);
  const statusLabel =
    score.overallScore >= 80
      ? 'READY TO APPLY (Top 15% Candidate Profile)'
      : score.overallScore >= 65
      ? 'COMPETITIVE (Minor Polish Recommended)'
      : 'IN PREPARATION (Action Items Required)';
  doc.text(statusLabel, margin + 34, currentY + 15);

  // 4 Pillar Mini-Scores
  const pillarY = currentY + 20;
  const pillarWidth = (contentWidth - 36) / 4;

  const pillars = [
    { name: 'Profile Depth', val: score.profileCompletionScore },
    { name: 'Skills Match', val: score.skillsScore },
    { name: 'Goal Clarity', val: score.careerGoalScore },
    { name: 'Role Focus', val: score.targetJobScore },
  ];

  pillars.forEach((p, idx) => {
    const px = margin + 34 + idx * pillarWidth;
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(p.name, px, pillarY + 3);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(`${p.val}%`, px, pillarY + 8);
  });

  currentY += 38;

  // 3. Skills Gap & Industry Alignment
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('1. Skills Gap & Market Alignment Analysis', margin, currentY + 4);
  currentY += 8;

  if (gapReport) {
    const boxHeight = 44;
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, currentY, contentWidth, boxHeight, 2, 2, 'FD');

    // Matching Skills Column (Left)
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(22, 101, 52); // Emerald-800
    doc.text(
      `✓ Verified Profile Skills (${gapReport.matchingSkills.length})`,
      margin + 5,
      currentY + 7
    );

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    const matchSkillNames = gapReport.matchingSkills.map((s: MatchingSkill) => s.name).slice(0, 5);
    if (matchSkillNames.length > 0) {
      matchSkillNames.forEach((sName: string, sIdx: number) => {
        doc.text(`• ${sName}`, margin + 5, currentY + 13 + sIdx * 5);
      });
    } else {
      doc.text('• No verified skills added yet.', margin + 5, currentY + 13);
    }

    // Missing Skills Column (Right)
    const midX = margin + contentWidth / 2;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(180, 83, 9); // Amber-700
    doc.text(
      `⚠ High-Demand Skill Gaps (${gapReport.missingSkills.length})`,
      midX + 5,
      currentY + 7
    );

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    const missingSkills = gapReport.missingSkills.slice(0, 5);
    if (missingSkills.length > 0) {
      missingSkills.forEach((mSkill: MissingSkill, mIdx: number) => {
        doc.text(`• ${mSkill.name} (${mSkill.importance} priority)`, midX + 5, currentY + 13 + mIdx * 5);
      });
    } else {
      doc.text('• Excellent! All key skills match market expectations.', midX + 5, currentY + 13);
    }

    currentY += boxHeight + 6;
  } else {
    // Fallback if no gap report
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('Skills analysis will be automatically generated upon profile completion.', margin, currentY + 4);
    currentY += 10;
  }

  // 4. Mock Interview Performance History
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('2. Mock Interview Simulation Records', margin, currentY + 4);
  currentY += 8;

  if (interviews.length > 0) {
    const recentInterviews = interviews.slice(0, 3);
    const rowHeight = 18;
    const tableHeight = recentInterviews.length * rowHeight + 10;

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, currentY, contentWidth, tableHeight, 2, 2, 'FD');

    // Table Header
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('Target Role Tested', margin + 5, currentY + 6);
    doc.text('Date', margin + 65, currentY + 6);
    doc.text('Questions', margin + 100, currentY + 6);
    doc.text('Score', margin + 130, currentY + 6);
    doc.text('Recruiter Grade', margin + 150, currentY + 6);

    doc.setDrawColor(226, 232, 240);
    doc.line(margin + 5, currentY + 8, margin + contentWidth - 5, currentY + 8);

    recentInterviews.forEach((item, idx) => {
      const itemY = currentY + 14 + idx * rowHeight;
      const dateStr = new Date(item.completedAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
      });

      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(item.roleTitle.slice(0, 30), margin + 5, itemY);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text(dateStr, margin + 65, itemY);
      doc.text(`${item.totalQuestions} Qs`, margin + 100, itemY);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(79, 70, 229);
      doc.text(`${item.overallScore}/100`, margin + 130, itemY);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(30, 41, 59);
      doc.text(item.grade.split('(')[0].trim(), margin + 150, itemY);

      // Top Strength Snippet
      const topStrength = item.answers?.[0]?.evaluation?.strengths?.[0];
      if (topStrength) {
        doc.setFontSize(6.5);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(100, 116, 139);
        doc.text(`Strength: "${topStrength.slice(0, 95)}"`, margin + 5, itemY + 4);
      }
    });

    currentY += tableHeight + 6;
  } else {
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, currentY, contentWidth, 14, 2, 2, 'FD');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('No mock interviews recorded yet. Complete simulated sessions to view detailed recruiter scores.', margin + 5, currentY + 9);
    currentY += 20;
  }

  // 5. Strategic Priority Recommendations
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('3. Strategic Next Steps for Hiring Success', margin, currentY + 4);
  currentY += 8;

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, currentY, contentWidth, 24, 2, 2, 'FD');

  const tips = [
    '• Update Resume: Incorporate quantified metrics and missing keywords into your ATS profile summary.',
    '• Daily Practice: Complete 1 mock interview round daily to build confidence and fluency.',
    '• Direct Outreach: Leverage your readiness score when contacting recruiters and alumni.',
  ];

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  tips.forEach((tip: string, tIdx: number) => {
    doc.text(tip, margin + 5, currentY + 6 + tIdx * 6);
  });

  // Footer Disclaimer
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text(
    '© JobReady AI Career Accelerator • Confidential assessment for personal career advancement.',
    pageWidth / 2,
    pageHeight - 8,
    { align: 'center' }
  );

  // Trigger browser download
  const cleanName = (user.name || 'Candidate').replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`JobReady_Readiness_Report_${cleanName}.pdf`);
}

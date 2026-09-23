import { LeaderboardEntry, User, CareerProfile, ScoreBreakdown } from '../types';
import { getDailyCheckIn } from './checkInService';

const PEER_STUDENTS: Omit<LeaderboardEntry, 'rank' | 'isCurrentUser' | 'tier'>[] = [
  {
    id: 'peer-1',
    name: 'Ananya Sharma',
    avatarColor: 'bg-rose-500',
    targetRole: 'Frontend Developer',
    collegeOrLocation: 'IIT Bombay • Mumbai',
    readinessScore: 94,
    streakDays: 18,
    badgesCount: 6,
    rankChange: 2,
  },
  {
    id: 'peer-2',
    name: 'Rohan Deshmukh',
    avatarColor: 'bg-indigo-500',
    targetRole: 'Full Stack Engineer',
    collegeOrLocation: 'Pune University • Pune',
    readinessScore: 91,
    streakDays: 14,
    badgesCount: 5,
    rankChange: 1,
  },
  {
    id: 'peer-3',
    name: 'Sneha Patel',
    avatarColor: 'bg-emerald-500',
    targetRole: 'Data Analyst',
    collegeOrLocation: 'DA-IICT • Ahmedabad',
    readinessScore: 89,
    streakDays: 12,
    badgesCount: 5,
    rankChange: -1,
  },
  {
    id: 'peer-4',
    name: 'Arjun Verma',
    avatarColor: 'bg-amber-500',
    targetRole: 'Customer Support Executive',
    collegeOrLocation: 'Delhi University • New Delhi',
    readinessScore: 86,
    streakDays: 9,
    badgesCount: 4,
    rankChange: 3,
  },
  {
    id: 'peer-5',
    name: 'Pooja Iyer',
    avatarColor: 'bg-purple-500',
    targetRole: 'UI/UX Designer',
    collegeOrLocation: 'NID • Bengaluru',
    readinessScore: 84,
    streakDays: 11,
    badgesCount: 4,
    rankChange: 0,
  },
  {
    id: 'peer-6',
    name: 'Vikram Mehta',
    avatarColor: 'bg-cyan-500',
    targetRole: 'Business Development Associate',
    collegeOrLocation: 'Symbiosis • Pune',
    readinessScore: 81,
    streakDays: 7,
    badgesCount: 3,
    rankChange: 2,
  },
  {
    id: 'peer-7',
    name: 'Kavita Nair',
    avatarColor: 'bg-teal-500',
    targetRole: 'QA Test Engineer',
    collegeOrLocation: 'Cochin Univ • Kochi',
    readinessScore: 78,
    streakDays: 8,
    badgesCount: 3,
    rankChange: -2,
  },
  {
    id: 'peer-8',
    name: 'Aditya Roy',
    avatarColor: 'bg-sky-500',
    targetRole: 'Digital Marketing Specialist',
    collegeOrLocation: 'St. Xavier\'s • Kolkata',
    readinessScore: 76,
    streakDays: 6,
    badgesCount: 3,
    rankChange: 1,
  },
  {
    id: 'peer-9',
    name: 'Meera Rao',
    avatarColor: 'bg-pink-500',
    targetRole: 'Human Resources Associate',
    collegeOrLocation: 'Christ University • Bengaluru',
    readinessScore: 73,
    streakDays: 5,
    badgesCount: 2,
    rankChange: 0,
  },
  {
    id: 'peer-10',
    name: 'Siddharth Joshi',
    avatarColor: 'bg-orange-500',
    targetRole: 'Backend Developer',
    collegeOrLocation: 'VJTI • Mumbai',
    readinessScore: 70,
    streakDays: 4,
    badgesCount: 2,
    rankChange: -1,
  },
  {
    id: 'peer-11',
    name: 'Tanvi Saxena',
    avatarColor: 'bg-violet-500',
    targetRole: 'Operations Analyst',
    collegeOrLocation: 'Amity • Noida',
    readinessScore: 68,
    streakDays: 3,
    badgesCount: 2,
    rankChange: 2,
  },
  {
    id: 'peer-12',
    name: 'Rahul Gupta',
    avatarColor: 'bg-blue-600',
    targetRole: 'Sales Executive',
    collegeOrLocation: 'Lucknow University • Lucknow',
    readinessScore: 65,
    streakDays: 4,
    badgesCount: 1,
    rankChange: 0,
  },
];

export function getTierForScore(score: number): LeaderboardEntry['tier'] {
  if (score >= 90) return 'Elite (90+)';
  if (score >= 80) return 'Champion (80+)';
  if (score >= 70) return 'Pro (70+)';
  return 'Rising Star (<70)';
}

export function getLeaderboardData(
  user: User,
  profile: CareerProfile | null,
  score: ScoreBreakdown,
  filter: 'all' | 'same_role' | 'tier' = 'all'
): {
  entries: LeaderboardEntry[];
  currentUserRank: number;
  totalParticipants: number;
  topPercentile: number;
} {
  const checkIn = getDailyCheckIn(user.uid);
  const userStreak = checkIn?.streakCount || 1;

  const currentUserName = user.name || 'You';
  const targetJob = profile?.targetJob || 'Entry-Level Associate';
  const location = profile?.preferredCity ? `${profile.preferredCity}` : 'India';

  const userEntry: Omit<LeaderboardEntry, 'rank' | 'tier'> = {
    id: user.uid,
    name: `${currentUserName} (You)`,
    avatarColor: 'bg-indigo-600',
    targetRole: targetJob,
    collegeOrLocation: location,
    readinessScore: score.overallScore,
    streakDays: userStreak,
    badgesCount: score.overallScore > 75 ? 4 : score.overallScore > 50 ? 3 : 2,
    isCurrentUser: true,
    rankChange: 1,
  };

  let allPeers = [...PEER_STUDENTS];

  // If user target job is specialized, ensure there are peers in the same role
  if (targetJob && !allPeers.some((p) => p.targetRole.toLowerCase() === targetJob.toLowerCase())) {
    allPeers.push({
      id: 'peer-custom-role',
      name: 'Rhea Sen',
      avatarColor: 'bg-fuchsia-500',
      targetRole: targetJob,
      collegeOrLocation: 'NIT Trichy • Trichy',
      readinessScore: Math.min(95, score.overallScore + 6),
      streakDays: 9,
      badgesCount: 4,
      rankChange: 1,
    });
  }

  // Combine peers and user
  const combined = [...allPeers.map((p) => ({ ...p, isCurrentUser: false })), userEntry];

  // Sort by readiness score descending, secondary by streak days
  combined.sort((a, b) => {
    if (b.readinessScore !== a.readinessScore) {
      return b.readinessScore - a.readinessScore;
    }
    return b.streakDays - a.streakDays;
  });

  // Assign ranks and tiers
  const rankedAll: LeaderboardEntry[] = combined.map((item, index) => ({
    ...item,
    rank: index + 1,
    tier: getTierForScore(item.readinessScore),
  }));

  const userInRanked = rankedAll.find((e) => e.isCurrentUser);
  const currentUserRank = userInRanked ? userInRanked.rank : 1;
  const totalParticipants = 1450 + rankedAll.length; // simulated larger student pool
  const topPercentile = Math.max(1, Math.round((currentUserRank / (rankedAll.length * 1.2)) * 100));

  // Apply filters
  let filtered = rankedAll;
  if (filter === 'same_role') {
    filtered = rankedAll.filter(
      (e) =>
        e.isCurrentUser ||
        e.targetRole.toLowerCase().includes(targetJob.toLowerCase()) ||
        targetJob.toLowerCase().includes(e.targetRole.toLowerCase())
    );
  } else if (filter === 'tier') {
    const userTier = userInRanked?.tier;
    filtered = rankedAll.filter((e) => e.isCurrentUser || e.tier === userTier);
  }

  return {
    entries: filtered,
    currentUserRank,
    totalParticipants,
    topPercentile,
  };
}

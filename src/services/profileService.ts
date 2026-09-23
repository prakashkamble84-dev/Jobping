import { doc, getDoc, setDoc } from 'firebase/firestore';
import { CareerProfile } from '../types';
import { initFirebase } from './firebaseConfig';

const LOCAL_PROFILES_KEY = 'jobready_ai_career_profiles_v1';
const DEMO_USER_ID = 'demo-rahul-sharma-101';

function getLocalProfiles(): Record<string, CareerProfile> {
  try {
    const raw = localStorage.getItem(LOCAL_PROFILES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveLocalProfiles(profiles: Record<string, CareerProfile>) {
  localStorage.setItem(LOCAL_PROFILES_KEY, JSON.stringify(profiles));
}

export function getDefaultDemoProfile(): CareerProfile {
  const now = new Date().toISOString();
  return {
    uid: DEMO_USER_ID,
    careerGoal: 'I want to start my career as a sales executive.',
    jobPreference: 'First Job',
    education: 'Graduate', // B.Com
    experienceLevel: 'Fresher',
    targetJob: 'Sales Executive',
    preferredCity: 'Mumbai',
    preferredState: 'Maharashtra',
    workPreference: 'Office',
    salaryMin: '₹18,000 / month',
    salaryMax: '₹25,000 / month',
    skills: ['Communication', 'MS Excel', 'Customer Service', 'Sales'],
    languages: ['English', 'Hindi', 'Marathi'],
    careerObjective: 'Motivated B.Com graduate seeking an entry-level Sales Executive role to drive client relationships and commercial growth.',
    profileCompleted: true,
    createdAt: now,
    updatedAt: now,
  };
}

export async function getCareerProfile(uid: string): Promise<CareerProfile | null> {
  if (!uid) return null;

  const { db } = initFirebase();

  if (db) {
    try {
      const snap = await getDoc(doc(db, 'career_profiles', uid));
      if (snap.exists()) {
        return snap.data() as CareerProfile;
      }
    } catch (err) {
      console.warn('Could not read career profile from Firestore:', err);
    }
  }

  // Local fallback
  const profiles = getLocalProfiles();
  if (profiles[uid]) {
    return profiles[uid];
  }

  // If this is the demo account, initialize with demo data
  if (uid === DEMO_USER_ID) {
    const demoProfile = getDefaultDemoProfile();
    profiles[uid] = demoProfile;
    saveLocalProfiles(profiles);
    return demoProfile;
  }

  return null;
}

export async function saveCareerProfile(
  uid: string,
  profileData: Partial<CareerProfile>
): Promise<CareerProfile> {
  if (!uid) {
    throw new Error('User authentication required to save career profile.');
  }

  const now = new Date().toISOString();
  const existing = await getCareerProfile(uid);

  const updatedProfile: CareerProfile = {
    uid,
    careerGoal: profileData.careerGoal?.trim() || existing?.careerGoal || '',
    jobPreference: profileData.jobPreference || existing?.jobPreference || '',
    education: profileData.education || existing?.education || '',
    experienceLevel: profileData.experienceLevel || existing?.experienceLevel || '',
    targetJob: profileData.targetJob || existing?.targetJob || '',
    preferredCity: profileData.preferredCity?.trim() || existing?.preferredCity || '',
    preferredState: profileData.preferredState?.trim() || existing?.preferredState || '',
    workPreference: profileData.workPreference || existing?.workPreference || '',
    salaryMin: profileData.salaryMin || existing?.salaryMin || '',
    salaryMax: profileData.salaryMax || existing?.salaryMax || '',
    skills: profileData.skills || existing?.skills || [],
    languages: profileData.languages || existing?.languages || [],
    careerObjective: profileData.careerObjective?.trim() || existing?.careerObjective || '',
    profileCompleted:
      profileData.profileCompleted !== undefined
        ? profileData.profileCompleted
        : (existing?.profileCompleted ?? true),
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  };

  const { db } = initFirebase();
  if (db) {
    try {
      await setDoc(doc(db, 'career_profiles', uid), updatedProfile);
    } catch (err: unknown) {
      console.error('Firestore save failed, falling back to local mirror:', err);
    }
  }

  // Always mirror in local storage for instant responsiveness & offline support
  const profiles = getLocalProfiles();
  profiles[uid] = updatedProfile;
  saveLocalProfiles(profiles);

  return updatedProfile;
}

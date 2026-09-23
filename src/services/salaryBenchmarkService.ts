import { SalaryBenchmarkResult } from '../types';

export interface SalaryBenchmarkParams {
  targetJob: string;
  experienceLevel?: string;
  preferredCity?: string;
  preferredState?: string;
  education?: string;
  skills?: string[];
}

const STORAGE_PREFIX = 'jobready_salary_benchmark_';

export const POPULAR_INDIAN_CITIES = [
  'Bengaluru',
  'Pune',
  'Hyderabad',
  'Mumbai',
  'Delhi NCR',
  'Chennai',
  'Ahmedabad',
  'Kolkata',
  'Jaipur',
  'Indore',
  'Chandigarh',
  'Tier 2 / 3 City',
];

export const POPULAR_EXPERIENCE_LEVELS = [
  'Fresher (0–1 yrs)',
  'Junior (1–3 yrs)',
  'Mid-Level (3–5 yrs)',
  'Senior (5+ yrs)',
];

export async function fetchSalaryBenchmark(
  params: SalaryBenchmarkParams,
  forceRefresh = false
): Promise<SalaryBenchmarkResult> {
  const cacheKey = `${STORAGE_PREFIX}${encodeURIComponent(
    (params.targetJob || '').trim().toLowerCase()
  )}_${encodeURIComponent((params.preferredCity || 'all').trim().toLowerCase())}_${encodeURIComponent(
    (params.experienceLevel || 'fresher').trim().toLowerCase()
  )}`;

  if (!forceRefresh) {
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        // Cache valid for 3 days
        if (parsed.timestamp && Date.now() - parsed.timestamp < 3 * 24 * 60 * 60 * 1000) {
          return parsed.data;
        }
      }
    } catch {
      // ignore storage error
    }
  }

  const response = await fetch('/api/salary-benchmark', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch salary benchmark: ${response.statusText}`);
  }

  const data: SalaryBenchmarkResult = await response.json();

  try {
    localStorage.setItem(
      cacheKey,
      JSON.stringify({
        data,
        timestamp: Date.now(),
      })
    );
  } catch {
    // ignore
  }

  return data;
}

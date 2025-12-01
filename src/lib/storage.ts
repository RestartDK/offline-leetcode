// Storage utilities - problems in JSON file, solutions/settings in localStorage

import { Problem, UserSolution, sampleProblems } from '../data/problems';
import { ThemeName } from './themes';

const STORAGE_KEYS = {
  SOLUTIONS: 'leetcode-offline-solutions',
  SETTINGS: 'leetcode-offline-settings',
  PROBLEMS_CACHE: 'leetcode-offline-problems-cache', // Cache for problems loaded from JSON
} as const;

const PROBLEMS_JSON_PATH = '/problems.json';

// Cache for problems loaded from JSON file
let problemsCache: Problem[] | null = null;
let problemsLoadPromise: Promise<Problem[]> | null = null;

export interface Settings {
  theme: ThemeName;
  fontSize: number;
  editorMode: 'normal' | 'vim';
  tabSize: number;
}

const defaultSettings: Settings = {
  theme: 'default',
  fontSize: 14,
  editorMode: 'normal',
  tabSize: 4,
};

// Problems storage - loads from JSON file
export async function loadProblems(): Promise<Problem[]> {
  if (typeof window === 'undefined') return sampleProblems;
  
  // Return cached problems if available
  if (problemsCache) return problemsCache;
  
  // Return existing promise if already loading
  if (problemsLoadPromise) return problemsLoadPromise;
  
  // Try to load from cache first (for offline use)
  const cached = localStorage.getItem(STORAGE_KEYS.PROBLEMS_CACHE);
  if (cached) {
    try {
      problemsCache = JSON.parse(cached) as Problem[];
      return problemsCache;
    } catch {
      // Cache is invalid, continue to load from file
    }
  }
  
  // Load from JSON file
  problemsLoadPromise = (async () => {
    try {
      const response = await fetch(PROBLEMS_JSON_PATH);
      if (response.ok) {
        const problems = await response.json() as Problem[];
        problemsCache = problems;
        // Cache for offline use
        localStorage.setItem(STORAGE_KEYS.PROBLEMS_CACHE, JSON.stringify(problems));
        return problems;
      }
    } catch (error) {
      console.warn('Failed to load problems.json, using cache or sample problems:', error);
    }
    
    // Fallback to cached or sample problems
    if (cached) {
      try {
        problemsCache = JSON.parse(cached) as Problem[];
        return problemsCache;
      } catch {
        // Cache invalid, use samples
      }
    }
    
    problemsCache = sampleProblems;
    return problemsCache;
  })();
  
  return problemsLoadPromise;
}

// Synchronous getter (uses cache or sample problems as fallback)
export function getProblems(): Problem[] {
  if (typeof window === 'undefined') return sampleProblems;
  
  // Return cache if available
  if (problemsCache) return problemsCache;
  
  // Try to get from localStorage cache
  const cached = localStorage.getItem(STORAGE_KEYS.PROBLEMS_CACHE);
  if (cached) {
    try {
      problemsCache = JSON.parse(cached) as Problem[];
      return problemsCache;
    } catch {
      // Cache invalid
    }
  }
  
  // Fallback to sample problems
  return sampleProblems;
}

// Save problems - updates cache (doesn't auto-download)
export function saveProblems(problems: Problem[]): void {
  if (typeof window === 'undefined') return;
  
  // Update cache
  problemsCache = problems;
  localStorage.setItem(STORAGE_KEYS.PROBLEMS_CACHE, JSON.stringify(problems));
}

// Download problems as JSON file
export function downloadProblemsJSON(): void {
  const problems = getProblems();
  const json = JSON.stringify(problems, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'problems.json';
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function addProblem(problem: Problem): void {
  const problems = [...getProblems()]; // Create a copy
  const existingIndex = problems.findIndex(p => p.slug === problem.slug);
  
  if (existingIndex >= 0) {
    problems[existingIndex] = problem;
  } else {
    problems.push(problem);
  }
  
  saveProblems(problems);
}

export function getProblemBySlug(slug: string): Problem | undefined {
  const problems = getProblems();
  return problems.find(p => p.slug === slug);
}

export function markProblemSolved(slug: string, solved: boolean): void {
  const problems = [...getProblems()]; // Create a copy
  const problem = problems.find(p => p.slug === slug);
  if (problem) {
    problem.solved = solved;
    saveProblems(problems);
  }
}

// Solutions storage
export function getSolutions(): UserSolution[] {
  if (typeof window === 'undefined') return [];
  
  const stored = localStorage.getItem(STORAGE_KEYS.SOLUTIONS);
  if (!stored) return [];
  
  try {
    return JSON.parse(stored) as UserSolution[];
  } catch {
    return [];
  }
}

export function saveSolution(problemSlug: string, code: string): void {
  if (typeof window === 'undefined') return;
  
  const solutions = getSolutions();
  const existingIndex = solutions.findIndex(s => s.problemSlug === problemSlug);
  
  const solution: UserSolution = {
    problemSlug,
    code,
    lastModified: Date.now(),
  };
  
  if (existingIndex >= 0) {
    solutions[existingIndex] = solution;
  } else {
    solutions.push(solution);
  }
  
  localStorage.setItem(STORAGE_KEYS.SOLUTIONS, JSON.stringify(solutions));
}

export function getSolution(problemSlug: string): string | undefined {
  const solutions = getSolutions();
  const solution = solutions.find(s => s.problemSlug === problemSlug);
  return solution?.code;
}

// Settings storage
export function getSettings(): Settings {
  if (typeof window === 'undefined') return defaultSettings;
  
  const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  if (!stored) return defaultSettings;
  
  try {
    const parsed = JSON.parse(stored) as any;
    // Migrate old 'dark'/'light' theme values to 'default'
    if (parsed.theme === 'dark' || parsed.theme === 'light') {
      parsed.theme = 'default';
      // Save migrated settings
      saveSettings(parsed);
    }
    return { ...defaultSettings, ...parsed } as Settings;
  } catch {
    return defaultSettings;
  }
}

export function saveSettings(settings: Partial<Settings>): void {
  if (typeof window === 'undefined') return;
  
  const current = getSettings();
  const updated = { ...current, ...settings };
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
}

export function resetSettings(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(defaultSettings));
}

// Export/Import utilities
export function exportProblems(): string {
  const problems = getProblems();
  return JSON.stringify(problems, null, 2);
}

export function importProblems(jsonString: string): { success: boolean; count: number; error?: string } {
  try {
    const imported = JSON.parse(jsonString) as Problem[];
    
    if (!Array.isArray(imported)) {
      return { success: false, count: 0, error: 'Invalid format: expected an array' };
    }
    
    const problems = [...getProblems()]; // Create a copy
    let addedCount = 0;
    
    for (const problem of imported) {
      if (!problem.slug || !problem.title) {
        continue;
      }
      
      const existingIndex = problems.findIndex(p => p.slug === problem.slug);
      if (existingIndex >= 0) {
        problems[existingIndex] = problem;
      } else {
        problems.push(problem);
        addedCount++;
      }
    }
    
    saveProblems(problems);
    return { success: true, count: addedCount };
  } catch (e) {
    return { success: false, count: 0, error: 'Invalid JSON format' };
  }
}

// Reload problems from JSON file (useful after manual file edit)
export async function reloadProblems(): Promise<void> {
  problemsCache = null;
  problemsLoadPromise = null;
  await loadProblems();
}


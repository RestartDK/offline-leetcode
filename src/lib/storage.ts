// localStorage utilities for problems and settings

import { Problem, UserSolution, sampleProblems } from '../data/problems';

const STORAGE_KEYS = {
  PROBLEMS: 'leetcode-offline-problems',
  SOLUTIONS: 'leetcode-offline-solutions',
  SETTINGS: 'leetcode-offline-settings',
} as const;

export interface Settings {
  theme: 'dark' | 'light';
  fontSize: number;
  editorMode: 'normal' | 'vim';
  tabSize: number;
}

const defaultSettings: Settings = {
  theme: 'dark',
  fontSize: 14,
  editorMode: 'normal',
  tabSize: 4,
};

// Problems storage
export function getProblems(): Problem[] {
  if (typeof window === 'undefined') return sampleProblems;
  
  const stored = localStorage.getItem(STORAGE_KEYS.PROBLEMS);
  if (!stored) {
    // Initialize with sample problems
    localStorage.setItem(STORAGE_KEYS.PROBLEMS, JSON.stringify(sampleProblems));
    return sampleProblems;
  }
  
  try {
    return JSON.parse(stored) as Problem[];
  } catch {
    return sampleProblems;
  }
}

export function saveProblems(problems: Problem[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.PROBLEMS, JSON.stringify(problems));
}

export function addProblem(problem: Problem): void {
  const problems = getProblems();
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
  const problems = getProblems();
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
    return { ...defaultSettings, ...JSON.parse(stored) } as Settings;
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
    
    const problems = getProblems();
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


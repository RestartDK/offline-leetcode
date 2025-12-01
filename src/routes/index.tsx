import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { ProblemTable } from '../components/ProblemTable';
import { getProblems, loadProblems } from '../lib/storage';
import { Problem } from '../data/problems';

export const Route = createFileRoute('/')({ component: HomePage });

function HomePage() {
  const [problems, setProblems] = useState<Problem[]>([]);

  useEffect(() => {
    // Load problems from JSON file
    loadProblems().then(setProblems).catch(() => {
      // Fallback to synchronous getter if async load fails
      setProblems(getProblems());
    });
  }, []);

  return (
    <div className="min-h-screen bg-lc-fill-1">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Problems</h1>
          <p className="text-gray-400">
            Practice coding problems offline. {problems.length} problems available.
          </p>
        </div>

        {/* Topic Tags Quick Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {['Array', 'String', 'Hash Table', 'Dynamic Programming', 'Math', 'Stack'].map(tag => (
            <span
              key={tag}
              className="px-3 py-1.5 bg-lc-fill-3 text-gray-300 rounded-full text-sm hover:bg-lc-fill-4 cursor-pointer transition-colors"
            >
              {tag}
            </span>
          ))}
          <span className="px-3 py-1.5 text-gray-500 text-sm">
            Expand ↓
          </span>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-lc-fill-2 rounded-lg p-4 border border-lc-border">
            <div className="text-3xl font-bold text-white mb-1">
              {problems.filter(p => p.solved).length}
            </div>
            <div className="text-gray-400 text-sm">Solved</div>
            <div className="mt-2 h-1 bg-lc-fill-3 rounded overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded"
                style={{
                  width: `${problems.length > 0 ? (problems.filter(p => p.solved).length / problems.length) * 100 : 0}%`,
                }}
              />
            </div>
          </div>

          <div className="bg-lc-fill-2 rounded-lg p-4 border border-lc-border">
            <div className="flex items-baseline gap-2">
              <span className="text-emerald-500 font-semibold">
                {problems.filter(p => p.difficulty === 'Easy').length}
              </span>
              <span className="text-gray-400 text-sm">Easy</span>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-amber-500 font-semibold">
                {problems.filter(p => p.difficulty === 'Medium').length}
              </span>
              <span className="text-gray-400 text-sm">Medium</span>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-red-500 font-semibold">
                {problems.filter(p => p.difficulty === 'Hard').length}
              </span>
              <span className="text-gray-400 text-sm">Hard</span>
            </div>
          </div>

          <div className="bg-lc-fill-2 rounded-lg p-4 border border-lc-border">
            <div className="text-3xl font-bold text-white mb-1">
              {problems.length}
            </div>
            <div className="text-gray-400 text-sm">Total Problems</div>
            <div className="text-gray-500 text-xs mt-2">
              Stored locally for offline practice
            </div>
          </div>
        </div>

        {/* Problem Table */}
        <ProblemTable problems={problems} />
      </div>
    </div>
  );
}

import { Problem } from '../data/problems';
import { Check, ThumbsUp, ThumbsDown, Bookmark, Share2 } from 'lucide-react';

interface ProblemDescriptionProps {
  problem: Problem;
}

const difficultyColors = {
  Easy: 'text-emerald-500 bg-emerald-500/10',
  Medium: 'text-amber-500 bg-amber-500/10',
  Hard: 'text-red-500 bg-red-500/10',
};

export function ProblemDescription({ problem }: ProblemDescriptionProps) {
  return (
    <div className="h-full flex flex-col bg-lc-fill-2">
      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Title and difficulty */}
        <div className="mb-4">
          <h1 className="text-xl font-semibold text-white mb-2">
            {problem.id}. {problem.title}
          </h1>
          <div className="flex items-center gap-3">
            <span className={`px-2.5 py-1 rounded text-sm font-medium ${difficultyColors[problem.difficulty]}`}>
              {problem.difficulty}
            </span>
            {problem.solved && (
              <span className="flex items-center gap-1 text-emerald-500 text-sm">
                <Check className="w-4 h-4" />
                Solved
              </span>
            )}
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-6">
          {problem.tags.map(tag => (
            <span
              key={tag}
              className="px-2.5 py-1 bg-lc-fill-3 text-gray-400 rounded text-sm hover:bg-lc-fill-4 cursor-pointer transition-colors"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Description */}
        <div
          className="problem-description mb-6"
          dangerouslySetInnerHTML={{ __html: problem.description }}
        />

        {/* Examples */}
        <div className="space-y-4 mb-6">
          {problem.examples.map((example, index) => (
            <div key={index} className="bg-lc-fill-3 rounded-lg p-4">
              <div className="text-sm font-semibold text-white mb-2">
                Example {index + 1}:
              </div>
              <div className="font-mono text-sm space-y-1">
                <div>
                  <span className="text-gray-400">Input: </span>
                  <span className="text-gray-200">{example.input}</span>
                </div>
                <div>
                  <span className="text-gray-400">Output: </span>
                  <span className="text-gray-200">{example.output}</span>
                </div>
                {example.explanation && (
                  <div className="mt-2 text-gray-400">
                    <span className="font-semibold">Explanation: </span>
                    {example.explanation}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Constraints */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-white mb-2">Constraints:</h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-300">
            {problem.constraints.map((constraint, index) => (
              <li key={index} dangerouslySetInnerHTML={{ __html: constraint }} />
            ))}
          </ul>
        </div>

        {/* Acceptance rate */}
        {problem.acceptance && (
          <div className="text-sm text-gray-400">
            Acceptance Rate: <span className="text-gray-200">{problem.acceptance.toFixed(1)}%</span>
          </div>
        )}
      </div>

      {/* Bottom actions */}
      <div className="border-t border-lc-border p-4 flex items-center gap-4">
        <button className="flex items-center gap-1.5 text-gray-400 hover:text-gray-200 transition-colors">
          <ThumbsUp className="w-4 h-4" />
          <span className="text-sm">Like</span>
        </button>
        <button className="flex items-center gap-1.5 text-gray-400 hover:text-gray-200 transition-colors">
          <ThumbsDown className="w-4 h-4" />
          <span className="text-sm">Dislike</span>
        </button>
        <button className="flex items-center gap-1.5 text-gray-400 hover:text-gray-200 transition-colors">
          <Bookmark className="w-4 h-4" />
          <span className="text-sm">Save</span>
        </button>
        <button className="flex items-center gap-1.5 text-gray-400 hover:text-gray-200 transition-colors">
          <Share2 className="w-4 h-4" />
          <span className="text-sm">Share</span>
        </button>
      </div>
    </div>
  );
}


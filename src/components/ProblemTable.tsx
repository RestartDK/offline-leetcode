import { useState, useMemo } from 'react';
import { Link } from '@tanstack/react-router';
import { Search, ChevronDown, Check, X } from 'lucide-react';
import { Problem, Difficulty } from '../data/problems';

interface ProblemTableProps {
  problems: Problem[];
}

const difficultyColors: Record<Difficulty, string> = {
  Easy: 'text-emerald-500',
  Medium: 'text-amber-500',
  Hard: 'text-red-500',
};

const difficultyBgColors: Record<Difficulty, string> = {
  Easy: 'bg-emerald-500/10',
  Medium: 'bg-amber-500/10',
  Hard: 'bg-red-500/10',
};

export function ProblemTable({ problems }: ProblemTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | 'All'>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Solved' | 'Unsolved'>('All');
  const [sortField, setSortField] = useState<'id' | 'title' | 'difficulty' | 'acceptance'>('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Get unique tags from all problems
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    problems.forEach(p => p.tags.forEach(t => tags.add(t)));
    return Array.from(tags).sort();
  }, [problems]);

  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [showTagDropdown, setShowTagDropdown] = useState(false);

  // Filter and sort problems
  const filteredProblems = useMemo(() => {
    let result = [...problems];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        p =>
          p.title.toLowerCase().includes(query) ||
          p.id.toString().includes(query) ||
          p.tags.some(t => t.toLowerCase().includes(query))
      );
    }

    // Difficulty filter
    if (difficultyFilter !== 'All') {
      result = result.filter(p => p.difficulty === difficultyFilter);
    }

    // Status filter
    if (statusFilter === 'Solved') {
      result = result.filter(p => p.solved);
    } else if (statusFilter === 'Unsolved') {
      result = result.filter(p => !p.solved);
    }

    // Tag filter
    if (selectedTags.size > 0) {
      result = result.filter(p => p.tags.some(t => selectedTags.has(t)));
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'id':
          comparison = a.id - b.id;
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'difficulty': {
          const difficultyOrder = { Easy: 1, Medium: 2, Hard: 3 };
          comparison = difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
          break;
        }
        case 'acceptance':
          comparison = (a.acceptance || 0) - (b.acceptance || 0);
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [problems, searchQuery, difficultyFilter, statusFilter, selectedTags, sortField, sortDirection]);

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => {
      const newSet = new Set(prev);
      if (newSet.has(tag)) {
        newSet.delete(tag);
      } else {
        newSet.add(tag);
      }
      return newSet;
    });
  };

  return (
    <div className="w-full">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-[400px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search questions"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-lc-fill-3 border border-lc-border rounded-lg text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-lc-accent focus:ring-1 focus:ring-lc-accent"
          />
        </div>

        {/* Difficulty Filter */}
        <select
          value={difficultyFilter}
          onChange={e => setDifficultyFilter(e.target.value as Difficulty | 'All')}
          className="px-3 py-2 bg-lc-fill-3 border border-lc-border rounded-lg text-sm text-gray-200 focus:outline-none focus:border-lc-accent cursor-pointer"
        >
          <option value="All">All Difficulties</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as 'All' | 'Solved' | 'Unsolved')}
          className="px-3 py-2 bg-lc-fill-3 border border-lc-border rounded-lg text-sm text-gray-200 focus:outline-none focus:border-lc-accent cursor-pointer"
        >
          <option value="All">All Status</option>
          <option value="Solved">Solved</option>
          <option value="Unsolved">Unsolved</option>
        </select>

        {/* Tags Filter */}
        <div className="relative">
          <button
            onClick={() => setShowTagDropdown(!showTagDropdown)}
            className="flex items-center gap-2 px-3 py-2 bg-lc-fill-3 border border-lc-border rounded-lg text-sm text-gray-200 hover:bg-lc-fill-2 transition-colors"
          >
            Tags {selectedTags.size > 0 && `(${selectedTags.size})`}
            <ChevronDown className="w-4 h-4" />
          </button>

          {showTagDropdown && (
            <div className="absolute top-full left-0 mt-2 w-64 max-h-64 overflow-y-auto bg-lc-fill-2 border border-lc-border rounded-lg shadow-lg z-50">
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left text-gray-200 hover:bg-lc-fill-3 transition-colors"
                >
                  <span
                    className={`w-4 h-4 rounded border flex items-center justify-center ${
                      selectedTags.has(tag)
                        ? 'bg-lc-accent border-lc-accent'
                        : 'border-gray-600'
                    }`}
                  >
                    {selectedTags.has(tag) && <Check className="w-3 h-3 text-white" />}
                  </span>
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Clear filters */}
        {(searchQuery || difficultyFilter !== 'All' || statusFilter !== 'All' || selectedTags.size > 0) && (
          <button
            onClick={() => {
              setSearchQuery('');
              setDifficultyFilter('All');
              setStatusFilter('All');
              setSelectedTags(new Set());
            }}
            className="flex items-center gap-1 px-3 py-2 text-sm text-gray-400 hover:text-gray-200 transition-colors"
          >
            <X className="w-4 h-4" />
            Clear
          </button>
        )}
      </div>

      {/* Results count */}
      <div className="text-sm text-gray-500 mb-3">
        {filteredProblems.length} / {problems.length} problems
      </div>

      {/* Table */}
      <div className="bg-lc-fill-2 rounded-lg border border-lc-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-lc-border text-gray-400 text-sm">
              <th className="w-12 px-4 py-3 text-left">Status</th>
              <th
                className="px-4 py-3 text-left cursor-pointer hover:text-gray-200 transition-colors"
                onClick={() => handleSort('title')}
              >
                <span className="flex items-center gap-1">
                  Title
                  {sortField === 'title' && (
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        sortDirection === 'desc' ? 'rotate-180' : ''
                      }`}
                    />
                  )}
                </span>
              </th>
              <th
                className="w-24 px-4 py-3 text-left cursor-pointer hover:text-gray-200 transition-colors"
                onClick={() => handleSort('acceptance')}
              >
                <span className="flex items-center gap-1">
                  Acceptance
                  {sortField === 'acceptance' && (
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        sortDirection === 'desc' ? 'rotate-180' : ''
                      }`}
                    />
                  )}
                </span>
              </th>
              <th
                className="w-24 px-4 py-3 text-left cursor-pointer hover:text-gray-200 transition-colors"
                onClick={() => handleSort('difficulty')}
              >
                <span className="flex items-center gap-1">
                  Difficulty
                  {sortField === 'difficulty' && (
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        sortDirection === 'desc' ? 'rotate-180' : ''
                      }`}
                    />
                  )}
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredProblems.map((problem, index) => (
              <tr
                key={problem.slug}
                className={`border-b border-lc-border last:border-b-0 hover:bg-lc-fill-3 transition-colors ${
                  index % 2 === 0 ? 'bg-lc-fill-2' : 'bg-lc-fill-1'
                }`}
              >
                <td className="px-4 py-3">
                  {problem.solved ? (
                    <Check className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <span className="w-5 h-5 block" />
                  )}
                </td>
                <td className="px-4 py-3">
                  <Link
                    to="/problem/$slug"
                    params={{ slug: problem.slug }}
                    className="flex items-center gap-3 group"
                  >
                    <span className="text-gray-500">{problem.id}.</span>
                    <span className="text-gray-200 group-hover:text-lc-accent transition-colors">
                      {problem.title}
                    </span>
                  </Link>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {problem.tags.slice(0, 3).map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 text-xs bg-lc-fill-3 text-gray-400 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                    {problem.tags.length > 3 && (
                      <span className="px-2 py-0.5 text-xs text-gray-500">
                        +{problem.tags.length - 3}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-400 text-sm">
                  {problem.acceptance?.toFixed(1)}%
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 text-sm rounded ${difficultyColors[problem.difficulty]} ${difficultyBgColors[problem.difficulty]}`}
                  >
                    {problem.difficulty}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredProblems.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No problems found matching your criteria
          </div>
        )}
      </div>
    </div>
  );
}


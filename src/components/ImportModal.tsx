import { useState } from 'react';
import { X, Link as LinkIcon, Loader2, Check, AlertCircle, FileJson } from 'lucide-react';
import { scrapeProblem, isValidLeetCodeUrl } from '../lib/scraper';
import { importProblems, exportProblems } from '../lib/storage';
import { Problem } from '../data/problems';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: () => void;
}

type ImportMethod = 'url' | 'json';

export function ImportModal({ isOpen, onClose, onImportSuccess }: ImportModalProps) {
  const [method, setMethod] = useState<ImportMethod>('url');
  const [url, setUrl] = useState('');
  const [jsonInput, setJsonInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    problem?: Problem;
  } | null>(null);

  const handleUrlImport = async () => {
    if (!url.trim()) return;

    if (!isValidLeetCodeUrl(url)) {
      setResult({
        success: false,
        message: 'Invalid LeetCode URL. Please use a URL like: https://leetcode.com/problems/two-sum/',
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const { success, problem, error } = await scrapeProblem(url);
      
      if (success && problem) {
        setResult({
          success: true,
          message: `Successfully imported "${problem.title}"!`,
          problem,
        });
        setUrl('');
        onImportSuccess();
      } else {
        setResult({
          success: false,
          message: error || 'Failed to import problem',
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleJsonImport = () => {
    if (!jsonInput.trim()) return;

    setIsLoading(true);
    setResult(null);

    try {
      const { success, count, error } = importProblems(jsonInput);
      
      if (success) {
        setResult({
          success: true,
          message: `Successfully imported ${count} problem(s)!`,
        });
        setJsonInput('');
        onImportSuccess();
      } else {
        setResult({
          success: false,
          message: error || 'Failed to import problems',
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    const json = exportProblems();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'leetcode-problems.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-2xl" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-lc-border">
          <h2 className="text-lg font-semibold text-white">Import Problems</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Method tabs */}
        <div className="flex border-b border-lc-border">
          <button
            onClick={() => setMethod('url')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
              method === 'url'
                ? 'text-white border-b-2 border-lc-accent'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <LinkIcon className="w-4 h-4" />
            From LeetCode URL
          </button>
          <button
            onClick={() => setMethod('json')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
              method === 'json'
                ? 'text-white border-b-2 border-lc-accent'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <FileJson className="w-4 h-4" />
            From JSON
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {method === 'url' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  LeetCode Problem URL
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  placeholder="https://leetcode.com/problems/two-sum/"
                  className="w-full px-3 py-2 bg-lc-fill-3 border border-lc-border rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:border-lc-accent"
                />
                <p className="mt-2 text-xs text-gray-500">
                  Paste a LeetCode problem URL to import it. Note: This requires an internet connection and may not work if LeetCode blocks the request.
                </p>
              </div>

              <button
                onClick={handleUrlImport}
                disabled={isLoading || !url.trim()}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-lc-accent text-black rounded-lg font-medium hover:bg-lc-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Importing...
                  </>
                ) : (
                  'Import Problem'
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Problems JSON
                </label>
                <textarea
                  value={jsonInput}
                  onChange={e => setJsonInput(e.target.value)}
                  placeholder={`Paste JSON array of problems here...\n\n[\n  {\n    "id": 1,\n    "slug": "two-sum",\n    "title": "Two Sum",\n    ...\n  }\n]`}
                  className="w-full h-48 px-3 py-2 bg-lc-fill-3 border border-lc-border rounded-lg text-gray-200 placeholder-gray-500 font-mono text-sm resize-none focus:outline-none focus:border-lc-accent"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleJsonImport}
                  disabled={isLoading || !jsonInput.trim()}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-lc-accent text-black rounded-lg font-medium hover:bg-lc-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    'Import from JSON'
                  )}
                </button>
                <button
                  onClick={handleExport}
                  className="px-4 py-2 bg-lc-fill-3 text-gray-200 rounded-lg font-medium hover:bg-lc-fill-4 transition-colors"
                >
                  Export Current
                </button>
              </div>
            </div>
          )}

          {/* Result message */}
          {result && (
            <div className={`mt-4 p-3 rounded-lg flex items-start gap-2 ${
              result.success
                ? 'bg-emerald-500/10 border border-emerald-500/30'
                : 'bg-red-500/10 border border-red-500/30'
            }`}>
              {result.success ? (
                <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <p className={result.success ? 'text-emerald-400' : 'text-red-400'}>
                  {result.message}
                </p>
                {result.problem && (
                  <p className="text-sm text-gray-400 mt-1">
                    Difficulty: {result.problem.difficulty} | Tags: {result.problem.tags.join(', ')}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


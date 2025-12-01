import { useState } from 'react';
import { Play, Plus, X, Check, AlertCircle, Loader2 } from 'lucide-react';
import { TestCase } from '../data/problems';
import { ExecutionResult } from '../lib/pyodide';

interface TestCasesProps {
  testCases: TestCase[];
  onRun: (testCases: TestCase[]) => void;
  results: ExecutionResult[] | null;
  isRunning: boolean;
  pyodideLoading: boolean;
}

export function TestCases({ testCases, onRun, results, isRunning, pyodideLoading }: TestCasesProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [customCases, setCustomCases] = useState<TestCase[]>([]);
  const [showCustom, setShowCustom] = useState(false);
  const [customInput, setCustomInput] = useState('');

  const allCases = [...testCases, ...customCases];
  const currentCase = allCases[activeTab];
  const currentResult = results?.[activeTab];

  const handleAddCustomCase = () => {
    if (!customInput.trim()) return;
    
    setCustomCases(prev => [...prev, { input: customInput.trim(), expected: '' }]);
    setCustomInput('');
    setShowCustom(false);
    setActiveTab(allCases.length);
  };

  const handleRemoveCustomCase = (index: number) => {
    const customIndex = index - testCases.length;
    if (customIndex >= 0) {
      setCustomCases(prev => prev.filter((_, i) => i !== customIndex));
      if (activeTab >= allCases.length - 1) {
        setActiveTab(Math.max(0, activeTab - 1));
      }
    }
  };

  const handleRun = () => {
    onRun(allCases);
  };

  // Calculate overall status
  const overallStatus = results
    ? results.every(r => r.passed) ? 'passed' : results.some(r => !r.success) ? 'error' : 'failed'
    : null;

  return (
    <div className="h-full flex flex-col bg-lc-fill-2 border-t border-lc-border">
      {/* Header with tabs */}
      <div className="flex items-center justify-between border-b border-lc-border px-2">
        <div className="flex items-center overflow-x-auto">
          {allCases.map((tc, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm whitespace-nowrap border-b-2 transition-colors ${
                activeTab === index
                  ? 'text-white border-lc-accent'
                  : 'text-gray-400 border-transparent hover:text-gray-200'
              }`}
            >
              {results && results[index] && (
                results[index].passed ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : results[index].success ? (
                  <X className="w-3.5 h-3.5 text-red-500" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                )
              )}
              Case {index + 1}
              {index >= testCases.length && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveCustomCase(index);
                  }}
                  className="ml-1 text-gray-500 hover:text-red-400"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </button>
          ))}
          <button
            onClick={() => setShowCustom(true)}
            className="flex items-center gap-1 px-3 py-2 text-sm text-gray-400 hover:text-gray-200 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Run button */}
        <button
          onClick={handleRun}
          disabled={isRunning || pyodideLoading}
          className="flex items-center gap-2 px-4 py-1.5 bg-lc-fill-3 hover:bg-lc-fill-4 text-white rounded text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed mr-2"
        >
          {isRunning ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Play className="w-4 h-4" />
          )}
          {pyodideLoading ? 'Loading Python...' : isRunning ? 'Running...' : 'Run'}
        </button>
      </div>

      {/* Custom input modal */}
      {showCustom && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-lc-fill-2 rounded-lg border border-lc-border p-4 w-96 shadow-xl">
            <h3 className="text-white font-medium mb-3">Add Custom Test Case</h3>
            <textarea
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="Enter input (e.g., [[1,2,3], 5])"
              className="w-full h-24 px-3 py-2 bg-lc-fill-3 border border-lc-border rounded text-sm text-gray-200 placeholder-gray-500 resize-none focus:outline-none focus:border-lc-accent"
            />
            <div className="flex justify-end gap-2 mt-3">
              <button
                onClick={() => setShowCustom(false)}
                className="px-3 py-1.5 text-sm text-gray-400 hover:text-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCustomCase}
                className="px-3 py-1.5 bg-lc-accent text-black rounded text-sm font-medium hover:bg-lc-accent-hover"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Test case content */}
      <div className="flex-1 overflow-y-auto p-4">
        {currentCase && (
          <div className="space-y-4">
            {/* Input */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">Input</label>
              <div className="bg-lc-fill-3 rounded p-3 font-mono text-sm text-gray-200">
                {currentCase.input}
              </div>
            </div>

            {/* Expected output */}
            {currentCase.expected && (
              <div>
                <label className="block text-sm text-gray-400 mb-1">Expected Output</label>
                <div className="bg-lc-fill-3 rounded p-3 font-mono text-sm text-gray-200">
                  {currentCase.expected}
                </div>
              </div>
            )}

            {/* Actual output */}
            {currentResult && (
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  {currentResult.success ? 'Output' : 'Error'}
                </label>
                <div className={`rounded p-3 font-mono text-sm ${
                  currentResult.success
                    ? currentResult.passed
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : 'bg-red-500/10 text-red-400 border border-red-500/30'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                }`}>
                  {currentResult.success ? currentResult.output : currentResult.error}
                </div>
              </div>
            )}

            {/* Execution time */}
            {currentResult && (
              <div className="text-xs text-gray-500">
                Execution time: {currentResult.executionTime.toFixed(2)}ms
              </div>
            )}
          </div>
        )}
      </div>

      {/* Overall result summary */}
      {results && results.length > 0 && (
        <div className={`border-t border-lc-border p-3 ${
          overallStatus === 'passed' ? 'bg-emerald-500/10' :
          overallStatus === 'error' ? 'bg-amber-500/10' : 'bg-red-500/10'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {overallStatus === 'passed' ? (
                <Check className="w-5 h-5 text-emerald-500" />
              ) : overallStatus === 'error' ? (
                <AlertCircle className="w-5 h-5 text-amber-500" />
              ) : (
                <X className="w-5 h-5 text-red-500" />
              )}
              <span className={`font-medium ${
                overallStatus === 'passed' ? 'text-emerald-500' :
                overallStatus === 'error' ? 'text-amber-500' : 'text-red-500'
              }`}>
                {overallStatus === 'passed' ? 'All Tests Passed!' :
                 overallStatus === 'error' ? 'Runtime Error' : 'Tests Failed'}
              </span>
            </div>
            <span className="text-sm text-gray-400">
              {results.filter(r => r.passed).length} / {results.length} passed
            </span>
          </div>
        </div>
      )}
    </div>
  );
}


import { createFileRoute, Link, notFound } from '@tanstack/react-router';
import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw, Settings } from 'lucide-react';
import { ProblemDescription } from '../components/ProblemDescription';
import { CodeEditor } from '../components/CodeEditor';
import { TestCases } from '../components/TestCases';
import { getProblemBySlug, getSolution, saveSolution, getProblems, markProblemSolved, loadProblems } from '../lib/storage';
import { runAllTestCases, isPyodideLoaded, initPyodide, ExecutionResult } from '../lib/pyodide';
import { TestCase } from '../data/problems';

export const Route = createFileRoute('/problem/$slug')({
  component: ProblemPage,
  loader: ({ params }) => {
    const problem = getProblemBySlug(params.slug);
    if (!problem) {
      throw notFound();
    }
    return { problem };
  },
  notFoundComponent: () => (
    <div className="min-h-screen bg-lc-fill-1 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white mb-2">Problem Not Found</h1>
        <p className="text-gray-400 mb-4">The problem you're looking for doesn't exist.</p>
        <Link to="/" className="btn btn-primary">
          Back to Problems
        </Link>
      </div>
    </div>
  ),
});

function ProblemPage() {
  const { problem } = Route.useLoaderData();
  const [code, setCode] = useState(problem.starterCode);
  const [results, setResults] = useState<ExecutionResult[] | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [pyodideLoading, setPyodideLoading] = useState(false);
  const [leftPanelWidth, setLeftPanelWidth] = useState(45);
  const [isResizingHorizontal, setIsResizingHorizontal] = useState(false);
  const [bottomPanelHeight, setBottomPanelHeight] = useState(250);
  const [isResizingVertical, setIsResizingVertical] = useState(false);

  // Load saved solution
  useEffect(() => {
    const saved = getSolution(problem.slug);
    if (saved) {
      setCode(saved);
    } else {
      setCode(problem.starterCode);
    }
    setResults(null);
  }, [problem.slug, problem.starterCode]);

  // Auto-save solution
  useEffect(() => {
    const timer = setTimeout(() => {
      saveSolution(problem.slug, code);
    }, 1000);
    return () => clearTimeout(timer);
  }, [code, problem.slug]);

  // Initialize Pyodide on first load
  useEffect(() => {
    if (!isPyodideLoaded()) {
      setPyodideLoading(true);
      initPyodide()
        .then(() => setPyodideLoading(false))
        .catch(() => setPyodideLoading(false));
    }
  }, []);

  // Handle horizontal resize (left/right panels)
  const handleHorizontalMouseDown = useCallback(() => {
    setIsResizingHorizontal(true);
  }, []);

  // Handle vertical resize (editor/test cases)
  const handleVerticalMouseDown = useCallback(() => {
    setIsResizingVertical(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizingHorizontal) {
        const container = document.getElementById('problem-container');
        if (!container) return;
        
        const rect = container.getBoundingClientRect();
        const newWidth = ((e.clientX - rect.left) / rect.width) * 100;
        setLeftPanelWidth(Math.min(Math.max(newWidth, 25), 75));
      }
      
      if (isResizingVertical) {
        const rightPanel = document.getElementById('right-panel');
        if (!rightPanel) return;
        
        const rect = rightPanel.getBoundingClientRect();
        const newHeight = rect.bottom - e.clientY;
        setBottomPanelHeight(Math.min(Math.max(newHeight, 100), rect.height - 100));
      }
    };

    const handleMouseUp = () => {
      setIsResizingHorizontal(false);
      setIsResizingVertical(false);
    };

    if (isResizingHorizontal || isResizingVertical) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizingHorizontal, isResizingVertical]);

  // Run tests
  const handleRunTests = useCallback(async (testCases: TestCase[]) => {
    setIsRunning(true);
    setResults(null);

    try {
      const { results: testResults, allPassed } = await runAllTestCases(code, testCases);
      setResults(testResults);

      // Mark as solved if all tests pass
      if (allPassed) {
        markProblemSolved(problem.slug, true);
      }
    } catch (error) {
      console.error('Error running tests:', error);
    } finally {
      setIsRunning(false);
    }
  }, [code, problem.slug]);

  // Reset code to starter
  const handleReset = useCallback(() => {
    if (confirm('Reset code to starter template? Your changes will be lost.')) {
      setCode(problem.starterCode);
      setResults(null);
    }
  }, [problem.starterCode]);

  // Navigation to prev/next problem
  const [problems, setProblems] = useState(getProblems());
  
  useEffect(() => {
    loadProblems().then(setProblems).catch(() => {
      setProblems(getProblems());
    });
  }, []);
  
  const currentIndex = problems.findIndex(p => p.slug === problem.slug);
  const prevProblem = currentIndex > 0 ? problems[currentIndex - 1] : null;
  const nextProblem = currentIndex < problems.length - 1 ? problems[currentIndex + 1] : null;

  return (
    <div className="h-[calc(100vh-56px)] flex flex-col bg-lc-fill-1">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-lc-fill-2 border-b border-lc-border">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors">
            <ChevronLeft className="w-4 h-4" />
            <span className="text-sm">Problem List</span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          {prevProblem && (
            <Link
              to="/problem/$slug"
              params={{ slug: prevProblem.slug }}
              className="p-2 text-gray-400 hover:text-white hover:bg-lc-fill-3 rounded transition-colors"
              title={`Previous: ${prevProblem.title}`}
            >
              <ChevronLeft className="w-4 h-4" />
            </Link>
          )}
          {nextProblem && (
            <Link
              to="/problem/$slug"
              params={{ slug: nextProblem.slug }}
              className="p-2 text-gray-400 hover:text-white hover:bg-lc-fill-3 rounded transition-colors"
              title={`Next: ${nextProblem.title}`}
            >
              <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-gray-400 hover:text-white hover:bg-lc-fill-3 rounded text-sm transition-colors"
            title="Reset code"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>
          <Link
            to="/settings"
            className="p-2 text-gray-400 hover:text-white hover:bg-lc-fill-3 rounded transition-colors"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Main content */}
      <div
        id="problem-container"
        className="flex-1 flex overflow-hidden"
        style={{ 
          cursor: isResizingHorizontal ? 'col-resize' : isResizingVertical ? 'row-resize' : 'default' 
        }}
      >
        {/* Left panel - Problem description */}
        <div
          className="h-full overflow-hidden border-r border-lc-border"
          style={{ width: `${leftPanelWidth}%` }}
        >
          <ProblemDescription problem={problem} />
        </div>

        {/* Horizontal resize handle */}
        <div
          className="w-1 bg-lc-border hover:bg-lc-accent cursor-col-resize transition-colors flex-shrink-0"
          onMouseDown={handleHorizontalMouseDown}
        />

        {/* Right panel - Editor and test cases */}
        <div
          id="right-panel"
          className="h-full flex flex-col overflow-hidden"
          style={{ width: `${100 - leftPanelWidth}%` }}
        >
          {/* Editor header */}
          <div className="flex items-center justify-between px-4 py-2 bg-lc-fill-2 border-b border-lc-border">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-200">Python 3</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              {pyodideLoading ? (
                <span className="flex items-center gap-1">
                  <span className="status-dot loading" />
                  Loading Python runtime...
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <span className="status-dot success" />
                  Python ready
                </span>
              )}
            </div>
          </div>

          {/* Code editor */}
          <div className="flex-1 overflow-hidden min-h-[100px]">
            <CodeEditor
              value={code}
              onChange={setCode}
              className="h-full"
            />
          </div>

          {/* Vertical resize handle */}
          <div
            className="h-1 bg-lc-border hover:bg-lc-accent cursor-row-resize transition-colors flex-shrink-0"
            onMouseDown={handleVerticalMouseDown}
          />

          {/* Test cases panel */}
          <div 
            className="flex-shrink-0 overflow-hidden"
            style={{ height: `${bottomPanelHeight}px` }}
          >
            <TestCases
              testCases={problem.testCases}
              onRun={handleRunTests}
              results={results}
              isRunning={isRunning}
              pyodideLoading={pyodideLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}


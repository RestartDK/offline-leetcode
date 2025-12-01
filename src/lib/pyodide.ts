// Pyodide loader and code execution wrapper

declare global {
  interface Window {
    loadPyodide: () => Promise<PyodideInterface>;
  }
}

interface PyodideInterface {
  runPython: (code: string) => unknown;
  runPythonAsync: (code: string) => Promise<unknown>;
  globals: {
    get: (name: string) => unknown;
    set: (name: string, value: unknown) => void;
  };
}

let pyodideInstance: PyodideInterface | null = null;
let loadingPromise: Promise<PyodideInterface> | null = null;

// CDN URL for Pyodide
const PYODIDE_CDN = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/';

export interface ExecutionResult {
  success: boolean;
  output: string;
  error?: string;
  executionTime: number;
  passed?: boolean;
}

// Load Pyodide script dynamically
function loadPyodideScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.loadPyodide) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = `${PYODIDE_CDN}pyodide.js`;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Pyodide script'));
    document.head.appendChild(script);
  });
}

// Initialize Pyodide
export async function initPyodide(): Promise<PyodideInterface> {
  if (pyodideInstance) {
    return pyodideInstance;
  }

  if (loadingPromise) {
    return loadingPromise;
  }

  loadingPromise = (async () => {
    await loadPyodideScript();
    
    // @ts-expect-error loadPyodide is loaded from CDN
    pyodideInstance = await window.loadPyodide({
      indexURL: PYODIDE_CDN,
    });

    // Set up stdout capture
    pyodideInstance!.runPython(`
import sys
from io import StringIO

class OutputCapture:
    def __init__(self):
        self.outputs = []
    
    def write(self, text):
        self.outputs.append(text)
    
    def flush(self):
        pass
    
    def get_output(self):
        return ''.join(self.outputs)
    
    def clear(self):
        self.outputs = []

_stdout_capture = OutputCapture()
_original_stdout = sys.stdout
    `);

    return pyodideInstance!;
  })();

  return loadingPromise;
}

// Check if Pyodide is loaded
export function isPyodideLoaded(): boolean {
  return pyodideInstance !== null;
}

// Execute Python code with a test case
export async function executePythonCode(
  code: string,
  testInput: string,
  expectedOutput?: string
): Promise<ExecutionResult> {
  const startTime = performance.now();

  try {
    const pyodide = await initPyodide();

    // Redirect stdout
    pyodide.runPython(`
sys.stdout = _stdout_capture
_stdout_capture.clear()
    `);

    // Execute the user's code to define the Solution class
    pyodide.runPython(code);

    // Parse test input and call the solution
    const executionCode = `
import json

# Parse the test input
test_args = json.loads('${testInput.replace(/'/g, "\\'")}')

# Create solution instance
sol = Solution()

# Find the method to call (first method that's not __init__)
method_name = None
for name in dir(sol):
    if not name.startswith('_') and callable(getattr(sol, name)):
        method_name = name
        break

if method_name:
    method = getattr(sol, method_name)
    if isinstance(test_args, list):
        result = method(*test_args)
    else:
        result = method(test_args)
    
    # Convert result to string for comparison
    if isinstance(result, bool):
        result_str = str(result)
    elif isinstance(result, list):
        result_str = str(result)
    else:
        result_str = str(result)
    
    print(result_str)
else:
    print("No method found in Solution class")
`;

    pyodide.runPython(executionCode);

    // Get captured output
    const output = pyodide.runPython(`
result = _stdout_capture.get_output().strip()
sys.stdout = _original_stdout
result
    `) as string;

    const executionTime = performance.now() - startTime;

    // Check if output matches expected
    let passed: boolean | undefined;
    if (expectedOutput !== undefined) {
      // Normalize both outputs for comparison
      const normalizedOutput = output.replace(/\s+/g, '').toLowerCase();
      const normalizedExpected = expectedOutput.replace(/\s+/g, '').toLowerCase();
      passed = normalizedOutput === normalizedExpected;
    }

    return {
      success: true,
      output,
      executionTime,
      passed,
    };
  } catch (error) {
    const executionTime = performance.now() - startTime;
    
    // Try to restore stdout
    try {
      const pyodide = await initPyodide();
      pyodide.runPython(`sys.stdout = _original_stdout`);
    } catch {
      // Ignore errors during cleanup
    }

    return {
      success: false,
      output: '',
      error: error instanceof Error ? error.message : String(error),
      executionTime,
      passed: false,
    };
  }
}

// Run all test cases for a problem
export async function runAllTestCases(
  code: string,
  testCases: Array<{ input: string; expected: string }>
): Promise<{
  results: ExecutionResult[];
  allPassed: boolean;
  totalTime: number;
}> {
  const results: ExecutionResult[] = [];
  let totalTime = 0;

  for (const testCase of testCases) {
    const result = await executePythonCode(code, testCase.input, testCase.expected);
    results.push(result);
    totalTime += result.executionTime;
  }

  const allPassed = results.every(r => r.passed === true);

  return {
    results,
    allPassed,
    totalTime,
  };
}


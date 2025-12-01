import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { Sun, Type, Code, Columns, Download, Upload, Trash2, RotateCcw } from 'lucide-react';
import { Settings, getSettings, saveSettings, resetSettings, getProblems, saveProblems, loadProblems, downloadProblemsJSON } from '../lib/storage';
import { sampleProblems } from '../data/problems';
import { ImportModal } from '../components/ImportModal';
import { themes, applyTheme, ThemeName } from '../lib/themes';

export const Route = createFileRoute('/settings')({ component: SettingsPage });

function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [problemCount, setProblemCount] = useState(0);

  useEffect(() => {
    setSettings(getSettings());
    // Load problems from JSON to get accurate count
    loadProblems().then(problems => {
      setProblemCount(problems.length);
    }).catch(() => {
      setProblemCount(getProblems().length);
    });
  }, []);

  const handleSettingChange = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    if (!settings) return;
    
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    saveSettings(newSettings);
    
    // Apply theme immediately if theme changed
    if (key === 'theme') {
      applyTheme(value as ThemeName);
      // Dispatch custom event for same-tab updates
      window.dispatchEvent(new Event('theme-changed'));
    }
  };

  const handleResetSettings = () => {
    if (confirm('Reset all settings to default?')) {
      resetSettings();
      setSettings(getSettings());
    }
  };

  const handleResetProblems = () => {
    if (confirm('Reset to sample problems? This will remove all imported problems.')) {
      saveProblems(sampleProblems);
      setProblemCount(sampleProblems.length);
      // Reload to update cache
      loadProblems().then(problems => {
        setProblemCount(problems.length);
      });
    }
  };

  const handleClearAllData = () => {
    if (confirm('Clear all data including problems and saved solutions? This cannot be undone.')) {
      localStorage.clear();
      setSettings(getSettings());
      setProblemCount(getProblems().length);
    }
  };

  if (!settings) {
    return (
      <div className="min-h-screen bg-lc-fill-1 flex items-center justify-center">
        <div className="text-gray-400">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-lc-fill-1">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-white mb-8">Settings</h1>

        <div className="space-y-6">
          {/* Appearance Section */}
          <section className="bg-lc-fill-2 rounded-lg border border-lc-border p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Sun className="w-5 h-5 text-lc-accent" />
              Appearance
            </h2>

            {/* Theme Selector */}
            <div className="mb-6">
              <label className="block text-sm text-gray-400 mb-3">Theme</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {Object.values(themes).map((theme) => (
                  <button
                    key={theme.name}
                    onClick={() => handleSettingChange('theme', theme.name)}
                    className={`px-4 py-3 rounded-lg border transition-colors text-left ${
                      settings.theme === theme.name
                        ? 'bg-lc-accent/10 border-lc-accent text-lc-accent'
                        : 'bg-lc-fill-3 border-lc-border text-gray-400 hover:text-gray-200 hover:border-lc-accent/50'
                    }`}
                  >
                    <div className="font-medium">{theme.displayName}</div>
                    <div className="flex gap-1 mt-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: theme.colors['lc-bg-2'] }}
                      />
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: theme.colors['lc-accent'] }}
                      />
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: theme.colors['lc-easy'] }}
                      />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Font Size */}
            <div>
              <label className="block text-sm text-gray-400 mb-3">
                Editor Font Size: <span className="text-white">{settings.fontSize}px</span>
              </label>
              <div className="flex items-center gap-4">
                <Type className="w-4 h-4 text-gray-500" />
                <input
                  type="range"
                  min="12"
                  max="24"
                  value={settings.fontSize}
                  onChange={e => handleSettingChange('fontSize', parseInt(e.target.value))}
                  className="flex-1 h-2 bg-lc-fill-3 rounded-lg appearance-none cursor-pointer accent-lc-accent"
                />
                <Type className="w-6 h-6 text-gray-500" />
              </div>
            </div>
          </section>

          {/* Editor Section */}
          <section className="bg-lc-fill-2 rounded-lg border border-lc-border p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Code className="w-5 h-5 text-lc-accent" />
              Editor
            </h2>

            {/* Editor Mode */}
            <div className="mb-6">
              <label className="block text-sm text-gray-400 mb-3">Editor Mode</label>
              <div className="flex gap-3">
                <button
                  onClick={() => handleSettingChange('editorMode', 'normal')}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg border transition-colors ${
                    settings.editorMode === 'normal'
                      ? 'bg-lc-accent/10 border-lc-accent text-lc-accent'
                      : 'bg-lc-fill-3 border-lc-border text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <Columns className="w-5 h-5" />
                  <span>Normal</span>
                </button>
                <button
                  onClick={() => handleSettingChange('editorMode', 'vim')}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg border transition-colors ${
                    settings.editorMode === 'vim'
                      ? 'bg-lc-accent/10 border-lc-accent text-lc-accent'
                      : 'bg-lc-fill-3 border-lc-border text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <Code className="w-5 h-5" />
                  <span>Vim</span>
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Vim mode enables vim keybindings in the code editor.
              </p>
            </div>

            {/* Tab Size */}
            <div>
              <label className="block text-sm text-gray-400 mb-3">Tab Size</label>
              <div className="flex gap-3">
                {[2, 4].map(size => (
                  <button
                    key={size}
                    onClick={() => handleSettingChange('tabSize', size)}
                    className={`px-4 py-2 rounded-lg border transition-colors ${
                      settings.tabSize === size
                        ? 'bg-lc-accent/10 border-lc-accent text-lc-accent'
                        : 'bg-lc-fill-3 border-lc-border text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    {size} spaces
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Data Management Section */}
          <section className="bg-lc-fill-2 rounded-lg border border-lc-border p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Download className="w-5 h-5 text-lc-accent" />
              Data Management
            </h2>

            {/* Problem count */}
            <div className="mb-6 p-4 bg-lc-fill-3 rounded-lg">
              <div className="text-2xl font-bold text-white">{problemCount}</div>
              <div className="text-sm text-gray-400">Problems stored locally</div>
            </div>

            {/* Import/Export buttons */}
            <div className="space-y-3">
              <button
                onClick={() => setShowImportModal(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-lc-accent text-black rounded-lg font-medium hover:bg-lc-accent-hover transition-colors"
              >
                <Upload className="w-5 h-5" />
                Import Problems
              </button>

              <button
                onClick={downloadProblemsJSON}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-lc-fill-3 text-gray-200 rounded-lg font-medium hover:bg-lc-fill-4 border border-lc-border transition-colors"
              >
                <Download className="w-5 h-5" />
                Download problems.json
              </button>

              <button
                onClick={handleResetProblems}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-lc-fill-3 text-gray-200 rounded-lg font-medium hover:bg-lc-fill-4 border border-lc-border transition-colors"
              >
                <RotateCcw className="w-5 h-5" />
                Reset to Sample Problems
              </button>
            </div>
            
            <p className="mt-4 text-xs text-gray-500">
              Problems are loaded from <code className="text-gray-400">/problems.json</code>. 
              When you import or modify problems, click "Download problems.json" to save your changes to a file.
            </p>
          </section>

          {/* Danger Zone */}
          <section className="bg-red-500/5 rounded-lg border border-red-500/20 p-6">
            <h2 className="text-lg font-semibold text-red-400 mb-4 flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              Danger Zone
            </h2>

            <div className="space-y-3">
              <button
                onClick={handleResetSettings}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 text-red-400 rounded-lg font-medium hover:bg-red-500/20 border border-red-500/30 transition-colors"
              >
                Reset Settings to Default
              </button>

              <button
                onClick={handleClearAllData}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-500 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
                Clear All Data
              </button>
            </div>

            <p className="mt-4 text-xs text-gray-500">
              Clearing all data will remove all problems, solutions, and settings. This action cannot be undone.
            </p>
          </section>

          {/* About Section */}
          <section className="bg-lc-fill-2 rounded-lg border border-lc-border p-6">
            <h2 className="text-lg font-semibold text-white mb-4">About</h2>
            <p className="text-gray-400 text-sm mb-4">
              LeetCode Offline is a local practice tool that lets you solve coding problems without an internet connection. 
              All data is stored in your browser's localStorage.
            </p>
            <div className="text-xs text-gray-500 space-y-1">
              <p>Built with TanStack Router, React, CodeMirror, and Pyodide</p>
              <p>Python code runs in-browser via WebAssembly</p>
            </div>
          </section>
        </div>
      </div>

      {/* Import Modal */}
      <ImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImportSuccess={() => {
          loadProblems().then(problems => {
            setProblemCount(problems.length);
          }).catch(() => {
            setProblemCount(getProblems().length);
          });
        }}
      />
    </div>
  );
}


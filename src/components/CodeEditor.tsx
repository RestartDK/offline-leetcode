import { useEffect, useMemo, useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';
import { vim } from '@replit/codemirror-vim';
import { EditorView } from '@codemirror/view';
import { Extension } from '@codemirror/state';
import { Settings, getSettings } from '../lib/storage';
import { getTheme } from '../lib/themes';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function CodeEditor({ value, onChange, className = '' }: CodeEditorProps) {
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    setSettings(getSettings());

    // Listen for storage changes (settings updates from other tabs)
    const handleStorageChange = () => {
      setSettings(getSettings());
    };

    // Also listen for theme changes in same tab
    const handleThemeChange = () => {
      setSettings(getSettings());
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('theme-changed', handleThemeChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('theme-changed', handleThemeChange);
    };
  }, []);

  const extensions = useMemo<Extension[]>(() => {
    const theme = settings ? getTheme(settings.theme) : getTheme('default');
    
    const exts: Extension[] = [
      python(),
      EditorView.lineWrapping,
      EditorView.theme({
        '&': {
          fontSize: `${settings?.fontSize || 14}px`,
        },
        '.cm-content': {
          fontFamily: '"Menlo", "Monaco", "Consolas", "Courier New", monospace',
        },
        '.cm-gutters': {
          backgroundColor: theme.colors['lc-fill-2'],
          borderRight: `1px solid ${theme.colors['lc-border']}`,
        },
        '.cm-activeLineGutter': {
          backgroundColor: theme.colors['lc-fill-3'],
        },
        '.cm-activeLine': {
          backgroundColor: theme.colors['lc-fill-3'],
        },
      }),
    ];

    // Add vim mode if enabled
    if (settings?.editorMode === 'vim') {
      exts.push(vim());
    }

    return exts;
  }, [settings?.editorMode, settings?.fontSize, settings?.theme]);

  if (!settings) {
    return (
      <div className={`bg-lc-fill-2 flex items-center justify-center ${className}`}>
        <div className="text-gray-400">Loading editor...</div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <CodeMirror
        value={value}
        onChange={onChange}
        theme={vscodeDark}
        extensions={extensions}
        basicSetup={{
          lineNumbers: true,
          highlightActiveLineGutter: true,
          highlightSpecialChars: true,
          history: true,
          foldGutter: true,
          drawSelection: true,
          dropCursor: true,
          allowMultipleSelections: true,
          indentOnInput: true,
          syntaxHighlighting: true,
          bracketMatching: true,
          closeBrackets: true,
          autocompletion: true,
          rectangularSelection: true,
          crosshairCursor: false,
          highlightActiveLine: true,
          highlightSelectionMatches: true,
          closeBracketsKeymap: true,
          defaultKeymap: true,
          searchKeymap: true,
          historyKeymap: true,
          foldKeymap: true,
          completionKeymap: true,
          lintKeymap: true,
          tabSize: settings.tabSize,
        }}
        className="h-full overflow-hidden rounded-lg"
        style={{ height: '100%' }}
      />
      
      {/* Vim mode indicator */}
      {settings.editorMode === 'vim' && (
        <div className="absolute bottom-2 right-2 px-2 py-1 bg-lc-fill-3 rounded text-xs text-gray-400 border border-lc-border">
          VIM
        </div>
      )}
    </div>
  );
}


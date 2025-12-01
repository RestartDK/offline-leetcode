export type ThemeName = 'tokyo-night' | 'kanagawa' | 'dracula' | 'nord' | 'gruvbox' | 'onedark' | 'default';

export interface Theme {
  name: ThemeName;
  displayName: string;
  colors: {
    'lc-bg-1': string;
    'lc-bg-2': string;
    'lc-bg-3': string;
    'lc-fill-1': string;
    'lc-fill-2': string;
    'lc-fill-3': string;
    'lc-fill-4': string;
    'lc-border': string;
    'lc-accent': string;
    'lc-accent-hover': string;
    'lc-text-1': string;
    'lc-text-2': string;
    'lc-text-3': string;
    'lc-easy': string;
    'lc-medium': string;
    'lc-hard': string;
  };
}

export const themes: Record<ThemeName, Theme> = {
  'default': {
    name: 'default',
    displayName: 'Default (LeetCode)',
    colors: {
      'lc-bg-1': '#1a1a1a',
      'lc-bg-2': '#282828',
      'lc-bg-3': '#333333',
      'lc-fill-1': '#0a0a0a',
      'lc-fill-2': '#1a1a1a',
      'lc-fill-3': '#282828',
      'lc-fill-4': '#3c3c3c',
      'lc-border': '#3c3c3c',
      'lc-accent': '#ffa116',
      'lc-accent-hover': '#ffb84d',
      'lc-text-1': '#eff1f6',
      'lc-text-2': '#b3b3b3',
      'lc-text-3': '#8a8a8a',
      'lc-easy': '#00b8a3',
      'lc-medium': '#ffc01e',
      'lc-hard': '#ff375f',
    },
  },
  'tokyo-night': {
    name: 'tokyo-night',
    displayName: 'Tokyo Night',
    colors: {
      'lc-bg-1': '#1a1b26',
      'lc-bg-2': '#24283b',
      'lc-bg-3': '#2f3549',
      'lc-fill-1': '#16161e',
      'lc-fill-2': '#1a1b26',
      'lc-fill-3': '#24283b',
      'lc-fill-4': '#2f3549',
      'lc-border': '#3b4261',
      'lc-accent': '#7aa2f7',
      'lc-accent-hover': '#9aa5ce',
      'lc-text-1': '#c0caf5',
      'lc-text-2': '#a9b1d6',
      'lc-text-3': '#787c99',
      'lc-easy': '#9ece6a',
      'lc-medium': '#e0af68',
      'lc-hard': '#f7768e',
    },
  },
  'kanagawa': {
    name: 'kanagawa',
    displayName: 'Kanagawa',
    colors: {
      'lc-bg-1': '#1f1f28',
      'lc-bg-2': '#2a2a37',
      'lc-bg-3': '#363646',
      'lc-fill-1': '#16161d',
      'lc-fill-2': '#1f1f28',
      'lc-fill-3': '#2a2a37',
      'lc-fill-4': '#363646',
      'lc-border': '#54546d',
      'lc-accent': '#957fb8',
      'lc-accent-hover': '#a89bb8',
      'lc-text-1': '#dcd7ba',
      'lc-text-2': '#c8c093',
      'lc-text-3': '#938aa9',
      'lc-easy': '#76946a',
      'lc-medium': '#c0a36e',
      'lc-hard': '#c34043',
    },
  },
  'dracula': {
    name: 'dracula',
    displayName: 'Dracula',
    colors: {
      'lc-bg-1': '#282a36',
      'lc-bg-2': '#343746',
      'lc-bg-3': '#424450',
      'lc-fill-1': '#21222c',
      'lc-fill-2': '#282a36',
      'lc-fill-3': '#343746',
      'lc-fill-4': '#424450',
      'lc-border': '#6272a4',
      'lc-accent': '#bd93f9',
      'lc-accent-hover': '#d1b3ff',
      'lc-text-1': '#f8f8f2',
      'lc-text-2': '#e2e2dc',
      'lc-text-3': '#b8b8b0',
      'lc-easy': '#50fa7b',
      'lc-medium': '#f1fa8c',
      'lc-hard': '#ff5555',
    },
  },
  'nord': {
    name: 'nord',
    displayName: 'Nord',
    colors: {
      'lc-bg-1': '#2e3440',
      'lc-bg-2': '#3b4252',
      'lc-bg-3': '#434c5e',
      'lc-fill-1': '#242933',
      'lc-fill-2': '#2e3440',
      'lc-fill-3': '#3b4252',
      'lc-fill-4': '#434c5e',
      'lc-border': '#4c566a',
      'lc-accent': '#88c0d0',
      'lc-accent-hover': '#8fbcbb',
      'lc-text-1': '#eceff4',
      'lc-text-2': '#e5e9f0',
      'lc-text-3': '#d8dee9',
      'lc-easy': '#a3be8c',
      'lc-medium': '#ebcb8b',
      'lc-hard': '#bf616a',
    },
  },
  'gruvbox': {
    name: 'gruvbox',
    displayName: 'Gruvbox',
    colors: {
      'lc-bg-1': '#282828',
      'lc-bg-2': '#3c3836',
      'lc-bg-3': '#504945',
      'lc-fill-1': '#1d2021',
      'lc-fill-2': '#282828',
      'lc-fill-3': '#3c3836',
      'lc-fill-4': '#504945',
      'lc-border': '#665c54',
      'lc-accent': '#fe8019',
      'lc-accent-hover': '#d65d0e',
      'lc-text-1': '#ebdbb2',
      'lc-text-2': '#d5c4a1',
      'lc-text-3': '#bdae93',
      'lc-easy': '#b8bb26',
      'lc-medium': '#fabd2f',
      'lc-hard': '#fb4934',
    },
  },
  'onedark': {
    name: 'onedark',
    displayName: 'One Dark',
    colors: {
      'lc-bg-1': '#282c34',
      'lc-bg-2': '#353b45',
      'lc-bg-3': '#3e4451',
      'lc-fill-1': '#21252b',
      'lc-fill-2': '#282c34',
      'lc-fill-3': '#353b45',
      'lc-fill-4': '#3e4451',
      'lc-border': '#5c6370',
      'lc-accent': '#61afef',
      'lc-accent-hover': '#528bcf',
      'lc-text-1': '#abb2bf',
      'lc-text-2': '#828997',
      'lc-text-3': '#5c6370',
      'lc-easy': '#98c379',
      'lc-medium': '#e5c07b',
      'lc-hard': '#e06c75',
    },
  },
};

export function applyTheme(themeName: ThemeName): void {
  const theme = themes[themeName];
  if (!theme) return;

  const root = document.documentElement;
  Object.entries(theme.colors).forEach(([key, value]) => {
    root.style.setProperty(`--${key}`, value);
  });
}

export function getTheme(themeName: ThemeName): Theme {
  return themes[themeName] || themes.default;
}


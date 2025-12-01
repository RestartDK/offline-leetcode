import { HeadContent, Scripts, createRootRoute, Outlet } from '@tanstack/react-router';
import { useEffect } from 'react';

import Header from '../components/Header';
import { getSettings } from '../lib/storage';
import { applyTheme } from '../lib/themes';

import appCss from '../styles.css?url';

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'LeetCode Offline - Practice Coding Problems',
      },
      {
        name: 'description',
        content: 'Practice LeetCode problems offline with a built-in Python code editor',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
      {
        rel: 'icon',
        href: '/favicon.ico',
      },
    ],
  }),

  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Apply theme on mount
    const settings = getSettings();
    applyTheme(settings.theme);

    // Listen for storage changes to update theme (cross-tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'leetcode-offline-settings') {
        const settings = getSettings();
        applyTheme(settings.theme);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom event for same-tab updates
    const handleThemeChange = () => {
      const settings = getSettings();
      applyTheme(settings.theme);
    };
    
    window.addEventListener('theme-changed', handleThemeChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('theme-changed', handleThemeChange);
    };
  }, []);

  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body className="min-h-screen bg-lc-fill-1">
        <Header />
        <main>{children}</main>
        <Scripts />
      </body>
    </html>
  );
}

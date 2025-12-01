import { Link } from '@tanstack/react-router';
import { Code2, Settings, Home, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-lc-fill-2 border-b border-lc-border sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-white hover:text-white">
            <div className="w-8 h-8 bg-lc-accent rounded flex items-center justify-center">
              <Code2 className="w-5 h-5 text-black" />
            </div>
            <span className="font-bold text-lg hidden sm:block">
              <span className="text-lc-accent">Leet</span>Code Offline
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-lc-fill-3 transition-colors [&.active]:text-lc-accent [&.active]:bg-lc-fill-3"
              activeProps={{ className: 'active' }}
            >
              <Home className="w-4 h-4" />
              <span>Problems</span>
            </Link>
            <Link
              to="/settings"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-lc-fill-3 transition-colors [&.active]:text-lc-accent [&.active]:bg-lc-fill-3"
              activeProps={{ className: 'active' }}
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </Link>
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-lc-border">
            <Link
              to="/"
              className="flex items-center gap-2 px-4 py-3 text-gray-300 hover:text-white hover:bg-lc-fill-3 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Home className="w-5 h-5" />
              <span>Problems</span>
            </Link>
            <Link
              to="/settings"
              className="flex items-center gap-2 px-4 py-3 text-gray-300 hover:text-white hover:bg-lc-fill-3 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}

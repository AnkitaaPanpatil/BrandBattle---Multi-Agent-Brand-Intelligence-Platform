import React, { useState, useEffect } from 'react';
import {
  Swords,
  RefreshCw,
  Download,
  Sun,
  Moon,
  Laptop,
  LogIn,
  LogOut,
  FolderHeart,
  Menu,
  X,
  Sparkles,
  ArrowLeftRight,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext.js';
import { AuthUser } from '../services/firebase.js';

interface HeaderProps {
  currentStage: number;
  onReset: () => void;
  canReset?: boolean;
  hasGeminiKey: boolean | null;
  onExportAll?: () => void;
  canExport?: boolean;
  user: AuthUser | null;
  onSignIn: () => void;
  onSignOut: () => void;
  onOpenSavedDrawer: () => void;
  savedKitsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentStage,
  onReset,
  canReset = false,
  hasGeminiKey,
  onExportAll,
  canExport,
  user,
  onSignIn,
  onSignOut,
  onOpenSavedDrawer,
  savedKitsCount,
}) => {
  const { theme, actualTheme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile drawer on Escape
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Esc') {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  return (
    <header className="border-b border-neutral-200 dark:border-[#1a2333] bg-white/95 dark:bg-[#070a10]/95 backdrop-blur-md sticky top-0 z-40 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 via-rose-500 to-violet-600 flex items-center justify-center shadow-lg shadow-amber-500/20 border border-amber-400/30 shrink-0">
            <Swords className="w-5 h-5 text-neutral-950 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-lg tracking-tight text-neutral-900 dark:text-white">
                BrandBattle
              </span>
              <span className="text-[11px] font-mono tracking-wider uppercase text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900/60 px-1.5 py-0.5 rounded">
                Studio
              </span>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 hidden sm:block">
              Multi-Agent Brand Intelligence Arena
            </p>
          </div>
        </div>

        {/* Desktop Controls */}
        <div className="hidden md:flex items-center gap-2.5">
          {/* Real-time Status */}
          <div className="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-[#1a2333] bg-neutral-50 dark:bg-[#0d121c] px-2.5 py-1 rounded-md">
            <span
              className={`w-2 h-2 rounded-full ${
                hasGeminiKey ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
            <span>{hasGeminiKey ? 'Gemini 3.8 + Search Live' : 'AI Simulation Mode'}</span>
          </div>

          {/* Theme Selector (Dark, Light, System) */}
          <div className="flex p-0.5 bg-neutral-100 dark:bg-[#0c1017] border border-neutral-200 dark:border-[#1a2333] rounded-lg items-center" role="group" aria-label="Theme mode selector">
            <button
              id="theme-btn-dark"
              data-testid="theme-toggle-dark"
              data-theme="dark"
              onClick={() => setTheme('dark')}
              aria-pressed={theme === 'dark'}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                theme === 'dark'
                  ? 'bg-neutral-900 dark:bg-[#182030] text-amber-400 shadow-sm border border-neutral-800 dark:border-amber-500/30 font-semibold'
                  : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
              }`}
              title="Dark mode"
              aria-label="Dark mode"
            >
              <Moon className="w-3.5 h-3.5" />
              <span>Dark</span>
            </button>
            <button
              id="theme-btn-light"
              data-testid="theme-toggle-light"
              data-theme="light"
              onClick={() => setTheme('light')}
              aria-pressed={theme === 'light'}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                theme === 'light'
                  ? 'bg-white text-amber-600 shadow-sm border border-neutral-200 dark:border-neutral-700 font-semibold'
                  : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
              }`}
              title="Light mode"
              aria-label="Light mode"
            >
              <Sun className="w-3.5 h-3.5" />
              <span>Light</span>
            </button>
            <button
              id="theme-btn-system"
              data-testid="theme-toggle-system"
              data-theme="system"
              onClick={() => setTheme('system')}
              aria-pressed={theme === 'system'}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                theme === 'system'
                  ? 'bg-white dark:bg-[#182030] text-blue-600 dark:text-blue-400 shadow-sm border border-neutral-200 dark:border-blue-500/30 font-semibold'
                  : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
              }`}
              title="System mode"
              aria-label="System mode"
            >
              <Laptop className="w-3.5 h-3.5" />
              <span>System</span>
            </button>
          </div>

          {/* Saved Brand Kits Drawer Button */}
          {user && (
            <button
              onClick={onOpenSavedDrawer}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-200 hover:text-neutral-900 dark:hover:text-white bg-neutral-100 dark:bg-[#0d121c] hover:bg-neutral-200 dark:hover:bg-[#141b29] border border-neutral-300 dark:border-[#1e2738] rounded-md transition-colors"
            >
              <FolderHeart className="w-3.5 h-3.5 text-rose-500" />
              <span>Saved Kits</span>
              <span className="w-4 h-4 rounded-full bg-neutral-200 dark:bg-[#1e2738] text-[10px] font-mono flex items-center justify-center font-bold">
                {savedKitsCount}
              </span>
            </button>
          )}

          {/* Export Action */}
          {canExport && onExportAll && (
            <button
              onClick={onExportAll}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-200 hover:text-neutral-900 dark:hover:text-white bg-neutral-100 dark:bg-[#0d121c] hover:bg-neutral-200 dark:hover:bg-[#141b29] border border-neutral-300 dark:border-[#1e2738] rounded-md transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-amber-500" />
              <span>Export Dossier</span>
            </button>
          )}

          {/* Reset Action */}
          {(currentStage > 1 || canReset) && (
            <button
              type="button"
              onClick={onReset}
              title="Reset current session and start a brand new Brand Battle"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-800 dark:text-neutral-200 hover:text-neutral-950 dark:hover:text-white bg-neutral-100 hover:bg-neutral-200 dark:bg-[#0d121c] dark:hover:bg-[#182234] border border-neutral-300 dark:border-[#223048] rounded-md transition-all active:scale-[0.98] cursor-pointer shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5 text-amber-500" />
              <span>New Battle</span>
            </button>
          )}

          {/* User Sign-In / Profile */}
          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-neutral-300 dark:border-[#1a2333]">
              <button
                type="button"
                onClick={onSignIn}
                title="Click to view accounts or switch user"
                className="flex items-center gap-2 p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-[#121824] transition-colors cursor-pointer text-left"
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-7 h-7 rounded-full border border-neutral-300 dark:border-[#2a3752]"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-500 font-bold text-xs flex items-center justify-center">
                    {user.displayName?.slice(0, 1).toUpperCase() || user.email?.slice(0, 1).toUpperCase() || 'U'}
                  </div>
                )}
                <div className="flex flex-col text-left">
                  <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 max-w-[110px] truncate leading-tight">
                    {user.displayName || user.email?.split('@')[0]}
                  </span>
                  <span className={`text-[9px] font-semibold leading-none ${
                    user.email === 'guest@brandbattle.local' || user.displayName === 'Guest Mode'
                      ? 'text-amber-500'
                      : 'text-emerald-600 dark:text-emerald-400'
                  }`}>
                    {user.email === 'guest@brandbattle.local' || user.displayName === 'Guest Mode'
                      ? '⚡ Guest Mode'
                      : (user as any).isLocal
                      ? user.email?.includes('gmail') ? 'Google Account' : 'Account'
                      : 'Google OAuth'}
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={onSignIn}
                title="Switch Account"
                className="flex items-center gap-1 text-[11px] font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white px-2 py-1 rounded bg-neutral-100 dark:bg-[#111722] hover:bg-neutral-200 dark:hover:bg-[#192334] border border-neutral-200 dark:border-[#1e2738] transition-colors cursor-pointer"
              >
                <ArrowLeftRight className="w-3 h-3 text-amber-500" />
                <span className="hidden lg:inline">Switch</span>
              </button>

              <button
                type="button"
                onClick={onSignOut}
                className="p-1.5 text-neutral-500 hover:text-rose-500 rounded-md transition-colors cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onSignIn}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-md shadow-sm transition-all active:scale-[0.98] cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In / Guest Mode</span>
            </button>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setTheme(actualTheme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-[#0d121c] border border-neutral-200 dark:border-[#1e2738] transition-colors"
            aria-label="Toggle theme"
            title={actualTheme === 'dark' ? 'Switch to Light mode' : 'Switch to Dark mode'}
          >
            {actualTheme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-neutral-700" />}
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-[#0d121c] border border-neutral-200 dark:border-[#1e2738] transition-colors"
            aria-label="Open mobile menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-neutral-200 dark:border-[#1a2333] bg-white dark:bg-[#070a10] p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-[#1a2333]">
            <span className="text-xs font-medium text-neutral-700 dark:text-neutral-400">Theme Mode</span>
            <div className="flex p-0.5 bg-neutral-100 dark:bg-[#0d121c] rounded-lg border border-neutral-200 dark:border-[#1e2738] items-center" role="group" aria-label="Mobile theme mode selector">
              <button
                id="theme-btn-dark-mobile"
                data-testid="theme-toggle-dark-mobile"
                data-theme="dark"
                onClick={() => setTheme('dark')}
                aria-pressed={theme === 'dark'}
                aria-label="Dark mode"
                className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded-md font-medium transition-all ${
                  theme === 'dark'
                    ? 'bg-neutral-900 dark:bg-[#182030] text-amber-400 font-bold shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <Moon className="w-3 h-3" />
                <span>Dark</span>
              </button>
              <button
                id="theme-btn-light-mobile"
                data-testid="theme-toggle-light-mobile"
                data-theme="light"
                onClick={() => setTheme('light')}
                aria-pressed={theme === 'light'}
                aria-label="Light mode"
                className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded-md font-medium transition-all ${
                  theme === 'light'
                    ? 'bg-white text-amber-600 font-bold shadow-xs border border-neutral-200 dark:border-neutral-700'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <Sun className="w-3 h-3" />
                <span>Light</span>
              </button>
              <button
                id="theme-btn-system-mobile"
                data-testid="theme-toggle-system-mobile"
                data-theme="system"
                onClick={() => setTheme('system')}
                aria-pressed={theme === 'system'}
                aria-label="System mode"
                className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded-md font-medium transition-all ${
                  theme === 'system'
                    ? 'bg-white dark:bg-[#182030] text-blue-600 dark:text-blue-400 font-bold shadow-xs border border-neutral-200 dark:border-blue-500/30'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <Laptop className="w-3 h-3" />
                <span>System</span>
              </button>
            </div>
          </div>

          {/* User Status Mobile */}
          {user ? (
            <div className="flex items-center justify-between py-2 border-y border-neutral-200 dark:border-[#1a2333]">
              <div
                onClick={() => {
                  onSignIn();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-2 cursor-pointer"
              >
                {user.photoURL ? (
                  <img src={user.photoURL} alt="User" className="w-7 h-7 rounded-full border border-neutral-300 dark:border-neutral-700" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-500 font-bold text-xs flex items-center justify-center">
                    {user.displayName?.slice(0, 1).toUpperCase() || user.email?.slice(0, 1).toUpperCase() || 'U'}
                  </div>
                )}
                <div>
                  <div className="text-xs font-semibold text-neutral-900 dark:text-white flex items-center gap-1.5">
                    <span>{user.displayName || 'Logged In'}</span>
                    <span className={`text-[9px] px-1 py-0.5 rounded font-medium ${
                      user.email === 'guest@brandbattle.local' || user.displayName === 'Guest Mode'
                        ? 'bg-amber-500/20 text-amber-500'
                        : 'bg-emerald-500/10 text-emerald-500'
                    }`}>
                      {user.email === 'guest@brandbattle.local' || user.displayName === 'Guest Mode'
                        ? '⚡ Guest'
                        : (user as any).isLocal
                        ? user.email?.includes('gmail') ? 'Google' : 'Account'
                        : 'Google'}
                    </span>
                  </div>
                  <div className="text-[11px] text-neutral-500 truncate max-w-[180px]">
                    {user.email === 'guest@brandbattle.local' ? 'LocalStorage Mode' : user.email}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onSignIn();
                    setMobileMenuOpen(false);
                  }}
                  className="text-xs text-amber-600 dark:text-amber-400 font-medium px-2 py-1 bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800/40 rounded cursor-pointer"
                >
                  Switch
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onSignOut();
                    setMobileMenuOpen(false);
                  }}
                  className="text-xs text-rose-500 font-medium px-2 py-1 bg-rose-50 dark:bg-rose-950/30 rounded cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                onSignIn();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold text-neutral-950 bg-amber-400 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In / Guest Mode</span>
            </button>
          )}

          {/* Mobile Actions */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            {user && (
              <button
                onClick={() => {
                  onOpenSavedDrawer();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-center gap-1.5 py-2 text-xs font-medium bg-neutral-100 dark:bg-[#0d121c] border border-neutral-200 dark:border-[#1e2738] rounded-lg text-neutral-800 dark:text-neutral-200"
              >
                <FolderHeart className="w-4 h-4 text-rose-500" />
                <span>Saved ({savedKitsCount})</span>
              </button>
            )}

            {canExport && onExportAll && (
              <button
                onClick={() => {
                  onExportAll();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-center gap-1.5 py-2 text-xs font-medium bg-neutral-100 dark:bg-[#0d121c] border border-neutral-200 dark:border-[#1e2738] rounded-lg text-neutral-800 dark:text-neutral-200"
              >
                <Download className="w-4 h-4 text-amber-500" />
                <span>Export Dossier</span>
              </button>
            )}

            {(currentStage > 1 || canReset) && (
              <button
                type="button"
                onClick={() => {
                  onReset();
                  setMobileMenuOpen(false);
                }}
                className="col-span-2 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold bg-neutral-100 hover:bg-neutral-200 dark:bg-[#0d121c] dark:hover:bg-[#182234] border border-neutral-300 dark:border-[#223048] rounded-lg text-neutral-800 dark:text-neutral-200 active:scale-[0.98] cursor-pointer"
              >
                <RefreshCw className="w-4 h-4 text-amber-500" />
                <span>Start New Battle</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

import React, { useState, useEffect } from 'react';
import {
  X,
  LogOut,
  AlertCircle,
  Check,
  Zap,
} from 'lucide-react';
import {
  AuthUser,
  signInWithGoogle,
  signInLocally,
  signInAsGuest,
  logoutUser,
} from '../services/firebase.js';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AuthUser | null;
  onSuccess: (msg: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSuccess,
}) => {
  const [accountName, setAccountName] = useState('');
  const [accountEmail, setAccountEmail] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  // Sync state whenever modal opens
  useEffect(() => {
    if (isOpen) {
      if (currentUser?.email && currentUser.email !== 'guest@brandbattle.local') {
        setAccountName(currentUser.displayName || '');
        setAccountEmail(currentUser.email);
      } else {
        setAccountName('');
        setAccountEmail('');
      }
      setErrorNotice(null);
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const currentEmail = currentUser?.email?.toLowerCase();

  const handleGuestSignIn = () => {
    setIsSigningIn(true);
    try {
      const guest = signInAsGuest();
      onSuccess(`Connected in Instant Guest Mode! Saved to LocalStorage.`);
      onClose();
    } catch {
      setErrorNotice('Could not enter Guest Mode.');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handle1ClickSignIn = async (name: string, email: string) => {
    setIsSigningIn(true);
    try {
      const res = await signInWithGoogle(name, email);
      onSuccess(`Signed in as ${res.user.displayName || name}!`);
      onClose();
    } catch {
      const user = signInLocally(name, email);
      onSuccess(`Signed in as ${user.displayName}!`);
      onClose();
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOutClick = async () => {
    await logoutUser();
    setAccountName('');
    setAccountEmail('');
    onSuccess('Signed out of BrandBattle.');
    onClose();
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emailToUse = accountEmail.trim();
    if (!emailToUse) {
      setErrorNotice('Please enter a valid Google or email address.');
      return;
    }
    const nameToUse = accountName.trim() || emailToUse.split('@')[0] || 'User';
    handle1ClickSignIn(nameToUse, emailToUse);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#0c1017] border border-neutral-200 dark:border-[#1e2738] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-[#1a2333] bg-neutral-50/50 dark:bg-[#080c14]/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
              <Zap className="w-4 h-4 fill-amber-500/20" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                BrandBattle Workspace Access
              </h3>
              <p className="text-[11px] text-neutral-500">
                Instant Guest Mode (LocalStorage) or Custom Account
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-[#151c28] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {errorNotice && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800/50 rounded-xl text-xs text-rose-900 dark:text-rose-200 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-rose-500" />
              <p className="font-semibold">{errorNotice}</p>
            </div>
          )}

          {/* Current Active Account Status */}
          {currentUser && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'User'}
                    className="w-9 h-9 rounded-full border border-amber-500/40 shrink-0 object-cover"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-amber-500/20 text-amber-500 font-bold text-sm flex items-center justify-center shrink-0">
                    {currentUser.displayName?.slice(0, 1).toUpperCase() || 'U'}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100 truncate">
                      {currentUser.displayName || 'User'}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/30 shrink-0">
                      Active
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-500 truncate">
                    {currentUser.email === 'guest@brandbattle.local'
                      ? '⚡ LocalStorage Guest Mode'
                      : currentUser.email}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSignOutClick}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 border border-rose-200 dark:border-rose-900/50 rounded-lg transition-colors cursor-pointer shrink-0"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}

          {/* Primary Recommended: Browser LocalStorage (Guest Mode) Hero Card */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border border-amber-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-500 border border-amber-500/40 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                <Zap className="w-5 h-5 fill-amber-500/30 stroke-amber-500" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                    Instant Guest Mode
                  </h4>
                  <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.2 rounded font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                    Bypasses Vercel Restriction
                  </span>
                </div>
                <p className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-0.5">
                  Stores your brand kits, arena votes, and dossiers directly in Browser LocalStorage. Zero sign-up required.
                </p>
              </div>
            </div>

            <div className="shrink-0 self-end sm:self-center">
              {currentEmail === 'guest@brandbattle.local' ? (
                <span className="flex items-center gap-1 text-[11px] font-bold text-amber-500 bg-amber-500/20 px-3 py-1.5 rounded-lg border border-amber-500/40">
                  <Check className="w-3.5 h-3.5" />
                  <span>Current Mode</span>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleGuestSignIn}
                  disabled={isSigningIn}
                  className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold text-xs shadow-sm transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>Use Guest Mode</span>
                </button>
              )}
            </div>
          </div>

          <div className="relative flex items-center justify-center pt-1">
            <div className="border-t border-neutral-200 dark:border-[#1a2333] w-full" />
            <span className="bg-white dark:bg-[#0c1017] px-3 text-[10px] uppercase font-bold text-neutral-400 shrink-0">
              Or Sign In with Google / Email
            </span>
          </div>

          {/* Form: Any Name and Any Email */}
          <form onSubmit={handleCustomSubmit} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Name (Optional)
                </label>
                <input
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="e.g. Ankit"
                  className="w-full px-3 py-2 text-xs rounded-lg bg-neutral-50 dark:bg-[#070a10] border border-neutral-200 dark:border-[#1e2738] text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Google / Gmail Address
                </label>
                <input
                  type="email"
                  value={accountEmail}
                  onChange={(e) => setAccountEmail(e.target.value)}
                  placeholder="your-account@gmail.com"
                  required
                  className="w-full px-3 py-2 text-xs rounded-lg bg-neutral-50 dark:bg-[#070a10] border border-neutral-200 dark:border-[#1e2738] text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* Direct Instant Google Sign In Button */}
            <button
              type="submit"
              disabled={isSigningIn}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm text-white bg-blue-600 hover:bg-blue-500 shadow-md transition-all active:scale-[0.99] cursor-pointer disabled:opacity-50"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>
                {isSigningIn
                  ? 'Signing in...'
                  : accountEmail.trim()
                  ? `Sign In as ${accountName.trim() || accountEmail.split('@')[0]} (${accountEmail.trim()})`
                  : 'Sign In with Google Account'}
              </span>
            </button>
          </form>

          <p className="text-[10px] text-neutral-500 text-center">
            Your brand intelligence dossiers, debate votes, and kits are strictly isolated under this account.
          </p>
        </div>
      </div>
    </div>
  );
};

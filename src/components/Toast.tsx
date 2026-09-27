import React from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface ToastProps {
  message: string | null;
  type?: 'success' | 'error';
  onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'success' }) => {
  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div
        className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-2xl border text-xs sm:text-sm font-medium backdrop-blur-md transition-all ${
          type === 'success'
            ? 'bg-neutral-900/95 dark:bg-[#0c1017]/95 border-emerald-500/50 text-white shadow-emerald-500/15'
            : 'bg-neutral-900/95 dark:bg-[#0c1017]/95 border-rose-500/50 text-white shadow-rose-500/15'
        }`}
      >
        {type === 'success' ? (
          <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
        ) : (
          <div className="w-5 h-5 rounded-full bg-rose-500/20 flex items-center justify-center shrink-0">
            <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
          </div>
        )}
        <span className="leading-snug">{message}</span>
      </div>
    </div>
  );
};

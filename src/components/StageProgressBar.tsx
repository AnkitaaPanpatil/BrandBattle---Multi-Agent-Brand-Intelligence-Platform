import React from 'react';
import { Lightbulb, Swords, Trophy, Check } from 'lucide-react';

interface StageProgressBarProps {
  currentStage: number; // 1, 2, or 3
  onSelectStage?: (stage: number) => void;
  maxReachedStage: number;
}

export const StageProgressBar: React.FC<StageProgressBarProps> = ({
  currentStage,
  onSelectStage,
  maxReachedStage,
}) => {
  const stages = [
    {
      step: 1,
      title: 'Idea & Search Grounding',
      subtitle: 'Competitors & ICP',
      icon: Lightbulb,
    },
    {
      step: 2,
      title: 'Debate Arena',
      subtitle: 'VC vs Creative vs Skeptic',
      icon: Swords,
    },
    {
      step: 3,
      title: 'Brand Strategy Kit',
      subtitle: 'Synthesis & Visuals',
      icon: Trophy,
    },
  ];

  return (
    <div className="w-full bg-white/80 dark:bg-[#070a10]/80 backdrop-blur-md border-b border-neutral-200 dark:border-[#1a2333] py-2.5 sm:py-3 px-3 sm:px-4 transition-colors sticky top-16 z-30">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-3 gap-1.5 sm:gap-4 relative">
          {stages.map((stage) => {
            const isActive = currentStage === stage.step;
            const isCompleted = maxReachedStage > stage.step;
            const isClickable = stage.step <= maxReachedStage;

            return (
              <button
                key={stage.step}
                type="button"
                disabled={!isClickable}
                onClick={() => isClickable && onSelectStage?.(stage.step)}
                className={`text-left p-2 sm:p-3 rounded-lg transition-all border ${
                  isActive
                    ? 'bg-neutral-100 dark:bg-[#111724] border-neutral-300 dark:border-amber-500/60 shadow-xs ring-1 ring-amber-500/30'
                    : isCompleted
                    ? 'bg-neutral-50 dark:bg-[#0c1017] border-neutral-200 dark:border-[#1a2333] hover:border-neutral-300 dark:hover:border-[#2a3752] cursor-pointer'
                    : 'bg-transparent border-neutral-200 dark:border-[#141b29] opacity-45 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                  <div
                    className={`w-5 sm:w-6 h-5 sm:h-6 rounded flex items-center justify-center text-[10px] sm:text-xs font-semibold shrink-0 ${
                      isActive
                        ? 'bg-amber-500 text-neutral-950 font-bold shadow-sm'
                        : isCompleted
                        ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30'
                        : 'bg-neutral-200 dark:bg-[#141b29] text-neutral-500 dark:text-neutral-400'
                    }`}
                  >
                    {isCompleted && !isActive ? (
                      <Check className="w-3 sm:w-3.5 h-3 sm:h-3.5 stroke-[2.5]" />
                    ) : (
                      <span>0{stage.step}</span>
                    )}
                  </div>
                  <span
                    className={`text-[10px] sm:text-xs font-mono uppercase tracking-wider ${
                      isActive
                        ? 'text-amber-600 dark:text-amber-400 font-semibold'
                        : isCompleted
                        ? 'text-neutral-700 dark:text-neutral-300'
                        : 'text-neutral-400 dark:text-neutral-500'
                    }`}
                  >
                    Stage 0{stage.step}
                  </span>
                </div>
                <div className="text-xs sm:text-sm font-display font-semibold text-neutral-900 dark:text-white truncate">
                  {stage.title}
                </div>
                <div className="text-[10px] sm:text-[11px] text-neutral-500 dark:text-neutral-400 hidden sm:block truncate mt-0.5">
                  {stage.subtitle}
                </div>
              </button>
            );
          })}
        </div>

        {/* Keyboard Navigation Shortcuts Bar */}
        <div className="mt-2 pt-2 border-t border-neutral-200/70 dark:border-[#141b29] flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="text-[10px] uppercase font-semibold text-neutral-400 dark:text-neutral-500">
              Shortcuts:
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-[#121824] border border-neutral-300 dark:border-[#1f293d] text-[10px] text-neutral-800 dark:text-neutral-200 shadow-2xs font-semibold">
                Ctrl + Enter
              </kbd>
              <span>Next Stage</span>
            </span>
            <span>·</span>
            <span className="inline-flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-[#121824] border border-neutral-300 dark:border-[#1f293d] text-[10px] text-neutral-800 dark:text-neutral-200 shadow-2xs font-semibold">
                Ctrl + S
              </kbd>
              <span>Save Kit {currentStage === 3 ? '(Active)' : '(Stage 3)'}</span>
            </span>
            <span>·</span>
            <span className="inline-flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-[#121824] border border-neutral-300 dark:border-[#1f293d] text-[10px] text-neutral-800 dark:text-neutral-200 shadow-2xs font-semibold">
                Esc
              </kbd>
              <span>Close Modals</span>
            </span>
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold hidden md:inline">
            ● Keyboard Nav Ready
          </span>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useRef } from 'react';
import {
  Sparkles,
  ArrowRight,
  Target,
  ShieldAlert,
  Cpu,
  Layers,
  Edit3,
  Check,
  Search,
  ExternalLink,
  TrendingUp,
  AlertCircle,
  Compass,
  ArrowDown,
  Plus,
} from 'lucide-react';
import { ClarifiedIdea } from '../types/brand.js';

interface IdeaIntakeStageProps {
  idea: string;
  setIdea: (val: string) => void;
  clarified: ClarifiedIdea | null;
  setClarified: React.Dispatch<React.SetStateAction<ClarifiedIdea | null>>;
  onClarify: () => Promise<void>;
  onProceedToArena: () => void;
  isLoading: boolean;
}

export const IdeaIntakeStage: React.FC<IdeaIntakeStageProps> = ({
  idea,
  setIdea,
  clarified,
  setClarified,
  onClarify,
  onProceedToArena,
  isLoading,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newConstraint, setNewConstraint] = useState('');
  const [highlightSection, setHighlightSection] = useState(false);

  const editingSectionRef = useRef<HTMLDivElement>(null);
  const constraintsSectionRef = useRef<HTMLDivElement>(null);
  const newConstraintInputRef = useRef<HTMLInputElement>(null);

  const handleNavigateToEditConstraints = (target: 'all' | 'constraints' = 'constraints') => {
    setIsEditing(true);
    setHighlightSection(true);
    setTimeout(() => {
      if (target === 'constraints' && constraintsSectionRef.current) {
        constraintsSectionRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
        newConstraintInputRef.current?.focus();
      } else if (editingSectionRef.current) {
        editingSectionRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    }, 100);

    setTimeout(() => {
      setHighlightSection(false);
    }, 2800);
  };

  const sampleIdeas = [
    {
      label: 'Farm-to-Consumer',
      text: 'An app that helps small regional organic farmers sell directly to suburban families and micro-restaurants, cutting out industrial grocery middlemen.',
      badge: 'AgTech / Marketplace',
    },
    {
      label: 'Harbor Drone Cleanup',
      text: 'Solar-powered autonomous aquatic surface drones that vacuum microplastics and oil slicks from urban harbors and private marinas.',
      badge: 'CleanTech / Hardware',
    },
    {
      label: 'Biomarker Perfume',
      text: 'A luxury fragrance brand that formulates custom bespoke scents monthly based on biometric stress levels and circadian rhythm skin swabs.',
      badge: 'DTC / Bio-Luxury',
    },
    {
      label: 'Neighborhood Tool Library',
      text: 'High-security smart locker kiosks in dense suburban neighborhoods for lending professional power tools, camping gear, and lawn equipment.',
      badge: 'Circular Economy',
    },
  ];

  const handleAddConstraint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newConstraint.trim() || !clarified) return;
    setClarified({
      ...clarified,
      operationalConstraints: [...clarified.operationalConstraints, newConstraint.trim()],
    });
    setNewConstraint('');
  };

  const handleRemoveConstraint = (index: number) => {
    if (!clarified) return;
    setClarified({
      ...clarified,
      operationalConstraints: clarified.operationalConstraints.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-12">
      {/* Intro Hero */}
      <div className="text-center mb-6 sm:mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 dark:bg-[#0c1017] border border-neutral-300 dark:border-[#1a2333] text-xs text-neutral-700 dark:text-neutral-300 mb-3 sm:mb-4 shadow-sm">
          <Search className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
          <span>Stage 01: Intake & Real-Time Market Grounding</span>
        </div>
        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-display font-bold tracking-tight text-neutral-900 dark:text-white mb-2 sm:mb-3">
          Turn Raw Startup Intuition Into an{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-rose-500 to-violet-500 dark:from-amber-400 dark:via-rose-400 dark:to-violet-400">
            Unassailable Brand
          </span>
        </h1>
        <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed">
          Input your raw concept. Stage 1 executes live Google Search grounding to uncover real competitors, saturation risks, and whitespace before deploying the multi-agent debate.
        </p>
      </div>

      {/* Input Box */}
      <div className="bg-white dark:bg-[#0c1017] border border-neutral-200 dark:border-[#1a2333] rounded-xl p-4 sm:p-6 mb-6 shadow-xl relative transition-all">
        <label
          htmlFor="idea-input"
          className="block text-xs font-mono uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2"
        >
          Your Raw Startup or Product Concept
        </label>
        <div className="relative">
          <textarea
            id="idea-input"
            rows={3}
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="e.g., An app that lets local regenerative farmers sell harvest directly to urban consumers..."
            className="w-full bg-neutral-50 dark:bg-[#06080d] border border-neutral-300 dark:border-[#1e2738] rounded-lg p-3 text-xs sm:text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-colors resize-none"
          />
        </div>

        {/* Quick presets (Responsive chips) */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5 sm:gap-2">
          <span className="text-xs text-neutral-500 dark:text-neutral-400 mr-1">Quick Presets:</span>
          {sampleIdeas.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setIdea(sample.text);
                setClarified(null);
              }}
              className="text-[11px] sm:text-xs text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white bg-neutral-100 dark:bg-[#111722] hover:bg-neutral-200 dark:hover:bg-[#182030] border border-neutral-200 dark:border-[#1e2738] px-2.5 py-1 rounded transition-colors"
            >
              {sample.label}
            </button>
          ))}
        </div>

        {/* Submit action */}
        <div className="mt-4 sm:mt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 sm:pt-4 border-t border-neutral-200 dark:border-[#1a2333]">
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            {idea.trim().length > 0
              ? `${idea.trim().split(/\s+/).length} words · Search Grounding Enabled`
              : 'Enter an idea to begin'}
          </span>
          <button
            type="button"
            disabled={!idea.trim() || isLoading}
            onClick={onClarify}
            className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              !idea.trim() || isLoading
                ? 'bg-neutral-200 dark:bg-[#182030] text-neutral-400 dark:text-neutral-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 shadow-lg shadow-amber-500/20 active:scale-[0.98]'
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
                <span>Grounding & Dissecting...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>{clarified ? 'Re-Ground with Search' : 'Ground with Market Search'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Dissection Result & Live Market Grounding Card */}
      {clarified && (
        <div className="bg-white dark:bg-[#0c1017] border border-neutral-200 dark:border-[#1a2333] rounded-xl p-4 sm:p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-300 mb-8 transition-all shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-neutral-200 dark:border-[#1a2333]">
            <div
              onClick={() => handleNavigateToEditConstraints('constraints')}
              className="cursor-pointer group select-none transition-colors"
              title="Click to jump to editing constraints & problem architecture"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-wider text-amber-600 dark:text-amber-400 group-hover:underline flex items-center gap-1">
                  <span>Stage 01 Grounding Dossier</span>
                  <ArrowDown className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </span>
                {clarified.marketGrounding && (
                  <span className="text-[10px] font-mono bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800/80 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Search className="w-3 h-3" />
                    <span>Live Search Verified</span>
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-display font-bold text-neutral-900 dark:text-white mt-0.5 group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors flex items-center gap-2">
                <span>Market Reality & Problem Architecture</span>
                <span className="text-xs font-normal font-sans text-neutral-400 dark:text-neutral-500 hidden sm:inline">
                  (Click to edit constraints)
                </span>
              </h2>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
              <button
                type="button"
                id="btn-edit-constraints"
                onClick={() => {
                  if (!isEditing) {
                    handleNavigateToEditConstraints('constraints');
                  } else {
                    setIsEditing(false);
                  }
                }}
                className={`flex items-center gap-1.5 text-xs px-3.5 py-2 rounded-lg font-semibold transition-all cursor-pointer shadow-xs active:scale-95 ${
                  isEditing
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-neutral-950 shadow-emerald-500/20'
                    : 'text-neutral-800 dark:text-neutral-200 hover:text-neutral-950 dark:hover:text-white bg-neutral-100 hover:bg-neutral-200 dark:bg-[#182030] dark:hover:bg-[#202b40] border border-neutral-300 dark:border-[#222d42]'
                }`}
              >
                {isEditing ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-neutral-950 stroke-[2.5]" />
                    <span>Save Edits</span>
                  </>
                ) : (
                  <>
                    <Edit3 className="w-3.5 h-3.5 text-amber-500" />
                    <span>Edit Constraints</span>
                    <ArrowDown className="w-3 h-3 ml-0.5 text-neutral-400" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Market Grounding Live Findings */}
          {clarified.marketGrounding && (
            <div className="mb-6 p-4 rounded-xl bg-blue-50/60 dark:bg-[#0e1626] border border-blue-200 dark:border-blue-900/40">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-700 dark:text-blue-400">
                  <TrendingUp className="w-4 h-4" />
                  <span>Real-World Competitors & Market Signals</span>
                </div>
                <span
                  className={`text-[11px] font-mono px-2 py-0.5 rounded border ${
                    clarified.marketGrounding.saturationRisk === 'High'
                      ? 'bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-800'
                      : 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800'
                  }`}
                >
                  Saturation: {clarified.marketGrounding.saturationRisk}
                </span>
              </div>

              {/* Identified Competitors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 mb-3">
                {clarified.marketGrounding.competitors.map((comp, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-white dark:bg-[#070a10] border border-neutral-200 dark:border-[#1a2333] text-xs"
                  >
                    <div className="font-semibold text-neutral-900 dark:text-white mb-0.5 flex items-center justify-between">
                      <span>{comp.name}</span>
                    </div>
                    <p className="text-[11px] text-neutral-600 dark:text-neutral-400 mb-1">{comp.positioning}</p>
                    <div className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">
                      Gap: {comp.weaknessOrGap}
                    </div>
                  </div>
                ))}
              </div>

              {/* White Space Opportunity */}
              <div className="p-3 rounded-lg bg-white dark:bg-[#070a10] border border-neutral-200 dark:border-[#1a2333] text-xs">
                <div className="text-[11px] font-mono uppercase text-emerald-600 dark:text-emerald-400 font-bold mb-1">
                  Validated White-Space Opportunity
                </div>
                <p className="text-neutral-800 dark:text-neutral-200">{clarified.marketGrounding.whiteSpaceOpportunity}</p>
              </div>

              {/* Sources */}
              {clarified.marketGrounding.sources.length > 0 && (
                <div className="mt-2.5 flex flex-wrap items-center gap-2 text-[11px] text-neutral-500">
                  <span>Grounded via:</span>
                  {clarified.marketGrounding.sources.map((src, i) => (
                    <a
                      key={i}
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      <span>{src.title}</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Problem & Audience Grid */}
          <div
            ref={editingSectionRef}
            id="problem-architecture-section"
            className={`grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 transition-all duration-300 ${
              highlightSection
                ? 'ring-2 ring-amber-500/40 rounded-xl p-1 bg-amber-500/5'
                : ''
            }`}
          >
            <div className="bg-neutral-50 dark:bg-[#070a10] border border-neutral-200 dark:border-[#1a2333] rounded-lg p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-rose-600 dark:text-rose-400 mb-1.5">
                <Target className="w-4 h-4" />
                <span>Extracted Problem Statement</span>
              </div>
              {isEditing ? (
                <textarea
                  value={clarified.problemStatement}
                  onChange={(e) => setClarified({ ...clarified, problemStatement: e.target.value })}
                  className="w-full text-xs bg-white dark:bg-[#111722] border border-neutral-300 dark:border-[#222d42] focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded p-2 text-neutral-900 dark:text-neutral-100 transition-colors"
                  rows={3}
                />
              ) : (
                <p className="text-xs sm:text-sm text-neutral-800 dark:text-neutral-200 leading-relaxed">
                  {clarified.problemStatement}
                </p>
              )}
            </div>

            <div className="bg-neutral-50 dark:bg-[#070a10] border border-neutral-200 dark:border-[#1a2333] rounded-lg p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-cyan-400 mb-1.5">
                <Layers className="w-4 h-4" />
                <span>Primary Target Audience (ICP)</span>
              </div>
              {isEditing ? (
                <textarea
                  value={clarified.targetAudience}
                  onChange={(e) => setClarified({ ...clarified, targetAudience: e.target.value })}
                  className="w-full text-xs bg-white dark:bg-[#111722] border border-neutral-300 dark:border-[#222d42] focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded p-2 text-neutral-900 dark:text-neutral-100 transition-colors"
                  rows={3}
                />
              ) : (
                <p className="text-xs sm:text-sm text-neutral-800 dark:text-neutral-200 leading-relaxed">
                  {clarified.targetAudience}
                </p>
              )}
            </div>

            <div className="bg-neutral-50 dark:bg-[#070a10] border border-neutral-200 dark:border-[#1a2333] rounded-lg p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1.5">
                <Sparkles className="w-4 h-4" />
                <span>Core Leverage & Value Driver</span>
              </div>
              {isEditing ? (
                <textarea
                  value={clarified.coreValueDriver}
                  onChange={(e) => setClarified({ ...clarified, coreValueDriver: e.target.value })}
                  className="w-full text-xs bg-white dark:bg-[#111722] border border-neutral-300 dark:border-[#222d42] focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded p-2 text-neutral-900 dark:text-neutral-100 transition-colors"
                  rows={3}
                />
              ) : (
                <p className="text-xs sm:text-sm text-neutral-800 dark:text-neutral-200 leading-relaxed">
                  {clarified.coreValueDriver}
                </p>
              )}
            </div>

            <div className="bg-neutral-50 dark:bg-[#070a10] border border-neutral-200 dark:border-[#1a2333] rounded-lg p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 dark:text-amber-400 mb-1.5">
                <ShieldAlert className="w-4 h-4" />
                <span>Critical Adoption Friction</span>
              </div>
              {isEditing ? (
                <textarea
                  value={clarified.keyChallenge}
                  onChange={(e) => setClarified({ ...clarified, keyChallenge: e.target.value })}
                  className="w-full text-xs bg-white dark:bg-[#111722] border border-neutral-300 dark:border-[#222d42] focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded p-2 text-neutral-900 dark:text-neutral-100 transition-colors"
                  rows={3}
                />
              ) : (
                <p className="text-xs sm:text-sm text-neutral-800 dark:text-neutral-200 leading-relaxed">
                  {clarified.keyChallenge}
                </p>
              )}
            </div>
          </div>

          {/* Operational Constraints */}
          <div
            ref={constraintsSectionRef}
            id="operational-constraints-section"
            className={`rounded-xl p-4 mb-6 transition-all duration-300 ${
              highlightSection
                ? 'bg-amber-50/50 dark:bg-amber-950/20 border-2 border-amber-500 ring-4 ring-amber-500/20 shadow-xl'
                : 'bg-neutral-50 dark:bg-[#070a10] border border-neutral-200 dark:border-[#1a2333]'
            }`}
          >
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-neutral-200/80 dark:border-[#1a2333]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                  Operational & Unit Constraints
                </span>
                {isEditing && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/30 flex items-center gap-1 animate-pulse">
                    <Edit3 className="w-2.5 h-2.5" />
                    <span>Editing Mode Active</span>
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-neutral-500 hidden sm:inline">
                  Inputs feeding the debate personas
                </span>
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 border border-emerald-300 dark:border-emerald-800/60 px-2 py-0.5 rounded font-semibold transition-colors cursor-pointer"
                  >
                    <Check className="w-3 h-3" />
                    <span>Done</span>
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              {clarified.operationalConstraints.map((constraint, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between bg-white dark:bg-[#0c1017] border border-neutral-200 dark:border-[#1a2333] px-3 py-2 rounded-lg text-xs text-neutral-800 dark:text-neutral-200"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                    <span>{constraint}</span>
                  </div>
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => handleRemoveConstraint(i)}
                      className="text-neutral-400 hover:text-rose-500 text-xs px-1.5 py-0.5 rounded hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>

            {isEditing && (
              <form onSubmit={handleAddConstraint} className="mt-3 flex gap-2">
                <input
                  ref={newConstraintInputRef}
                  type="text"
                  placeholder="Add another constraint (e.g. Must work offline, <$10/mo pricing)..."
                  value={newConstraint}
                  onChange={(e) => setNewConstraint(e.target.value)}
                  className="flex-1 bg-white dark:bg-[#111722] border border-neutral-300 dark:border-[#222d42] focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-lg px-3 py-1.5 text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none transition-colors"
                />
                <button
                  type="submit"
                  disabled={!newConstraint.trim()}
                  className="flex items-center gap-1 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Add Constraint</span>
                </button>
              </form>
            )}
          </div>

          {/* CTA to Enter Arena */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-neutral-200 dark:border-[#1a2333]">
            <div className="text-xs text-neutral-500 dark:text-neutral-400 text-center sm:text-left">
              Search grounding complete. The 3 AI Personas are armed with market intelligence and ready to clash.
            </div>
            <button
              onClick={onProceedToArena}
              title="Deploy Multi-Agent Arena (Ctrl+Enter)"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-xs sm:text-sm font-bold bg-gradient-to-r from-amber-500 via-rose-500 to-violet-600 hover:from-amber-400 hover:via-rose-400 hover:to-violet-500 text-neutral-950 shadow-xl shadow-rose-500/20 active:scale-[0.98] transition-all"
            >
              <span>Deploy Multi-Agent Arena</span>
              <kbd className="hidden sm:inline-block ml-1 px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-black/20 rounded border border-black/10">
                Ctrl+↵
              </kbd>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

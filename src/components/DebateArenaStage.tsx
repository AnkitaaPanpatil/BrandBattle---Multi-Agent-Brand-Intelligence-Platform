import React, { useState } from 'react';
import {
  Swords,
  TrendingUp,
  Palette,
  Flame,
  ArrowRight,
  AlertTriangle,
  Zap,
  CheckCircle2,
  RefreshCw,
  ListFilter,
  BookOpen,
  Quote,
  Layers,
} from 'lucide-react';
import { DebateStage, AgentResponse } from '../types/brand.js';
import { PersonaProfileCards, PERSONA_PROFILES } from './PersonaProfileCards.js';
import { AgentRadarChart } from './AgentRadarChart.js';

interface DebateArenaStageProps {
  debate: DebateStage | null;
  onSynthesize: () => void;
  onReDebate: () => void;
  isLoading: boolean;
  isSynthesizing: boolean;
}

export const DebateArenaStage: React.FC<DebateArenaStageProps> = ({
  debate,
  onSynthesize,
  onReDebate,
  isLoading,
  isSynthesizing,
}) => {
  const [activeTab, setActiveTab] = useState<'arena' | 'radar' | 'personas' | 'crossfire' | 'consensus'>('arena');
  const [mobileAgentFilter, setMobileAgentFilter] = useState<'all' | 'vc' | 'creative' | 'skeptic'>('all');
  const [expandedBios, setExpandedBios] = useState<Record<string, boolean>>({});

  const toggleCardBio = (id: string) => {
    setExpandedBios((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 sm:py-16 text-center">
        <div className="relative inline-flex items-center justify-center mb-6">
          <div className="w-16 sm:w-20 h-16 sm:h-20 rounded-full border-4 border-violet-500/20 border-t-violet-500 animate-spin" />
          <Swords className="w-7 sm:w-8 h-7 sm:h-8 text-violet-400 absolute" />
        </div>
        <h2 className="text-xl sm:text-2xl font-display font-bold text-neutral-900 dark:text-white mb-2">
          Multi-Agent Debate in Progress...
        </h2>
        <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 max-w-md mx-auto mb-6">
          Marcus (VC), Solenne (Creative), and Jax (Skeptic) are analyzing unit economics, cultural resonance, and operational death traps simultaneously.
        </p>

        {/* Live Arena Simulation Ticker */}
        <div className="max-w-md mx-auto bg-white dark:bg-[#0c1017] border border-neutral-200 dark:border-[#1a2333] rounded-lg p-3.5 text-xs font-mono text-left space-y-2 shadow-lg mb-10">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Marcus (VC): Reviewing TAM & margin defensibility...</span>
          </div>
          <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400">
            <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse delay-100" />
            <span>Solenne (Creative): Scrutinizing narrative soul & identity...</span>
          </div>
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse delay-200" />
            <span>Jax (Skeptic): Stress-testing cold-start & startup clichés...</span>
          </div>
        </div>

        {/* Preview of the 3 Arena Personas while waiting */}
        <div className="text-left pt-6 border-t border-neutral-200 dark:border-[#1a2333]">
          <PersonaProfileCards compact showHeading={true} />
        </div>
      </div>
    );
  }

  if (!debate) {
    return null;
  }

  const agents: AgentResponse[] = [debate.vc, debate.creative, debate.skeptic];
  const displayedAgents =
    mobileAgentFilter === 'all' ? agents : agents.filter((a) => a.id === mobileAgentFilter);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-12">
      {/* Arena Header */}
      <div className="text-center mb-6 sm:mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 dark:bg-[#0c1017] border border-neutral-300 dark:border-[#1a2333] text-xs text-neutral-700 dark:text-neutral-300 mb-3 shadow-sm">
          <Swords className="w-3.5 h-3.5 text-rose-500" />
          <span>Stage 02: Multi-Agent Arena Debate</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-display font-bold text-neutral-900 dark:text-white tracking-tight mb-2">
          Three Specialized Minds. Zero Groupthink.
        </h1>
        <p className="text-xs sm:text-base text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
          Every enduring brand is forged in the clash between scale economics, cultural defiance, and ruthless reality-testing.
        </p>

        {/* Quick Intel Banner */}
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('radar')}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-colors shadow-2xs ${
              activeTab === 'radar'
                ? 'bg-violet-100 dark:bg-violet-950/60 text-violet-900 dark:text-violet-200 border-violet-300 dark:border-violet-700 font-semibold ring-1 ring-violet-500/30'
                : 'bg-neutral-100 dark:bg-[#0c1017] hover:bg-neutral-200 dark:hover:bg-[#151c2a] text-neutral-700 dark:text-neutral-300 border-neutral-300 dark:border-[#1a2333]'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-violet-500" />
            <span>D3 Strategy Radar Chart: 6 Core Pillars</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('personas')}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-colors shadow-2xs ${
              activeTab === 'personas'
                ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-700 font-semibold'
                : 'bg-neutral-100 dark:bg-[#0c1017] hover:bg-neutral-200 dark:hover:bg-[#151c2a] text-neutral-700 dark:text-neutral-300 border-neutral-300 dark:border-[#1a2333]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-500" />
            <span>Debater Profiles: Bios &amp; Styles</span>
          </button>
        </div>

        {/* View Switcher */}
        <div className="mt-5 flex justify-center overflow-x-auto pb-1">
          <div className="inline-flex p-1 bg-neutral-100 dark:bg-[#0c1017] border border-neutral-200 dark:border-[#1a2333] rounded-lg shrink-0 gap-0.5">
            <button
              onClick={() => setActiveTab('arena')}
              className={`px-3 sm:px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
                activeTab === 'arena'
                  ? 'bg-white dark:bg-[#182030] text-neutral-900 dark:text-white shadow-sm border border-transparent dark:border-[#222d42]'
                  : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200'
              }`}
            >
              Agent Arguments
            </button>
            <button
              onClick={() => setActiveTab('radar')}
              className={`px-3 sm:px-4 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                activeTab === 'radar'
                  ? 'bg-white dark:bg-[#182030] text-neutral-900 dark:text-white shadow-sm border border-transparent dark:border-[#222d42]'
                  : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-violet-500" />
              <span>Strategy Radar (D3)</span>
            </button>
            <button
              onClick={() => setActiveTab('personas')}
              className={`px-3 sm:px-4 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                activeTab === 'personas'
                  ? 'bg-white dark:bg-[#182030] text-neutral-900 dark:text-white shadow-sm border border-transparent dark:border-[#222d42]'
                  : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-500" />
              <span>Persona Profiles</span>
            </button>
            <button
              onClick={() => setActiveTab('crossfire')}
              className={`px-3 sm:px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
                activeTab === 'crossfire'
                  ? 'bg-white dark:bg-[#182030] text-neutral-900 dark:text-white shadow-sm border border-transparent dark:border-[#222d42]'
                  : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200'
              }`}
            >
              Direct Crossfire
            </button>
            <button
              onClick={() => setActiveTab('consensus')}
              className={`px-3 sm:px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
                activeTab === 'consensus'
                  ? 'bg-white dark:bg-[#182030] text-neutral-900 dark:text-white shadow-sm border border-transparent dark:border-[#222d42]'
                  : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200'
              }`}
            >
              Arbiter Consensus
            </button>
          </div>
        </div>

        {/* Mobile Filter Pill */}
        {activeTab === 'arena' && (
          <div className="flex md:hidden justify-center items-center gap-1.5 mt-3">
            <span className="text-[11px] text-neutral-500 flex items-center gap-1">
              <ListFilter className="w-3 h-3" /> View:
            </span>
            {(['all', 'vc', 'creative', 'skeptic'] as const).map((filterId) => (
              <button
                key={filterId}
                onClick={() => setMobileAgentFilter(filterId)}
                className={`px-2.5 py-0.5 text-[11px] font-medium rounded-full border transition-colors ${
                  mobileAgentFilter === filterId
                    ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-950 border-transparent font-bold'
                    : 'bg-neutral-100 dark:bg-[#0c1017] text-neutral-600 dark:text-neutral-400 border-neutral-300 dark:border-[#1a2333]'
                }`}
              >
                {filterId === 'all'
                  ? 'All 3'
                  : filterId === 'vc'
                  ? 'Marcus (VC)'
                  : filterId === 'creative'
                  ? 'Solenne (Creative)'
                  : 'Jax (Skeptic)'}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tab 1: Arena Dossiers */}
      {activeTab === 'arena' && (
        <>
          {/* Quick Visual Bar jumping to D3 Radar Matrix */}
          <div className="mb-6 p-3 sm:p-4 rounded-xl bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-emerald-500/10 border border-violet-500/20 dark:border-violet-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-violet-600 text-white flex items-center justify-center shrink-0 shadow-md">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-display font-bold text-neutral-900 dark:text-white">
                  D3.js Radar Evaluation Matrix Ready
                </div>
                <p className="text-[11px] text-neutral-600 dark:text-neutral-400">
                  Visualize Viability, Innovation, Market Fit, Scalability, Brand Soul, and Execution Feasibility across all 3 personas.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('radar')}
              className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white shadow-sm transition-all shrink-0 cursor-pointer"
            >
              <span>Open D3 Radar</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 mb-8">
            {displayedAgents.map((agent) => {
            const isVc = agent.id === 'vc';
            const isCreative = agent.id === 'creative';
            const isSkeptic = agent.id === 'skeptic';

            const borderColor = isVc
              ? 'border-emerald-300 dark:border-emerald-900/60'
              : isCreative
              ? 'border-violet-300 dark:border-violet-900/60'
              : 'border-amber-300 dark:border-amber-900/60';

            const accentBadgeBg = isVc
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800/60'
              : isCreative
              ? 'bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-400 border-violet-300 dark:border-violet-800/60'
              : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800/60';

            const Icon = isVc ? TrendingUp : isCreative ? Palette : Flame;
            const persona = PERSONA_PROFILES.find((p) => p.id === agent.id);

            return (
              <div
                key={agent.id}
                className={`bg-white dark:bg-[#0c1017] border ${borderColor} rounded-xl p-4 sm:p-5 flex flex-col justify-between transition-all shadow-md dark:shadow-xl`}
              >
                <div>
                  {/* Persona Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-9 sm:w-10 h-9 sm:h-10 rounded-lg flex items-center justify-center ${accentBadgeBg} border shrink-0`}
                      >
                        <Icon className="w-4 sm:w-5 h-4 sm:h-5" />
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-sm sm:text-base text-neutral-900 dark:text-white">
                          {agent.name}
                        </h3>
                        <div className="text-[11px] sm:text-xs text-neutral-500 dark:text-neutral-400">
                          {agent.role}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stance tag */}
                  <div className="mb-3">
                    <span
                      className={`inline-block text-[11px] font-mono tracking-wide px-2 py-0.5 rounded border ${accentBadgeBg}`}
                    >
                      {agent.stance}
                    </span>
                  </div>

                  {/* Persona Biography & Debating Style Highlight */}
                  {persona && (
                    <div className="mb-4 bg-neutral-50/90 dark:bg-[#070a10] border border-neutral-200 dark:border-[#1a2333] rounded-lg p-3 transition-colors">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-semibold flex items-center gap-1">
                          <Zap className="w-3 h-3 text-amber-500" />
                          <span>Combat Style</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleCardBio(agent.id)}
                          className="text-[10px] font-mono text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-0.5"
                        >
                          {expandedBios[agent.id] ? 'Hide Bio' : 'View Bio & Lore'}
                        </button>
                      </div>

                      <p className="text-[11px] sm:text-xs text-neutral-700 dark:text-neutral-300 italic mb-1 leading-snug">
                        "{persona.debatingStyle}"
                      </p>

                      {expandedBios[agent.id] && (
                        <div className="mt-2.5 pt-2 border-t border-neutral-200 dark:border-[#162030] space-y-2 animate-in fade-in duration-150 text-[11px] sm:text-xs">
                          <div>
                            <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 dark:text-neutral-400 block font-semibold mb-0.5">
                              Biography:
                            </span>
                            <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed font-sans">
                              {persona.biography}
                            </p>
                          </div>
                          <div className="bg-neutral-100 dark:bg-[#0e1420] p-2 rounded border border-neutral-200 dark:border-[#1a2538] text-[10px] font-mono">
                            <span className="text-neutral-500 dark:text-neutral-400">Battle Motto: </span>
                            <span className="text-neutral-800 dark:text-neutral-200 font-serif italic">"{persona.coreMotto}"</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Opening Thesis */}
                  <div className="mb-4 bg-neutral-50 dark:bg-[#070a10] border border-neutral-200 dark:border-[#1a2333] rounded-lg p-3">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 dark:text-neutral-400 block mb-1">
                      Opening Diagnosis
                    </span>
                    <p className="text-xs sm:text-sm text-neutral-800 dark:text-neutral-200 leading-relaxed italic">
                      "{agent.openingThesis}"
                    </p>
                  </div>

                  {/* Core Arguments */}
                  <div className="space-y-2.5 mb-4">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 dark:text-neutral-400 block">
                      Core Pillars
                    </span>
                    {agent.arguments.map((arg, idx) => (
                      <div
                        key={idx}
                        className="bg-neutral-50 dark:bg-[#070a10]/80 border border-neutral-200 dark:border-[#1a2333] rounded-md p-2.5 sm:p-3 text-xs"
                      >
                        <div className="font-semibold text-neutral-900 dark:text-neutral-100 mb-1 flex items-center gap-1.5">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isVc ? 'bg-emerald-500' : isCreative ? 'bg-violet-500' : 'bg-amber-500'
                            }`}
                          />
                          <span>{arg.point}</span>
                        </div>
                        <p className="text-neutral-600 dark:text-neutral-400 leading-normal text-[11px] sm:text-xs">
                          {arg.rationale}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Blindspots */}
                  <div className="mb-4">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-rose-600 dark:text-rose-400 block mb-1">
                      Identified Traps & Blindspots
                    </span>
                    <ul className="space-y-1.5 text-xs text-neutral-700 dark:text-neutral-300">
                      {agent.blindspotsOrRisks.map((risk, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                          <span className="text-[11px] sm:text-xs">{risk}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Scorecard */}
                <div className="pt-3 border-t border-neutral-200 dark:border-[#1a2333]">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">
                      {agent.scorecard.metric}
                    </span>
                    <span className="text-xs sm:text-sm font-mono font-bold text-neutral-900 dark:text-white">
                      {agent.scorecard.score}/100
                    </span>
                  </div>
                  <div className="w-full bg-neutral-200 dark:bg-[#070a10] rounded-full h-1.5 mb-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        isVc ? 'bg-emerald-500' : isCreative ? 'bg-violet-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${agent.scorecard.score}%` }}
                    />
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-neutral-500 dark:text-neutral-400 italic">
                    Verdict: {agent.scorecard.verdict}
                  </p>
                </div>
              </div>
            );
          })}
          </div>
        </>
      )}

      {/* Tab: D3 Strategy Radar Chart */}
      {activeTab === 'radar' && (
        <div className="mb-8 animate-in fade-in duration-200">
          <AgentRadarChart
            debate={debate}
            activePersonaFilter={mobileAgentFilter}
            onPersonaSelect={setMobileAgentFilter}
          />
        </div>
      )}

      {/* Tab: Persona Profiles (Bios & Combat Styles) */}
      {activeTab === 'personas' && (
        <div className="mb-8 animate-in fade-in duration-200">
          <PersonaProfileCards
            showHeading={true}
            onSelectPersona={(id) => {
              setMobileAgentFilter(id);
              setActiveTab('arena');
            }}
          />
        </div>
      )}

      {/* Tab 2: Direct Crossfire */}
      {activeTab === 'crossfire' && (
        <div className="max-w-4xl mx-auto space-y-4 mb-8">
          <div className="bg-white dark:bg-[#0c1017] border border-neutral-200 dark:border-[#1a2333] rounded-xl p-4 sm:p-5 shadow-sm">
            <h3 className="font-display font-semibold text-neutral-900 dark:text-white text-sm sm:text-base mb-1">
              Arena Clash Synopsis
            </h3>
            <p className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
              {debate.clashSummary}
            </p>
          </div>

          <div className="bg-white dark:bg-[#0c1017] border border-emerald-200 dark:border-emerald-900/40 rounded-xl p-4 sm:p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-1 mb-2 pb-2 border-b border-neutral-200 dark:border-[#1a2333]">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                <TrendingUp className="w-4 h-4" />
                <span>Marcus (VC)</span>
                <span className="text-neutral-400 font-normal">→</span>
                <span className="text-violet-700 dark:text-violet-400">Solenne (Creative)</span>
              </div>
              <span className="text-[10px] font-mono text-neutral-400">Unit Economics vs Vibe</span>
            </div>
            <p className="text-xs sm:text-sm text-neutral-800 dark:text-neutral-200 italic leading-relaxed">
              "{debate.vc.rebuttalToOthers.critique}"
            </p>
          </div>

          <div className="bg-white dark:bg-[#0c1017] border border-violet-200 dark:border-violet-900/40 rounded-xl p-4 sm:p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-1 mb-2 pb-2 border-b border-neutral-200 dark:border-[#1a2333]">
              <div className="flex items-center gap-1.5 text-xs font-bold text-violet-700 dark:text-violet-400">
                <Palette className="w-4 h-4" />
                <span>Solenne (Creative)</span>
                <span className="text-neutral-400 font-normal">→</span>
                <span className="text-amber-700 dark:text-amber-400">Jax (Skeptic)</span>
              </div>
              <span className="text-[10px] font-mono text-neutral-400">Belief vs Cynicism</span>
            </div>
            <p className="text-xs sm:text-sm text-neutral-800 dark:text-neutral-200 italic leading-relaxed">
              "{debate.creative.rebuttalToOthers.critique}"
            </p>
          </div>

          <div className="bg-white dark:bg-[#0c1017] border border-amber-200 dark:border-amber-900/40 rounded-xl p-4 sm:p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-1 mb-2 pb-2 border-b border-neutral-200 dark:border-[#1a2333]">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400">
                <Flame className="w-4 h-4" />
                <span>Jax (Skeptic)</span>
                <span className="text-neutral-400 font-normal">→</span>
                <span className="text-emerald-700 dark:text-emerald-400">Marcus (VC)</span>
              </div>
              <span className="text-[10px] font-mono text-neutral-400">Vanity TAM vs Churn</span>
            </div>
            <p className="text-xs sm:text-sm text-neutral-800 dark:text-neutral-200 italic leading-relaxed">
              "{debate.skeptic.rebuttalToOthers.critique}"
            </p>
          </div>
        </div>
      )}

      {/* Tab 3: Consensus */}
      {activeTab === 'consensus' && (
        <div className="max-w-4xl mx-auto space-y-5 mb-8">
          <div className="bg-white dark:bg-[#0c1017] border border-neutral-200 dark:border-[#1a2333] rounded-xl p-4 sm:p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-3 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <h3 className="font-display font-bold text-sm sm:text-base text-neutral-900 dark:text-white">
                Unanimous Strategic Consensus
              </h3>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-3 sm:mb-4">
              Points where all three agents agreed this brand MUST comply:
            </p>
            <div className="space-y-2">
              {debate.keyConsensus.map((point, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 bg-neutral-50 dark:bg-[#070a10] border border-neutral-200 dark:border-[#1a2333] px-3 py-2 rounded-lg text-xs text-neutral-800 dark:text-neutral-200"
                >
                  <span className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/20 flex items-center justify-center shrink-0 text-[10px] font-mono">
                    {idx + 1}
                  </span>
                  <span>{point}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-r from-violet-50 via-white to-rose-50 dark:from-[#110f1c] dark:via-[#0c1017] dark:to-[#170e13] border border-violet-200 dark:border-violet-900/40 rounded-xl p-4 sm:p-6 shadow-sm">
            <div className="flex items-center gap-2 text-violet-700 dark:text-violet-400 mb-1.5">
              <Zap className="w-4 h-4" />
              <span className="text-xs font-mono uppercase tracking-wider font-semibold">
                Dialectical Tension to Resolve
              </span>
            </div>
            <h4 className="text-base sm:text-lg font-display font-bold text-neutral-900 dark:text-white mb-2">
              {debate.unresolvedTension}
            </h4>
            <div className="pt-2 border-t border-neutral-200 dark:border-[#1a2333] text-xs text-neutral-700 dark:text-neutral-300">
              <strong className="text-amber-600 dark:text-amber-400">Arbiter Directive: </strong>
              {debate.arbiterNote}
            </div>
          </div>
        </div>
      )}

      {/* Arena Footer Action Bar */}
      <div className="bg-white dark:bg-[#0c1017] border border-neutral-200 dark:border-[#1a2333] rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 transition-colors shadow-lg">
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
          <button
            onClick={onReDebate}
            disabled={isLoading || isSynthesizing}
            className="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white px-3 py-2 bg-neutral-100 dark:bg-[#070a10] border border-neutral-300 dark:border-[#1a2333] rounded-lg hover:border-neutral-400 dark:hover:border-[#222d42] transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Re-Run Clash</span>
          </button>
          <span className="text-xs text-neutral-500 hidden md:inline">
            Debate concluded. Ready for Chief Arbiter synthesis.
          </span>
        </div>

        <button
          onClick={onSynthesize}
          disabled={isSynthesizing}
          title="Synthesize Brand Strategy Kit (Ctrl+Enter)"
          className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-xs sm:text-sm font-bold transition-all ${
            isSynthesizing
              ? 'bg-neutral-200 dark:bg-[#182030] text-neutral-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-amber-500 via-rose-500 to-violet-600 hover:from-amber-400 hover:via-rose-400 hover:to-violet-500 text-neutral-950 shadow-xl shadow-amber-500/20 active:scale-[0.98]'
          }`}
        >
          {isSynthesizing ? (
            <>
              <div className="w-4 h-4 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
              <span>Synthesizing Strategy Kit...</span>
            </>
          ) : (
            <>
              <span>Synthesize Brand Strategy Kit</span>
              <kbd className="hidden sm:inline-block ml-1 px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-black/20 rounded border border-black/10">
                Ctrl+↵
              </kbd>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

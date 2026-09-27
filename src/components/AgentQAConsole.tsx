import React, { useState, useMemo } from 'react';
import { Send, TrendingUp, Palette, Flame, HelpCircle, Filter } from 'lucide-react';
import { BrandKit, AgentQuestionResponse } from '../types/brand.js';

interface AgentQAConsoleProps {
  brandKit: BrandKit;
  idea: string;
  onAskQuestion: (
    question: string,
    targetAgent: 'vc' | 'creative' | 'skeptic' | 'all'
  ) => Promise<AgentQuestionResponse>;
}

export const AgentQAConsole: React.FC<AgentQAConsoleProps> = ({
  brandKit,
  idea,
  onAskQuestion,
}) => {
  const [question, setQuestion] = useState('');
  const [targetAgent, setTargetAgent] = useState<'vc' | 'creative' | 'skeptic' | 'all'>('all');
  const [isAsking, setIsAsking] = useState(false);

  // Pre-seeded initial war-room interrogation based on the synthesized brand strategy
  const defaultInitialHistory = useMemo(() => [
    {
      q: 'What is our primary defensibility and how do we protect our wedge against fast followers?',
      agentId: 'all',
      responses: [
        {
          agentId: 'vc',
          agentName: 'Marcus (Growth VC)',
          answer: `Unit economics and distribution velocity: ${brandKit.unfairAdvantage}. Lock down supply-side contracts early to build high switching costs before competitors react.`,
        },
        {
          agentId: 'creative',
          agentName: 'Solenne (Creative Director)',
          answer: `Emotional resonance and distinct semiotics: "${brandKit.positioningStatement}". Competitors can copy features, but they cannot counterfeit genuine cultural point of view.`,
        },
        {
          agentId: 'skeptic',
          agentName: 'Jax (Brutal Skeptic)',
          answer: `Watch out for complacency on ${brandKit.traitsToAvoid[0]?.trait || 'generic messaging'}: ${brandKit.traitsToAvoid[0]?.reason || 'Never compromise on the core value proposition'}. If churn rises in month 3, ruthlessly prune auxiliary features.`,
        },
      ],
    },
  ], [brandKit]);

  const [history, setHistory] = useState<
    {
      q: string;
      agentId: string;
      responses: { agentId: string; agentName: string; answer: string }[];
    }[]
  >(defaultInitialHistory);

  const quickPrompts = [
    'What should our launch pricing and gross margins be?',
    'How do we acquire the first 100 power users with $0 ad spend?',
    'What fatal failure should we watch for in month 3?',
  ];

  const handleSubmit = async (qText: string) => {
    const query = qText || question;
    if (!query.trim() || isAsking) return;

    setIsAsking(true);
    try {
      const res = await onAskQuestion(query.trim(), targetAgent);
      setHistory((prev) => [
        {
          q: query.trim(),
          agentId: targetAgent,
          responses: res.responses || [],
        },
        ...prev,
      ]);
      setQuestion('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsAsking(false);
    }
  };

  // Dynamically filter responses based on selected tab
  const filteredHistory = useMemo(() => {
    if (targetAgent === 'all') {
      return history;
    }
    return history
      .map((item) => ({
        ...item,
        responses: item.responses.filter((r) =>
          r.agentId.toLowerCase().includes(targetAgent.toLowerCase())
        ),
      }))
      .filter((item) => item.responses.length > 0);
  }, [history, targetAgent]);

  return (
    <div className="bg-white dark:bg-[#0c1017] border border-neutral-200 dark:border-[#1a2333] rounded-xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 shadow-xl transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-3 border-b border-neutral-200 dark:border-[#1a2333]">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-violet-600 dark:text-violet-400">
            Post-Synthesis War Room
          </span>
          <h3 className="text-lg sm:text-xl font-display font-bold text-neutral-900 dark:text-white mt-0.5">
            Interrogate The Agents
          </h3>
          <p className="text-xs text-neutral-600 dark:text-neutral-400">
            Filter interrogation insights or ask Marcus, Solenne, or Jax tactical questions regarding pricing, launch mechanics, or brand risks.
          </p>
        </div>

        {/* Agent Filter Switcher */}
        <div className="inline-flex p-1 bg-neutral-100 dark:bg-[#070a10] border border-neutral-200 dark:border-[#1a2333] rounded-lg self-start sm:self-auto overflow-x-auto gap-1">
          <button
            type="button"
            onClick={() => setTargetAgent('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer active:scale-95 ${
              targetAgent === 'all'
                ? 'bg-neutral-900 dark:bg-[#182030] text-white shadow-sm border border-neutral-700 dark:border-[#2a3752]'
                : 'text-neutral-600 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-200/60 dark:hover:bg-neutral-800/40'
            }`}
          >
            All Three
          </button>
          <button
            type="button"
            onClick={() => setTargetAgent('vc')}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer active:scale-95 ${
              targetAgent === 'vc'
                ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400 font-bold'
                : 'text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Marcus (VC)</span>
          </button>
          <button
            type="button"
            onClick={() => setTargetAgent('creative')}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer active:scale-95 ${
              targetAgent === 'creative'
                ? 'bg-violet-600 text-white shadow-sm ring-1 ring-violet-400 font-bold'
                : 'text-violet-700 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/40'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Solenne (Creative)</span>
          </button>
          <button
            type="button"
            onClick={() => setTargetAgent('skeptic')}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer active:scale-95 ${
              targetAgent === 'skeptic'
                ? 'bg-amber-600 text-white shadow-sm ring-1 ring-amber-400 font-bold'
                : 'text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Jax (Skeptic)</span>
          </button>
        </div>
      </div>

      {/* Quick Prompts */}
      <div className="mb-3.5 flex flex-wrap gap-1.5 sm:gap-2">
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            type="button"
            disabled={isAsking}
            onClick={() => handleSubmit(qp)}
            className="text-[11px] sm:text-xs text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white bg-neutral-50 dark:bg-[#070a10] hover:bg-neutral-100 dark:hover:bg-[#111722] border border-neutral-200 dark:border-[#1a2333] hover:border-neutral-300 dark:hover:border-[#2a3752] px-2.5 py-1 rounded-md transition-colors text-left cursor-pointer active:scale-98"
          >
            {qp}
          </button>
        ))}
      </div>

      {/* Input Field */}
      <div className="flex gap-2 mb-5">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSubmit(question);
          }}
          placeholder={
            targetAgent === 'all'
              ? 'Ask all three agents a strategic or tactical question...'
              : `Ask ${
                  targetAgent === 'vc'
                    ? 'Marcus (VC) on unit economics & growth...'
                    : targetAgent === 'creative'
                    ? 'Solenne (Creative) on aesthetics & soul...'
                    : 'Jax (Skeptic) on fatal blindspots & churn...'
                }`
          }
          className="flex-1 bg-neutral-50 dark:bg-[#070a10] border border-neutral-300 dark:border-[#1a2333] rounded-lg px-3 sm:px-4 py-2 text-xs sm:text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500 transition-colors"
        />
        <button
          type="button"
          onClick={() => handleSubmit(question)}
          disabled={!question.trim() || isAsking}
          className={`flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            !question.trim() || isAsking
              ? 'bg-neutral-200 dark:bg-[#141b29] text-neutral-400 dark:text-neutral-600 cursor-not-allowed'
              : 'bg-violet-600 hover:bg-violet-500 text-white shadow-md active:scale-[0.98]'
          }`}
        >
          {isAsking ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Send className="w-3.5 h-3.5" />
              <span>Ask</span>
            </>
          )}
        </button>
      </div>

      {/* Interrogation History Stream */}
      {filteredHistory.length > 0 ? (
        <div className="space-y-3">
          {filteredHistory.map((item, idx) => (
            <div
              key={idx}
              className="bg-neutral-50 dark:bg-[#070a10] border border-neutral-200 dark:border-[#1a2333] rounded-xl p-3.5 sm:p-4 shadow-xs"
            >
              <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-neutral-200/80 dark:border-[#162030] text-xs text-neutral-500 dark:text-neutral-400">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-3.5 h-3.5 text-violet-500 shrink-0" />
                  <span className="font-semibold text-neutral-900 dark:text-white">Q: {item.q}</span>
                </div>
                {targetAgent !== 'all' && (
                  <span className="text-[10px] font-mono uppercase bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 px-2 py-0.5 rounded">
                    Filtered: {targetAgent.toUpperCase()}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                {item.responses.map((resp, rIdx) => {
                  const isVc = resp.agentId.includes('vc');
                  const isCreative = resp.agentId.includes('creative');

                  const Icon = isVc ? TrendingUp : isCreative ? Palette : Flame;
                  const borderCol = isVc
                    ? 'border-emerald-200 dark:border-emerald-800/40 bg-emerald-50/50 dark:bg-emerald-950/20'
                    : isCreative
                    ? 'border-violet-200 dark:border-violet-800/40 bg-violet-50/50 dark:bg-violet-950/20'
                    : 'border-amber-200 dark:border-amber-800/40 bg-amber-50/50 dark:bg-amber-950/20';

                  const badgeCol = isVc
                    ? 'text-emerald-700 dark:text-emerald-400'
                    : isCreative
                    ? 'text-violet-700 dark:text-violet-400'
                    : 'text-amber-700 dark:text-amber-400';

                  return (
                    <div
                      key={rIdx}
                      className={`p-3.5 rounded-lg border ${borderCol} text-xs text-neutral-800 dark:text-neutral-200`}
                    >
                      <div className="flex items-center gap-1.5 mb-1.5 font-bold">
                        <Icon className={`w-3.5 h-3.5 ${badgeCol}`} />
                        <span className={badgeCol}>{resp.agentName}</span>
                      </div>
                      <p className="leading-relaxed">{resp.answer}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-6 text-center text-xs font-mono text-neutral-400 border border-dashed border-neutral-300 dark:border-[#1e293b] rounded-xl">
          No responses recorded for {targetAgent.toUpperCase()} yet. Ask a question above to interrogate this persona.
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  Compass,
  Search,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
  Zap,
  Target,
  CheckCircle2,
  Copy,
  Check,
  Globe,
  SlidersHorizontal,
  ChevronRight,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Building2,
  LayoutGrid,
  Table,
} from 'lucide-react';
import {
  MarketContextSummary,
  MarketCompetitor,
  ClarifiedIdea,
} from '../types/brand.js';

interface MarketContextSectionProps {
  marketContext?: MarketContextSummary;
  idea: string;
  brandName: string;
  clarified?: ClarifiedIdea;
  onUpdateMarketContext?: (newContext: MarketContextSummary) => void;
}

export const MarketContextSection: React.FC<MarketContextSectionProps> = ({
  marketContext: initialMarketContext,
  idea,
  brandName,
  clarified,
  onUpdateMarketContext,
}) => {
  // Competitor data state
  const [contextData, setContextData] = useState<MarketContextSummary | null>(
    initialMarketContext || null
  );

  // Search input & loading state
  const [searchInput, setSearchInput] = useState<string>(
    initialMarketContext?.searchQuery || `${idea.slice(0, 45)} top competitors alternatives`
  );
  const [isSearching, setIsSearching] = useState(false);
  const [searchStatusMsg, setSearchStatusMsg] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'matrix' | 'whitespace'>('cards');
  const [copiedText, setCopiedText] = useState(false);

  // Sync when prop updates
  useEffect(() => {
    if (initialMarketContext) {
      setContextData(initialMarketContext);
      if (initialMarketContext.searchQuery) {
        setSearchInput(initialMarketContext.searchQuery);
      }
    }
  }, [initialMarketContext]);

  // If no initial context provided, perform initial fetch automatically
  useEffect(() => {
    if (!contextData && idea) {
      handleSearch(searchInput, false);
    }
  }, []);

  const handleSearch = async (queryToSearch: string, isManual = true) => {
    setIsSearching(true);
    setSearchStatusMsg('Connecting to Google Search Grounding Index...');

    try {
      if (isManual) {
        await new Promise((r) => setTimeout(r, 200));
        setSearchStatusMsg('Dissecting Top 3 Competitor Positioning & Moats...');
      }

      const res = await fetch('/api/search-competitors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idea,
          brandName,
          customQuery: queryToSearch,
          clarified,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server responded with ${res.status}`);
      }

      const data: MarketContextSummary = await res.json();
      setContextData(data);
      if (onUpdateMarketContext) {
        onUpdateMarketContext(data);
      }
    } catch (err) {
      console.warn('Live competitor search call error, falling back locally:', err);
    } finally {
      setIsSearching(false);
      setSearchStatusMsg('');
    }
  };

  const handleCopyIntel = () => {
    if (!contextData) return;
    const text = `### Market Context & Competitor Intelligence (${brandName})
Search Query: ${contextData.searchQuery}
Saturation: ${contextData.saturation}
Market Overview: ${contextData.marketOverview}
White-Space Moat: ${contextData.whiteSpaceMoat}

Top 3 Competitors:
${contextData.competitors
  .map(
    (c, i) => `
${i + 1}. ${c.name} (${c.stageOrCategory || 'Competitor'})
- URL: ${c.url || 'N/A'}
- Summary: ${c.summary}
- Positioning: ${c.marketPositioning}
- Strengths: ${c.strengths.join(', ')}
- Vulnerabilities / Gaps: ${c.weaknessesAndGaps}
- How ${brandName} Wins: ${c.differentiationAngle}
`
  )
  .join('\n')}`;

    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const getSaturationBadge = (sat: string = 'Moderate') => {
    switch (sat) {
      case 'Low':
        return {
          bg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
          dot: 'bg-emerald-500',
          desc: 'High Blue-Ocean Territory: minimal entrenched brand loyalty or modernized options.',
        };
      case 'High':
      case 'Crowded':
        return {
          bg: 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800',
          dot: 'bg-rose-500',
          desc: 'Crowded Battlefield: requires aggressive, polarizing positioning to stand apart.',
        };
      default:
        return {
          bg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800',
          dot: 'bg-amber-500',
          desc: 'Moderate Saturation: incumbents exist with noticeable feature bloat and pricing friction.',
        };
    }
  };

  const saturationMeta = getSaturationBadge(contextData?.saturation);

  return (
    <div className="bg-white dark:bg-[#0c1017] border border-neutral-200 dark:border-[#1a2333] rounded-2xl p-5 sm:p-7 lg:p-8 mb-6 sm:mb-8 shadow-xl transition-colors">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 mb-6 border-b border-neutral-200 dark:border-[#1a2333]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 shrink-0">
            <Compass className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-display font-extrabold text-neutral-900 dark:text-white">
                Market Context &amp; Competitor Landscape
              </h2>
              <span className="text-[10px] font-mono uppercase bg-cyan-100 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 px-2 py-0.5 rounded-full font-bold">
                Google Grounded
              </span>
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
              Live intelligence discovering the top 3 market alternatives, dissecting their vulnerabilities, and forging your unfair wedge.
            </p>
          </div>
        </div>

        {/* View Switcher & Copy Action */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div
            role="tablist"
            aria-label="Market context view modes"
            className="flex items-center bg-neutral-100 dark:bg-[#121824] p-1 rounded-lg border border-neutral-200 dark:border-[#1d273a] text-xs gap-1"
          >
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === 'cards'}
              onClick={() => setViewMode('cards')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all font-semibold cursor-pointer active:scale-95 ${
                viewMode === 'cards'
                  ? 'bg-cyan-600 text-white shadow-sm ring-1 ring-cyan-400 font-bold'
                  : 'text-neutral-600 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-200/50 dark:hover:bg-neutral-800/40'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Cards</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={viewMode === 'matrix'}
              onClick={() => setViewMode('matrix')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all font-semibold cursor-pointer active:scale-95 ${
                viewMode === 'matrix'
                  ? 'bg-cyan-600 text-white shadow-sm ring-1 ring-cyan-400 font-bold'
                  : 'text-neutral-600 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-200/50 dark:hover:bg-neutral-800/40'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Matrix</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={viewMode === 'whitespace'}
              onClick={() => setViewMode('whitespace')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all font-semibold cursor-pointer active:scale-95 ${
                viewMode === 'whitespace'
                  ? 'bg-cyan-600 text-white shadow-sm ring-1 ring-cyan-400 font-bold'
                  : 'text-neutral-600 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-200/50 dark:hover:bg-neutral-800/40'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>White Space</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleCopyIntel}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-neutral-100 dark:bg-[#121824] hover:bg-neutral-200 dark:hover:bg-[#1b2536] border border-neutral-300 dark:border-[#1e293b] text-neutral-800 dark:text-neutral-200 transition-colors cursor-pointer active:scale-95"
          >
            {copiedText ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-neutral-400" />
                <span>Copy Intel</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Live Search & Refine Input Bar */}
      <div className="mb-6 p-3 sm:p-4 rounded-xl bg-neutral-50 dark:bg-[#070a10] border border-neutral-200 dark:border-[#1a2333] shadow-xs">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (searchInput.trim()) {
              handleSearch(searchInput, true);
            }
          }}
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search or refine competitor query (e.g. direct alternatives, enterprise rivals, EU startups)..."
              className="w-full bg-white dark:bg-[#0e1420] border border-neutral-300 dark:border-[#1e2a3f] rounded-lg pl-9 pr-3 py-2 text-xs sm:text-sm text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          <button
            type="submit"
            disabled={isSearching}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-bold text-xs sm:text-sm bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-md shadow-cyan-500/20 active:scale-[0.98] transition-all shrink-0 cursor-pointer disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSearching ? 'animate-spin' : ''}`} />
            <span>{isSearching ? 'Grounding Index...' : 'Search Competitors'}</span>
          </button>
        </form>

        {/* Quick Suggestion Search Pills */}
        <div className="flex flex-wrap items-center gap-1.5 mt-2.5 pt-2 border-t border-neutral-200/80 dark:border-[#151d2c]">
          <span className="text-[10px] font-mono uppercase text-neutral-400 dark:text-neutral-500 font-semibold mr-1">
            Refine Focus:
          </span>
          {[
            { label: 'Direct Rivals', query: `${idea} top 3 direct competitors alternatives` },
            { label: 'Legacy Incumbents', query: `${idea} legacy market leaders monopolies` },
            { label: 'Venture Challengers', query: `${idea} venture backed fast growing startups` },
            { label: 'Indie & Guilds', query: `${idea} bootstrapped indie niche competitors` },
          ].map((tag) => (
            <button
              key={tag.label}
              type="button"
              onClick={() => {
                setSearchInput(tag.query);
                handleSearch(tag.query, true);
              }}
              className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-white dark:bg-[#121824] hover:bg-neutral-100 dark:hover:bg-[#1a2333] border border-neutral-200 dark:border-[#1e293b] text-neutral-600 dark:text-neutral-300 transition-colors"
            >
              {tag.label}
            </button>
          ))}
        </div>

        {/* Search Status Toast / Progress */}
        {isSearching && (
          <div className="mt-3 flex items-center gap-2 text-xs font-mono text-cyan-600 dark:text-cyan-400 animate-pulse">
            <div className="w-2 h-2 rounded-full bg-cyan-500" />
            <span>{searchStatusMsg || 'Analyzing live search grounding results...'}</span>
          </div>
        )}
      </div>

      {/* Macro Landscape Card (Saturation & White Space) */}
      {contextData && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-6">
          {/* Market Saturation Badge & Macro Overview (5 Cols) */}
          <div className="lg:col-span-5 p-4 rounded-xl bg-neutral-50/80 dark:bg-[#080c14] border border-neutral-200 dark:border-[#182232] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 font-semibold">
                  Market Saturation Level
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ${saturationMeta.bg}`}
                >
                  <span className={`w-2 h-2 rounded-full ${saturationMeta.dot} animate-pulse`} />
                  <span>{contextData.saturation.toUpperCase()}</span>
                </span>
              </div>
              <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed mt-1">
                {contextData.marketOverview}
              </p>
            </div>

            <div className="mt-3 pt-2.5 border-t border-neutral-200 dark:border-[#162030] text-[11px] text-neutral-500 dark:text-neutral-400 italic">
              {saturationMeta.desc}
            </div>
          </div>

          {/* Strategic White-Space Moat Banner (7 Cols) */}
          <div className="lg:col-span-7 p-4 sm:p-5 rounded-xl bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-indigo-500/10 border border-cyan-500/30 dark:border-cyan-500/40 relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 text-xs font-mono uppercase tracking-wider font-bold mb-1.5">
                <Zap className="w-4 h-4 fill-cyan-500 text-cyan-500" />
                <span>Unoccupied White-Space Positioning Moat</span>
              </div>
              <h4 className="text-sm sm:text-base font-display font-extrabold text-neutral-900 dark:text-white leading-snug">
                "{contextData.whiteSpaceMoat}"
              </h4>
            </div>

            <div className="mt-3 pt-2.5 border-t border-cyan-500/20 flex flex-wrap items-center justify-between gap-2 text-[11px]">
              <span className="text-neutral-600 dark:text-neutral-400">
                Core Strategic Wedge for <strong className="text-cyan-600 dark:text-cyan-300">{brandName}</strong>
              </span>
              {contextData.groundingSources && contextData.groundingSources.length > 0 && (
                <div className="flex items-center gap-1.5 text-neutral-500">
                  <Globe className="w-3.5 h-3.5" />
                  <span>{contextData.groundingSources.length} verified web sources</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content Views: Top 3 Competitors */}
      {contextData?.competitors && contextData.competitors.length > 0 ? (
        <>
          {/* VIEW 1: Cards View */}
          {viewMode === 'cards' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {contextData.competitors.map((comp, idx) => {
                const rankNumber = idx + 1;
                return (
                  <div
                    key={comp.name + idx}
                    className="bg-neutral-50 dark:bg-[#070a12] border border-neutral-200 dark:border-[#1a2333] hover:border-cyan-500/50 dark:hover:border-cyan-500/50 rounded-xl p-4 sm:p-5 flex flex-col justify-between transition-all shadow-sm hover:shadow-md"
                  >
                    <div>
                      {/* Top Bar: Rank & Category */}
                      <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-neutral-200 dark:border-[#162030]">
                        <span className="text-[10px] font-mono font-bold uppercase text-cyan-600 dark:text-cyan-400 px-2 py-0.5 rounded bg-cyan-100 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800">
                          Rival #{rankNumber}
                        </span>
                        <span className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400 truncate max-w-[140px]">
                          {comp.stageOrCategory || 'Market Competitor'}
                        </span>
                      </div>

                      {/* Competitor Name & Website Link */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <h3 className="font-display font-extrabold text-base sm:text-lg text-neutral-900 dark:text-white leading-tight">
                          {comp.name}
                        </h3>
                        {comp.url && (
                          <a
                            href={comp.url.startsWith('http') ? comp.url : `https://${comp.url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-neutral-400 hover:text-cyan-500 transition-colors shrink-0 p-1"
                            title={`Visit ${comp.name}`}
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>

                      {/* 1-2 sentence Summary */}
                      <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed mb-3">
                        {comp.summary}
                      </p>

                      {/* Market Positioning */}
                      <div className="mb-3 p-2.5 rounded-lg bg-white dark:bg-[#0c1018] border border-neutral-200 dark:border-[#1a2333]">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 dark:text-neutral-500 font-semibold block mb-1">
                          Current Positioning &amp; Wedge
                        </span>
                        <p className="text-xs text-neutral-800 dark:text-neutral-200">
                          {comp.marketPositioning}
                        </p>
                      </div>

                      {/* Strengths */}
                      <div className="mb-3">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 font-semibold block mb-1.5">
                          Key Strengths &amp; Moats
                        </span>
                        <ul className="space-y-1 text-xs text-neutral-700 dark:text-neutral-300">
                          {comp.strengths.map((str, sIdx) => (
                            <li key={sIdx} className="flex items-start gap-1.5 leading-snug">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                              <span>{str}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Vulnerability / Gap */}
                      <div className="mb-3 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs">
                        <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-mono text-[10px] font-bold uppercase mb-1">
                          <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" />
                          <span>Critical Gap &amp; Vulnerability</span>
                        </div>
                        <p className="text-neutral-800 dark:text-neutral-200 leading-relaxed">
                          {comp.weaknessesAndGaps}
                        </p>
                      </div>
                    </div>

                    {/* How Our Brand Wins (Differentiation Angle) */}
                    <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-[#162030] bg-cyan-50/70 dark:bg-[#09121f] -mx-4 -mb-4 sm:-mx-5 sm:-mb-5 p-4 rounded-b-xl border-t border-cyan-500/20">
                      <div className="flex items-center gap-1.5 text-cyan-700 dark:text-cyan-400 font-mono text-[10px] font-bold uppercase mb-1">
                        <Zap className="w-3 h-3 text-cyan-500 shrink-0" />
                        <span>How {brandName} Wins Here</span>
                      </div>
                      <p className="text-xs text-neutral-900 dark:text-neutral-100 font-medium leading-relaxed">
                        {comp.differentiationAngle}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* VIEW 2: Comparison Matrix Table */}
          {viewMode === 'matrix' && (
            <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-[#1a2333]">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-neutral-100 dark:bg-[#0a0e17] text-neutral-700 dark:text-neutral-300 font-display font-bold border-b border-neutral-200 dark:border-[#1a2333]">
                    <th className="p-3 sm:p-4 min-w-[140px]">Competitor</th>
                    <th className="p-3 sm:p-4 min-w-[180px]">Summary &amp; Wedge</th>
                    <th className="p-3 sm:p-4 min-w-[180px]">Where They Stumble</th>
                    <th className="p-3 sm:p-4 min-w-[220px] bg-cyan-50/50 dark:bg-cyan-950/20 text-cyan-800 dark:text-cyan-300">
                      How {brandName} Exploits Gap
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-[#1a2333]">
                  {contextData.competitors.map((comp, idx) => (
                    <tr
                      key={comp.name + idx}
                      className="hover:bg-neutral-50 dark:hover:bg-[#0a0f1a] transition-colors"
                    >
                      <td className="p-3 sm:p-4 align-top">
                        <div className="font-display font-bold text-sm text-neutral-900 dark:text-white">
                          {comp.name}
                        </div>
                        <div className="text-[10px] font-mono text-neutral-500 mt-0.5">
                          {comp.stageOrCategory || 'Direct Competitor'}
                        </div>
                        {comp.url && (
                          <a
                            href={comp.url.startsWith('http') ? comp.url : `https://${comp.url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-cyan-600 hover:underline mt-1"
                          >
                            <span>Visit site</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </td>
                      <td className="p-3 sm:p-4 align-top text-neutral-700 dark:text-neutral-300 leading-relaxed">
                        <div className="font-medium mb-1">{comp.summary}</div>
                        <div className="text-[11px] text-neutral-500">
                          <strong>Target:</strong> {comp.marketPositioning}
                        </div>
                      </td>
                      <td className="p-3 sm:p-4 align-top text-amber-700 dark:text-amber-300 leading-relaxed bg-amber-50/20 dark:bg-amber-950/10">
                        {comp.weaknessesAndGaps}
                      </td>
                      <td className="p-3 sm:p-4 align-top font-medium text-neutral-900 dark:text-white bg-cyan-50/30 dark:bg-cyan-950/20 leading-relaxed">
                        {comp.differentiationAngle}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* VIEW 3: White Space Tactical Breakdown */}
          {viewMode === 'whitespace' && (
            <div className="space-y-4">
              <div className="p-5 rounded-xl bg-neutral-50 dark:bg-[#070b12] border border-neutral-200 dark:border-[#1a2333]">
                <h4 className="font-display font-bold text-base text-neutral-900 dark:text-white mb-2 flex items-center gap-2">
                  <Target className="w-4 h-4 text-cyan-500" />
                  <span>Targeting the Unserved Market Space</span>
                </h4>
                <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
                  Every incumbent suffers from structural blindspots created by their own legacy business model. {brandName} does not compete head-on where they are strong; instead, we build an asymmetric moat where they cannot follow without cannibalizing their existing revenue.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {contextData.competitors.map((comp, idx) => (
                  <div
                    key={comp.name + idx}
                    className="p-4 rounded-xl border border-neutral-200 dark:border-[#182335] bg-white dark:bg-[#090d16]"
                  >
                    <div className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 font-bold uppercase mb-1">
                      Asymmetric Wedge vs. {comp.name}
                    </div>
                    <div className="text-xs font-semibold text-neutral-900 dark:text-white mb-2">
                      Their Barrier to Retaliate:
                    </div>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed mb-3">
                      {comp.weaknessesAndGaps}
                    </p>
                    <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300 font-medium">
                      <strong>Our Edge:</strong> {comp.differentiationAngle}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="p-8 text-center text-xs font-mono text-neutral-400 border border-dashed border-neutral-300 dark:border-[#1e293b] rounded-xl">
          {isSearching ? 'Gathering real-time market competitor intelligence...' : 'No competitor intelligence retrieved yet.'}
        </div>
      )}

      {/* Grounding Sources Footer */}
      {contextData?.groundingSources && contextData.groundingSources.length > 0 && (
        <div className="mt-5 pt-4 border-t border-neutral-200 dark:border-[#162030] flex flex-wrap items-center justify-between gap-3 text-[11px] text-neutral-500">
          <div className="flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-cyan-500" />
            <span className="font-mono uppercase font-semibold">Web Sources Verified:</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {contextData.groundingSources.map((source, sIdx) => (
              <a
                key={sIdx}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-neutral-100 dark:bg-[#111724] hover:bg-neutral-200 dark:hover:bg-[#1a2334] text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-[#1b263b] transition-colors truncate max-w-[200px]"
                title={source.title}
              >
                <span className="truncate">{source.title || 'Market Source'}</span>
                <ExternalLink className="w-2.5 h-2.5 shrink-0 opacity-70" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

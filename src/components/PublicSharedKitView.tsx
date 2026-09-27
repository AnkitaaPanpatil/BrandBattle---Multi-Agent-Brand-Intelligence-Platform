import React, { useState } from 'react';
import {
  Globe,
  Share2,
  Copy,
  Check,
  Download,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Palette,
  Flame,
  Layers,
  ExternalLink,
  ShieldCheck,
  Eye,
  Calendar,
  CheckCircle2,
  Compass,
} from 'lucide-react';
import { PublicBrandKitRecord, NamingOption } from '../types/brand.js';
import { VisualLogoGenerator } from './VisualLogoGenerator.js';
import { InteractiveBrandPreview } from './InteractiveBrandPreview.js';
import { MarketContextSection } from './MarketContextSection.js';
import { AgentRadarChart } from './AgentRadarChart.js';
import { PersonaProfileCards } from './PersonaProfileCards.js';
import { SocialPreviewCard } from './SocialPreviewCard.js';
import { useDynamicOpenGraph } from '../hooks/useDynamicOpenGraph.js';

interface PublicSharedKitViewProps {
  record: PublicBrandKitRecord;
  onRemix: (idea: string) => void;
  onHome: () => void;
}

export const PublicSharedKitView: React.FC<PublicSharedKitViewProps> = ({
  record,
  onRemix,
  onHome,
}) => {
  const { brandKit, clarified, debate, originalIdea, shareId, createdAt, viewsCount } = record;

  const [selectedName, setSelectedName] = useState<NamingOption>(
    brandKit.namingOptions[0] || {
      id: 'functional',
      archetype: 'The Functional Anchor',
      name: brandKit.brandNameProposal,
      rationale: '',
      domainViability: '',
      phoneticVibe: '',
      sampleHeadline: '',
    }
  );

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState<'kit' | 'radar' | 'debate'>('kit');

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  // Dynamically update document title and Open Graph meta tags for public share view
  useDynamicOpenGraph({
    brandName: selectedName.name || brandKit.brandNameProposal,
    oneLinePitch: brandKit.oneLinePitch,
    archetype: selectedName.archetype || 'Strategic Identity',
    themeName: brandKit.visualDirection.themeName,
    primaryColor: brandKit.visualDirection.colorPalette[0]?.hex || '#06b6d4',
    shareUrl: shareUrl,
    shareId: shareId,
  });

  const handleCopySingle = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    const filename = `${brandKit.brandNameProposal.toLowerCase().replace(/[^a-z0-9]/g, '-')}-public-dossier.md`;
    const text =
      `# Brand Strategy Dossier: ${brandKit.brandNameProposal}\n\n` +
      `Shared Public Link: ${shareUrl}\n\n` +
      `## Overview\n${brandKit.oneLinePitch}\n\n` +
      `## Chief Brand Arbiter Strategic Verdict\n> "${brandKit.arbitrationVerdict}"\n\n` +
      `## Positioning Statement\n> "${brandKit.positioningStatement}"\n\n` +
      `## Primary Value Proposition\n${brandKit.primaryValueProposition}\n\n` +
      `## Unfair Advantage\n${brandKit.unfairAdvantage}\n\n` +
      `## Taglines\n${brandKit.taglineOptions.map((t) => `- **${t.style}:** "${t.text}"`).join('\n')}\n\n` +
      `## Naming Directions\n${brandKit.namingOptions
        .map(
          (n) =>
            `### ${n.name} (${n.archetype})\n${n.rationale}\n- Domain: ${n.domainViability}\n- Headline: "${n.sampleHeadline}"\n`
        )
        .join('\n')}\n\n` +
      `## Visual Direction\nTheme: ${brandKit.visualDirection.themeName}\n${brandKit.visualDirection.themeDescription}\n` +
      `Colors: ${brandKit.visualDirection.colorPalette.map((c) => `${c.name} (${c.hex})`).join(', ')}\n\n` +
      `## Launch Playbook\n${brandKit.launchTactics.map((l, i) => `${i + 1}. ${l}`).join('\n')}` +
      (brandKit.marketContext
        ? `\n\n## Market Context & Competitor Landscape\n` +
          `Saturation: ${brandKit.marketContext.saturation}\n` +
          `Macro Overview: ${brandKit.marketContext.marketOverview}\n` +
          `White-Space Moat: ${brandKit.marketContext.whiteSpaceMoat}\n\n` +
          `### Top 3 Competitors\n` +
          brandKit.marketContext.competitors
            .map(
              (c, i) =>
                `#### ${i + 1}. ${c.name} (${c.stageOrCategory || 'Competitor'})\n` +
                `- Summary: ${c.summary}\n` +
                `- Wedge / Target: ${c.marketPositioning}\n` +
                `- Strengths: ${c.strengths.join(', ')}\n` +
                `- Vulnerability / Gap: ${c.weaknessesAndGaps}\n` +
                `- How We Win: ${c.differentiationAngle}\n`
            )
            .join('\n')
        : '');

    const blob = new Blob([text], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadJSON = () => {
    const filename = `${brandKit.brandNameProposal.toLowerCase().replace(/[^a-z0-9]/g, '-')}-dossier.json`;
    const blob = new Blob([JSON.stringify(record, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formattedDate = new Date(createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-[#070a10] text-neutral-900 dark:text-white transition-colors pb-16">
      {/* Top Banner Notice */}
      <div className="bg-neutral-900 text-neutral-200 border-b border-neutral-800 text-xs py-2 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-white">Public Brand Strategy Dossier</span>
            <span className="text-neutral-500">·</span>
            <span className="text-neutral-400">Read-Only Live Share Link</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-neutral-400">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formattedDate}</span>
            </span>
            {viewsCount && (
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                <span>{viewsCount} views</span>
              </span>
            )}
            <button
              onClick={onHome}
              className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
            >
              Open BrandBattle Studio
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {/* Header Navigation & Actions Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 mb-6 border-b border-neutral-200 dark:border-[#1a2333]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-semibold uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                Verified Cloud Dossier
              </span>
              <span className="text-xs font-mono text-neutral-500 truncate max-w-[200px]">
                ID: {shareId}
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-display font-extrabold text-neutral-900 dark:text-white tracking-tight">
              {brandKit.brandNameProposal}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1 max-w-3xl">
              {brandKit.oneLinePitch}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            <button
              type="button"
              onClick={handleCopyShareLink}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-neutral-200 dark:bg-[#121824] hover:bg-neutral-300 dark:hover:bg-[#1b2536] border border-neutral-300 dark:border-[#1e293b] text-neutral-900 dark:text-white text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400">Link Copied</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Copy Link</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownloadMarkdown}
              className="flex items-center gap-1.5 px-3 py-2 bg-neutral-200 dark:bg-[#121824] hover:bg-neutral-300 dark:hover:bg-[#1b2536] border border-neutral-300 dark:border-[#1e293b] text-neutral-800 dark:text-neutral-200 text-xs sm:text-sm font-medium rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-emerald-500" />
              <span>.MD</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadJSON}
              className="flex items-center gap-1.5 px-3 py-2 bg-neutral-200 dark:bg-[#121824] hover:bg-neutral-300 dark:hover:bg-[#1b2536] border border-neutral-300 dark:border-[#1e293b] text-neutral-800 dark:text-neutral-200 text-xs sm:text-sm font-medium rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-cyan-500" />
              <span>.JSON</span>
            </button>

            <button
              type="button"
              onClick={() => onRemix(originalIdea)}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs sm:text-sm font-bold rounded-lg shadow-md shadow-emerald-500/20 active:scale-[0.98] transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Fork / Remix Idea</span>
            </button>
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex items-center gap-2 mb-6 border-b border-neutral-200 dark:border-[#1a2333] pb-3">
          <button
            type="button"
            onClick={() => setActiveTab('kit')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'kit'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm'
                : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
            }`}
          >
            Brand Strategy Kit
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('radar')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'radar'
                ? 'bg-violet-600 text-white shadow-sm'
                : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-violet-400" />
            <span>D3 Strategy Radar</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('debate')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'debate'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Agent Crossfire Arena</span>
          </button>
        </div>

        {/* TAB 1: Brand Strategy Kit Content */}
        {activeTab === 'kit' && (
          <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
            {/* Synthesis Arbiter Statement */}
            <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-emerald-50 via-white to-teal-50 dark:from-[#0c1017] dark:via-[#091517] dark:to-[#0c1017] border border-emerald-200 dark:border-emerald-800/40 shadow-sm">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 text-xs font-mono uppercase tracking-wider mb-2">
                <Sparkles className="w-4 h-4" />
                <span>Chief Brand Arbiter Strategic Verdict</span>
              </div>
              <p className="text-xs sm:text-sm text-neutral-800 dark:text-neutral-100 font-medium leading-relaxed italic">
                "{brandKit.arbitrationVerdict}"
              </p>
            </div>

            {/* Generated Visual Logo Generator / Display */}
            <VisualLogoGenerator
              brandKit={brandKit}
              selectedName={selectedName}
              onSelectName={setSelectedName}
              currentLogoUrl={brandKit.launchMediaAssets?.logoImageUrl}
            />

            {/* Interactive Live Screen Simulator */}
            <InteractiveBrandPreview
              brandKit={brandKit}
              selectedName={selectedName}
              onSelectName={setSelectedName}
              onCopyText={handleCopySingle}
            />

            {/* Dynamic Open Graph Social Share Preview (1200x630 Card) */}
            <SocialPreviewCard
              brandKit={brandKit}
              selectedName={selectedName}
              shareUrl={shareUrl}
              shareId={shareId}
            />

            {/* Market Context & Competitor Landscape */}
            <MarketContextSection
              marketContext={brandKit.marketContext}
              idea={originalIdea}
              brandName={selectedName.name || brandKit.brandNameProposal}
              clarified={clarified}
            />

            {/* 3 Naming Directions Deep-Dive */}
            <div className="bg-white dark:bg-[#0c1017] border border-neutral-200 dark:border-[#1a2333] rounded-2xl p-5 sm:p-7 shadow-xl">
              <div className="flex items-center justify-between mb-5 pb-3 border-b border-neutral-200 dark:border-[#1a2333]">
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    Identity Nomenclature
                  </span>
                  <h3 className="text-lg sm:text-xl font-display font-bold text-neutral-900 dark:text-white mt-0.5">
                    3 Distinct Naming Directions &amp; Strategic Rationale
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                {brandKit.namingOptions.map((opt) => (
                  <div
                    key={opt.id}
                    className={`bg-neutral-50 dark:bg-[#070a10] border rounded-xl p-4 sm:p-5 flex flex-col justify-between transition-all ${
                      selectedName.id === opt.id
                        ? 'border-amber-500 dark:border-amber-500/80 ring-1 ring-amber-500/30 shadow-md'
                        : 'border-neutral-200 dark:border-[#1a2333]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-mono uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                          {opt.archetype}
                        </span>
                        <button
                          onClick={() => handleCopySingle(opt.name, `name-${opt.id}`)}
                          className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
                          title="Copy name"
                        >
                          {copiedKey === `name-${opt.id}` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>

                      <h4 className="text-xl sm:text-2xl font-display font-extrabold text-neutral-900 dark:text-white mb-2">
                        {opt.name}
                      </h4>

                      <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed mb-3">
                        {opt.rationale}
                      </p>

                      <div className="space-y-1.5 mb-3 text-xs">
                        <div className="bg-white dark:bg-[#0c1017] p-2 rounded border border-neutral-200 dark:border-[#1a2333]">
                          <span className="text-neutral-400 font-mono text-[10px] uppercase block">
                            Domain Viability
                          </span>
                          <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                            {opt.domainViability}
                          </span>
                        </div>
                        <div className="bg-white dark:bg-[#0c1017] p-2 rounded border border-neutral-200 dark:border-[#1a2333]">
                          <span className="text-neutral-400 font-mono text-[10px] uppercase block">
                            Sample Headline
                          </span>
                          <span className="italic text-neutral-800 dark:text-neutral-200">
                            "{opt.sampleHeadline}"
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedName(opt)}
                      className={`w-full py-2 rounded-lg text-xs font-semibold transition-all ${
                        selectedName.id === opt.id
                          ? 'bg-amber-500 text-neutral-950 font-bold'
                          : 'bg-neutral-200 dark:bg-[#121824] hover:bg-neutral-300 dark:hover:bg-[#1a2334] text-neutral-800 dark:text-neutral-200'
                      }`}
                    >
                      {selectedName.id === opt.id ? 'Active Focus' : 'Select Direction'}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Strategic Positioning & Foundation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Positioning & Value Prop */}
              <div className="bg-white dark:bg-[#0c1017] border border-neutral-200 dark:border-[#1a2333] rounded-2xl p-5 sm:p-7 shadow-xl space-y-5">
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Category Positioning Statement
                  </span>
                  <p className="text-sm sm:text-base font-display font-semibold text-neutral-900 dark:text-white mt-1 leading-snug">
                    "{brandKit.positioningStatement}"
                  </p>
                </div>

                <div className="pt-4 border-t border-neutral-200 dark:border-[#1a2333]">
                  <span className="text-xs font-mono uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
                    Primary Value Proposition
                  </span>
                  <p className="text-xs sm:text-sm text-neutral-800 dark:text-neutral-200 mt-1 leading-relaxed">
                    {brandKit.primaryValueProposition}
                  </p>
                </div>

                <div className="pt-4 border-t border-neutral-200 dark:border-[#1a2333]">
                  <span className="text-xs font-mono uppercase tracking-wider text-rose-500">
                    Unfair Competitive Advantage
                  </span>
                  <p className="text-xs sm:text-sm text-neutral-800 dark:text-neutral-200 mt-1 leading-relaxed">
                    {brandKit.unfairAdvantage}
                  </p>
                </div>
              </div>

              {/* Taglines & Personality */}
              <div className="bg-white dark:bg-[#0c1017] border border-neutral-200 dark:border-[#1a2333] rounded-2xl p-5 sm:p-7 shadow-xl space-y-5">
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-violet-600 dark:text-violet-400 mb-2 block">
                    Tagline Options
                  </span>
                  <div className="space-y-2">
                    {brandKit.taglineOptions.map((t, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-lg bg-neutral-50 dark:bg-[#070a10] border border-neutral-200 dark:border-[#1a2333] flex items-center justify-between gap-2"
                      >
                        <div>
                          <span className="text-[10px] font-mono text-neutral-400 uppercase block">
                            {t.style}
                          </span>
                          <span className="font-display font-bold text-xs sm:text-sm text-neutral-900 dark:text-white">
                            "{t.text}"
                          </span>
                        </div>
                        <button
                          onClick={() => handleCopySingle(t.text, `tagline-${i}`)}
                          className="text-neutral-400 hover:text-white"
                        >
                          {copiedKey === `tagline-${i}` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-neutral-200 dark:border-[#1a2333]">
                  <span className="text-xs font-mono uppercase tracking-wider text-neutral-500 mb-2 block">
                    Ideal Customer Persona
                  </span>
                  <div className="p-3 rounded-lg bg-neutral-50 dark:bg-[#070a10] border border-neutral-200 dark:border-[#1a2333] text-xs space-y-1">
                    <div className="font-bold text-neutral-900 dark:text-white">
                      {brandKit.targetAudiencePersona.name} ({brandKit.targetAudiencePersona.role})
                    </div>
                    <div className="text-neutral-600 dark:text-neutral-400">
                      <strong>Pain:</strong> {brandKit.targetAudiencePersona.struggle}
                    </div>
                    <div className="text-emerald-700 dark:text-emerald-400">
                      <strong>Aspiration:</strong> {brandKit.targetAudiencePersona.aspiration}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Launch Playbook & Video Script */}
            <div className="bg-white dark:bg-[#0c1017] border border-neutral-200 dark:border-[#1a2333] rounded-2xl p-5 sm:p-7 shadow-xl">
              <span className="text-xs font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-2 block">
                Launch Execution Playbook
              </span>
              <h3 className="text-lg sm:text-xl font-display font-bold text-neutral-900 dark:text-white mb-4">
                3 Guerilla Go-to-Market Vectors
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {brandKit.launchTactics.map((tactic, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-neutral-50 dark:bg-[#070a10] border border-neutral-200 dark:border-[#1a2333] flex flex-col justify-between"
                  >
                    <div>
                      <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-bold flex items-center justify-center mb-2">
                        {idx + 1}
                      </span>
                      <p className="text-xs text-neutral-800 dark:text-neutral-200 leading-relaxed">
                        {tactic}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: D3 Strategy Radar View */}
        {activeTab === 'radar' && (
          <div className="animate-in fade-in duration-200 mb-8">
            <AgentRadarChart debate={debate} />
          </div>
        )}

        {/* TAB 3: Agent Crossfire Arena View */}
        {activeTab === 'debate' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-[#070a10] border border-neutral-200 dark:border-[#1a2333]">
              <span className="text-xs font-mono uppercase text-amber-500 font-bold block mb-1">
                Original Arena Clash Summary
              </span>
              <p className="text-xs sm:text-sm text-neutral-800 dark:text-neutral-200 italic leading-relaxed">
                "{debate.clashSummary}"
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                { agent: debate.vc, role: 'Growth VC', color: 'emerald' },
                { agent: debate.creative, role: 'Creative Director', color: 'violet' },
                { agent: debate.skeptic, role: 'Brutal Skeptic', color: 'amber' },
              ].map(({ agent, role, color }) => (
                <div
                  key={agent.id}
                  className="p-5 rounded-2xl bg-white dark:bg-[#0c1017] border border-neutral-200 dark:border-[#1a2333] shadow-md flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-neutral-100 dark:bg-[#151c2a] text-neutral-600 dark:text-neutral-400">
                        {role}
                      </span>
                      <span className="text-xs font-mono font-bold text-neutral-900 dark:text-white">
                        Score: {agent.scorecard.score}/100
                      </span>
                    </div>

                    <h4 className="font-display font-extrabold text-base text-neutral-900 dark:text-white mb-2">
                      {agent.name}
                    </h4>

                    <div className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed mb-4 italic">
                      "{agent.openingThesis}"
                    </div>

                    <div className="space-y-2 mb-4">
                      {agent.arguments.map((arg, aIdx) => (
                        <div
                          key={aIdx}
                          className="p-2 rounded-lg bg-neutral-50 dark:bg-[#070a10] border border-neutral-200 dark:border-[#182030] text-xs"
                        >
                          <div className="font-semibold text-neutral-900 dark:text-white">
                            {arg.point}
                          </div>
                          <p className="text-neutral-500 dark:text-neutral-400 text-[11px] mt-0.5">
                            {arg.rationale}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-neutral-200 dark:border-[#1a2333] text-[11px] text-neutral-500 font-mono">
                    Verdict: {agent.scorecard.verdict}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Floating Call to Action Bar */}
        <div className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-emerald-950 via-[#0c141d] to-teal-950 border border-emerald-800/60 shadow-2xl text-white flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-mono font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Multi-Agent Brand Studio</span>
            </div>
            <h3 className="text-lg sm:text-xl font-display font-extrabold">
              Want to forge a brand strategy for your own venture idea?
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Put your startup pitch in the arena with a Growth VC, Creative Director, and Brutal Skeptic.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onRemix(originalIdea)}
              className="px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 transition-colors"
            >
              Remix This Idea
            </button>

            <button
              onClick={onHome}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-emerald-500 hover:bg-emerald-400 text-neutral-950 shadow-lg shadow-emerald-500/30 transition-all active:scale-[0.98]"
            >
              <span>Start New Battle</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

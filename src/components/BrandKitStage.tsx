import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Copy,
  Check,
  Download,
  Share2,
  Sparkles,
  Compass,
  Rocket,
  Bookmark,
  Video,
  Twitter,
  Image as ImageIcon,
  Flame,
  Layers,
  Type,
  ExternalLink,
  Globe,
} from 'lucide-react';
import { BrandKit, NamingOption, ClarifiedIdea, DebateStage, MarketContextSummary } from '../types/brand.js';
import { InteractiveBrandPreview } from './InteractiveBrandPreview.js';
import { AgentQAConsole } from './AgentQAConsole.js';
import { VisualLogoGenerator } from './VisualLogoGenerator.js';
import { MarketContextSection } from './MarketContextSection.js';
import { SocialPreviewCard } from './SocialPreviewCard.js';
import { ShareLinkModal } from './ShareLinkModal.js';
import { createPublicShareLink, AuthUser } from '../services/firebase.js';
import { useDynamicOpenGraph } from '../hooks/useDynamicOpenGraph.js';

interface BrandKitStageProps {
  brandKit: BrandKit;
  clarified: ClarifiedIdea;
  debate: DebateStage;
  idea: string;
  user: AuthUser | null;
  onSaveKit: () => Promise<void>;
  isSaving: boolean;
  onAskQuestion: (
    question: string,
    targetAgent: 'vc' | 'creative' | 'skeptic' | 'all'
  ) => Promise<any>;
  onCopyFullKit: () => void;
  onDownloadMarkdown: () => void;
  onDownloadJSON: () => void;
  onUpdateLogo?: (newLogoUrl: string) => void;
  onUpdateMarketContext?: (newContext: MarketContextSummary) => void;
}

export const BrandKitStage: React.FC<BrandKitStageProps> = ({
  brandKit,
  clarified,
  debate,
  idea,
  user,
  onSaveKit,
  isSaving,
  onAskQuestion,
  onCopyFullKit,
  onDownloadMarkdown,
  onDownloadJSON,
  onUpdateLogo,
  onUpdateMarketContext,
}) => {
  const defaultNamingOption: NamingOption = {
    id: 'functional',
    archetype: 'The Functional Anchor',
    name: brandKit?.brandNameProposal || 'Venture Brand',
    rationale: 'Core utility champion.',
    domainViability: 'Standard.com',
    phoneticVibe: 'Crisp',
    sampleHeadline: brandKit?.oneLinePitch || 'Direct value proposition.',
  };

  const [selectedName, setSelectedName] = useState<NamingOption>(
    brandKit?.namingOptions?.[0] || defaultNamingOption
  );

  // Sync selectedName when brandKit changes (e.g. newly synthesized or loaded from cloud)
  useEffect(() => {
    if (brandKit?.namingOptions?.[0]) {
      setSelectedName(brandKit.namingOptions[0]);
    } else if (brandKit?.brandNameProposal) {
      setSelectedName({
        id: 'functional',
        archetype: 'The Functional Anchor',
        name: brandKit.brandNameProposal,
        rationale: 'Core utility champion.',
        domainViability: 'Standard.com',
        phoneticVibe: 'Crisp',
        sampleHeadline: brandKit.oneLinePitch || 'Direct value proposition.',
      });
    }
  }, [brandKit?.brandNameProposal, brandKit?.namingOptions]);

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string>('');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);

  // Dynamically update document title and Open Graph meta tags for social sharing
  useDynamicOpenGraph({
    brandName: selectedName.name || brandKit.brandNameProposal,
    oneLinePitch: brandKit.oneLinePitch,
    archetype: selectedName.archetype || 'Strategic Identity',
    themeName: brandKit.visualDirection?.themeName || 'Modern Brand',
    primaryColor: brandKit.visualDirection?.colorPalette?.[0]?.hex || '#06b6d4',
    shareUrl: shareUrl || undefined,
  });

  const handleCopySingle = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const launchMedia = brandKit.launchMediaAssets;

  const handleGeneratePublicLink = async () => {
    if (shareUrl) {
      setIsShareModalOpen(true);
      return;
    }

    setIsGeneratingLink(true);
    try {
      const shareId = await createPublicShareLink({
        originalIdea: idea,
        brandName: selectedName.name || brandKit.brandNameProposal,
        oneLinePitch: brandKit.oneLinePitch,
        positioningStatement: brandKit.positioningStatement,
        primaryValueProposition: brandKit.primaryValueProposition,
        clarified,
        debate,
        brandKit,
        logoImageUrl: launchMedia?.logoImageUrl,
        user,
      });

      const url = `${window.location.origin}${window.location.pathname}?shareId=${shareId}`;
      setShareUrl(url);
      setIsShareModalOpen(true);
    } catch (err) {
      console.error('Failed to create public share link in Firestore:', err);
    } finally {
      setIsGeneratingLink(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-12">
      {/* Top Banner / Verdict */}
      <div className="text-center mb-6 sm:mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800/80 text-xs text-emerald-800 dark:text-emerald-300 mb-3 shadow-sm">
          <Trophy className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Stage 03: Brand Strategy Kit</span>
        </div>
        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-display font-extrabold text-neutral-900 dark:text-white tracking-tight mb-2 sm:mb-3">
          The Launch-Ready{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 dark:from-emerald-400 dark:via-teal-300 dark:to-cyan-400">
            Brand Intelligence Kit
          </span>
        </h1>
        <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto leading-relaxed">
          Forged by stress-testing VC scale metrics against creative identity and anti-cliché filters. Includes generated visual concepts, launch video scripts, and exportable assets.
        </p>

        {/* Global Action Bar */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          <button
            onClick={onSaveKit}
            disabled={isSaving}
            title="Save Brand Kit to Library (Ctrl+S)"
            className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 text-white font-bold text-xs sm:text-sm rounded-lg shadow-md transition-all active:scale-[0.98]"
          >
            <Bookmark className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
            <span>{isSaving ? 'Saving...' : user ? 'Save Brand Kit' : 'Sign In & Save'}</span>
            <kbd className="hidden sm:inline-block ml-1 px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-black/20 rounded border border-white/20">
              Ctrl+S
            </kbd>
          </button>

          <button
            onClick={onCopyFullKit}
            className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-neutral-950 font-bold text-xs sm:text-sm rounded-lg shadow-md transition-all active:scale-[0.98]"
          >
            <Copy className="w-3.5 sm:w-4 h-3.5 sm:h-4 stroke-[2.5]" />
            <span>Copy Full Kit</span>
          </button>

          <button
            onClick={onDownloadMarkdown}
            className="flex items-center gap-1.5 px-3 py-2 bg-neutral-100 dark:bg-[#0c1017] hover:bg-neutral-200 dark:hover:bg-[#182030] border border-neutral-300 dark:border-[#1a2333] text-neutral-800 dark:text-neutral-200 font-medium text-xs sm:text-sm rounded-lg transition-colors"
          >
            <Download className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-emerald-500" />
            <span>Download .MD</span>
          </button>

          <button
            onClick={onDownloadJSON}
            className="flex items-center gap-1.5 px-3 py-2 bg-neutral-100 dark:bg-[#0c1017] hover:bg-neutral-200 dark:hover:bg-[#182030] border border-neutral-300 dark:border-[#1a2333] text-neutral-800 dark:text-neutral-200 font-medium text-xs sm:text-sm rounded-lg transition-colors"
          >
            <Download className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-cyan-500" />
            <span>Download .JSON</span>
          </button>

          <button
            type="button"
            onClick={handleGeneratePublicLink}
            disabled={isGeneratingLink}
            title="Generate a unique read-only public URL stored in Firestore"
            className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-bold text-xs sm:text-sm rounded-lg shadow-md shadow-indigo-500/20 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-70"
          >
            <Globe className={`w-3.5 sm:w-4 h-3.5 sm:h-4 ${isGeneratingLink ? 'animate-spin' : ''}`} />
            <span>{isGeneratingLink ? 'Creating Public Link...' : 'Generate Public Link'}</span>
          </button>
        </div>
      </div>

      {/* Synthesis Arbiter Statement */}
      <div className="mb-6 sm:mb-8 p-4 sm:p-6 rounded-xl bg-gradient-to-r from-emerald-50 via-white to-teal-50 dark:from-[#0c1017] dark:via-[#091517] dark:to-[#0c1017] border border-emerald-200 dark:border-emerald-800/40 shadow-sm dark:shadow-xl transition-colors">
        <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 text-xs font-mono uppercase tracking-wider mb-2">
          <Sparkles className="w-4 h-4" />
          <span>Chief Brand Arbiter Strategic Verdict</span>
        </div>
        <p className="text-xs sm:text-sm text-neutral-800 dark:text-neutral-100 font-medium leading-relaxed italic">
          "{brandKit.arbitrationVerdict}"
        </p>
      </div>

      {/* Visual Logo Generator & Identity Emblem (Generates logo placeholder using brand name & archetypes) */}
      <VisualLogoGenerator
        brandKit={brandKit}
        selectedName={selectedName}
        onSelectName={setSelectedName}
        onUpdateLogo={onUpdateLogo}
        currentLogoUrl={launchMedia?.logoImageUrl}
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
        shareUrl={shareUrl || undefined}
      />

      {/* Market Context & Competitor Landscape (Google Search Grounded) */}
      <MarketContextSection
        marketContext={brandKit.marketContext}
        idea={idea}
        brandName={selectedName.name || brandKit.brandNameProposal}
        clarified={clarified}
        onUpdateMarketContext={onUpdateMarketContext}
      />

      {/* 3 Naming Directions Deep-Dive */}
      <div className="bg-white dark:bg-[#0c1017] border border-neutral-200 dark:border-[#1a2333] rounded-xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 shadow-xl transition-colors">
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-neutral-200 dark:border-[#1a2333]">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Identity Nomenclature
            </span>
            <h2 className="text-lg sm:text-xl font-display font-bold text-neutral-900 dark:text-white mt-0.5">
              3 Distinct Naming Directions & Strategic Rationale
            </h2>
          </div>
          <span className="text-xs text-neutral-500 hidden sm:inline">
            Tested for domain viability & phonetic punch
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {brandKit.namingOptions.map((opt) => (
            <div
              key={opt.id}
              className={`bg-neutral-50 dark:bg-[#070a10] border rounded-xl p-4 sm:p-5 flex flex-col justify-between transition-all ${
                selectedName.id === opt.id
                  ? 'border-amber-500 dark:border-amber-500/80 ring-1 ring-amber-500/30 shadow-md'
                  : 'border-neutral-200 dark:border-[#1a2333] hover:border-neutral-300 dark:hover:border-[#2a3752]'
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

                <h3 className="text-xl sm:text-2xl font-display font-extrabold text-neutral-900 dark:text-white mb-2">
                  {opt.name}
                </h3>

                <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed mb-3">
                  {opt.rationale}
                </p>

                <div className="space-y-1.5 mb-3 text-xs">
                  <div className="bg-white dark:bg-[#0c1017] p-2 rounded border border-neutral-200 dark:border-[#1a2333]">
                    <span className="text-[10px] font-mono uppercase text-neutral-500 dark:text-neutral-400 block mb-0.5">
                      Domain Viability
                    </span>
                    <span className="font-mono text-amber-700 dark:text-amber-300 font-semibold">{opt.domainViability}</span>
                  </div>
                  <div className="bg-white dark:bg-[#0c1017] p-2 rounded border border-neutral-200 dark:border-[#1a2333]">
                    <span className="text-[10px] font-mono uppercase text-neutral-500 dark:text-neutral-400 block mb-0.5">
                      Phonetic Character
                    </span>
                    <span className="text-neutral-800 dark:text-neutral-200">{opt.phoneticVibe}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-200 dark:border-[#1a2333]">
                <span className="text-[10px] font-mono uppercase text-neutral-500 dark:text-neutral-400 block mb-1">
                  Sample Brand Headline
                </span>
                <p className="text-xs text-neutral-800 dark:text-neutral-200 italic font-medium">
                  "{opt.sampleHeadline}"
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedName(opt);
                    const el = document.getElementById('live-brand-simulator') || document.getElementById('visual-logo-section');
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    }
                  }}
                  className={`mt-3 w-full py-2 px-3 text-xs font-semibold rounded-lg transition-all active:scale-[0.98] cursor-pointer ${
                    selectedName.id === opt.id
                      ? 'bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold shadow-md shadow-amber-500/20 ring-1 ring-amber-400'
                      : 'bg-white dark:bg-[#111722] hover:bg-neutral-100 dark:hover:bg-[#182030] border border-neutral-200 dark:border-[#1e2738] text-neutral-800 dark:text-neutral-300'
                  }`}
                >
                  {selectedName.id === opt.id ? '✓ Active in Simulator' : 'Test in Simulator'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Short Launch Promotional Media Assets */}
      {launchMedia && (
        <div className="bg-white dark:bg-[#0c1017] border border-neutral-200 dark:border-[#1a2333] rounded-xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 shadow-xl transition-colors">
          <div className="flex items-center gap-2 mb-4 text-rose-600 dark:text-rose-400">
            <Video className="w-4 h-4" />
            <h2 className="text-lg sm:text-xl font-display font-bold text-neutral-900 dark:text-white">
              Launch Promotional Copy & Video Script
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* TikTok/Reels Video Script */}
            <div className="bg-neutral-50 dark:bg-[#070a10] p-4 rounded-xl border border-neutral-200 dark:border-[#1a2333] text-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-200 dark:border-[#1a2333]">
                <span className="font-semibold text-neutral-900 dark:text-white flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5 text-rose-500" />
                  <span>{launchMedia.socialLaunchVideoScript.platform}</span>
                </span>
                <span className="text-[10px] font-mono text-neutral-500">30s Short-Form</span>
              </div>

              <div>
                <strong className="text-rose-600 dark:text-rose-400 block mb-0.5">
                  HOOK ({launchMedia.socialLaunchVideoScript.hookDuration}):
                </strong>
                <p className="text-neutral-700 dark:text-neutral-300">
                  <span className="italic font-medium">{launchMedia.socialLaunchVideoScript.hookAudio}</span>
                </p>
                <div className="text-[11px] text-neutral-500 mt-0.5">
                  Visual: {launchMedia.socialLaunchVideoScript.hookVisual}
                </div>
              </div>

              <div>
                <strong className="text-blue-600 dark:text-cyan-400 block mb-0.5">BODY:</strong>
                <p className="text-neutral-700 dark:text-neutral-300">
                  <span className="italic font-medium">{launchMedia.socialLaunchVideoScript.bodyAudio}</span>
                </p>
                <div className="text-[11px] text-neutral-500 mt-0.5">
                  Visual: {launchMedia.socialLaunchVideoScript.bodyVisual}
                </div>
              </div>

              <div>
                <strong className="text-emerald-600 dark:text-emerald-400 block mb-0.5">CALL TO ACTION:</strong>
                <p className="text-neutral-700 dark:text-neutral-300">
                  <span className="italic font-medium">{launchMedia.socialLaunchVideoScript.ctaAudio}</span>
                </p>
                <div className="text-[11px] text-neutral-500 mt-0.5">
                  Visual: {launchMedia.socialLaunchVideoScript.ctaVisual}
                </div>
              </div>
            </div>

            {/* Viral Launch Thread */}
            <div className="bg-neutral-50 dark:bg-[#070a10] p-4 rounded-xl border border-neutral-200 dark:border-[#1a2333] text-xs space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-neutral-200 dark:border-[#1a2333] mb-3">
                  <span className="font-semibold text-neutral-900 dark:text-white flex items-center gap-1.5">
                    <Twitter className="w-3.5 h-3.5 text-blue-500" />
                    <span>Viral Launch Copy Thread</span>
                  </span>
                  <button
                    onClick={() => handleCopySingle(launchMedia.tweetThread.join('\n\n'), 'thread')}
                    className="text-neutral-500 hover:text-neutral-900 dark:hover:text-white flex items-center gap-1"
                  >
                    {copiedKey === 'thread' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    <span>Copy</span>
                  </button>
                </div>
                <div className="space-y-2.5">
                  {launchMedia.tweetThread.map((tweet, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded bg-white dark:bg-[#0c1017] border border-neutral-200 dark:border-[#1a2333] text-neutral-800 dark:text-neutral-200"
                    >
                      {tweet}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Positioning & Pitch Core */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-white dark:bg-[#0c1017] border border-neutral-200 dark:border-[#1a2333] rounded-xl p-4 sm:p-6 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono uppercase tracking-wider text-blue-600 dark:text-cyan-400">
                Definitive Market Positioning
              </span>
              <button
                onClick={() => handleCopySingle(brandKit.positioningStatement, 'pos')}
                className="text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white flex items-center gap-1"
              >
                {copiedKey === 'pos' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>Copy</span>
              </button>
            </div>
            <p className="text-xs sm:text-sm text-neutral-800 dark:text-neutral-200 leading-relaxed font-serif italic mb-5 p-3.5 sm:p-4 rounded-lg bg-neutral-50 dark:bg-[#070a10] border border-neutral-200 dark:border-[#1a2333]">
              "{brandKit.positioningStatement}"
            </p>

            <div className="space-y-3.5">
              <div>
                <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-200 block mb-0.5">
                  Primary Value Proposition
                </span>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {brandKit.primaryValueProposition}
                </p>
              </div>
              <div>
                <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-200 block mb-0.5">
                  Unfair Structural Advantage
                </span>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {brandKit.unfairAdvantage}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-neutral-200 dark:border-[#1a2333]">
            <span className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block mb-1">
              One-Line Elevator Hook
            </span>
            <p className="text-xs sm:text-sm font-semibold text-neutral-900 dark:text-white">
              {brandKit.oneLinePitch}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0c1017] border border-neutral-200 dark:border-[#1a2333] rounded-xl p-4 sm:p-6 flex flex-col justify-between shadow-sm">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-violet-600 dark:text-violet-400 block mb-2 sm:mb-3">
              Tagline Matrix
            </span>
            <div className="space-y-2.5 mb-5">
              {brandKit.taglineOptions.map((tag, idx) => (
                <div
                  key={idx}
                  className="bg-neutral-50 dark:bg-[#070a10] p-3 rounded-lg border border-neutral-200 dark:border-[#1a2333] flex items-start justify-between gap-2"
                >
                  <div>
                    <span className="text-[10px] font-mono uppercase text-violet-600 dark:text-violet-400 block mb-0.5">
                      {tag.style}
                    </span>
                    <p className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white">
                      "{tag.text}"
                    </p>
                  </div>
                  <button
                    onClick={() => handleCopySingle(tag.text, `tag-${idx}`)}
                    className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white shrink-0 mt-0.5"
                  >
                    {copiedKey === `tag-${idx}` ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              ))}
            </div>

            {/* Target Persona */}
            <span className="text-xs font-mono uppercase tracking-wider text-amber-600 dark:text-amber-400 block mb-2">
              Primary Champion Persona
            </span>
            <div className="bg-neutral-50 dark:bg-[#070a10] p-3.5 rounded-lg border border-neutral-200 dark:border-[#1a2333] text-xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-display font-bold text-xs sm:text-sm text-neutral-900 dark:text-white">
                  {brandKit.targetAudiencePersona.name}
                </span>
                <span className="text-neutral-500">{brandKit.targetAudiencePersona.role}</span>
              </div>
              <div className="mb-1.5">
                <strong className="text-rose-600 dark:text-rose-400">Weekly Struggle: </strong>
                <span className="text-neutral-700 dark:text-neutral-300">
                  {brandKit.targetAudiencePersona.struggle}
                </span>
              </div>
              <div>
                <strong className="text-emerald-600 dark:text-emerald-400">Transformation: </strong>
                <span className="text-neutral-700 dark:text-neutral-300">
                  {brandKit.targetAudiencePersona.aspiration}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Brand Personality & Traits to Avoid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-white dark:bg-[#0c1017] border border-neutral-200 dark:border-[#1a2333] rounded-xl p-4 sm:p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-3 text-emerald-600 dark:text-emerald-400">
            <Compass className="w-4 h-4" />
            <h3 className="font-display font-bold text-sm sm:text-base text-neutral-900 dark:text-white">
              Brand Personality & Behavioral Rules
            </h3>
          </div>
          <div className="space-y-3">
            {brandKit.personalityTraits.map((t, idx) => (
              <div
                key={idx}
                className="bg-neutral-50 dark:bg-[#070a10] p-3.5 rounded-lg border border-neutral-200 dark:border-[#1a2333]"
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-xs font-bold text-neutral-900 dark:text-white">{t.trait}</span>
                </div>
                <p className="text-xs text-neutral-700 dark:text-neutral-300 mb-1.5 leading-relaxed">
                  {t.description}
                </p>
                <div className="text-[11px] font-mono text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 p-2 rounded">
                  {t.rule}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-[#0c1017] border border-neutral-200 dark:border-[#1a2333] rounded-xl p-4 sm:p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-3 text-rose-600 dark:text-rose-400">
            <Flame className="w-4 h-4" />
            <h3 className="font-display font-bold text-sm sm:text-base text-neutral-900 dark:text-white">
              Anti-Traits (What This Brand Never Does)
            </h3>
          </div>
          <div className="space-y-3">
            {brandKit.traitsToAvoid.map((a, idx) => (
              <div
                key={idx}
                className="bg-neutral-50 dark:bg-[#070a10] p-3.5 rounded-lg border border-neutral-200 dark:border-[#1a2333]"
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span className="text-xs font-bold text-neutral-900 dark:text-white line-through decoration-rose-500">
                    {a.trait}
                  </span>
                </div>
                <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">{a.reason}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Visual Direction & Design System */}
      <div className="bg-white dark:bg-[#0c1017] border border-neutral-200 dark:border-[#1a2333] rounded-xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 shadow-xl transition-colors">
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-neutral-200 dark:border-[#1a2333]">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-blue-600 dark:text-cyan-400">
              Visual Direction Brief
            </span>
            <h2 className="text-lg sm:text-xl font-display font-bold text-neutral-900 dark:text-white mt-0.5">
              Design System & Art Direction
            </h2>
          </div>
          <span className="text-xs text-neutral-500">Theme: {brandKit.visualDirection.themeName}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-neutral-50 dark:bg-[#070a10] p-4 sm:p-5 rounded-xl border border-neutral-200 dark:border-[#1a2333]">
            <div className="flex items-center gap-2 text-blue-600 dark:text-cyan-400 mb-2.5 text-xs font-semibold">
              <Type className="w-4 h-4" />
              <span>Typography Hierarchy</span>
            </div>
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-[10px] font-mono uppercase text-neutral-500 block">Display Headline</span>
                <span className="text-sm sm:text-base font-display font-bold text-neutral-900 dark:text-white">
                  {brandKit.visualDirection.typography.displayFont}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-neutral-500 block">Body Font</span>
                <span className="text-xs sm:text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                  {brandKit.visualDirection.typography.bodyFont}
                </span>
              </div>
              <div className="pt-2 border-t border-neutral-200 dark:border-[#1a2333] text-[11px] text-neutral-500">
                {brandKit.visualDirection.typography.styleNotes}
              </div>
            </div>
          </div>

          <div className="bg-neutral-50 dark:bg-[#070a10] p-4 sm:p-5 rounded-xl border border-neutral-200 dark:border-[#1a2333]">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-2.5 text-xs font-semibold">
              <Sparkles className="w-4 h-4" />
              <span>Logo & Glyphs</span>
            </div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-rose-500 flex items-center justify-center font-display font-extrabold text-base text-neutral-950 shadow-md">
                {brandKit.visualDirection.logoConcept.monogramLetters}
              </div>
              <div>
                <div className="text-xs font-bold text-neutral-900 dark:text-white">Monogram Mark</div>
                <div className="text-[11px] text-neutral-500 font-mono">Vector Scalable</div>
              </div>
            </div>
            <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed mb-1.5">
              {brandKit.visualDirection.logoConcept.symbolDescription}
            </p>
            <div className="text-[11px] text-neutral-500 italic">
              Philosophy: {brandKit.visualDirection.logoConcept.designPhilosophy}
            </div>
          </div>

          <div className="bg-neutral-50 dark:bg-[#070a10] p-4 sm:p-5 rounded-xl border border-neutral-200 dark:border-[#1a2333]">
            <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400 mb-2.5 text-xs font-semibold">
              <Layers className="w-4 h-4" />
              <span>Imagery & Art Direction</span>
            </div>
            <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed mb-2.5">
              {brandKit.visualDirection.imageryArtDirection}
            </p>
            <div className="p-2 rounded bg-white dark:bg-[#0c1017] border border-neutral-200 dark:border-[#1a2333] text-[11px] text-neutral-500">
              {brandKit.visualDirection.themeDescription}
            </div>
          </div>
        </div>
      </div>

      {/* Guerilla Launch Playbook */}
      <div className="bg-white dark:bg-[#0c1017] border border-neutral-200 dark:border-[#1a2333] rounded-xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 shadow-xl transition-colors">
        <div className="flex items-center gap-2 mb-4 text-amber-600 dark:text-amber-400">
          <Rocket className="w-4 h-4" />
          <h2 className="text-lg sm:text-xl font-display font-bold text-neutral-900 dark:text-white">
            Unconventional Guerilla Launch Playbook
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          {brandKit.launchTactics.map((tactic, idx) => (
            <div
              key={idx}
              className="bg-neutral-50 dark:bg-[#070a10] p-4 rounded-xl border border-neutral-200 dark:border-[#1a2333] flex flex-col justify-between"
            >
              <div>
                <span className="w-6 h-6 rounded bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-500/20 flex items-center justify-center text-xs font-mono font-bold mb-2.5">
                  0{idx + 1}
                </span>
                <p className="text-xs sm:text-sm text-neutral-800 dark:text-neutral-200 leading-relaxed">
                  {tactic}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Agent War Room Q&A */}
      <AgentQAConsole brandKit={brandKit} idea={idea} onAskQuestion={onAskQuestion} />

      {/* Public Share Link Modal */}
      <ShareLinkModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        shareUrl={shareUrl}
        brandKit={brandKit}
        idea={idea}
      />
    </div>
  );
};

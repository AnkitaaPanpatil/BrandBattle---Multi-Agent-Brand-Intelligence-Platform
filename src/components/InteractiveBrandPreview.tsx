import React, { useState } from 'react';
import {
  Layers,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  Eye,
  Sliders,
  Share2,
  FileText,
} from 'lucide-react';
import { BrandKit, NamingOption } from '../types/brand.js';

interface InteractiveBrandPreviewProps {
  brandKit: BrandKit;
  selectedName: NamingOption;
  onSelectName: (option: NamingOption) => void;
  onCopyText: (text: string, label: string) => void;
}

export const InteractiveBrandPreview: React.FC<InteractiveBrandPreviewProps> = ({
  brandKit,
  selectedName,
  onSelectName,
  onCopyText,
}) => {
  const [previewTab, setPreviewTab] = useState<'hero' | 'deck' | 'social'>('hero');
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [heroLogoError, setHeroLogoError] = useState(false);
  const [deckLogoError, setDeckLogoError] = useState(false);

  const colors = brandKit.visualDirection.colorPalette;
  const primaryColor = colors[1]?.hex || '#10b981';

  const monogram =
    brandKit.visualDirection?.logoConcept?.monogramLetters ||
    selectedName.name.slice(0, 2).toUpperCase() ||
    'BB';

  const handleCopyColor = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 1800);
  };

  return (
    <div id="live-brand-simulator" className="bg-white dark:bg-[#0c1017] border border-neutral-200 dark:border-[#1a2333] rounded-xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 shadow-xl transition-colors">
      {/* Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-5 pb-3 border-b border-neutral-200 dark:border-[#1a2333]">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-amber-600 dark:text-amber-400">
            Interactive Brand Canvas
          </span>
          <h3 className="text-lg sm:text-xl font-display font-bold text-neutral-900 dark:text-white mt-0.5">
            Live Brand Identity Simulator
          </h3>
          <p className="text-xs text-neutral-600 dark:text-neutral-400">
            Test and preview your naming options live across Landing Page, Pitch Deck, and Social Card.
          </p>
        </div>

        {/* Preview Tabs */}
        <div className="inline-flex p-1 bg-neutral-100 dark:bg-[#06080d] border border-neutral-200 dark:border-[#1a2333] rounded-lg self-start sm:self-auto">
          <button
            onClick={() => setPreviewTab('hero')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              previewTab === 'hero'
                ? 'bg-white dark:bg-[#182030] text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
            }`}
          >
            Landing Hero
          </button>
          <button
            onClick={() => setPreviewTab('deck')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              previewTab === 'deck'
                ? 'bg-white dark:bg-[#182030] text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
            }`}
          >
            Pitch Deck
          </button>
          <button
            onClick={() => setPreviewTab('social')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              previewTab === 'social'
                ? 'bg-white dark:bg-[#182030] text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
            }`}
          >
            Social Card
          </button>
        </div>
      </div>

      {/* 3 Naming Selector Chips */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-3 mb-5">
        {brandKit.namingOptions.map((opt) => {
          const isSelected = selectedName.id === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => onSelectName(opt)}
              className={`text-left p-3 rounded-lg border transition-all ${
                isSelected
                  ? 'bg-neutral-50 dark:bg-[#111722] border-amber-500/80 ring-1 ring-amber-500/30 shadow-sm'
                  : 'bg-white dark:bg-[#070a10] border-neutral-200 dark:border-[#1a2333] hover:border-neutral-300 dark:hover:border-[#222d42]'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  {opt.archetype}
                </span>
                {isSelected && (
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                )}
              </div>
              <div className="font-display font-bold text-sm sm:text-base text-neutral-900 dark:text-white truncate">
                {opt.name}
              </div>
              <div className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400 truncate">
                {opt.domainViability}
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Interactive Screen Simulator */}
      <div className="bg-[#05070b] text-white border border-[#1a2333] rounded-xl overflow-hidden shadow-2xl relative">
        {/* Device Chrome Header */}
        <div className="bg-[#0a0e16] border-b border-[#1a2333] px-3 sm:px-4 py-2 flex items-center justify-between text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
            </div>
            <span className="font-mono text-[10px] sm:text-[11px] text-neutral-400 ml-1.5 truncate max-w-[180px] sm:max-w-none">
              https://{selectedName.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono">
            <span className="text-neutral-400">Preview: {selectedName.name}</span>
          </div>
        </div>

        {/* View 1: Landing Page Hero */}
        {previewTab === 'hero' && (
          <div className="p-5 sm:p-10 relative overflow-hidden bg-gradient-to-b from-[#05070b] via-[#090d14] to-[#05070b]">
            {/* Subtle glow backdrop */}
            <div
              className="absolute top-0 right-1/4 w-72 sm:w-96 h-72 sm:h-96 rounded-full blur-[100px] opacity-20 pointer-events-none"
              style={{ backgroundColor: primaryColor }}
            />

            {/* Navigation Mock */}
            <div className="flex items-center justify-between mb-8 sm:mb-12 relative z-10 border-b border-[#1a2333]/80 pb-3">
              <div className="flex items-center gap-2">
                <div
                  className="w-7 sm:w-8 h-7 sm:h-8 rounded-lg flex items-center justify-center font-display font-bold text-xs sm:text-sm text-neutral-950 shadow-md overflow-hidden"
                  style={{ backgroundColor: primaryColor }}
                >
                  {brandKit.launchMediaAssets?.logoImageUrl && !heroLogoError ? (
                    <img
                      src={brandKit.launchMediaAssets.logoImageUrl}
                      alt={`${selectedName.name} Logo`}
                      onError={() => setHeroLogoError(true)}
                      className="w-full h-full object-contain"
                      loading="eager"
                    />
                  ) : (
                    <span>{monogram}</span>
                  )}
                </div>
                <span className="font-display font-bold text-base sm:text-lg text-white tracking-tight">
                  {selectedName.name}
                </span>
              </div>
              <div className="hidden sm:flex items-center gap-5 text-xs text-neutral-400">
                <span className="hover:text-white cursor-pointer">Manifesto</span>
                <span className="hover:text-white cursor-pointer">Product</span>
                <span className="hover:text-white cursor-pointer">Access</span>
              </div>
              <button
                className="px-3 py-1.5 text-xs font-semibold rounded-md text-neutral-950 shadow-md"
                style={{ backgroundColor: primaryColor }}
              >
                Join Launch
              </button>
            </div>

            {/* Hero Content */}
            <div className="max-w-2xl relative z-10">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0e1420] border border-[#1e2738] text-[11px] text-neutral-300 mb-3 sm:mb-4">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span className="font-mono">{brandKit.taglineOptions[0]?.text || 'Defiance by Design'}</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-display font-extrabold text-white tracking-tight leading-[1.15] mb-3 sm:mb-4">
                {selectedName.sampleHeadline}
              </h2>

              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed mb-6 max-w-xl">
                {brandKit.oneLinePitch}
              </p>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  className="px-5 py-2.5 rounded-lg text-xs font-bold text-neutral-950 shadow-md active:scale-[0.98]"
                  style={{ backgroundColor: primaryColor }}
                >
                  Claim Founding Pass
                </button>
                <button className="px-4 py-2.5 rounded-lg text-xs font-medium text-neutral-300 hover:text-white bg-[#0f1522] border border-[#1e2738]">
                  Read Manifesto
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View 2: Pitch Deck Intro Slide */}
        {previewTab === 'deck' && (
          <div className="p-6 sm:p-12 bg-[#05070b] min-h-[280px] sm:min-h-[360px] flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#1a2333] pb-2">
              <span className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase">
                CONFIDENTIAL // SEED STRATEGY DECK
              </span>
              <span className="text-[10px] font-mono text-neutral-400">SLIDE 01</span>
            </div>

            <div className="my-auto py-4 max-w-2xl">
              <div
                className="w-10 sm:w-12 h-10 sm:h-12 rounded-xl flex items-center justify-center font-display font-extrabold text-lg sm:text-xl text-neutral-950 mb-4 shadow-xl overflow-hidden"
                style={{ backgroundColor: primaryColor }}
              >
                {brandKit.launchMediaAssets?.logoImageUrl && !deckLogoError ? (
                  <img
                    src={brandKit.launchMediaAssets.logoImageUrl}
                    alt={`${selectedName.name} Logo`}
                    onError={() => setDeckLogoError(true)}
                    className="w-full h-full object-contain"
                    loading="eager"
                  />
                ) : (
                  <span>{monogram}</span>
                )}
              </div>
              <h1 className="text-3xl sm:text-5xl font-display font-bold text-white tracking-tight leading-none mb-3">
                {selectedName.name}
              </h1>
              <p className="text-sm sm:text-lg font-medium text-neutral-300 leading-snug">
                {brandKit.oneLinePitch}
              </p>
            </div>

            <div className="border-t border-[#1a2333] pt-3 flex items-center justify-between text-[11px] text-neutral-500">
              <span>Arbitrated by Multi-Agent Strategy Engine</span>
              <span>Prepared for Founding Investors</span>
            </div>
          </div>
        )}

        {/* View 3: Social Announcement Card */}
        {previewTab === 'social' && (
          <div className="p-6 sm:p-10 bg-gradient-to-br from-[#05070b] via-[#0b101a] to-[#05070b] flex flex-col justify-center min-h-[280px] sm:min-h-[320px] text-center">
            <div className="max-w-md mx-auto">
              <div
                className="w-12 h-12 mx-auto rounded-xl flex items-center justify-center font-display font-extrabold text-xl text-neutral-950 mb-3 shadow-md overflow-hidden"
                style={{ backgroundColor: primaryColor }}
              >
                {brandKit.launchMediaAssets?.logoImageUrl ? (
                  <img
                    src={brandKit.launchMediaAssets.logoImageUrl}
                    alt={`${selectedName.name} Logo`}
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  brandKit.visualDirection.logoConcept.monogramLetters
                )}
              </div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 mb-1">
                ANNOUNCING
              </div>
              <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white mb-2">
                {selectedName.name}
              </h2>
              <p className="text-xs sm:text-sm text-neutral-300 mb-4 leading-relaxed">
                "{brandKit.taglineOptions[1]?.text || brandKit.primaryValueProposition}"
              </p>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0e1420] border border-[#1e2738] text-[11px] font-mono text-neutral-300">
                <span>Domain:</span>
                <span className="text-amber-400 font-bold">{selectedName.domainViability}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Color Swatches Grid */}
      <div className="mt-5 pt-4 border-t border-neutral-200 dark:border-[#1a2333]">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-mono uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Brand Palette Swatches (Click Hex to Copy)
          </span>
          <span className="text-[11px] text-neutral-500">
            {brandKit.visualDirection.themeName}
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {colors.map((color, idx) => (
            <button
              key={idx}
              onClick={() => handleCopyColor(color.hex)}
              className="group text-left p-2.5 rounded-lg bg-neutral-50 dark:bg-[#070a10] border border-neutral-200 dark:border-[#1a2333] hover:border-neutral-300 dark:hover:border-[#2a3752] transition-all"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <div
                  className="w-7 h-7 rounded-md border border-black/10 dark:border-white/10 shadow-xs shrink-0"
                  style={{ backgroundColor: color.hex }}
                />
                <div className="truncate">
                  <div className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                    {color.name}
                  </div>
                  <div className="text-[11px] font-mono text-neutral-500 group-hover:text-amber-500 flex items-center gap-1 transition-colors">
                    {copiedHex === color.hex ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-500" />
                        <span className="text-emerald-500">Copied!</span>
                      </>
                    ) : (
                      <>
                        <span>{color.hex}</span>
                        <Copy className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-[10px] text-neutral-500 truncate">{color.role}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

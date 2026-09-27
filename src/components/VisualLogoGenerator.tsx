import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Download,
  RefreshCw,
  Check,
  Target,
  Palette,
  Layers,
  Image as ImageIcon,
  Copy,
  Eye,
  Sliders,
  Maximize2,
  ExternalLink,
  Flame,
  TrendingUp,
} from 'lucide-react';
import { BrandKit, NamingOption } from '../types/brand.js';
import {
  generateVectorLogoSvg,
  downloadSvgFile,
  convertSvgToPngDataUrl,
  extractMonogram,
  GeneratedLogoResult,
} from '../services/logoGenerator.js';

interface VisualLogoGeneratorProps {
  brandKit: BrandKit;
  selectedName: NamingOption;
  onSelectName?: (name: NamingOption) => void;
  onUpdateLogo?: (logoUrl: string) => void;
  currentLogoUrl?: string;
}

export const VisualLogoGenerator: React.FC<VisualLogoGeneratorProps> = ({
  brandKit,
  selectedName,
  onSelectName,
  onUpdateLogo,
  currentLogoUrl,
}) => {
  // Selected archetype for generation
  const [activeArchetypeId, setActiveArchetypeId] = useState<string>(selectedName.id || 'functional');
  const [activeBrandName, setActiveBrandName] = useState<string>(selectedName.name || brandKit.brandNameProposal);
  const [activeStyle, setActiveStyle] = useState<'geometric' | 'emblem' | 'radical' | 'abstract'>('geometric');
  const [customMonogram, setCustomMonogram] = useState<string>(
    brandKit.visualDirection.logoConcept.monogramLetters || extractMonogram(selectedName.name)
  );
  const [backgroundMode, setBackgroundMode] = useState<'dark' | 'light' | 'transparent'>('dark');
  const [seed, setSeed] = useState<number>(101);

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationPhase, setGenerationPhase] = useState<string>('');
  const [generatedLogo, setGeneratedLogo] = useState<GeneratedLogoResult | null>(null);
  const [imageLoadError, setImageLoadError] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isDownloadingPng, setIsDownloadingPng] = useState(false);
  const [activeAsPrimary, setActiveAsPrimary] = useState(false);

  // Sync with selectedName prop change and regenerate logo
  useEffect(() => {
    setActiveArchetypeId(selectedName.id);
    setActiveBrandName(selectedName.name);
    setCustomMonogram(extractMonogram(selectedName.name));
    setImageLoadError(false);

    let newStyle: 'geometric' | 'emblem' | 'radical' | 'abstract' = 'geometric';
    if (selectedName.id === 'evocative') newStyle = 'emblem';
    else if (selectedName.id === 'provocative') newStyle = 'radical';
    setActiveStyle(newStyle);

    handleGenerateLogo(selectedName.name, selectedName.id, newStyle, seed, false);
  }, [selectedName.id, selectedName.name]);

  const getArchetypeObj = (id: string): NamingOption | undefined => {
    return brandKit.namingOptions.find((n) => n.id === id);
  };

  const handleArchetypeSwitch = (option: NamingOption) => {
    setActiveArchetypeId(option.id);
    setActiveBrandName(option.name);
    setCustomMonogram(extractMonogram(option.name));
    if (onSelectName) {
      onSelectName(option);
    }

    // Auto-select corresponding style
    let newStyle: 'geometric' | 'emblem' | 'radical' | 'abstract' = 'geometric';
    if (option.id === 'evocative') newStyle = 'emblem';
    if (option.id === 'provocative') newStyle = 'radical';
    setActiveStyle(newStyle);

    handleGenerateLogo(option.name, option.id, newStyle, seed + 1, false);
  };

  const handleGenerateLogo = async (
    nameToUse: string,
    archetypeId: string,
    styleToUse: 'geometric' | 'emblem' | 'radical' | 'abstract',
    seedToUse: number,
    showAnimation: boolean = true
  ) => {
    const currentArchetype = getArchetypeObj(archetypeId);
    const archetypeName = currentArchetype?.archetype || 'The Functional Anchor';

    if (showAnimation) {
      setIsGenerating(true);
      setImageLoadError(false);
      setGenerationPhase('Analyzing Archetype & Semiotics...');
      await new Promise((r) => setTimeout(r, 250));
      setGenerationPhase('Synthesizing Geometric Vector Marks...');
      await new Promise((r) => setTimeout(r, 250));
      setGenerationPhase('Applying Brand Palette Gradients...');
      await new Promise((r) => setTimeout(r, 200));
    } else {
      setImageLoadError(false);
    }

    try {
      // Attempt backend API call first
      const res = await fetch('/api/generate-logo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandName: nameToUse,
          archetype: archetypeName,
          style: styleToUse,
          colors: brandKit.visualDirection.colorPalette,
          monogram: customMonogram || extractMonogram(nameToUse),
          symbolDescription: brandKit.visualDirection.logoConcept.symbolDescription,
          themeName: brandKit.visualDirection.themeName,
          background: backgroundMode,
          seed: seedToUse,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setGeneratedLogo(data);
        if (onUpdateLogo) {
          onUpdateLogo(data.dataUrl);
          setActiveAsPrimary(true);
        }
      } else {
        // Fallback to client-side deterministic vector generation
        const localResult = generateVectorLogoSvg({
          brandName: nameToUse,
          archetype: archetypeName,
          style: styleToUse,
          colors: brandKit.visualDirection.colorPalette,
          monogram: customMonogram || extractMonogram(nameToUse),
          symbolDescription: brandKit.visualDirection.logoConcept.symbolDescription,
          themeName: brandKit.visualDirection.themeName,
          background: backgroundMode,
          seed: seedToUse,
        });
        setGeneratedLogo(localResult);
        if (onUpdateLogo) {
          onUpdateLogo(localResult.dataUrl);
          setActiveAsPrimary(true);
        }
      }
    } catch (err) {
      // Fallback generator
      const localResult = generateVectorLogoSvg({
        brandName: nameToUse,
        archetype: archetypeName,
        style: styleToUse,
        colors: brandKit.visualDirection.colorPalette,
        monogram: customMonogram || extractMonogram(nameToUse),
        symbolDescription: brandKit.visualDirection.logoConcept.symbolDescription,
        themeName: brandKit.visualDirection.themeName,
        background: backgroundMode,
        seed: seedToUse,
      });
      setGeneratedLogo(localResult);
      if (onUpdateLogo) {
        onUpdateLogo(localResult.dataUrl);
        setActiveAsPrimary(true);
      }
    } finally {
      setIsGenerating(false);
      setGenerationPhase('');
    }
  };

  const handleDownloadSvg = () => {
    if (!generatedLogo) return;
    const filename = `${activeBrandName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-logo.svg`;
    downloadSvgFile(generatedLogo.svg, filename);
  };

  const handleDownloadPng = async () => {
    if (!generatedLogo) return;
    setIsDownloadingPng(true);
    try {
      const pngDataUrl = await convertSvgToPngDataUrl(generatedLogo.svg, 1024, 1024);
      const a = document.createElement('a');
      a.href = pngDataUrl;
      a.download = `${activeBrandName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-logo-1024px.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.info('[BrandBattle] PNG conversion fell back to vector SVG download.');
      const filename = `${activeBrandName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-logo.svg`;
      downloadSvgFile(generatedLogo.svg, filename);
    } finally {
      setIsDownloadingPng(false);
    }
  };

  const handleSetPrimary = () => {
    if (generatedLogo && onUpdateLogo) {
      onUpdateLogo(generatedLogo.dataUrl);
      setActiveAsPrimary(true);
      setTimeout(() => setActiveAsPrimary(false), 2000);
    }
  };

  return (
    <div id="visual-logo-section" className="bg-white dark:bg-[#0c1017] border border-neutral-200 dark:border-[#1a2333] rounded-2xl p-5 sm:p-7 lg:p-8 mb-6 sm:mb-8 shadow-xl transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 mb-6 border-b border-neutral-200 dark:border-[#1a2333]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-violet-500/20 shrink-0">
            <ImageIcon className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-display font-extrabold text-neutral-900 dark:text-white">
                Visual Logo Generator &amp; Identity Emblem
              </h2>
              <span className="text-[10px] font-mono uppercase bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800 px-2 py-0.5 rounded-full font-bold">
                Vector 1:1
              </span>
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
              Generates visual logo placeholders dynamically tailored to your chosen archetype and brand colors.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => {
              const nextSeed = seed + 1;
              setSeed(nextSeed);
              handleGenerateLogo(activeBrandName, activeArchetypeId, activeStyle, nextSeed, true);
            }}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-neutral-100 dark:bg-[#141b29] hover:bg-neutral-200 dark:hover:bg-[#1f293d] border border-neutral-300 dark:border-[#222f47] text-neutral-800 dark:text-neutral-200 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>Generate New Variation</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Controls Left, Live Logo Showcase Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Side: Archetype & Aesthetic Configuration (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Step 1: Archetype Selector */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2 font-semibold">
              1. Select Naming Archetype Direction
            </label>
            <div className="space-y-2">
              {brandKit.namingOptions.map((opt) => {
                const isSelected = activeArchetypeId === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleArchetypeSwitch(opt)}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-neutral-50 dark:bg-[#121927] border-violet-500 dark:border-violet-500/80 shadow-md ring-1 ring-violet-500/30'
                        : 'bg-white dark:bg-[#070b12] border-neutral-200 dark:border-[#1a2333] hover:border-neutral-300 dark:hover:border-[#24334d]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-mono uppercase text-violet-600 dark:text-violet-400 font-bold">
                          {opt.archetype}
                        </span>
                        {isSelected && (
                          <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
                        )}
                      </div>
                      <div className="font-display font-bold text-sm text-neutral-900 dark:text-white">
                        {opt.name}
                      </div>
                      <div className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate max-w-[220px]">
                        {opt.phoneticVibe}
                      </div>
                    </div>
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                        isSelected
                          ? 'bg-violet-600 text-white'
                          : 'bg-neutral-100 dark:bg-[#121824] text-neutral-400'
                      }`}
                    >
                      {isSelected ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : '→'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Visual Style Preset */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2 font-semibold">
              2. Emblem Geometric Style
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'geometric', label: 'Isometric Hexagon', desc: 'Precision Anchor' },
                { id: 'emblem', label: 'Sacred Infinity', desc: 'Lyrical Muse' },
                { id: 'radical', label: 'Angular Prism', desc: 'Provocative Rebel' },
                { id: 'abstract', label: 'Minimalist Monogram', desc: 'Pure Identity' },
              ].map((styleOpt) => {
                const isActive = activeStyle === styleOpt.id;
                return (
                  <button
                    key={styleOpt.id}
                    type="button"
                    onClick={() => {
                      setActiveStyle(styleOpt.id as any);
                      handleGenerateLogo(activeBrandName, activeArchetypeId, styleOpt.id as any, seed, true);
                    }}
                    className={`text-left p-2.5 rounded-xl border text-xs transition-all ${
                      isActive
                        ? 'bg-violet-50/80 dark:bg-violet-950/40 border-violet-500 text-violet-900 dark:text-violet-200 font-semibold'
                        : 'bg-neutral-50 dark:bg-[#070b12] border-neutral-200 dark:border-[#1a2333] text-neutral-600 dark:text-neutral-400 hover:border-neutral-300'
                    }`}
                  >
                    <div className="font-semibold text-neutral-900 dark:text-white">{styleOpt.label}</div>
                    <div className="text-[10px] text-neutral-500 mt-0.5">{styleOpt.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3: Monogram & Surface Settings */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-[11px] font-mono text-neutral-500 dark:text-neutral-400 mb-1">
                Monogram Initials
              </label>
              <input
                type="text"
                maxLength={3}
                value={customMonogram}
                onChange={(e) => setCustomMonogram(e.target.value.toUpperCase())}
                className="w-full bg-neutral-50 dark:bg-[#070b12] border border-neutral-300 dark:border-[#1e293b] rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-neutral-900 dark:text-white uppercase focus:ring-1 focus:ring-violet-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-neutral-500 dark:text-neutral-400 mb-1">
                Canvas Backdrop
              </label>
              <select
                value={backgroundMode}
                onChange={(e) => setBackgroundMode(e.target.value as any)}
                className="w-full bg-neutral-50 dark:bg-[#070b12] border border-neutral-300 dark:border-[#1e293b] rounded-lg px-2.5 py-1.5 text-xs text-neutral-900 dark:text-white focus:ring-1 focus:ring-violet-500 focus:outline-none"
              >
                <option value="dark">Obsidian Dark</option>
                <option value="light">Studio White</option>
                <option value="transparent">Transparent</option>
              </select>
            </div>
          </div>

          {/* Trigger Generate Button */}
          <button
            type="button"
            onClick={() => handleGenerateLogo(activeBrandName, activeArchetypeId, activeStyle, seed + 1, true)}
            disabled={isGenerating}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white shadow-lg shadow-violet-500/25 active:scale-[0.98] transition-all"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>{generationPhase || 'Generating Visual Logo...'}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Synthesize Visual Logo Placeholder</span>
              </>
            )}
          </button>
        </div>

        {/* Right Side: Hero Visual Logo Display & Export Suite (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="w-full max-w-md bg-neutral-100/60 dark:bg-[#060910] border border-neutral-200 dark:border-[#1a2333] rounded-2xl p-4 sm:p-6 shadow-2xl relative flex flex-col items-center justify-center">
            {/* Visual Spec Overlay Top */}
            <div className="w-full flex items-center justify-between text-[11px] font-mono text-neutral-500 dark:text-neutral-400 mb-3 pb-2 border-b border-neutral-200 dark:border-[#162030]">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Format: Vector SVG 512×512</span>
              </span>
              <span className="uppercase text-amber-600 dark:text-amber-400 font-semibold">
                {activeBrandName}
              </span>
            </div>

            {/* The Main Rendered Vector Logo Box */}
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-2xl overflow-hidden border border-neutral-200/80 dark:border-[#1f2b40] shadow-xl flex items-center justify-center bg-[#070a10] group">
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center gap-3 p-6 text-center">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full border-4 border-violet-500/20 border-t-violet-500 animate-spin" />
                    <Sparkles className="w-6 h-6 text-violet-400 absolute inset-0 m-auto" />
                  </div>
                  <span className="text-xs font-mono text-violet-400 animate-pulse">
                    {generationPhase || 'Generating Identity Emblem...'}
                  </span>
                </div>
              ) : generatedLogo ? (
                <div className="w-full h-full p-3 flex items-center justify-center relative">
                  {!imageLoadError && generatedLogo.dataUrl ? (
                    <img
                      src={generatedLogo.dataUrl}
                      alt={`${activeBrandName} Visual Logo`}
                      onError={() => setImageLoadError(true)}
                      className="w-full h-full object-contain drop-shadow-md select-none block"
                      loading="eager"
                      decoding="async"
                    />
                  ) : generatedLogo.svg ? (
                    <div
                      className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:max-w-full [&>svg]:max-h-full [&>svg]:object-contain select-none"
                      dangerouslySetInnerHTML={{ __html: generatedLogo.svg }}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center p-4 text-neutral-400">
                      <Sparkles className="w-8 h-8 text-violet-400 mb-2" />
                      <span className="text-xs font-bold text-white">{activeBrandName}</span>
                      <span className="text-[10px] text-neutral-500 font-mono mt-1">Vector Monogram Mark</span>
                    </div>
                  )}
                  {/* Subtle Tech Corner Accents */}
                  <div className="absolute top-2 left-2 w-2 h-2 border-t-2 border-l-2 border-violet-500/60 pointer-events-none" />
                  <div className="absolute top-2 right-2 w-2 h-2 border-t-2 border-r-2 border-violet-500/60 pointer-events-none" />
                  <div className="absolute bottom-2 left-2 w-2 h-2 border-b-2 border-l-2 border-violet-500/60 pointer-events-none" />
                  <div className="absolute bottom-2 right-2 w-2 h-2 border-b-2 border-r-2 border-violet-500/60 pointer-events-none" />
                </div>
              ) : (
                <div className="text-xs font-mono text-neutral-500">No logo generated</div>
              )}
            </div>

            {/* Logo Metadata Description */}
            {generatedLogo && (
              <p className="text-[11px] text-neutral-600 dark:text-neutral-400 text-center mt-3 max-w-sm italic leading-relaxed">
                "{generatedLogo.promptDescription}"
              </p>
            )}

            {/* Action Bar */}
            <div className="w-full mt-4 pt-3 border-t border-neutral-200 dark:border-[#162030] flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleSetPrimary}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white transition-all shadow-sm"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{activeAsPrimary ? 'Active Identity Saved!' : 'Use as Active Logo'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadSvg}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-neutral-200 dark:bg-[#141b29] hover:bg-neutral-300 dark:hover:bg-[#1e293b] text-neutral-800 dark:text-neutral-200 transition-colors border border-neutral-300 dark:border-[#222f47]"
                  title="Download scalable SVG vector file"
                >
                  <Download className="w-3.5 h-3.5 text-violet-400" />
                  <span>SVG</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadPng}
                  disabled={isDownloadingPng}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-neutral-200 dark:bg-[#141b29] hover:bg-neutral-300 dark:hover:bg-[#1e293b] text-neutral-800 dark:text-neutral-200 transition-colors border border-neutral-300 dark:border-[#222f47]"
                  title="Download 1024x1024 high-res PNG file"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{isDownloadingPng ? 'Exporting...' : 'PNG (1024px)'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

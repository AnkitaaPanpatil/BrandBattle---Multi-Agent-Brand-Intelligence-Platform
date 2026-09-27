import React, { useState } from 'react';
import { X, Copy, Download, Check, FileText, Code2, Globe, ExternalLink, RefreshCw } from 'lucide-react';
import { BrandKit, ClarifiedIdea, DebateStage } from '../types/brand.js';
import { createPublicShareLink } from '../services/firebase.js';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  brandKit: BrandKit | null;
  clarified: ClarifiedIdea | null;
  debate: DebateStage | null;
  idea: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  brandKit,
  clarified,
  debate,
  idea,
}) => {
  const [tab, setTab] = useState<'md' | 'json' | 'share'>('md');
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState<string>('');
  const [isGeneratingShare, setIsGeneratingShare] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  if (!isOpen || !brandKit) return null;

  const handleGenerateShareUrl = async () => {
    if (shareUrl) return;
    setIsGeneratingShare(true);
    try {
      const shareId = await createPublicShareLink({
        originalIdea: idea,
        brandName: brandKit.brandNameProposal,
        oneLinePitch: brandKit.oneLinePitch,
        positioningStatement: brandKit.positioningStatement,
        primaryValueProposition: brandKit.primaryValueProposition,
        clarified: clarified!,
        debate: debate!,
        brandKit,
        logoImageUrl: brandKit.launchMediaAssets?.logoImageUrl,
      });
      const url = `${window.location.origin}${window.location.pathname}?shareId=${shareId}`;
      setShareUrl(url);
    } catch (err) {
      console.error('Failed to generate public share link:', err);
    } finally {
      setIsGeneratingShare(false);
    }
  };

  const markdownContent = `# BrandBattle Strategy Dossier: ${brandKit.brandNameProposal}
*Arbitrated by BrandBattle Multi-Agent Intelligence Arena*
*Date: ${new Date().toLocaleDateString()}*

---

## 01. Raw Concept & Foundational Problem
- **Original Pitch:** ${idea}
- **Problem Statement:** ${clarified?.problemStatement}
- **Primary ICP:** ${clarified?.targetAudience}
- **Core Value Driver:** ${clarified?.coreValueDriver}
- **Key Operational Constraints:**
${clarified?.operationalConstraints.map((c) => `  - ${c}`).join('\n')}

---

## 02. Multi-Agent Debate Arena Clashes
### Agent A: Marcus Vance (Growth VC)
- **Stance:** ${debate?.vc.stance}
- **Opening Diagnosis:** ${debate?.vc.openingThesis}
- **Defensibility Mandate:** ${debate?.vc.recommendedAction}
- **Metric Score:** ${debate?.vc.scorecard.metric} (${debate?.vc.scorecard.score}/100)

### Agent B: Solenne Moreau (Creative Director)
- **Stance:** ${debate?.creative.stance}
- **Opening Diagnosis:** ${debate?.creative.openingThesis}
- **Identity Mandate:** ${debate?.creative.recommendedAction}
- **Metric Score:** ${debate?.creative.scorecard.metric} (${debate?.creative.scorecard.score}/100)

### Agent C: Jax 'Zero-BS' Sterling (Anti-Generic Critic)
- **Stance:** ${debate?.skeptic.stance}
- **Opening Diagnosis:** ${debate?.skeptic.openingThesis}
- **Reality Mandate:** ${debate?.skeptic.recommendedAction}
- **Metric Score:** ${debate?.skeptic.scorecard.metric} (${debate?.skeptic.scorecard.score}/100)

**Unanimous Consensus:**
${debate?.keyConsensus.map((k) => `- ${k}`).join('\n')}

**Core Dialectical Tension Resolved:**
> ${debate?.unresolvedTension}

---

## 03. Definitive Brand Positioning & Value Proposition
- **Hero Brand Name:** ${brandKit.brandNameProposal}
- **One-Line Pitch:** ${brandKit.oneLinePitch}
- **Positioning Statement:**
> "${brandKit.positioningStatement}"

- **Primary Value Prop:** ${brandKit.primaryValueProposition}
- **Unfair Moat:** ${brandKit.unfairAdvantage}

### Tagline Matrix
${brandKit.taglineOptions.map((t) => `- **${t.style}:** "${t.text}"`).join('\n')}

---

## 04. 3 Naming Directions & Archetypes
${brandKit.namingOptions
  .map(
    (n) => `### ${n.name} (${n.archetype})
- **Rationale:** ${n.rationale}
- **Domain Viability:** ${n.domainViability}
- **Phonetic Character:** ${n.phoneticVibe}
- **Sample Headline:** "${n.sampleHeadline}"
`
  )
  .join('\n')}

---

## 05. Brand Personality & Anti-Traits
### Core Traits & Behavioral Rules:
${brandKit.personalityTraits
  .map((p) => `- **${p.trait}:** ${p.description}\n  *Rule:* ${p.rule}`)
  .join('\n')}

### Anti-Traits (What This Brand Never Does):
${brandKit.traitsToAvoid
  .map((a) => `- **${a.trait} (BANNED):** ${a.reason}`)
  .join('\n')}

---

## 06. Visual Direction Brief
- **Aesthetic Theme:** ${brandKit.visualDirection.themeName}
- **Art Direction Narrative:** ${brandKit.visualDirection.themeDescription}
- **Typography:**
  - Display Headline: ${brandKit.visualDirection.typography.displayFont}
  - Body & UI: ${brandKit.visualDirection.typography.bodyFont}
  - Style Notes: ${brandKit.visualDirection.typography.styleNotes}

- **Color Palette:**
${brandKit.visualDirection.colorPalette
  .map((c) => `  - **${c.name}** (\`${c.hex}\`) - *${c.role}*: ${c.psychologicalEffect}`)
  .join('\n')}

- **Logo Mark Philosophy:**
  - Monogram: **${brandKit.visualDirection.logoConcept.monogramLetters}**
  - Mark Geometry: ${brandKit.visualDirection.logoConcept.symbolDescription}
  - Philosophy: ${brandKit.visualDirection.logoConcept.designPhilosophy}

---

## 07. Guerilla Launch Playbook
${brandKit.launchTactics.map((t, i) => `${i + 1}. ${t}`).join('\n')}

---
*Created with BrandBattle - Multi-Agent Brand Strategy Studio.*
`;

  const jsonContent = JSON.stringify(
    {
      idea,
      clarified,
      debate,
      brandKit,
      exportedAt: new Date().toISOString(),
    },
    null,
    2
  );

  const activeContent = tab === 'md' ? markdownContent : jsonContent;

  const handleCopy = () => {
    navigator.clipboard.writeText(activeContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const filename = `${brandKit.brandNameProposal.toLowerCase().replace(/[^a-z0-9]/g, '-')}-strategy.${tab === 'md' ? 'md' : 'json'}`;
    const blob = new Blob([activeContent], {
      type: tab === 'md' ? 'text/markdown' : 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#070a10] border border-neutral-200 dark:border-[#1a2333] rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-200 dark:border-[#1a2333] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-lg text-neutral-900 dark:text-white">
              Export Brand Dossier
            </span>
            <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400">
              ({brandKit.brandNameProposal})
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Format toggle */}
            <div className="flex p-0.5 bg-neutral-100 dark:bg-[#0f1422] border border-neutral-200 dark:border-[#1e2738] rounded-lg">
              <button
                onClick={() => setTab('md')}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  tab === 'md'
                    ? 'bg-white dark:bg-[#1b2333] text-neutral-900 dark:text-white shadow-xs border border-transparent dark:border-[#28354c]'
                    : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-emerald-500" />
                <span>Markdown</span>
              </button>
              <button
                onClick={() => setTab('json')}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  tab === 'json'
                    ? 'bg-white dark:bg-[#1b2333] text-neutral-900 dark:text-white shadow-xs border border-transparent dark:border-[#28354c]'
                    : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
                }`}
              >
                <Code2 className="w-3.5 h-3.5 text-cyan-500" />
                <span>JSON</span>
              </button>
              <button
                onClick={() => {
                  setTab('share');
                  handleGenerateShareUrl();
                }}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  tab === 'share'
                    ? 'bg-white dark:bg-[#1b2333] text-neutral-900 dark:text-white shadow-xs border border-transparent dark:border-[#28354c]'
                    : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
                }`}
              >
                <Globe className="w-3.5 h-3.5 text-blue-500" />
                <span>Public Link</span>
              </button>
            </div>

            <button
              onClick={onClose}
              title="Close (Esc)"
              className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-[#141b29] transition-colors flex items-center gap-1"
            >
              <kbd className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500 hidden sm:inline px-1 py-0.5 bg-neutral-100 dark:bg-[#141b29] rounded border border-neutral-200 dark:border-[#202a3c]">Esc</kbd>
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Preview */}
        {tab === 'share' ? (
          <div className="flex-1 overflow-y-auto p-6 bg-neutral-50 dark:bg-[#040609] flex flex-col justify-center items-center text-center space-y-5 border-y border-neutral-200 dark:border-[#121824]">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Globe className="w-6 h-6" />
            </div>

            <div>
              <h4 className="font-display font-extrabold text-lg text-neutral-900 dark:text-white">
                Read-Only Public Web Dossier
              </h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-md mx-auto">
                Share this unique link with co-founders, investors, or designers. Anyone with this link can view the complete interactive brand kit without logging in.
              </p>
            </div>

            <div className="w-full max-w-md">
              {isGeneratingShare ? (
                <div className="flex items-center justify-center gap-2 p-3 text-xs font-mono text-indigo-500">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Provisioning Public Firestore Record...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={shareUrl}
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                    className="flex-1 bg-white dark:bg-[#0c1018] border border-neutral-300 dark:border-[#1e2738] rounded-xl px-3.5 py-2.5 text-xs font-mono select-all focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(shareUrl);
                      setCopiedShare(true);
                      setTimeout(() => setCopiedShare(false), 2000);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-all"
                  >
                    {copiedShare ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {shareUrl && (
              <a
                href={shareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                <span>Preview public link in new tab</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-neutral-50 dark:bg-[#040609] font-mono text-xs text-neutral-800 dark:text-neutral-200 leading-relaxed whitespace-pre-wrap select-all border-y border-neutral-200 dark:border-[#121824]">
            {activeContent}
          </div>
        )}

        {/* Modal Footer */}
        <div className="p-4 bg-white dark:bg-[#070a10] flex items-center justify-between">
          <span className="text-xs text-neutral-500 dark:text-neutral-400 hidden sm:inline">
            {tab === 'share'
              ? 'Stored securely in Cloud Firestore for universal read-only access.'
              : 'Export format compatible with Notion, GitHub, and pitch memos.'}
          </span>
          <div className="flex items-center gap-2 ml-auto sm:ml-0">
            {tab !== 'share' && (
              <>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-200 hover:text-neutral-900 dark:hover:text-white bg-neutral-100 dark:bg-[#141b29] hover:bg-neutral-200 dark:hover:bg-[#1c2638] rounded-lg transition-colors border border-neutral-200 dark:border-[#1e2738]"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-emerald-500">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy to Clipboard</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-neutral-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-lg transition-all shadow-md active:scale-[0.98]"
                >
                  <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Download File</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

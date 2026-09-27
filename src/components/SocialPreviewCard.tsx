import React, { useState } from 'react';
import {
  Globe,
  Share2,
  Copy,
  Check,
  ExternalLink,
  Twitter,
  Linkedin,
  MessageSquare,
  Sparkles,
  Layers,
  Image as ImageIcon,
} from 'lucide-react';
import { BrandKit, NamingOption } from '../types/brand.js';

interface SocialPreviewCardProps {
  brandKit: BrandKit;
  selectedName: NamingOption;
  shareUrl?: string;
  shareId?: string;
}

export const SocialPreviewCard: React.FC<SocialPreviewCardProps> = ({
  brandKit,
  selectedName,
  shareUrl,
  shareId,
}) => {
  const [platform, setPlatform] = useState<'twitter' | 'linkedin' | 'slack'>('twitter');
  const [copiedImgUrl, setCopiedImgUrl] = useState(false);

  const brandName = selectedName.name || brandKit.brandNameProposal;
  const pitch = brandKit.oneLinePitch;
  const archetype = selectedName.archetype || 'Strategic Identity';
  const theme = brandKit.visualDirection.themeName;
  const primaryColor = brandKit.visualDirection.colorPalette[0]?.hex || '#06b6d4';

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const rawHostname = typeof window !== 'undefined' ? window.location.hostname : 'brandbattle.studio';
  const domain =
    rawHostname.includes('.run.app') || rawHostname.includes('localhost') || rawHostname.includes('127.0.0.1')
      ? 'brandbattle.studio'
      : rawHostname;

  const effectiveUrl =
    shareUrl ||
    (shareId
      ? `${origin}${window.location.pathname}?shareId=${shareId}`
      : typeof window !== 'undefined'
      ? window.location.href
      : '');

  const ogParams = new URLSearchParams({
    brandName,
    pitch,
    archetype,
    theme,
    color: primaryColor,
  });
  if (shareId) {
    ogParams.set('shareId', shareId);
  }

  const ogImageUrl = `${origin}/api/og-image?${ogParams.toString()}`;

  const handleCopyImageUrl = () => {
    navigator.clipboard.writeText(ogImageUrl);
    setCopiedImgUrl(true);
    setTimeout(() => setCopiedImgUrl(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-[#0c1017] border border-neutral-200 dark:border-[#1a2333] rounded-2xl p-5 sm:p-7 shadow-xl mb-6 sm:mb-8 transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-5 border-b border-neutral-200 dark:border-[#1a2333]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/20 shrink-0">
            <Globe className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-extrabold text-base sm:text-lg text-neutral-900 dark:text-white">
                Open Graph Social Share Preview
              </h3>
              <span className="text-[10px] font-mono uppercase bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-800 px-2 py-0.5 rounded-full font-bold">
                1200 × 630 OG Card
              </span>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Real-time metadata card generated dynamically when this dossier is shared on social media.
            </p>
          </div>
        </div>

        {/* Platform Selector Buttons */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-neutral-100 dark:bg-[#121824] p-1 rounded-lg border border-neutral-200 dark:border-[#1a2333] text-xs">
          <button
            type="button"
            onClick={() => setPlatform('twitter')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all font-medium ${
              platform === 'twitter'
                ? 'bg-white dark:bg-[#1a2333] text-neutral-900 dark:text-white shadow-xs font-semibold'
                : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
            }`}
          >
            <Twitter className="w-3.5 h-3.5" />
            <span>X / Twitter</span>
          </button>

          <button
            type="button"
            onClick={() => setPlatform('linkedin')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all font-medium ${
              platform === 'linkedin'
                ? 'bg-white dark:bg-[#1a2333] text-neutral-900 dark:text-white shadow-xs font-semibold'
                : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
            }`}
          >
            <Linkedin className="w-3.5 h-3.5" />
            <span>LinkedIn</span>
          </button>

          <button
            type="button"
            onClick={() => setPlatform('slack')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all font-medium ${
              platform === 'slack'
                ? 'bg-white dark:bg-[#1a2333] text-neutral-900 dark:text-white shadow-xs font-semibold'
                : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Slack / Discord</span>
          </button>
        </div>
      </div>

      {/* Main Mockup Area - Compact Thumbnail Badge Size */}
      <div className="bg-neutral-100 dark:bg-[#06080e] border border-neutral-200 dark:border-[#162030] rounded-xl p-3 sm:p-4 mb-4 flex justify-center">
        {/* PLATFORM 1: Twitter / X Large Summary Card (Thumbnail Badge) */}
        {platform === 'twitter' && (
          <div className="w-full max-w-xs sm:max-w-[290px] bg-black text-white border border-[#2f3336] rounded-xl overflow-hidden shadow-lg mx-auto transition-transform">
            {/* Post Author Bar */}
            <div className="p-2 sm:p-2.5 border-b border-[#2f3336] flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-sky-400 to-indigo-600 flex items-center justify-center font-bold text-[10px] shrink-0">
                BB
              </div>
              <div className="leading-tight min-w-0 flex-1">
                <div className="font-bold text-[11px] flex items-center gap-1">
                  <span>Founder</span>
                  <span className="text-neutral-500 text-[10px] font-normal">@founder</span>
                </div>
                <div className="text-[10px] text-neutral-300 truncate">
                  Strategy for <strong className="text-white">{brandName}</strong>:
                </div>
              </div>
            </div>

            {/* Embedded Large Image Card */}
            <div className="relative group cursor-pointer overflow-hidden border-t border-[#2f3336]">
              <div className="relative aspect-[1200/630] w-full overflow-hidden bg-neutral-900">
                <img
                  src={ogImageUrl}
                  alt={`${brandName} Open Graph Card`}
                  className="w-full h-full object-cover"
                  loading="eager"
                />
              </div>
              <div className="p-2.5 bg-[#16181c] border-t border-[#2f3336] flex flex-col gap-0.5">
                <div className="text-[9px] uppercase tracking-wider text-neutral-400 font-mono font-semibold truncate">
                  {domain}
                </div>
                <div className="font-bold text-[11px] text-white leading-snug line-clamp-1">
                  {brandName} – Verified Strategy
                </div>
                <div className="text-[10px] text-neutral-400 leading-normal line-clamp-1 mt-0.5">
                  {pitch}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PLATFORM 2: LinkedIn Unfurl Card (Thumbnail Badge) */}
        {platform === 'linkedin' && (
          <div className="w-full max-w-xs sm:max-w-[290px] bg-white dark:bg-[#1b1f28] border border-neutral-200 dark:border-[#2a3447] rounded-xl overflow-hidden shadow-lg mx-auto transition-transform">
            <div className="p-2 sm:p-2.5 border-b border-neutral-200 dark:border-[#2a3447] flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-700 flex items-center justify-center font-bold text-white text-[10px] shrink-0">
                F
              </div>
              <div>
                <div className="font-bold text-[11px] text-neutral-900 dark:text-white leading-tight">
                  Founding Team
                </div>
                <div className="text-[9px] text-neutral-500 dark:text-neutral-400">
                  Building {brandName}
                </div>
              </div>
            </div>

            <div className="px-2.5 py-1.5 text-[10px] text-neutral-800 dark:text-neutral-200 line-clamp-1">
              Venture strategy for {brandName}: "{pitch}"
            </div>

            {/* Card */}
            <div className="border border-neutral-200 dark:border-[#2a3447] rounded-lg mx-2 mb-2 overflow-hidden">
              <div className="relative aspect-[1200/630] w-full overflow-hidden bg-neutral-900">
                <img
                  src={ogImageUrl}
                  alt={`${brandName} Open Graph Card`}
                  className="w-full h-full object-cover block"
                />
              </div>
              <div className="p-2 bg-neutral-50 dark:bg-[#121620] flex flex-col gap-0.5">
                <div className="font-bold text-[11px] text-neutral-900 dark:text-white line-clamp-1 leading-snug">
                  {brandName} – Brand Strategy Dossier
                </div>
                <div className="text-[9px] text-neutral-500 dark:text-neutral-400 truncate font-mono">
                  {domain} · 3 min read
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PLATFORM 3: Slack / Discord Embed (Thumbnail Badge) */}
        {platform === 'slack' && (
          <div className="w-full max-w-xs sm:max-w-[290px] bg-white dark:bg-[#1a1d21] border border-neutral-200 dark:border-[#2a323d] rounded-xl p-2.5 shadow-lg mx-auto transition-transform">
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded bg-gradient-to-tr from-emerald-500 to-teal-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0">
                AI
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-1">
                  <span className="font-bold text-[11px] text-neutral-900 dark:text-white">StrategyBot</span>
                  <span className="text-[9px] text-neutral-400 font-mono">12:45 PM</span>
                </div>
                <div className="text-[10px] text-neutral-600 dark:text-neutral-300">
                  Shared brand dossier:
                </div>

                {/* Slack Embed with Left Colored Stripe */}
                <div
                  className="mt-1.5 pl-2 border-l-2 rounded-r-md space-y-1 py-0.5"
                  style={{ borderColor: primaryColor }}
                >
                  <div className="text-[9px] font-mono uppercase text-neutral-400">BrandBattle</div>
                  <a
                    href={effectiveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-[11px] text-cyan-600 dark:text-cyan-400 hover:underline block truncate"
                  >
                    {brandName} – Brand Dossier
                  </a>
                  <p className="text-[10px] text-neutral-700 dark:text-neutral-300 line-clamp-1">
                    {pitch}
                  </p>
                  <div className="rounded border border-neutral-200 dark:border-[#2a323d] overflow-hidden aspect-[1200/630] max-w-[200px] w-full bg-neutral-900">
                    <img
                      src={ogImageUrl}
                      alt={`${brandName} Card`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info & Direct Image URL Copy */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-neutral-500 pt-3 border-t border-neutral-200 dark:border-[#1a2333]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Dynamic tags: <code className="font-mono text-neutral-700 dark:text-neutral-300">og:title</code>, <code className="font-mono text-neutral-700 dark:text-neutral-300">og:description</code>, <code className="font-mono text-neutral-700 dark:text-neutral-300">og:image</code>, <code className="font-mono text-neutral-700 dark:text-neutral-300">twitter:card</code></span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyImageUrl}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-[#121824] hover:bg-neutral-200 dark:hover:bg-[#1a2334] border border-neutral-300 dark:border-[#1e2a3c] text-neutral-800 dark:text-neutral-200 font-medium transition-colors cursor-pointer"
          >
            {copiedImgUrl ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400">Copied OG Image URL</span>
              </>
            ) : (
              <>
                <ImageIcon className="w-3.5 h-3.5 text-neutral-400" />
                <span>Copy 1200x630 OG Image URL</span>
              </>
            )}
          </button>

          <a
            href={ogImageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-cyan-600 dark:text-cyan-400 hover:underline px-2 py-1"
          >
            <span>Open Image</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};

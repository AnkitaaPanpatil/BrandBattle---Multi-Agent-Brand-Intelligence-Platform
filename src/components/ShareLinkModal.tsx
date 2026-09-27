import React, { useState } from 'react';
import {
  Share2,
  Copy,
  Check,
  ExternalLink,
  Globe,
  Sparkles,
  X,
  Twitter,
  Linkedin,
  MessageCircle,
  Mail,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { BrandKit } from '../types/brand.js';

interface ShareLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareUrl: string;
  brandKit: BrandKit;
  idea: string;
}

export const ShareLinkModal: React.FC<ShareLinkModalProps> = ({
  isOpen,
  onClose,
  shareUrl,
  brandKit,
  idea,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const tweetText = encodeURIComponent(
    `Check out the strategy dossier for ${brandKit.brandNameProposal}: "${brandKit.oneLinePitch}"\n\nForged via multi-agent AI arbitration: ${shareUrl}`
  );
  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${tweetText}`;

  const linkedinShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
    shareUrl
  )}`;

  const whatsappShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    `Check out the brand strategy for ${brandKit.brandNameProposal}: ${shareUrl}`
  )}`;

  const mailtoUrl = `mailto:?subject=${encodeURIComponent(
    `Brand Strategy Dossier: ${brandKit.brandNameProposal}`
  )}&body=${encodeURIComponent(
    `Here is the finalized brand kit for ${brandKit.brandNameProposal}:\n\n${brandKit.oneLinePitch}\n\nView the interactive dossier here: ${shareUrl}`
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#0c1017] border border-neutral-200 dark:border-[#1a2333] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden relative transition-colors">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-neutral-200 dark:border-[#1a2333] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <Globe className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-base sm:text-lg text-neutral-900 dark:text-white flex items-center gap-2">
                <span>Public Shareable Link</span>
                <span className="text-[10px] font-mono uppercase bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 px-2 py-0.5 rounded-full font-bold">
                  Active
                </span>
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                Anyone with this unique link can view the read-only brand dossier.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-700 dark:hover:text-white p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-[#151c28] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* Link Box */}
          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-neutral-500 font-semibold block mb-2">
              Unique Read-Only URL
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                  className="w-full bg-neutral-50 dark:bg-[#070a10] border border-neutral-300 dark:border-[#1e2a3f] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-mono text-neutral-900 dark:text-white select-all focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-500/20 active:scale-[0.98] transition-all shrink-0 cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-white" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-white" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Social & Direct Actions */}
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 font-semibold block mb-2.5">
              Quick Share Channels
            </span>
            <div className="grid grid-cols-4 gap-2">
              <a
                href={twitterShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl bg-neutral-50 dark:bg-[#070a10] hover:bg-neutral-100 dark:hover:bg-[#121824] border border-neutral-200 dark:border-[#1a2333] text-neutral-700 dark:text-neutral-300 hover:text-sky-500 transition-colors"
              >
                <Twitter className="w-4 h-4" />
                <span className="text-[10px] font-medium">X / Twitter</span>
              </a>

              <a
                href={linkedinShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl bg-neutral-50 dark:bg-[#070a10] hover:bg-neutral-100 dark:hover:bg-[#121824] border border-neutral-200 dark:border-[#1a2333] text-neutral-700 dark:text-neutral-300 hover:text-blue-500 transition-colors"
              >
                <Linkedin className="w-4 h-4" />
                <span className="text-[10px] font-medium">LinkedIn</span>
              </a>

              <a
                href={whatsappShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl bg-neutral-50 dark:bg-[#070a10] hover:bg-neutral-100 dark:hover:bg-[#121824] border border-neutral-200 dark:border-[#1a2333] text-neutral-700 dark:text-neutral-300 hover:text-emerald-500 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="text-[10px] font-medium">WhatsApp</span>
              </a>

              <a
                href={mailtoUrl}
                className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl bg-neutral-50 dark:bg-[#070a10] hover:bg-neutral-100 dark:hover:bg-[#121824] border border-neutral-200 dark:border-[#1a2333] text-neutral-700 dark:text-neutral-300 hover:text-purple-500 transition-colors"
              >
                <Mail className="w-4 h-4" />
                <span className="text-[10px] font-medium">Email</span>
              </a>
            </div>
          </div>

          {/* Open Graph Social Card Preview */}
          <div className="p-3 sm:p-3.5 rounded-xl bg-neutral-50/90 dark:bg-[#070b12] border border-neutral-200 dark:border-[#162030] overflow-hidden">
            <div className="flex items-center justify-between text-[11px] font-mono text-neutral-500 mb-2">
              <span className="flex items-center gap-1.5 font-bold uppercase text-neutral-700 dark:text-neutral-300">
                <Globe className="w-3.5 h-3.5 text-sky-500" />
                <span>Open Graph Social Card Preview</span>
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 text-[10px]">
                <CheckCircle2 className="w-3 h-3" />
                <span>1200 × 630</span>
              </span>
            </div>
            <div className="flex justify-center py-1">
              <div className="w-full max-w-[260px] sm:max-w-[280px] aspect-[1200/630] rounded-lg overflow-hidden border border-neutral-200 dark:border-[#1a2333] shadow-md bg-neutral-900 relative">
                <img
                  src={`${typeof window !== 'undefined' ? window.location.origin : ''}/api/og-image?brandName=${encodeURIComponent(
                    brandKit.brandNameProposal
                  )}&pitch=${encodeURIComponent(
                    brandKit.oneLinePitch
                  )}&archetype=${encodeURIComponent(
                    brandKit.namingOptions[0]?.archetype || 'Strategic Identity'
                  )}&theme=${encodeURIComponent(
                    brandKit.visualDirection.themeName
                  )}&color=${encodeURIComponent(
                    brandKit.visualDirection.colorPalette[0]?.hex || '#06b6d4'
                  )}`}
                  alt={`${brandKit.brandNameProposal} Open Graph Card`}
                  className="w-full h-full object-cover object-center block"
                  loading="lazy"
                />
              </div>
            </div>
          </div>

          {/* Security & Cloud Note */}
          <div className="flex items-center gap-2 text-[11px] text-neutral-500 dark:text-neutral-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Stored securely in Cloud Firestore. No login required for viewers.</span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-neutral-50 dark:bg-[#090d15] border-t border-neutral-200 dark:border-[#1a2333] flex items-center justify-between">
          <a
            href={shareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
          >
            <span>Open Link in New Tab</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-medium bg-neutral-200 dark:bg-[#1a2333] hover:bg-neutral-300 dark:hover:bg-[#223048] text-neutral-800 dark:text-neutral-200 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

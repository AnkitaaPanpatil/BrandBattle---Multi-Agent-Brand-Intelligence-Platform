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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#0c1017] border border-neutral-200 dark:border-[#1a2333] rounded-2xl w-full max-w-[420px] shadow-2xl overflow-hidden relative transition-colors animate-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-neutral-200 dark:border-[#1a2333] flex items-center justify-between bg-neutral-50/50 dark:bg-[#080c14]/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
              <Globe className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="font-display font-bold text-sm text-neutral-900 dark:text-white flex items-center gap-1.5">
                <span>Public Shareable Link</span>
                <span className="text-[9px] font-mono uppercase bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/80 px-1.5 py-0.2 rounded-full font-bold">
                  Active
                </span>
              </h3>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Anyone with this unique link can view the read-only brand dossier.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-700 dark:hover:text-white p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-[#151c28] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 space-y-3.5">
          {/* Link Box */}
          <div>
            <label className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-semibold block mb-1.5">
              Unique Read-Only URL
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                onClick={(e) => (e.target as HTMLInputElement).select()}
                className="w-full bg-neutral-50 dark:bg-[#070a10] border border-neutral-300 dark:border-[#1e2a3f] rounded-lg px-3 py-1.5 text-xs font-mono text-neutral-900 dark:text-white select-all focus:outline-none focus:ring-1 focus:ring-emerald-500 truncate"
              />

              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs active:scale-95 transition-all shrink-0 cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-white" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-white" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Share Channels */}
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-semibold block mb-1.5">
              Quick Share Channels
            </span>
            <div className="grid grid-cols-4 gap-1.5">
              <a
                href={twitterShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center gap-1 p-2 rounded-lg bg-neutral-50 dark:bg-[#070a10] hover:bg-neutral-100 dark:hover:bg-[#121824] border border-neutral-200 dark:border-[#1a2333] text-neutral-700 dark:text-neutral-300 hover:text-sky-500 transition-colors"
              >
                <Twitter className="w-3.5 h-3.5" />
                <span className="text-[10px] font-medium">X / Twitter</span>
              </a>

              <a
                href={linkedinShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center gap-1 p-2 rounded-lg bg-neutral-50 dark:bg-[#070a10] hover:bg-neutral-100 dark:hover:bg-[#121824] border border-neutral-200 dark:border-[#1a2333] text-neutral-700 dark:text-neutral-300 hover:text-blue-500 transition-colors"
              >
                <Linkedin className="w-3.5 h-3.5" />
                <span className="text-[10px] font-medium">LinkedIn</span>
              </a>

              <a
                href={whatsappShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center gap-1 p-2 rounded-lg bg-neutral-50 dark:bg-[#070a10] hover:bg-neutral-100 dark:hover:bg-[#121824] border border-neutral-200 dark:border-[#1a2333] text-neutral-700 dark:text-neutral-300 hover:text-emerald-500 transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span className="text-[10px] font-medium">WhatsApp</span>
              </a>

              <a
                href={mailtoUrl}
                className="flex flex-col items-center justify-center gap-1 p-2 rounded-lg bg-neutral-50 dark:bg-[#070a10] hover:bg-neutral-100 dark:hover:bg-[#121824] border border-neutral-200 dark:border-[#1a2333] text-neutral-700 dark:text-neutral-300 hover:text-purple-500 transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
                <span className="text-[10px] font-medium">Email</span>
              </a>
            </div>
          </div>

          {/* Compact Social Preview Snippet */}
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-neutral-50 dark:bg-[#070b12] border border-neutral-200 dark:border-[#162030] overflow-hidden">
            <div className="w-20 h-11 rounded-md overflow-hidden border border-neutral-300 dark:border-neutral-700 bg-neutral-900 shrink-0">
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
                alt={`${brandKit.brandNameProposal} Preview`}
                className="w-full h-full object-cover object-center block"
                loading="lazy"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 mb-0.5">
                <span className="font-semibold uppercase tracking-wider">Social Card</span>
                <span className="text-emerald-500 font-bold">1200×630</span>
              </div>
              <p className="text-xs font-bold text-neutral-800 dark:text-neutral-200 truncate">
                {brandKit.brandNameProposal}
              </p>
              <p className="text-[10px] text-neutral-500 truncate">
                {brandKit.oneLinePitch}
              </p>
            </div>
          </div>

          {/* Security & Cloud Note */}
          <div className="flex items-center gap-1.5 text-[10px] text-neutral-500 dark:text-neutral-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Stored in Cloud Firestore. No login required for viewers.</span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-2.5 bg-neutral-50 dark:bg-[#090d15] border-t border-neutral-200 dark:border-[#1a2333] flex items-center justify-between">
          <a
            href={shareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
          >
            <span>Open in New Tab</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1 rounded-lg text-xs font-semibold bg-neutral-200 dark:bg-[#1a2333] hover:bg-neutral-300 dark:hover:bg-[#223048] text-neutral-800 dark:text-neutral-200 transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { X, Trash2, ArrowUpRight, FolderHeart, Calendar, Share2, Check } from 'lucide-react';
import { SavedBrandKitRecord } from '../types/brand.js';
import { createPublicShareLink } from '../services/firebase.js';

interface SavedKitsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedKits: SavedBrandKitRecord[];
  onSelectKit: (kit: SavedBrandKitRecord) => void;
  onDeleteKit: (kitId: string) => Promise<void>;
  isLoading: boolean;
}

export const SavedKitsDrawer: React.FC<SavedKitsDrawerProps> = ({
  isOpen,
  onClose,
  savedKits,
  onSelectKit,
  onDeleteKit,
  isLoading,
}) => {
  const [sharingKitId, setSharingKitId] = useState<string | null>(null);
  const [copiedKitId, setCopiedKitId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleShareKit = async (item: SavedBrandKitRecord) => {
    setSharingKitId(item.id);
    try {
      const shareId = await createPublicShareLink({
        originalIdea: item.originalIdea,
        brandName: item.brandName,
        oneLinePitch: item.oneLinePitch,
        positioningStatement: item.positioningStatement,
        primaryValueProposition: item.primaryValueProposition,
        clarified: item.clarified,
        debate: item.debate,
        brandKit: item.brandKit,
        logoImageUrl: item.logoImageUrl,
      });
      const url = `${window.location.origin}${window.location.pathname}?shareId=${shareId}`;
      navigator.clipboard.writeText(url);
      setCopiedKitId(item.id);
      setTimeout(() => setCopiedKitId(null), 2500);
    } catch (err) {
      console.error('Failed to generate public link from drawer:', err);
    } finally {
      setSharingKitId(null);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#070a10] border-l border-neutral-200 dark:border-[#1a2333] w-full max-w-md h-full flex flex-col shadow-2xl overflow-hidden transition-colors"
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-200 dark:border-[#1a2333] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-500/15 flex items-center justify-center border border-rose-500/30">
              <FolderHeart className="w-4 h-4 text-rose-500" />
            </div>
            <div>
              <h2 className="font-display font-bold text-base sm:text-lg text-neutral-900 dark:text-white">
                Saved Brand Kits
              </h2>
              <span className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
                Google Cloud Firestore
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            title="Close (Esc)"
            className="p-1.5 text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-lg hover:bg-neutral-100 dark:hover:bg-[#141b29] transition-colors flex items-center gap-1"
          >
            <kbd className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500 hidden sm:inline px-1 py-0.5 bg-neutral-100 dark:bg-[#141b29] rounded border border-neutral-200 dark:border-[#202a3c]">Esc</kbd>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {isLoading ? (
            <div className="py-16 text-center text-xs text-neutral-500 dark:text-neutral-400">
              <div className="w-7 h-7 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <span>Fetching cloud dossiers...</span>
            </div>
          ) : savedKits.length === 0 ? (
            <div className="py-16 text-center text-xs text-neutral-500 dark:text-neutral-400">
              <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-[#0d121c] border border-neutral-200 dark:border-[#1e2738] flex items-center justify-center mx-auto mb-3">
                <FolderHeart className="w-6 h-6 text-neutral-400" />
              </div>
              <p className="font-medium text-neutral-800 dark:text-neutral-200">No saved brand kits yet.</p>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 max-w-xs mx-auto">
                Complete a battle and click "Save to Firebase" to store kits across devices.
              </p>
            </div>
          ) : (
            savedKits.map((item) => (
              <div
                key={item.id}
                className="bg-neutral-50 dark:bg-[#0c1017] border border-neutral-200 dark:border-[#1a2333] hover:border-amber-500/50 dark:hover:border-amber-500/60 rounded-xl p-4 transition-all flex flex-col justify-between gap-3 shadow-xs hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-display font-bold text-sm sm:text-base text-neutral-900 dark:text-white truncate">
                      {item.brandName}
                    </span>
                    <span className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400 flex items-center gap-1 shrink-0">
                      <Calendar className="w-3 h-3 text-neutral-400" />
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-600 dark:text-neutral-300 line-clamp-2 leading-relaxed mb-2">
                    {item.oneLinePitch}
                  </p>
                  <div className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-1 italic">
                    Concept: "{item.originalIdea}"
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2.5 border-t border-neutral-200 dark:border-[#1a2333]">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        onSelectKit(item);
                        onClose();
                      }}
                      className="flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-500 dark:hover:text-amber-300 transition-colors"
                    >
                      <span>Load Into Workspace</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleShareKit(item)}
                      disabled={sharingKitId === item.id}
                      className="flex items-center gap-1 text-xs text-neutral-500 hover:text-emerald-500 dark:text-neutral-400 dark:hover:text-emerald-400 transition-colors cursor-pointer"
                      title="Generate and copy public link"
                    >
                      {copiedKitId === item.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Share2 className={`w-3.5 h-3.5 ${sharingKitId === item.id ? 'animate-spin' : ''}`} />
                          <span>{sharingKitId === item.id ? 'Sharing...' : 'Public Link'}</span>
                        </>
                      )}
                    </button>
                  </div>

                  <button
                    onClick={() => onDeleteKit(item.id)}
                    className="p-1.5 text-neutral-400 hover:text-rose-500 rounded-md hover:bg-neutral-100 dark:hover:bg-[#141b29] transition-colors"
                    title="Delete Kit"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-3.5 border-t border-neutral-200 dark:border-[#1a2333] bg-neutral-50 dark:bg-[#05070b] text-center text-[11px] text-neutral-500 dark:text-neutral-400">
          Persistent Multi-Device Storage via Cloud Firestore
        </div>
      </div>
    </div>
  );
};

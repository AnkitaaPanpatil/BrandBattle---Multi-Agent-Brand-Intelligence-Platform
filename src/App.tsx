import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Swords,
  ArrowRight,
  RotateCcw,
  AlertCircle,
  Loader2,
  Trophy,
  Layers,
  Video,
  Palette,
  CheckCircle2,
} from 'lucide-react';
import { Header } from './components/Header.js';
import { StageProgressBar } from './components/StageProgressBar.js';
import { IdeaIntakeStage } from './components/IdeaIntakeStage.js';
import { DebateArenaStage } from './components/DebateArenaStage.js';
import { BrandKitStage } from './components/BrandKitStage.js';
import { ExportModal } from './components/ExportModal.js';
import { SavedKitsDrawer } from './components/SavedKitsDrawer.js';
import { PublicSharedKitView } from './components/PublicSharedKitView.js';
import { Toast } from './components/Toast.js';
import { ThemeProvider, useTheme } from './context/ThemeContext.js';
import { useKeyboardNavigation } from './hooks/useKeyboardNavigation.js';
import {
  ClarifiedIdea,
  DebateStage,
  BrandKit,
  AgentQuestionResponse,
  SavedBrandKitRecord,
  MarketContextSummary,
  PublicBrandKitRecord,
} from './types/brand.js';
import {
  auth,
  signInWithGoogle,
  logoutUser,
  saveBrandKitToFirestore,
  getUserBrandKits,
  deleteBrandKitFromFirestore,
  getPublicBrandKit,
} from './services/firebase.js';
import { onAuthStateChanged, User } from 'firebase/auth';

function MainApp() {
  const { actualTheme } = useTheme();
  const [currentStage, setCurrentStage] = useState<number>(1);
  const [maxReachedStage, setMaxReachedStage] = useState<number>(1);

  // Data states
  const [idea, setIdea] = useState<string>(
    'An app that helps local organic farmers sell fresh harvests directly to consumers and restaurants, bypassing corporate grocery chains.'
  );
  const [clarified, setClarified] = useState<ClarifiedIdea | null>(null);
  const [debate, setDebate] = useState<DebateStage | null>(null);
  const [brandKit, setBrandKit] = useState<BrandKit | null>(null);

  // User & Firebase states
  const [user, setUser] = useState<User | null>(null);
  const [savedKits, setSavedKits] = useState<SavedBrandKitRecord[]>([]);
  const [isSavedDrawerOpen, setIsSavedDrawerOpen] = useState(false);
  const [isSavingKit, setIsSavingKit] = useState(false);
  const [isLoadingSavedKits, setIsLoadingSavedKits] = useState(false);

  // UI / Async states
  const [isClarifying, setIsClarifying] = useState(false);
  const [isDebating, setIsDebating] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [hasGeminiKey, setHasGeminiKey] = useState<boolean | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Public shared link states
  const [publicRecord, setPublicRecord] = useState<PublicBrandKitRecord | null>(null);
  const [isLoadingPublicRecord, setIsLoadingPublicRecord] = useState(false);
  const [publicRecordError, setPublicRecordError] = useState<string | null>(null);

  // Check for public share link in URL (?shareId=... or ?kit=...)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sid = params.get('shareId') || params.get('kit');
    if (sid) {
      setIsLoadingPublicRecord(true);
      setPublicRecordError(null);
      getPublicBrandKit(sid)
        .then((rec) => {
          if (rec) {
            setPublicRecord(rec);
          } else {
            setPublicRecordError('This public brand kit link could not be found or may have been deleted.');
          }
        })
        .catch((err) => {
          console.error('Error fetching public brand kit:', err);
          setPublicRecordError('Failed to load shared brand kit from Firestore.');
        })
        .finally(() => {
          setIsLoadingPublicRecord(false);
        });
    }
  }, []);

  const handleExitPublicView = () => {
    setPublicRecord(null);
    setPublicRecordError(null);
    window.history.pushState({}, '', window.location.pathname);
  };

  const handleRemixPublicRecord = (remixIdea: string) => {
    setPublicRecord(null);
    setPublicRecordError(null);
    window.history.pushState({}, '', window.location.pathname);
    setIdea(remixIdea);
    setCurrentStage(1);
    setMaxReachedStage(1);
    setClarified(null);
    setDebate(null);
    setBrandKit(null);
    showToast('Loaded shared concept into your studio! You can now battle-test it.');
  };

  // Health check on mount
  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        setHasGeminiKey(data.hasGeminiKey);
      })
      .catch((err) => {
        console.warn('Health check note:', err);
        setHasGeminiKey(false);
      });
  }, []);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await loadUserKits(currentUser.uid);
      } else {
        setSavedKits([]);
      }
    });
    return () => unsubscribe();
  }, []);

  const loadUserKits = async (userId: string) => {
    setIsLoadingSavedKits(true);
    try {
      const kits = await getUserBrandKits(userId);
      setSavedKits(kits);
    } catch (err) {
      console.error('Error loading kits:', err);
    } finally {
      setIsLoadingSavedKits(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Auth Handlers
  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      showToast('Signed in successfully with Google!');
    } catch (err: any) {
      showToast('Sign-in cancelled or encountered an error.');
    }
  };

  const handleSignOut = async () => {
    try {
      await logoutUser();
      showToast('Signed out of BrandBattle.');
    } catch (err) {
      showToast('Sign-out error.');
    }
  };

  // Stage 1: Clarify Idea & Search Grounding
  const handleClarify = async () => {
    if (!idea.trim()) return;
    setIsClarifying(true);
    try {
      const res = await fetch('/api/clarify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea: idea.trim() }),
      });
      if (!res.ok) throw new Error('Failed to clarify idea');
      const data: ClarifiedIdea = await res.json();
      setClarified(data);
      showToast('Market search & problem breakdown complete.');
    } catch (err: any) {
      console.error(err);
      showToast('Error grounding concept. Please try again.');
    } finally {
      setIsClarifying(false);
    }
  };

  // Proceed to Stage 2: Arena
  const handleProceedToArena = async () => {
    if (!clarified) return;
    setCurrentStage(2);
    setMaxReachedStage((prev) => Math.max(prev, 2));

    if (!debate) {
      await runDebate(idea, clarified);
    }
  };

  // Stage 2: Run Debate
  const runDebate = async (ideaText: string, clarifiedObj: ClarifiedIdea) => {
    setIsDebating(true);
    try {
      const res = await fetch('/api/debate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea: ideaText, clarified: clarifiedObj }),
      });
      if (!res.ok) throw new Error('Debate arena failed');
      const data: DebateStage = await res.json();
      setDebate(data);
      showToast('Multi-Agent Debate concluded: 3 personas clashed.');
    } catch (err) {
      console.error(err);
      showToast('Error running debate arena. Check connection.');
    } finally {
      setIsDebating(false);
    }
  };

  // Stage 3: Synthesize Brand Kit
  const handleSynthesize = async () => {
    if (!clarified || !debate) return;
    setIsSynthesizing(true);
    try {
      const res = await fetch('/api/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea, clarified, debate }),
      });
      if (!res.ok) throw new Error('Synthesis failed');
      const data: BrandKit = await res.json();
      setBrandKit(data);
      setCurrentStage(3);
      setMaxReachedStage(3);
      showToast('Brand Strategy Kit synthesized by Chief Brand Arbiter!');
    } catch (err) {
      console.error(err);
      showToast('Error synthesizing brand kit.');
    } finally {
      setIsSynthesizing(false);
    }
  };

  // Save Kit to Firestore
  const handleSaveKit = async () => {
    if (!user) {
      handleGoogleSignIn();
      return;
    }
    if (!brandKit || !clarified || !debate) return;

    setIsSavingKit(true);
    try {
      await saveBrandKitToFirestore(user.uid, user.email || '', {
        originalIdea: idea,
        brandName: brandKit.brandNameProposal,
        oneLinePitch: brandKit.oneLinePitch,
        positioningStatement: brandKit.positioningStatement,
        primaryValueProposition: brandKit.primaryValueProposition,
        clarified,
        debate,
        brandKit,
        logoImageUrl: brandKit.launchMediaAssets?.logoImageUrl,
      });
      await loadUserKits(user.uid);
      showToast('Brand Strategy Kit saved to Firebase cloud!');
    } catch (err) {
      console.error('Error saving kit to Firestore:', err);
      showToast('Failed to save to Firebase.');
    } finally {
      setIsSavingKit(false);
    }
  };

  // Load Saved Kit from Drawer
  const handleSelectSavedKit = (record: SavedBrandKitRecord) => {
    setIdea(record.originalIdea);
    setClarified(record.clarified);
    setDebate(record.debate);
    setBrandKit(record.brandKit);
    setCurrentStage(3);
    setMaxReachedStage(3);
    showToast(`Loaded ${record.brandName} brand kit.`);
  };

  // Delete Saved Kit
  const handleDeleteSavedKit = async (kitId: string) => {
    if (!user) return;
    try {
      await deleteBrandKitFromFirestore(user.uid, kitId);
      setSavedKits((prev) => prev.filter((k) => k.id !== kitId));
      showToast('Brand kit deleted from cloud.');
    } catch (err) {
      showToast('Failed to delete kit.');
    }
  };

  // Follow-up Q&A
  const handleAskQuestion = async (
    question: string,
    targetAgent: 'vc' | 'creative' | 'skeptic' | 'all'
  ): Promise<AgentQuestionResponse> => {
    const res = await fetch('/api/ask-agents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question,
        idea,
        brandKit,
        targetAgent,
      }),
    });
    if (!res.ok) throw new Error('Q&A query failed');
    return await res.json();
  };

  // Copy Full Brand Kit to Clipboard
  const handleCopyFullKit = () => {
    if (!brandKit) return;
    const text = `# Brand Strategy Kit: ${brandKit.brandNameProposal}
Positioning: "${brandKit.positioningStatement}"
One-Line Pitch: ${brandKit.oneLinePitch}
Primary Value Prop: ${brandKit.primaryValueProposition}
Unfair Advantage: ${brandKit.unfairAdvantage}

Taglines:
${brandKit.taglineOptions.map((t) => `- [${t.style}] "${t.text}"`).join('\n')}

3 Naming Directions:
${brandKit.namingOptions
  .map((n) => `- ${n.name} (${n.archetype}): ${n.rationale} [Domain: ${n.domainViability}]`)
  .join('\n')}

Personality Traits:
${brandKit.personalityTraits.map((p) => `- ${p.trait}: ${p.rule}`).join('\n')}

Anti-Traits:
${brandKit.traitsToAvoid.map((a) => `- Never ${a.trait}: ${a.reason}`).join('\n')}

Visual Direction:
- Theme: ${brandKit.visualDirection.themeName}
- Display Font: ${brandKit.visualDirection.typography.displayFont}
- Body Font: ${brandKit.visualDirection.typography.bodyFont}
- Palette: ${brandKit.visualDirection.colorPalette.map((c) => `${c.name} (${c.hex})`).join(', ')}

Arbitration Verdict:
"${brandKit.arbitrationVerdict}"
`;

    navigator.clipboard.writeText(text);
    showToast('Complete Brand Strategy Kit copied to clipboard!');
  };

  const handleDownloadMarkdown = () => {
    if (!brandKit) return;
    const filename = `${brandKit.brandNameProposal.toLowerCase().replace(/[^a-z0-9]/g, '-')}-kit.md`;
    const text =
      `# Brand Strategy Dossier: ${brandKit.brandNameProposal}\n\n` +
      `## Overview\n${brandKit.oneLinePitch}\n\n` +
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
          `Unoccupied White-Space Moat: ${brandKit.marketContext.whiteSpaceMoat}\n\n` +
          `### Top 3 Existing Competitors Dissected\n` +
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
    showToast(`Downloaded ${filename}`);
  };

  const handleDownloadJSON = () => {
    if (!brandKit) return;
    const filename = `${brandKit.brandNameProposal.toLowerCase().replace(/[^a-z0-9]/g, '-')}-kit.json`;
    const blob = new Blob(
      [JSON.stringify({ idea, clarified, debate, brandKit }, null, 2)],
      { type: 'application/json' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Downloaded ${filename}`);
  };

  // Update Brand Kit Generated Visual Logo
  const handleUpdateLogo = (newLogoUrl: string) => {
    setBrandKit((prev) =>
      prev
        ? {
            ...prev,
            launchMediaAssets: {
              ...(prev.launchMediaAssets || {
                socialLaunchVideoScript: {
                  hookDuration: '0:00-0:03',
                  hookVisual: '',
                  hookAudio: '',
                  bodyVisual: '',
                  bodyAudio: '',
                  ctaVisual: '',
                  ctaAudio: '',
                  platform: 'TikTok / Reels',
                },
                tweetThread: [],
              }),
              logoImageUrl: newLogoUrl,
            },
          }
        : null
    );
  };

  // Update Brand Kit Market Context & Competitor Intelligence
  const handleUpdateMarketContext = (newContext: MarketContextSummary) => {
    setBrandKit((prev) => (prev ? { ...prev, marketContext: newContext } : null));
  };

  // Reset Battle completely
  const handleReset = () => {
    setCurrentStage(1);
    setMaxReachedStage(1);
    setClarified(null);
    setDebate(null);
    setBrandKit(null);
    setIdea('');
    setIsClarifying(false);
    setIsDebating(false);
    setIsSynthesizing(false);
    setIsExportModalOpen(false);
    setIsSavedDrawerOpen(false);
    setPublicRecord(null);
    setPublicRecordError(null);

    // Clean up URL query parameters if any
    try {
      if (typeof window !== 'undefined') {
        window.history.pushState({}, '', window.location.pathname);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch {
      // Ignore history pushState errors in sandboxed contexts
    }

    showToast('Brand Battle reset! Enter a new startup concept to begin.');
  };

  // Multi-stage flow keyboard navigation:
  // 1. 'Ctrl+Enter' -> proceed to the next stage
  const handleProceedNextStageShortcut = () => {
    if (currentStage === 1) {
      if (clarified) {
        handleProceedToArena();
      } else if (idea.trim()) {
        if (!isClarifying) {
          handleClarify();
        }
      } else {
        showToast('Please enter your startup concept first.');
      }
    } else if (currentStage === 2) {
      if (brandKit) {
        setCurrentStage(3);
        setMaxReachedStage((prev) => Math.max(prev, 3));
      } else if (debate) {
        if (!isSynthesizing) {
          handleSynthesize();
        }
      } else if (isDebating) {
        showToast('Debate clash in progress. Please wait for completion.');
      } else if (clarified) {
        runDebate(idea, clarified);
      }
    } else if (currentStage === 3) {
      showToast('You are on Stage 03 (Brand Strategy Kit).');
    }
  };

  // 2. 'Ctrl+S' -> save the current kit if in stage 3
  const handleSaveKitShortcut = () => {
    if (currentStage === 3) {
      if (isSavingKit) {
        showToast('Kit save in progress...');
        return;
      }
      handleSaveKit();
    }
  };

  // 3. 'Escape' -> close any open modals or drawers
  const handleCloseModalsShortcut = () => {
    setIsExportModalOpen(false);
    setIsSavedDrawerOpen(false);
  };

  const isAnyModalOpen = isExportModalOpen || isSavedDrawerOpen;

  useKeyboardNavigation({
    currentStage,
    onNextStage: handleProceedNextStageShortcut,
    onSaveKit: handleSaveKitShortcut,
    onCloseModals: handleCloseModalsShortcut,
    isAnyModalOpen,
    onSaveUnavailable: () => {
      showToast('Save is available in Stage 3 (Brand Kit).');
    },
  });

  // Render Public Shared View if user visited a valid public share link
  if (isLoadingPublicRecord) {
    return (
      <div
        className={`min-h-screen ${
          actualTheme === 'dark' ? 'dark' : ''
        } bg-slate-50 dark:bg-[#06080d] text-slate-900 dark:text-slate-100 flex flex-col items-center justify-center p-4 transition-colors`}
      >
        <div className="text-center space-y-4 max-w-md">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 mx-auto flex items-center justify-center text-white shadow-xl shadow-emerald-500/20 animate-pulse">
            <span className="font-display font-extrabold text-lg">BB</span>
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-neutral-900 dark:text-white">
              Loading Public Brand Dossier
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              Fetching verified brand strategy from Cloud Firestore...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (publicRecordError) {
    return (
      <div
        className={`min-h-screen ${
          actualTheme === 'dark' ? 'dark' : ''
        } bg-slate-50 dark:bg-[#06080d] text-slate-900 dark:text-slate-100 flex flex-col items-center justify-center p-4 transition-colors`}
      >
        <div className="bg-white dark:bg-[#0c1017] border border-neutral-200 dark:border-[#1a2333] rounded-2xl p-6 sm:p-8 max-w-md text-center shadow-xl space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-500 mx-auto flex items-center justify-center">
            <span className="font-bold text-xl">!</span>
          </div>
          <h3 className="font-display font-bold text-lg text-neutral-900 dark:text-white">
            Link Unavailable
          </h3>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
            {publicRecordError}
          </p>
          <button
            onClick={handleExitPublicView}
            className="w-full py-2.5 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-neutral-950 transition-colors cursor-pointer"
          >
            Go to BrandBattle Studio
          </button>
        </div>
      </div>
    );
  }

  if (publicRecord) {
    return (
      <div className={actualTheme === 'dark' ? 'dark' : ''}>
        <PublicSharedKitView
          record={publicRecord}
          onRemix={handleRemixPublicRecord}
          onHome={handleExitPublicView}
        />
        <Toast message={toastMessage} />
      </div>
    );
  }

  return (
    <div
      id="main-app-wrapper"
      data-testid="main-app-wrapper"
      className={`main-app-wrapper min-h-screen ${actualTheme === 'dark' ? 'dark' : ''} bg-slate-50 dark:bg-[#06080d] text-slate-900 dark:text-slate-100 flex flex-col selection:bg-amber-500/20 selection:text-amber-500 transition-colors`}
    >
      {/* Navigation Header */}
      <Header
        currentStage={currentStage}
        onReset={handleReset}
        canReset={Boolean(clarified || debate || brandKit || idea.trim().length > 0)}
        hasGeminiKey={hasGeminiKey}
        canExport={Boolean(brandKit)}
        onExportAll={() => setIsExportModalOpen(true)}
        user={user}
        onSignIn={handleGoogleSignIn}
        onSignOut={handleSignOut}
        onOpenSavedDrawer={() => setIsSavedDrawerOpen(true)}
        savedKitsCount={savedKits.length}
      />

      {/* Stepper Navigation */}
      <StageProgressBar
        currentStage={currentStage}
        onSelectStage={(stage) => setCurrentStage(stage)}
        maxReachedStage={maxReachedStage}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentStage === 1 && (
          <IdeaIntakeStage
            idea={idea}
            setIdea={setIdea}
            clarified={clarified}
            setClarified={setClarified}
            onClarify={handleClarify}
            onProceedToArena={handleProceedToArena}
            isLoading={isClarifying}
          />
        )}

        {currentStage === 2 && (
          <DebateArenaStage
            debate={debate}
            onSynthesize={handleSynthesize}
            onReDebate={() => clarified && runDebate(idea, clarified)}
            isLoading={isDebating}
            isSynthesizing={isSynthesizing}
          />
        )}

        {currentStage === 3 && isSynthesizing && (
          <div className="max-w-3xl mx-auto px-4 py-12 sm:py-20 text-center">
            <div className="relative inline-block mb-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center text-neutral-950 shadow-2xl shadow-emerald-500/30 mx-auto animate-pulse">
                <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 animate-spin" style={{ animationDuration: '6s' }} />
              </div>
              <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-neutral-900 border-2 border-emerald-500 flex items-center justify-center text-emerald-400">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800/80 text-xs text-emerald-800 dark:text-emerald-300 mb-3 shadow-sm font-mono">
              <span>Inkloom Arbiter Synthesis Protocol</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-display font-extrabold text-neutral-900 dark:text-white tracking-tight mb-3">
              Synthesizing Launch-Ready Brand Intelligence
            </h2>

            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 max-w-xl mx-auto leading-relaxed mb-8">
              The Chief Brand Arbiter is fusing the clash between the Growth VC, Creative Director, and Brutal Skeptic into positioning statements, 3 naming archetypes, curated color system, and short-form video scripts.
            </p>

            {/* Dynamic Synthesis Stepper Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 max-w-2xl mx-auto text-left">
              <div className="p-3.5 rounded-xl bg-white dark:bg-[#0c1017] border border-emerald-500/40 dark:border-emerald-500/30 shadow-sm flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-neutral-900 dark:text-white">Nomenclature & Rationale</div>
                  <div className="text-[11px] text-neutral-500 mt-0.5">3 distinct archetypes tested for phonetic power</div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white dark:bg-[#0c1017] border border-teal-500/40 dark:border-teal-500/30 shadow-sm flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-teal-500/10 text-teal-500 flex items-center justify-center shrink-0 mt-0.5">
                  <Palette className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-neutral-900 dark:text-white">Design & Color System</div>
                  <div className="text-[11px] text-neutral-500 mt-0.5">Hex palettes, typography & visual moodboard</div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white dark:bg-[#0c1017] border border-cyan-500/40 dark:border-cyan-500/30 shadow-sm flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/10 text-cyan-500 flex items-center justify-center shrink-0 mt-0.5">
                  <Video className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-neutral-900 dark:text-white">Launch Media Scripts</div>
                  <div className="text-[11px] text-neutral-500 mt-0.5">TikTok/Reels 30s scripts & viral tweet thread</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStage === 3 && !isSynthesizing && !brandKit && (
          <div className="max-w-md mx-auto px-4 py-16 sm:py-24 text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800/80 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-4 shadow-md">
              <AlertCircle className="w-7 h-7" />
            </div>

            <h2 className="text-xl sm:text-2xl font-display font-bold text-neutral-900 dark:text-white mb-2">
              Brand Strategy Kit Not Ready
            </h2>

            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed mb-6">
              Stage 03 requires synthesis from the Stage 02 Multi-Agent Debate. Click below to synthesize the brand kit or return to the debate arena.
            </p>

            <div className="space-y-2.5">
              <button
                onClick={handleSynthesize}
                className="w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-neutral-950 shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Synthesize Brand Kit Now</span>
              </button>

              <button
                onClick={() => setCurrentStage(2)}
                className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs bg-neutral-100 dark:bg-[#0c1017] hover:bg-neutral-200 dark:hover:bg-[#182030] border border-neutral-300 dark:border-[#1a2333] text-neutral-800 dark:text-neutral-200 flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Swords className="w-3.5 h-3.5 text-amber-500" />
                <span>Return to Stage 02: Debate Arena</span>
              </button>

              <button
                onClick={() => setCurrentStage(1)}
                className="w-full py-2 px-4 rounded-xl font-medium text-[11px] text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors cursor-pointer"
              >
                ← Edit Original Concept in Stage 01
              </button>
            </div>
          </div>
        )}

        {currentStage === 3 && !isSynthesizing && brandKit && (
          <BrandKitStage
            brandKit={brandKit}
            clarified={clarified!}
            debate={debate!}
            idea={idea}
            user={user}
            onSaveKit={handleSaveKit}
            isSaving={isSavingKit}
            onAskQuestion={handleAskQuestion}
            onCopyFullKit={handleCopyFullKit}
            onDownloadMarkdown={handleDownloadMarkdown}
            onDownloadJSON={handleDownloadJSON}
            onUpdateLogo={handleUpdateLogo}
            onUpdateMarketContext={handleUpdateMarketContext}
          />
        )}
      </main>

      {/* Global Toast */}
      <Toast message={toastMessage} />

      {/* Export Dossier Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        brandKit={brandKit}
        clarified={clarified}
        debate={debate}
        idea={idea}
      />

      {/* Cloud Saved Kits Drawer */}
      <SavedKitsDrawer
        isOpen={isSavedDrawerOpen}
        onClose={() => setIsSavedDrawerOpen(false)}
        savedKits={savedKits}
        onSelectKit={handleSelectSavedKit}
        onDeleteKit={handleDeleteSavedKit}
        isLoading={isLoadingSavedKits}
      />

      {/* Quiet Footer */}
      <footer className="border-t border-neutral-200 dark:border-[#1a2333] bg-white dark:bg-[#070a10] py-5 text-center text-xs text-neutral-500 dark:text-neutral-400 transition-colors">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">BrandBattle</span>
            <span>·</span>
            <span>Multi-Agent Brand Intelligence Arena</span>
          </div>
          <div className="text-neutral-500 dark:text-neutral-400">
            Powered by Google Gemini 3.8 + Search Grounding + Cloud Firestore
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <MainApp />
    </ThemeProvider>
  );
}

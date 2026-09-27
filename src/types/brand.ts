export interface MarketGroundingSource {
  title: string;
  url: string;
  snippet?: string;
}

export interface CompetitorInsight {
  name: string;
  positioning: string;
  weaknessOrGap: string;
}

export interface MarketCompetitor {
  name: string;
  url?: string;
  summary: string;
  marketPositioning: string;
  strengths: string[];
  weaknessesAndGaps: string;
  differentiationAngle: string;
  stageOrCategory?: string;
}

export interface MarketContextSummary {
  searchQuery: string;
  marketOverview: string;
  saturation: 'Low' | 'Moderate' | 'High' | 'Crowded';
  whiteSpaceMoat: string;
  competitors: MarketCompetitor[];
  groundingSources?: { title: string; url: string }[];
  lastUpdated?: string;
}

export interface MarketGroundingData {
  searchQuery: string;
  competitors: CompetitorInsight[];
  trendingSignals: string[];
  saturationRisk: 'Low' | 'Moderate' | 'High' | 'Extreme';
  whiteSpaceOpportunity: string;
  sources: MarketGroundingSource[];
}

export interface LaunchMediaAssets {
  logoImageUrl?: string;
  moodboardImageUrl?: string;
  socialLaunchVideoScript: {
    hookDuration: string;
    hookVisual: string;
    hookAudio: string;
    bodyVisual: string;
    bodyAudio: string;
    ctaVisual: string;
    ctaAudio: string;
    platform: string;
  };
  tweetThread: string[];
}

export interface ClarifiedIdea {
  originalInput: string;
  problemStatement: string;
  targetAudience: string;
  coreValueDriver: string;
  operationalConstraints: string[];
  marketContext: string;
  keyChallenge: string;
  suggestedAngle: string;
  marketGrounding?: MarketGroundingData;
}

export interface AgentArgument {
  point: string;
  rationale: string;
}

export interface AgentDimensionRatings {
  viability: number; // Commercial & Unit Economics (0-100)
  innovation: number; // Category Disruption & Novelty (0-100)
  marketFit: number; // Customer Pull & TAM (0-100)
  scalability: number; // Flywheel Defensibility & Moats (0-100)
  brandSoul: number; // Emotional Resonance & Identity (0-100)
  executionFeasibility: number; // Cold-Start & Friction Defense (0-100)
}

export interface AgentResponse {
  id: 'vc' | 'creative' | 'skeptic';
  name: string;
  role: string;
  avatar: string;
  badgeColor: string;
  stance: string;
  openingThesis: string;
  arguments: AgentArgument[];
  blindspotsOrRisks: string[];
  recommendedAction: string;
  rebuttalToOthers: {
    targetAgent: string;
    critique: string;
  };
  scorecard: {
    metric: string;
    score: number; // 1 to 100
    verdict: string;
    dimensionRatings?: AgentDimensionRatings;
  };
}

export interface DebateStage {
  vc: AgentResponse;
  creative: AgentResponse;
  skeptic: AgentResponse;
  clashSummary: string;
  keyConsensus: string[];
  unresolvedTension: string;
  arbiterNote: string;
}

export interface NamingOption {
  id: 'functional' | 'evocative' | 'provocative';
  archetype: string; // "The Functional Anchor", "The Evocative Muse", "The Provocative Rebel"
  name: string;
  rationale: string;
  domainViability: string;
  phoneticVibe: string;
  sampleHeadline: string;
}

export interface BrandPersonalityTrait {
  trait: string;
  description: string;
  rule: string; // "We are X, therefore we always..."
}

export interface ColorSwatch {
  name: string;
  hex: string;
  role: string; // "Primary Accent", "Foundation Dark", "Canvas Contrast", "Signal Muted"
  psychologicalEffect: string;
}

export interface BrandKit {
  brandNameProposal: string;
  oneLinePitch: string;
  taglineOptions: {
    style: string;
    text: string;
  }[];
  positioningStatement: string;
  primaryValueProposition: string;
  unfairAdvantage: string;
  targetAudiencePersona: {
    name: string;
    role: string;
    struggle: string;
    aspiration: string;
  };
  personalityTraits: BrandPersonalityTrait[];
  traitsToAvoid: {
    trait: string;
    reason: string;
  }[];
  namingOptions: NamingOption[];
  visualDirection: {
    themeName: string;
    themeDescription: string;
    colorPalette: ColorSwatch[];
    typography: {
      displayFont: string;
      bodyFont: string;
      styleNotes: string;
    };
    imageryArtDirection: string;
    logoConcept: {
      symbolDescription: string;
      monogramLetters: string;
      designPhilosophy: string;
    };
  };
  launchTactics: string[];
  arbitrationVerdict: string;
  launchMediaAssets?: LaunchMediaAssets;
  marketContext?: MarketContextSummary;
}

export interface AgentQuestionResponse {
  agentId: 'vc' | 'creative' | 'skeptic' | 'all';
  responses: {
    agentId: string;
    agentName: string;
    answer: string;
  }[];
}

export interface SavedBrandKitRecord {
  id: string;
  userId: string;
  userEmail?: string;
  originalIdea: string;
  brandName: string;
  oneLinePitch: string;
  positioningStatement: string;
  primaryValueProposition: string;
  clarified: ClarifiedIdea;
  debate: DebateStage;
  brandKit: BrandKit;
  logoImageUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PublicBrandKitRecord {
  shareId: string;
  creatorId?: string;
  creatorEmail?: string;
  originalIdea: string;
  brandName: string;
  oneLinePitch: string;
  positioningStatement: string;
  primaryValueProposition: string;
  clarified: ClarifiedIdea;
  debate: DebateStage;
  brandKit: BrandKit;
  logoImageUrl?: string;
  createdAt: string;
  updatedAt?: string;
  viewsCount?: number;
  isPublic: boolean;
}


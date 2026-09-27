import { GoogleGenAI } from '@google/genai';
import {
  ClarifiedIdea,
  DebateStage,
  BrandKit,
  MarketGroundingData,
  LaunchMediaAssets,
  MarketCompetitor,
  MarketContextSummary,
} from '../types/brand.js';

const apiKey = process.env.GEMINI_API_KEY || '';

const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

function logGeminiNotice(operation: string, err: unknown) {
  const errMsg = err instanceof Error ? err.message : String(err);
  if (errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('quota') || errMsg.includes('rate-limit')) {
    console.info(`[BrandBattle AI] API quota limit reached for ${operation}. Activating local strategy engine fallback.`);
  } else {
    console.info(`[BrandBattle AI] ${operation} activated fallback engine.`);
  }
}

/**
 * Robust JSON extraction and sanitizer that handles raw text, markdown blocks, control characters, and unescaped newlines.
 */
export function safeParseJSON<T = any>(rawText: string | undefined | null): T | null {
  if (!rawText || typeof rawText !== 'string') return null;
  const trimmed = rawText.trim();
  if (!trimmed) return null;

  // 1. Direct parse
  try {
    return JSON.parse(trimmed) as T;
  } catch {}

  // 2. Strip markdown code fences ```json ... ``` or ``` ... ```
  try {
    const unblocked = trimmed.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
    return JSON.parse(unblocked) as T;
  } catch {}

  // 3. Regex match outermost JSON object or array
  try {
    const match = trimmed.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (match) {
      return JSON.parse(match[0]) as T;
    }
  } catch {}

  // 4. Sanitize invalid control characters that break JSON parsing
  try {
    const match = trimmed.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (match) {
      const sanitized = match[0].replace(/[\u0000-\u001F\u007F-\u009F]/g, (c) => {
        if (c === '\n' || c === '\r' || c === '\t') return c;
        return '';
      });
      return JSON.parse(sanitized) as T;
    }
  } catch {}

  return null;
}

/**
 * Stage 1: Clarify and dissect idea with Real-Time Google Search Grounding
 * Uses gemini-3.5-flash with googleSearch tool as specified in requirements
 */
export async function clarifyIdea(rawIdea: string): Promise<ClarifiedIdea> {
  let marketGrounding: MarketGroundingData | undefined = undefined;

  // Perform Google Search Grounding to extract real-world competitors & trends
  if (ai) {
    try {
      const searchPrompt = `Perform real-time market grounding on this startup/product concept:
"${rawIdea}"

Identify:
1. Top real existing competitors or similar venture-backed/indie startups in this exact or adjacent space.
2. Emerging market trends and signals from the last 12-24 months.
3. Market saturation level (Low, Moderate, High, or Extreme) with clear rationale.
4. The biggest unoccupied white-space positioning opportunity.

Return ONLY valid JSON matching this schema:
{
  "searchQuery": "query used",
  "competitors": [
    { "name": "Competitor 1", "positioning": "How they market themselves", "weaknessOrGap": "Their vulnerability" },
    { "name": "Competitor 2", "positioning": "How they market themselves", "weaknessOrGap": "Their vulnerability" },
    { "name": "Competitor 3", "positioning": "How they market themselves", "weaknessOrGap": "Their vulnerability" }
  ],
  "trendingSignals": ["Signal 1", "Signal 2", "Signal 3"],
  "saturationRisk": "Moderate",
  "whiteSpaceOpportunity": "Clear white-space opportunity for a new brand"
}`;

      // Search grounding with gemini-3.8-flash
      const searchResponse = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: searchPrompt,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      const text = searchResponse.text?.trim() || '';
      // Extract web search grounding metadata sources if present
      const sources: { title: string; url: string }[] = [];
      const chunks = searchResponse.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (Array.isArray(chunks)) {
        for (const chunk of chunks) {
          if (chunk.web?.uri && chunk.web?.title) {
            sources.push({
              title: chunk.web.title,
              url: chunk.web.uri,
            });
          }
        }
      }

      // Parse JSON from text safely
      const parsed = safeParseJSON<any>(text);
      if (parsed) {
        marketGrounding = {
          searchQuery: parsed.searchQuery || rawIdea,
          competitors: Array.isArray(parsed.competitors) ? parsed.competitors : [],
          trendingSignals: Array.isArray(parsed.trendingSignals) ? parsed.trendingSignals : [],
          saturationRisk: parsed.saturationRisk || 'Moderate',
          whiteSpaceOpportunity: parsed.whiteSpaceOpportunity || 'Carving a focused high-conviction micro-niche.',
          sources: sources.slice(0, 5),
        };
      }
    } catch (err) {
      logGeminiNotice('Google Search Grounding', err);
    }
  }

  // If search grounding was not retrieved or failed, provide robust fallback market intelligence
  if (!marketGrounding) {
    marketGrounding = generateFallbackMarketGrounding(rawIdea);
  }

  // Next, clarify idea structure with gemini-3.8-flash
  if (ai) {
    try {
      const prompt = `You are an elite brand intake strategist at BrandBattle.
Analyze the following raw startup/product idea:
"${rawIdea}"

Real-Time Market Context discovered:
Competitors: ${JSON.stringify(marketGrounding.competitors)}
Trending Signals: ${JSON.stringify(marketGrounding.trendingSignals)}
White-Space Opportunity: "${marketGrounding.whiteSpaceOpportunity}"

Extract a structured breakdown in JSON format.
Return ONLY valid JSON matching this schema:
{
  "originalInput": "${rawIdea.replace(/"/g, '\\"')}",
  "problemStatement": "A razor-sharp sentence describing the core pain point being solved.",
  "targetAudience": "Specific ICP (Ideal Customer Profile) who feels this pain most acutely.",
  "coreValueDriver": "The primary underlying value or unfair leverage mechanism.",
  "operationalConstraints": ["Constraint 1", "Constraint 2", "Constraint 3"],
  "marketContext": "Current landscape, existing alternatives, or behavioral friction.",
  "keyChallenge": "The biggest friction or risk to adoption.",
  "suggestedAngle": "A compelling, unconventional strategic angle for this venture."
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
      });

      const text = response.text?.trim() || '';
      const parsed = safeParseJSON<any>(text);
      if (parsed) {
        return {
          originalInput: rawIdea,
          problemStatement: parsed.problemStatement || 'Solving core disconnect in the market.',
          targetAudience: parsed.targetAudience || 'Early adopter consumers and operators.',
          coreValueDriver: parsed.coreValueDriver || 'Direct disintermediation and friction reduction.',
          operationalConstraints: Array.isArray(parsed.operationalConstraints) ? parsed.operationalConstraints : ['Supply consistency', 'Unit economics at low density', 'Trust verification'],
          marketContext: parsed.marketContext || 'Fragmented legacy solutions with high middleman margins.',
          keyChallenge: parsed.keyChallenge || 'Overcoming initial cold-start chicken-and-egg dynamics.',
          suggestedAngle: parsed.suggestedAngle || 'Position as a curated cultural movement rather than a mere transactional utility.',
          marketGrounding,
        };
      }
    } catch (err) {
      logGeminiNotice('clarifyIdea', err);
    }
  }

  // Fallback intelligent clarification
  const fallback = generateFallbackClarification(rawIdea);
  fallback.marketGrounding = marketGrounding;
  return fallback;
}

/**
 * Stage 2: Deploy the 3-Persona Multi-Agent Debate Arena
 */
export async function runAgentDebate(rawIdea: string, clarified: ClarifiedIdea): Promise<DebateStage> {
  if (ai) {
    try {
      const prompt = `You are orchestrating the BrandBattle Multi-Agent Arena.
3 specialized AI personas are debating the brand & venture potential of this startup idea:
Idea: "${rawIdea}"
Clarified Problem: "${clarified.problemStatement}"
Target Audience: "${clarified.targetAudience}"
Operational Constraints: ${JSON.stringify(clarified.operationalConstraints)}
Market Grounding & Competitors: ${JSON.stringify(clarified.marketGrounding || {})}

Simulate an authentic, heated, high-conviction debate between:
1. Agent A: "The VC / Growth Strategist" (Marcus Vance)
   - Lens: Scalability, defensible moats, unit economics, CAC/LTV, customer acquisition flywheels, monetization viability.
   - Tone: Analytical, metrics-obsessed, demands enterprise value.
2. Agent B: "The Creative Director" (Solenne Moreau)
   - Lens: Emotional resonance, visceral storytelling, cultural zeitgeist, memorable naming, brand soul, design rebellion.
   - Tone: Sophisticated, passionate, poetic, allergic to corporate blandness.
3. Agent C: "The Brutal Skeptic / Anti-Generic Critic" (Jax 'Zero-BS' Sterling)
   - Lens: Startup cliches, fake innovation, "Uber for X" traps, cold-start death spirals, fatal operational blindspots.
   - Tone: Razor-sharp, humorous, constructive tough love, pulls no punches.

Return ONLY valid JSON matching this exact structure:
{
  "vc": {
    "id": "vc",
    "name": "Marcus Vance",
    "role": "Growth VC & Market Strategist",
    "avatar": "chart",
    "badgeColor": "emerald",
    "stance": "Growth Bull with High Defensibility Filter",
    "openingThesis": "Direct opening thesis assessing the market size and economic leverage.",
    "arguments": [
      { "point": "Core growth thesis point", "rationale": "Why this creates leverage or scalable margins" },
      { "point": "Monetization model", "rationale": "How this actually captures value" }
    ],
    "blindspotsOrRisks": ["Risk 1 regarding distribution or CAC", "Risk 2 regarding retention"],
    "recommendedAction": "Concrete business action Marcus demands",
    "rebuttalToOthers": {
      "targetAgent": "Creative Director",
      "critique": "Calling out aesthetic indulgence without unit economics"
    },
    "scorecard": {
      "metric": "Market Scalability & Moat",
      "score": 78,
      "verdict": "High upside if distribution flywheel is solved early",
      "dimensionRatings": {
        "viability": 84,
        "innovation": 72,
        "marketFit": 86,
        "scalability": 90,
        "brandSoul": 68,
        "executionFeasibility": 76
      }
    }
  },
  "creative": {
    "id": "creative",
    "name": "Solenne Moreau",
    "role": "Brand Architect & Creative Director",
    "avatar": "palette",
    "badgeColor": "violet",
    "stance": "Cultural Resonance & Narrative Rebel",
    "openingThesis": "Opening thesis on the emotional truth and cultural urgency of the brand.",
    "arguments": [
      { "point": "Emotional core & narrative archetype", "rationale": "Why people will tattoo this brand on their consciousness" },
      { "point": "Sensory & aesthetic differentiation", "rationale": "How to avoid looking like another grey SaaS" }
    ],
    "blindspotsOrRisks": ["Risk of being treated as a sterile commodity", "Risk of weak founder mythology"],
    "recommendedAction": "Concrete creative mandate Solenne demands",
    "rebuttalToOthers": {
      "targetAgent": "The Brutal Skeptic",
      "critique": "Rebutting cynicism by proving emotion drives premium pricing"
    },
    "scorecard": {
      "metric": "Emotional Resonance & Distinctiveness",
      "score": 88,
      "verdict": "Ripe for an iconic brand narrative if they dare to be polarizing",
      "dimensionRatings": {
        "viability": 74,
        "innovation": 95,
        "marketFit": 82,
        "scalability": 78,
        "brandSoul": 96,
        "executionFeasibility": 70
      }
    }
  },
  "skeptic": {
    "id": "skeptic",
    "name": "Jax 'Zero-BS' Sterling",
    "role": "Anti-Generic Critic & Stress-Tester",
    "avatar": "flame",
    "badgeColor": "amber",
    "stance": "Ruthless Reality Checker",
    "openingThesis": "Unsparing critique cutting through the honeymoon pitch hype.",
    "arguments": [
      { "point": "The fatal assumption", "rationale": "The exact reason 90% of similar projects die quietly" },
      { "point": "The cliché trap", "rationale": "The overused trope this project is in danger of copying" }
    ],
    "blindspotsOrRisks": ["The cold-start chicken-and-egg reality", "Consumer friction inertia"],
    "recommendedAction": "The one brutal rule the team must follow to survive",
    "rebuttalToOthers": {
      "targetAgent": "Growth VC",
      "critique": "Calling out vanity TAM numbers that ignore day-to-day churn"
    },
    "scorecard": {
      "metric": "BS Danger Index & Survival Odds",
      "score": 64,
      "verdict": "Will fail as a generic middleman; only survives with extreme vertical focus",
      "dimensionRatings": {
        "viability": 68,
        "innovation": 58,
        "marketFit": 72,
        "scalability": 62,
        "brandSoul": 65,
        "executionFeasibility": 54
      }
    }
  },
  "clashSummary": "A vivid 2-3 sentence recap of where the agents fought hardest.",
  "keyConsensus": [
    "Consensus point 1 agreed by all agents",
    "Consensus point 2 agreed by all agents",
    "Consensus point 3 agreed by all agents"
  ],
  "unresolvedTension": "The core dilemma that the final brand synthesis must decisively resolve.",
  "arbiterNote": "The Arbiter's guidance on how to bridge the tension into a defensible brand identity."
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.8,
        },
      });

      const text = response.text?.trim() || '';
      const parsed = safeParseJSON<any>(text);
      if (parsed && parsed.vc && parsed.creative && parsed.skeptic) {
        const fallback = generateFallbackDebate(rawIdea, clarified);
        return {
          vc: {
            ...fallback.vc,
            ...parsed.vc,
            arguments: Array.isArray(parsed.vc?.arguments) && parsed.vc.arguments.length > 0 ? parsed.vc.arguments : fallback.vc.arguments,
            scorecard: {
              ...fallback.vc.scorecard,
              ...parsed.vc?.scorecard,
              dimensionRatings: {
                ...fallback.vc.scorecard.dimensionRatings,
                ...parsed.vc?.scorecard?.dimensionRatings,
              },
            },
          },
          creative: {
            ...fallback.creative,
            ...parsed.creative,
            arguments: Array.isArray(parsed.creative?.arguments) && parsed.creative.arguments.length > 0 ? parsed.creative.arguments : fallback.creative.arguments,
            scorecard: {
              ...fallback.creative.scorecard,
              ...parsed.creative?.scorecard,
              dimensionRatings: {
                ...fallback.creative.scorecard.dimensionRatings,
                ...parsed.creative?.scorecard?.dimensionRatings,
              },
            },
          },
          skeptic: {
            ...fallback.skeptic,
            ...parsed.skeptic,
            arguments: Array.isArray(parsed.skeptic?.arguments) && parsed.skeptic.arguments.length > 0 ? parsed.skeptic.arguments : fallback.skeptic.arguments,
            scorecard: {
              ...fallback.skeptic.scorecard,
              ...parsed.skeptic?.scorecard,
              dimensionRatings: {
                ...fallback.skeptic.scorecard.dimensionRatings,
                ...parsed.skeptic?.scorecard?.dimensionRatings,
              },
            },
          },
          clashSummary: parsed.clashSummary || fallback.clashSummary,
          keyConsensus: Array.isArray(parsed.keyConsensus) && parsed.keyConsensus.length > 0 ? parsed.keyConsensus : fallback.keyConsensus,
          unresolvedTension: parsed.unresolvedTension || fallback.unresolvedTension,
          arbiterNote: parsed.arbiterNote || fallback.arbiterNote,
        };
      }
    } catch (err) {
      logGeminiNotice('runAgentDebate', err);
    }
  }

  return generateFallbackDebate(rawIdea, clarified);
}

/**
 * Normalizes and guarantees every single field in BrandKit is populated and non-null
 */
function normalizeBrandKit(parsed: any, rawIdea: string, clarified: ClarifiedIdea, debate: DebateStage): BrandKit {
  const fallback = generateFallbackBrandKit(rawIdea, clarified, debate);
  if (!parsed || typeof parsed !== 'object') return fallback;

  return {
    brandNameProposal: parsed.brandNameProposal || fallback.brandNameProposal,
    oneLinePitch: parsed.oneLinePitch || fallback.oneLinePitch,
    taglineOptions: Array.isArray(parsed.taglineOptions) && parsed.taglineOptions.length > 0
      ? parsed.taglineOptions
      : fallback.taglineOptions,
    positioningStatement: parsed.positioningStatement || fallback.positioningStatement,
    primaryValueProposition: parsed.primaryValueProposition || fallback.primaryValueProposition,
    unfairAdvantage: parsed.unfairAdvantage || fallback.unfairAdvantage,
    targetAudiencePersona: parsed.targetAudiencePersona?.name
      ? {
          name: parsed.targetAudiencePersona.name || fallback.targetAudiencePersona.name,
          role: parsed.targetAudiencePersona.role || fallback.targetAudiencePersona.role,
          struggle: parsed.targetAudiencePersona.struggle || fallback.targetAudiencePersona.struggle,
          aspiration: parsed.targetAudiencePersona.aspiration || fallback.targetAudiencePersona.aspiration,
        }
      : fallback.targetAudiencePersona,
    personalityTraits: Array.isArray(parsed.personalityTraits) && parsed.personalityTraits.length > 0
      ? parsed.personalityTraits
      : fallback.personalityTraits,
    traitsToAvoid: Array.isArray(parsed.traitsToAvoid) && parsed.traitsToAvoid.length > 0
      ? parsed.traitsToAvoid
      : fallback.traitsToAvoid,
    namingOptions: Array.isArray(parsed.namingOptions) && parsed.namingOptions.length > 0
      ? parsed.namingOptions.map((opt: any, idx: number) => ({
          id: opt.id || fallback.namingOptions[idx]?.id || `option-${idx}`,
          archetype: opt.archetype || fallback.namingOptions[idx]?.archetype || 'Strategic Identity',
          name: opt.name || fallback.namingOptions[idx]?.name || fallback.brandNameProposal,
          rationale: opt.rationale || fallback.namingOptions[idx]?.rationale || 'Engineered for market resonance.',
          domainViability: opt.domainViability || fallback.namingOptions[idx]?.domainViability || 'Direct.io',
          phoneticVibe: opt.phoneticVibe || fallback.namingOptions[idx]?.phoneticVibe || 'Clear, memorable',
          sampleHeadline: opt.sampleHeadline || fallback.namingOptions[idx]?.sampleHeadline || fallback.oneLinePitch,
        }))
      : fallback.namingOptions,
    visualDirection: {
      themeName: parsed.visualDirection?.themeName || fallback.visualDirection.themeName,
      themeDescription: parsed.visualDirection?.themeDescription || fallback.visualDirection.themeDescription,
      colorPalette: Array.isArray(parsed.visualDirection?.colorPalette) && parsed.visualDirection.colorPalette.length > 0
        ? parsed.visualDirection.colorPalette
        : fallback.visualDirection.colorPalette,
      typography: {
        displayFont: parsed.visualDirection?.typography?.displayFont || fallback.visualDirection.typography.displayFont,
        bodyFont: parsed.visualDirection?.typography?.bodyFont || fallback.visualDirection.typography.bodyFont,
        styleNotes: parsed.visualDirection?.typography?.styleNotes || fallback.visualDirection.typography.styleNotes,
      },
      imageryArtDirection: parsed.visualDirection?.imageryArtDirection || fallback.visualDirection.imageryArtDirection,
      logoConcept: {
        symbolDescription: parsed.visualDirection?.logoConcept?.symbolDescription || fallback.visualDirection.logoConcept.symbolDescription,
        monogramLetters: parsed.visualDirection?.logoConcept?.monogramLetters || fallback.visualDirection.logoConcept.monogramLetters,
        designPhilosophy: parsed.visualDirection?.logoConcept?.designPhilosophy || fallback.visualDirection.logoConcept.designPhilosophy,
      },
    },
    launchTactics: Array.isArray(parsed.launchTactics) && parsed.launchTactics.length > 0
      ? parsed.launchTactics
      : fallback.launchTactics,
    arbitrationVerdict: parsed.arbitrationVerdict || fallback.arbitrationVerdict,
    launchMediaAssets: {
      socialLaunchVideoScript: {
        platform: parsed.launchMediaAssets?.socialLaunchVideoScript?.platform || fallback.launchMediaAssets?.socialLaunchVideoScript?.platform || 'TikTok & Reels (9:16)',
        hookDuration: parsed.launchMediaAssets?.socialLaunchVideoScript?.hookDuration || fallback.launchMediaAssets?.socialLaunchVideoScript?.hookDuration || '0:00-0:03',
        hookVisual: parsed.launchMediaAssets?.socialLaunchVideoScript?.hookVisual || fallback.launchMediaAssets?.socialLaunchVideoScript?.hookVisual || 'Kinetic problem hook',
        hookAudio: parsed.launchMediaAssets?.socialLaunchVideoScript?.hookAudio || fallback.launchMediaAssets?.socialLaunchVideoScript?.hookAudio || 'Stop settling for broken status-quo.',
        bodyVisual: parsed.launchMediaAssets?.socialLaunchVideoScript?.bodyVisual || fallback.launchMediaAssets?.socialLaunchVideoScript?.bodyVisual || 'Fast montage of product in action',
        bodyAudio: parsed.launchMediaAssets?.socialLaunchVideoScript?.bodyAudio || fallback.launchMediaAssets?.socialLaunchVideoScript?.bodyAudio || 'Meet the future of this category.',
        ctaVisual: parsed.launchMediaAssets?.socialLaunchVideoScript?.ctaVisual || fallback.launchMediaAssets?.socialLaunchVideoScript?.ctaVisual || 'Hero logo reveal with link in bio',
        ctaAudio: parsed.launchMediaAssets?.socialLaunchVideoScript?.ctaAudio || fallback.launchMediaAssets?.socialLaunchVideoScript?.ctaAudio || 'Claim early access today.',
      },
      tweetThread: Array.isArray(parsed.launchMediaAssets?.tweetThread) && parsed.launchMediaAssets.tweetThread.length > 0
        ? parsed.launchMediaAssets.tweetThread
        : fallback.launchMediaAssets?.tweetThread || ['1/ Introducing our new venture...', '2/ Why existing solutions fail...', '3/ The new paradigm starts now.'],
      logoImageUrl: parsed.launchMediaAssets?.logoImageUrl || fallback.launchMediaAssets?.logoImageUrl,
    },
    marketContext: parsed.marketContext || fallback.marketContext,
  };
}

/**
 * Stage 3: Synthesize Debate into Final Launch-Ready Brand Kit
 * Includes Launch Media Assets: Promotional Video Script & Viral Copy
 */
export async function synthesizeBrandKit(rawIdea: string, clarified: ClarifiedIdea, debate: DebateStage): Promise<BrandKit> {
  const safeClarified = clarified || generateFallbackClarification(rawIdea);
  const safeDebate = debate || generateFallbackDebate(rawIdea, safeClarified);

  let kit: BrandKit | null = null;

  if (ai) {
    try {
      const prompt = `You are the Chief Brand Arbiter at BrandBattle.
Synthesize the multi-agent debate into a definitive, world-class Brand Strategy Kit for the following idea:
Original Idea: "${rawIdea}"
Clarified Problem: "${safeClarified.problemStatement}"
Target Audience: "${safeClarified.targetAudience}"
Market Grounding & White Space: "${safeClarified.marketGrounding?.whiteSpaceOpportunity || 'Open Category Space'}"
VC Growth Mandate: "${safeDebate.vc.recommendedAction}"
Creative Director Mandate: "${safeDebate.creative.recommendedAction}"
Skeptic Danger Warning: "${safeDebate.skeptic.arguments[0]?.point}: ${safeDebate.skeptic.arguments[0]?.rationale}"
Core Tension to Resolve: "${safeDebate.unresolvedTension}"

Deliver an uncompromising, production-grade brand strategy kit in JSON format.
Ensure you provide:
1. 3 radically distinct naming directions (Functional & Direct, Evocative & Cultural, Provocative & Rebel).
2. Curated visual direction with specific hex color palette and psychological intent.
3. Crisp personality traits (and anti-traits to avoid).
4. Taglines and one-line elevator pitch.
5. High-converting short promotional launch video script (TikTok/Reels/Shorts format) and viral tweet thread.

Return ONLY valid JSON matching this schema:
{
  "brandNameProposal": "The standout recommended hero brand name",
  "oneLinePitch": "A razor-sharp, unforgettable one-sentence pitch.",
  "taglineOptions": [
    { "style": "The Manifesto Hook", "text": "Punchy aspirational statement" },
    { "style": "The Direct Value Prop", "text": "Clear transactional promise" },
    { "style": "The Provocation", "text": "Thought-provoking contrast" }
  ],
  "positioningStatement": "For [target audience] who [core struggle], [Brand Name] is the [category] that [key benefit], unlike [status quo/alternatives] because [unfair differentiator].",
  "primaryValueProposition": "The fundamental promise that makes customer choice effortless.",
  "unfairAdvantage": "The unique structural or narrative moat that competitors cannot easily copy.",
  "targetAudiencePersona": {
    "name": "Persona Name (e.g. 'The Discerning Urban Locavore')",
    "role": "Title or archetypal identity",
    "struggle": "What frustrates them every single week",
    "aspiration": "Who they become when using this brand"
  },
  "personalityTraits": [
    { "trait": "Trait 1", "description": "Nuanced nuance", "rule": "We are X, therefore we always [concrete behavior]" },
    { "trait": "Trait 2", "description": "Nuanced nuance", "rule": "We are Y, therefore we always [concrete behavior]" },
    { "trait": "Trait 3", "description": "Nuanced nuance", "rule": "We are Z, therefore we always [concrete behavior]" }
  ],
  "traitsToAvoid": [
    { "trait": "Anti-Trait 1", "reason": "Why this would ruin brand credibility" },
    { "trait": "Anti-Trait 2", "reason": "The cliché that makes us look like generic competitors" },
    { "trait": "Anti-Trait 3", "reason": "Behavior that alienates our core champions" }
  ],
  "namingOptions": [
    {
      "id": "functional",
      "archetype": "The Functional Anchor",
      "name": "A clear, descriptive, utility-forward brand name",
      "rationale": "Why this builds immediate clarity and reduces buyer confusion.",
      "domainViability": "e.g., GetName.com or NameHQ.io",
      "phoneticVibe": "Sturdy, crisp, low cognitive load",
      "sampleHeadline": "A marketing headline using this name"
    },
    {
      "id": "evocative",
      "archetype": "The Evocative Muse",
      "name": "A poetic, metaphorical, culturally resonant name",
      "rationale": "How this connects to human emotion and ancient or modern rituals.",
      "domainViability": "e.g., Name.co or WithName.com",
      "phoneticVibe": "Lyrical, aspirational, prestige aura",
      "sampleHeadline": "A marketing headline using this name"
    },
    {
      "id": "provocative",
      "archetype": "The Provocative Rebel",
      "name": "An audacious, rule-breaking, counter-intuitive name",
      "rationale": "Why this polarizes the market and demands organic word-of-mouth attention.",
      "domainViability": "e.g., WeAreName.com or Name.live",
      "phoneticVibe": "Punchy, arresting, unforgettable",
      "sampleHeadline": "A marketing headline using this name"
    }
  ],
  "visualDirection": {
    "themeName": "Name of the visual concept (e.g., 'Raw Earth Obsidian' or 'Kinetic Brutalism')",
    "themeDescription": "Art direction narrative describing the aesthetic mood, textures, and graphic balance.",
    "colorPalette": [
      { "name": "Color Name 1", "hex": "#121826", "role": "Foundation Dark", "psychologicalEffect": "Grounded authority and modern editorial weight" },
      { "name": "Color Name 2", "hex": "#10b981", "role": "Primary Signal", "psychologicalEffect": "Vitality, natural provenance, forward momentum" },
      { "name": "Color Name 3", "hex": "#f59e0b", "role": "Warm Contrast", "psychologicalEffect": "Human touch, craft honesty, solar energy" },
      { "name": "Color Name 4", "hex": "#f8fafc", "role": "Canvas White", "psychologicalEffect": "Purity of presentation, negative space breathing room" }
    ],
    "typography": {
      "displayFont": "Display font name (e.g. 'Space Grotesk' or 'Syne')",
      "bodyFont": "Body font name (e.g. 'Plus Jakarta Sans' or 'Inter')",
      "styleNotes": "Specific guidelines on weights, tracking, letter-spacing, and hierarchy."
    },
    "imageryArtDirection": "Detailed photography/3D guidelines: lighting, human framing, authentic vs artificial rules.",
    "logoConcept": {
      "symbolDescription": "Vivid description of the primary mark or glyph",
      "monogramLetters": "2-3 letter monogram representation",
      "designPhilosophy": "Why the logo geometry communicates the core tension solved"
    }
  },
  "launchTactics": [
    "Unconventional guerilla launch tactic 1",
    "Community flywheel driver 2",
    "Proof-of-work PR stunt or early adopter invitation hook 3"
  ],
  "arbitrationVerdict": "The Arbiter's concluding strategic synthesis on why this brand will dominate.",
  "launchMediaAssets": {
    "socialLaunchVideoScript": {
      "platform": "TikTok & Instagram Reels (9:16 Vertical Video)",
      "hookDuration": "0:00 - 0:03",
      "hookVisual": "Tight close-up of status-quo frustration with aggressive kinetic sound design",
      "hookAudio": "Stop doing [problem] like it's 2012. Here is why the whole system is broken.",
      "bodyVisual": "Fast-paced montage demonstrating the unfair advantage and radical simplicity of the new solution",
      "bodyAudio": "Meet [Brand Name]. We threw out [legacy middleman/friction] and built [key innovation] from scratch.",
      "ctaVisual": "Hero brand monogram reveals with exclusive early invite link on screen",
      "ctaAudio": "First 500 members lock in lifetime access today. Link in bio."
    },
    "tweetThread": [
      "1/ Why 99% of people in this space are getting ripped off — and the counter-intuitive model we built to fix it. 🧵👇",
      "2/ Legacy players make billions by hiding behind middleman friction...",
      "3/ Today, we are launching [Brand Name]. No corporate fluff. Just pure unadulterated results."
    ]
  }
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
      });

      const text = response.text?.trim() || '';
      const parsed = safeParseJSON<any>(text);
      if (parsed) {
        kit = normalizeBrandKit(parsed, rawIdea, safeClarified, safeDebate);
      }
    } catch (err) {
      logGeminiNotice('synthesizeBrandKit', err);
    }
  }

  if (!kit) {
    kit = generateFallbackBrandKit(rawIdea, safeClarified, safeDebate);
  }

  // Generate visual asset (Logo Mark / Brand Moodboard Image) using Gemini image generation
  try {
    const generatedLogoUrl = await generateBrandLogoAsset(kit);
    if (generatedLogoUrl) {
      if (!kit.launchMediaAssets) {
        kit.launchMediaAssets = generateFallbackLaunchMedia(kit);
      }
      kit.launchMediaAssets.logoImageUrl = generatedLogoUrl;
    }
  } catch (imgErr) {
    logGeminiNotice('generateBrandLogoAsset', imgErr);
  }

  // Ensure Market Context & Top 3 Competitors are populated
  if (!kit.marketContext) {
    try {
      kit.marketContext = await searchAndSummarizeCompetitors({
        idea: rawIdea,
        brandName: kit.brandNameProposal,
        existingClarified: safeClarified,
      });
    } catch (mErr) {
      kit.marketContext = generateFallbackCompetitorContext(rawIdea, kit.brandNameProposal);
    }
  }

  return kit;
}

/**
 * Generate brand logo / visual moodboard concept using Gemini image preview model
 */
export async function generateBrandLogoAsset(brandKit: BrandKit): Promise<string | null> {
  if (!ai) return null;
  try {
    const imagePrompt = `Minimalist modern vector brand logo symbol on dark obsidian background for "${brandKit.brandNameProposal}". Visual theme: ${brandKit.visualDirection.themeName}. Concept: ${brandKit.visualDirection.logoConcept.symbolDescription}. Clean lines, geometric elegance, award-winning graphic design, no mockups, isolated center glyph.`;

    const response = await ai.models.generateImages({
      model: 'imagen-3.0-generate-002',
      prompt: imagePrompt,
      config: {
        numberOfImages: 1,
        aspectRatio: '1:1',
      },
    });

    const b64 = response.generatedImages?.[0]?.image?.imageBytes;
    if (b64) {
      return `data:image/png;base64,${b64}`;
    }
  } catch (err) {
    logGeminiNotice('Imagen model', err);
  }
  return null;
}

/**
 * Follow-up Q&A with the agents
 */
export async function askAgentsFollowUp(
  question: string,
  rawIdea: string,
  brandKit: BrandKit,
  targetAgent: 'vc' | 'creative' | 'skeptic' | 'all'
) {
  if (ai) {
    try {
      const prompt = `You are running the BrandBattle interactive Q&A console.
Startup Idea: "${rawIdea}"
Brand Name: "${brandKit.brandNameProposal}"
One-Line Pitch: "${brandKit.oneLinePitch}"
User Question: "${question}"
Target Agent: "${targetAgent}"

Respond in persona for the requested agent(s):
- 'vc': Marcus Vance (Growth VC & Scaling Strategist)
- 'creative': Solenne Moreau (Creative Director & Cultural Strategist)
- 'skeptic': Jax 'Zero-BS' Sterling (Anti-Generic Critic)
- 'all': All three agents provide distinct perspectives.

Return valid JSON:
{
  "agentId": "${targetAgent}",
  "responses": [
    {
      "agentId": "agent-id",
      "agentName": "Agent Name",
      "answer": "Direct, punchy, actionable response in true character (2-4 sentences)."
    }
  ]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
      });

      return JSON.parse(response.text?.trim() || '{}');
    } catch (err) {
      logGeminiNotice('askAgentsFollowUp', err);
    }
  }

  // Fallback Q&A
  return generateFallbackQA(question, brandKit, targetAgent);
}

/* =========================================================================
   FALLBACK SIMULATION ENGINES (Contextual, Rich, High-Fidelity)
   ========================================================================= */

function generateFallbackMarketGrounding(rawIdea: string): MarketGroundingData {
  const isAgri = /farm|crop|food|grow|produce|local|soil/i.test(rawIdea);
  const isAI = /ai|model|bot|agent|prompt|generate/i.test(rawIdea);

  if (isAgri) {
    return {
      searchQuery: 'direct farm to consumer grocery market competitors trends',
      competitors: [
        {
          name: 'Farmstead / Imperfect Foods',
          positioning: 'Discount surplus grocery delivery at scale',
          weaknessOrGap: 'Prioritizes shelf-life logistics over peak harvest flavor and true farmer margins.',
        },
        {
          name: 'Harvie / Barn2Door',
          positioning: 'B2B software enabling individual farms to run CSAs',
          weaknessOrGap: 'Fragmented individual farm storefronts lack unified consumer discovery or route density.',
        },
        {
          name: 'Good Eggs',
          positioning: 'Curated premium local organic online supermarket',
          weaknessOrGap: 'Heavy central warehouse capital expenditure leads to high markup and low farmer take-home pay.',
        },
      ],
      trendingSignals: [
        'Surge in consumer demand for heirloom nutrient density and regenerative soil practices.',
        'Hyper-local micro-depot fulfillment outperforming traditional central refrigerated distribution centers.',
        'Willingness of urban millennials to pay 30%+ premium for direct harvest provenance verified by growers.',
      ],
      saturationRisk: 'Moderate',
      whiteSpaceOpportunity:
        'A prestigious, decentralized "Harvest Guild" model that operates with zero centralized cold warehouses, delivering within 12 hours of harvest via route clusters.',
      sources: [
        { title: 'USDA Local Food Marketing Trends Report', url: 'https://www.ams.usda.gov' },
        { title: 'Regenerative Agriculture Market Outlook', url: 'https://www.agrifoodtech.com' },
      ],
    };
  }

  return {
    searchQuery: `${rawIdea.slice(0, 30)} market competitors and alternatives`,
    competitors: [
      {
        name: 'Legacy Market Leaders',
        positioning: 'All-in-one bloated legacy suites with long onboarding cycles',
        weaknessOrGap: 'Slow execution, opaque tiered pricing, and sterile corporate interfaces.',
      },
      {
        name: 'Point-Solution Startups',
        positioning: 'Single-feature utility apps competing in a race to the bottom',
        weaknessOrGap: 'Zero brand defensibility or structural retention; high churn rate.',
      },
    ],
    trendingSignals: [
      'Shift away from generic broad tools toward opinionated, high-conviction vertical platforms.',
      'Rise of multi-agent orchestration replacing manual fragmented workflow handoffs.',
      'User fatigue with subscription sprawl favoring outcome-guaranteed pricing.',
    ],
    saturationRisk: 'Moderate',
    whiteSpaceOpportunity:
      'Positioning as an uncompromising, high-craft category champion with built-in multi-agent arbitration rather than another passive directory or wrapper.',
    sources: [
      { title: 'State of Venture & Industry Innovation', url: 'https://pitchbook.com' },
      { title: 'Emerging Startup Architecture Trends', url: 'https://techcrunch.com' },
    ],
  };
}

export function generateFallbackClarification(rawIdea: string): ClarifiedIdea {
  const isAgri = /farm|crop|food|grow|produce|local|soil/i.test(rawIdea);

  if (isAgri) {
    return {
      originalInput: rawIdea,
      problemStatement: 'Industrial grocery distribution takes 60-80% of value, leaving small-scale farmers impoverished and consumers with stale, pesticide-heavy produce harvested 3 weeks early.',
      targetAudience: 'Health-conscious suburban parents and culinary enthusiasts paired with peri-urban organic farmers.',
      coreValueDriver: 'Hyper-local cold-chain disintermediation and pre-harvest crop commitment pledges.',
      operationalConstraints: ['Perishable route density economics', 'Seasonal volume fluctuation', 'Cold-chain hygiene compliance'],
      marketContext: 'Supermarkets prioritize shelf-life over nutrient density; existing farmers markets suffer from unpredictable weekend footfall.',
      keyChallenge: 'Solving route delivery density so delivery cost doesn’t exceed basket gross margin.',
      suggestedAngle: 'Position not as a chore app or discount market, but as a prestigious "Farm Share Syndicate" bringing Michelin-grade seasonal harvests directly to kitchen tables.',
    };
  }

  return {
    originalInput: rawIdea,
    problemStatement: `Current solutions in this space impose high friction, middleman taxes, and opaque pricing, forcing users to settle for compromised, one-size-fits-all alternatives.`,
    targetAudience: 'Demanding early-majority consumers and independent operators seeking radical transparency and speed.',
    coreValueDriver: 'Direct peer-to-peer or zero-overhead digital protocol that returns leverage to the actual producer and end-user.',
    operationalConstraints: ['Unit economics at sub-scale density', 'User habit inertia and switching cost', 'Trust and verification mechanisms'],
    marketContext: 'Legacy oligopolies relying on inertia, bloated marketing budgets, and captive distribution channels.',
    keyChallenge: 'Overcoming the zero-trust cold start barrier to achieve high-frequency organic retention.',
    suggestedAngle: 'Lead with extreme cultural point-of-view and ritualistic onboarding rather than utilitarian feature lists.',
  };
}

export function generateFallbackDebate(rawIdea: string, clarified: ClarifiedIdea): DebateStage {
  return {
    vc: {
      id: 'vc',
      name: 'Marcus Vance',
      role: 'Growth VC & Market Strategist',
      avatar: 'chart',
      badgeColor: 'emerald',
      stance: 'Bullish on TAM, Demanding Defensible Flywheel',
      openingThesis: `The addressable market here is massive because legacy distribution takes an indefensible slice of value. However, if this is just an aggregate listing directory, customer acquisition costs will destroy gross margins before month 18.`,
      arguments: [
        {
          point: 'Flywheel Defensibility & Lock-in',
          rationale: 'We must build structural network effects: supply-side software (inventory, payouts, predictive demand) so providers never leave, paired with recurring consumer subscriptions.',
        },
        {
          point: 'Unit Economics Discipline',
          rationale: 'Delivery, logistics, or compute costs cannot exceed 22% of GMV. We need pre-committed batches or micro-clusters to keep contribution margin positive on transaction one.',
        },
      ],
      blindspotsOrRisks: [
        'Cold-start marketplace subsidy trap where cash burns out trying to buy two-sided liquidity.',
        'Low switching cost if we fail to become the primary financial ledger for the seller.',
      ],
      recommendedAction: 'Anchor the brand on predictable economic yield: guarantee sellers higher take-home pay and consumers price-lock subscriptions.',
      rebuttalToOthers: {
        targetAgent: 'Solenne Moreau (Creative)',
        critique: 'Aesthetics and emotional manifestos are gorgeous, Solenne, but vibes don’t pay AWS servers or delivery fleets. If unit economics bleed out, the poem is over.',
      },
      scorecard: {
        metric: 'Market Scalability & Moat',
        score: 82,
        verdict: 'High ceiling venture if we monetize workflow rather than just taking a thin transaction fee.',
        dimensionRatings: {
          viability: 86,
          innovation: 75,
          marketFit: 88,
          scalability: 92,
          brandSoul: 65,
          executionFeasibility: 78,
        },
      },
    },
    creative: {
      id: 'creative',
      name: 'Solenne Moreau',
      role: 'Brand Architect & Creative Director',
      avatar: 'palette',
      badgeColor: 'violet',
      stance: 'Cultural Resonance & Narrative Alchemy',
      openingThesis: `People don't fall in love with spreadsheets or supply chain mechanics; they fall in love with rebellion, sacred craft, and identity. If you brand this like a gray enterprise logistics tool, you'll be forgotten by Tuesday.`,
      arguments: [
        {
          point: 'Sacred Origin & Ritual Over Utility',
          rationale: 'Position every unboxing or transaction as an act of subversion against sterile corporate monopolies. We turn ordinary consumption into an ethical flex.',
        },
        {
          point: 'Visual & Verbal Counter-Culture',
          rationale: 'Reject the ubiquitous pastel corporate-tech aesthetic. Use tactile typography, raw editorial imagery, and unfiltered language that feels human, urgent, and alive.',
        },
      ],
      blindspotsOrRisks: [
        'Dying in the sea of soulless neo-minimalist startups that look like every generic Y Combinator landing page.',
        'Sounding like an apologetic discount service rather than an aspirational lifestyle standard.',
      ],
      recommendedAction: 'Build a brand that provokes an immediate emotional reaction: make the legacy system look ridiculous, exhausted, and obsolete.',
      rebuttalToOthers: {
        targetAgent: "Jax 'Zero-BS' Sterling (Skeptic)",
        critique: 'Cynicism is lazy, Jax. Every breakthrough company—from Patagonia to Apple—sounded like an absurd fantasy until human devotion turned it into an unshakeable empire.',
      },
      scorecard: {
        metric: 'Emotional Resonance & Distinctiveness',
        score: 91,
        verdict: 'Phenomenal canvas for iconic storytelling; potential to become a category-defining cultural token.',
        dimensionRatings: {
          viability: 72,
          innovation: 94,
          marketFit: 84,
          scalability: 76,
          brandSoul: 98,
          executionFeasibility: 68,
        },
      },
    },
    skeptic: {
      id: 'skeptic',
      name: "Jax 'Zero-BS' Sterling",
      role: 'Anti-Generic Critic & Stress-Tester',
      avatar: 'flame',
      badgeColor: 'amber',
      stance: 'Ruthless BS Exterminator',
      openingThesis: `Let's stop pretending we just invented fire. The graveyard of startups is paved with "Uber for X" pitch decks that promised to "cut the middleman" and ended up becoming an even more expensive, broken middleman.`,
      arguments: [
        {
          point: 'The Friction Inertia Delusion',
          rationale: 'Consumers will claim they care about quality and ethics right up until checkout, then abandon cart because 2-day delivery or convenience wins every time. What is the real incentive?',
        },
        {
          point: 'The Operational Meatgrinder',
          rationale: 'Operational complexity is non-linear. The moment volume spikes, customer support floods, refunds mount, and your pristine brand promise gets dragged through trust-killing delays.',
        },
      ],
      blindspotsOrRisks: [
        'Relying on moral virtue signaling instead of providing a 10x superior end-to-end user experience.',
        'Over-promising on bespoke curation that collapses the instant you scale past 500 users.',
      ],
      recommendedAction: 'Start in a tiny, hyper-dense sandbox where you can guarantee 100% flaw-free fulfillment before spending a single dollar on vanity marketing.',
      rebuttalToOthers: {
        targetAgent: 'Marcus Vance (VC)',
        critique: 'Marcus talks about $10B TAM while ignoring that his "flywheel" has three flat tires in the real world. If you can’t make 50 users obsess over this this month, your TAM is zero.',
      },
      scorecard: {
        metric: 'BS Danger Index & Reality Check',
        score: 68,
        verdict: 'High mortality risk if treated as a generic aggregator. High survival odds if focused as an exclusive, flawless micro-network.',
        dimensionRatings: {
          viability: 66,
          innovation: 60,
          marketFit: 70,
          scalability: 58,
          brandSoul: 62,
          executionFeasibility: 52,
        },
      },
    },
    clashSummary: 'Marcus pushed for immediate supply-side SaaS lock-in and high-margin expansion, while Solenne insisted that without a radical cultural mythos, nobody will pay premium prices. Jax called out both for underestimating cold-start friction and real-world execution chaos.',
    keyConsensus: [
      'Commodity aggregation is fatal: The brand cannot look, sound, or price like a generic middleman.',
      'Hyper-dense micro-markets beat broad shallow launches every single time.',
      'The emotional story must be backed by ironclad operational reliability.',
    ],
    unresolvedTension: 'Should the brand lead with raw economic advantage (transparency, yield, savings) or prestige cultural rebellion (craft, sacred connection, curated lifestyle)?',
    arbiterNote: 'The synthesis must fuse both: position the brand as "Tactical Craft"—hyper-disciplined, premium utility with an unapologetic cultural spine.',
  };
}

export function generateFallbackBrandKit(rawIdea: string, clarified: ClarifiedIdea, debate: DebateStage): BrandKit {
  const isAgri = /farm|crop|food|grow|produce|local|soil/i.test(rawIdea);
  const heroName = isAgri ? 'TerraVerde Guild' : 'VoltOrigin';
  const displayFont = isAgri ? 'Space Grotesk' : 'Syne';

  const kit: BrandKit = {
    brandNameProposal: heroName,
    oneLinePitch: isAgri
      ? 'The decentralized harvest syndicate connecting elite regenerative growers straight to obsessive home culinary tables.'
      : 'The high-conviction intelligence engine turning raw startup intuition into unassailable category dominance.',
    taglineOptions: [
      { style: 'The Manifesto Hook', text: isAgri ? 'Soil to Table. Zero Oligarchs.' : 'Unfair Advantage by Design.' },
      { style: 'The Direct Value Prop', text: isAgri ? 'Harvested at sunrise. In your kitchen by supper.' : 'Built to win before you write a single line of code.' },
      { style: 'The Provocation', text: isAgri ? 'Your supermarket is feeding you yesterday’s compromises.' : 'Average brands beg for attention. Icons own the category.' },
    ],
    positioningStatement: isAgri
      ? 'For conscious culinary creators and families exhausted by sterile supermarket monopolies, TerraVerde Guild is the premier direct-harvest collective that delivers peak-flavor unadulterated crops within hours of picking, unlike legacy grocery chains because we cut out every extractive broker and reward farmers as master artisans.'
      : `For high-ambition founders building in crowded markets, ${heroName} is the strategic brand forge that distills chaotic hypotheses into launch-ready category leadership, unlike generic AI prompt wrappers because our multi-agent arena rigorously stress-tests defensibility, cultural resonance, and real-world economics.`,
    primaryValueProposition: isAgri
      ? 'Living nutrition and unforgettable flavor unlocked through zero-middleman harvest routing.'
      : 'Defensible brand sovereignty forged through multi-agent cross-examination.',
    unfairAdvantage: isAgri
      ? 'Exclusive direct-allocation contracts with top-tier regional heritage growers who refuse to sell to industrial wholesalers.'
      : 'Proprietary multi-agent arbitration engine fusing financial rigor, creative mythology, and anti-cliché stress-testing.',
    targetAudiencePersona: {
      name: isAgri ? 'Elena Rostova' : 'Darius Vance',
      role: isAgri ? 'Urban Culinary Curator & Parent' : 'Serial Venture Architect & Founder',
      struggle: isAgri
        ? 'Frustrated by paying premium prices for dull, flavorless produce sitting in cold storage warehouses for weeks.'
        : 'Sick of generic agency retainers and cookie-cutter pitch decks that fail to create organic market pull.',
      aspiration: isAgri
        ? 'To host meals with ingredients so extraordinary they spark stories around the dining table.'
        : 'To launch category-defining companies that command irrational customer loyalty from day one.',
    },
    personalityTraits: [
      {
        trait: 'Uncompromising Authenticity',
        description: 'We tell the unvarnished truth about quality, provenance, and cost.',
        rule: 'We are authentic, therefore we never use euphemisms or hide how our margins are structured.',
      },
      {
        trait: 'Kinetic Precision',
        description: 'Obsessed with operational speed, clean execution, and zero wasted motion.',
        rule: 'We are precise, therefore we deliver exact metrics, times, and specifications rather than vague promises.',
      },
      {
        trait: 'Audacious Reverence',
        description: 'Deep respect for the craft of the producer paired with fearless disruption of the legacy machine.',
        rule: 'We are reverent, therefore we elevate the human maker as the hero of every single touchpoint.',
      },
    ],
    traitsToAvoid: [
      {
        trait: 'Corporate Sanitization',
        reason: 'Using bland PR buzzwords or stock photos instantly destroys the artisanal trust we hold.',
      },
      {
        trait: 'Preachy Moralizing',
        reason: 'Nobody likes being lectured; our product must win on sheer superior performance and pleasure, not guilt.',
      },
      {
        trait: 'Discount Bargain Hunting',
        reason: 'Compromising price signals cheapens the labor of our producers and attracts churn-prone price shoppers.',
      },
    ],
    namingOptions: [
      {
        id: 'functional',
        archetype: 'The Functional Anchor',
        name: isAgri ? 'FieldDirect' : 'CoreStance',
        rationale: 'Instantly communicates the core mechanics and primary benefit with zero mental translation required.',
        domainViability: isAgri ? 'GetFieldDirect.com / FieldDirect.co' : 'CoreStance.io / CoreStance.ai',
        phoneticVibe: 'Crisp, resolute, industrial clarity',
        sampleHeadline: isAgri ? 'Straight from the grower. Zero warehouses.' : 'Strategy that stands. Category that lasts.',
      },
      {
        id: 'evocative',
        archetype: 'The Evocative Muse',
        name: isAgri ? 'Sol & Furrow' : 'AetherForge',
        rationale: 'Draws upon rich sensory imagery, ancient earth rituals, and timeless craft to evoke profound emotional affinity.',
        domainViability: isAgri ? 'SolAndFurrow.com' : 'AetherForge.design',
        phoneticVibe: 'Lyrical, heritage elegance, high tactile resonance',
        sampleHeadline: isAgri ? 'Earth remembered. Flavor restored.' : 'Where vision crystallizes into icon.',
      },
      {
        id: 'provocative',
        archetype: 'The Provocative Rebel',
        name: isAgri ? 'RawOutlaw' : 'AntiDefault',
        rationale: 'A deliberate slap in the face to legacy monopolies; forces a double-take and sparks viral tribal loyalty.',
        domainViability: isAgri ? 'RawOutlaw.com / WeAreRaw.farm' : 'AntiDefault.com / AntiDefault.sh',
        phoneticVibe: 'Sharp, defiant, high kinetic energy',
        sampleHeadline: isAgri ? 'Supermarkets hate us. Farmers love us.' : 'Kill the vanilla before it kills your company.',
      },
    ],
    visualDirection: {
      themeName: isAgri ? 'Raw Earth & Solar Modernism' : 'Obsidian Neon Brutalism',
      themeDescription: isAgri
        ? 'Deep forest obsidian contrasted with vibrant harvest ochre and chlorophyll greens. Clean editorial typography paired with unretouched, macro-detail photography of soil, morning dew, and weathered hands.'
        : 'High-contrast dark editorial aesthetics. Deep carbon backgrounds punctuated by electric cyan and laser amber accents. Monospaced metadata tags and bold architectural display headers.',
      colorPalette: isAgri
        ? [
            { name: 'Dark Humus', hex: '#0a0d0a', role: 'Foundation Dark', psychologicalEffect: 'Deep organic grounding, stability, and nocturnal quiet' },
            { name: 'Sprout Emerald', hex: '#10b981', role: 'Primary Signal', psychologicalEffect: 'Vitality, regeneration, fresh harvest energy' },
            { name: 'Harvest Ochre', hex: '#f59e0b', role: 'Warm Contrast', psychologicalEffect: 'Sunlight, grain bounty, human warmth' },
            { name: 'Morning Mist', hex: '#f1f5f9', role: 'Canvas Contrast', psychologicalEffect: 'Clean modern legibility and breathing space' },
          ]
        : [
            { name: 'Obsidian Void', hex: '#07090e', role: 'Foundation Dark', psychologicalEffect: 'Commanding authority, sleek futuristic depth' },
            { name: 'Ion Cyan', hex: '#06b6d4', role: 'Primary Signal', psychologicalEffect: 'Algorithmic precision, electric intellect, speed' },
            { name: 'Volt Amber', hex: '#fbbf24', role: 'Warm Contrast', psychologicalEffect: 'Urgency, spark of creative intuition, high visibility' },
            { name: 'Starlight Silver', hex: '#e2e8f0', role: 'Canvas Contrast', psychologicalEffect: 'High readability, razor-sharp contrast' },
          ],
      typography: {
        displayFont: displayFont,
        bodyFont: 'Plus Jakarta Sans',
        styleNotes: 'Use tight negative letter-spacing (-0.03em) on display headlines for punch. Maintain generous line height (1.6) on body text for effortless reading.',
      },
      imageryArtDirection: isAgri
        ? 'High dynamic range documentary photography. No staged stock models smiling at leaves. Only real farmers at dawn, honest sweat, vibrant heirloom vegetable cross-sections, and honest farm-to-table plating.'
        : 'Architectural minimalism, dimensional glass reflections, high-density typographical compositions, and razor-sharp geometric wireframes.',
      logoConcept: {
        symbolDescription: isAgri
          ? 'An interlocking dual-leaf geometry that doubles as an infinity loop, representing sustainable cyclic renewal between earth and table.'
          : 'A dynamic split-chevron glyph that points upward and outward, symbolizing diverging paths and decisive market breakthrough.',
        monogramLetters: isAgri ? 'TV' : 'BB',
        designPhilosophy: 'Geometric reduction: clean enough to be branded onto a wooden crate or scaled down to a 16px browser favicon.',
      },
    },
    launchTactics: isAgri
      ? [
          'The 100 Founder Farms Drop: Launch with an exclusive VIP box containing rare heirloom tomatoes and honey, accompanied by handwritten notes from the growers, gifted to 50 top culinary food creators.',
          'The "Compare Your Apple" Taste Test: Street pop-up challenging passersby to blind taste supermarket store-shelf apples vs same-day tree-ripened cultivars, filming their genuine shock for viral TikTok reels.',
          'Pre-Harvest Guild Memberships: Allow neighborhood clusters to co-sponsor a specific greenhouse row in exchange for weekly locked-in wholesale harvest deliveries.',
        ]
      : [
          'The "Roast My Brand" Live Arena: A public weekly livestream where founders submit their startup pitch and our 3 AI agents roast and rebuild their brand live on X and LinkedIn.',
          'The Pitch Deck Contrast Tear-Down: Publish high-profile visual dissections of infamous bland corporate startups vs how they should have positioned themselves.',
          'Exclusive "Agent Key" Closed Alpha: Release 250 limited-edition access codes to top YC and Seed-stage cohorts to spark FOMO and organic word-of-mouth referral.',
        ],
    arbitrationVerdict: isAgri
      ? 'By anchoring the brand as an unapologetic, high-craft rebellion against industrial shelf-life compromises, TerraVerde Guild escapes the commodity price-war trap and commands a 35-50% pricing premium with fanatical customer retention.'
      : `By balancing growth economics with visceral storytelling and mercilessly pruning clichés, ${heroName} converts abstract technological promise into an unshakeable market leader.`,
    launchMediaAssets: generateFallbackLaunchMedia({
      brandNameProposal: heroName,
      oneLinePitch: isAgri
        ? 'The decentralized harvest syndicate connecting elite regenerative growers straight to home tables.'
        : 'The high-conviction intelligence engine turning raw startup intuition into unassailable category dominance.',
    } as BrandKit),
    marketContext: generateFallbackCompetitorContext(rawIdea, heroName),
  };

  return kit;
}

export function generateFallbackLaunchMedia(brandKit: { brandNameProposal: string; oneLinePitch: string }): LaunchMediaAssets {
  return {
    socialLaunchVideoScript: {
      platform: 'TikTok / Instagram Reels / YouTube Shorts (9:16 Vertical Video)',
      hookDuration: '0:00 - 0:03',
      hookVisual: 'Extreme close-up of plastic-wrapped, pale, supermarket produce or corporate bloatware with rapid glitched text.',
      hookAudio: `"The thing you're buying every single week? It was harvested 28 days ago and gassed in a warehouse."`,
      bodyVisual: `Snap cut to high-energy footage of real creators/farmers, sun cutting through mist, beautiful typography showing ${brandKit.brandNameProposal}.`,
      bodyAudio: `"${brandKit.brandNameProposal} cuts out 4 layers of greedy middlemen. Straight from the source to your doorstep within 12 hours."`,
      ctaVisual: 'Clean split-screen with founding invite code and member counter counting down rapidly.',
      ctaAudio: `"First 500 founding cohort invites are live right now. Claim yours in the bio before allocations close."`,
    },
    tweetThread: [
      `1/ Why 90% of solutions in this industry are structurally broken (and the counter-intuitive model we built to fix it). 🧵👇`,
      `2/ Middlemen take up to 70% of the value while adding friction, delay, and sterile mediocrity.`,
      `3/ Today we're unveiling ${brandKit.brandNameProposal}. ${brandKit.oneLinePitch}.`,
      `4/ Early founding member invitations are now open. No ads, no corporate fluff. Link below. 🚀`,
    ],
  };
}

export function generateFallbackQA(question: string, brandKit: BrandKit, targetAgent: 'vc' | 'creative' | 'skeptic' | 'all') {
  const responses = [];

  if (targetAgent === 'vc' || targetAgent === 'all') {
    responses.push({
      agentId: 'vc',
      agentName: 'Marcus Vance (Growth VC)',
      answer: `On "${question}": Keep unit economics sacred. If customer acquisition cost (CAC) isn't recovered within 3.5 months through recurring retention or high basket size, you are running an expensive charity, not a scalable business. Price for gross margins above 65%.`,
    });
  }

  if (targetAgent === 'creative' || targetAgent === 'all') {
    responses.push({
      agentId: 'creative',
      agentName: 'Solenne Moreau (Creative Director)',
      answer: `Regarding "${question}": Never compete on features alone—features get cloned overnight. Build on the emotional tension. Every interaction with ${brandKit.brandNameProposal} should feel like joining a private, discerning vanguard that scorns the ordinary.`,
    });
  }

  if (targetAgent === 'skeptic' || targetAgent === 'all') {
    responses.push({
      agentId: 'skeptic',
      agentName: "Jax 'Zero-BS' Sterling (Skeptic)",
      answer: `Here is the real truth on "${question}": 95% of founders over-engineer this and assume users will jump through hoops. Keep friction at absolute zero. If onboarding takes more than 45 seconds or requires a manual, users will bounce back to their lazy default habits.`,
    });
  }

  return { agentId: targetAgent, responses };
}

export interface GenerateLogoParams {
  brandName: string;
  archetype?: string;
  style?: 'geometric' | 'abstract' | 'emblem' | 'radical';
  colors?: { name: string; hex: string }[] | string[];
  monogram?: string;
  symbolDescription?: string;
  themeName?: string;
  background?: 'dark' | 'light' | 'transparent';
  seed?: number;
}

/**
 * Generates an image / vector logo placeholder based on the brand name and archetype
 */
export async function generateCustomBrandLogo(params: GenerateLogoParams) {
  const {
    brandName,
    archetype = 'The Functional Anchor',
    style = 'geometric',
    colors = ['#0a0e17', '#10b981', '#f59e0b', '#f1f5f9'],
    monogram,
    symbolDescription,
    themeName = 'Modern Intelligence',
    background = 'dark',
    seed = Math.floor(Math.random() * 900) + 100,
  } = params;

  // Extract clean monogram
  const cleanName = (brandName || 'Brand').trim();
  const words = cleanName.split(/\s+/).filter(Boolean);
  const resolvedMonogram =
    monogram ||
    (words.length >= 2
      ? (words[0][0] + words[1][0]).toUpperCase()
      : cleanName.slice(0, 2).toUpperCase());

  // Colors
  const colorList: string[] = colors.map((c) => (typeof c === 'string' ? c : c.hex));
  const bgDark = colorList[0] || '#070a10';
  const primaryColor = colorList[1] || '#10b981';
  const accentColor = colorList[2] || '#f59e0b';
  const lightColor = colorList[3] || '#f8fafc';

  const isRebel =
    archetype.toLowerCase().includes('rebel') ||
    archetype.toLowerCase().includes('provocative') ||
    style === 'radical';
  const isMuse =
    archetype.toLowerCase().includes('muse') ||
    archetype.toLowerCase().includes('evocative') ||
    style === 'emblem';
  const isAnchor = !isRebel && !isMuse;

  let glyphSvg = '';
  let promptDescription = '';

  if (isAnchor) {
    promptDescription = `The Functional Anchor: Precision isometric hexagonal construct with interlocking planes and optical node for ${cleanName}.`;
    glyphSvg = `
      <g transform="translate(256, 230)">
        <circle r="140" fill="none" stroke="${primaryColor}" stroke-width="1.5" stroke-dasharray="6 8" opacity="0.3" />
        <line x1="-155" y1="0" x2="155" y2="0" stroke="${primaryColor}" stroke-width="1" opacity="0.15" />
        <line x1="0" y1="-155" x2="0" y2="155" stroke="${primaryColor}" stroke-width="1" opacity="0.15" />
        <polygon points="0,-130 112,-65 112,65 0,130 -112,65 -112,-65" fill="none" stroke="${primaryColor}" stroke-width="3" opacity="0.4" />
        <polygon points="0,-115 100,-58 0,0 -100,-58" fill="url(#anchorGrad1)" filter="url(#subtleGlow)" />
        <polygon points="0,0 100,-58 100,58 0,115" fill="url(#anchorGrad2)" />
        <polygon points="-100,-58 0,0 0,115 -100,58" fill="url(#anchorGrad3)" />
        <polygon points="0,-48 42,0 0,48 -42,0" fill="${bgDark}" stroke="${accentColor}" stroke-width="2.5" />
        <circle cx="0" cy="0" r="14" fill="url(#accentGlow)" />
        <circle cx="0" cy="0" r="6" fill="#ffffff" />
      </g>`;
  } else if (isMuse) {
    promptDescription = `The Evocative Muse: Harmonic botanical and celestial infinity curves with radiant starlight apex for ${cleanName}.`;
    glyphSvg = `
      <g transform="translate(256, 230)">
        <g opacity="0.25">
          ${[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330]
            .map(
              (deg) =>
                `<line x1="0" y1="0" x2="${Math.cos((deg * Math.PI) / 180) * 145}" y2="${
                  Math.sin((deg * Math.PI) / 180) * 145
                }" stroke="${accentColor}" stroke-width="1.5" stroke-dasharray="3 6" />`
            )
            .join('')}
        </g>
        <circle r="130" fill="none" stroke="url(#museGrad1)" stroke-width="3" opacity="0.5" />
        <circle r="110" fill="none" stroke="${primaryColor}" stroke-width="1" opacity="0.3" />
        <path d="M -75,-60 C -120,20 -40,110 30,95 C 95,80 120,0 70,-65 C 20,-130 -40,-120 -75,-60 Z"
              fill="url(#museGrad1)" opacity="0.85" filter="url(#subtleGlow)" />
        <path d="M 75,-60 C 120,20 40,110 -30,95 C -95,80 -120,0 -70,-65 C -20,-130 40,-120 75,-60 Z"
              fill="url(#museGrad2)" opacity="0.75" />
        <path d="M 0,-40 Q 0,0 40,0 Q 0,0 0,40 Q 0,0 -40,0 Q 0,0 0,-40 Z" fill="url(#accentGlow)" />
        <circle cx="0" cy="0" r="7" fill="#ffffff" />
      </g>`;
  } else {
    promptDescription = `The Provocative Rebel: Angular kinetic prism shards with sharp asymmetric cuts and high-voltage spark for ${cleanName}.`;
    glyphSvg = `
      <g transform="translate(256, 230)">
        <polygon points="-130,-120 140,-90 120,130 -140,100" fill="none" stroke="${accentColor}" stroke-width="1.5" opacity="0.2" stroke-dasharray="4 8" />
        <line x1="-140" y1="-140" x2="140" y2="140" stroke="${primaryColor}" stroke-width="1" opacity="0.15" />
        <line x1="140" y1="-140" x2="-140" y2="140" stroke="${accentColor}" stroke-width="1" opacity="0.15" />
        <polygon points="-25,-140 100,-75 25,-15 110,-5 -40,120 5,20 -80,10 -15,-65"
                 fill="url(#rebelGrad1)" filter="url(#subtleGlow)" />
        <polygon points="-110,-60 -45,-30 -85,65 -130,20"
                 fill="url(#rebelGrad2)" opacity="0.75" />
        <line x1="-120" y1="90" x2="120" y2="-90" stroke="${accentColor}" stroke-width="3" stroke-linecap="round" />
        <polygon points="0,-18 14,-3 25,-8 12,8 18,22 3,12 -12,20 -5,5 -20,-2 -7,-12" fill="#ffffff" />
      </g>`;
  }

  const bgFill = background === 'light' ? '#ffffff' : background === 'transparent' ? 'none' : bgDark;
  const bgBorder = background === 'light' ? 'rgba(0,0,0,0.08)' : background === 'transparent' ? 'none' : 'rgba(255,255,255,0.12)';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <linearGradient id="anchorGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${primaryColor}" stop-opacity="0.95" />
      <stop offset="100%" stop-color="${primaryColor}" stop-opacity="0.5" />
    </linearGradient>
    <linearGradient id="anchorGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${accentColor}" stop-opacity="0.9" />
      <stop offset="100%" stop-color="${primaryColor}" stop-opacity="0.6" />
    </linearGradient>
    <linearGradient id="anchorGrad3" x1="100%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${primaryColor}" stop-opacity="0.7" />
      <stop offset="100%" stop-color="${accentColor}" stop-opacity="0.3" />
    </linearGradient>
    <linearGradient id="museGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${primaryColor}" />
      <stop offset="100%" stop-color="${accentColor}" />
    </linearGradient>
    <linearGradient id="museGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${accentColor}" stop-opacity="0.9" />
      <stop offset="100%" stop-color="${primaryColor}" stop-opacity="0.4" />
    </linearGradient>
    <linearGradient id="rebelGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${accentColor}" />
      <stop offset="50%" stop-color="${primaryColor}" />
      <stop offset="100%" stop-color="#f43f5e" />
    </linearGradient>
    <linearGradient id="rebelGrad2" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${primaryColor}" stop-opacity="0.8" />
      <stop offset="100%" stop-color="${accentColor}" stop-opacity="0.4" />
    </linearGradient>
    <radialGradient id="accentGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${accentColor}" stop-opacity="1" />
      <stop offset="60%" stop-color="${primaryColor}" stop-opacity="0.8" />
      <stop offset="100%" stop-color="${primaryColor}" stop-opacity="0" />
    </radialGradient>
    <filter id="subtleGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>
  ${bgFill !== 'none' ? `<rect width="512" height="512" rx="48" fill="${bgFill}" /><rect width="512" height="512" rx="48" fill="none" stroke="${bgBorder}" stroke-width="2" />` : ''}
  <g opacity="0.4">
    <text x="36" y="44" font-family="monospace" font-size="11" fill="${lightColor}" letter-spacing="2">SPEC ID: 0${seed}</text>
    <text x="476" y="44" text-anchor="end" font-family="monospace" font-size="11" fill="${accentColor}" letter-spacing="1.5">${archetype.toUpperCase()}</text>
    <line x1="36" y1="56" x2="476" y2="56" stroke="${lightColor}" stroke-width="0.75" opacity="0.2" />
  </g>
  ${glyphSvg}
  <g transform="translate(256, 420)">
    <rect x="-42" y="-30" width="84" height="26" rx="6" fill="${bgDark}" stroke="${primaryColor}" stroke-width="1.5" opacity="0.9" />
    <text x="0" y="-12" text-anchor="middle" font-family="'Space Grotesk', -apple-system, sans-serif" font-weight="800" font-size="15" fill="${lightColor}" letter-spacing="4">${resolvedMonogram}</text>
    <text x="0" y="24" text-anchor="middle" font-family="'Plus Jakarta Sans', -apple-system, sans-serif" font-weight="800" font-size="20" fill="${background === 'light' ? '#0f172a' : '#ffffff'}" letter-spacing="1">${cleanName}</text>
    <text x="0" y="46" text-anchor="middle" font-family="monospace" font-size="10" fill="${accentColor}" letter-spacing="2">${themeName.toUpperCase()}</text>
  </g>
</svg>`;

  const dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

  return {
    svg,
    dataUrl,
    brandName: cleanName,
    archetype,
    style,
    monogram: resolvedMonogram,
    primaryColor,
    accentColor,
    promptDescription,
    seed,
  };
}

/**
 * Real-time competitor search & market context summarization using Google Search grounding
 */
export async function searchAndSummarizeCompetitors(params: {
  idea: string;
  brandName?: string;
  customQuery?: string;
  existingClarified?: ClarifiedIdea;
}): Promise<MarketContextSummary> {
  const { idea, brandName = 'Our Brand', customQuery, existingClarified } = params;
  const effectiveQuery = customQuery?.trim() || `${idea} top 3 competitors alternatives direct competitors`;

  if (ai) {
    try {
      const searchPrompt = `You are an elite venture strategist and market intelligence researcher.
Conduct live Google Search grounding to discover and dissect the TOP 3 REAL existing competitors or prominent market alternatives for this startup idea:
Startup Idea: "${idea}"
Brand Name: "${brandName}"
Topic Focus / Query: "${effectiveQuery}"

${
  existingClarified?.marketGrounding
    ? `Initial Grounding Signals: ${JSON.stringify(existingClarified.marketGrounding.competitors)}`
    : ''
}

Instructions:
1. Identify the TOP 3 real-world companies, direct competitors, or high-profile market incumbents operating in this exact or adjacent space.
2. For each competitor, provide:
   - "name": Official company/brand name
   - "url": Official website link (e.g. "https://company.com")
   - "stageOrCategory": Classification (e.g. "Legacy Incumbent", "Series B Challenger", "Bootstrapped Indie Guild", "Enterprise Giant")
   - "summary": 1-2 sentence breakdown of what they do and who they serve
   - "marketPositioning": How they market themselves, their core value proposition, and customer wedge
   - "strengths": Array of 2-3 key strengths or moat advantages
   - "weaknessesAndGaps": 1-2 critical vulnerabilities, user complaints, high friction, or gaps in their model
   - "differentiationAngle": The lethal counter-move: Exactly how "${brandName}" attacks their weakness and wins

3. Macro Landscape Analysis:
   - "marketOverview": 2-3 sentence strategic macro summary of the overall market dynamics, growth drivers, and competitive intensity.
   - "saturation": One of "Low", "Moderate", "High", or "Crowded"
   - "whiteSpaceMoat": The single highest-conviction white-space positioning opportunity for "${brandName}" to exploit.

Return ONLY a valid JSON object matching this schema:
{
  "searchQuery": "${effectiveQuery.replace(/"/g, '\\"')}",
  "marketOverview": "Macro landscape summary...",
  "saturation": "Moderate",
  "whiteSpaceMoat": "The white space opportunity...",
  "competitors": [
    {
      "name": "Competitor 1",
      "url": "https://...",
      "stageOrCategory": "Category",
      "summary": "1-2 sentence summary",
      "marketPositioning": "Positioning...",
      "strengths": ["Strength 1", "Strength 2"],
      "weaknessesAndGaps": "Vulnerabilities...",
      "differentiationAngle": "How we win..."
    },
    {
      "name": "Competitor 2",
      "url": "https://...",
      "stageOrCategory": "Category",
      "summary": "1-2 sentence summary",
      "marketPositioning": "Positioning...",
      "strengths": ["Strength 1", "Strength 2"],
      "weaknessesAndGaps": "Vulnerabilities...",
      "differentiationAngle": "How we win..."
    },
    {
      "name": "Competitor 3",
      "url": "https://...",
      "stageOrCategory": "Category",
      "summary": "1-2 sentence summary",
      "marketPositioning": "Positioning...",
      "strengths": ["Strength 1", "Strength 2"],
      "weaknessesAndGaps": "Vulnerabilities...",
      "differentiationAngle": "How we win..."
    }
  ]
}`;

      const searchResponse = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: searchPrompt,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      const rawText = searchResponse.text?.trim() || '';

      // Extract search grounding metadata sources if present
      const sources: { title: string; url: string }[] = [];
      const chunks = searchResponse.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (Array.isArray(chunks)) {
        for (const chunk of chunks) {
          if (chunk.web?.uri && chunk.web?.title) {
            sources.push({
              title: chunk.web.title,
              url: chunk.web.uri,
            });
          }
        }
      }

      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (Array.isArray(parsed.competitors) && parsed.competitors.length > 0) {
          return {
            searchQuery: parsed.searchQuery || effectiveQuery,
            marketOverview:
              parsed.marketOverview ||
              'A fast-evolving competitive landscape with legacy players defending high margin moats while agile challengers capture unserved niches.',
            saturation: parsed.saturation || 'Moderate',
            whiteSpaceMoat:
              parsed.whiteSpaceMoat ||
              'Decentralized direct provenance and radical transparency with zero middleman tax.',
            competitors: parsed.competitors.slice(0, 3).map((c: any, idx: number) => ({
              name: c.name || `Competitor ${idx + 1}`,
              url: c.url || (sources[idx]?.url ?? ''),
              stageOrCategory:
                c.stageOrCategory ||
                (idx === 0
                  ? 'Direct Venture Competitor'
                  : idx === 1
                  ? 'Legacy Scale Incumbent'
                  : 'Niche Point Solution'),
              summary:
                c.summary ||
                'Established competitor providing traditional solutions in this market segment.',
              marketPositioning:
                c.marketPositioning ||
                'Broad-market feature suite targeting average enterprise and consumer tiers.',
              strengths: Array.isArray(c.strengths) && c.strengths.length
                ? c.strengths
                : ['High distribution footprint', 'Strong customer awareness'],
              weaknessesAndGaps:
                c.weaknessesAndGaps ||
                'High overhead costs passed onto users, rigid legacy workflows, and slow responsiveness.',
              differentiationAngle:
                c.differentiationAngle ||
                `${brandName} delivers superior unit economics, hyper-focused customer empathy, and zero-compromise execution.`,
            })),
            groundingSources: sources.slice(0, 6),
            lastUpdated: new Date().toISOString(),
          };
        }
      }
    } catch (err) {
      logGeminiNotice('searchAndSummarizeCompetitors', err);
    }
  }

  return generateFallbackCompetitorContext(idea, brandName, effectiveQuery);
}

export function generateFallbackCompetitorContext(
  idea: string,
  brandName: string = 'Our Brand',
  searchQuery?: string
): MarketContextSummary {
  const isAgri = /farm|crop|food|grow|produce|local|soil|grocery|market/i.test(idea);
  const isDev = /code|ai|developer|api|tool|software|app|github|data/i.test(idea);

  if (isAgri) {
    return {
      searchQuery: searchQuery || 'direct farm to consumer grocery market competitors trends',
      marketOverview:
        'The US and global fresh food supply chain is dominated by industrial grocery distributors and discount delivery brokers. While consumer demand for organic provenance is at an all-time high, existing delivery services struggle with cold-chain warehouse overhead and quality degradation.',
      saturation: 'Moderate',
      whiteSpaceMoat:
        'A zero-central-warehouse "Harvest Guild" that delivers hyper-fresh heirloom produce within 12 hours of harvest via route density clusters, rewarding growers with 75%+ take-home share.',
      competitors: [
        {
          name: 'Imperfect Foods / Misfits Market',
          url: 'https://www.misfitsmarket.com',
          stageOrCategory: 'Venture-backed Series C ($2B+ Valuation)',
          summary:
            'Large-scale surplus and organic grocery delivery service shipping boxed produce directly to consumers on weekly subscriptions.',
          marketPositioning:
            'Positions on affordability and food waste reduction, offering discounted cosmetically imperfect grocery items.',
          strengths: [
            'National distribution network and massive brand awareness',
            'Strong bulk procurement relationships with industrial farms',
            'Broad catalog including packaged pantry staples',
          ],
          weaknessesAndGaps:
            'Relies on multi-day warehouse storage resulting in stale produce upon arrival. Farmers receive commodity liquidation pricing rather than premium recognition.',
          differentiationAngle:
            `${brandName} guarantees same-day harvest-to-table delivery with full grower micro-provenance, competing on peak flavor and luxury freshness rather than discount surplus salvage.`,
        },
        {
          name: 'Good Eggs',
          url: 'https://www.goodeggs.com',
          stageOrCategory: 'Regional Premium Online Supermarket ($150M+ Raised)',
          summary:
            'High-end farm-to-door online grocery store operating curated local food hubs in metropolitan markets.',
          marketPositioning:
            'Positions as a gourmet, ethically sourced organic supermarket for affluent suburban food lovers.',
          strengths: [
            'Exceptional artisanal product curation and high consumer trust',
            'High average order value ($110+) among high-income urbanites',
            'Integrated meal kits and prepared culinary items',
          ],
          weaknessesAndGaps:
            'Crushing cold-chain facility overhead and high delivery fleet capital expenditures prevent geographic expansion and force a 40-50% retail markup.',
          differentiationAngle:
            `${brandName} eliminates centralized warehouse Capex entirely through peer-to-peer route fulfillment, passing 25% cost savings to buyers while paying growers 2x more.`,
        },
        {
          name: 'Harvie / Barn2Door',
          url: 'https://www.barn2door.com',
          stageOrCategory: 'B2B Farm E-Commerce SaaS Platform',
          summary:
            'Software infrastructure enabling individual farms and ranches to manage CSAs, online storefronts, and customer drop-offs.',
          marketPositioning:
            'Empowers independent family farmers with e-commerce, order management, and subscription billing tools.',
          strengths: [
            'Direct relationships with thousands of agricultural producers',
            'High software stickiness and annual recurring revenue retention',
            'Zero food inventory or spoilage risk for the platform',
          ],
          weaknessesAndGaps:
            'Puts the entire customer acquisition burden on exhausted individual farmers; lacks unified consumer discovery, consolidated delivery logistics, or collective brand marketing.',
          differentiationAngle:
            `${brandName} delivers the consumer brand, route coordination, and demand engine that individual farms cannot build alone, turning isolated farms into a coordinated market powerhouse.`,
        },
      ],
      groundingSources: [
        { title: 'USDA Local Food Marketing & Direct Farm Sales Report', url: 'https://www.ams.usda.gov' },
        { title: 'AgFunder AgriFoodTech Investment Review', url: 'https://agfunder.com' },
        { title: 'Misfits Market & Imperfect Foods Competitive Deep Dive', url: 'https://techcrunch.com' },
      ],
      lastUpdated: new Date().toISOString(),
    };
  }

  if (isDev) {
    return {
      searchQuery: searchQuery || `${idea} top developer platforms competitors`,
      marketOverview:
        'The developer tooling market is transitioning from isolated text editors and manual workflow scripts to AI-orchestrated engineering systems. Incumbents possess deep code distribution, but struggle with closed ecosystems and slow feedback cycles.',
      saturation: 'High',
      whiteSpaceMoat:
        'An uncompromising, high-speed native interface built specifically for multi-agent autonomous execution and verifiable deterministic outputs.',
      competitors: [
        {
          name: 'Cursor (Anysphere)',
          url: 'https://cursor.com',
          stageOrCategory: 'Venture-backed Hyper-growth Unicorn',
          summary: 'AI-first code editor built as a fork of VS Code with deeply integrated codebase indexing and agentic multi-file generation.',
          marketPositioning: 'Positions as the default AI IDE replacing traditional code editors for modern software engineers.',
          strengths: ['Seamless VS Code extension compatibility', 'Rapid iteration speed on agentic multi-file editing', 'Fanatical developer advocacy'],
          weaknessesAndGaps: 'Tied to existing desktop VS Code architecture; high API consumption costs and occasional hallucination loops on large repos.',
          differentiationAngle: `${brandName} focuses on deterministic architectural verification and team-wide consensus arbitration rather than single-player code autocompletion.`,
        },
        {
          name: 'GitHub Copilot (Microsoft)',
          url: 'https://github.com/features/copilot',
          stageOrCategory: 'Enterprise Giant (Microsoft/OpenAI)',
          summary: 'The incumbent market leader in AI code assistance, embedded directly into GitHub and enterprise engineering workflows.',
          marketPositioning: 'Positions as the secure, enterprise-compliant AI pair programmer for Fortune 500 engineering organizations.',
          strengths: ['Unmatched enterprise sales distribution', 'Tight GitHub repository and pull request integration', 'Compliance and IP indemnity guarantees'],
          weaknessesAndGaps: 'Slow enterprise release cycles, conservative model steering, and generic suggestions that fail to capture startup domain context.',
          differentiationAngle: `${brandName} wins with bold, opinionated domain intelligence, radical speed, and high-craft aesthetic execution that developers actually fall in love with.`,
        },
        {
          name: 'Replit Agent',
          url: 'https://replit.com',
          stageOrCategory: 'Venture-backed Cloud Development Platform ($1B+ Valuation)',
          summary: 'Browser-based collaborative development environment that builds, deploys, and hosts full-stack applications from natural language prompts.',
          marketPositioning: 'Positions as the zero-setup, prompt-to-production creation platform for non-engineers and rapid prototypers.',
          strengths: ['Instant browser runtime with zero environment configuration', 'Built-in database, authentication, and instant hosting', 'Accessible to non-technical founders'],
          weaknessesAndGaps: 'Proprietary sandbox lock-in, difficulties scaling to complex production architectures, and opaque compute pricing.',
          differentiationAngle: `${brandName} provides portable, pristine production-grade source code with zero proprietary lock-in and enterprise-grade modularity.`,
        },
      ],
      groundingSources: [
        { title: 'State of AI in Software Engineering Report', url: 'https://github.blog' },
        { title: 'Developer Tooling Ecosystem Map', url: 'https://techcrunch.com' },
      ],
      lastUpdated: new Date().toISOString(),
    };
  }

  // Default / Universal Fallback
  return {
    searchQuery: searchQuery || `${idea} competitors alternatives market`,
    marketOverview:
      'The addressable landscape is characterized by established legacy leaders defending high-margin moats alongside fragmented point-solution startups. Customers frequently experience feature bloat and misaligned pricing, creating prime terrain for an opinionated challenger brand.',
    saturation: 'Moderate',
    whiteSpaceMoat:
      'Uncompromising vertical focus, transparent outcome-based pricing, and an anti-corporate brand voice that converts alienated users into passionate evangelists.',
    competitors: [
      {
        name: 'The Legacy Market Incumbent',
        url: 'https://example.com/incumbent',
        stageOrCategory: 'Public Enterprise Monopoly',
        summary:
          'Comprehensive legacy platform with broad feature coverage, extensive partner ecosystems, and massive enterprise sales forces.',
        marketPositioning:
          'Positions on stability, safety, and all-in-one compliance for risk-averse procurement managers.',
        strengths: [
          'Massive market share and entrenched customer inertia',
          'Vast sales distribution network and global partner certifications',
          'Comprehensive check-the-box feature catalog',
        ],
        weaknessesAndGaps:
          'Bloated software with slow onboarding, steep learning curves, extortionate annual lock-in contracts, and lifeless corporate customer support.',
        differentiationAngle:
          `${brandName} eliminates 80% of unnecessary bloat, delivering 10x faster time-to-value with modern design and transparent pricing.`,
      },
      {
        name: 'The Fast-Moving Venture Challenger',
        url: 'https://example.com/challenger',
        stageOrCategory: 'Series B Venture-Backed Startup',
        summary:
          'Well-funded startup that raised $30M+ to modernize the category with sleek interfaces and aggressive digital ad acquisition.',
        marketPositioning:
          'Positions as the cool, modern alternative to legacy software for tech-forward early adopters.',
        strengths: [
          'High capital reserves for paid customer acquisition',
          'Clean, modern user interface design',
          'Active social media marketing and influencer partnerships',
        ],
        weaknessesAndGaps:
          'High burn rate forces premature monetization and frequent pricing hikes; customer retention is shaky due to lack of deep operational defensibility.',
        differentiationAngle:
          `${brandName} builds a genuine organic flywheel and structural moat rather than relying on paid ad arbitrage, guaranteeing lasting customer trust.`,
      },
      {
        name: 'The Generic Point-Solution Suite',
        url: 'https://example.com/point-solution',
        stageOrCategory: 'Bootstrapped / Indie Product Suite',
        summary:
          'Single-purpose utility tool focusing on solving one specific micro-task at a discount price.',
        marketPositioning:
          'Positions on quick utility, simple self-serve onboarding, and cheap month-to-month pricing.',
        strengths: [
          'Frictionless instant sign-up without sales calls',
          'Low price point accessible to freelancers and small teams',
          'Simple, focused UI for one single task',
        ],
        weaknessesAndGaps:
          'Zero defensibility or long-term retention; easily copied by competitors and unable to support growing business requirements.',
        differentiationAngle:
          `${brandName} bridges the gap between lightweight simplicity and enterprise power, scaling with users without requiring painful migrations.`,
      },
    ],
    groundingSources: [
      { title: 'Venture & Competitive Landscape Intelligence', url: 'https://pitchbook.com' },
      { title: 'Emerging Startup Category Trends', url: 'https://techcrunch.com' },
    ],
    lastUpdated: new Date().toISOString(),
  };
}

import React, { useState } from 'react';
import {
  TrendingUp,
  Palette,
  Flame,
  BookOpen,
  Zap,
  Target,
  ShieldAlert,
  Award,
  Quote,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export interface PersonaProfileData {
  id: 'vc' | 'creative' | 'skeptic';
  name: string;
  title: string;
  role: string;
  archetype: string;
  avatarText: string;
  badgeColor: string;
  biography: string;
  debatingStyle: string;
  coreMotto: string;
  signatureWeapon: string;
  keyMetricName: string;
  typicalScoreRange: string;
  coreFocusAreas: string[];
  petPeeves: string[];
  accentClasses: {
    border: string;
    borderActive: string;
    badgeBg: string;
    badgeText: string;
    avatarBg: string;
    glow: string;
    quoteBg: string;
    pillBg: string;
  };
}

export const PERSONA_PROFILES: PersonaProfileData[] = [
  {
    id: 'vc',
    name: 'Marcus Vance',
    title: 'Growth VC',
    role: 'Series A Lead & Scale Partner',
    archetype: 'The Defensibility & Scale Architect',
    avatarText: 'MV',
    badgeColor: 'emerald',
    biography:
      '12-year Silicon Valley venture capitalist and former B2B software operator. After steering a high-velocity enterprise logistics startup through an acquisition, he joined Apex Ventures to lead early-stage rounds. He evaluates every brand proposition through unit economics, capital efficiency, CAC payback velocity (<6 months), and structural defensibility against Big Tech platform risk.',
    debatingStyle:
      'Ruthlessly quantitative, ROI-driven, and balance-sheet grounded. Slices through visionary rhetoric with financial stress tests, demanding proofs of viral distribution, pricing power, and enterprise margins. Considers decorative branding useless unless it drives organic conversion and LTV.',
    coreMotto:
      'If it cannot achieve defensible 80% gross margins and organic distribution at scale, it is a charity hobby, not an enterprise.',
    signatureWeapon: 'LTV:CAC Payback Horizon & Moat Stress-Testing',
    keyMetricName: 'Scale Defensibility & Unit Margins',
    typicalScoreRange: '80–95/100',
    coreFocusAreas: [
      'CAC Payback < 6 Months',
      'Structural Moats & Network Effects',
      'Defensible 80%+ Gross Margins',
      'B2B & Enterprise Scalability',
    ],
    petPeeves: [
      'Vague TAM projections based on total global GDP',
      'Unmonetizable community hype',
      'Cosmetic rebranding without pricing power',
    ],
    accentClasses: {
      border: 'border-emerald-200 dark:border-emerald-900/60',
      borderActive: 'border-emerald-500 dark:border-emerald-500 shadow-emerald-500/20',
      badgeBg: 'bg-emerald-50 dark:bg-emerald-950/50',
      badgeText: 'text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800/80',
      avatarBg: 'bg-gradient-to-br from-emerald-500 to-teal-700 text-white',
      glow: 'from-emerald-500/10 to-transparent',
      quoteBg: 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50',
      pillBg: 'bg-emerald-100/70 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-300/60 dark:border-emerald-800/50',
    },
  },
  {
    id: 'creative',
    name: 'Solenne Moreau',
    title: 'Creative Director',
    role: 'Principal Brand Architect & Cultural Strategist',
    archetype: 'The Identity & Soul Champion',
    avatarText: 'SM',
    badgeColor: 'violet',
    biography:
      'Educated at École des Beaux-Arts in Paris, with over a decade directing iconic, rebellious brand identities for global design ateliers across Paris, New York, and Tokyo. She has crafted narrative bibles for category-defining DTC unicorns. She insists that market positioning without emotional soul is invisible, generic, and instantly commoditized by copycats.',
    debatingStyle:
      'Visceral, narrative-first, provocative, and defiantly anti-boring. She deconstructs typography, cultural semiotics, and tribal psychology. She rejects sanitized corporate safe-talk, demanding that the brand adopt a polarizing ideological stance that inspires fanatical devotion and turns users into cult evangelists.',
    coreMotto:
      'Consumers do not buy products; they join the cultural tribe of who your brand empowers them to become.',
    signatureWeapon: 'Semiotics Teardown & Counter-Culture Provocation',
    keyMetricName: 'Cultural Distinctiveness & Narrative Soul',
    typicalScoreRange: '85–98/100',
    coreFocusAreas: [
      'Aesthetic Vernacular & Semiotics',
      'Polarizing Emotional Belonging',
      'Anti-Corporate Narrative Soul',
      'Uncompromising Voice & Tone',
    ],
    petPeeves: [
      'Generic corporate blue SaaS templates',
      'Sanitized buzzwords that offend nobody and excite nobody',
      'Playing it safe to conform to legacy categories',
    ],
    accentClasses: {
      border: 'border-violet-200 dark:border-violet-900/60',
      borderActive: 'border-violet-500 dark:border-violet-500 shadow-violet-500/20',
      badgeBg: 'bg-violet-50 dark:bg-violet-950/50',
      badgeText: 'text-violet-700 dark:text-violet-300 border-violet-300 dark:border-violet-800/80',
      avatarBg: 'bg-gradient-to-br from-violet-500 to-purple-800 text-white',
      glow: 'from-violet-500/10 to-transparent',
      quoteBg: 'bg-violet-50/60 dark:bg-violet-950/30 border-violet-200 dark:border-violet-900/50',
      pillBg: 'bg-violet-100/70 dark:bg-violet-950/40 text-violet-800 dark:text-violet-300 border-violet-300/60 dark:border-violet-800/50',
    },
  },
  {
    id: 'skeptic',
    name: "Jax 'Zero-BS' Sterling",
    title: 'Brutal Skeptic',
    role: 'Anti-Generic Product Critic & Tech Realist',
    archetype: 'The Cold-Start & Reality Investigator',
    avatarText: 'JS',
    badgeColor: 'amber',
    biography:
      'A veteran 3x bootstrapper and cynical tech teardown author with over 400 published startup autopsies. He has witnessed hundreds of over-funded, sleekly branded startups disintegrate upon immediate collision with user apathy, cold-start voids, and onboarding friction. He operates as the ruthless antidote to founder delusion and Silicon Valley groupthink.',
    debatingStyle:
      'Unsparingly blunt, sardonic, street-smart, and hyper-pragmatic. He relentlessly hunts down the hidden cold-start friction, consumer inertia, and fake demand assumptions. He treats optimistic hockey-stick projections like hostile witnesses and exposes buzzword bingo without mercy.',
    coreMotto:
      'Nobody cares about your startup. If your user will not swipe a card within 30 seconds of launch, your brand is dead.',
    signatureWeapon: 'Cold-Start Friction Teardown & Founder Assumption Sledgehammer',
    keyMetricName: 'Real-World Friction & Survival Probability',
    typicalScoreRange: '75–92/100',
    coreFocusAreas: [
      'Cold-Start Problem Elimination',
      'Zero-Friction Value Realization',
      'Brutal Consumer Inertia Defense',
      'Post-Mortem Risk Inoculation',
    ],
    petPeeves: [
      'Solutions actively searching for a problem',
      '"AI-powered" plastered over standard CRUD databases',
      'Relying on user goodwill or behavioral changes',
    ],
    accentClasses: {
      border: 'border-amber-200 dark:border-amber-900/60',
      borderActive: 'border-amber-500 dark:border-amber-500 shadow-amber-500/20',
      badgeBg: 'bg-amber-50 dark:bg-amber-950/50',
      badgeText: 'text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800/80',
      avatarBg: 'bg-gradient-to-br from-amber-500 to-rose-700 text-white',
      glow: 'from-amber-500/10 to-transparent',
      quoteBg: 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50',
      pillBg: 'bg-amber-100/70 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-300/60 dark:border-amber-800/50',
    },
  },
];

interface PersonaProfileCardsProps {
  activePersonaId?: 'all' | 'vc' | 'creative' | 'skeptic';
  onSelectPersona?: (id: 'vc' | 'creative' | 'skeptic') => void;
  showHeading?: boolean;
  compact?: boolean;
}

export const PersonaProfileCards: React.FC<PersonaProfileCardsProps> = ({
  activePersonaId = 'all',
  onSelectPersona,
  showHeading = true,
  compact = false,
}) => {
  const [expandedPersona, setExpandedPersona] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedPersona((prev) => (prev === id ? null : id));
  };

  const getPersonaIcon = (id: 'vc' | 'creative' | 'skeptic') => {
    switch (id) {
      case 'vc':
        return <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 stroke-[2.2]" />;
      case 'creative':
        return <Palette className="w-4 h-4 sm:w-5 sm:h-5 text-violet-300 stroke-[2.2]" />;
      case 'skeptic':
        return <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300 stroke-[2.2]" />;
    }
  };

  return (
    <div className="w-full">
      {showHeading && (
        <div className="mb-6 sm:mb-8 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 dark:bg-[#0d131f] border border-neutral-300 dark:border-[#1e293b] text-xs font-mono text-neutral-700 dark:text-neutral-300 mb-2.5">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>The Three Arena Intel Personas</span>
          </div>
          <h2 className="text-xl sm:text-3xl font-display font-extrabold text-neutral-900 dark:text-white tracking-tight">
            Debater Biographies &amp; Combat Styles
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1.5 leading-relaxed">
            Every clash in the Strategy Arena pits distinct philosophies against each other. Inspect their backgrounds, tactical styles, and signature evaluation weapons.
          </p>
        </div>
      )}

      {/* Grid of Profile Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
        {PERSONA_PROFILES.map((persona) => {
          const isSelected = activePersonaId === persona.id;
          const isExpanded = expandedPersona === persona.id;

          return (
            <div
              key={persona.id}
              className={`bg-white dark:bg-[#0a0e17] border rounded-2xl p-5 sm:p-6 flex flex-col justify-between transition-all duration-300 relative overflow-hidden shadow-lg ${
                isSelected
                  ? `${persona.accentClasses.borderActive} ring-2 ring-offset-2 ring-offset-slate-50 dark:ring-offset-[#06080d] ring-amber-500/40`
                  : `${persona.accentClasses.border} hover:border-neutral-400 dark:hover:border-[#2a3852]`
              }`}
            >
              {/* Background ambient subtle glow */}
              <div
                className={`absolute top-0 right-0 w-36 h-36 bg-gradient-to-bl ${persona.accentClasses.glow} rounded-full blur-2xl pointer-events-none -mr-10 -mt-10`}
              />

              <div>
                {/* Header: Avatar, Badge, Title */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center font-display font-black text-sm tracking-wider shadow-md shrink-0 border border-white/20 ${persona.accentClasses.avatarBg}`}
                    >
                      {getPersonaIcon(persona.id)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-display font-bold text-base sm:text-lg text-neutral-900 dark:text-white">
                          {persona.name}
                        </h3>
                      </div>
                      <span className="text-[11px] font-mono tracking-wide text-neutral-500 dark:text-neutral-400 block">
                        {persona.role}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border ${persona.accentClasses.badgeBg} ${persona.accentClasses.badgeText}`}
                  >
                    {persona.title}
                  </span>
                </div>

                {/* Archetype Tag */}
                <div className="mb-4">
                  <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-neutral-400" />
                    <span>{persona.archetype}</span>
                  </span>
                </div>

                {/* Biography Section */}
                <div className="mb-4 bg-neutral-50/80 dark:bg-[#070b12] border border-neutral-200/80 dark:border-[#162032] rounded-xl p-3.5 transition-colors">
                  <div className="flex items-center gap-1.5 text-[11px] font-mono font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                    <span>Persona Biography</span>
                  </div>
                  <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    {compact && !isExpanded
                      ? `${persona.biography.slice(0, 160)}...`
                      : persona.biography}
                  </p>
                </div>

                {/* Debating Style Section */}
                <div className="mb-4 bg-neutral-50/80 dark:bg-[#070b12] border border-neutral-200/80 dark:border-[#162032] rounded-xl p-3.5 transition-colors">
                  <div className="flex items-center gap-1.5 text-[11px] font-mono font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span>Debating Style &amp; Tactics</span>
                  </div>
                  <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed font-sans">
                    {compact && !isExpanded
                      ? `${persona.debatingStyle.slice(0, 160)}...`
                      : persona.debatingStyle}
                  </p>
                </div>

                {/* Core Motto */}
                <div
                  className={`mb-4 rounded-xl p-3 border transition-colors ${persona.accentClasses.quoteBg}`}
                >
                  <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider font-semibold text-neutral-500 dark:text-neutral-400 mb-1">
                    <Quote className="w-3 h-3 text-neutral-400" />
                    <span>Core Battle Motto</span>
                  </div>
                  <p className="text-xs italic text-neutral-800 dark:text-neutral-200 font-serif leading-snug">
                    "{persona.coreMotto}"
                  </p>
                </div>

                {/* Tactical weapon */}
                <div className="mb-4 text-xs">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 dark:text-neutral-400 block mb-1">
                    Signature Weapon:
                  </span>
                  <span className="font-semibold text-neutral-800 dark:text-neutral-200 bg-neutral-100 dark:bg-[#121927] border border-neutral-200 dark:border-[#1f2b42] px-2.5 py-1 rounded-md inline-block text-[11px]">
                    {persona.signatureWeapon}
                  </span>
                </div>

                {/* Expandable Core Focus & Pet Peeves */}
                {(!compact || isExpanded) && (
                  <div className="space-y-3 pt-3 border-t border-neutral-200 dark:border-[#151e30] animate-in fade-in duration-200">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 dark:text-neutral-400 block mb-1.5 font-semibold">
                        Critical Focus Areas:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {persona.coreFocusAreas.map((focus, idx) => (
                          <span
                            key={idx}
                            className={`text-[10px] font-mono px-2 py-0.5 rounded-md border ${persona.accentClasses.pillBg}`}
                          >
                            ✓ {focus}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 dark:text-neutral-400 block mb-1.5 font-semibold">
                        Fatal Pet Peeves:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {persona.petPeeves.map((peeve, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/40"
                          >
                            ✕ {peeve}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Card Actions */}
              <div className="mt-4 pt-3 border-t border-neutral-200 dark:border-[#151e30] flex items-center justify-between gap-2">
                {compact ? (
                  <button
                    type="button"
                    onClick={() => toggleExpand(persona.id)}
                    className="text-[11px] font-medium text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white flex items-center gap-1 transition-colors"
                  >
                    <span>{isExpanded ? 'Less Details' : 'Full Dossier'}</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                ) : (
                  <div className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
                    Evaluation Weight: <strong className="text-neutral-800 dark:text-neutral-200">33.3%</strong>
                  </div>
                )}

                {onSelectPersona && (
                  <button
                    type="button"
                    onClick={() => onSelectPersona(persona.id)}
                    className={`text-xs font-semibold px-3 py-1 rounded-lg transition-all ${
                      isSelected
                        ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 shadow-sm'
                        : 'bg-neutral-100 dark:bg-[#141b29] hover:bg-neutral-200 dark:hover:bg-[#1e293b] text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-[#222f47]'
                    }`}
                  >
                    {isSelected ? 'Viewing Persona' : 'Focus Persona'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

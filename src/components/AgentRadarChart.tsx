import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import {
  TrendingUp,
  Palette,
  Flame,
  Info,
  Layers,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Award,
} from 'lucide-react';
import { DebateStage, AgentResponse, AgentDimensionRatings } from '../types/brand.js';

interface DimensionConfig {
  key: keyof AgentDimensionRatings;
  label: string;
  shortLabel: string;
  description: string;
  iconName: string;
}

export const RADAR_DIMENSIONS: DimensionConfig[] = [
  {
    key: 'viability',
    label: 'Commercial Viability',
    shortLabel: 'Viability',
    description: 'Unit economics, gross margins (>75%), pricing power, and CAC payback period.',
    iconName: 'DollarSign',
  },
  {
    key: 'innovation',
    label: 'Category Innovation',
    shortLabel: 'Innovation',
    description: 'Defiance of industry conventions, novel business mechanics, and fresh positioning.',
    iconName: 'Sparkles',
  },
  {
    key: 'marketFit',
    label: 'Market Fit & Pull',
    shortLabel: 'Market Fit',
    description: 'Intensity of consumer demand, urgent pain-point resolution, and addressable TAM.',
    iconName: 'Target',
  },
  {
    key: 'scalability',
    label: 'Scalability & Moat',
    shortLabel: 'Scalability',
    description: 'Network effects, supply-side software lock-in, and defensibility against incumbents.',
    iconName: 'TrendingUp',
  },
  {
    key: 'brandSoul',
    label: 'Brand Soul & Identity',
    shortLabel: 'Brand Soul',
    description: 'Cultural resonance, emotional pull, anti-corporate vernacular, and fanatical loyalty.',
    iconName: 'Heart',
  },
  {
    key: 'executionFeasibility',
    label: 'Execution Feasibility',
    shortLabel: 'Execution',
    description: 'Cold-start friction defense, operational survival, and low-friction onboarding.',
    iconName: 'ShieldCheck',
  },
];

interface AgentRadarChartProps {
  debate: DebateStage;
  activePersonaFilter?: 'all' | 'vc' | 'creative' | 'skeptic';
  onPersonaSelect?: (id: 'all' | 'vc' | 'creative' | 'skeptic') => void;
}

interface DimensionDataPoint {
  dimension: string;
  key: keyof AgentDimensionRatings;
  description: string;
  vc: number;
  creative: number;
  skeptic: number;
  consensusAvg: number;
  spread: number; // max - min
  highestAgent: string;
  lowestAgent: string;
}

/**
 * Normalizes dimension ratings from agent scorecard or computes contextual scores
 */
export function extractAgentRatings(agent: AgentResponse): AgentDimensionRatings {
  if (agent.scorecard.dimensionRatings) {
    return agent.scorecard.dimensionRatings;
  }

  // Sensible contextual derivation based on agent archetype and composite score
  const base = agent.scorecard.score || 75;
  if (agent.id === 'vc') {
    return {
      viability: Math.min(98, Math.max(60, base + 5)),
      innovation: Math.min(95, Math.max(55, base - 7)),
      marketFit: Math.min(98, Math.max(65, base + 6)),
      scalability: Math.min(98, Math.max(70, base + 10)),
      brandSoul: Math.min(90, Math.max(45, base - 12)),
      executionFeasibility: Math.min(95, Math.max(50, base - 2)),
    };
  } else if (agent.id === 'creative') {
    return {
      viability: Math.min(90, Math.max(50, base - 10)),
      innovation: Math.min(99, Math.max(75, base + 8)),
      marketFit: Math.min(95, Math.max(60, base - 2)),
      scalability: Math.min(90, Math.max(50, base - 8)),
      brandSoul: Math.min(99, Math.max(80, base + 10)),
      executionFeasibility: Math.min(88, Math.max(45, base - 14)),
    };
  } else {
    // skeptic
    return {
      viability: Math.min(85, Math.max(40, base - 2)),
      innovation: Math.min(80, Math.max(35, base - 10)),
      marketFit: Math.min(85, Math.max(45, base + 4)),
      scalability: Math.min(80, Math.max(30, base - 8)),
      brandSoul: Math.min(82, Math.max(40, base - 5)),
      executionFeasibility: Math.min(75, Math.max(25, base - 16)),
    };
  }
}

export const AgentRadarChart: React.FC<AgentRadarChartProps> = ({
  debate,
  activePersonaFilter = 'all',
  onPersonaSelect,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Visibility toggles
  const [showVc, setShowVc] = useState(true);
  const [showCreative, setShowCreative] = useState(true);
  const [showSkeptic, setShowSkeptic] = useState(true);
  const [showConsensus, setShowConsensus] = useState(true);

  // Active hover states
  const [hoveredDimension, setHoveredDimension] = useState<DimensionDataPoint | null>(null);
  const [activeTooltip, setActiveTooltip] = useState<{
    x: number;
    y: number;
    title: string;
    agentName: string;
    agentColor: string;
    score: number;
    note?: string;
  } | null>(null);

  // Synchronize when activePersonaFilter changes externally
  useEffect(() => {
    if (activePersonaFilter === 'vc') {
      setShowVc(true);
      setShowCreative(false);
      setShowSkeptic(false);
    } else if (activePersonaFilter === 'creative') {
      setShowVc(false);
      setShowCreative(true);
      setShowSkeptic(false);
    } else if (activePersonaFilter === 'skeptic') {
      setShowVc(false);
      setShowCreative(false);
      setShowSkeptic(true);
    } else {
      setShowVc(true);
      setShowCreative(true);
      setShowSkeptic(true);
    }
  }, [activePersonaFilter]);

  // Extract structured dimension dataset
  const { dimensionData, vcRatings, creativeRatings, skepticRatings, summaryStats } =
    useMemo(() => {
      const vc = extractAgentRatings(debate.vc);
      const creative = extractAgentRatings(debate.creative);
      const skeptic = extractAgentRatings(debate.skeptic);

      const items: DimensionDataPoint[] = RADAR_DIMENSIONS.map((dim) => {
        const vcScore = vc[dim.key] ?? 70;
        const crScore = creative[dim.key] ?? 70;
        const skScore = skeptic[dim.key] ?? 60;
        const consensusAvg = Math.round((vcScore + crScore + skScore) / 3);
        const maxVal = Math.max(vcScore, crScore, skScore);
        const minVal = Math.min(vcScore, crScore, skScore);
        const spread = maxVal - minVal;

        let highestAgent = 'Marcus (VC)';
        if (crScore >= vcScore && crScore >= skScore) highestAgent = 'Solenne (Creative)';
        if (skScore > vcScore && skScore > crScore) highestAgent = 'Jax (Skeptic)';

        let lowestAgent = 'Jax (Skeptic)';
        if (vcScore <= crScore && vcScore <= skScore) lowestAgent = 'Marcus (VC)';
        if (crScore < vcScore && crScore < skScore) lowestAgent = 'Solenne (Creative)';

        return {
          dimension: dim.shortLabel,
          key: dim.key,
          description: dim.description,
          vc: vcScore,
          creative: crScore,
          skeptic: skScore,
          consensusAvg,
          spread,
          highestAgent,
          lowestAgent,
        };
      });

      // Compute summary stats
      const sortedBySpread = [...items].sort((a, b) => b.spread - a.spread);
      const sortedByScore = [...items].sort((a, b) => b.consensusAvg - a.consensusAvg);

      const deepestClash = sortedBySpread[0];
      const strongestConsensus = sortedByScore[0];
      const compositeOverall = Math.round(
        items.reduce((acc, curr) => acc + curr.consensusAvg, 0) / items.length
      );

      return {
        dimensionData: items,
        vcRatings: vc,
        creativeRatings: creative,
        skepticRatings: skeptic,
        summaryStats: {
          deepestClash,
          strongestConsensus,
          compositeOverall,
        },
      };
    }, [debate]);

  // Render D3 Radar Chart on Canvas / SVG
  useEffect(() => {
    if (!svgRef.current) return;

    const width = 640;
    const height = 540;
    const margin = { top: 60, right: 80, bottom: 60, left: 80 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    const radius = Math.min(innerWidth, innerHeight) / 2;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous render

    const totalAxes = dimensionData.length;
    const angleSlice = (Math.PI * 2) / totalAxes;

    // Radius scale: 0 to 100
    const rScale = d3.scaleLinear().domain([0, 100]).range([0, radius]);

    // Center group
    const g = svg
      .append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);

    // Defs for gradients & filters
    const defs = svg.append('defs');

    // Glow filter
    const filter = defs
      .append('filter')
      .attr('id', 'radar-glow')
      .attr('x', '-20%')
      .attr('y', '-20%')
      .attr('width', '140%')
      .attr('height', '140%');
    filter
      .append('feGaussianBlur')
      .attr('stdDeviation', 3.5)
      .attr('result', 'coloredBlur');
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Circular web levels: 20, 40, 60, 80, 100
    const levels = [20, 40, 60, 80, 100];
    const axisGrid = g.append('g').attr('class', 'axis-grid');

    levels.forEach((level) => {
      // Concentric polygon
      const points: [number, number][] = [];
      for (let i = 0; i < totalAxes; i++) {
        const r = rScale(level);
        const angle = i * angleSlice - Math.PI / 2;
        points.push([r * Math.cos(angle), r * Math.sin(angle)]);
      }

      // Draw level polygon
      axisGrid
        .append('polygon')
        .attr('points', points.map((p) => p.join(',')).join(' '))
        .attr('fill', level === 100 ? 'rgba(255,255,255,0.015)' : 'none')
        .attr('stroke', 'currentColor')
        .attr('class', 'text-neutral-300 dark:text-[#192437]')
        .attr('stroke-width', level === 100 ? 1.5 : 0.8)
        .attr('stroke-dasharray', level === 100 ? 'none' : '3 4');

      // Level percentage indicator label
      axisGrid
        .append('text')
        .attr('x', 6)
        .attr('y', -rScale(level) + 4)
        .attr('class', 'text-[9px] font-mono fill-neutral-400 dark:fill-neutral-500 select-none')
        .text(`${level}%`);
    });

    // Radial spokes (axes)
    const axes = axisGrid
      .selectAll('.axis')
      .data(dimensionData)
      .enter()
      .append('g')
      .attr('class', 'axis');

    axes
      .append('line')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', (d, i) => rScale(100) * Math.cos(i * angleSlice - Math.PI / 2))
      .attr('y2', (d, i) => rScale(100) * Math.sin(i * angleSlice - Math.PI / 2))
      .attr('stroke', 'currentColor')
      .attr('class', 'text-neutral-300 dark:text-[#1d293d]')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '2 3');

    // Axis Labels outside perimeter
    axes
      .append('text')
      .attr('class', 'text-[11px] font-display font-semibold select-none cursor-pointer transition-colors')
      .attr('text-anchor', (d, i) => {
        const angle = i * angleSlice - Math.PI / 2;
        const cos = Math.cos(angle);
        if (Math.abs(cos) < 0.1) return 'middle';
        return cos > 0 ? 'start' : 'end';
      })
      .attr('dy', (d, i) => {
        const angle = i * angleSlice - Math.PI / 2;
        const sin = Math.sin(angle);
        if (sin < -0.8) return '-0.5em';
        if (sin > 0.8) return '1.2em';
        return '0.35em';
      })
      .attr('x', (d, i) => (rScale(100) + 18) * Math.cos(i * angleSlice - Math.PI / 2))
      .attr('y', (d, i) => (rScale(100) + 18) * Math.sin(i * angleSlice - Math.PI / 2))
      .attr('fill', (d) =>
        hoveredDimension?.key === d.key ? '#f59e0b' : 'currentColor'
      )
      .attr('class', (d) =>
        hoveredDimension?.key === d.key
          ? 'text-amber-500 dark:text-amber-400 font-bold'
          : 'text-neutral-700 dark:text-neutral-300'
      )
      .text((d) => d.dimension)
      .on('mouseenter', (event, d) => setHoveredDimension(d))
      .on('mouseleave', () => setHoveredDimension(null));

    // Radar line generator in radial coordinates
    const radarLine = d3
      .lineRadial<number>()
      .radius((d) => rScale(d))
      .angle((d, i) => i * angleSlice)
      .curve(d3.curveLinearClosed);

    // 1. Consensus Average polygon (if enabled)
    if (showConsensus) {
      const consensusValues = dimensionData.map((d) => d.consensusAvg);
      const consensusPathData = radarLine(consensusValues);

      if (consensusPathData) {
        g.append('path')
          .attr('d', consensusPathData)
          .attr('fill', 'rgba(14, 165, 233, 0.12)')
          .attr('stroke', '#0ea5e9')
          .attr('stroke-width', 2)
          .attr('stroke-dasharray', '5 4')
          .attr('opacity', 0.85);
      }
    }

    // Agent Layer Configs
    const layers = [
      {
        id: 'vc',
        name: debate.vc.name,
        color: '#10b981', // Emerald
        fillColor: 'rgba(16, 185, 129, 0.18)',
        strokeColor: '#10b981',
        values: dimensionData.map((d) => d.vc),
        visible: showVc,
      },
      {
        id: 'creative',
        name: debate.creative.name,
        color: '#8b5cf6', // Violet
        fillColor: 'rgba(139, 92, 246, 0.18)',
        strokeColor: '#8b5cf6',
        values: dimensionData.map((d) => d.creative),
        visible: showCreative,
      },
      {
        id: 'skeptic',
        name: debate.skeptic.name,
        color: '#f59e0b', // Amber
        fillColor: 'rgba(245, 158, 11, 0.18)',
        strokeColor: '#f59e0b',
        values: dimensionData.map((d) => d.skeptic),
        visible: showSkeptic,
      },
    ];

    // Draw polygons and vertices for active agents
    layers.forEach((layer) => {
      if (!layer.visible) return;

      const pathData = radarLine(layer.values);
      if (!pathData) return;

      // Filled area & outline path
      g.append('path')
        .attr('d', pathData)
        .attr('fill', layer.fillColor)
        .attr('stroke', layer.strokeColor)
        .attr('stroke-width', 2.2)
        .attr('filter', 'url(#radar-glow)')
        .attr('class', 'transition-all duration-300');

      // Vertex dots
      layer.values.forEach((val, i) => {
        const angle = i * angleSlice - Math.PI / 2;
        const x = rScale(val) * Math.cos(angle);
        const y = rScale(val) * Math.sin(angle);
        const dimItem = dimensionData[i];

        const circle = g
          .append('circle')
          .attr('cx', x)
          .attr('cy', y)
          .attr('r', 4.5)
          .attr('fill', layer.color)
          .attr('stroke', '#ffffff')
          .attr('stroke-width', 1.5)
          .attr('class', 'cursor-pointer transition-transform hover:scale-150');

        // Tooltip triggers
        circle
          .on('mouseenter', (event) => {
            const containerBox = containerRef.current?.getBoundingClientRect();
            const posX = event.clientX - (containerBox?.left || 0);
            const posY = event.clientY - (containerBox?.top || 0);

            setActiveTooltip({
              x: posX,
              y: posY,
              title: dimItem.dimension,
              agentName: layer.name,
              agentColor: layer.color,
              score: val,
              note: dimItem.description,
            });
            setHoveredDimension(dimItem);
          })
          .on('mouseleave', () => {
            setActiveTooltip(null);
            setHoveredDimension(null);
          });
      });
    });

    // Center focal hub
    g.append('circle')
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', 4)
      .attr('fill', 'currentColor')
      .attr('class', 'text-neutral-400 dark:text-neutral-600');
  }, [
    dimensionData,
    showVc,
    showCreative,
    showSkeptic,
    showConsensus,
    hoveredDimension,
  ]);

  return (
    <div
      ref={containerRef}
      className="bg-white dark:bg-[#0a0e17] border border-neutral-200 dark:border-[#1a2333] rounded-2xl p-5 sm:p-7 shadow-xl relative overflow-hidden transition-colors"
    >
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 mb-5 border-b border-neutral-200 dark:border-[#1a2333]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50 dark:bg-violet-950/50 border border-violet-200 dark:border-violet-800/60 text-xs font-mono text-violet-700 dark:text-violet-300 mb-2">
            <Layers className="w-3.5 h-3.5 text-violet-500" />
            <span>D3.js Multi-Agent Radar Intel</span>
          </div>
          <h3 className="text-lg sm:text-2xl font-display font-extrabold text-neutral-900 dark:text-white">
            Brand Strategy Evaluation Matrix
          </h3>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            Compare how the Growth VC, Creative Director, and Brutal Skeptic scored 6 critical pillars of your brand foundation.
          </p>
        </div>

        {/* Persona Layer Toggle Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Growth VC toggle */}
          <button
            type="button"
            onClick={() => setShowVc((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all border ${
              showVc
                ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 shadow-sm'
                : 'bg-neutral-100 dark:bg-[#121824] text-neutral-400 border-neutral-300 dark:border-[#1e293b] opacity-60'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                showVc ? 'bg-emerald-500' : 'bg-neutral-400'
              }`}
            />
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            <span>VC (Marcus)</span>
          </button>

          {/* Creative Director toggle */}
          <button
            type="button"
            onClick={() => setShowCreative((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all border ${
              showCreative
                ? 'bg-violet-50 dark:bg-violet-950/50 text-violet-800 dark:text-violet-300 border-violet-300 dark:border-violet-700 shadow-sm'
                : 'bg-neutral-100 dark:bg-[#121824] text-neutral-400 border-neutral-300 dark:border-[#1e293b] opacity-60'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                showCreative ? 'bg-violet-500' : 'bg-neutral-400'
              }`}
            />
            <Palette className="w-3.5 h-3.5 text-violet-500" />
            <span>Creative (Solenne)</span>
          </button>

          {/* Brutal Skeptic toggle */}
          <button
            type="button"
            onClick={() => setShowSkeptic((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all border ${
              showSkeptic
                ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700 shadow-sm'
                : 'bg-neutral-100 dark:bg-[#121824] text-neutral-400 border-neutral-300 dark:border-[#1e293b] opacity-60'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                showSkeptic ? 'bg-amber-500' : 'bg-neutral-400'
              }`}
            />
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>Skeptic (Jax)</span>
          </button>

          {/* Consensus Average toggle */}
          <button
            type="button"
            onClick={() => setShowConsensus((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all border ${
              showConsensus
                ? 'bg-sky-50 dark:bg-sky-950/50 text-sky-800 dark:text-sky-300 border-sky-300 dark:border-sky-700 shadow-sm'
                : 'bg-neutral-100 dark:bg-[#121824] text-neutral-400 border-neutral-300 dark:border-[#1e293b] opacity-60'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                showConsensus ? 'bg-sky-400' : 'bg-neutral-400'
              }`}
            />
            <span>Average Overlay</span>
          </button>
        </div>
      </div>

      {/* Main Grid: D3 Chart Left, Detailed Dimensional Breakdown Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
        {/* Radar SVG Visual (7 cols) */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center relative">
          <div className="w-full max-w-[540px] aspect-[640/540] relative flex items-center justify-center">
            <svg
              ref={svgRef}
              viewBox="0 0 640 540"
              className="w-full h-full overflow-visible select-none"
            />
          </div>

          <div className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400 flex items-center gap-4 mt-2">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Marcus (VC)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-violet-500" />
              <span>Solenne (Creative)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Jax (Skeptic)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-0.5 border-t border-dashed border-sky-400" />
              <span>Consensus</span>
            </span>
          </div>

          {/* Interactive Floating Hover Tooltip */}
          {activeTooltip && (
            <div
              className="absolute z-30 pointer-events-none bg-neutral-900/95 dark:bg-[#070b12]/95 border border-neutral-700 dark:border-[#223049] rounded-xl p-3 shadow-2xl text-xs text-white max-w-[240px] animate-in fade-in zoom-in-95 duration-150 backdrop-blur-md"
              style={{
                left: `${Math.min(Math.max(activeTooltip.x - 120, 10), 380)}px`,
                top: `${Math.max(activeTooltip.y - 110, 10)}px`,
              }}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="font-display font-bold text-sm">
                  {activeTooltip.title}
                </span>
                <span
                  className="font-mono font-bold text-xs px-1.5 py-0.5 rounded"
                  style={{
                    backgroundColor: `${activeTooltip.agentColor}25`,
                    color: activeTooltip.agentColor,
                  }}
                >
                  {activeTooltip.score}/100
                </span>
              </div>
              <div className="text-[11px] font-mono text-neutral-300 mb-1 flex items-center gap-1">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: activeTooltip.agentColor }}
                />
                <span>Rated by {activeTooltip.agentName}</span>
              </div>
              {activeTooltip.note && (
                <p className="text-[10px] text-neutral-400 leading-snug">
                  {activeTooltip.note}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Dimensional Breakdown & Tension Highlights (5 cols) */}
        <div className="lg:col-span-5 space-y-3.5">
          {/* Quick Summary Highlights */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-neutral-50 dark:bg-[#0c121d] border border-neutral-200 dark:border-[#1b263b] rounded-xl p-3">
              <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 block mb-1">
                Strongest Consensus
              </span>
              <div className="font-display font-bold text-sm text-neutral-900 dark:text-white flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>{summaryStats.strongestConsensus.dimension}</span>
              </div>
              <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5 block">
                Avg {summaryStats.strongestConsensus.consensusAvg}/100
              </span>
            </div>

            <div className="bg-neutral-50 dark:bg-[#0c121d] border border-neutral-200 dark:border-[#1b263b] rounded-xl p-3">
              <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 block mb-1">
                Fiercest Clash Spoke
              </span>
              <div className="font-display font-bold text-sm text-neutral-900 dark:text-white flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                <span>{summaryStats.deepestClash.dimension}</span>
              </div>
              <span className="text-[11px] font-mono text-rose-500 font-semibold mt-0.5 block">
                {summaryStats.deepestClash.spread} pt divergence
              </span>
            </div>
          </div>

          {/* Dimension Cards */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono uppercase text-neutral-500 font-semibold px-1">
              <span>Dimension Breakdown</span>
              <span>VC · CRE · SKP</span>
            </div>

            {dimensionData.map((d) => {
              const isHovered = hoveredDimension?.key === d.key;
              return (
                <div
                  key={d.key}
                  onMouseEnter={() => setHoveredDimension(d)}
                  onMouseLeave={() => setHoveredDimension(null)}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                    isHovered
                      ? 'bg-amber-50/70 dark:bg-[#131c2d] border-amber-400 dark:border-amber-500/70 shadow-md ring-1 ring-amber-500/20'
                      : 'bg-neutral-50/70 dark:bg-[#070b12] border-neutral-200 dark:border-[#172235] hover:border-neutral-300 dark:hover:border-[#22314a]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-display font-bold text-xs sm:text-sm text-neutral-900 dark:text-white">
                        {d.dimension}
                      </span>
                    </div>

                    {/* Agent Pill Scores */}
                    <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold">
                      <span
                        className="px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60"
                        title={`Marcus Vance (VC): ${d.vc}/100`}
                      >
                        {d.vc}
                      </span>
                      <span
                        className="px-1.5 py-0.5 rounded bg-violet-100 dark:bg-violet-950/60 text-violet-800 dark:text-violet-300 border border-violet-200 dark:border-violet-800/60"
                        title={`Solenne Moreau (Creative): ${d.creative}/100`}
                      >
                        {d.creative}
                      </span>
                      <span
                        className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60"
                        title={`Jax Sterling (Skeptic): ${d.skeptic}/100`}
                      >
                        {d.skeptic}
                      </span>
                    </div>
                  </div>

                  {/* Visual Progress Bar representation of Consensus */}
                  <div className="w-full bg-neutral-200 dark:bg-[#141b27] h-1.5 rounded-full overflow-hidden mb-1">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-violet-500 to-amber-500 transition-all duration-300"
                      style={{ width: `${d.consensusAvg}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-neutral-500 dark:text-neutral-400">
                    <span className="truncate max-w-[210px]">{d.description}</span>
                    <span className="font-mono text-neutral-700 dark:text-neutral-300 shrink-0">
                      Avg: <strong>{d.consensusAvg}</strong>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

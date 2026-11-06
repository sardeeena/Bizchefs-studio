'use client';

import React, { useState, useMemo, useRef } from 'react';
import * as d3 from 'd3';
import { Cpu, Activity, BarChart2, TrendingUp } from 'lucide-react';

export interface CpuDataPoint {
  time: string; // e.g. "55m ago", "17:15"
  minuteOffset: number; // 60 down to 0
  usage: number; // percentage, e.g. 18.4
}

// Generate realistic CPU metrics across the last 60 minutes for the 4-core Hostinger cluster
function generateLastHourCpuData(): CpuDataPoint[] {
  const points: CpuDataPoint[] = [];
  const baseLoad = 18.5;
  const now = new Date();

  // 13 points (every 5 minutes over the last 60 minutes)
  for (let i = 12; i >= 0; i--) {
    const minuteOffset = i * 5;
    const pointTime = new Date(now.getTime() - minuteOffset * 60 * 1000);
    const timeStr = minuteOffset === 0 ? 'Now' : `${minuteOffset}m ago`;

    // Realistic server fluctuation (14% to 32% with occasional micro-bursts for builds/SSR)
    let variance = Math.sin((12 - i) * 0.7) * 5 + Math.cos((12 - i) * 1.3) * 3;
    if (i === 4) variance += 8.2; // slight spike 20m ago during build check
    const usage = Math.max(12, Math.min(65, Number((baseLoad + variance).toFixed(1))));

    points.push({
      time: timeStr,
      minuteOffset,
      usage,
    });
  }

  return points;
}

export function CpuUsageSparkline({
  cpuCores = 4,
}: {
  cpuCores?: number;
}) {
  const [chartType, setChartType] = useState<'sparkline' | 'bar'>('sparkline');
  const [hoveredPoint, setHoveredPoint] = useState<CpuDataPoint | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const data = useMemo(() => generateLastHourCpuData(), []);
  const currentUsage = data[data.length - 1]?.usage ?? 19.2;
  const maxUsage = Math.max(...data.map((d) => d.usage));
  const avgUsage = Number((data.reduce((acc, d) => acc + d.usage, 0) / data.length).toFixed(1));

  // Chart dimensions
  const width = 280;
  const height = 64;
  const margin = { top: 6, right: 6, bottom: 6, left: 6 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // D3 Scales
  const xScale = useMemo(() => {
    return d3
      .scaleLinear()
      .domain([0, data.length - 1])
      .range([0, innerWidth]);
  }, [data.length, innerWidth]);

  const yScale = useMemo(() => {
    return d3
      .scaleLinear()
      .domain([0, Math.max(50, maxUsage + 10)])
      .range([innerHeight, 0]);
  }, [innerHeight, maxUsage]);

  // D3 Line & Area generators for Sparkline
  const lineGenerator = useMemo(() => {
    return d3
      .line<CpuDataPoint>()
      .x((_, i) => xScale(i))
      .y((d) => yScale(d.usage))
      .curve(d3.curveMonotoneX);
  }, [xScale, yScale]);

  const areaGenerator = useMemo(() => {
    return d3
      .area<CpuDataPoint>()
      .x((_, i) => xScale(i))
      .y0(innerHeight)
      .y1((d) => yScale(d.usage))
      .curve(d3.curveMonotoneX);
  }, [xScale, yScale, innerHeight]);

  const linePath = lineGenerator(data) || '';
  const areaPath = areaGenerator(data) || '';

  return (
    <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800/80 space-y-2.5">
      {/* Metric Header & Mode Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Cpu className="w-3.5 h-3.5 text-[#D39E36]" />
          <span className="text-[11px] font-semibold text-neutral-800 dark:text-neutral-200">
            CPU Load (1h)
          </span>
          <span className="text-[10px] text-neutral-400 font-mono">
            {cpuCores} Cores
          </span>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800/70 p-0.5 rounded-md text-[10px]">
          <button
            type="button"
            onClick={() => setChartType('sparkline')}
            className={`px-1.5 py-0.5 rounded font-medium transition-colors ${
              chartType === 'sparkline'
                ? 'bg-white dark:bg-[#1a202c] text-neutral-900 dark:text-white shadow-2xs font-semibold'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
            title="Sparkline Area View"
          >
            Line
          </button>
          <button
            type="button"
            onClick={() => setChartType('bar')}
            className={`px-1.5 py-0.5 rounded font-medium transition-colors ${
              chartType === 'bar'
                ? 'bg-white dark:bg-[#1a202c] text-neutral-900 dark:text-white shadow-2xs font-semibold'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
            title="Bar Chart View"
          >
            Bars
          </button>
        </div>
      </div>

      {/* Real-time stats row */}
      <div className="flex items-baseline justify-between text-xs">
        <div className="flex items-baseline gap-1.5">
          <span className="text-base font-bold text-neutral-900 dark:text-white font-mono">
            {hoveredPoint ? `${hoveredPoint.usage}%` : `${currentUsage}%`}
          </span>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Normal
          </span>
        </div>

        <div className="text-[10px] text-neutral-400 font-mono">
          {hoveredPoint ? (
            <span className="text-neutral-700 dark:text-neutral-300 font-semibold">
              {hoveredPoint.time}
            </span>
          ) : (
            <span>avg: {avgUsage}% · peak: {maxUsage}%</span>
          )}
        </div>
      </div>

      {/* SVG Chart Container */}
      <div
        ref={containerRef}
        className="w-full bg-neutral-50/70 dark:bg-[#151922] rounded-lg p-2 border border-neutral-100 dark:border-neutral-800/80 relative"
      >
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-14 overflow-visible"
          onMouseLeave={() => setHoveredPoint(null)}
        >
          <defs>
            {/* Sparkline Gradient Fill */}
            <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#D39E36" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#D39E36" stopOpacity="0.0" />
            </linearGradient>

            {/* Bar Active Gradient */}
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#D39E36" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#D39E36" stopOpacity="0.4" />
            </linearGradient>
          </defs>

          <g transform={`translate(${margin.left}, ${margin.top})`}>
            {/* Horizontal guideline */}
            <line
              x1="0"
              y1={yScale(25)}
              x2={innerWidth}
              y2={yScale(25)}
              stroke="currentColor"
              strokeDasharray="2 3"
              className="text-neutral-200 dark:text-neutral-800"
              strokeWidth="1"
            />

            {chartType === 'sparkline' ? (
              <>
                {/* Area under curve */}
                <path d={areaPath} fill="url(#cpuGradient)" />

                {/* Main line curve */}
                <path
                  d={linePath}
                  fill="none"
                  stroke="#D39E36"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Data point markers on hover */}
                {data.map((d, i) => {
                  const cx = xScale(i);
                  const cy = yScale(d.usage);
                  const isHovered = hoveredPoint?.time === d.time;

                  return (
                    <g key={d.time}>
                      <circle
                        cx={cx}
                        cy={cy}
                        r={isHovered ? 4 : 2}
                        className={`transition-all ${
                          isHovered
                            ? 'fill-[#D39E36] stroke-white dark:stroke-[#11151f] stroke-2'
                            : 'fill-[#D39E36]/60'
                        }`}
                      />
                      {/* Invisible wider hit area for easy hover */}
                      <rect
                        x={cx - 10}
                        y="0"
                        width="20"
                        height={innerHeight}
                        fill="transparent"
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredPoint(d)}
                      />
                    </g>
                  );
                })}
              </>
            ) : (
              /* Bar Chart View */
              <g>
                {data.map((d, i) => {
                  const barWidth = Math.max(8, innerWidth / data.length - 4);
                  const x = xScale(i) - barWidth / 2;
                  const y = yScale(d.usage);
                  const barHeight = Math.max(3, innerHeight - y);
                  const isHovered = hoveredPoint?.time === d.time;

                  return (
                    <g key={d.time}>
                      <rect
                        x={x}
                        y={y}
                        width={barWidth}
                        height={barHeight}
                        rx="2"
                        className={`transition-colors cursor-pointer ${
                          isHovered
                            ? 'fill-[#D39E36]'
                            : 'fill-neutral-300 dark:fill-neutral-700 hover:fill-[#D39E36]/80'
                        }`}
                        onMouseEnter={() => setHoveredPoint(d)}
                      />
                    </g>
                  );
                })}
              </g>
            )}
          </g>
        </svg>

        {/* Timeline Bottom Axis */}
        <div className="flex items-center justify-between text-[9px] font-mono text-neutral-400 mt-1 px-1">
          <span>60m ago</span>
          <span>30m ago</span>
          <span className="text-[#D39E36] font-semibold">Now</span>
        </div>
      </div>
    </div>
  );
}

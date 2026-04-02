"use client";

import { useMemo } from "react";

export interface AreaChartDataPoint {
  label: string;
  value: number;
}

interface AreaChartProps {
  data: AreaChartDataPoint[];
  height?: number;
  color?: string;
  fillColor?: string;
  formatValue?: (v: number) => string;
  showGrid?: boolean;
  gridLines?: number;
  showDots?: boolean;
}

export function AreaChart({
  data,
  height = 200,
  color = "#3b82f6",
  fillColor = "rgba(59,130,246,0.1)",
  formatValue = (v) => v.toLocaleString(),
  showGrid = true,
  gridLines = 4,
  showDots = true,
}: AreaChartProps) {
  const maxValue = useMemo(
    () => Math.max(...data.map((d) => d.value), 1),
    [data]
  );

  const gridValues = useMemo(() => {
    if (!showGrid) return [];
    const step = maxValue / gridLines;
    return Array.from({ length: gridLines + 1 }, (_, i) =>
      Math.round(step * i)
    );
  }, [maxValue, showGrid, gridLines]);

  const svgWidth = 600;
  const svgHeight = height;
  const paddingLeft = 40;
  const paddingRight = 10;
  const paddingTop = 10;
  const paddingBottom = 30;
  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  const points = useMemo(() => {
    if (data.length === 0) return [];
    return data.map((d, i) => ({
      x: paddingLeft + (i / Math.max(data.length - 1, 1)) * chartWidth,
      y: paddingTop + chartHeight - (d.value / maxValue) * chartHeight,
      ...d,
    }));
  }, [data, maxValue, chartWidth, chartHeight]);

  const linePath = useMemo(() => {
    if (points.length === 0) return "";
    return points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  }, [points]);

  const areaPath = useMemo(() => {
    if (points.length === 0) return "";
    const bottom = paddingTop + chartHeight;
    return `${linePath} L ${points[points.length - 1].x} ${bottom} L ${points[0].x} ${bottom} Z`;
  }, [linePath, points, chartHeight]);

  if (data.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-sm text-gray-400"
        style={{ height }}
      >
        데이터가 없습니다
      </div>
    );
  }

  return (
    <svg
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      className="w-full"
      style={{ height }}
      preserveAspectRatio="none"
    >
      {/* Grid lines */}
      {showGrid &&
        gridValues.map((val, i) => {
          const y =
            paddingTop + chartHeight - (val / maxValue) * chartHeight;
          return (
            <g key={i}>
              <line
                x1={paddingLeft}
                y1={y}
                x2={svgWidth - paddingRight}
                y2={y}
                stroke="#f3f4f6"
                strokeWidth={1}
              />
              <text
                x={paddingLeft - 4}
                y={y + 3}
                textAnchor="end"
                className="fill-gray-400"
                fontSize={10}
              >
                {formatValue(val)}
              </text>
            </g>
          );
        })}

      {/* Area fill */}
      <path d={areaPath} fill={fillColor} />

      {/* Line */}
      <path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* Dots + labels */}
      {showDots &&
        points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={3} fill="white" stroke={color} strokeWidth={2} />
            <title>
              {p.label}: {formatValue(p.value)}
            </title>
          </g>
        ))}

      {/* X-axis labels */}
      {points.map((p, i) => {
        const showLabel =
          data.length <= 12 ||
          i === 0 ||
          i === data.length - 1 ||
          i % Math.ceil(data.length / 8) === 0;
        if (!showLabel) return null;
        return (
          <text
            key={i}
            x={p.x}
            y={svgHeight - 5}
            textAnchor="middle"
            className="fill-gray-500"
            fontSize={10}
          >
            {p.label}
          </text>
        );
      })}
    </svg>
  );
}

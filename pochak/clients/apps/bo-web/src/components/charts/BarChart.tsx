"use client";

import { useMemo } from "react";

export interface BarChartDataPoint {
  label: string;
  value: number;
}

interface BarChartProps {
  data: BarChartDataPoint[];
  height?: number;
  color?: string;
  hoverColor?: string;
  formatValue?: (v: number) => string;
  showGrid?: boolean;
  gridLines?: number;
}

export function BarChart({
  data,
  height = 200,
  color = "#3b82f6",
  hoverColor = "#2563eb",
  formatValue = (v) => v.toLocaleString(),
  showGrid = true,
  gridLines = 4,
}: BarChartProps) {
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
    <div className="relative" style={{ height }}>
      {/* Grid lines */}
      {showGrid &&
        gridValues.map((val, i) => {
          const bottom = (val / maxValue) * 100;
          return (
            <div
              key={i}
              className="absolute left-8 right-0 border-t border-gray-100"
              style={{ bottom: `${bottom}%` }}
            >
              <span
                className="absolute text-[10px] text-gray-400"
                style={{ left: -32, top: -7 }}
              >
                {formatValue(val)}
              </span>
            </div>
          );
        })}

      {/* Bars */}
      <div
        className="absolute bottom-0 left-8 right-0 flex items-end"
        style={{ height: "100%", gap: data.length > 15 ? 1 : 4 }}
      >
        {data.map((d) => {
          const heightPct = (d.value / maxValue) * 100;
          return (
            <div
              key={d.label}
              className="group relative flex flex-1 flex-col items-center"
              style={{ height: "100%" }}
            >
              {/* Tooltip */}
              <div
                className="pointer-events-none absolute z-10 rounded-md px-2 py-1 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100"
                style={{
                  backgroundColor: "#1f2937",
                  bottom: `${Math.min(heightPct + 4, 90)}%`,
                  whiteSpace: "nowrap",
                }}
              >
                {d.label}: {formatValue(d.value)}
              </div>
              {/* Bar */}
              <div
                className="absolute bottom-0 w-full rounded-t transition-colors"
                style={{
                  height: `${heightPct}%`,
                  minHeight: d.value > 0 ? 2 : 0,
                  backgroundColor: color,
                  maxWidth: 48,
                  left: "50%",
                  transform: "translateX(-50%)",
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.backgroundColor = hoverColor;
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.backgroundColor = color;
                }}
              />
            </div>
          );
        })}
      </div>

      {/* X-axis labels */}
      <div
        className="absolute left-8 right-0 flex"
        style={{ bottom: -20, gap: data.length > 15 ? 1 : 4 }}
      >
        {data.map((d, i) => {
          // Show subset of labels if too many
          const showLabel =
            data.length <= 12 ||
            i === 0 ||
            i === data.length - 1 ||
            i % Math.ceil(data.length / 8) === 0;
          return (
            <div key={d.label} className="flex-1 text-center">
              {showLabel && (
                <span className="text-[10px] text-gray-500">{d.label}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

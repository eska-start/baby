"use client";

import { GrowthRecord } from "@/lib/data";
import { useRecords } from "@/app/providers";

type Props = {
  metric?: "height" | "weight";
  height?: number;
  showAxis?: boolean;
  showAverage?: boolean;
  records?: GrowthRecord[];
};

export function GrowthChart({ metric = "height", height = 280, showAxis = true, showAverage = true, records: recordsProp }: Props) {
  const { records: ctxRecords } = useRecords();
  const data = recordsProp ?? ctxRecords;
  const values = data.map((r) => (metric === "height" ? r.height : r.weight));
  const minV = Math.min(...values) - (metric === "height" ? 1.5 : 0.6);
  const maxV = Math.max(...values) + (metric === "height" ? 1.5 : 0.6);
  const w = 920;
  const h = height;
  const padL = 38;
  const padR = 22;
  const padT = 16;
  const padB = 22;
  const innerW = w - padL - padR;
  const innerH = h - padT - padB;
  const xStep = innerW / (data.length - 1);
  const yFor = (v: number) => padT + innerH * (1 - (v - minV) / (maxV - minV));
  const xFor = (i: number) => padL + i * xStep;
  const path = data
    .map((r, i) => `${i === 0 ? "M" : "L"} ${xFor(i)} ${yFor(metric === "height" ? r.height : r.weight)}`)
    .join(" ");
  // Mock P50 reference using the first/last reading drift.
  const p50 = data
    .map((_, i) => {
      const start = values[0] + (metric === "height" ? -0.3 : 0.1);
      const slope = (values[values.length - 1] - values[0]) / (data.length - 1);
      const v = start + i * (slope * 0.85);
      return `${i === 0 ? "M" : "L"} ${xFor(i)} ${yFor(v)}`;
    })
    .join(" ");
  const last = data[data.length - 1];
  const lastX = xFor(data.length - 1);
  const lastY = yFor(metric === "height" ? last.height : last.weight);

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      width="100%"
      style={{ display: "block", height: "auto" }}
    >
      <defs>
        <linearGradient id={`area-${metric}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#D77B50" stopOpacity="0.18" />
          <stop offset="1" stopColor="#D77B50" stopOpacity="0" />
        </linearGradient>
      </defs>
      {showAxis && (
        <g>
          {[0, 1, 2, 3, 4].map((i) => {
            const yy = padT + (innerH * i) / 4;
            const v = maxV - ((maxV - minV) * i) / 4;
            return (
              <g key={i}>
                <line x1={padL} x2={w - padR} y1={yy} y2={yy} stroke="rgba(31,26,20,0.08)" />
                <text
                  x={padL - 6}
                  y={yy + 3}
                  fontSize="10"
                  textAnchor="end"
                  fill="#8B8377"
                  fontFamily="JetBrains Mono"
                >
                  {v.toFixed(metric === "height" ? 0 : 1)}
                </text>
              </g>
            );
          })}
        </g>
      )}
      {showAverage && (
        <path d={p50} stroke="#8B8377" strokeWidth="1.5" fill="none" strokeDasharray="4 5" opacity="0.45" />
      )}
      <path
        d={`${path} L ${xFor(data.length - 1)} ${h - padB} L ${xFor(0)} ${h - padB} Z`}
        fill={`url(#area-${metric})`}
      />
      <path d={path} stroke="#D77B50" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {data.map((r, i) => {
        const x = xFor(i);
        const y = yFor(metric === "height" ? r.height : r.weight);
        const isLast = i === data.length - 1;
        return (
          <g key={i}>
            <circle
              cx={x}
              cy={y}
              r={isLast ? 6 : 3.5}
              fill="#FFFFFF"
              stroke="#D77B50"
              strokeWidth={isLast ? 2.5 : 2}
            />
            {isLast && <circle cx={x} cy={y} r={2.5} fill="#D77B50" />}
          </g>
        );
      })}
      {/* last value label */}
      <g transform={`translate(${lastX - 38}, ${Math.max(8, lastY - 30)})`}>
        <rect width="76" height="22" rx="11" fill="#1F1A14" />
        <text
          x="38"
          y="14.5"
          fontSize="11"
          fontFamily="JetBrains Mono"
          textAnchor="middle"
          fill="#FFFFFF"
        >
          {(metric === "height" ? last.height : last.weight).toFixed(1)} {metric === "height" ? "cm" : "kg"}
        </text>
      </g>
    </svg>
  );
}

"use client"

import { useState } from "react"

export function LotesPorMesChart({ data }: { data: { label: string; value: number }[] }) {
  const [hovered, setHovered] = useState<number | null>(null)
  const max = Math.max(1, ...data.map((d) => d.value))
  const width = 560
  const height = 180
  const paddingLeft = 8
  const paddingBottom = 24
  const chartHeight = height - paddingBottom
  const barGap = 12
  const barWidth = (width - paddingLeft * 2 - barGap * (data.length - 1)) / data.length

  return (
    <div className="relative w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full min-w-[420px]"
        role="img"
        aria-label="Lotes criados por mês"
      >
        <line
          x1={0}
          y1={chartHeight}
          x2={width}
          y2={chartHeight}
          className="stroke-border"
          strokeWidth={1}
        />
        {data.map((d, i) => {
          const barHeight = (d.value / max) * (chartHeight - 16)
          const x = paddingLeft + i * (barWidth + barGap)
          const y = chartHeight - barHeight
          const isHovered = hovered === i
          return (
            <g
              key={d.label}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              className="cursor-default"
            >
              <rect
                x={x}
                y={0}
                width={barWidth}
                height={chartHeight}
                fill="transparent"
              />
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(barHeight, d.value > 0 ? 3 : 0)}
                rx={4}
                className={isHovered ? "fill-primary" : "fill-primary/80"}
              />
              {isHovered && (
                <text
                  x={x + barWidth / 2}
                  y={y - 8}
                  textAnchor="middle"
                  className="fill-foreground text-[11px] font-medium"
                >
                  {d.value}
                </text>
              )}
              <text
                x={x + barWidth / 2}
                y={height - 4}
                textAnchor="middle"
                className="fill-muted-foreground text-[10px] capitalize"
              >
                {d.label}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

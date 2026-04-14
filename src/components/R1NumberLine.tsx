import { useState, useMemo } from 'react'

const PHI = (1 + Math.sqrt(5)) / 2

function frac(x: number): number {
  return x - Math.floor(x)
}

const W = 624
const H = 48
const PAD = 16

export default function R1NumberLine() {
  const [count, setCount] = useState(10)

  const points = useMemo(
    () =>
      Array.from({ length: count }, (_, n) => frac(n * (1 / PHI) + 0.5)),
    [count],
  )

  const pct = ((count - 1) / 99) * 100
  const inner = W - PAD * 2

  return (
    <div className="my-8 flex flex-col gap-4 rounded-lg border border-border bg-[#111113] p-6">
      <span className="font-mono text-[10px] tracking-widest uppercase text-[rgba(139,180,255,0.8)]">
        R1 Sequence
      </span>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="mx-auto block w-full"
        style={{ maxWidth: W }}
      >
        {/* axis line */}
        <line
          x1={PAD}
          y1={H / 2}
          x2={W - PAD}
          y2={H / 2}
          stroke="rgba(255,255,255,0.12)"
          strokeWidth={1}
        />

        {/* ticks at 0 and 1 */}
        <line
          x1={PAD}
          y1={H / 2 - 6}
          x2={PAD}
          y2={H / 2 + 6}
          stroke="rgba(255,255,255,0.2)"
          strokeWidth={1}
        />
        <line
          x1={W - PAD}
          y1={H / 2 - 6}
          x2={W - PAD}
          y2={H / 2 + 6}
          stroke="rgba(255,255,255,0.2)"
          strokeWidth={1}
        />
        <text
          x={PAD}
          y={H / 2 + 18}
          textAnchor="middle"
          fill="rgba(255,255,255,0.3)"
          fontSize={9}
          fontFamily="Geist Mono, ui-monospace, monospace"
        >
          0
        </text>
        <text
          x={W - PAD}
          y={H / 2 + 18}
          textAnchor="middle"
          fill="rgba(255,255,255,0.3)"
          fontSize={9}
          fontFamily="Geist Mono, ui-monospace, monospace"
        >
          1
        </text>

        {/* points */}
        {points.map((x, i) => (
          <circle
            key={i}
            cx={PAD + x * inner}
            cy={H / 2}
            r={4}
            fill="rgba(139, 180, 255, 0.6)"
          />
        ))}
      </svg>

      <div className="flex flex-col gap-2">
        <div className="flex justify-between font-mono text-[11px] text-muted-foreground">
          <span>1</span>
          <span className="text-foreground">
            n = <span className="font-medium">{count}</span>
          </span>
          <span>100</span>
        </div>
        <input
          type="range"
          min={1}
          max={100}
          value={count}
          onChange={(e) => setCount(Number(e.target.value))}
          className="qr-slider w-full cursor-pointer"
          style={{ '--pct': `${pct}%` } as React.CSSProperties}
        />
      </div>

      <style>{`
        .qr-slider {
          -webkit-appearance: none;
          appearance: none;
          height: 2px;
          border-radius: 1px;
          background: linear-gradient(
            to right,
            rgba(255,255,255,0.45) var(--pct),
            rgba(255,255,255,0.1) var(--pct)
          );
          outline: none;
        }
        .qr-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: rgba(255,255,255,0.85);
          border: none;
          cursor: pointer;
        }
        .qr-slider::-moz-range-thumb {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: rgba(255,255,255,0.85);
          border: none;
          cursor: pointer;
        }
      `}</style>
    </div>
  )
}

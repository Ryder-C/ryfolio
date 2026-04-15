import { useState, useMemo } from 'react'

const PHI = (1 + Math.sqrt(5)) / 2
const PLASTIC = 1.32471795724474602596

function frac(x: number): number {
  return x - Math.floor(x)
}

const SIZE = 300
const R = 3

function ScatterPlot({
  points,
  color,
  label,
}: {
  points: [number, number][]
  color: string
  label: string
}) {
  return (
    <div className="flex flex-col gap-2">
      <span
        className="font-mono text-[10px] tracking-widest uppercase"
        style={{ color }}
      >
        {label}
      </span>
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        width={SIZE}
        height={SIZE}
        className="border-border block rounded border bg-[#0c0c0e]"
      >
        {/* grid */}
        {[1, 2, 3].map((i) => (
          <g key={i} stroke="rgba(255,255,255,0.04)" strokeWidth={0.5}>
            <line x1={(i / 4) * SIZE} y1={0} x2={(i / 4) * SIZE} y2={SIZE} />
            <line y1={(i / 4) * SIZE} x1={0} y2={(i / 4) * SIZE} x2={SIZE} />
          </g>
        ))}

        {/* points */}
        {points.map(([x, y], i) => (
          <circle key={i} cx={x * SIZE} cy={y * SIZE} r={R} fill={color} />
        ))}
      </svg>
    </div>
  )
}

export default function QuasirandomComparison() {
  const [count, setCount] = useState(3)

  const r1 = useMemo<[number, number][]>(() => {
    const a = 1 / PHI
    return Array.from({ length: count }, (_, n) => [
      frac(n * a + 0.5),
      frac(n * a),
    ])
  }, [count])

  const r2 = useMemo<[number, number][]>(() => {
    const a1 = 1 / PLASTIC
    const a2 = 1 / (PLASTIC * PLASTIC)
    return Array.from({ length: count }, (_, n) => [
      frac(n * a1 + 0.5),
      frac(n * a2 + 0.5),
    ])
  }, [count])

  const pct = ((count - 1) / 499) * 100

  return (
    <div className="border-border my-8 flex flex-col gap-5 rounded-lg border bg-[#111113] p-6">
      <div className="flex flex-wrap justify-center gap-6">
        <ScatterPlot
          points={r1}
          color="rgba(139, 180, 255, 0.6)"
          label="Two R1 Sequences"
        />
        <ScatterPlot
          points={r2}
          color="rgba(200, 140, 255, 0.6)"
          label="R2 Sequence"
        />
      </div>

      <div className="mx-auto flex w-full max-w-[624px] flex-col gap-2">
        <div className="text-muted-foreground flex justify-between font-mono text-[11px]">
          <span>1</span>
          <span className="text-foreground">
            n = <span className="font-medium">{count}</span>
          </span>
          <span>500</span>
        </div>
        <input
          type="range"
          min={1}
          max={500}
          value={count}
          onChange={(e) => setCount(Number(e.target.value))}
          className="qr-slider w-full cursor-pointer"
          style={
            {
              '--pct': `${pct}%`,
            } as React.CSSProperties
          }
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

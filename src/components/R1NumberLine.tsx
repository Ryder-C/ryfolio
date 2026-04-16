import { useState, useMemo, useEffect } from 'react'

const PHI = (1 + Math.sqrt(5)) / 2

function frac(x: number): number {
  return x - Math.floor(x)
}

const W = 624
const H = 48
const PAD = 16

function useTheme() {
  const [theme, setTheme] = useState('light')

  useEffect(() => {
    setTheme(document.documentElement.getAttribute('data-theme') ?? 'light')
    const observer = new MutationObserver(() => {
      setTheme(document.documentElement.getAttribute('data-theme') ?? 'light')
    })
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    })
    return () => observer.disconnect()
  }, [])

  return theme
}

export default function R1NumberLine() {
  const [count, setCount] = useState(3)
  const theme = useTheme()
  const isDark = theme === 'dark'

  const points = useMemo(
    () => Array.from({ length: count }, (_, n) => frac(n * (1 / PHI) + 0.5)),
    [count],
  )

  const pct = ((count - 1) / 99) * 100
  const inner = W - PAD * 2

  const axisColor = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'
  const tickColor = isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.18)'
  const labelColor = isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.35)'
  const pointColor = isDark ? 'rgba(139,180,255,0.6)' : 'rgba(59,130,246,0.7)'
  const accentColor = isDark ? 'rgba(139,180,255,0.8)' : 'rgba(37,99,235,0.85)'
  const bgColor = isDark ? '#111113' : '#f8f8fa'
  const sliderFill = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)'
  const sliderTrack = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
  const sliderThumb = isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.7)'

  return (
    <div
      className="border-border my-8 flex flex-col gap-4 rounded-lg border p-6"
      style={
        {
          background: bgColor,
          '--slider-fill': sliderFill,
          '--slider-track': sliderTrack,
          '--slider-thumb': sliderThumb,
        } as React.CSSProperties
      }
    >
      <span
        className="font-mono text-[10px] tracking-widest uppercase"
        style={{ color: accentColor }}
      >
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
          stroke={axisColor}
          strokeWidth={1}
        />

        {/* ticks at 0 and 1 */}
        <line
          x1={PAD}
          y1={H / 2 - 6}
          x2={PAD}
          y2={H / 2 + 6}
          stroke={tickColor}
          strokeWidth={1}
        />
        <line
          x1={W - PAD}
          y1={H / 2 - 6}
          x2={W - PAD}
          y2={H / 2 + 6}
          stroke={tickColor}
          strokeWidth={1}
        />
        <text
          x={PAD}
          y={H / 2 + 18}
          textAnchor="middle"
          fill={labelColor}
          fontSize={9}
          fontFamily="Geist Mono, ui-monospace, monospace"
        >
          0
        </text>
        <text
          x={W - PAD}
          y={H / 2 + 18}
          textAnchor="middle"
          fill={labelColor}
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
            fill={pointColor}
          />
        ))}
      </svg>

      <div className="flex flex-col gap-2">
        <div className="text-muted-foreground flex justify-between font-mono text-[11px]">
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
            var(--slider-fill) var(--pct),
            var(--slider-track) var(--pct)
          );
          outline: none;
        }
        .qr-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: var(--slider-thumb);
          border: none;
          cursor: pointer;
        }
        .qr-slider::-moz-range-thumb {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: var(--slider-thumb);
          border: none;
          cursor: pointer;
        }
      `}</style>
    </div>
  )
}

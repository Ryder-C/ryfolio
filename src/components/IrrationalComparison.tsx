import { useState, useMemo, useEffect } from 'react'

const PHI = (1 + Math.sqrt(5)) / 2

function frac(x: number): number {
  return x - Math.floor(x)
}

const W = 624
const H = 280
const PAD_X = 20
const PAD_TOP = 24
const PAD_BOTTOM = 28

const MAX_N = 1000

const ALPHAS = [
  { label: '1/4', value: 0.25 },
  { label: '1/π', value: 1 / Math.PI },
  { label: '1/√2', value: 1 / Math.SQRT2 },
  { label: '1/φ', value: 1 / PHI },
]

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

export default function IrrationalComparison() {
  const [alphaIdx, setAlphaIdx] = useState(3)
  const [count, setCount] = useState(60)
  const theme = useTheme()
  const isDark = theme === 'dark'

  const alpha = ALPHAS[alphaIdx].value
  const points = useMemo(
    () => Array.from({ length: count }, (_, n) => frac((n + 1) * alpha)),
    [count, alpha],
  )

  const pct = ((count - 1) / (MAX_N - 1)) * 100
  const innerW = W - PAD_X * 2
  const innerH = H - PAD_TOP - PAD_BOTTOM

  const axisColor = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'
  const tickColor = isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.18)'
  const labelColor = isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.35)'
  const pointColor = isDark ? 'rgba(139,180,255,0.55)' : 'rgba(59,130,246,0.6)'
  const accentColor = isDark ? 'rgba(139,180,255,0.8)' : 'rgba(37,99,235,0.85)'
  const bgColor = 'color-mix(in oklab, var(--muted) 25%, transparent)'
  const sliderFill = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)'
  const sliderTrack = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
  const sliderThumb = isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.7)'
  const btnBorder = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
  const btnActiveBackground = isDark
    ? 'rgba(255,255,255,0.12)'
    : 'rgba(0,0,0,0.08)'
  const btnActiveColor = isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.85)'
  const btnInactiveColor = isDark
    ? 'rgba(255,255,255,0.35)'
    : 'rgba(0,0,0,0.35)'

  return (
    <div
      className="border-border my-8 flex flex-col gap-5 rounded-lg border p-6"
      style={
        {
          background: bgColor,
          '--slider-fill': sliderFill,
          '--slider-track': sliderTrack,
          '--slider-thumb': sliderThumb,
        } as React.CSSProperties
      }
    >
      <div className="flex flex-wrap items-center gap-2">
        <span
          className="font-mono text-[11px] tracking-wider"
          style={{ color: accentColor }}
        >
          α =
        </span>
        {ALPHAS.map((a, i) => (
          <button
            key={i}
            onClick={() => setAlphaIdx(i)}
            className="rounded border px-3 py-1 font-mono text-[11px] tracking-wider transition-colors"
            style={{
              background: i === alphaIdx ? btnActiveBackground : 'transparent',
              borderColor: btnBorder,
              color: i === alphaIdx ? btnActiveColor : btnInactiveColor,
              cursor: 'pointer',
            }}
          >
            {a.label}
          </button>
        ))}
        <span
          className="ml-auto font-mono text-[11px] tracking-wider"
          style={{ color: labelColor }}
        >
          ≈ {ALPHAS[alphaIdx].value.toFixed(4)}
        </span>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="mx-auto block w-full"
        style={{ maxWidth: W }}
      >
        {/* top x-axis */}
        <line
          x1={PAD_X}
          y1={PAD_TOP}
          x2={W - PAD_X}
          y2={PAD_TOP}
          stroke={axisColor}
          strokeWidth={1}
        />

        {/* end ticks */}
        <line
          x1={PAD_X}
          y1={PAD_TOP - 4}
          x2={PAD_X}
          y2={PAD_TOP + 4}
          stroke={tickColor}
          strokeWidth={1}
        />
        <line
          x1={W - PAD_X}
          y1={PAD_TOP - 4}
          x2={W - PAD_X}
          y2={PAD_TOP + 4}
          stroke={tickColor}
          strokeWidth={1}
        />

        {/* x-axis labels */}
        <text
          x={PAD_X}
          y={PAD_TOP - 8}
          textAnchor="middle"
          fill={labelColor}
          fontSize={9}
          fontFamily="Geist Mono, ui-monospace, monospace"
        >
          0
        </text>
        <text
          x={W - PAD_X}
          y={PAD_TOP - 8}
          textAnchor="middle"
          fill={labelColor}
          fontSize={9}
          fontFamily="Geist Mono, ui-monospace, monospace"
        >
          1
        </text>
        <text
          x={W / 2}
          y={PAD_TOP - 8}
          textAnchor="middle"
          fill={labelColor}
          fontSize={9}
          fontFamily="Geist Mono, ui-monospace, monospace"
        >
          x_n
        </text>

        {/* y-axis labels (n grows downward) */}
        <text
          x={PAD_X - 6}
          y={PAD_TOP + 4}
          textAnchor="end"
          fill={labelColor}
          fontSize={9}
          fontFamily="Geist Mono, ui-monospace, monospace"
        >
          1
        </text>
        <text
          x={PAD_X - 6}
          y={H - PAD_BOTTOM}
          textAnchor="end"
          fill={labelColor}
          fontSize={9}
          fontFamily="Geist Mono, ui-monospace, monospace"
        >
          {count}
        </text>
        <text
          x={PAD_X - 6}
          y={(PAD_TOP + (H - PAD_BOTTOM)) / 2}
          textAnchor="end"
          fill={labelColor}
          fontSize={9}
          fontFamily="Geist Mono, ui-monospace, monospace"
        >
          n
        </text>

        {/* points: x_n on x-axis, n stepping downward */}
        {points.map((x, i) => {
          const cx = PAD_X + x * innerW
          const cy = PAD_TOP + ((i + 0.5) / count) * innerH
          return <circle key={i} cx={cx} cy={cy} r={2} fill={pointColor} />
        })}
      </svg>

      <div className="mx-auto flex w-full max-w-[624px] flex-col gap-2">
        <div className="text-muted-foreground flex justify-between font-mono text-[11px]">
          <span>1</span>
          <span className="text-foreground">
            n = <span className="font-medium">{count}</span>
          </span>
          <span>{MAX_N}</span>
        </div>
        <input
          type="range"
          min={1}
          max={MAX_N}
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

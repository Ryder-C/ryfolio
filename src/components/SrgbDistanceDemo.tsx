import { useEffect, useState } from 'react'

function useTheme() {
  const [theme, setTheme] = useState('light')
  useEffect(() => {
    setTheme(document.documentElement.getAttribute('data-theme') ?? 'light')
    const obs = new MutationObserver(() =>
      setTheme(document.documentElement.getAttribute('data-theme') ?? 'light'),
    )
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    })
    return () => obs.disconnect()
  }, [])
  return theme
}

function hexToRgb01(hex: string): [number, number, number] {
  return [
    parseInt(hex.slice(1, 3), 16) / 255,
    parseInt(hex.slice(3, 5), 16) / 255,
    parseInt(hex.slice(5, 7), 16) / 255,
  ]
}




// Both pairs have equal sRGB Euclidean distance (delta = 38/255 per channel)
const PAIR_A = { label: 'dark pair', c1: '#000000', c2: '#262626' }
const PAIR_B = { label: 'bright pair', c1: '#d9d9d9', c2: '#ffffff' }

const W = 560
const H = 160
const PAD_X = 48
const BAR_Y = 90
const BAR_H = 32
const BRACKET_Y = 44

export default function SrgbDistanceDemo() {
  const theme = useTheme()
  const isDark = theme === 'dark'

  const bgColor = 'color-mix(in oklab, var(--muted) 25%, transparent)'
  const labelColor = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)'
  const accentColor = isDark ? 'rgba(139,180,255,0.8)' : 'rgba(37,99,235,0.85)'
  const tickColor = isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.2)'

  const barW = W - PAD_X * 2

  // Dark pair spans [0, 38/255] of the normalized 0-1 axis → positions on bar
  const darkStart = 0
  const darkEnd = 38 / 255
  const brightStart = (255 - 38) / 255
  const brightEnd = 1

  function toX(t: number) {
    return PAD_X + t * barW
  }

  const gradientId = 'gray-gradient'
  const clipId = 'bar-clip'


  // Bracket path helpers
  function bracket(x1: number, x2: number, y: number, tickH = 8): string {
    const mid = (x1 + x2) / 2
    return `M${x1},${y + tickH} L${x1},${y} L${x2},${y} L${x2},${y + tickH} M${mid},${y}`
  }

  return (
    <div
      className="border-border my-8 flex flex-col gap-4 rounded-lg border p-6"
      style={{ background: bgColor }}
    >
      <span
        className="font-mono text-[10px] tracking-widest uppercase"
        style={{ color: accentColor }}
      >
        sRGB distance
      </span>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="block w-full"
        style={{ overflow: 'visible' }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#000000" />
            <stop offset="100%" stopColor="#ffffff" />
          </linearGradient>
          <clipPath id={clipId}>
            <rect x={PAD_X} y={BAR_Y} width={barW} height={BAR_H} rx={4} />
          </clipPath>
        </defs>

        {/* grayscale bar */}
        <rect
          x={PAD_X}
          y={BAR_Y}
          width={barW}
          height={BAR_H}
          rx={4}
          fill={`url(#${gradientId})`}
        />

        {/* axis ticks and labels */}
        {[0, 0.25, 0.5, 0.75, 1].map((t) => (
          <g key={t}>
            <line
              x1={toX(t)}
              y1={BAR_Y + BAR_H}
              x2={toX(t)}
              y2={BAR_Y + BAR_H + 5}
              stroke={tickColor}
              strokeWidth={1}
            />
            <text
              x={toX(t)}
              y={BAR_Y + BAR_H + 16}
              textAnchor="middle"
              fill={labelColor}
              fontSize={9}
              fontFamily="Geist Mono, ui-monospace, monospace"
            >
              {t === 0 ? '0' : t === 1 ? '1' : t.toString()}
            </text>
          </g>
        ))}

        {/* dark pair bracket */}
        <path
          d={bracket(toX(darkStart), toX(darkEnd), BRACKET_Y)}
          fill="none"
          stroke={isDark ? 'rgba(252,165,165,0.85)' : 'rgba(220,38,38,0.8)'}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* bright pair bracket */}
        <path
          d={bracket(toX(brightStart), toX(brightEnd), BRACKET_Y)}
          fill="none"
          stroke={isDark ? 'rgba(139,180,255,0.85)' : 'rgba(37,99,235,0.8)'}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* dark pair color swatches */}
        <rect
          x={toX(darkStart) - 10}
          y={BRACKET_Y - 22}
          width={10}
          height={14}
          rx={2}
          fill={PAIR_A.c1}
          stroke={isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'}
          strokeWidth={0.5}
        />
        <rect
          x={toX(darkEnd)}
          y={BRACKET_Y - 22}
          width={10}
          height={14}
          rx={2}
          fill={PAIR_A.c2}
          stroke={isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'}
          strokeWidth={0.5}
        />

        {/* bright pair color swatches */}
        <rect
          x={toX(brightStart) - 10}
          y={BRACKET_Y - 22}
          width={10}
          height={14}
          rx={2}
          fill={PAIR_B.c1}
          stroke={isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'}
          strokeWidth={0.5}
        />
        <rect
          x={toX(brightEnd)}
          y={BRACKET_Y - 22}
          width={10}
          height={14}
          rx={2}
          fill={PAIR_B.c2}
          stroke={isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'}
          strokeWidth={0.5}
        />

        {/* dark pair label */}
        <text
          x={(toX(darkStart) + toX(darkEnd)) / 2}
          y={BRACKET_Y - 28}
          textAnchor="middle"
          fill={isDark ? 'rgba(252,165,165,0.75)' : 'rgba(220,38,38,0.75)'}
          fontSize={8.5}
          fontFamily="Geist Mono, ui-monospace, monospace"
        >
          looks different
        </text>

        {/* bright pair label */}
        <text
          x={(toX(brightStart) + toX(brightEnd)) / 2}
          y={BRACKET_Y - 28}
          textAnchor="middle"
          fill={isDark ? 'rgba(139,180,255,0.75)' : 'rgba(37,99,235,0.75)'}
          fontSize={8.5}
          fontFamily="Geist Mono, ui-monospace, monospace"
        >
          looks similar
        </text>
      </svg>

    </div>
  )
}

import { useMemo, useEffect, useState } from 'react'

// ─── theme ─────────────────────────────────────────────────────────────────────

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

// ─── expression compiler ───────────────────────────────────────────────────────

const MATH_PRELUDE = `
  const {sin,cos,tan,asin,acos,atan,atan2,sinh,cosh,tanh,
         sqrt,cbrt,abs,log,log2,log10,exp,pow,sign,
         floor,ceil,round,min,max,hypot,PI,E} = Math;
  const pi = Math.PI, e = Math.E, tau = 2 * Math.PI;
`

function compile(expr: string): ((x: number) => number) | null {
  if (!expr.trim()) return null
  try {
    const fn = new Function(
      'x',
      `"use strict"; ${MATH_PRELUDE} return (${expr.replace(/\^/g, '**')});`,
    ) as (x: number) => number
    fn(1)
    return fn
  } catch {
    return null
  }
}

// ─── types ─────────────────────────────────────────────────────────────────────

export interface FnSpec {
  /** Expression string, e.g. "sin(x)", "x^2", "x < 0 ? -x : x" */
  expr: string
  color?: number // palette index; defaults to position in array
  label?: string
}

export interface FunctionGrapherProps {
  functions: FnSpec[]
  xMin?: number
  xMax?: number
  yMin?: number
  yMax?: number
}

// ─── color palette ─────────────────────────────────────────────────────────────

const PALETTE_LIGHT = [
  'rgba(59,130,246,0.85)',
  'rgba(16,185,129,0.85)',
  'rgba(239,68,68,0.85)',
  'rgba(234,179,8,0.85)',
  'rgba(139,92,246,0.85)',
  'rgba(236,72,153,0.85)',
  'rgba(20,184,166,0.85)',
  'rgba(245,158,11,0.85)',
]

const PALETTE_DARK = [
  'rgba(139,180,255,0.85)',
  'rgba(110,231,183,0.85)',
  'rgba(252,165,165,0.85)',
  'rgba(253,224,71,0.85)',
  'rgba(196,181,253,0.85)',
  'rgba(244,114,182,0.85)',
  'rgba(94,234,212,0.85)',
  'rgba(251,191,36,0.85)',
]

// ─── constants ─────────────────────────────────────────────────────────────────

const W = 600
const H = 380
const PAD = 44
const SAMPLES = 700

// ─── grid ticks ────────────────────────────────────────────────────────────────

function niceTicks(min: number, max: number, target = 7): number[] {
  const range = max - min
  const rough = range / target
  const mag = Math.pow(10, Math.floor(Math.log10(rough)))
  const step = [1, 2, 5, 10].map((s) => s * mag).find((s) => s >= rough) ?? mag
  const start = Math.ceil(min / step) * step
  const ticks: number[] = []
  for (let t = start; t <= max + 1e-9; t = parseFloat((t + step).toPrecision(12))) {
    ticks.push(parseFloat(t.toPrecision(10)))
  }
  return ticks
}

function fmtTick(n: number): string {
  if (n === 0) return '0'
  if (Math.abs(n) >= 1e4 || (Math.abs(n) < 1e-2 && n !== 0)) return n.toExponential(1)
  return parseFloat(n.toPrecision(4)).toString()
}

// ─── coordinate transforms ─────────────────────────────────────────────────────

type View = { xMin: number; xMax: number; yMin: number; yMax: number }

function toSx(x: number, v: View): number {
  return PAD + ((x - v.xMin) / (v.xMax - v.xMin)) * (W - PAD * 2)
}

function toSy(y: number, v: View): number {
  return PAD + ((v.yMax - y) / (v.yMax - v.yMin)) * (H - PAD * 2)
}

// ─── path builder ──────────────────────────────────────────────────────────────

function buildPath(fn: (x: number) => number, v: View): string {
  const dx = (v.xMax - v.xMin) / SAMPLES
  const yRange = v.yMax - v.yMin
  const parts: string[] = []
  let pen = false

  for (let i = 0; i <= SAMPLES; i++) {
    const x = v.xMin + i * dx
    let y: number
    try {
      y = fn(x)
    } catch {
      y = NaN
    }

    if (!isFinite(y) || y > v.yMax + yRange || y < v.yMin - yRange) {
      pen = false
      continue
    }

    const px = toSx(x, v).toFixed(2)
    const py = toSy(y, v).toFixed(2)
    parts.push(pen ? `L${px},${py}` : `M${px},${py}`)
    pen = true
  }

  return parts.join(' ')
}

// ─── component ─────────────────────────────────────────────────────────────────

export default function FunctionGrapher({
  functions,
  xMin = -7,
  xMax = 7,
  yMin = -4,
  yMax = 4,
}: FunctionGrapherProps) {
  const theme = useTheme()
  const isDark = theme === 'dark'

  const view: View = { xMin, xMax, yMin, yMax }
  const palette = isDark ? PALETTE_DARK : PALETTE_LIGHT

  const bgColor = 'color-mix(in oklab, var(--muted) 25%, transparent)'
  const svgBg = isDark ? '#0c0c0e' : '#ffffff'
  const gridColor = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)'
  const axisColor = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'
  const tickLabelColor = isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.35)'
  const accentColor = isDark ? 'rgba(139,180,255,0.8)' : 'rgba(37,99,235,0.85)'
  const borderColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
  const mutedColor = isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.35)'

  const xTicks = useMemo(() => niceTicks(xMin, xMax), [xMin, xMax])
  const yTicks = useMemo(() => niceTicks(yMin, yMax), [yMin, yMax])

  const zeroSx = toSx(0, view)
  const zeroSy = toSy(0, view)
  const xAxisVisible = zeroSy >= PAD && zeroSy <= H - PAD
  const yAxisVisible = zeroSx >= PAD && zeroSx <= W - PAD

  const paths = useMemo(
    () =>
      functions.map((spec, i) => {
        const compiled = compile(spec.expr)
        return {
          d: compiled ? buildPath(compiled, view) : '',
          color: palette[(spec.color ?? i) % palette.length],
          label: spec.label,
        }
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [functions, xMin, xMax, yMin, yMax, palette],
  )

  const hasLabels = functions.some((f) => f.label)

  return (
    <div
      className="border-border my-8 flex flex-col gap-4 rounded-lg border p-6"
      style={{ background: bgColor }}
    >
      {/* header */}
      <div className="flex items-center justify-between gap-3">
        <span
          className="font-mono text-[10px] tracking-widest uppercase"
          style={{ color: accentColor }}
        >
          Graph
        </span>

        {/* legend */}
        {hasLabels && (
          <div className="flex flex-wrap items-center gap-3">
            {functions.map((spec, i) =>
              spec.label ? (
                <div key={i} className="flex items-center gap-1.5">
                  <span
                    className="block rounded-full"
                    style={{
                      width: 16,
                      height: 2,
                      background: palette[(spec.color ?? i) % palette.length],
                    }}
                  />
                  <span className="font-mono text-[10px]" style={{ color: mutedColor }}>
                    {spec.label}
                  </span>
                </div>
              ) : null,
            )}
          </div>
        )}
      </div>

      {/* graph */}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="border-border block w-full rounded border"
        style={{ background: svgBg }}
      >
        <defs>
          <clipPath id="fg-clip">
            <rect x={PAD} y={PAD} width={W - PAD * 2} height={H - PAD * 2} />
          </clipPath>
        </defs>

        {/* grid */}
        {xTicks.map((t) => (
          <line
            key={`gx-${t}`}
            x1={toSx(t, view)}
            y1={PAD}
            x2={toSx(t, view)}
            y2={H - PAD}
            stroke={gridColor}
            strokeWidth={1}
          />
        ))}
        {yTicks.map((t) => (
          <line
            key={`gy-${t}`}
            x1={PAD}
            y1={toSy(t, view)}
            x2={W - PAD}
            y2={toSy(t, view)}
            stroke={gridColor}
            strokeWidth={1}
          />
        ))}

        {/* axes */}
        {xAxisVisible && (
          <line
            x1={PAD}
            y1={zeroSy}
            x2={W - PAD}
            y2={zeroSy}
            stroke={axisColor}
            strokeWidth={1}
          />
        )}
        {yAxisVisible && (
          <line
            x1={zeroSx}
            y1={PAD}
            x2={zeroSx}
            y2={H - PAD}
            stroke={axisColor}
            strokeWidth={1}
          />
        )}

        {/* tick labels */}
        {xTicks.map((t) => (
          <text
            key={`tx-${t}`}
            x={toSx(t, view)}
            y={H - PAD + 13}
            textAnchor="middle"
            fill={tickLabelColor}
            fontSize={9}
            fontFamily="Geist Mono, ui-monospace, monospace"
          >
            {fmtTick(t)}
          </text>
        ))}
        {yTicks.map(
          (t) =>
            t !== 0 && (
              <text
                key={`ty-${t}`}
                x={PAD - 5}
                y={toSy(t, view) + 3}
                textAnchor="end"
                fill={tickLabelColor}
                fontSize={9}
                fontFamily="Geist Mono, ui-monospace, monospace"
              >
                {fmtTick(t)}
              </text>
            ),
        )}

        {/* curves */}
        <g clipPath="url(#fg-clip)">
          {paths.map(({ d, color }, i) =>
            d ? (
              <path
                key={i}
                d={d}
                fill="none"
                stroke={color}
                strokeWidth={1.75}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            ) : null,
          )}
        </g>

        {/* plot border */}
        <rect
          x={PAD}
          y={PAD}
          width={W - PAD * 2}
          height={H - PAD * 2}
          fill="none"
          stroke={axisColor}
          strokeWidth={0.5}
        />
      </svg>
    </div>
  )
}

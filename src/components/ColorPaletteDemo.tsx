import { useState, useMemo, useEffect, useCallback } from 'react'

// --- R₃-in-OKLAB constants (ported from server/src/colors.rs) ---
const ALPHA = [0.8191725134, 0.6710436067, 0.5497004779]
const L_MIN = 0.35,
  L_MAX = 0.85
const A_MIN = -0.15,
  A_MAX = 0.15
const B_MIN = -0.15,
  B_MAX = 0.15
const N = 20

// --- Color math ---

function frac(x: number): number {
  return x - Math.floor(x)
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

// OKLAB -> linear sRGB (exact constants from colors.rs)
function oklabToLinearSrgb(
  L: number,
  a: number,
  b: number,
): [number, number, number] {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b
  const s_ = L - 0.0894841775 * a - 1.291485548 * b
  const l = l_ * l_ * l_
  const m = m_ * m_ * m_
  const s = s_ * s_ * s_
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ]
}

// linear sRGB -> gamma-encoded sRGB, clamped (from colors.rs: linear_to_srgb)
function linearToSrgb(c: number): number {
  c = Math.max(0, Math.min(1, c))
  return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055
}

// Convert OKLAB to #rrggbb hex (matches oklab_to_srgb8 in colors.rs)
function oklabToHex(L: number, a: number, b: number): string {
  const [lr, lg, lb] = oklabToLinearSrgb(L, a, b)
  const toHex = (v: number) =>
    Math.floor(linearToSrgb(v) * 255 + 0.5)
      .toString(16)
      .padStart(2, '0')
  return `#${toHex(lr)}${toHex(lg)}${toHex(lb)}`
}

// Generate the nth quasirandom color (1-based index, matching Rust's n_f = n + 1)
function nthQuasirandom(
  seed: [number, number, number],
  i: number,
): { hex: string; L: number } {
  const l_unit = frac(seed[0] + i * ALPHA[0])
  const a_unit = frac(seed[1] + i * ALPHA[1])
  const b_unit = frac(seed[2] + i * ALPHA[2])
  const L = lerp(L_MIN, L_MAX, l_unit)
  const a = lerp(A_MIN, A_MAX, a_unit)
  const b = lerp(B_MIN, B_MAX, b_unit)
  return { hex: oklabToHex(L, a, b), L }
}

// Relative luminance for text contrast (WCAG formula)
function relativeLuminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  const lin = (c: number) =>
    c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}

function randomSeed(): [number, number, number] {
  return [Math.random(), Math.random(), Math.random()]
}

// --- Theme hook (matches other components) ---

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

// --- Sub-components ---

function SwatchGrid({
  swatches,
  sublabel,
  labelColor,
}: {
  swatches: { hex: string; index: number }[]
  sublabel?: string
  labelColor: string
}) {
  return (
    <div className="flex flex-col gap-2">
      {sublabel && (
        <span
          className="font-mono text-[10px] tracking-widest uppercase"
          style={{ color: labelColor }}
        >
          {sublabel}
        </span>
      )}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))',
          gap: 6,
        }}
      >
        {swatches.map(({ hex, index }) => {
          const lum = relativeLuminance(hex)
          const textColor =
            lum > 0.179 ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.65)'
          return (
            <div
              key={index}
              style={{
                background: hex,
                aspectRatio: '1',
                borderRadius: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span
                style={{
                  color: textColor,
                  fontFamily: 'Geist Mono, ui-monospace, monospace',
                  fontSize: 11,
                  fontWeight: 500,
                  lineHeight: 1,
                }}
              >
                {index}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// --- Main component ---

export default function ColorPaletteDemo() {
  const [seed, setSeed] = useState<[number, number, number]>(() => randomSeed())
  const theme = useTheme()
  const isDark = theme === 'dark'

  const reshuffle = useCallback(() => {
    setSeed(randomSeed())
  }, [])

  const quasirandomSwatches = useMemo(
    () =>
      Array.from({ length: N }, (_, i) => ({
        ...nthQuasirandom(seed, i + 1),
        index: i + 1,
      })),
    [seed],
  )

  const bgColor = isDark ? '#111113' : '#f8f8fa'
  const accentColor = isDark ? 'rgba(139,180,255,0.8)' : 'rgba(37,99,235,0.85)'
  const labelColor = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)'
  const btnBorder = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
  const btnInactiveColor = isDark
    ? 'rgba(255,255,255,0.35)'
    : 'rgba(0,0,0,0.35)'

  const btnStyle = {
    background: 'transparent',
    borderColor: btnBorder,
    color: btnInactiveColor,
    cursor: 'pointer' as const,
  }

  return (
    <div
      className="border-border my-8 flex flex-col gap-5 rounded-lg border p-6"
      style={{ background: bgColor }}
    >
      {/* Header row */}
      <div className="flex flex-wrap items-center gap-2">
        <span
          className="font-mono text-[10px] tracking-widest uppercase"
          style={{ color: accentColor }}
        >
          R3 in OKLAB
        </span>
        <div className="ml-auto">
          <button
            onClick={reshuffle}
            className="rounded border px-3 py-1 font-mono text-[10px] tracking-widest uppercase"
            style={btnStyle}
          >
            Reshuffle
          </button>
        </div>
      </div>

      <SwatchGrid swatches={quasirandomSwatches} labelColor={labelColor} />
    </div>
  )
}

import { useState, useMemo, useEffect } from 'react'

// --- Color math ---

function srgbToLinear(c: number): number {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
}

function linearToSrgb(c: number): number {
  c = Math.max(0, Math.min(1, c))
  return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055
}

function linearSrgbToOklab(
  r: number,
  g: number,
  b: number,
): [number, number, number] {
  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b
  const l_ = Math.cbrt(l)
  const m_ = Math.cbrt(m)
  const s_ = Math.cbrt(s)
  return [
    0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_,
    1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_,
    0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_,
  ]
}

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

function hexToRgb01(hex: string): [number, number, number] {
  return [
    parseInt(hex.slice(1, 3), 16) / 255,
    parseInt(hex.slice(3, 5), 16) / 255,
    parseInt(hex.slice(5, 7), 16) / 255,
  ]
}

function rgb01ToHex(r: number, g: number, b: number): string {
  const h = (v: number) =>
    Math.round(Math.max(0, Math.min(1, v)) * 255)
      .toString(16)
      .padStart(2, '0')
  return `#${h(r)}${h(g)}${h(b)}`
}

const STEPS = 15

function makeRgbGradient(from: string, to: string): string[] {
  const [r1, g1, b1] = hexToRgb01(from)
  const [r2, g2, b2] = hexToRgb01(to)
  return Array.from({ length: STEPS }, (_, i) => {
    const t = i / (STEPS - 1)
    return rgb01ToHex(
      r1 + (r2 - r1) * t,
      g1 + (g2 - g1) * t,
      b1 + (b2 - b1) * t,
    )
  })
}

function makeOklabGradient(from: string, to: string): string[] {
  const [r1, g1, b1] = hexToRgb01(from)
  const [r2, g2, b2] = hexToRgb01(to)
  const lab1 = linearSrgbToOklab(
    srgbToLinear(r1),
    srgbToLinear(g1),
    srgbToLinear(b1),
  )
  const lab2 = linearSrgbToOklab(
    srgbToLinear(r2),
    srgbToLinear(g2),
    srgbToLinear(b2),
  )
  return Array.from({ length: STEPS }, (_, i) => {
    const t = i / (STEPS - 1)
    const L = lab1[0] + (lab2[0] - lab1[0]) * t
    const a = lab1[1] + (lab2[1] - lab1[1]) * t
    const b = lab1[2] + (lab2[2] - lab1[2]) * t
    const [lr, lg, lb] = oklabToLinearSrgb(L, a, b)
    return rgb01ToHex(linearToSrgb(lr), linearToSrgb(lg), linearToSrgb(lb))
  })
}

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

const PRESETS = [
  { label: 'Red → Cyan', from: '#FF0000', to: '#00FFFF' },
  { label: 'Blue → Yellow', from: '#0000FF', to: '#FFFF00' },
  { label: 'Green → Magenta', from: '#00FF00', to: '#FF00FF' },
]

function GradientRow({
  colors,
  label,
  labelColor,
}: {
  colors: string[]
  label: string
  labelColor: string
}) {
  return (
    <div className="flex flex-col gap-2">
      <span
        className="font-mono text-[10px] tracking-widest uppercase"
        style={{ color: labelColor }}
      >
        {label}
      </span>
      <div className="flex overflow-hidden rounded" style={{ height: 56 }}>
        {colors.map((c, i) => (
          <div key={i} style={{ background: c, flex: 1 }} />
        ))}
      </div>
    </div>
  )
}

export default function PerceptualColorDemo() {
  const [preset, setPreset] = useState(0)
  const theme = useTheme()
  const isDark = theme === 'dark'

  const { from, to } = PRESETS[preset]
  const rgbColors = useMemo(() => makeRgbGradient(from, to), [from, to])
  const oklabColors = useMemo(() => makeOklabGradient(from, to), [from, to])

  const bgColor = 'color-mix(in oklab, var(--muted) 25%, transparent)'
  const labelColor = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)'
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
      style={{ background: bgColor }}
    >
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p, i) => (
          <button
            key={i}
            onClick={() => setPreset(i)}
            className="rounded border px-3 py-1 font-mono text-[10px] tracking-widest uppercase transition-colors"
            style={{
              background: i === preset ? btnActiveBackground : 'transparent',
              borderColor: btnBorder,
              color: i === preset ? btnActiveColor : btnInactiveColor,
              cursor: 'pointer',
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      <GradientRow colors={rgbColors} label="RGB" labelColor={labelColor} />
      <GradientRow colors={oklabColors} label="OKLAB" labelColor={labelColor} />
    </div>
  )
}

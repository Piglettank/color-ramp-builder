function hexToRgb(hex: string): [number, number, number] {
  const normalized = normalizeHex(hex).slice(1)
  return [
    parseInt(normalized.slice(0, 2), 16),
    parseInt(normalized.slice(2, 4), 16),
    parseInt(normalized.slice(4, 6), 16),
  ]
}

function rgbToLab(r: number, g: number, b: number): [number, number, number] {
  const pivot = (n: number) => {
    const v = n / 255
    return v > 0.04045 ? ((v + 0.055) / 1.055) ** 2.4 : v / 12.92
  }

  let rn = pivot(r)
  let gn = pivot(g)
  let bn = pivot(b)

  let x = (rn * 0.4124564 + gn * 0.3575761 + bn * 0.1804375) / 0.95047
  let y = rn * 0.2126729 + gn * 0.7151522 + bn * 0.072175
  let z = (rn * 0.0193339 + gn * 0.119192 + bn * 0.9503041) / 1.08883

  const f = (t: number) => (t > 0.008856 ? t ** (1 / 3) : 7.787 * t + 16 / 116)

  const fx = f(x)
  const fy = f(y)
  const fz = f(z)

  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)]
}

export function deltaE(hex1: string, hex2: string): number {
  const lab1 = rgbToLab(...hexToRgb(hex1))
  const lab2 = rgbToLab(...hexToRgb(hex2))
  return Math.sqrt(
    (lab1[0] - lab2[0]) ** 2 + (lab1[1] - lab2[1]) ** 2 + (lab1[2] - lab2[2]) ** 2,
  )
}

export function normalizeHex(hex: string): string {
  let value = hex.trim().replace(/^#/, '')
  if (value.length === 3) {
    value = value
      .split('')
      .map((c) => c + c)
      .join('')
  }
  if (!/^[0-9a-fA-F]{6}$/.test(value)) {
    throw new Error(`Invalid hex color: ${hex}`)
  }
  return `#${value.toUpperCase()}`
}

export function isValidHex(hex: string): boolean {
  try {
    normalizeHex(hex)
    return true
  } catch {
    return false
  }
}

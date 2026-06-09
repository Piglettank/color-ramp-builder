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

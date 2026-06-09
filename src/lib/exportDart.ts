import type { Swatch } from './palette'
import { normalizeHex } from './colorDistance'

export type DartExportFormat = 'materialColor' | 'colorConstants'

function hexToDart(hex: string): string {
  return `0xFF${normalizeHex(hex).slice(1)}`
}

function isValidDartName(name: string): boolean {
  return /^[A-Z][A-Z0-9_]*$/.test(name)
}

function validateConstantName(constantName: string): string {
  const name = constantName.trim() || 'PRIMARY'
  if (!isValidDartName(name)) {
    throw new Error('Constant name must be uppercase letters, numbers, and underscores')
  }
  return name
}

function sortedSwatches(swatches: Swatch[]): Swatch[] {
  return [...swatches].sort((a, b) => a.step - b.step)
}

const SEED_COMMENT = ' // seed color'

function seedComment(step: number, seedStep: number | null): string {
  return step === seedStep ? SEED_COMMENT : ''
}

function stepToConstantSuffix(step: number): string {
  return String(step / 10).padStart(2, '0')
}

export function exportMaterialColor(
  swatches: Swatch[],
  constantName: string,
  primaryHex: string,
  seedStep: number | null,
): string {
  const name = validateConstantName(constantName)
  const entries = sortedSwatches(swatches)
    .map((s) => `    ${s.step}: Color(${hexToDart(s.hex)}),${seedComment(s.step, seedStep)}`)
    .join('\n')

  return `const MaterialColor ${name} = MaterialColor(
  ${hexToDart(primaryHex)},${SEED_COMMENT}
  <int, Color>{
${entries}
  },
);`
}

export function exportColorConstants(
  swatches: Swatch[],
  constantName: string,
  seedStep: number | null,
): string {
  const name = validateConstantName(constantName)

  return sortedSwatches(swatches)
    .map(
      (s) =>
        `const Color ${name}_${stepToConstantSuffix(s.step)} = Color(${hexToDart(s.hex)});${seedComment(s.step, seedStep)}`,
    )
    .join('\n')
}

export function exportDart(
  format: DartExportFormat,
  swatches: Swatch[],
  constantName: string,
  primaryHex: string,
  seedStep: number | null,
): string {
  switch (format) {
    case 'materialColor':
      return exportMaterialColor(swatches, constantName, primaryHex, seedStep)
    case 'colorConstants':
      return exportColorConstants(swatches, constantName, seedStep)
  }
}

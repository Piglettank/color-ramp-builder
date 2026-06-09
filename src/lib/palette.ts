import {
  TonalPalette,
  Hct,
  argbFromHex,
  hexFromArgb,
} from '@material/material-color-utilities'
import { normalizeHex } from './colorDistance'
import { stepToTone } from './swatchSteps'

export const DEFAULT_SEED_HEX = '#4A8F5C'

export interface Swatch {
  step: number
  hex: string
}

export interface ClosestMatch {
  step: number
  hex: string
  virtualStep: number
}

function toneToHex(palette: TonalPalette, tone: number): string {
  return normalizeHex(hexFromArgb(palette.tone(tone)))
}

function clampTone(tone: number): number {
  return Math.max(0, Math.min(100, tone))
}

function hexFromHct(hue: number, chroma: number, tone: number): string {
  return normalizeHex(hexFromArgb(Hct.from(hue, chroma, clampTone(tone)).toInt()))
}

export function virtualStepFromHex(hex: string): number {
  const hct = Hct.fromInt(argbFromHex(normalizeHex(hex)))
  return Math.round(hct.tone * 10)
}

export function formatClosestLabel(closest: ClosestMatch): string {
  if (closest.virtualStep === closest.step) {
    return `Closest ${closest.step}`
  }
  return `Closest ${closest.virtualStep} (${closest.step})`
}

export function generateFromSeed(inputHex: string, steps: number[]): Swatch[] {
  const normalized = normalizeHex(inputHex)
  const palette = TonalPalette.fromInt(argbFromHex(normalized))

  return steps.map((step) => ({
    step,
    hex: toneToHex(palette, stepToTone(step)),
  }))
}

export function generateFromLock(
  lockedHex: string,
  lockedStep: number,
  steps: number[],
): Swatch[] {
  const normalized = normalizeHex(lockedHex)
  const hct = Hct.fromInt(argbFromHex(normalized))
  const toneOffset = hct.tone - stepToTone(lockedStep)

  return steps.map((step) => {
    const nominalTone = stepToTone(step)
    const hex =
      step === lockedStep
        ? normalized
        : hexFromHct(hct.hue, hct.chroma, nominalTone + toneOffset)
    return { step, hex }
  })
}

export function findClosest(inputHex: string, swatches: Swatch[]): ClosestMatch | null {
  if (swatches.length === 0) return null

  const normalized = normalizeHex(inputHex)
  const virtualStep = virtualStepFromHex(normalized)

  let best = swatches[0]!
  let minDistance = Math.abs(best.step - virtualStep)

  for (const swatch of swatches.slice(1)) {
    const distance = Math.abs(swatch.step - virtualStep)
    if (distance < minDistance) {
      best = swatch
      minDistance = distance
    }
  }

  return { step: best.step, hex: best.hex, virtualStep }
}

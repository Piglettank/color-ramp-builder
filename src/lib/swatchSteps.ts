const BASE_STEPS = [100, 200, 300, 400, 500, 600, 700, 800, 900] as const

const DARK_EXTENSION_STEPS = [50] as const
const LIGHT_EXTENSION_STEPS = [950, 980] as const

export interface ExtensionToggles {
  enabled: boolean
}

export const DEFAULT_EXTENSIONS: ExtensionToggles = {
  enabled: true,
}

export function stepToTone(step: number): number {
  return step / 10
}

export function getActiveSteps(extensions: ExtensionToggles, customSteps: number[] = []): number[] {
  const steps: number[] = [...BASE_STEPS, ...customSteps]

  if (extensions.enabled) {
    steps.push(...DARK_EXTENSION_STEPS, ...LIGHT_EXTENSION_STEPS)
  }

  return [...new Set(steps)].sort((a, b) => a - b)
}

export function validateCustomStep(step: number, existingSteps: number[]): string | null {
  if (!Number.isInteger(step)) return 'Step must be a whole number'
  if (step < 0 || step > 1000) return 'Step must be between 0 and 1000'
  if (existingSteps.includes(step)) return 'Step already exists'
  return null
}

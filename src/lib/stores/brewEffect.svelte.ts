import { FAILED_BREW_POTION } from '$lib/components/threlte/components/potions'

export const POTION_BURST_COLORS: Record<string, number[]> = {
    'Зелье жизни': [0x4ade80, 0x22c55e, 0xbbf7d0],
    'Зелье маны': [0x60a5fa, 0x3b82f6, 0xbfdbfe],
    'Маленький настой': [0xa8a29e, 0x78716c, 0xe7e5e4],
    'Загадочное зелье': [0xc084fc, 0xa855f7, 0xe9d5ff],
    'Зелье движения': [0x2dd4bf, 0x14b8a6, 0xccfbf1],
    'Тёмное зелье': [0x7c3aed, 0x4c1d95, 0x1e1b4b],
    'Звёздное зелье': [0xfbbf24, 0xf59e0b, 0xfef3c7],
    'Вихревое зелье': [0xf472b6, 0xe879f9, 0xfae8ff],
    'Магическое зелье': [0x818cf8, 0x6366f1, 0xe0e7ff],
    [FAILED_BREW_POTION]: [0xfbbf24, 0xf59e0b, 0x6b7280],
    'Зелье стойкости': [0x94a3b8, 0x64748b, 0xe2e8f0],
}

export function getPotionBurstColors(potionName: string): number[] {
    return (
        POTION_BURST_COLORS[potionName] ?? [
            0xa78bfa, 0x7c3aed, 0xddd6fe,
        ]
    )
}

class BrewEffectStore {
    #generation = $state(0)
    #potionName = $state<string | null>(null)
    #playing = $state(false)

    get generation() {
        return this.#generation
    }

    get potionName() {
        return this.#potionName
    }

    get playing() {
        return this.#playing
    }

    trigger(potionName: string) {
        this.#potionName = potionName
        this.#generation++
        this.#playing = true
    }

    complete() {
        this.#playing = false
    }
}

export const brewEffect = new BrewEffectStore()

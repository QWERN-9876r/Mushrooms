import {
    FAILED_BREW_POTION,
    isDrinkablePotion,
    isLegendaryPotion,
} from '$lib/components/threlte/components/potions'
import { buffs } from '$lib/stores/buffs.svelte'
import { drinkEffect } from '$lib/stores/drinkEffect.svelte'
import { inventory } from '$lib/stores/inventory.svelte'
import { poison } from '$lib/stores/poison.svelte'
import { victory } from '$lib/stores/victory.svelte'
import { isPotion } from './inventoryItems'

function formatLuckBonusPercent(percent: number): string {
    const rounded = Math.round(percent * 10) / 10
    const text = Number.isInteger(rounded)
        ? String(rounded)
        : rounded.toFixed(1).replace(/\.0$/, '')
    return `+${text}%`
}

export interface PotionEffect {
    /** Доля шкалы отравления (0…1), которую снимает зелье */
    poisonHeal?: number
    /** Доля шкалы отравления, которую добавляет зелье */
    poisonHarm?: number
    /** Дополнительные секунды жизни в лесу (постоянно до смерти) */
    lifeExtensionSeconds?: number
    /** Аддитивный бонус удачи в процентах (постоянно до смерти) */
    luckBonusPercent?: number
    description: string
}

export const POTION_EFFECTS: Record<string, PotionEffect> = {
    'Зелье жизни': {
        poisonHeal: 1 / 8,
        lifeExtensionSeconds: 30,
        description: '−⅛ отравления, +30 сек к запасу жизни',
    },
    'Зелье маны': {
        poisonHeal: 1 / 16,
        luckBonusPercent: 2,
        description: `−¹⁄₁₆ отравления, удача ${formatLuckBonusPercent(2)}`,
    },
    'Маленький настой': {
        poisonHeal: 1 / 16,
        description: '−¹⁄₁₆ отравления',
    },
    'Загадочное зелье': {
        poisonHeal: 1 / 8,
        lifeExtensionSeconds: 15,
        luckBonusPercent: 1,
        description: `−⅛ отравления, +15 сек жизни, удача ${formatLuckBonusPercent(1)}`,
    },
    'Зелье движения': {
        poisonHeal: 1 / 16,
        lifeExtensionSeconds: 20,
        description: '−¹⁄₁₆ отравления, +20 сек к запасу жизни',
    },
    'Тёмное зелье': {
        poisonHeal: 1 / 4,
        description: '−¼ отравления',
    },
    'Звёздное зелье': {
        poisonHeal: 1 / 16,
        luckBonusPercent: 3,
        description: `−¹⁄₁₆ отравления, удача ${formatLuckBonusPercent(3)}`,
    },
    'Вихревое зелье': {
        poisonHeal: 1 / 4,
        lifeExtensionSeconds: 60,
        luckBonusPercent: 5,
        description: `−¼ отравления, +60 сек жизни, удача ${formatLuckBonusPercent(5)}, +1 очко победы`,
    },
    'Магическое зелье': {
        poisonHeal: 1 / 3,
        lifeExtensionSeconds: 90,
        luckBonusPercent: 7,
        description: `−⅓ отравления, +90 сек жизни, удача ${formatLuckBonusPercent(7)}, +1 очко победы`,
    },
    'Зелье стойкости': {
        poisonHeal: 1 / 8,
        lifeExtensionSeconds: 45,
        description: '−⅛ отравления, +45 сек к запасу жизни',
    },
    [FAILED_BREW_POTION]: {
        poisonHeal: 1 / 2,
        description: '−½ отравления, +1 очко победы',
    },
}

export function getPotionEffectDescription(potionName: string): string | null {
    return POTION_EFFECTS[potionName]?.description ?? null
}

export function drinkPotion(potionName: string): boolean {
    if (
        !isPotion(potionName) ||
        !isDrinkablePotion(potionName) ||
        (inventory.items[potionName] ?? 0) <= 0
    ) {
        return false
    }

    const effect = POTION_EFFECTS[potionName]
    if (!effect) return false

    if (effect.poisonHeal) {
        poison.reduceExposureFraction(effect.poisonHeal)
    }

    if (effect.poisonHarm) {
        poison.addExposureFraction(effect.poisonHarm)
    }

    if (effect.lifeExtensionSeconds) {
        buffs.addLifeExtension(effect.lifeExtensionSeconds)
    }

    if (effect.luckBonusPercent) {
        buffs.addLuckPercent(effect.luckBonusPercent)
    }

    if (isLegendaryPotion(potionName)) {
        victory.addPoint()
    }

    inventory.removeItem(potionName)
    poison.resumeAfterAction()
    drinkEffect.trigger(potionName)

    return true
}

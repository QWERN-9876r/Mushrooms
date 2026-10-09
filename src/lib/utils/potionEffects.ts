import {
    FAILED_BREW_POTION,
    isDrinkablePotion,
    isLegendaryPotion,
} from '$lib/components/threlte/components/potions'
import { t } from '$lib/i18n'
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

const FRACTION_GLYPHS: Record<number, string> = {
    2: '½',
    3: '⅓',
    4: '¼',
    8: '⅛',
    16: '¹⁄₁₆',
}

function formatFraction(fraction: number): string {
    return (
        FRACTION_GLYPHS[Math.round(1 / fraction)] ??
        `${Math.round(fraction * 100)}%`
    )
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
}

export const POTION_EFFECTS: Record<string, PotionEffect> = {
    life_potion: {
        poisonHeal: 1 / 8,
        lifeExtensionSeconds: 30,
    },
    mana_potion: {
        poisonHeal: 1 / 16,
        luckBonusPercent: 2,
    },
    small_tincture: {
        poisonHeal: 1 / 16,
    },
    mysterious_potion: {
        poisonHeal: 1 / 8,
        lifeExtensionSeconds: 15,
        luckBonusPercent: 1,
    },
    motion_potion: {
        poisonHeal: 1 / 16,
        lifeExtensionSeconds: 20,
    },
    dark_potion: {
        poisonHeal: 1 / 4,
    },
    star_potion: {
        poisonHeal: 1 / 16,
        luckBonusPercent: 3,
    },
    swirl_potion: {
        poisonHeal: 1 / 4,
        lifeExtensionSeconds: 60,
        luckBonusPercent: 5,
    },
    magic_potion: {
        poisonHeal: 1 / 3,
        lifeExtensionSeconds: 90,
        luckBonusPercent: 7,
    },
    endurance_potion: {
        poisonHeal: 1 / 8,
        lifeExtensionSeconds: 45,
    },
    [FAILED_BREW_POTION]: {
        poisonHeal: 1 / 2,
    },
}

/** Текст собирается из данных эффекта — числа не расходятся между языками */
export function getPotionEffectDescription(potionId: string): string | null {
    const effect = POTION_EFFECTS[potionId]
    if (!effect) return null

    const parts: string[] = []

    if (effect.poisonHeal) {
        parts.push(
            t('effect.poisonHeal', {
                amount: formatFraction(effect.poisonHeal),
            }),
        )
    }

    if (effect.poisonHarm) {
        parts.push(
            t('effect.poisonHarm', {
                amount: formatFraction(effect.poisonHarm),
            }),
        )
    }

    if (effect.lifeExtensionSeconds) {
        parts.push(
            t('effect.lifeExtension', {
                seconds: effect.lifeExtensionSeconds,
            }),
        )
    }

    if (effect.luckBonusPercent) {
        parts.push(
            t('effect.luck', {
                bonus: formatLuckBonusPercent(effect.luckBonusPercent),
            }),
        )
    }

    if (isLegendaryPotion(potionId)) {
        parts.push(t('effect.victoryPoint'))
    }

    return parts.length > 0 ? parts.join(', ') : null
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

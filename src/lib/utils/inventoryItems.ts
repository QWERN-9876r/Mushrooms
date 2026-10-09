import { MUSHROOMS } from '$lib/components/threlte/components/constants'
import {
    getPotionDef,
    isCauldronIngredient as isCauldronPotion,
    isDrinkablePotion,
    POTIONS,
} from '$lib/components/threlte/components/potions'
import type { InventoryItem } from '$lib/components/threlte/components/types'

export function getInventoryItem(name: string): InventoryItem | undefined {
    return MUSHROOMS[name]?.[0] ?? POTIONS[name]?.[0]
}

export function isMushroom(name: string): boolean {
    return Boolean(MUSHROOMS[name])
}

export function isPotion(name: string): boolean {
    return Boolean(POTIONS[name])
}

export function isCauldronIngredient(name: string): boolean {
    return isCauldronPotion(name)
}

export function isDrinkable(name: string): boolean {
    return isDrinkablePotion(name)
}

export function getPotionInventoryHint(
    name: string,
    inTerrarium: boolean,
): string | null {
    const potion = getPotionDef(name)
    if (!potion) return null

    const parts: string[] = []

    if (isPotion(name) && inTerrarium) {
        parts.push('Перетащи в котёл с грибом')
    }

    if (isDrinkablePotion(name)) {
        parts.push('Клик — выпить')
    }

    return parts.length > 0 ? parts.join(' · ') : null
}

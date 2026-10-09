import { MUSHROOMS } from '$lib/components/threlte/components/constants'
import {
    getPotionBrewTier,
    MIXED_BREW_RECIPES,
    MUSHROOM_BREW_RECIPES,
    POTION_BY_BREW_TIER,
} from '$lib/components/threlte/components/potions'
import { isMushroom, isPotion } from './inventoryItems'

function hashString(value: string): number {
    let hash = 0
    for (let i = 0; i < value.length; i++) {
        hash = (hash * 31 + value.charCodeAt(i)) >>> 0
    }
    return hash
}

function recipeKey(ids: string[]): string {
    return [...ids].sort().join('|')
}

function getMushroomTier(name: string): number {
    const mushroom = MUSHROOMS[name]?.[0]
    if (!mushroom) return 0
    if (mushroom.rare === 'legendary') return 2
    if (mushroom.rare === 'rare') return 1
    return 0
}

function pickFromTier(tier: number, key: string): string {
    const clamped = Math.min(3, Math.max(0, tier))
    const pool = POTION_BY_BREW_TIER[clamped]
    return pool[hashString(key) % pool.length]
}

function resolveMushroomPair(m1: string, m2: string): string {
    const sum = getMushroomTier(m1) + getMushroomTier(m2)
    const key = recipeKey([m1, m2])

    let tier: number
    if (sum === 0) tier = 0
    else if (sum === 1) tier = 1
    else if (sum === 2) tier = 2
    else tier = 3

    return pickFromTier(tier, key)
}

/** Зелье + гриб: результат на тир выше исходного зелья */
function resolvePotionMushroom(potion: string, mushroom: string): string {
    const potionTier = getPotionBrewTier(potion)
    const mushroomTier = getMushroomTier(mushroom)
    const key = recipeKey([potion, mushroom])

    const upgrade = potionTier === 0 ? 1 + mushroomTier : 1
    const resultTier = Math.min(3, potionTier + upgrade)

    return pickFromTier(resultTier, key)
}

export function resolveBrewRecipe(ingredientIds: string[]): string | null {
    if (!isCauldronReady(ingredientIds)) return null

    const key = recipeKey(ingredientIds)
    const explicit =
        MUSHROOM_BREW_RECIPES[key] ?? MIXED_BREW_RECIPES[key] ?? null
    if (explicit) return explicit

    const mushrooms = ingredientIds.filter(isMushroom)
    const potions = ingredientIds.filter(isPotion)

    if (potions.length === 0 && mushrooms.length === 2) {
        return resolveMushroomPair(mushrooms[0], mushrooms[1])
    }

    if (potions.length === 1 && mushrooms.length === 1) {
        return resolvePotionMushroom(potions[0], mushrooms[0])
    }

    return null
}

export function canBrewRecipe(ingredientIds: string[]): boolean {
    return isCauldronReady(ingredientIds)
}

export function canAddToCauldron(
    ingredientId: string,
    currentIngredients: string[],
): boolean {
    if (currentIngredients.length >= 2) return false

    if (isMushroom(ingredientId)) return true

    if (isPotion(ingredientId)) {
        return !currentIngredients.some(isPotion)
    }

    return false
}

export function isCauldronReady(ingredients: string[]): boolean {
    if (ingredients.length !== 2) return false

    const mushrooms = ingredients.filter(isMushroom)
    const potions = ingredients.filter(isPotion)

    if (potions.length === 0) return mushrooms.length === 2
    if (potions.length === 1) return mushrooms.length === 1

    return false
}

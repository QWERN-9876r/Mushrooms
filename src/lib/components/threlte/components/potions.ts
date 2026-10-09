import type { Potion } from './types'

export const FAILED_BREW_POTION = 'failed_potion'

const POTIONS_LIST: Potion[] = [
    {
        id: 'life_potion',
        scale: 1,
        modelPath: '/models/potions/life_potion.glb',
        brewTier: 0,
    },
    {
        id: 'mana_potion',
        scale: 0.35,
        modelPath: '/models/potions/mana_potion.glb',
        brewTier: 0,
        cauldronIngredient: true,
        drinkable: true,
    },
    {
        id: 'small_tincture',
        scale: 0.35,
        modelPath: '/models/potions/small_bottle.glb',
        brewTier: 0,
    },
    {
        id: 'mysterious_potion',
        scale: 1.2,
        modelPath: '/models/potions/mysterious_potion.glb',
        brewTier: 1,
    },
    {
        id: 'motion_potion',
        scale: 0.4,
        modelPath: '/models/potions/potion_for_media__motion.glb',
        brewTier: 1,
    },
    {
        id: 'dark_potion',
        scale: 0.4,
        modelPath: '/models/potions/dark_magic_potion.glb',
        rare: 'rare',
        brewTier: 2,
    },
    {
        id: 'star_potion',
        scale: 0.45,
        modelPath: '/models/potions/star-potion.glb',
        rare: 'rare',
        brewTier: 2,
    },
    {
        id: 'endurance_potion',
        scale: 0.4,
        modelPath: '/models/potions/potion2.glb',
        rare: 'rare',
        brewTier: 2,
    },
    {
        id: 'swirl_potion',
        scale: 0.5,
        modelPath: '/models/potions/swirly_potion_bottle.glb',
        rare: 'legendary',
        brewTier: 3,
    },
    {
        id: 'magic_potion',
        scale: 0.12,
        modelPath: '/models/potions/magical_potion_mk2.glb',
        rare: 'legendary',
        brewTier: 3,
    },
    {
        id: 'failed_potion',
        scale: 0.4,
        modelPath: '/models/potions/potion.glb',
        rare: 'legendary',
        brewTier: 3,
    },
]

export const POTIONS = Object.groupBy(POTIONS_LIST, (p) => p.id) as Record<
    string,
    Potion[]
>

/** Зелья по тиру для крафта (без секретного «Неудачного») */
export const POTION_BY_BREW_TIER: Record<number, string[]> = (() => {
    const tiers: Record<number, string[]> = { 0: [], 1: [], 2: [], 3: [] }

    for (const potion of POTIONS_LIST) {
        if (potion.id === FAILED_BREW_POTION) continue

        const tier = potion.brewTier ?? 1
        tiers[tier].push(potion.id)
    }

    return tiers
})()

/** Два гриба — ключ через «|» в алфавитном порядке */
export const MUSHROOM_BREW_RECIPES: Record<string, string> = {
    'fly_agaric|toadstool': 'life_potion',
    'pale_mushroom|spark_mushroom': 'mana_potion',
    'night_toadstools|strange_mushroom': 'mysterious_potion',
    'fallen_warrior|fly_agaric': 'dark_potion',
    'bluecap|resurrected_mushroom': 'star_potion',
    'magic_mushroom|water_mushroom': 'swirl_potion',
    'magic_mushroom|mystery_mushroom': 'magic_potion',
    'face_mushroom|mystery_mushroom': 'failed_potion',
    'magic_mushroom|resurrected_mushroom': 'failed_potion',
    'mystery_mushroom|resurrected_mushroom': 'failed_potion',
}

/** Гриб + зелье — особые рецепты (остальное через апгрейд по тиру) */
export const MIXED_BREW_RECIPES: Record<string, string> = {
    'magic_mushroom|mana_potion': 'failed_potion',
    'magic_mushroom|swirl_potion': 'magic_potion',
    'mysterious_potion|mystery_mushroom': 'failed_potion',
}

/** @deprecated используй MUSHROOM_BREW_RECIPES */
export const BREW_RECIPES = MUSHROOM_BREW_RECIPES

export const CAULDRON_POTIONS = POTIONS_LIST.filter(
    (p) => p.cauldronIngredient,
).map((p) => p.id)

export function getPotionDef(id: string): Potion | undefined {
    return POTIONS[id]?.[0]
}

export function getPotionByModelPath(path: string): Potion | undefined {
    return POTIONS_LIST.find((potion) => potion.modelPath === path)
}

export function getPotionBrewTier(id: string): number {
    return getPotionDef(id)?.brewTier ?? 0
}

export function isCauldronIngredient(id: string): boolean {
    return Boolean(getPotionDef(id)?.cauldronIngredient)
}

export function isDrinkablePotion(id: string): boolean {
    const potion = getPotionDef(id)
    if (!potion) return false
    return potion.drinkable !== false
}

export function isLegendaryPotion(id: string): boolean {
    return getPotionDef(id)?.rare === 'legendary'
}

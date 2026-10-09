import type { Potion } from './types'

export const FAILED_BREW_POTION = 'Неудачное зелье'

const POTIONS_LIST: Potion[] = [
    {
        name: 'Зелье жизни',
        scale: 1,
        modelPath: '/models/potions/life_potion.glb',
        brewTier: 0,
    },
    {
        name: 'Зелье маны',
        scale: 0.35,
        modelPath: '/models/potions/mana_potion.glb',
        brewTier: 0,
        cauldronIngredient: true,
        drinkable: true,
    },
    {
        name: 'Маленький настой',
        scale: 0.35,
        modelPath: '/models/potions/small_bottle.glb',
        brewTier: 0,
    },
    {
        name: 'Загадочное зелье',
        scale: 1.2,
        modelPath: '/models/potions/mysterious_potion.glb',
        brewTier: 1,
    },
    {
        name: 'Зелье движения',
        scale: 0.4,
        modelPath: '/models/potions/potion_for_media__motion.glb',
        brewTier: 1,
    },
    {
        name: 'Тёмное зелье',
        scale: 0.4,
        modelPath: '/models/potions/dark_magic_potion.glb',
        rare: 'rare',
        brewTier: 2,
    },
    {
        name: 'Звёздное зелье',
        scale: 0.45,
        modelPath: '/models/potions/star-potion.glb',
        rare: 'rare',
        brewTier: 2,
    },
    {
        name: 'Зелье стойкости',
        scale: 0.4,
        modelPath: '/models/potions/potion2.glb',
        rare: 'rare',
        brewTier: 2,
    },
    {
        name: 'Вихревое зелье',
        scale: 0.5,
        modelPath: '/models/potions/swirly_potion_bottle.glb',
        rare: 'legendary',
        brewTier: 3,
    },
    {
        name: 'Магическое зелье',
        scale: 0.12,
        modelPath: '/models/potions/magical_potion_mk2.glb',
        rare: 'legendary',
        brewTier: 3,
    },
    {
        name: 'Неудачное зелье',
        scale: 0.4,
        modelPath: '/models/potions/potion.glb',
        rare: 'legendary',
        brewTier: 3,
    },
]

export const POTIONS = Object.groupBy(POTIONS_LIST, (p) => p.name) as Record<
    string,
    Potion[]
>

/** Зелья по тиру для крафта (без секретного «Неудачного») */
export const POTION_BY_BREW_TIER: Record<number, string[]> = (() => {
    const tiers: Record<number, string[]> = { 0: [], 1: [], 2: [], 3: [] }

    for (const potion of POTIONS_LIST) {
        if (potion.name === FAILED_BREW_POTION) continue

        const tier = potion.brewTier ?? 1
        tiers[tier].push(potion.name)
    }

    return tiers
})()

/** Два гриба — ключ через «|» в алфавитном порядке */
export const MUSHROOM_BREW_RECIPES: Record<string, string> = {
    'Мухомор|Паганка': 'Зелье жизни',
    'Бледный гриб|Гриб искра': 'Зелье маны',
    'Ночные паганки|Странный гриб': 'Загадочное зелье',
    'Мухомор|Падший воин': 'Тёмное зелье',
    'Воскрешенный гриб|Синик': 'Звёздное зелье',
    'Водный гриб|Магический гриб': 'Вихревое зелье',
    '??|Магический гриб': 'Магическое зелье',
    "'_'|??": 'Неудачное зелье',
    'Воскрешенный гриб|Магический гриб': 'Неудачное зелье',
    '??|Воскрешенный гриб': 'Неудачное зелье',
}

/** Гриб + зелье — особые рецепты (остальное через апгрейд по тиру) */
export const MIXED_BREW_RECIPES: Record<string, string> = {
    'Зелье маны|Магический гриб': 'Неудачное зелье',
    'Вихревое зелье|Магический гриб': 'Магическое зелье',
    'Загадочное зелье|??': 'Неудачное зелье',
}

/** @deprecated используй MUSHROOM_BREW_RECIPES */
export const BREW_RECIPES = MUSHROOM_BREW_RECIPES

export const CAULDRON_POTIONS = POTIONS_LIST.filter(
    (p) => p.cauldronIngredient,
).map((p) => p.name)

export function getPotionDef(name: string): Potion | undefined {
    return POTIONS[name]?.[0]
}

export function getPotionByModelPath(path: string): Potion | undefined {
    return POTIONS_LIST.find((potion) => potion.modelPath === path)
}

export function getPotionBrewTier(name: string): number {
    return getPotionDef(name)?.brewTier ?? 0
}

export function isCauldronIngredient(name: string): boolean {
    return Boolean(getPotionDef(name)?.cauldronIngredient)
}

export function isDrinkablePotion(name: string): boolean {
    const potion = getPotionDef(name)
    if (!potion) return false
    return potion.drinkable !== false
}

export function isLegendaryPotion(name: string): boolean {
    return getPotionDef(name)?.rare === 'legendary'
}

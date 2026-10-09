import { MUSHROOMS } from '$lib/components/threlte/components/constants'
import { POTIONS } from '$lib/components/threlte/components/potions'
import { getInventoryItem } from '$lib/utils/inventoryItems'

function uniqueUrls(urls: string[]): string[] {
    return [...new Set(urls)]
}

export function getInventoryMushroomUrls(
    inventoryItems: Record<string, number>,
): string[] {
    return Object.keys(inventoryItems)
        .map((name) => getInventoryItem(name)?.modelPath)
        .filter((path): path is string => Boolean(path))
}

export function getAllMushroomModelUrls(): string[] {
    return uniqueUrls(
        Object.values(MUSHROOMS)
            .flat()
            .map((m) => m.modelPath),
    )
}

export function getAllPotionModelUrls(): string[] {
    return uniqueUrls(
        Object.values(POTIONS)
            .flat()
            .map((p) => p.modelPath),
    )
}

export function getTerrariumAssetUrls(
    inventoryItems: Record<string, number>,
): string[] {
    return uniqueUrls([
        '/models/terrarium.glb',
        '/models/cauldron.glb',
        '/models/forest.glb',
        ...getInventoryMushroomUrls(inventoryItems),
        ...getAllPotionModelUrls(),
    ])
}

export function getForestAssetUrls(
    inventoryItems: Record<string, number>,
): string[] {
    return uniqueUrls([
        '/models/pine_forest.glb',
        ...getAllMushroomModelUrls(),
        ...getAllPotionModelUrls(),
        ...getInventoryMushroomUrls(inventoryItems),
    ])
}

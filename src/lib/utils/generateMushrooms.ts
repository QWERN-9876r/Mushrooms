import {
    getRandomMushroom,
    MUSHROOM_POSITIONS,
} from '$lib/components/threlte/components/constants'
import { buffs } from '$lib/stores/buffs.svelte'
import type {
    Mushroom,
    MushroomPosition,
} from '$lib/components/threlte/components/types'

const BASE_SPAWN_CHANCE = 0.05
const MAX_SPAWN_CHANCE = 0.35

export const generateMushrooms = () => {
    const spawnChance = Math.min(
        MAX_SPAWN_CHANCE,
        BASE_SPAWN_CHANCE * buffs.luckMultiplier,
    )
    const spawnThreshold = 1 - spawnChance
    const luck = buffs.luckMultiplier

    return MUSHROOM_POSITIONS.map((position) => {
        if (Math.random() > spawnThreshold) {
            return { position, mushroom: getRandomMushroom(luck) }
        }
    }).filter(Boolean) as Array<{
        position: MushroomPosition
        mushroom: Mushroom
    }>
}

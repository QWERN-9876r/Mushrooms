import { browser } from '$app/environment'
import {
    canAddToCauldron,
    isCauldronReady,
    resolveBrewRecipe,
} from '$lib/utils/brewing'
import { migrateItemId } from '$lib/utils/legacyItemIds'
import { brewEffect } from './brewEffect.svelte'
import { inventory } from './inventory.svelte'

const LEGACY_STORAGE_KEY = 'cauldron_mushroom'
const LEGACY_MUSHROOMS_KEY = 'cauldron_mushrooms'
const STORAGE_KEY = 'cauldron_ingredients'
export const CAULDRON_CAPACITY = 2

class CauldronStore {
    #ingredients = $state<string[]>([])

    constructor() {
        if (!browser) return

        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) {
            const parsed = JSON.parse(saved) as string[]
            this.#ingredients = parsed
                .slice(0, CAULDRON_CAPACITY)
                .map(migrateItemId)
            this.#persist()
            return
        }

        const legacyList = localStorage.getItem(LEGACY_MUSHROOMS_KEY)
        if (legacyList) {
            const parsed = JSON.parse(legacyList) as string[]
            this.#ingredients = parsed
                .slice(0, CAULDRON_CAPACITY)
                .map(migrateItemId)
            this.#persist()
            localStorage.removeItem(LEGACY_MUSHROOMS_KEY)
            return
        }

        const legacy = localStorage.getItem(LEGACY_STORAGE_KEY)
        if (legacy) {
            this.#ingredients = [migrateItemId(legacy)]
            this.#persist()
            localStorage.removeItem(LEGACY_STORAGE_KEY)
        }
    }

    /** @deprecated используй ingredients */
    get mushrooms() {
        return this.#ingredients
    }

    get ingredients() {
        return this.#ingredients
    }

    get count() {
        return this.#ingredients.length
    }

    get isFull() {
        return isCauldronReady(this.#ingredients)
    }

    get isSlotsFull() {
        return this.#ingredients.length >= CAULDRON_CAPACITY
    }

    get fillProgress() {
        return (this.#ingredients.length / CAULDRON_CAPACITY) * 100
    }

    canAdd(ingredientId: string): boolean {
        return canAddToCauldron(ingredientId, this.#ingredients)
    }

    addIngredient(ingredientId: string): boolean {
        if (!this.canAdd(ingredientId)) return false

        this.#ingredients = [...this.#ingredients, ingredientId]
        this.#persist()
        return true
    }

    /** @deprecated используй addIngredient */
    addMushroom(mushroomId: string): boolean {
        return this.addIngredient(mushroomId)
    }

    clear() {
        this.#ingredients = []

        if (browser) {
            localStorage.removeItem(STORAGE_KEY)
        }
    }

    brew(): string | null {
        if (!this.isFull) return null

        const potionName = resolveBrewRecipe(this.#ingredients)
        if (!potionName) return null

        this.clear()
        brewEffect.trigger(potionName)
        requestAnimationFrame(() => inventory.addItem(potionName))
        return potionName
    }

    #persist() {
        if (browser) {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(this.#ingredients),
            )
        }
    }
}

export const cauldron = new CauldronStore()

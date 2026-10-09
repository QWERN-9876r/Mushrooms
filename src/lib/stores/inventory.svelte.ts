import { browser } from '$app/environment'
import { migrateItemCounts } from '$lib/utils/legacyItemIds'

class InventoryStore {
    #items = $state<Record<string, number>>({})

    constructor() {
        if (!browser) return

        const saved = localStorage.getItem('player_inventory')
        if (saved) {
            this.#items = migrateItemCounts(JSON.parse(saved))
            this.#persist()
        }
    }

    get items() {
        return this.#items
    }

    addItem(mushroomName: string) {
        const currentCount = this.#items[mushroomName] || 0

        this.#items = {
            ...this.#items,
            [mushroomName]: currentCount + 1,
        }

        this.#persist()
    }

    removeItem(mushroomName: string) {
        const currentCount = this.#items[mushroomName] || 0
        if (currentCount <= 0) return

        if (currentCount === 1) {
            const { [mushroomName]: _, ...rest } = this.#items
            this.#items = rest
        } else {
            this.#items = {
                ...this.#items,
                [mushroomName]: currentCount - 1,
            }
        }

        this.#persist()
    }

    clear() {
        this.#items = {}
        this.#persist()
    }

    #persist() {
        if (browser) {
            localStorage.setItem(
                'player_inventory',
                JSON.stringify(this.#items),
            )
        }
    }
}

export const inventory = new InventoryStore()

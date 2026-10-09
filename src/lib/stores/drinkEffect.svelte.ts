class DrinkEffectStore {
    #generation = $state(0)
    #potionName = $state<string | null>(null)
    #playing = $state(false)

    get generation() {
        return this.#generation
    }

    get potionName() {
        return this.#potionName
    }

    get playing() {
        return this.#playing
    }

    trigger(potionName: string) {
        this.#potionName = potionName
        this.#generation++
        this.#playing = true
    }

    complete() {
        this.#playing = false
    }
}

export const drinkEffect = new DrinkEffectStore()

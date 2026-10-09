import { browser } from '$app/environment'

export const VICTORY_GOAL = 15
const STORAGE_KEY = 'victory_points'

class VictoryStore {
    #points = $state(0)
    #celebrationActive = $state(false)

    constructor() {
        if (!browser) return

        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) {
            const value = Number.parseInt(saved, 10)
            if (!Number.isNaN(value)) {
                this.#points = Math.min(VICTORY_GOAL, Math.max(0, value))
            }
        }
    }

    get points() {
        return this.#points
    }

    get isVictory() {
        return this.#points >= VICTORY_GOAL
    }

    get celebrationActive() {
        return this.#celebrationActive
    }

    addPoint() {
        if (this.#points >= VICTORY_GOAL) return

        const reachedGoal =
            this.#points + 1 >= VICTORY_GOAL
        this.#points = Math.min(VICTORY_GOAL, this.#points + 1)

        if (reachedGoal) {
            this.#celebrationActive = true
        }

        this.#persist()
    }

    dismissCelebration() {
        this.#celebrationActive = false
    }

    reset() {
        this.#points = 0
        this.#celebrationActive = false
        this.#persist()
    }

    #persist() {
        if (browser) {
            localStorage.setItem(STORAGE_KEY, String(this.#points))
        }
    }
}

export const victory = new VictoryStore()

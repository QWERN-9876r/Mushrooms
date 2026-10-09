import { browser } from '$app/environment'
import { buffs } from './buffs.svelte'
import { inventory } from './inventory.svelte'
import { victory } from './victory.svelte'

export const POISON_MAX_SECONDS = 180
export const POISON_DASH_PENALTY_SECONDS = 20
export const POISON_TERRARIUM_RECOVERY_RATE = 3
export const POISON_DARKNESS_START_SECONDS = POISON_MAX_SECONDS - 60
export const POISON_MAX_DARKNESS = 0.82

const STORAGE_KEY = 'poison_exposure'

type PoisonZone = 'idle' | 'forest' | 'terrarium'

class PoisonStore {
    #exposure = $state(0)
    #isDead = $state(false)
    #zone = $state<PoisonZone>('idle')
    #pausedUntilAction = $state(false)

    constructor() {
        if (!browser) return

        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) {
            const value = Number.parseFloat(saved)
            if (!Number.isNaN(value)) {
                this.#exposure = Math.min(
                    POISON_MAX_SECONDS,
                    Math.max(0, value),
                )
            }
        }
    }

    get exposure() {
        return this.#exposure
    }

    get isDead() {
        return this.#isDead
    }

    get zone() {
        return this.#zone
    }

    get effectiveMaxSeconds() {
        return POISON_MAX_SECONDS + buffs.lifeExtensionBonus
    }

    get fillProgress() {
        return (this.#exposure / this.effectiveMaxSeconds) * 100
    }

    /** 0…1 — затемнение в последнюю минуту до смерти */
    get darkness() {
        const max = this.effectiveMaxSeconds
        const darknessStart = max - 60
        if (this.#exposure < darknessStart) return 0

        const range = max - darknessStart
        const progress = (this.#exposure - darknessStart) / range

        return Math.min(1, Math.max(0, progress)) * POISON_MAX_DARKNESS
    }

    get isRecovering() {
        return this.#zone === 'terrarium' && this.#exposure > 0
    }

    get isPausedUntilAction() {
        return this.#pausedUntilAction
    }

    setZone(zone: PoisonZone) {
        this.#zone = zone
    }

    tick(deltaSeconds: number) {
        if (
            this.#isDead ||
            this.#pausedUntilAction ||
            deltaSeconds <= 0
        )
            return

        if (this.#zone === 'forest') {
            this.#addExposure(deltaSeconds)
            return
        }

        if (this.#zone === 'terrarium' && this.#exposure > 0) {
            this.#exposure = Math.max(
                0,
                this.#exposure -
                    deltaSeconds * POISON_TERRARIUM_RECOVERY_RATE,
            )
            this.#persist()
        }
    }

    addDashPenalty() {
        if (this.#isDead) return
        this.resumeAfterAction()
        this.#addExposure(POISON_DASH_PENALTY_SECONDS)
    }

    reduceExposureFraction(fraction: number) {
        if (this.#isDead || fraction <= 0) return

        this.#exposure = Math.max(
            0,
            this.#exposure - POISON_MAX_SECONDS * fraction,
        )
        this.#isDead = false
        this.#persist()
    }

    addExposureFraction(fraction: number) {
        if (this.#isDead || fraction <= 0) return

        this.#addExposure(POISON_MAX_SECONDS * fraction)
    }

    resumeAfterAction() {
        this.#pausedUntilAction = false
    }

    respawn() {
        this.#exposure = 0
        this.#isDead = false
        this.#pausedUntilAction = true
        buffs.reset()
        this.#persist()
    }

    #addExposure(seconds: number) {
        this.#exposure = Math.min(
            this.effectiveMaxSeconds,
            this.#exposure + seconds,
        )
        this.#persist()

        if (this.#exposure >= this.effectiveMaxSeconds) {
            if (!this.#isDead) {
                this.#isDead = true
                inventory.clear()
                victory.reset()
            }
        }
    }

    #persist() {
        if (browser) {
            localStorage.setItem(STORAGE_KEY, String(this.#exposure))
        }
    }
}

export const poison = new PoisonStore()

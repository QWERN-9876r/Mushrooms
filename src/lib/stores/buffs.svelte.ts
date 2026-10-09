/** Базовая удача — 20% (в 5 раз ниже прежней «100%») */
export const BASE_LUCK_PERCENT = 20

export function luckPercentToMultiplier(percent: number): number {
    return percent / 100
}

class BuffsStore {
    #lifeExtensionBonus = $state(0)
    /** Суммарный аддитивный бонус удачи от зелий, в процентах */
    #luckBonusPercent = $state(0)

    get lifeExtensionBonus() {
        return this.#lifeExtensionBonus
    }

    get luckBonusPercent() {
        return this.#luckBonusPercent
    }

    /** Итоговая удача: база + накопленные бонусы */
    get luckPercent() {
        return BASE_LUCK_PERCENT + this.#luckBonusPercent
    }

    /** Множитель для формул спавна и редкости */
    get luckMultiplier() {
        return luckPercentToMultiplier(this.luckPercent)
    }

    addLifeExtension(bonusSeconds: number) {
        this.#lifeExtensionBonus += bonusSeconds
    }

    addLuckPercent(percent: number) {
        this.#luckBonusPercent += percent
    }

    reset() {
        this.#lifeExtensionBonus = 0
        this.#luckBonusPercent = 0
    }
}

export const buffs = new BuffsStore()

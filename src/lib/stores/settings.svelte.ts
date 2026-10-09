import { browser } from '$app/environment'
import { DEFAULT_LOCALE, isLocale, type Locale } from '$lib/i18n/locales'

const STORAGE_KEY = 'game_settings'
const DEFAULT_MUSIC_VOLUME = 0.7

interface SavedSettings {
    locale?: unknown
    musicVolume?: unknown
}

function clampVolume(volume: number): number {
    return Math.min(1, Math.max(0, volume))
}

class SettingsStore {
    #locale = $state<Locale>(DEFAULT_LOCALE)
    /** 0…1 — громкость музыки */
    #musicVolume = $state(DEFAULT_MUSIC_VOLUME)
    /** Открытое меню ставит игру на паузу */
    #menuOpen = $state(false)

    constructor() {
        if (!browser) return

        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) {
            const parsed = JSON.parse(saved) as SavedSettings

            if (isLocale(parsed.locale)) {
                this.#locale = parsed.locale
            }

            if (
                typeof parsed.musicVolume === 'number' &&
                Number.isFinite(parsed.musicVolume)
            ) {
                this.#musicVolume = clampVolume(parsed.musicVolume)
            }
        }

        document.documentElement.lang = this.#locale
    }

    get locale() {
        return this.#locale
    }

    get musicVolume() {
        return this.#musicVolume
    }

    get menuOpen() {
        return this.#menuOpen
    }

    setLocale(locale: Locale) {
        this.#locale = locale

        if (browser) {
            document.documentElement.lang = locale
        }

        this.#persist()
    }

    setMusicVolume(volume: number) {
        this.#musicVolume = clampVolume(volume)
        this.#persist()
    }

    openMenu() {
        this.#menuOpen = true
    }

    closeMenu() {
        this.#menuOpen = false
    }

    toggleMenu() {
        this.#menuOpen = !this.#menuOpen
    }

    #persist() {
        if (browser) {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify({
                    locale: this.#locale,
                    musicVolume: this.#musicVolume,
                }),
            )
        }
    }
}

export const settings = new SettingsStore()

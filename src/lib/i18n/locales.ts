export const LOCALES = ['en', 'ru'] as const

export type Locale = (typeof LOCALES)[number]

export const DEFAULT_LOCALE: Locale = 'en'

/** Название языка на нём самом — не переводится */
export const LOCALE_LABELS: Record<Locale, string> = {
    en: 'English',
    ru: 'Русский',
}

export function isLocale(value: unknown): value is Locale {
    return LOCALES.includes(value as Locale)
}

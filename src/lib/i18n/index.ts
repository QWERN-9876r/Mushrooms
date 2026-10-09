import { settings } from '$lib/stores/settings.svelte'
import { en, type MessageKey, type Messages } from './en'
import type { Locale } from './locales'
import { ru } from './ru'

export type { MessageKey } from './en'

const MESSAGES: Record<Locale, Messages> = { en, ru }

type MessageParams = Record<string, string | number>

/** Реактивен: в разметке перерисуется при смене языка в настройках */
export function t(key: MessageKey, params?: MessageParams): string {
    const template = MESSAGES[settings.locale][key]
    if (!params) return template

    return template.replace(/\{(\w+)\}/g, (match, name: string) =>
        name in params ? String(params[name]) : match,
    )
}

/** Отображаемое имя гриба или зелья по его id */
export function itemName(id: string): string {
    const key = `item.${id}`
    return key in en ? t(key as MessageKey) : id
}

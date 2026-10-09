/** Старые сохранения хранят русские названия вместо id */
const LEGACY_ITEM_IDS: Record<string, string> = {
    Паганка: 'toadstool',
    'Странный гриб': 'strange_mushroom',
    'Ночные паганки': 'night_toadstools',
    Мухомор: 'fly_agaric',
    'Бледный гриб': 'pale_mushroom',
    'Падший воин': 'fallen_warrior',
    'Гриб искра': 'spark_mushroom',
    'Воскрешенный гриб': 'resurrected_mushroom',
    'Водный гриб': 'water_mushroom',
    Синик: 'bluecap',
    '??': 'mystery_mushroom',
    'Магический гриб': 'magic_mushroom',
    "'_'": 'face_mushroom',

    'Зелье жизни': 'life_potion',
    'Зелье маны': 'mana_potion',
    'Маленький настой': 'small_tincture',
    'Загадочное зелье': 'mysterious_potion',
    'Зелье движения': 'motion_potion',
    'Тёмное зелье': 'dark_potion',
    'Звёздное зелье': 'star_potion',
    'Зелье стойкости': 'endurance_potion',
    'Вихревое зелье': 'swirl_potion',
    'Магическое зелье': 'magic_potion',
    'Неудачное зелье': 'failed_potion',
}

export function migrateItemId(id: string): string {
    return LEGACY_ITEM_IDS[id] ?? id
}

export function migrateItemCounts(
    items: Record<string, number>,
): Record<string, number> {
    const migrated: Record<string, number> = {}

    for (const [id, count] of Object.entries(items)) {
        const nextId = migrateItemId(id)
        migrated[nextId] = (migrated[nextId] ?? 0) + count
    }

    return migrated
}

export const en = {
    'app.title': 'Alchemy Terrarium',

    'settings.open': 'Settings',
    'settings.title': 'Settings',
    'settings.paused': 'Game paused',
    'settings.language': 'Language',
    'settings.audio': 'Audio',
    'settings.music': 'Music',
    'settings.close': 'Close',

    'loading.default': 'Loading...',
    'loading.forest': 'Heading into the forest...',
    'loading.forestJoke': 'Screw IT, I’m off to live in the forest',
    'loading.terrarium': 'Heading to the cauldron...',
    'loading.terrariumJoke': 'Screw IT, I’m off to live in a cauldron',

    'nav.forest': 'Forest',
    'nav.cauldron': 'Cauldron',

    'forest.inventory': 'Inventory',
    'forest.dashHint': 'Press Space to go deeper into the forest',
    'terrarium.brew': 'Brew',

    'hud.poison': 'Poisoning from the trail fumes',
    'hud.cauldronFill': 'Cauldron fill',

    'inventory.dragToCauldron': 'Drag into the cauldron with a mushroom',
    'inventory.clickToDrink': 'Click to drink',

    'effect.poisonHeal': '−{amount} poison',
    'effect.poisonHarm': '+{amount} poison',
    'effect.lifeExtension': '+{seconds}s of life',
    'effect.luck': 'luck {bonus}',
    'effect.victoryPoint': '+1 victory point',

    'victory.title': 'VICTORY',
    'victory.subtitle':
        '{goal} legendary potions — the forest alchemist is defeated',
    'victory.continue': 'Continue',
    'death.title': 'DEATH',

    'desktopOnly.title': 'Desktop only',
    'desktopOnly.text':
        'The game is designed for a computer with a mouse and a large screen. Please open the site on a desktop or laptop.',

    'sidebar.title': 'Greenhouse',

    'item.toadstool': 'Toadstool',
    'item.strange_mushroom': 'Strange Mushroom',
    'item.night_toadstools': 'Night Toadstools',
    'item.fly_agaric': 'Fly Agaric',
    'item.pale_mushroom': 'Pale Mushroom',
    'item.fallen_warrior': 'Fallen Warrior',
    'item.spark_mushroom': 'Spark Mushroom',
    'item.resurrected_mushroom': 'Resurrected Mushroom',
    'item.water_mushroom': 'Water Mushroom',
    'item.bluecap': 'Bluecap',
    'item.mystery_mushroom': '??',
    'item.magic_mushroom': 'Magic Mushroom',
    'item.face_mushroom': "'_'",

    'item.life_potion': 'Potion of Life',
    'item.mana_potion': 'Mana Potion',
    'item.small_tincture': 'Small Tincture',
    'item.mysterious_potion': 'Mysterious Potion',
    'item.motion_potion': 'Potion of Motion',
    'item.dark_potion': 'Dark Potion',
    'item.star_potion': 'Star Potion',
    'item.endurance_potion': 'Potion of Endurance',
    'item.swirl_potion': 'Swirling Potion',
    'item.magic_potion': 'Magic Potion',
    'item.failed_potion': 'Failed Potion',
}

export type MessageKey = keyof typeof en

export type Messages = Record<MessageKey, string>

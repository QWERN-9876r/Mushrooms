export interface Mushroom {
    scale: number
    id: string
    modelPath: string
    rare?: 'rare' | 'legendary'
    count?: number
    position?: MushroomPosition
}

export interface Potion {
    scale: number
    id: string
    modelPath: string
    rare?: 'rare' | 'legendary'
    position?: MushroomPosition
    /** Можно класть в котёл вместе с грибом */
    cauldronIngredient?: boolean
    /** Тир для крафта и апгрейдов (0 — слабое … 3 — легендарное) */
    brewTier?: 0 | 1 | 2 | 3
    /** Можно выпить кликом */
    drinkable?: boolean
}

export type InventoryItem = Mushroom | Potion

export type MushroomPosition = [number, number, number]

export interface MushroomModelLayout {
    scale: number
    position: MushroomPosition
}

export interface MushroomDragLayout extends MushroomModelLayout {
    /** Позиция слота инвентаря в локальных координатах камеры */
    slotPosition: MushroomPosition
}

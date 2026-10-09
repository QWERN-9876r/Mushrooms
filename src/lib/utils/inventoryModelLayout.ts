import { Box3, Object3D, Vector3 } from 'three'
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js'
import type { MushroomPosition } from '$lib/components/threlte/components/types'

export type InventoryModelLayout = {
    scale: number
    position: MushroomPosition
}

const layoutCache = new Map<string, InventoryModelLayout>()

export function getInventoryLayoutCache(
    path: string,
): InventoryModelLayout | undefined {
    return layoutCache.get(path)
}

export function computeInventoryModelLayout(
    scene: Object3D,
    width: number,
    height: number,
    offset?: MushroomPosition,
): InventoryModelLayout {
    const box = new Box3().setFromObject(scene)
    const size = new Vector3()
    box.getSize(size)

    const center = new Vector3()
    box.getCenter(center)

    const scaleX = width / (size.x || 1)
    const scaleY = height / (size.y || 1)
    const scaleZ = width / (size.z || 1)

    const scale = Math.min(scaleX, scaleY, scaleZ)
    const manualOffsetY = offset?.[1] ? offset[1] * scale : 0

    return {
        scale,
        position: [
            -center.x * scale,
            -center.y * scale - manualOffsetY,
            -center.z * scale,
        ],
    }
}

/** Клонирует сцену и кеширует layout — прогрев тяжёлого clone/Box3 до первого показа в инвентаре */
export function warmupInventoryModelLayout(
    scene: Object3D,
    path: string,
    width = 0.35,
    height = 0.35,
    offset?: MushroomPosition,
): InventoryModelLayout {
    const cached = layoutCache.get(path)
    if (cached) return cached

    const cloned = SkeletonUtils.clone(scene)
    const layout = computeInventoryModelLayout(cloned, width, height, offset)
    layoutCache.set(path, layout)
    return layout
}

export function clearInventoryLayoutCache(): void {
    layoutCache.clear()
}

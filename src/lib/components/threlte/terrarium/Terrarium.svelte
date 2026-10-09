<script lang="ts">
    import { Raycaster, Vector2, Vector3 } from 'three'
    import { T, useTask, useThrelte } from '@threlte/core'
    import { useGltf, interactivity } from '@threlte/extras'
    import { normalizeMouse } from '$lib/stores/mouse'
    import Forest from '../components/Forest.svelte'
    import Inventory3D from '../components/ui/Inventory3D.svelte'
    import InventoryMushroomModel from '../components/ui/InventoryMushroomModel.svelte'
    import { inventory } from '$lib/stores/inventory.svelte'
    import { cauldron } from '$lib/stores/cauldron.svelte'
    import { poison } from '$lib/stores/poison.svelte'
    import { withBase } from '$lib/utils/publicPath'
    import { drinkPotion } from '$lib/utils/potionEffects'
    import type {
        InventoryItem,
        MushroomDragLayout,
        MushroomPosition,
    } from '../components/types'

    interactivity()

    const gltfResult = useGltf(withBase('/models/terrarium.glb'))
    const boiler = useGltf(withBase('/models/cauldron.glb'))

    const { camera, canvas } = useThrelte()
    const worldPoint = new Vector3()

    const basePos = { x: 0, y: 2, z: 6 }
    let targetX = $state(0)
    let currentX = $state(0)

    const ndcMouse = new Vector2()
    const raycaster = new Raycaster()

    const handleMouseMove = (e: MouseEvent) => {
        const { x, y } = normalizeMouse(
            e.clientX,
            e.clientY,
            window.innerWidth,
            window.innerHeight,
        )
        const deadzone = 0.1
        targetX = Math.abs(x) < deadzone ? 0 : x * 0.6

        ndcMouse.x = x
        ndcMouse.y = y
    }

    $effect(() => {
        if (canvas) {
            canvas.addEventListener('mousemove', handleMouseMove)
            return () =>
                canvas?.removeEventListener('mousemove', handleMouseMove)
        }
    })

    useTask(() => {
        currentX += (targetX - currentX) * 0.04
        camera.current.position.x = basePos.x + currentX * 1.2
        camera.current.position.y = basePos.y
        camera.current.position.z = basePos.z
        camera.current.lookAt(0, 0.3, 0)
    })

    let draggedItem = $state<{
        itemData: InventoryItem
        id: string
        scale: number
        modelPosition: MushroomPosition
    } | null>(null)
    let draggedPosition = $state<MushroomPosition>([0, 0, 0])

    const toCameraLocal = (position: MushroomPosition): MushroomPosition => {
        worldPoint.set(position[0], position[1], position[2])
        camera.current.worldToLocal(worldPoint)
        return [worldPoint.x, worldPoint.y, worldPoint.z]
    }

    const handleDragStart = (
        item: InventoryItem,
        id: string,
        layout: MushroomDragLayout,
    ) => {
        if (poison.isDead) return

        draggedItem = {
            itemData: item,
            id,
            scale: layout.scale,
            modelPosition: layout.position,
        }
        draggedPosition = layout.slotPosition
    }

    const handleDragMove = (position: MushroomPosition) => {
        const local = toCameraLocal(position)
        draggedPosition = [local[0], local[1], draggedPosition[2]]
    }

    const handleDragEnd = () => {
        if (!draggedItem) return

        const dropped = draggedItem
        draggedItem = null

        raycaster.setFromCamera(ndcMouse, camera.current)

        if ($boiler?.scene) {
            const intersects = raycaster.intersectObject($boiler.scene, true)

            if (
                intersects.length > 0 &&
                cauldron.addIngredient(dropped.id)
            ) {
                inventory.removeItem(dropped.id)
            }
        }
    }

    const handleDrinkPotion = (potionName: string) => {
        if (poison.isDead) return
        drinkPotion(potionName)
    }

    $effect(() => {
        if (!canvas || !draggedItem) return

        canvas.addEventListener('pointerup', handleDragEnd)
        return () => canvas.removeEventListener('pointerup', handleDragEnd)
    })
</script>

<T.DirectionalLight position={[0, 0.1, 1]} intensity={1} castShadow />
<T.AmbientLight intensity={0.6} />
<T.PointLight position={[-5, 5, -5]} intensity={0.8} color="#a78bfa" />

{#if $gltfResult?.scene && $boiler?.scene}
    <Inventory3D
        isOpen
        position="left"
        allowCauldronIngredients
        items={inventory.items}
        draggingItemId={draggedItem?.id ?? null}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
        onDrinkPotion={handleDrinkPotion}
    />

    <T
        is={$gltfResult.scene}
        rotation={[-0.2, 0, 0]}
        scale={1.5}
        position={[0, -0.1, 15]}
    />
    <Forest />

    <T
        is={$boiler.scene}
        position={[0, -1.5, 0]}
        rotation={[0, 0, 0]}
        scale={0.01}
    />

    {#if draggedItem && $camera}
        <T is={$camera} attach={false}>
            <T.Group position={draggedPosition}>
                <InventoryMushroomModel
                    path={draggedItem.itemData.modelPath}
                    width={0.35}
                    height={0.35}
                    offset={draggedItem.itemData.position}
                    rare={draggedItem.itemData.rare}
                    presetScale={draggedItem.scale}
                    presetPosition={draggedItem.modelPosition}
                />
            </T.Group>
        </T>
    {/if}
{/if}

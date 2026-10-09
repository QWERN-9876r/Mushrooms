<script lang="ts">
    import { T } from '@threlte/core'
    import { useGltf, type EventMap } from '@threlte/extras'
    import { GLTF_OPTIONS } from '$lib/utils/gltfOptions'
    import { Mesh, Object3D, type Object3DEventMap } from 'three'
    import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js'
    import { withBase } from '$lib/utils/publicPath'
    import type { MushroomModelLayout, MushroomPosition } from '../types'
    import {
        computeInventoryModelLayout,
        getInventoryLayoutCache,
    } from '$lib/utils/inventoryModelLayout'

    interface Props {
        path: string
        width: number
        height: number
        rare?: 'rare' | 'legendary'
        offset?: MushroomPosition
        presetScale?: number
        presetPosition?: MushroomPosition
        isDraggable?: boolean
        onUse?: () => void
        onHoverChange?: (hovered: boolean) => void
        onDragStart?: (layout: MushroomModelLayout) => void
        onDragMove?: (position: MushroomPosition) => void
        onDragEnd?: () => void
    }

    let {
        path,
        width,
        height,
        rare,
        offset,
        presetScale,
        presetPosition,
        isDraggable = false,
        onUse,
        onHoverChange,
        onDragStart,
        onDragMove,
        onDragEnd,
    }: Props = $props()

    const loader = useGltf(GLTF_OPTIONS)
    const gltfStore = $derived(loader.load(withBase(path)))

    let isComponentActive = true
    let finalScale = $state(1)
    let finalPosition = $state<[number, number, number]>([0, 0, 0])

    const lightColor = $derived(rare === 'legendary' ? '#ff5500' : '#0077ff')
    const lightIntensity = $derived(rare === 'legendary' ? 4.0 : 2.5)

    $effect(() => {
        if (presetScale !== undefined && presetPosition !== undefined) {
            finalScale = presetScale
            finalPosition = presetPosition
        }
    })

    const handleCreate = (clonedScene: Object3D<Object3DEventMap>) => {
        if (!clonedScene) return

        clonedScene.traverse((child) => {
            if (child instanceof Mesh) {
                child.raycast = () => {}
            }
        })

        if (presetScale !== undefined && presetPosition !== undefined) return

        const cached = getInventoryLayoutCache(path)
        if (cached) {
            finalScale = cached.scale
            finalPosition = cached.position
        } else {
            const layout = computeInventoryModelLayout(
                clonedScene,
                width,
                height,
                offset,
            )
            finalScale = layout.scale
            finalPosition = layout.position
        }

        const animate = () => {
            if (!isComponentActive || !clonedScene) return
            // Крутим гриб только если его НЕ тащат прямо сейчас
            if (!isDraggingSelf) {
                clonedScene.rotation.y += 0.01
            }
            requestAnimationFrame(animate)
        }
        animate()
    }

    // Локальное состояние, чтобы понимать, тащит ли пользователь именно этот гриб
    let isDraggingSelf = $state(false)
    let pointerDown = $state(false)
    let dragStarted = $state(false)
    let pointerStartX = 0
    let pointerStartY = 0

    const DRAG_THRESHOLD_PX = 6
    /** Шире визуала — проще кликать и тащить */
    const HIT_PAD = 1.75

    function resetPointerState() {
        pointerDown = false
        dragStarted = false
    }

    function finishPointerInteraction() {
        if (!pointerDown) return

        if (isDraggingSelf) {
            isDraggingSelf = false
            onDragEnd?.()
        } else if (onUse) {
            onUse()
        }

        resetPointerState()
    }

    function tryStartDrag(e: EventMap['onpointerdown']) {
        if (dragStarted || !isDraggable) return

        dragStarted = true
        isDraggingSelf = true
        onDragStart?.({
            scale: finalScale,
            position: finalPosition,
        })

        if (e.point) {
            onDragMove?.([e.point.x, e.point.y, e.point.z])
        }
    }

    $effect(() => {
        if (!pointerDown || typeof window === 'undefined') return

        const onGlobalPointerUp = () => finishPointerInteraction()

        window.addEventListener('pointerup', onGlobalPointerUp)
        return () => window.removeEventListener('pointerup', onGlobalPointerUp)
    })

    $effect(() => {
        return () => {
            isComponentActive = false
        }
    })
</script>

{#key path}
    {#if $gltfStore?.scene}
        {@const gltf = $gltfStore}
        <!-- 
          Добавляем обработчики событий Threlte на корневую группу.
          Они будут активны, только если передан флаг isDraggable={true}.
        -->
        <T.Group>
            <T.Mesh
                position={[0, 0, 0.02]}
                onpointerenter={() => onHoverChange?.(true)}
                onpointerleave={() => onHoverChange?.(false)}
                onpointerdown={(e: EventMap['onpointerdown']) => {
                    if (!isDraggable && !onUse) return

                    e.stopPropagation()
                    pointerDown = true
                    dragStarted = false
                    pointerStartX = e.nativeEvent.clientX
                    pointerStartY = e.nativeEvent.clientY
                }}
                onpointermove={(e: EventMap['onpointermove']) => {
                    if (!pointerDown) return
                    e.stopPropagation()

                    if (!dragStarted && isDraggable) {
                        const dx = e.nativeEvent.clientX - pointerStartX
                        const dy = e.nativeEvent.clientY - pointerStartY
                        if (Math.hypot(dx, dy) >= DRAG_THRESHOLD_PX) {
                            tryStartDrag(e)
                        }
                    }

                    if (!isDraggingSelf || !onDragMove) return
                    if (e.point) {
                        onDragMove([e.point.x, e.point.y, e.point.z])
                    }
                }}
                onpointerup={(e: EventMap['onpointerup']) => {
                    if (!pointerDown) return
                    e.stopPropagation()
                    finishPointerInteraction()
                }}
                onpointercancel={() => {
                    if (isDraggingSelf) {
                        isDraggingSelf = false
                        onDragEnd?.()
                    }
                    resetPointerState()
                }}
            >
                <T.PlaneGeometry args={[width * HIT_PAD, height * HIT_PAD]} />
                <T.MeshBasicMaterial
                    transparent
                    opacity={0}
                    depthWrite={false}
                />
            </T.Mesh>

            <T.Group scale={finalScale} position={finalPosition}>
                <T
                    is={SkeletonUtils.clone(gltf.scene)}
                    oncreate={handleCreate}
                />

                {#if rare}
                    <T.PointLight
                        color={lightColor}
                        intensity={lightIntensity}
                        distance={width * 3}
                        position={[0, 0, 0]}
                    />
                {/if}
            </T.Group>
        </T.Group>
    {/if}
{/key}

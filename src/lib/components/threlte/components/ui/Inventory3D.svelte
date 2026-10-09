<script lang="ts">
    import { T, useThrelte } from '@threlte/core'
    import InventoryMushroomModel from './InventoryMushroomModel.svelte'
    import { HTML, type EventMap } from '@threlte/extras'
    import type {
        InventoryItem,
        MushroomDragLayout,
        MushroomPosition,
    } from '../types'
    import {
        getInventoryItem,
        getPotionInventoryHint,
        isDrinkable,
        isMushroom,
        isPotion,
    } from '$lib/utils/inventoryItems'
    import { getPotionEffectDescription } from '$lib/utils/potionEffects'
    import { MathUtils, type PerspectiveCamera } from 'three'

    /** Ниже LoadingOverlay (100000), на уровне HUD */
    const INVENTORY_COUNT_Z_INDEX: [number, number] = [45, 0]
    const INVENTORY_TOOLTIP_Z_INDEX: [number, number] = [46, 46]
    export const INVENTORY_CAMERA_Z = -3.5
    const GRID_COLS = 3
    const ROW_STEP = 0.5
    /** 10% отступ сверху и снизу → максимальная высота инвентаря 80vh */
    const INVENTORY_HEIGHT_RATIO = 0.8

    function viewportHeightAtDepth(
        camera: PerspectiveCamera,
        depth: number,
    ): number {
        const vFov = MathUtils.degToRad(camera.fov)
        return 2 * Math.abs(depth) * Math.tan(vFov / 2)
    }

    function getRowOffsetY(
        row: number,
        totalRows: number,
        viewportHeight: number,
        scrollable: boolean,
    ): number {
        if (scrollable) {
            return viewportHeight / 2 - row * ROW_STEP
        }
        return ((totalRows - 1) / 2 - row) * ROW_STEP
    }

    function isRowInViewport(
        row: number,
        totalRows: number,
        viewportHeight: number,
        scrollable: boolean,
        scroll: number,
    ): boolean {
        const y =
            getRowOffsetY(row, totalRows, viewportHeight, scrollable) + scroll
        const half = viewportHeight / 2
        const margin = ROW_STEP * 0.55
        return y >= -half - margin && y <= half + margin
    }

    interface Props {
        items: Record<string, number>
        isOpen: boolean
        position?: 'left' | 'center'
        depthZ?: number
        onDragStart?: (
            item: InventoryItem,
            id: string,
            layout: MushroomDragLayout,
        ) => void
        onDragMove?: (position: MushroomPosition) => void
        onDragEnd?: () => void
        onDrinkPotion?: (potionName: string) => void
        draggingItemId?: string | null
        allowCauldronIngredients?: boolean
    }

    let {
        items,
        isOpen = $bindable(),
        onDragStart,
        onDragMove,
        onDragEnd,
        onDrinkPotion,
        position = 'center',
        depthZ = INVENTORY_CAMERA_Z,
        draggingItemId = null,
        allowCauldronIngredients = false,
    }: Props = $props()
    const { camera, canvas } = useThrelte()

    let activeModelsData = $derived.by(() => {
        if (!isOpen) return []
        return Object.keys(items)
            .map((name) => {
                const itemData = getInventoryItem(name)
                if (!itemData) return null
                return {
                    name,
                    itemData,
                    count: items[name],
                    isMushroom: isMushroom(name),
                    isDrinkable: isDrinkable(name),
                    canGoToCauldron: allowCauldronIngredients && isPotion(name),
                }
            })
            .filter(Boolean) as Array<{
            name: string
            itemData: InventoryItem
            count: number
            isMushroom: boolean
            isDrinkable: boolean
            canGoToCauldron: boolean
        }>
    })

    const inventoryX = $derived(position === 'left' ? -1.2 : 0)
    const countTransform = $derived(
        position === 'left'
            ? 'translate(30px, -50px)'
            : 'translate(40px, -70px)',
    )

    // Флаг, чтобы активировать плоскость перетаскивания только в процессе drag-and-drop
    let isAnyItemDragging = $state(false)
    let hoveredItemName = $state<string | null>(null)
    let scrollOffset = $state(0)

    const viewportWorldHeight = $derived.by(() => {
        if (!$camera) return 2.3
        return (
            viewportHeightAtDepth(
                $camera as PerspectiveCamera,
                Math.abs(depthZ),
            ) * INVENTORY_HEIGHT_RATIO
        )
    })

    const totalRows = $derived(Math.ceil(activeModelsData.length / GRID_COLS))
    const maxVisibleRows = $derived(
        Math.max(1, Math.floor(viewportWorldHeight / ROW_STEP)),
    )
    const maxScroll = $derived(
        Math.max(0, (totalRows - maxVisibleRows) * ROW_STEP),
    )
    const isScrollable = $derived(maxScroll > 0)

    $effect(() => {
        if (!draggingItemId) {
            isAnyItemDragging = false
        }
    })

    $effect(() => {
        if (!isOpen) {
            hoveredItemName = null
            scrollOffset = 0
        }
    })

    $effect(() => {
        scrollOffset = Math.min(scrollOffset, maxScroll)
    })

    $effect(() => {
        if (!isOpen || typeof window === 'undefined') return

        const onWheel = (event: WheelEvent) => {
            if (isAnyItemDragging || !isScrollable) return

            event.preventDefault()
            scrollOffset = Math.min(
                maxScroll,
                Math.max(0, scrollOffset + event.deltaY * 0.0025),
            )
        }

        window.addEventListener('wheel', onWheel, { passive: false })
        canvas?.addEventListener('wheel', onWheel, { passive: false })

        return () => {
            window.removeEventListener('wheel', onWheel)
            canvas?.removeEventListener('wheel', onWheel)
        }
    })
</script>

{#if isOpen && $camera}
    <T is={$camera} attach={false}>
        <T.PointLight position={[0, 2, -2]} intensity={2.0} />

        <T.Group position={[inventoryX, 0, depthZ]}>
            <!-- 
              НЕВИДИМАЯ ЗОНА ДЛЯ МЫШИ (ПЛОСКОСТЬ)
              Она перехватывает движение мыши, когда мы тащим гриб, 
              и передает наверх актуальные мировые координаты.
            -->
            {#if isAnyItemDragging}
                <T.Mesh
                    position={[0, scrollOffset, 0]}
                    onpointermove={(e: EventMap['onpointermove']) => {
                        const p = e.intersections[0]?.point
                        if (p) onDragMove?.([p.x, p.y, p.z])
                    }}
                    onpointerup={() => {
                        isAnyItemDragging = false
                        onDragEnd?.()
                    }}
                >
                    <T.PlaneGeometry args={[10, 10]} />
                    <!-- Делаем плоскость полностью прозрачной -->
                    <T.MeshBasicMaterial
                        transparent
                        opacity={0}
                        depthWrite={false}
                    />
                </T.Mesh>
            {/if}

            <T.Group position={[0, scrollOffset, 0]}>
                {#each activeModelsData as item, index (item.name)}
                    {@const row = Math.floor(index / GRID_COLS)}
                    {@const col = index % GRID_COLS}
                    {@const rowVisible = isRowInViewport(
                        row,
                        totalRows,
                        viewportWorldHeight,
                        isScrollable,
                        scrollOffset,
                    )}

                    {@const totalCols = Math.min(
                        activeModelsData.length,
                        GRID_COLS,
                    )}

                    {@const offsetX =
                        col * ROW_STEP - ((totalCols - 1) * ROW_STEP) / 2}
                    {@const offsetY = getRowOffsetY(
                        row,
                        totalRows,
                        viewportWorldHeight,
                        isScrollable,
                    )}

                    {#if rowVisible}
                        <T.Group position={[offsetX, offsetY, 0]}>
                            <HTML
                                pointerEvents="none"
                                wrapperClass="inventory-html"
                                zIndexRange={INVENTORY_COUNT_Z_INDEX}
                            >
                                <div
                                    class={`mushroom-count ${item.itemData.rare || ''}`}
                                    style:transform={countTransform}
                                >
                                    {item.count}
                                </div>
                            </HTML>

                            {#if hoveredItemName === item.name}
                                <HTML
                                    pointerEvents="none"
                                    wrapperClass="inventory-html inventory-html--tooltip"
                                    zIndexRange={INVENTORY_TOOLTIP_Z_INDEX}
                                >
                                    {#if item.isMushroom}
                                        <div class="inventory-tooltip">
                                            <div
                                                class={`inventory-tooltip__name ${item.itemData.rare || ''}`}
                                            >
                                                {item.name}
                                            </div>
                                        </div>
                                    {:else}
                                        {@const effectText =
                                            getPotionEffectDescription(
                                                item.name,
                                            )}
                                        {@const actionHint =
                                            getPotionInventoryHint(
                                                item.name,
                                                allowCauldronIngredients,
                                            )}
                                        <div class="inventory-tooltip">
                                            <div
                                                class={`inventory-tooltip__name ${item.itemData.rare || ''}`}
                                            >
                                                {item.name}
                                            </div>
                                            {#if effectText}
                                                <div
                                                    class="inventory-tooltip__effect"
                                                >
                                                    {effectText}
                                                </div>
                                            {/if}
                                            {#if actionHint}
                                                <div
                                                    class="inventory-tooltip__action"
                                                >
                                                    {actionHint}
                                                </div>
                                            {/if}
                                        </div>
                                    {/if}
                                </HTML>
                            {/if}

                            {#if draggingItemId !== item.name}
                                <InventoryMushroomModel
                                    path={item.itemData.modelPath}
                                    width={0.35}
                                    height={0.35}
                                    offset={item.itemData.position}
                                    rare={item.itemData.rare}
                                    isDraggable={item.count > 0 &&
                                        (item.isMushroom ||
                                            item.canGoToCauldron)}
                                    onUse={item.isDrinkable && item.count > 0
                                        ? () => onDrinkPotion?.(item.name)
                                        : undefined}
                                    onHoverChange={(hovered) => {
                                        if (hovered) {
                                            hoveredItemName = item.name
                                        } else if (
                                            hoveredItemName === item.name
                                        ) {
                                            hoveredItemName = null
                                        }
                                    }}
                                    onDragStart={(layout) => {
                                        if (
                                            !item.isMushroom &&
                                            !item.canGoToCauldron
                                        )
                                            return
                                        isAnyItemDragging = true
                                        onDragStart?.(
                                            item.itemData,
                                            item.name,
                                            {
                                                ...layout,
                                                slotPosition: [
                                                    inventoryX + offsetX,
                                                    offsetY + scrollOffset,
                                                    depthZ,
                                                ],
                                            },
                                        )
                                    }}
                                    onDragMove={(pos) => {
                                        onDragMove?.(pos)
                                    }}
                                    onDragEnd={() => {
                                        isAnyItemDragging = false
                                        onDragEnd?.()
                                    }}
                                />
                            {/if}
                        </T.Group>
                    {/if}
                {/each}
            </T.Group>
        </T.Group>
    </T>
{/if}

<style>
    :global(.inventory-html),
    :global(.inventory-html *) {
        user-select: none;
        -webkit-user-select: none;
    }

    :global(.inventory-html--tooltip) {
        width: 24px;
        height: 32px;
    }

    /* Стили остаются без изменений */
    .mushroom-count {
        position: relative;
        z-index: 1;
        width: 24px;
        height: 24px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-family: var(--font-display);
        font-size: 22px;
        font-weight: 700;
        font-variant-numeric: tabular-nums;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.9);
        pointer-events: none;
    }
    .rare {
        color: rgb(0, 38, 255);
        text-shadow: 0px 0 8px rgba(0, 38, 255, 0.6);
    }
    .legendary {
        color: rgb(240, 240, 9);
        text-shadow: 0 0 8px rgba(240, 240, 9, 0.6);
    }

    .inventory-tooltip {
        position: absolute;
        left: 50%;
        top: calc(100% + 8px);
        transform: translateX(-50%);
        min-width: 160px;
        max-width: 220px;
        padding: 8px 10px;
        border-radius: 10px;
        background: rgba(15, 23, 42, 0.92);
        border: 1px solid rgba(253, 224, 71, 0.28);
        pointer-events: none;
        text-align: center;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
        z-index: 20;
    }

    .inventory-tooltip__name {
        color: white;
        font-size: 16px;
        font-weight: 700;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.9);
    }

    .inventory-tooltip__name:not(:last-child) {
        margin-bottom: 4px;
    }

    .inventory-tooltip__name.rare {
        color: rgb(0, 38, 255);
        text-shadow: 0 0 8px rgba(0, 38, 255, 0.6);
    }

    .inventory-tooltip__name.legendary {
        color: rgb(240, 240, 9);
        text-shadow: 0 0 8px rgba(240, 240, 9, 0.6);
    }

    .inventory-tooltip__effect {
        color: #cbd5e1;
        font-size: 14px;
        line-height: 1.35;
    }

    .inventory-tooltip__action {
        margin-top: 6px;
        color: #fde68a;
        font-size: 13px;
        opacity: 0.85;
        font-style: italic;
    }
</style>

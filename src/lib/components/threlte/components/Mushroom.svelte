<script lang="ts">
    import { T } from '@threlte/core'
    import { useGltf } from '@threlte/extras'
    import { GLTF_OPTIONS } from '$lib/utils/gltfOptions'
    import type { Mushroom, MushroomPosition } from './types'
    import { inventory } from '$lib/stores/inventory.svelte'
    import { poison } from '$lib/stores/poison.svelte'
    import { withBase } from '$lib/utils/publicPath'

    interface Props {
        mushroom: { position: MushroomPosition; mushroom: Mushroom }
        onCollect: () => void // Функция коллбека сбора
    }

    let { mushroom: props, onCollect }: Props = $props()

    let { mushroom, position } = $derived(props)

    const muthroomPosition: MushroomPosition = $derived([
        position[0] + (mushroom.position?.[0] || 0),
        position[1] + (mushroom.position?.[1] || -0.1),
        position[2] + (mushroom.position?.[2] || 0),
    ])

    const loader = useGltf(GLTF_OPTIONS)
    const currentPath = $derived(mushroom.modelPath)
    const gltfMushroom = $derived(loader.load(withBase(currentPath)))

    // Обработчик клика по грибу
    const handleMushroomClick = (e: any) => {
        if (poison.isDead) return

        e.stopPropagation()

        poison.resumeAfterAction()
        inventory.addItem(mushroom.id)

        onCollect()
    }
</script>

{#key currentPath}
    {#if $gltfMushroom?.scene}
        <T
            is={$gltfMushroom.scene}
            position={muthroomPosition}
            scale={mushroom.scale}
            rotation={[0, 0, 0]}
            onpointerdown={handleMushroomClick}
            receiveShadow
            castShadow
        />
    {/if}
{/key}

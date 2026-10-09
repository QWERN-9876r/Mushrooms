<script lang="ts">
    import { onMount } from 'svelte'
    import { T } from '@threlte/core'
    import { useGltf } from '@threlte/extras'
    import { GLTF_OPTIONS } from '$lib/utils/gltfOptions'
    import InventoryMushroomModel from './components/ui/InventoryMushroomModel.svelte'
    import { getPotionByModelPath } from './components/potions'
    import { pageLoad } from '$lib/stores/pageLoad.svelte'
    import { getAllPotionModelUrls } from '$lib/utils/getAssetUrls'
    import { warmupInventoryModelLayout } from '$lib/utils/inventoryModelLayout'
    import { withBase } from '$lib/utils/publicPath'

    interface Props {
        urls: string[]
    }

    let { urls }: Props = $props()

    const { load } = useGltf(GLTF_OPTIONS)

    const INVENTORY_ITEM_SIZE = 0.35
    const potionUrlSet = new Set(getAllPotionModelUrls())
    const potionWarmupUrls = $derived(
        urls.filter((url) => potionUrlSet.has(url)),
    )

    let gpuWarmupActive = $state(false)
    let gpuWarmupIndex = $state(0)

    const waitFrames = (count: number) =>
        new Promise<void>((resolve) => {
            let remaining = count
            const tick = () => {
                remaining--
                if (remaining <= 0) {
                    resolve()
                    return
                }
                requestAnimationFrame(tick)
            }
            requestAnimationFrame(tick)
        })

    const runGpuWarmup = async () => {
        if (potionWarmupUrls.length === 0) {
            pageLoad.complete()
            return
        }

        gpuWarmupActive = true
        pageLoad.setProgress(0.92)

        for (let i = 0; i < potionWarmupUrls.length; i++) {
            gpuWarmupIndex = i
            pageLoad.setProgress(0.92 + (i / potionWarmupUrls.length) * 0.08)
            await waitFrames(2)
        }

        gpuWarmupActive = false
        pageLoad.complete()
    }

    onMount(() => {
        pageLoad.reset()
        ;(async () => {
            if (urls.length === 0) {
                pageLoad.complete()
                return
            }

            let loaded = 0

            try {
                for (const url of urls) {
                    const gltf = await load(withBase(url))

                    if (potionUrlSet.has(url) && gltf?.scene) {
                        const potion = getPotionByModelPath(url)
                        warmupInventoryModelLayout(
                            gltf.scene,
                            url,
                            INVENTORY_ITEM_SIZE,
                            INVENTORY_ITEM_SIZE,
                            potion?.position,
                        )
                    }

                    loaded++
                    pageLoad.setProgress((loaded / urls.length) * 0.9)
                }

                await runGpuWarmup()
            } catch (error) {
                console.error('Scene preload failed:', error)
                pageLoad.complete()
            }
        })()
    })
</script>

{#if gpuWarmupActive && potionWarmupUrls[gpuWarmupIndex]}
    <T.Group visible={false} position={[0, 0, -500]}>
        {@const potion = getPotionByModelPath(potionWarmupUrls[gpuWarmupIndex])}
        <InventoryMushroomModel
            path={potionWarmupUrls[gpuWarmupIndex]}
            width={INVENTORY_ITEM_SIZE}
            height={INVENTORY_ITEM_SIZE}
            offset={potion?.position}
        />
    </T.Group>
{/if}

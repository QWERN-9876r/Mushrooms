<script lang="ts">
    import { normalizeMouse } from '$lib/stores/mouse'
    import { T, useTask, useThrelte } from '@threlte/core'
    import { HTML, useGltf } from '@threlte/extras'
    import { withBase } from '$lib/utils/publicPath'
    import Mushrooms from '../components/Mushrooms.svelte'
    import { interactivity } from '@threlte/extras'
    import type { MushroomPosition } from '../components/types'
    import { generateMushrooms } from '$lib/utils/generateMushrooms'
    import { throttle } from '$lib/utils/throttle'
    import { poison } from '$lib/stores/poison.svelte'
    import type { PerspectiveCamera } from 'three'
    import { MUSHROOMS } from '../components/constants'
    import { inventory } from '$lib/stores/inventory.svelte'
    import InventoryMushroomModel from '../components/ui/InventoryMushroomModel.svelte'
    import Inventory3D from '../components/ui/Inventory3D.svelte'
    import { drinkPotion } from '$lib/utils/potionEffects'

    interactivity()

    interface Props {
        isInventoryOpen: boolean
    }
    let { isInventoryOpen = $bindable(false) }: Props = $props()

    const { camera } = useThrelte()

    // Формируем список грибов для отрисовки в 3D
    let activeMushroomModels = $derived.by(() => {
        if (!isInventoryOpen) return []
        return Object.entries(inventory.items)
            .map(([name, count]) => {
                const res = MUSHROOMS[name]?.[0]
                res.count = count

                return res
            })
            .filter(Boolean)
    })

    let cursor3D = $state({ x: 0, y: 0, z: 0 })
    let mushrooms = $state(generateMushrooms())

    const onPointerMove = (e: any) => {
        cursor3D = {
            x: Number(e.point.x.toFixed(2)),
            y: Number(e.point.y.toFixed(2)),
            z: Number(e.point.z.toFixed(2)),
        }
    }

    const removeMushroom = (indexToRemove: number) => {
        mushrooms = mushrooms.filter((_, idx) => idx !== indexToRemove)
    }

    const basePos = { x: 0, y: 2, z: 6 }
    let targetX = $state(0)
    let currentX = $state(0)
    let rotate = $state(Math.random() * 360)

    let dashProgress = $state(0)
    let isDashing = $state(false)
    let currentBlur = $state(0)
    const BASE_FOV = 45

    const handleMouseMove = (e: MouseEvent) => {
        const { x } = normalizeMouse(
            e.clientX,
            e.clientY,
            window.innerWidth,
            window.innerHeight,
        )
        const deadzone = 0.1
        targetX = Math.abs(x) < deadzone ? 0 : x * 0.6
    }

    const { canvas } = useThrelte()
    $effect(() => {
        if (canvas) {
            canvas.style.filter =
                currentBlur > 0 ? `blur(${currentBlur}px)` : 'none'
            canvas.style.transform =
                currentBlur > 0 ? `scale(${1 + currentBlur / 200})` : 'none'
            canvas.style.transition = 'transform 0.05s linear'
        }
    })

    $effect(() => {
        if (canvas) {
            canvas.addEventListener('mousemove', handleMouseMove)
            return () =>
                canvas.removeEventListener('mousemove', handleMouseMove)
        }
    })

    const handleSpacePress = throttle(() => {
        if (isDashing || poison.isDead) return

        poison.addDashPenalty()
        isDashing = true
        dashProgress = 0
        isInventoryOpen = false

        setTimeout(() => {
            mushrooms = generateMushrooms()
            rotate = Math.random() * 360
        }, 150)
    }, 800)

    const handleKeyDown = ({ key }: KeyboardEvent) => {
        if (key === ' ' && !poison.isDead) {
            handleSpacePress()
        }
    }

    $effect(() => {
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    })

    useTask((delta) => {
        currentX += (targetX - currentX) * 0.04
        camera.current.position.x = basePos.x + currentX * 1.2
        camera.current.position.y = basePos.y
        camera.current.position.z = basePos.z
        camera.current.lookAt(0, 2, 0)

        if (isDashing) {
            dashProgress += delta * 4.5

            const cam = camera.current as PerspectiveCamera

            if (dashProgress >= 1) {
                dashProgress = 1
                isDashing = false
                cam.fov = BASE_FOV
                currentBlur = 0
            } else {
                const wave = Math.sin(dashProgress * Math.PI)
                cam.fov = BASE_FOV - wave * 40
                currentBlur = wave * 15
            }

            cam.updateProjectionMatrix()
        }
    })

    const handleDrinkPotion = (potionName: string) => {
        if (poison.isDead) return
        drinkPotion(potionName)
    }

    const gltfForest = useGltf(withBase('/models/pine_forest.glb'))
</script>

{#if $gltfForest}
    <T.Group position={[basePos.x, basePos.y, basePos.z]}>
        <T.AmbientLight intensity={0.5} />
        <T.DirectionalLight position={[5, 20, 5]} intensity={2.5} castShadow />

        <T
            is={$gltfForest.scene}
            position={[0, -3, 0]}
            scale={1}
            rotation={[0, rotate, 0]}
            onpointermove={onPointerMove}
            receiveShadow
            castShadow
        />

        <Mushrooms mushroomsList={mushrooms} {removeMushroom} />
    </T.Group>
{/if}

<Inventory3D
    items={inventory.items}
    bind:isOpen={isInventoryOpen}
    onDrinkPotion={handleDrinkPotion}
/>

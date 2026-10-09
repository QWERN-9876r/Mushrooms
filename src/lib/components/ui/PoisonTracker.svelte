<script lang="ts">
    import { poison } from '$lib/stores/poison.svelte'

    interface Props {
        zone: 'forest' | 'terrarium'
    }

    let { zone }: Props = $props()

    $effect(() => {
        poison.setZone(zone)

        let last = performance.now()
        let frame = 0

        const tick = (now: number) => {
            const delta = Math.min((now - last) / 1000, 0.1)
            last = now
            poison.tick(delta)
            frame = requestAnimationFrame(tick)
        }

        frame = requestAnimationFrame(tick)

        return () => {
            cancelAnimationFrame(frame)
            poison.setZone('idle')
        }
    })
</script>

<script lang="ts">
    import { getRandomMushroom, MUSHROOM_POSITIONS } from './constants'
    import Mushroom from './Mushroom.svelte'
    import type { MushroomPosition } from './types'

    interface Props {
        mushroomsList: { position: MushroomPosition; mushroom: any }[]
        removeMushroom: (index: number) => void
    }
    let { mushroomsList, removeMushroom }: Props = $props()
</script>

<!-- Статические грибы -->
{#each mushroomsList as mushroom, index (mushroom.position)}
    <Mushroom {mushroom} onCollect={() => removeMushroom(index)} />
{/each}

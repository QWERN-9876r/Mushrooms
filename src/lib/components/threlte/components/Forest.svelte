<script lang="ts">
    import { T } from '@threlte/core'
    import { useGltf } from '@threlte/extras'
    import { withBase } from '$lib/utils/publicPath'

    const gltfForest = useGltf(withBase('/models/forest.glb'))
</script>

{#if $gltfForest?.scene}
    <T
        is={$gltfForest.scene}
        position={[0, -12, -50]}
        scale={1}
        rotation={[0, Math.PI, 0]}
    />
{/if}

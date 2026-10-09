<script lang="ts">
    import { browser } from '$app/environment'
    import ForestPage from '$lib/components/threlte/forest/ForestPage.svelte'
    import ScenePreload from '$lib/components/threlte/ScenePreload.svelte'
    import NavigationButton from '$lib/components/ui/NavigationButton.svelte'
    import LoadingOverlay from '$lib/components/ui/LoadingOverlay.svelte'
    import PoisonBar from '$lib/components/ui/PoisonBar.svelte'
    import PoisonDarkening from '$lib/components/ui/PoisonDarkening.svelte'
    import PoisonTracker from '$lib/components/ui/PoisonTracker.svelte'
    import DeathOverlay from '$lib/components/ui/DeathOverlay.svelte'
    import VictoryOverlay from '$lib/components/ui/VictoryOverlay.svelte'
    import PixiOverlay from '$lib/components/pixi/PixiOverlay.svelte'
    import VictoryCounter from '$lib/components/ui/VictoryCounter.svelte'
    import { Canvas, T } from '@threlte/core'
    import { inventory } from '$lib/stores/inventory.svelte'
    import { pageLoad } from '$lib/stores/pageLoad.svelte'
    import { poison } from '$lib/stores/poison.svelte'
    import { victory } from '$lib/stores/victory.svelte'
    import { getForestAssetUrls } from '$lib/utils/getAssetUrls'
    import { t } from '$lib/i18n'

    let isInventoryOpen = $state(false)
    const isJokeLabel = Math.random() > 0.9
    let isDead = $derived(pageLoad.ready && poison.isDead)
    let isVictory = $derived(pageLoad.ready && victory.celebrationActive)
</script>

<div class="game-screen" class:is-dead={isDead}>
    <div class="game-container">
        {#if browser}
            <Canvas autoRender={true} shadows={true}>
                <T.PerspectiveCamera
                    makeDefault
                    position={[0, 2, 6]}
                    fov={45}
                />
                <ScenePreload urls={getForestAssetUrls(inventory.items)} />
                {#if pageLoad.ready}
                    <ForestPage bind:isInventoryOpen />
                {/if}
            </Canvas>

            <PixiOverlay />

            {#if pageLoad.ready}
                <PoisonTracker zone="forest" />
            {/if}
        {/if}

        {#if pageLoad.ready && !poison.isDead && !victory.celebrationActive}
            <button
                class="inventory-toggle-btn"
                onclick={() => (isInventoryOpen = !isInventoryOpen)}
            >
                {t('forest.inventory')}
            </button>
        {/if}
    </div>

    {#if pageLoad.ready && !poison.isDead && !victory.celebrationActive}
        <NavigationButton href="/terrarium">
            {t('nav.cauldron')}
        </NavigationButton>
        <h2>{t('forest.dashHint')}</h2>
    {/if}

    {#if pageLoad.ready && !poison.isDead && !victory.celebrationActive}
        <PoisonDarkening strength={poison.darkness} />
    {/if}

    {#if pageLoad.ready && !poison.isDead && !victory.celebrationActive}
        <div class="poison-hud">
            <PoisonBar progress={poison.fillProgress} />
        </div>
    {/if}

    {#if pageLoad.ready}
        <VictoryCounter />
    {/if}
</div>

<LoadingOverlay
    progress={pageLoad.progress}
    visible={browser && !pageLoad.ready}
    label={t(isJokeLabel ? 'loading.forestJoke' : 'loading.forest')}
/>

<DeathOverlay visible={isDead} />
<VictoryOverlay visible={isVictory} />

<style>
    .game-screen {
        position: relative;
        width: 100vw;
        height: 100vh;
    }

    .game-container {
        position: relative;
        width: 100%;
        height: 100%;
        overflow: hidden;
    }

    .inventory-toggle-btn {
        position: absolute;
        bottom: 25px;
        right: 25px;
        background: #ffaa00;
        color: #111;
        border: none;
        padding: 12px 20px;
        font-family: var(--font-display);
        font-size: 16px;
        font-weight: 700;
        letter-spacing: 0.06em;
        border-radius: 8px;
        cursor: pointer;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
        z-index: 10;
        transition: transform 0.1s;
    }

    .inventory-toggle-btn:hover {
        transform: scale(1.05);
    }

    h2 {
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        font-family: var(--font-display);
        font-size: 19px;
        font-weight: 600;
        letter-spacing: 0.04em;
        color: #ffaa00;
        text-shadow:
            0 0 5px #ffaa00,
            0 0 10px #ffaa00,
            0 0 20px #ffaa00;
        z-index: 10;
    }

    .poison-hud {
        position: fixed;
        top: 1.25rem;
        left: 50%;
        z-index: 30;
        transform: translateX(-50%);
        pointer-events: none;
    }
</style>

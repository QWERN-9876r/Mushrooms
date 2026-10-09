<script lang="ts">
    import { browser } from '$app/environment'
    import { Canvas, T } from '@threlte/core'
    import Terrarium from '$lib/components/threlte/terrarium/Terrarium.svelte'
    import ScenePreload from '$lib/components/threlte/ScenePreload.svelte'
    import PixiOverlay from '$lib/components/pixi/PixiOverlay.svelte'
    import LoadingOverlay from '$lib/components/ui/LoadingOverlay.svelte'
    import CauldronFillBar from '$lib/components/ui/CauldronFillBar.svelte'
    import PoisonBar from '$lib/components/ui/PoisonBar.svelte'
    import PoisonDarkening from '$lib/components/ui/PoisonDarkening.svelte'
    import PoisonTracker from '$lib/components/ui/PoisonTracker.svelte'
    import DeathOverlay from '$lib/components/ui/DeathOverlay.svelte'
    import VictoryOverlay from '$lib/components/ui/VictoryOverlay.svelte'
    import VictoryCounter from '$lib/components/ui/VictoryCounter.svelte'
    import NavigationButton from '$lib/components/ui/NavigationButton.svelte'
    import { inventory } from '$lib/stores/inventory.svelte'
    import { cauldron } from '$lib/stores/cauldron.svelte'
    import { pageLoad } from '$lib/stores/pageLoad.svelte'
    import { poison } from '$lib/stores/poison.svelte'
    import { victory } from '$lib/stores/victory.svelte'
    import { getTerrariumAssetUrls } from '$lib/utils/getAssetUrls'

    let isDead = $derived(browser && pageLoad.ready && poison.isDead)
    let isVictory = $derived(pageLoad.ready && victory.celebrationActive)
</script>

<div class="game-screen" class:is-dead={isDead}>
    {#if browser}
        <Canvas autoRender={true} shadows={true}>
            <T.PerspectiveCamera makeDefault position={[0, 2, 6]} fov={45} />
            <ScenePreload urls={getTerrariumAssetUrls(inventory.items)} />
            {#if pageLoad.ready}
                <Terrarium />
            {/if}
        </Canvas>

        {#if pageLoad.ready}
            <PoisonTracker zone="terrarium" />
        {/if}

        <PixiOverlay active={pageLoad.ready && cauldron.isFull} />
    {/if}

    {#if browser && pageLoad.ready && !poison.isDead && !victory.celebrationActive}
        <NavigationButton href="/">Лес</NavigationButton>
    {/if}

    {#if browser && pageLoad.ready && !poison.isDead && !victory.celebrationActive}
        <PoisonDarkening strength={poison.darkness} />
    {/if}

    {#if browser && pageLoad.ready && !poison.isDead && !victory.celebrationActive}
        <div class="cauldron-fill-hud">
            <CauldronFillBar progress={cauldron.fillProgress} />
        </div>

        {#if cauldron.isFull}
            <button
                class="brew-btn"
                type="button"
                onclick={() => cauldron.brew()}
            >
                <span class="brew-btn__glow" aria-hidden="true"></span>
                <span class="brew-btn__label">Сварить</span>
            </button>
        {/if}
    {/if}

    {#if browser && pageLoad.ready && !poison.isDead && !victory.celebrationActive && poison.exposure > 0}
        <div class="status-hud">
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
    label={Math.random() > 0.9
        ? 'В жопу IT идем жить в котел'
        : 'Идем к котлу...'}
/>

<DeathOverlay visible={isDead} />
<VictoryOverlay visible={isVictory} />

<style>
    .game-screen {
        position: relative;
        width: 100vw;
        height: 100vh;
    }

    .cauldron-fill-hud {
        position: fixed;
        left: 50%;
        bottom: 36%;
        z-index: 20;
        transform: translateX(-50%);
        pointer-events: none;
    }

    .status-hud {
        position: fixed;
        top: 1.25rem;
        left: 50%;
        z-index: 30;
        transform: translateX(-50%);
        pointer-events: none;
    }

    .brew-btn {
        position: fixed;
        left: 50%;
        bottom: 15%;
        z-index: 20;
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 220px;
        padding: 1.15rem 3rem;
        border: 2px solid rgba(253, 224, 71, 0.85);
        border-radius: 999px;
        background: linear-gradient(
            180deg,
            #86efac 0%,
            #22c55e 45%,
            #15803d 100%
        );
        color: #fefce8;
        font-family: var(--font-display);
        font-size: 1.45rem;
        font-weight: 700;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        cursor: pointer;
        transform: translateX(-50%);
        box-shadow:
            0 0 0 4px rgba(74, 222, 128, 0.2),
            0 0 28px rgba(74, 222, 128, 0.75),
            0 0 56px rgba(250, 204, 21, 0.35),
            0 10px 28px rgba(0, 0, 0, 0.45);
        animation: brew-pulse 2.2s ease-in-out infinite;
        transition:
            transform 0.2s ease,
            box-shadow 0.2s ease,
            filter 0.2s ease;
    }

    .brew-btn__glow {
        position: absolute;
        inset: -6px;
        border-radius: inherit;
        background: radial-gradient(
            circle,
            rgba(250, 204, 21, 0.45) 0%,
            rgba(74, 222, 128, 0.15) 55%,
            transparent 72%
        );
        opacity: 0.9;
        pointer-events: none;
    }

    .brew-btn__label {
        position: relative;
        z-index: 1;
        text-shadow:
            0 0 10px rgba(254, 252, 232, 0.8),
            0 2px 4px rgba(0, 0, 0, 0.35);
    }

    .brew-btn:hover {
        transform: translateX(-50%) scale(1.08);
        filter: brightness(1.08);
        box-shadow:
            0 0 0 6px rgba(74, 222, 128, 0.28),
            0 0 36px rgba(74, 222, 128, 0.95),
            0 0 72px rgba(250, 204, 21, 0.55),
            0 14px 32px rgba(0, 0, 0, 0.5);
    }

    .brew-btn:active {
        transform: translateX(-50%) scale(1.02);
    }

    @keyframes brew-pulse {
        0%,
        100% {
            box-shadow:
                0 0 0 4px rgba(74, 222, 128, 0.2),
                0 0 24px rgba(74, 222, 128, 0.65),
                0 0 48px rgba(250, 204, 21, 0.28),
                0 10px 28px rgba(0, 0, 0, 0.45);
        }

        50% {
            box-shadow:
                0 0 0 8px rgba(74, 222, 128, 0.32),
                0 0 40px rgba(74, 222, 128, 0.95),
                0 0 80px rgba(250, 204, 21, 0.5),
                0 12px 30px rgba(0, 0, 0, 0.48);
        }
    }
</style>

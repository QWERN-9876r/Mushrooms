<script lang="ts">
    import { poison } from '$lib/stores/poison.svelte'

    const DEATH_ANIMATION_MS = 3000
    const DEATH_PAUSE_AFTER_MS = 3000

    interface Props {
        visible: boolean
    }

    let { visible }: Props = $props()

    $effect(() => {
        if (!visible) return

        const timeout = setTimeout(() => {
            poison.respawn()
        }, DEATH_ANIMATION_MS + DEATH_PAUSE_AFTER_MS)

        return () => clearTimeout(timeout)
    })
</script>

{#if visible}
    <div class="death-title-wrap" role="alert" aria-live="assertive">
        <p class="death-title">СМЕРТЬ</p>
    </div>
    <div class="death-veil" aria-hidden="true"></div>
{/if}

<style>
    :global(.game-screen.is-dead) {
        animation: death-game-fade 3s linear forwards;
    }

    @keyframes death-game-fade {
        from {
            opacity: 1;
        }

        to {
            opacity: 0;
        }
    }

    .death-title-wrap {
        position: fixed;
        inset: 0;
        z-index: 89999;
        display: flex;
        align-items: center;
        justify-content: center;
        pointer-events: none;
    }

    .death-title {
        margin: 0;
        font-family: var(--font-display);
        font-size: clamp(4rem, 18vw, 9rem);
        font-weight: 900;
        letter-spacing: 0.22em;
        line-height: 1;
        color: #5c1212;
        text-shadow:
            0 0 24px rgba(92, 18, 18, 0.75),
            0 0 48px rgba(61, 10, 10, 0.55),
            0 4px 20px rgba(0, 0, 0, 0.85),
            0 1px 0 rgba(26, 6, 6, 0.9);
    }

    .death-veil {
        position: fixed;
        inset: 0;
        z-index: 90000;
        background: #000000;
        opacity: 0;
        pointer-events: none;
        animation: death-veil 3s linear forwards;
    }

    @keyframes death-veil {
        from {
            opacity: 0;
        }

        to {
            opacity: 0.2;
        }
    }
</style>

<script lang="ts">
    import { VICTORY_GOAL, victory } from '$lib/stores/victory.svelte'
    import { t } from '$lib/i18n'

    interface Props {
        visible: boolean
    }

    let { visible }: Props = $props()
</script>

{#if visible}
    <div class="victory-backdrop" role="dialog" aria-modal="true" aria-labelledby="victory-title">
        <div class="victory-panel">
            <p id="victory-title" class="victory-title">{t('victory.title')}</p>
            <p class="victory-subtitle">
                {t('victory.subtitle', { goal: VICTORY_GOAL })}
            </p>
            <button
                type="button"
                class="victory-btn"
                onclick={() => victory.dismissCelebration()}
            >
                {t('victory.continue')}
            </button>
        </div>
    </div>
    <div class="victory-veil" aria-hidden="true"></div>
{/if}

<style>
    .victory-backdrop {
        position: fixed;
        inset: 0;
        z-index: 89999;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1.5rem;
        pointer-events: auto;
        animation: victory-backdrop-in 0.8s ease-out forwards;
    }

    .victory-panel {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1.25rem;
        max-width: min(560px, 100%);
        text-align: center;
        animation: victory-panel-in 1s ease-out 0.15s both;
    }

    .victory-title {
        margin: 0;
        font-family: var(--font-display);
        font-size: clamp(3.5rem, 16vw, 7.5rem);
        font-weight: 900;
        letter-spacing: 0.2em;
        line-height: 1;
        color: #fef08a;
        text-shadow:
            0 0 28px rgba(250, 204, 21, 0.9),
            0 0 56px rgba(234, 179, 8, 0.55),
            0 4px 24px rgba(0, 0, 0, 0.75);
        animation: victory-title-glow 2.4s ease-in-out infinite;
    }

    .victory-subtitle {
        margin: 0;
        font-size: clamp(1.1rem, 3.5vw, 1.45rem);
        line-height: 1.45;
        color: #fde68a;
        text-shadow: 0 2px 12px rgba(0, 0, 0, 0.55);
    }

    .victory-btn {
        margin-top: 0.5rem;
        padding: 0.85rem 2rem;
        border: 2px solid rgba(253, 224, 71, 0.75);
        border-radius: 999px;
        background: linear-gradient(
            180deg,
            rgba(250, 204, 21, 0.35) 0%,
            rgba(202, 138, 4, 0.55) 100%
        );
        color: #fffbeb;
        font-family: var(--font-display);
        font-size: 1rem;
        font-weight: 700;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        cursor: pointer;
        box-shadow:
            0 0 24px rgba(250, 204, 21, 0.35),
            0 8px 24px rgba(0, 0, 0, 0.35);
        transition:
            transform 0.2s ease,
            filter 0.2s ease,
            box-shadow 0.2s ease;
    }

    .victory-btn:hover {
        transform: scale(1.05);
        filter: brightness(1.08);
        box-shadow:
            0 0 36px rgba(250, 204, 21, 0.55),
            0 10px 28px rgba(0, 0, 0, 0.4);
    }

    .victory-veil {
        position: fixed;
        inset: 0;
        z-index: 89998;
        pointer-events: none;
        background: radial-gradient(
            circle at center,
            rgba(250, 204, 21, 0.22) 0%,
            rgba(120, 53, 15, 0.45) 55%,
            rgba(0, 0, 0, 0.72) 100%
        );
        animation: victory-veil-in 1.2s ease-out forwards;
    }

    @keyframes victory-backdrop-in {
        from {
            opacity: 0;
        }

        to {
            opacity: 1;
        }
    }

    @keyframes victory-panel-in {
        from {
            opacity: 0;
            transform: translateY(24px) scale(0.96);
        }

        to {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
    }

    @keyframes victory-veil-in {
        from {
            opacity: 0;
        }

        to {
            opacity: 1;
        }
    }

    @keyframes victory-title-glow {
        0%,
        100% {
            text-shadow:
                0 0 28px rgba(250, 204, 21, 0.9),
                0 0 56px rgba(234, 179, 8, 0.55),
                0 4px 24px rgba(0, 0, 0, 0.75);
        }

        50% {
            text-shadow:
                0 0 40px rgba(253, 224, 71, 1),
                0 0 80px rgba(250, 204, 21, 0.75),
                0 4px 24px rgba(0, 0, 0, 0.75);
        }
    }
</style>

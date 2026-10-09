<script lang="ts">
    import { browser } from '$app/environment'
    import { watchDesktopOnlyBlocked } from '$lib/utils/desktopOnly'
    import { t } from '$lib/i18n'

    let blocked = $state(false)

    $effect(() => {
        if (!browser) return
        return watchDesktopOnlyBlocked((value) => {
            blocked = value
        })
    })
</script>

{#if blocked}
    <div class="gate" role="dialog" aria-modal="true" aria-labelledby="desktop-only-title">
        <div class="gate__panel">
            <p class="gate__icon" aria-hidden="true">🖥️</p>
            <h1 id="desktop-only-title" class="gate__title">
                {t('desktopOnly.title')}
            </h1>
            <p class="gate__text">
                {t('desktopOnly.text')}
            </p>
        </div>
    </div>
{/if}

<style>
    .gate {
        position: fixed;
        inset: 0;
        z-index: 100001;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1.5rem;
        background: #0a0a0f;
        pointer-events: all;
    }

    .gate__panel {
        max-width: min(420px, 100%);
        text-align: center;
    }

    .gate__icon {
        margin: 0 0 1rem;
        font-size: 3rem;
        line-height: 1;
        filter: grayscale(0.2);
    }

    .gate__title {
        margin: 0 0 1rem;
        font-family: var(--font-display);
        font-size: clamp(1.75rem, 8vw, 2.25rem);
        font-weight: 700;
        letter-spacing: 0.12em;
        color: #c4b5fd;
        text-shadow: 0 0 20px rgba(167, 139, 250, 0.35);
    }

    .gate__text {
        margin: 0;
        font-size: clamp(1.05rem, 4vw, 1.2rem);
        line-height: 1.55;
        color: #94a3b8;
    }
</style>

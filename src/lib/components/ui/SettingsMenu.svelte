<script lang="ts">
    import { onDestroy } from 'svelte'
    import { t } from '$lib/i18n'
    import { LOCALE_LABELS, LOCALES } from '$lib/i18n/locales'
    import { settings } from '$lib/stores/settings.svelte'

    let panel = $state<HTMLDivElement>()

    const musicPercent = $derived(Math.round(settings.musicVolume * 100))

    $effect(() => {
        if (settings.menuOpen) panel?.focus()
    })

    /** Иначе пауза останется висеть, если меню пропало вместе с HUD */
    onDestroy(() => settings.closeMenu())

    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key !== 'Escape') return

        event.preventDefault()
        settings.toggleMenu()
    }

    const handleBackdropClick = (event: MouseEvent) => {
        if (event.target === event.currentTarget) settings.closeMenu()
    }
</script>

<svelte:window onkeydown={handleKeyDown} />

<button
    type="button"
    class="settings-toggle"
    aria-label={t('settings.open')}
    title={t('settings.open')}
    aria-haspopup="dialog"
    aria-expanded={settings.menuOpen}
    onclick={() => settings.openMenu()}
>
    <svg class="settings-toggle__icon" viewBox="0 0 24 24" aria-hidden="true">
        <path
            d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"
        />
        <circle cx="12" cy="12" r="3" />
    </svg>
</button>

{#if settings.menuOpen}
    <div
        class="settings-backdrop"
        role="presentation"
        onclick={handleBackdropClick}
    >
        <div
            bind:this={panel}
            class="settings-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="settings-title"
            tabindex="-1"
        >
            <header class="settings-header">
                <h2 id="settings-title" class="settings-title">
                    {t('settings.title')}
                </h2>
                <p class="settings-paused">{t('settings.paused')}</p>
            </header>

            <section
                class="settings-section"
                aria-labelledby="settings-language"
            >
                <h3 id="settings-language" class="settings-label">
                    {t('settings.language')}
                </h3>
                <div class="language-switch">
                    {#each LOCALES as locale (locale)}
                        <button
                            type="button"
                            class="language-option"
                            class:active={settings.locale === locale}
                            aria-pressed={settings.locale === locale}
                            lang={locale}
                            onclick={() => settings.setLocale(locale)}
                        >
                            {LOCALE_LABELS[locale]}
                        </button>
                    {/each}
                </div>
            </section>

            <section class="settings-section" aria-labelledby="settings-audio">
                <h3 id="settings-audio" class="settings-label">
                    {t('settings.audio')}
                </h3>
                <label class="volume-row">
                    <span>{t('settings.music')}</span>
                    <input
                        class="volume-slider"
                        type="range"
                        min="0"
                        max="100"
                        step="1"
                        value={musicPercent}
                        oninput={(event) =>
                            settings.setMusicVolume(
                                event.currentTarget.valueAsNumber / 100,
                            )}
                    />
                    <span class="volume-value">{musicPercent}%</span>
                </label>
            </section>

            <button
                type="button"
                class="settings-close"
                onclick={() => settings.closeMenu()}
            >
                {t('settings.close')}
            </button>
        </div>
    </div>
{/if}

<style>
    .settings-toggle {
        position: fixed;
        top: 1.25rem;
        left: 1.25rem;
        z-index: 40;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 52px;
        height: 52px;
        padding: 0;
        border: 1px solid rgba(167, 139, 250, 0.35);
        border-radius: 50%;
        background: rgba(10, 10, 18, 0.55);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        color: #c4b5fd;
        cursor: pointer;
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.35);
        transition:
            color 0.2s ease,
            border-color 0.2s ease,
            box-shadow 0.2s ease;
    }

    .settings-toggle:hover {
        color: #ede9fe;
        border-color: rgba(167, 139, 250, 0.7);
        box-shadow:
            0 0 18px rgba(167, 139, 250, 0.45),
            0 4px 14px rgba(0, 0, 0, 0.35);
    }

    .settings-toggle__icon {
        width: 26px;
        height: 26px;
        fill: none;
        stroke: currentColor;
        stroke-width: 1.8;
        stroke-linecap: round;
        stroke-linejoin: round;
        transition: transform 0.4s ease;
    }

    .settings-toggle:hover .settings-toggle__icon {
        transform: rotate(60deg);
    }

    .settings-backdrop {
        position: fixed;
        inset: 0;
        z-index: 95000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1.5rem;
        background: rgba(5, 5, 10, 0.6);
        backdrop-filter: blur(4px);
        -webkit-backdrop-filter: blur(4px);
        animation: settings-fade-in 0.2s ease-out;
    }

    .settings-panel {
        width: min(380px, 100%);
        padding: 1.75rem;
        border: 1px solid rgba(167, 139, 250, 0.3);
        border-radius: 20px;
        background: rgba(12, 10, 22, 0.92);
        box-shadow:
            0 16px 48px rgba(0, 0, 0, 0.55),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
        color: #e2e8f0;
        outline: none;
        animation: settings-panel-in 0.25s ease-out;
    }

    .settings-header {
        margin-bottom: 1.25rem;
        text-align: center;
    }

    .settings-title {
        font-family: var(--font-display);
        font-size: 1.5rem;
        font-weight: 700;
        letter-spacing: 0.12em;
        color: #c4b5fd;
        text-shadow: 0 0 20px rgba(167, 139, 250, 0.35);
    }

    .settings-paused {
        margin-top: 0.25rem;
        font-size: 0.95rem;
        font-style: italic;
        color: #94a3b8;
    }

    .settings-section {
        padding: 1rem 0;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
    }

    .settings-label {
        margin-bottom: 0.75rem;
        font-family: var(--font-display);
        font-size: 0.8rem;
        font-weight: 700;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: #a78bfa;
    }

    .language-switch {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 0.5rem;
    }

    .language-option {
        padding: 0.6rem 0.75rem;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.03);
        color: #cbd5e1;
        cursor: pointer;
        transition:
            background 0.2s ease,
            border-color 0.2s ease,
            color 0.2s ease;
    }

    .language-option:hover {
        border-color: rgba(167, 139, 250, 0.4);
        color: #fff;
    }

    .language-option.active {
        border-color: rgba(167, 139, 250, 0.7);
        background: rgba(167, 139, 250, 0.18);
        color: #fff;
        box-shadow: 0 0 14px rgba(167, 139, 250, 0.25);
    }

    .volume-row {
        display: grid;
        grid-template-columns: auto 1fr 4ch;
        align-items: center;
        gap: 0.85rem;
    }

    .volume-slider {
        width: 100%;
        accent-color: #a78bfa;
        cursor: pointer;
    }

    .volume-value {
        font-family: var(--font-mono);
        font-size: 0.85rem;
        font-variant-numeric: tabular-nums;
        text-align: right;
        color: #a78bfa;
    }

    .settings-close {
        display: block;
        width: 100%;
        margin-top: 0.5rem;
        padding: 0.75rem;
        border: 1px solid rgba(167, 139, 250, 0.45);
        border-radius: 999px;
        background: linear-gradient(
            180deg,
            rgba(124, 58, 237, 0.45) 0%,
            rgba(76, 29, 149, 0.6) 100%
        );
        color: #ede9fe;
        font-family: var(--font-display);
        font-size: 0.95rem;
        font-weight: 700;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        cursor: pointer;
        transition:
            filter 0.2s ease,
            box-shadow 0.2s ease;
    }

    .settings-close:hover {
        filter: brightness(1.15);
        box-shadow: 0 0 20px rgba(167, 139, 250, 0.4);
    }

    .settings-toggle:focus-visible,
    .language-option:focus-visible,
    .settings-close:focus-visible {
        outline: 2px solid #c4b5fd;
        outline-offset: 2px;
    }

    @keyframes settings-fade-in {
        from {
            opacity: 0;
        }

        to {
            opacity: 1;
        }
    }

    @keyframes settings-panel-in {
        from {
            opacity: 0;
            transform: translateY(12px) scale(0.97);
        }

        to {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
    }
</style>

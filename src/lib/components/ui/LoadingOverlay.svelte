<script lang="ts">
    import { t } from '$lib/i18n'
    interface Props {
        progress: number
        visible: boolean
        label?: string
    }

    let { progress, visible, label }: Props = $props()

    let dismissed = $state(false)

    $effect(() => {
        if (visible) {
            dismissed = false
            return
        }

        const timeout = setTimeout(() => {
            dismissed = true
        }, 500)

        return () => clearTimeout(timeout)
    })
</script>

{#if !dismissed}
    <div class="overlay" class:fade-out={!visible} aria-hidden={!visible}>
        <div class="panel">
            <p class="label">{label ?? t('loading.default')}</p>
            <div class="track">
                <div class="fill" style:width="{progress}%"></div>
            </div>
            <p class="percent">{progress}%</p>
        </div>
    </div>
{/if}

<style>
    .overlay {
        position: fixed;
        inset: 0;
        z-index: 100000;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #0a0a0f;
        opacity: 1;
        transition: opacity 0.5s ease;
        pointer-events: all;
    }

    .overlay.fade-out {
        opacity: 0;
        pointer-events: none;
    }

    .panel {
        width: min(420px, calc(100vw - 3rem));
        text-align: center;
    }

    .label {
        margin-bottom: 1.25rem;
        font-family: var(--font-display);
        font-size: 1.125rem;
        font-weight: 600;
        letter-spacing: 0.08em;
        color: #c4b5fd;
    }

    .track {
        height: 10px;
        overflow: hidden;
        border-radius: 999px;
        background: rgba(167, 139, 250, 0.15);
        box-shadow: inset 0 0 0 1px rgba(167, 139, 250, 0.2);
    }

    .fill {
        height: 100%;
        border-radius: inherit;
        background: linear-gradient(90deg, #7c3aed, #a78bfa);
        box-shadow: 0 0 16px rgba(167, 139, 250, 0.55);
        transition: width 0.25s ease-out;
    }

    .percent {
        margin-top: 0.75rem;
        font-family: var(--font-mono);
        font-size: 0.95rem;
        font-variant-numeric: tabular-nums;
        color: #a78bfa;
    }
</style>

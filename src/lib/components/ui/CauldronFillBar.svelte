<script lang="ts">
    import { t } from '$lib/i18n'
    interface Props {
        progress: number
    }

    let { progress }: Props = $props()
</script>

<div class="cauldron-fill" aria-label={t('hud.cauldronFill')}>
    <div class="track">
        <div class="fill" style:width="{progress}%"></div>
    </div>
</div>

<style>
    .cauldron-fill {
        width: min(220px, calc(100vw - 2rem));
    }

    .track {
        height: 12px;
        overflow: hidden;
        border-radius: 999px;
        background: rgba(34, 197, 94, 0.12);
        box-shadow:
            inset 0 0 0 1px rgba(74, 222, 128, 0.25),
            0 0 12px rgba(34, 197, 94, 0.15);
    }

    .fill {
        height: 100%;
        border-radius: inherit;
        background: linear-gradient(90deg, #15803d, #4ade80, #bbf7d0);
        box-shadow: 0 0 14px rgba(74, 222, 128, 0.55);
        transition: width 0.35s ease-out;
    }
</style>

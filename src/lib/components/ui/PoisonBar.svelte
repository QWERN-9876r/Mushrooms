<script lang="ts">
    import { t } from '$lib/i18n'
    interface Props {
        progress: number
    }

    let { progress }: Props = $props()
</script>

<div class="poison-bar" aria-label={t('hud.poison')}>
    <div class="track">
        <div class="fill" style:width="{progress}%"></div>
    </div>
</div>

<style>
    .poison-bar {
        width: min(520px, calc(100vw - 1.5rem));
    }

    .track {
        height: 22px;
        overflow: hidden;
        border-radius: 999px;
        background: rgba(15, 5, 24, 0.55);
        box-shadow:
            inset 0 0 0 1px rgba(46, 16, 101, 0.45),
            0 0 10px rgba(15, 5, 24, 0.35);
    }

    .fill {
        height: 100%;
        border-radius: inherit;
        background: linear-gradient(
            90deg,
            #4c1d95 0%,
            #3b0764 35%,
            #2e1065 65%,
            #1a0529 85%,
            #050011 100%
        );
        box-shadow:
            inset 0 0 12px rgba(0, 0, 0, 0.65),
            0 0 14px rgba(59, 7, 100, 0.45);
        transition: width 0.2s linear;
    }
</style>

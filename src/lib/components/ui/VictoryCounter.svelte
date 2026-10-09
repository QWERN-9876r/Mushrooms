<script lang="ts">
    import { VICTORY_GOAL, victory } from '$lib/stores/victory.svelte'
</script>

<div class="victory-counter" aria-live="polite">
    {victory.points}/{VICTORY_GOAL}
</div>

<style>
    .victory-counter {
        position: fixed;
        top: 1.25rem;
        right: 1.25rem;
        z-index: 35;
        color: #facc15;
        font-family: var(--font-display);
        font-size: 45px;
        font-weight: 700;
        font-variant-numeric: tabular-nums;
        line-height: 1;
        pointer-events: none;
        text-shadow:
            0 0 12px rgba(250, 204, 21, 0.55),
            0 2px 8px rgba(0, 0, 0, 0.45);
    }
</style>

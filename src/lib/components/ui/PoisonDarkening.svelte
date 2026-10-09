<script lang="ts">
    interface Props {
        strength: number
    }

    let { strength }: Props = $props()
</script>

<div
    class="poison-darken"
    style:opacity={strength}
    aria-hidden="true"
></div>

<style>
    .poison-darken {
        position: fixed;
        inset: 0;
        z-index: 25;
        pointer-events: none;
        background:
            radial-gradient(
                ellipse at center,
                rgba(15, 5, 24, 0.15) 0%,
                rgba(5, 0, 17, 0.55) 52%,
                rgba(0, 0, 0, 0.95) 100%
            ),
            rgba(5, 0, 17, 0.55);
        transition: opacity 0.35s linear;
    }
</style>

<script lang="ts">
    import { withBase } from '$lib/utils/publicPath'

    let { children, href = '' } = $props()
</script>

<a href={withBase(href)}>
    <div>{@render children()}</div>
</a>

<style>
    a {
        position: fixed;
        bottom: 6rem;
        right: 6rem;
        z-index: 10;
        color: white;
        text-decoration: none;
    }

    div {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 250px;
        height: 250px;
        background: rgba(255, 255, 255, 0.3);
        border: 5px dashed rgba(0, 0, 0, 0.3);
        border-radius: 100%;
        font-family: var(--font-display);
        font-size: 1.35rem;
        font-weight: 700;
        letter-spacing: 0.08em;
        transition: transform 0.2s ease;
    }
</style>

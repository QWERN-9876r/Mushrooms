<script lang="ts">
    import '../app.css'
    import DesktopOnlyGate from '$lib/components/ui/DesktopOnlyGate.svelte'

    let { children } = $props()
</script>

<div class="app-root">
    {@render children()}
    <DesktopOnlyGate />
</div>

<style>
    .app-root {
        position: fixed;
        inset: 0;
        overflow: hidden;
        background: #0a0a0f;
        color: white;
    }
</style>

<script lang="ts">
    import '../app.css'
    import BackgroundMusic from '$lib/components/audio/BackgroundMusic.svelte'
    import DesktopOnlyGate from '$lib/components/ui/DesktopOnlyGate.svelte'
    import SettingsMenu from '$lib/components/ui/SettingsMenu.svelte'
    import { t } from '$lib/i18n'
    import { pageLoad } from '$lib/stores/pageLoad.svelte'
    import { poison } from '$lib/stores/poison.svelte'
    import { victory } from '$lib/stores/victory.svelte'

    let { children } = $props()
</script>

<svelte:head>
    <title>{t('app.title')}</title>
</svelte:head>

<div class="app-root">
    {@render children()}
    {#if pageLoad.ready && !poison.isDead && !victory.celebrationActive}
        <SettingsMenu />
    {/if}
    <DesktopOnlyGate />
    <BackgroundMusic />
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

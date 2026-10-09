<script lang="ts">
    import { untrack } from 'svelte'
    import { Howl } from 'howler'
    import { settings } from '$lib/stores/settings.svelte'
    import { withBase } from '$lib/utils/publicPath'

    let music = $state.raw<Howl>()

    $effect(() => {
        // Web Audio — бесшовный повтор. До первого клика/клавиши браузер
        // держит звук на паузе, Howler сам запустит его после разблокировки
        const howl = new Howl({
            src: [withBase('/Music.mp3')],
            loop: true,
            volume: untrack(() => settings.musicVolume),
        })

        howl.play()
        music = howl

        return () => howl.unload()
    })

    $effect(() => {
        music?.volume(settings.musicVolume)
    })
</script>

/** Минимальная ширина «десктопного» экрана */
export const DESKTOP_MIN_WIDTH_PX = 900

const SMALL_SCREEN_QUERY = `(max-width: ${DESKTOP_MIN_WIDTH_PX - 1}px)`
/** Основной ввод — тач, без «настоящей» мыши */
const TOUCH_PRIMARY_QUERY = '(hover: none) and (pointer: coarse)'

export function isDesktopOnlyBlocked(): boolean {
    if (typeof window === 'undefined') return false

    return (
        window.matchMedia(SMALL_SCREEN_QUERY).matches ||
        window.matchMedia(TOUCH_PRIMARY_QUERY).matches
    )
}

export function watchDesktopOnlyBlocked(onChange: (blocked: boolean) => void): () => void {
    if (typeof window === 'undefined') return () => {}

    const small = window.matchMedia(SMALL_SCREEN_QUERY)
    const touch = window.matchMedia(TOUCH_PRIMARY_QUERY)

    const notify = () => onChange(isDesktopOnlyBlocked())

    small.addEventListener('change', notify)
    touch.addEventListener('change', notify)
    window.addEventListener('orientationchange', notify)
    window.addEventListener('resize', notify)

    notify()

    return () => {
        small.removeEventListener('change', notify)
        touch.removeEventListener('change', notify)
        window.removeEventListener('orientationchange', notify)
        window.removeEventListener('resize', notify)
    }
}

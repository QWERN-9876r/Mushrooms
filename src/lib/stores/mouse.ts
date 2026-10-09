import { writable } from 'svelte/store'

export const mouse = writable({ x: 0, y: 0 })

export const normalizeMouse = (
    clientX: number,
    clientY: number,
    width: number,
    height: number,
) => {
    return {
        x: (clientX / width) * 2 - 1,
        y: -(clientY / height) * 2 + 1,
    }
}

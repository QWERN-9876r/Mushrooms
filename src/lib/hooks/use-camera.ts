import { normalizeMouse } from '$lib/stores/mouse'
import { useTask, useThrelte } from '@threlte/core'

export const useCamera = () => {
    const { camera } = useThrelte()

    // Базовая позиция камеры
    const basePos = { x: 0, y: 2, z: 6 }

    // Плавные цели для интерполяции
    let targetX = $state(0)
    let currentX = $state(0)

    // Обработчик мыши
    const handleMouseMove = (e: MouseEvent) => {
        const { x } = normalizeMouse(
            e.clientX,
            e.clientY,
            window.innerWidth,
            window.innerHeight,
        )
        const deadzone = 0.1
        targetX = Math.abs(x) < deadzone ? 0 : x * 0.6
    }

    const { canvas } = useThrelte()
    $effect(() => {
        if (canvas) {
            canvas.addEventListener('mousemove', handleMouseMove)
            return () =>
                canvas.removeEventListener('mousemove', handleMouseMove)
        }
    })

    useTask(() => {
        // Линейная интерполяция (lerp) для плавности
        currentX += (targetX - currentX) * 0.04 // 0.02 = медленнее, 0.1 = быстрее

        // Применяем только по оси X (влево/вправо)
        camera.current.position.x = basePos.x + currentX * 1.2 // 1.2 = амплитуда сдвига
        camera.current.position.y = basePos.y
        camera.current.position.z = basePos.z

        // Камера всегда смотрит в центр + лёгкий вертикальный оффсет
        camera.current.lookAt(0, 0.3, 0)
    })
}

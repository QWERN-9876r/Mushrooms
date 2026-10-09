import { Application, Graphics, type Texture } from 'pixi.js'

const MIN_RADIUS = 2
const MAX_RADIUS = 12

let textures: Map<number, Texture> | null = null

export function warmupParticleTextures(app: Application): void {
    if (textures) return

    textures = new Map()

    for (let radius = MIN_RADIUS; radius <= MAX_RADIUS; radius++) {
        textures.set(
            radius,
            app.renderer.generateTexture(
                new Graphics().fill(0xffffff).circle(0, 0, radius).fill(),
            ),
        )
    }
}

export function getParticleTexture(radius: number): Texture {
    const clamped = Math.round(
        Math.max(MIN_RADIUS, Math.min(MAX_RADIUS, radius)),
    )
    return textures?.get(clamped) ?? textures!.get(MIN_RADIUS)!
}

export function destroyParticleTextures(): void {
    textures?.forEach((texture) => texture.destroy(true))
    textures = null
}

import { Container, Graphics, Sprite } from 'pixi.js'
import { getParticleTexture } from './particleTextures'

export const BREW_PARTICLE_POOL_SIZE = 90
export const BREW_RING_POOL_SIZE = 2
export const DRINK_PARTICLE_POOL_SIZE = 70
export const DRINK_RING_POOL_SIZE = 3

export type LayerPool = {
    flash: Graphics
    rings: Graphics[]
    sprites: Sprite[]
}

export type EffectPools = {
    brew: LayerPool
    drink: LayerPool
}

function createPoolSprite(): Sprite {
    const sprite = new Sprite(getParticleTexture(5))
    sprite.anchor.set(0.5)
    sprite.blendMode = 'add'
    sprite.visible = false
    return sprite
}

function createPoolRing(): Graphics {
    const ring = new Graphics()
    ring.visible = false
    return ring
}

function createLayerPool(layer: Container, spriteCount: number, ringCount: number): LayerPool {
    const flash = new Graphics()
    flash.visible = false
    layer.addChild(flash)

    const rings = Array.from({ length: ringCount }, () => {
        const ring = createPoolRing()
        layer.addChild(ring)
        return ring
    })

    const sprites = Array.from({ length: spriteCount }, () => {
        const sprite = createPoolSprite()
        layer.addChild(sprite)
        return sprite
    })

    return { flash, rings, sprites }
}

export function createEffectPools(
    brewLayer: Container,
    drinkLayer: Container,
): EffectPools {
    return {
        brew: createLayerPool(brewLayer, BREW_PARTICLE_POOL_SIZE, BREW_RING_POOL_SIZE),
        drink: createLayerPool(
            drinkLayer,
            DRINK_PARTICLE_POOL_SIZE,
            DRINK_RING_POOL_SIZE,
        ),
    }
}

export function hideLayerPool(pool: LayerPool): void {
    pool.flash.visible = false
    for (const ring of pool.rings) {
        ring.visible = false
    }
    for (const sprite of pool.sprites) {
        sprite.visible = false
    }
}

export function hideEffectPools(pools: EffectPools): void {
    hideLayerPool(pools.brew)
    hideLayerPool(pools.drink)
}

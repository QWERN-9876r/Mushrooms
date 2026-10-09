import { Application, Container, Graphics } from 'pixi.js'
import type { EffectPools } from './effectPools'
import { hideEffectPools } from './effectPools'
import { warmupParticleTextures } from './particleTextures'

/** Прогрев GPU: шейдеры fill/stroke/add-blend до первого игрового эффекта */
export function warmupPixiRenderer(
    app: Application,
    pools: EffectPools,
    runBrewSpawn: () => void,
    runDrinkSpawn: () => void,
    runAnimationTick?: (deltaMs: number) => void,
): void {
    warmupParticleTextures(app)

    const gfx = new Graphics()
    gfx.circle(0, 0, 80).fill({ color: 0xffffff, alpha: 0.12 })
    gfx.circle(0, 0, 40).stroke({ color: 0xffffff, width: 2, alpha: 0.5 })
    gfx.alpha = 0
    app.stage.addChild(gfx)
    app.renderer.render(app.stage)
    app.stage.removeChild(gfx)
    gfx.destroy()

    hideEffectPools(pools)

    const brewLayer = pools.brew.flash.parent as Container
    const drinkLayer = pools.drink.flash.parent as Container
    const prevBrewAlpha = brewLayer.alpha
    const prevDrinkAlpha = drinkLayer.alpha
    brewLayer.alpha = 0
    drinkLayer.alpha = 0

    runBrewSpawn()
    runDrinkSpawn()
    runAnimationTick?.(32)
    app.renderer.render(app.stage)

    hideEffectPools(pools)

    brewLayer.alpha = prevBrewAlpha
    drinkLayer.alpha = prevDrinkAlpha
}

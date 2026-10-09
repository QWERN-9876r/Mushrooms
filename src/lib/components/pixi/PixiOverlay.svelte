<script lang="ts">
    import { onMount } from 'svelte'
    import { Application, Sprite, Graphics, Container } from 'pixi.js'
    import { mouse } from '$lib/stores/mouse'
    import {
        brewEffect,
        getPotionBurstColors,
    } from '$lib/stores/brewEffect.svelte'
    import { drinkEffect } from '$lib/stores/drinkEffect.svelte'
    import {
        createEffectPools,
        hideLayerPool,
        type EffectPools,
    } from './effectPools'
    import {
        destroyParticleTextures,
        getParticleTexture,
        warmupParticleTextures,
    } from './particleTextures'
    import { warmupPixiRenderer } from './warmupPixiEffects'

    interface Props {
        active?: boolean
    }

    let { active = false }: Props = $props()

    let canvasContainer: HTMLDivElement
    let app: Application
    let effectPools: EffectPools
    let particles: Sprite[] = []
    let brewLayer: Container
    let drinkLayer: Container
    let lastBrewGeneration = 0
    let lastDrinkGeneration = 0

    const BREW_DURATION_MS = 2600
    const DRINK_DURATION_MS = 2000

    type BrewParticle = {
        sprite: Sprite
        vx: number
        vy: number
        life: number
        maxLife: number
        spin: number
    }

    type BrewRing = {
        gfx: Graphics
        radius: number
        maxRadius: number
        life: number
        maxLife: number
        color: number
    }

    let brewParticles: BrewParticle[] = []
    let brewRings: BrewRing[] = []
    let brewFlash: Graphics | null = null
    let brewFlashLife = 0
    let brewFlashMaxLife = 0
    let brewElapsed = 0

    type DrinkParticle = {
        sprite: Sprite
        startX: number
        startY: number
        delay: number
        life: number
        maxLife: number
        spin: number
        mode: 'inward' | 'rise'
    }

    type DrinkRing = {
        gfx: Graphics
        radius: number
        life: number
        maxLife: number
        color: number
    }

    let drinkParticles: DrinkParticle[] = []
    let drinkRings: DrinkRing[] = []
    let drinkFlash: Graphics | null = null
    let drinkFlashLife = 0
    let drinkFlashMaxLife = 0
    let drinkElapsed = 0

    const setParticlesVisible = (visible: boolean) => {
        particles.forEach((p) => {
            p.visible = visible
        })
    }

    const getCauldronCenter = () => ({
        x: app.screen.width * 0.5,
        y: app.screen.height * 0.62,
    })

    const getDrinkCenter = () => ({
        x: app.screen.width * 0.5,
        y: app.screen.height * 0.5,
    })

    const pickColor = (colors: number[]) =>
        colors[Math.floor(Math.random() * colors.length)]

    const configureBurstSprite = (
        sprite: Sprite,
        size: number,
        color: number,
    ) => {
        sprite.texture = getParticleTexture(size)
        sprite.tint = color
        sprite.scale.set(1)
        sprite.rotation = 0
        sprite.visible = true
        return sprite
    }

    const resetBrewState = (complete = true) => {
        if (!effectPools) return
        hideLayerPool(effectPools.brew)
        brewParticles = []
        brewRings = []
        brewFlash = null
        brewFlashLife = 0
        if (complete) brewEffect.complete()
    }

    const resetDrinkState = (complete = true) => {
        if (!effectPools) return
        hideLayerPool(effectPools.drink)
        drinkParticles = []
        drinkRings = []
        drinkFlash = null
        drinkFlashLife = 0
        if (complete) drinkEffect.complete()
    }

    const spawnBrewEffect = (potionName: string) => {
        if (!app || !brewLayer || !effectPools) return

        resetBrewState(false)
        brewElapsed = 0

        const { x, y } = getCauldronCenter()
        const colors = getPotionBurstColors(potionName)
        const pool = effectPools.brew
        let spriteIndex = 0

        brewFlashMaxLife = 700
        brewFlashLife = brewFlashMaxLife
        brewFlash = pool.flash
        brewFlash.clear()
        brewFlash.position.set(0, 0)
        brewFlash.scale.set(1)
        brewFlash.circle(x, y, 130)
        brewFlash.fill({ color: colors[0], alpha: 0.28 })
        brewFlash.visible = true
        brewFlash.alpha = 1

        for (let ring = 0; ring < pool.rings.length; ring++) {
            const ringGfx = pool.rings[ring]
            ringGfx.clear()
            ringGfx.circle(x, y, 8)
            ringGfx.stroke({
                color: colors[ring % colors.length],
                width: 3,
                alpha: 0.75,
            })
            ringGfx.visible = true
            brewRings.push({
                gfx: ringGfx,
                radius: 8,
                maxRadius: 240 + ring * 40,
                life: 0,
                maxLife: 900 + ring * 180,
                color: colors[ring % colors.length],
            })
        }

        const count = 72
        for (let i = 0; i < count; i++) {
            const angle =
                (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.35
            const speed = Math.random() * 0.18 + 0.08
            const size = Math.random() * 5 + 2
            const color = pickColor(colors)
            const sprite = configureBurstSprite(
                pool.sprites[spriteIndex++],
                size,
                color,
            )
            sprite.x = x + (Math.random() - 0.5) * 24
            sprite.y = y + (Math.random() - 0.5) * 16
            sprite.alpha = 0.95

            brewParticles.push({
                sprite,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 0.04,
                life: 0,
                maxLife: 900 + Math.random() * 900,
                spin: (Math.random() - 0.5) * 0.004,
            })
        }

        for (let i = 0; i < 18; i++) {
            const angle = Math.random() * Math.PI * 2
            const speed = Math.random() * 0.06 + 0.02
            const sprite = configureBurstSprite(
                pool.sprites[spriteIndex++],
                Math.random() * 8 + 4,
                pickColor(colors),
            )
            sprite.x = x
            sprite.y = y
            sprite.alpha = 0.55

            brewParticles.push({
                sprite,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 0.12,
                life: 0,
                maxLife: 1400 + Math.random() * 700,
                spin: (Math.random() - 0.5) * 0.003,
            })
        }
    }

    const spawnDrinkEffect = (potionName: string) => {
        if (!app || !drinkLayer || !effectPools) return

        resetDrinkState(false)
        drinkElapsed = 0

        const { x, y } = getDrinkCenter()
        const colors = getPotionBurstColors(potionName)
        const pool = effectPools.drink
        let spriteIndex = 0

        drinkFlashMaxLife = 650
        drinkFlashLife = drinkFlashMaxLife
        drinkFlash = pool.flash
        drinkFlash.clear()
        drinkFlash.position.set(0, 0)
        drinkFlash.scale.set(1)
        drinkFlash.circle(x, y, 75)
        drinkFlash.fill({ color: colors[0], alpha: 0.38 })
        drinkFlash.visible = true
        drinkFlash.alpha = 1

        for (let ring = 0; ring < pool.rings.length; ring++) {
            const ringGfx = pool.rings[ring]
            const startRadius = 140 - ring * 28
            ringGfx.clear()
            ringGfx.circle(x, y, startRadius)
            ringGfx.stroke({
                color: colors[ring % colors.length],
                width: 2,
                alpha: 0.55,
            })
            ringGfx.visible = true
            drinkRings.push({
                gfx: ringGfx,
                radius: startRadius,
                life: ring * 120,
                maxLife: 900 + ring * 100,
                color: colors[ring % colors.length],
            })
        }

        const count = 56
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4
            const dist = Math.random() * 120 + 70
            const size = Math.random() * 4.5 + 2
            const color = pickColor(colors)
            const sprite = configureBurstSprite(
                pool.sprites[spriteIndex++],
                size,
                color,
            )
            sprite.x = x + Math.cos(angle) * dist
            sprite.y = y + Math.sin(angle) * dist
            sprite.alpha = 0.9

            drinkParticles.push({
                sprite,
                startX: sprite.x,
                startY: sprite.y,
                delay: Math.random() * 180,
                life: 0,
                maxLife: 700 + Math.random() * 700,
                spin: (Math.random() - 0.5) * 0.006,
                mode: 'inward',
            })
        }

        for (let i = 0; i < 14; i++) {
            const angle = (Math.random() - 0.5) * Math.PI * 0.5
            const dist = Math.random() * 18 + 6
            const sprite = configureBurstSprite(
                pool.sprites[spriteIndex++],
                Math.random() * 5 + 2,
                pickColor(colors),
            )
            sprite.x = x + Math.cos(angle) * dist
            sprite.y = y + Math.sin(angle) * dist
            sprite.alpha = 0

            drinkParticles.push({
                sprite,
                startX: sprite.x,
                startY: sprite.y,
                delay: 420 + Math.random() * 180,
                life: 0,
                maxLife: 900 + Math.random() * 500,
                spin: (Math.random() - 0.5) * 0.004,
                mode: 'rise',
            })
        }
    }

    const animateBrewEffect = (delta: number) => {
        if (brewParticles.length === 0 && brewRings.length === 0 && !brewFlash)
            return

        brewElapsed += delta
        const center = getCauldronCenter()

        if (brewFlash && brewFlashLife > 0) {
            brewFlashLife -= delta
            const t = Math.max(0, brewFlashLife / brewFlashMaxLife)
            brewFlash.alpha = t * 0.85
            const scale = 1 + (1 - t) * 1.6
            brewFlash.scale.set(scale)
        } else if (brewFlash) {
            brewFlash.visible = false
            brewFlash = null
        }

        brewRings = brewRings.filter((ring) => {
            ring.life += delta
            const progress = ring.life / ring.maxLife
            if (progress >= 1) {
                ring.gfx.visible = false
                return false
            }

            ring.radius += delta * 0.22
            ring.gfx.clear()
            ring.gfx.circle(center.x, center.y, ring.radius)
            ring.gfx.stroke({
                color: ring.color,
                width: 2,
                alpha: (1 - progress) * 0.55,
            })
            return true
        })

        brewParticles = brewParticles.filter((p) => {
            p.life += delta
            const progress = p.life / p.maxLife
            if (progress >= 1) {
                p.sprite.visible = false
                return false
            }

            p.sprite.x += p.vx * delta
            p.sprite.y += p.vy * delta
            p.vy += 0.00005 * delta
            p.sprite.rotation += p.spin * delta
            p.sprite.alpha = (1 - progress) * 0.95
            p.sprite.scale.set(1 - progress * 0.35)
            return true
        })

        if (
            brewElapsed >= BREW_DURATION_MS &&
            brewParticles.length === 0 &&
            brewRings.length === 0 &&
            !brewFlash
        ) {
            resetBrewState()
        }
    }

    const animateDrinkEffect = (delta: number) => {
        if (
            drinkParticles.length === 0 &&
            drinkRings.length === 0 &&
            !drinkFlash
        )
            return

        drinkElapsed += delta
        const center = getDrinkCenter()

        if (drinkFlash && drinkFlashLife > 0) {
            drinkFlashLife -= delta
            const t = Math.max(0, drinkFlashLife / drinkFlashMaxLife)
            drinkFlash.alpha = t * (t < 0.35 ? 1 : 0.85)
            const pulse = 1 + Math.sin((1 - t) * Math.PI * 3) * 0.12
            drinkFlash.scale.set((1.15 - (1 - t) * 0.55) * pulse)
        } else if (drinkFlash) {
            drinkFlash.visible = false
            drinkFlash = null
        }

        drinkRings = drinkRings.filter((ring) => {
            ring.life += delta
            const progress = ring.life / ring.maxLife
            if (progress >= 1) {
                ring.gfx.visible = false
                return false
            }

            ring.radius = Math.max(6, ring.radius - delta * 0.18)
            ring.gfx.clear()
            ring.gfx.circle(center.x, center.y, ring.radius)
            ring.gfx.stroke({
                color: ring.color,
                width: 2,
                alpha: (1 - progress) * 0.6,
            })
            return true
        })

        drinkParticles = drinkParticles.filter((p) => {
            p.life += delta
            if (p.life < p.delay) return true

            const activeLife = p.life - p.delay
            const progress = activeLife / p.maxLife
            if (progress >= 1) {
                p.sprite.visible = false
                return false
            }

            const ease = progress * progress

            if (p.mode === 'rise') {
                p.sprite.x = p.startX + Math.sin(progress * Math.PI * 2) * 12
                p.sprite.y = p.startY - progress * 90
                p.sprite.alpha =
                    progress < 0.15 ? progress / 0.15 : 1 - progress
            } else {
                p.sprite.x = p.startX + (center.x - p.startX) * ease
                p.sprite.y = p.startY + (center.y - p.startY) * ease
                p.sprite.alpha = (1 - progress) * 0.95
                p.sprite.scale.set(1 - progress * 0.4)
            }

            p.sprite.rotation += p.spin * delta

            return true
        })

        if (
            drinkElapsed >= DRINK_DURATION_MS &&
            drinkParticles.length === 0 &&
            drinkRings.length === 0 &&
            !drinkFlash
        ) {
            resetDrinkState()
        }
    }

    const queueBrewEffect = (potionName: string) => {
        requestAnimationFrame(() => spawnBrewEffect(potionName))
    }

    const queueDrinkEffect = (potionName: string) => {
        requestAnimationFrame(() => spawnDrinkEffect(potionName))
    }

    onMount(() => {
        ;(async () => {
            app = new Application()
            await app.init({
                width: window.innerWidth,
                height: window.innerHeight,
                backgroundAlpha: 0,
                antialias: true,
                resolution: window.devicePixelRatio || 1,
                autoDensity: true,
            })

            canvasContainer.appendChild(app.canvas as HTMLCanvasElement)

            brewLayer = new Container()
            drinkLayer = new Container()
            app.stage.addChild(brewLayer)
            app.stage.addChild(drinkLayer)

            warmupParticleTextures(app)
            effectPools = createEffectPools(brewLayer, drinkLayer)
            createMagicParticles()
            setParticlesVisible(active)

            warmupPixiRenderer(
                app,
                effectPools,
                () => spawnBrewEffect('life_potion'),
                () => spawnDrinkEffect('life_potion'),
                (deltaMs) => {
                    animateBrewEffect(deltaMs)
                    animateDrinkEffect(deltaMs)
                },
            )
            resetBrewState(false)
            resetDrinkState(false)

            if (
                brewEffect.generation > lastBrewGeneration &&
                brewEffect.potionName
            ) {
                lastBrewGeneration = brewEffect.generation
                queueBrewEffect(brewEffect.potionName)
            }

            if (
                drinkEffect.generation > lastDrinkGeneration &&
                drinkEffect.potionName
            ) {
                lastDrinkGeneration = drinkEffect.generation
                queueDrinkEffect(drinkEffect.potionName)
            }

            app.ticker.add(({ deltaMS }) => {
                animateParticles(deltaMS)
                animateBrewEffect(deltaMS)
                animateDrinkEffect(deltaMS)
            })
        })()

        const handleResize = () => {
            app.renderer.resize(window.innerWidth, window.innerHeight)
        }
        window.addEventListener('resize', handleResize)

        return () => {
            window.removeEventListener('resize', handleResize)
            destroyParticleTextures()
            app?.destroy(true)
        }
    })

    $effect(() => {
        if (app) {
            setParticlesVisible(active)
        }
    })

    $effect(() => {
        const generation = brewEffect.generation
        const potionName = brewEffect.potionName
        if (!app || !brewLayer || !effectPools || generation === 0) return
        if (generation === lastBrewGeneration) return

        lastBrewGeneration = generation
        if (potionName) queueBrewEffect(potionName)
    })

    $effect(() => {
        const generation = drinkEffect.generation
        const potionName = drinkEffect.potionName
        if (!app || !drinkLayer || !effectPools || generation === 0) return
        if (generation === lastDrinkGeneration) return

        lastDrinkGeneration = generation
        if (potionName) queueDrinkEffect(potionName)
    })

    const createMagicParticles = () => {
        for (let i = 0; i < 50; i++) {
            const particle = new Sprite(getParticleTexture(5))
            particle.tint = 0x00ff00

            particle.x = Math.random() * app.screen.width
            particle.y = Math.random() * app.screen.height
            particle.anchor.set(0.5)
            particle.blendMode = 'add'
            particle.alpha = Math.random() * 0.6 + 0.2
            particle.scale.set(Math.random() * 1.5 + 0.5)

            ;(particle as any).vx = (Math.random() - 0.5) * 0.5
            ;(particle as any).vy = (Math.random() - 0.5) * 0.5 - 0.3
            ;(particle as any).oscillation = Math.random() * Math.PI * 2

            app.stage.addChildAt(particle, 0)
            particles.push(particle)
        }
    }

    const animateParticles = (delta: number) => {
        if (!active) return

        const { x: mouseX, y: mouseY } = $mouse

        particles.forEach((p) => {
            p.x += (p as any).vx * delta
            p.y += (p as any).vy * delta

            ;(p as any).oscillation += 0.02 * delta
            p.x += Math.sin((p as any).oscillation) * 0.1

            const dx = (p.x / app.screen.width) * 2 - 1 - mouseX
            const dy = -((p.y / app.screen.height) * 2 - 1) - mouseY
            const dist = Math.sqrt(dx * dx + dy * dy)

            if (dist < 0.3) {
                const force = (0.3 - dist) * 2
                p.x += dx * force * delta
                p.y += dy * force * delta
            }

            if (p.y < -20) p.y = app.screen.height + 20
            if (p.x < -20) p.x = app.screen.width + 20
            if (p.x > app.screen.width + 20) p.x = -20

            p.alpha = 0.3 + Math.sin((p as any).oscillation * 2) * 0.2
        })
    }
</script>

<div
    bind:this={canvasContainer}
    style="position: fixed; inset: 0; pointer-events: none; z-index: 5;"
></div>

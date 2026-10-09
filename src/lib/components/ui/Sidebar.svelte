<!-- src/lib/components/ui/Sidebar.svelte -->
<script lang="ts">
    import { t } from '$lib/i18n'
    interface Plant {
        id: string
        name: string
        modelPath: string
    }

    interface Props {
        selectedId?: string
        onSelect?: (id: string) => void
    }

    let { selectedId = 'crystal-bloom', onSelect = () => {} }: Props = $props()

    const plants: Plant[] = [
        {
            id: 'crystal-bloom',
            name: 'Crystal Bloom',
            modelPath: '/models/mashrooms/stylized_mushroom.glb',
        },
        {
            id: 'lumina-fungi',
            name: 'Lumina Fungi',
            modelPath: '/models/mashrooms/mushroom2.glb',
        },
        {
            id: 'whisper-vine',
            name: 'Whisper Vine',
            modelPath: '/models/mashrooms/mushroom.glb',
        },
    ]

    let selectedPlant = $derived(plants.find((p) => p.id === selectedId))

    const handleSelect = (id: string) => {
        onSelect(id)
    }
</script>

<aside class="sidebar">
    <header class="sidebar-header">
        <span class="logo">🌿</span>
        <h1 class="title">{t('sidebar.title')}</h1>
    </header>

    <nav class="plant-list">
        {#each plants as plant (plant.id)}
            <button
                class="plant-item"
                class:active={selectedId === plant.id}
                onclick={() => handleSelect(plant.id)}
            >
                <span class="plant-name">{plant.name}</span>
                {#if selectedId === plant.id}
                    <span class="indicator"></span>
                {/if}
            </button>
        {/each}
    </nav>

    {#if selectedPlant}
        <div class="details-panel">
            <h2 class="details-title">{selectedPlant.name}</h2>
        </div>
    {/if}
</aside>

<style>
    .sidebar {
        position: fixed;
        left: 2rem;
        top: 50%;
        transform: translateY(-50%);
        width: 320px;
        padding: 1.5rem;
        background: rgba(10, 10, 18, 0.65);
        backdrop-filter: blur(20px) saturate(150%);
        -webkit-backdrop-filter: blur(20px) saturate(150%);
        border: 1px solid rgba(167, 139, 250, 0.25);
        border-radius: 24px;
        box-shadow:
            0 8px 32px rgba(0, 0, 0, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
        color: #e2e8f0;
        z-index: 50;
        pointer-events: auto;
        transition: all 0.3s ease;
    }

    .sidebar-header {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 1.5rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .logo {
        font-size: 1.5rem;
        filter: drop-shadow(0 0 8px rgba(167, 139, 250, 0.6));
    }

    .title {
        font-size: 1.1rem;
        font-weight: 600;
        letter-spacing: 0.05em;
        color: #a78bfa;
        margin: 0;
        text-transform: uppercase;
    }

    .plant-list {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        margin-bottom: 1.5rem;
    }

    .plant-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        width: 100%;
        padding: 0.85rem 1rem;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 12px;
        color: #cbd5e1;
        font-size: 0.95rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
        overflow: hidden;
    }

    .plant-item:hover {
        background: rgba(167, 139, 250, 0.1);
        border-color: rgba(167, 139, 250, 0.3);
        color: #fff;
        transform: translateX(4px);
    }

    .plant-item.active {
        background: rgba(167, 139, 250, 0.15);
        border-color: rgba(167, 139, 250, 0.5);
        color: #fff;
        box-shadow: 0 0 15px rgba(167, 139, 250, 0.2);
    }

    .plant-emoji {
        font-size: 1.2rem;
        width: 24px;
        text-align: center;
    }

    .indicator {
        position: absolute;
        right: 12px;
        width: 6px;
        height: 6px;
        background: #a78bfa;
        border-radius: 50%;
        box-shadow: 0 0 8px #a78bfa;
        animation: pulse 2s infinite;
    }

    .details-panel {
        padding-top: 1rem;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        animation: slideIn 0.3s ease-out;
    }

    .details-title {
        font-size: 1.15rem;
        font-weight: 600;
        color: #fff;
        margin: 0 0 0.5rem 0;
    }

    .details-desc {
        font-size: 0.85rem;
        line-height: 1.6;
        color: #94a3b8;
        margin: 0 0 1rem 0;
    }

    .properties-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 0.6rem;
    }

    .property-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.5rem 0;
        font-size: 0.8rem;
        border-bottom: 1px dashed rgba(255, 255, 255, 0.1);
    }

    .prop-label {
        color: #64748b;
    }

    .prop-value {
        color: #a78bfa;
        font-weight: 600;
        font-family: var(--font-mono);
        font-variant-numeric: tabular-nums;
        letter-spacing: 0.05em;
    }

    @keyframes pulse {
        0%,
        100% {
            opacity: 1;
        }
        50% {
            opacity: 0.4;
        }
    }

    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateY(8px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    /* Адаптив для мобильных */
    @media (max-width: 768px) {
        .sidebar {
            left: 1rem;
            right: 1rem;
            top: auto;
            bottom: 1rem;
            width: auto;
            transform: none;
            max-height: 60vh;
            overflow-y: auto;
        }
        .properties-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 0.5rem;
        }
    }
</style>

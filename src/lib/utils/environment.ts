export const HDRI_PRESETS = {
    warehouse:
        'https://cdn.jsdelivr.net/gh/pmndrs/drei-assets@master/hdri/warehouse_1k.hdr',
    forest: 'https://cdn.jsdelivr.net/gh/pmndrs/drei-assets@master/hdri/forest_1k.hdr',
    sunset: 'https://cdn.jsdelivr.net/gh/pmndrs/drei-assets@master/hdri/sunset_1k.hdr',
} as const

export type HDPreset = keyof typeof HDRI_PRESETS

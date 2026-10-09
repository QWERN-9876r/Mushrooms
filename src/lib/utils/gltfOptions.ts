import { useMeshopt } from '@threlte/extras'

// Модели в static/models сжаты meshopt (npm run models:optimize): без декодера
// GLTFLoader их не прочитает — передаются в каждый useGltf
export const GLTF_OPTIONS = { meshoptDecoder: useMeshopt() }

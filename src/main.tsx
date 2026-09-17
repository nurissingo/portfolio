import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { useGLTF, useTexture } from '@react-three/drei'
import { SceneCanvas } from './components/SceneCanvas'
import './scene.css'

const MODEL_URL = `${import.meta.env.BASE_URL}models/laptop.glb`
const SCREEN_URL = `${import.meta.env.BASE_URL}images/aistud.png`

useGLTF.preload(MODEL_URL)
useTexture.preload(SCREEN_URL)

const rootEl = document.getElementById('webgl-root')

if (rootEl) {
  createRoot(rootEl).render(
    <StrictMode>
      <SceneCanvas />
    </StrictMode>,
  )
}

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { SceneCanvas } from './components/SceneCanvas'
import './scene.css'

const rootEl = document.getElementById('webgl-root')

if (rootEl) {
  createRoot(rootEl).render(
    <StrictMode>
      <SceneCanvas />
    </StrictMode>,
  )
}

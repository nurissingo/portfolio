import { useGLTF } from '@react-three/drei'
import { useMemo } from 'react'
import * as THREE from 'three'

const MODEL_URL = `${import.meta.env.BASE_URL}models/hand.glb`

useGLTF.preload(MODEL_URL)

export function HandModel() {
  const { scene } = useGLTF(MODEL_URL)

  const cloned = useMemo(() => {
    const root = scene.clone(true)
    root.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh
        mesh.castShadow = true
        mesh.receiveShadow = true
        const mat = mesh.material
        if (mat && !Array.isArray(mat)) {
          const m = mat as THREE.MeshStandardMaterial
          if ('metalness' in m) {
            m.metalness = Math.min(0.55, (m.metalness ?? 0.2) + 0.15)
            m.roughness = Math.max(0.25, (m.roughness ?? 0.5) - 0.1)
            m.envMapIntensity = 1.2
          }
        }
      }
    })
    return root
  }, [scene])

  return <primitive object={cloned} />
}

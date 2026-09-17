import { useGLTF, useTexture } from '@react-three/drei'
import { useMemo } from 'react'
import * as THREE from 'three'

const MODEL_URL = `${import.meta.env.BASE_URL}models/laptop.glb`
const SCREEN_URL = `${import.meta.env.BASE_URL}images/aistud.png`

useGLTF.preload(MODEL_URL)

export function LaptopModel() {
  const { scene } = useGLTF(MODEL_URL)
  const screenMap = useTexture(SCREEN_URL)

  const cloned = useMemo(() => {
    const root = scene.clone(true)
    screenMap.colorSpace = THREE.SRGBColorSpace
    screenMap.flipY = true
    screenMap.anisotropy = 8

    root.traverse((obj) => {
      if (!(obj as THREE.Mesh).isMesh) return
      const mesh = obj as THREE.Mesh
      mesh.castShadow = true
      mesh.receiveShadow = true

      if (mesh.name === 'Screen') {
        mesh.material = new THREE.MeshStandardMaterial({
          map: screenMap,
          emissiveMap: screenMap,
          emissive: new THREE.Color('#a855f7'),
          emissiveIntensity: 0.35,
          metalness: 0.05,
          roughness: 0.35,
        })
      }
    })
    return root
  }, [scene, screenMap])

  return <primitive object={cloned} />
}

import { Center, useGLTF, useTexture } from '@react-three/drei'
import { useLayoutEffect, useMemo } from 'react'
import * as THREE from 'three'

const MODEL_URL = `${import.meta.env.BASE_URL}models/laptop.glb`
const SCREEN_URL = `${import.meta.env.BASE_URL}images/aistud.png`

useGLTF.preload(MODEL_URL)
useTexture.preload(SCREEN_URL)

export function LaptopModel() {
  const { scene } = useGLTF(MODEL_URL)
  const screenMap = useTexture(SCREEN_URL)

  const cloned = useMemo(() => scene.clone(true), [scene])

  useLayoutEffect(() => {
    screenMap.colorSpace = THREE.SRGBColorSpace
    screenMap.anisotropy = 16
    screenMap.flipY = false
    screenMap.wrapS = THREE.ClampToEdgeWrapping
    screenMap.wrapT = THREE.ClampToEdgeWrapping
    screenMap.needsUpdate = true

    cloned.traverse((obj) => {
      if (!(obj as THREE.Mesh).isMesh) return

      const mesh = obj as THREE.Mesh
      mesh.castShadow = true
      mesh.receiveShadow = true

      const applyMatte = (mat: THREE.Material) => {
        const m = mat as THREE.MeshStandardMaterial
        m.map = screenMap
        m.emissiveMap = screenMap
        m.emissive = new THREE.Color('#ffffff')
        m.emissiveIntensity = 0.5
        m.roughness = 0.9
        m.metalness = 0
        m.toneMapped = false
        m.needsUpdate = true
      }

      const matName = Array.isArray(mesh.material)
        ? mesh.material.map((m) => m.name).join(',')
        : mesh.material?.name

      if (mesh.name === 'matte' || matName === 'matte') {
        if (Array.isArray(mesh.material)) mesh.material.forEach(applyMatte)
        else if (mesh.material) applyMatte(mesh.material)
        return
      }

      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
      mats.forEach((mat) => {
        if (!mat) return
        const m = mat as THREE.MeshStandardMaterial
        if ('envMapIntensity' in m) m.envMapIntensity = 1.4
        if (m.name === 'aluminium' || m.name?.toLowerCase().includes('frame')) {
          m.metalness = Math.max(m.metalness ?? 0.7, 0.88)
          m.roughness = Math.min(m.roughness ?? 0.35, 0.28)
        }
        m.needsUpdate = true
      })
    })
  }, [cloned, screenMap])

  return (
    <Center>
      <primitive object={cloned} scale={0.085} />
    </Center>
  )
}

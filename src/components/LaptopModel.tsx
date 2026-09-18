import { Center, useGLTF, useTexture } from '@react-three/drei'
import { useLayoutEffect, useMemo } from 'react'
import * as THREE from 'three'

const MODEL_URL = `${import.meta.env.BASE_URL}models/laptop.glb`
const SCREEN_URL = `${import.meta.env.BASE_URL}images/aistud.png`

useGLTF.preload(MODEL_URL)
useTexture.preload(SCREEN_URL)

function makeAppleLogoTexture() {
  const size = 512
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  ctx.clearRect(0, 0, size, size)
  ctx.fillStyle = '#f1f5f9'
  ctx.translate(size / 2, size / 2 + 10)
  ctx.scale(size / 200, size / 200)

  // Body
  ctx.beginPath()
  ctx.moveTo(16.07, -31.25)
  ctx.bezierCurveTo(17.9, -33.2, 19.1, -35.8, 18.7, -38.5)
  ctx.bezierCurveTo(16.2, -38.4, 13.2, -36.9, 11.3, -34.9)
  ctx.bezierCurveTo(9.55, -33.05, 8.2, -30.4, 8.65, -27.8)
  ctx.bezierCurveTo(11.35, -27.6, 14.15, -29.15, 16.07, -31.25)
  ctx.closePath()
  ctx.fill()

  ctx.beginPath()
  ctx.moveTo(18.55, -26.55)
  ctx.bezierCurveTo(14.35, -26.3, 10.8, -28.85, 8.7, -28.85)
  ctx.bezierCurveTo(5.95, -28.85, 2.75, -26.45, 0.35, -26.45)
  ctx.bezierCurveTo(-2.95, -26.45, -5.85, -28.95, -9.55, -28.95)
  ctx.bezierCurveTo(-14.05, -28.95, -18.0, -26.15, -20.45, -21.85)
  ctx.bezierCurveTo(-25.5, -13.1, -21.45, -0.35, -16.35, 6.55)
  ctx.bezierCurveTo(-13.85, 10.0, -10.85, 14.15, -6.75, 14.0)
  ctx.bezierCurveTo(-2.75, 13.85, -1.45, 11.5, 3.15, 11.5)
  ctx.bezierCurveTo(7.7, 11.5, 9.15, 14.0, 13.4, 13.85)
  ctx.bezierCurveTo(17.75, 13.7, 20.35, 10.15, 22.8, 6.7)
  ctx.bezierCurveTo(25.65, 2.7, 26.8, -1.25, 26.9, -1.55)
  ctx.bezierCurveTo(26.7, -1.6, 20.0, -4.2, 19.85, -12.35)
  ctx.bezierCurveTo(19.7, -18.9, 25.15, -22.85, 25.4, -23.0)
  ctx.bezierCurveTo(22.55, -27.15, 18.55, -26.55, 18.55, -26.55)
  ctx.closePath()
  ctx.fill()

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  tex.needsUpdate = true
  return tex
}

function makeKeyboardTexture() {
  const w = 1024
  const h = 560
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = '#12151c'
  ctx.fillRect(0, 0, w, h)

  const cols = 14
  const rows = 5
  const padX = 40
  const padY = 32
  const gap = 9
  const keyW = (w - padX * 2 - gap * (cols - 1)) / cols
  const keyH = (h - padY * 2 - gap * (rows - 1)) / rows

  const drawKey = (x: number, y: number, kw: number, kh: number) => {
    const radius = 7
    ctx.beginPath()
    ctx.moveTo(x + radius, y)
    ctx.arcTo(x + kw, y, x + kw, y + kh, radius)
    ctx.arcTo(x + kw, y + kh, x, y + kh, radius)
    ctx.arcTo(x, y + kh, x, y, radius)
    ctx.arcTo(x, y, x + kw, y, radius)
    ctx.closePath()
    const g = ctx.createLinearGradient(x, y, x, y + kh)
    g.addColorStop(0, '#3d4452')
    g.addColorStop(0.5, '#2b303b')
    g.addColorStop(1, '#1c2028')
    ctx.fillStyle = g
    ctx.fill()
    ctx.strokeStyle = 'rgba(255,255,255,0.07)'
    ctx.lineWidth = 1
    ctx.stroke()
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (r === rows - 1 && c >= 3 && c <= 9) {
        if (c === 3) {
          drawKey(
            padX + c * (keyW + gap),
            padY + r * (keyH + gap),
            keyW * 7 + gap * 6,
            keyH,
          )
        }
        continue
      }
      drawKey(padX + c * (keyW + gap), padY + r * (keyH + gap), keyW, keyH)
    }
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  tex.needsUpdate = true
  return tex
}

function placeOnMesh(
  mesh: THREE.Mesh,
  child: THREE.Object3D,
  {
    face,
    lift = 0.02,
    scale = 0.55,
  }: { face: 'front' | 'back' | 'top'; lift?: number; scale?: number },
) {
  const box = new THREE.Box3().setFromObject(mesh)
  const size = box.getSize(new THREE.Vector3())
  const center = box.getCenter(new THREE.Vector3())

  mesh.updateWorldMatrix(true, false)
  const inv = new THREE.Matrix4().copy(mesh.matrixWorld).invert()

  const localCenter = center.clone().applyMatrix4(inv)
  const worldQuat = new THREE.Quaternion()
  mesh.getWorldQuaternion(worldQuat)

  child.position.copy(localCenter)

  if (face === 'top') {
    child.rotation.set(-Math.PI / 2, 0, 0)
    child.position.y += size.y * 0.5 + lift
    if ((child as THREE.Mesh).isMesh) {
      const m = child as THREE.Mesh
      m.scale.set(size.x * scale, size.z * (scale * 0.72), 1)
    }
  } else if (face === 'back') {
    child.rotation.set(0, Math.PI, 0)
    child.position.z -= size.z * 0.5 + lift
    if ((child as THREE.Mesh).isMesh) {
      const m = child as THREE.Mesh
      const s = Math.min(size.x, size.y) * 0.16
      m.scale.set(s, s * 1.2, 1)
    }
  } else {
    child.position.z += size.z * 0.5 + lift
    if ((child as THREE.Mesh).isMesh) {
      const m = child as THREE.Mesh
      m.scale.set(size.x * 0.92, size.y * 0.9, 1)
    }
  }

  mesh.add(child)
}

export function LaptopModel() {
  const { scene } = useGLTF(MODEL_URL)
  const screenMap = useTexture(SCREEN_URL)
  const appleMap = useMemo(() => makeAppleLogoTexture(), [])
  const keyboardMap = useMemo(() => makeKeyboardTexture(), [])
  const cloned = useMemo(() => scene.clone(true), [scene])

  useLayoutEffect(() => {
    screenMap.colorSpace = THREE.SRGBColorSpace
    screenMap.anisotropy = 16
    screenMap.flipY = false
    screenMap.center.set(0.5, 0.5)
    screenMap.rotation = 0
    screenMap.repeat.set(1, 1)
    screenMap.offset.set(0, 0)
    screenMap.wrapS = THREE.ClampToEdgeWrapping
    screenMap.wrapT = THREE.ClampToEdgeWrapping
    screenMap.needsUpdate = true

    let back: THREE.Mesh | null = null
    let body: THREE.Mesh | null = null

    ;['ScreenOverlay', 'KeyboardOverlay', 'AppleLogo'].forEach((name) => {
      const old = cloned.getObjectByName(name)
      if (old?.parent) old.parent.remove(old)
    })

    cloned.traverse((obj) => {
      if (!(obj as THREE.Mesh).isMesh) return
      const mesh = obj as THREE.Mesh
      mesh.castShadow = true
      mesh.receiveShadow = true

      if (mesh.name === 'back') back = mesh
      if (mesh.name === 'body') body = mesh

      if (mesh.name === 'matte') {
        // Экран өздігінен жарқырайды — қара болып қалмайды
        mesh.material = new THREE.MeshBasicMaterial({
          map: screenMap,
          toneMapped: false,
          side: THREE.DoubleSide,
          color: 0xffffff,
        })
        mesh.visible = true
        return
      }

      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
      mats.forEach((mat) => {
        if (!mat) return
        const m = mat as THREE.MeshStandardMaterial
        if ('envMapIntensity' in m) m.envMapIntensity = 1.45
        if (m.name === 'aluminium' || m.name?.toLowerCase().includes('frame')) {
          m.metalness = 0.92
          m.roughness = 0.24
          m.color = new THREE.Color('#c8ccd3')
        }
        m.needsUpdate = true
      })
    })

    if (body) {
      const kb = new THREE.Mesh(
        new THREE.PlaneGeometry(1, 1),
        new THREE.MeshStandardMaterial({
          map: keyboardMap,
          roughness: 0.65,
          metalness: 0.12,
        }),
      )
      kb.name = 'KeyboardOverlay'
      placeOnMesh(body, kb, { face: 'top', lift: 0.04, scale: 0.78 })
    }

    if (back) {
      const logo = new THREE.Mesh(
        new THREE.PlaneGeometry(1, 1),
        new THREE.MeshStandardMaterial({
          map: appleMap,
          transparent: true,
          roughness: 0.3,
          metalness: 0.25,
          emissive: new THREE.Color('#ffffff'),
          emissiveMap: appleMap,
          emissiveIntensity: 0.2,
          depthWrite: false,
          side: THREE.DoubleSide,
        }),
      )
      logo.name = 'AppleLogo'
      placeOnMesh(back, logo, { face: 'back', lift: 0.03 })
    }
  }, [appleMap, cloned, keyboardMap, screenMap])

  return (
    <Center>
      <primitive object={cloned} scale={0.085} />
    </Center>
  )
}

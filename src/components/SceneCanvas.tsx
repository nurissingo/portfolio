import type { RefObject } from 'react'
import { Suspense, useEffect, useRef, useState, useCallback } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import {
  ContactShadows,
  Environment,
  Float,
  useGLTF,
  useTexture,
} from '@react-three/drei'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  ACESFilmicToneMapping,
  SRGBColorSpace,
  type Group,
  PerspectiveCamera,
} from 'three'
import { LaptopModel } from './LaptopModel'

gsap.registerPlugin(ScrollTrigger)

const MODEL_URL = `${import.meta.env.BASE_URL}models/laptop.glb`
const SCREEN_URL = `${import.meta.env.BASE_URL}images/aistud.png`

useGLTF.preload(MODEL_URL)
useTexture.preload(SCREEN_URL)

function ScrollRig({
  modelRef,
}: {
  modelRef: RefObject<Group | null>
}) {
  const { camera } = useThree()

  useEffect(() => {
    const model = modelRef.current
    if (!model) return

    const cam = camera as PerspectiveCamera
    const state = {
      rotY: -0.38,
      posZ: 0,
      posX: 0.95,
      posY: -0.2,
      scale: 1,
      camX: 1.55,
      camY: 1.15,
      camZ: 4.35,
    }

    const apply = () => {
      model.rotation.y = state.rotY
      model.position.set(state.posX, state.posY, state.posZ)
      model.scale.setScalar(state.scale)
      cam.position.set(state.camX, state.camY, state.camZ)
      cam.lookAt(state.posX * 0.45, 0.25, 0)
    }

    apply()

    gsap.fromTo(
      state,
      { scale: 0.92, posY: -0.4 },
      {
        scale: 1,
        posY: -0.2,
        duration: 1.2,
        ease: 'power2.out',
        onUpdate: apply,
      },
    )

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: '#scroll-stage',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.1,
        invalidateOnRefresh: true,
      },
    })

    tl.to(state, {
      rotY: -0.2,
      posX: 1.15,
      posY: -0.15,
      posZ: 0,
      scale: 0.95,
      camX: 1.7,
      camY: 1.2,
      camZ: 4.1,
      duration: 1,
      ease: 'none',
      onUpdate: apply,
    })

    tl.to(state, {
      rotY: Math.PI / 2 - 0.2,
      posX: 0.15,
      posY: -0.1,
      posZ: -0.25,
      scale: 0.9,
      camX: 0.15,
      camY: 1.65,
      camZ: 3.5,
      duration: 1,
      ease: 'none',
      onUpdate: apply,
    })

    tl.to(state, {
      rotY: Math.PI - 0.3,
      posX: -0.95,
      posY: -0.15,
      posZ: 0.2,
      scale: 0.88,
      camX: -1.55,
      camY: 1.1,
      camZ: 3.9,
      duration: 1,
      ease: 'none',
      onUpdate: apply,
    })

    requestAnimationFrame(() => ScrollTrigger.refresh())

    return () => {
      tl.scrollTrigger?.kill()
      tl.kill()
    }
  }, [camera, modelRef])

  return null
}

function MouseParallax({
  modelRef,
}: {
  modelRef: RefObject<Group | null>
}) {
  const target = useRef({ x: 0, y: 0 })

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return

    const onMove = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1
      const ny = (e.clientY / window.innerHeight) * 2 - 1
      target.current.x = nx * 0.08
      target.current.y = ny * 0.05
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  useFrame(() => {
    const model = modelRef.current
    if (!model) return
    model.rotation.x += (target.current.y - model.rotation.x) * 0.05
    model.rotation.z += (-target.current.x * 0.28 - model.rotation.z) * 0.05
  })

  return null
}

function SceneContent({ onReady }: { onReady: () => void }) {
  const modelRef = useRef<Group>(null)

  useEffect(() => {
    onReady()
  }, [onReady])

  return (
    <>
      <fog attach="fog" args={['#0f172a', 14, 32]} />
      <ambientLight intensity={0.35} />
      <directionalLight
        position={[4.5, 6.5, 3.5]}
        intensity={1.65}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <directionalLight position={[-3.5, 2.5, -2]} intensity={0.45} color="#e2e8f0" />
      <spotLight
        position={[2.5, 5.5, 2]}
        angle={0.4}
        penumbra={0.7}
        intensity={1.1}
        color="#f8fafc"
      />
      <pointLight position={[-2, 1.2, 2.5]} intensity={0.35} color="#c4b5fd" />

      <Float speed={0.9} rotationIntensity={0.04} floatIntensity={0.12}>
        <group ref={modelRef} position={[0.95, -0.2, 0]}>
          <LaptopModel />
        </group>
      </Float>

      <ContactShadows
        position={[0, -1.35, 0]}
        opacity={0.65}
        scale={16}
        blur={2.8}
        far={6}
      />

      <Environment preset="studio" environmentIntensity={0.95} />
      <ScrollRig modelRef={modelRef} />
      <MouseParallax modelRef={modelRef} />
    </>
  )
}

export function SceneCanvas() {
  const [ready, setReady] = useState(false)
  const handleReady = useCallback(() => setReady(true), [])

  return (
    <div
      className={`webgl-canvas${ready ? ' webgl-canvas--ready' : ''}`}
      aria-hidden="true"
    >
      <Canvas
        dpr={[1, 2]}
        shadows
        gl={{
          antialias: true,
          alpha: true,
          toneMapping: ACESFilmicToneMapping,
          outputColorSpace: SRGBColorSpace,
          powerPreference: 'high-performance',
        }}
        camera={{ position: [1.55, 1.15, 4.35], fov: 38, near: 0.1, far: 50 }}
        style={{ background: 'transparent' }}
        onCreated={({ gl }) => {
          gl.toneMappingExposure = 1.05
        }}
      >
        <Suspense fallback={null}>
          <SceneContent onReady={handleReady} />
        </Suspense>
      </Canvas>
    </div>
  )
}

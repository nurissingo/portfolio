import type { RefObject } from 'react'
import { Suspense, useEffect, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Float, ContactShadows } from '@react-three/drei'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type * as THREE from 'three'
import { PerspectiveCamera } from 'three'
import { LaptopModel } from './LaptopModel'
import { ModelLoader } from './ModelLoader'

gsap.registerPlugin(ScrollTrigger)

function ScrollRig({
  modelRef,
}: {
  modelRef: RefObject<THREE.Group | null>
}) {
  const { camera } = useThree()

  useEffect(() => {
    const model = modelRef.current
    if (!model) return

    const cam = camera as PerspectiveCamera
    const state = {
      rotY: -0.35,
      posZ: 0,
      posX: 0.85,
      posY: -0.15,
      scale: 1.35,
      camX: 1.6,
      camY: 1.35,
      camZ: 4.6,
    }

    const apply = () => {
      model.rotation.y = state.rotY
      model.position.set(state.posX, state.posY, state.posZ)
      model.scale.setScalar(state.scale)
      cam.position.set(state.camX, state.camY, state.camZ)
      cam.lookAt(state.posX * 0.4, 0.35, 0)
    }

    apply()

    // Hero intro
    gsap.fromTo(
      state,
      { scale: 0.82, posY: -0.55 },
      {
        scale: 1.35,
        posY: -0.15,
        duration: 1.35,
        ease: 'power3.out',
        onUpdate: apply,
      },
    )

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: '#scroll-stage',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.15,
        invalidateOnRefresh: true,
      },
    })

    // About — front angle
    tl.to(state, {
      rotY: -0.2,
      posX: 1.1,
      posY: -0.1,
      posZ: 0,
      scale: 1.15,
      camX: 1.8,
      camY: 1.4,
      camZ: 4.2,
      duration: 1,
      ease: 'none',
      onUpdate: apply,
    })

    // Projects — side angle (~90°)
    tl.to(state, {
      rotY: Math.PI / 2 - 0.15,
      posX: 0.2,
      posY: -0.05,
      posZ: -0.4,
      scale: 1.05,
      camX: 0.2,
      camY: 1.9,
      camZ: 3.6,
      duration: 1,
      ease: 'none',
      onUpdate: apply,
    })

    // Services — back/side (~180°)
    tl.to(state, {
      rotY: Math.PI - 0.25,
      posX: -0.9,
      posY: -0.1,
      posZ: 0.25,
      scale: 1.0,
      camX: -1.7,
      camY: 1.2,
      camZ: 4.0,
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
  modelRef: RefObject<THREE.Group | null>
}) {
  const target = useRef({ x: 0, y: 0 })

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return

    const onMove = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1
      const ny = (e.clientY / window.innerHeight) * 2 - 1
      target.current.x = nx * 0.12
      target.current.y = ny * 0.08
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  useFrame(() => {
    const model = modelRef.current
    if (!model) return
    model.rotation.x += (target.current.y - model.rotation.x) * 0.06
    model.rotation.z += (-target.current.x * 0.35 - model.rotation.z) * 0.06
  })

  return null
}

function SceneContent() {
  const modelRef = useRef<THREE.Group>(null)

  return (
    <>
      <fog attach="fog" args={['#0f172a', 10, 28]} />
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 7, 4]} intensity={1.55} castShadow />
      <spotLight
        position={[3, 6, 2]}
        angle={0.45}
        penumbra={0.55}
        intensity={2.2}
        color="#c084fc"
      />
      <spotLight
        position={[-5, 4, 3]}
        angle={0.5}
        penumbra={0.7}
        intensity={1.4}
        color="#3b82f6"
      />
      <pointLight position={[0, 1.5, 2]} intensity={0.8} color="#a855f7" />

      <Float speed={1.2} rotationIntensity={0.08} floatIntensity={0.28}>
        <group ref={modelRef} position={[0.85, -0.15, 0]} scale={1.35}>
          <LaptopModel />
        </group>
      </Float>

      <ContactShadows
        position={[0, -1.45, 0]}
        opacity={0.55}
        scale={14}
        blur={2.6}
        far={5}
      />

      <Environment preset="city" environmentIntensity={0.85} />
      <ScrollRig modelRef={modelRef} />
      <MouseParallax modelRef={modelRef} />
    </>
  )
}

export function SceneCanvas() {
  return (
    <div className="webgl-canvas" aria-hidden="true">
      <Canvas
        dpr={[1, 1.85]}
        gl={{ antialias: true, alpha: true }}
        camera={{ position: [1.6, 1.35, 4.6], fov: 40, near: 0.1, far: 50 }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={<ModelLoader />}>
          <SceneContent />
        </Suspense>
      </Canvas>
    </div>
  )
}

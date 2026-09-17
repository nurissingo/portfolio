import type { RefObject } from 'react'
import { Suspense, useEffect, useRef } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { Environment, Float, ContactShadows } from '@react-three/drei'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type * as THREE from 'three'
import { PerspectiveCamera } from 'three'
import { HandModel } from './HandModel'
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
      rotY: 0,
      posZ: 0,
      camX: 2.2,
      camY: 1.2,
      camZ: 4.2,
    }

    const apply = () => {
      model.rotation.y = state.rotY
      model.position.z = state.posZ
      cam.position.set(state.camX, state.camY, state.camZ)
      cam.lookAt(0, 0.2, 0)
    }

    apply()

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: '#scroll-stage',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.2,
        invalidateOnRefresh: true,
      },
    })

    // Section 1 → 0°
    tl.to(state, {
      rotY: 0,
      posZ: 0,
      camX: 2.2,
      camY: 1.2,
      camZ: 4.2,
      duration: 1,
      ease: 'none',
      onUpdate: apply,
    })

    // Section 2 → 90°
    tl.to(state, {
      rotY: Math.PI / 2,
      posZ: -0.6,
      camX: 0.4,
      camY: 1.8,
      camZ: 3.4,
      duration: 1,
      ease: 'none',
      onUpdate: apply,
    })

    // Section 3 → 180°
    tl.to(state, {
      rotY: Math.PI,
      posZ: 0.35,
      camX: -2.0,
      camY: 1.0,
      camZ: 3.8,
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

function SceneContent() {
  const modelRef = useRef<THREE.Group>(null)

  return (
    <>
      <ambientLight intensity={0.45} />
      <directionalLight position={[4, 6, 3]} intensity={1.35} castShadow />
      <spotLight
        position={[-4, 5, 2]}
        angle={0.4}
        penumbra={0.6}
        intensity={1.1}
        color="#a855f7"
      />

      <Float speed={1.4} rotationIntensity={0.15} floatIntensity={0.35}>
        <group ref={modelRef} position={[0, -0.2, 0]} scale={1.15}>
          <HandModel />
        </group>
      </Float>

      <ContactShadows
        position={[0, -1.35, 0]}
        opacity={0.45}
        scale={12}
        blur={2.4}
        far={4}
      />

      <Environment preset="city" />
      <ScrollRig modelRef={modelRef} />
    </>
  )
}

export function SceneCanvas() {
  return (
    <div className="webgl-canvas" aria-hidden="true">
      <Canvas
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true }}
        camera={{ position: [2.2, 1.2, 4.2], fov: 42, near: 0.1, far: 50 }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={<ModelLoader />}>
          <SceneContent />
        </Suspense>
      </Canvas>
    </div>
  )
}

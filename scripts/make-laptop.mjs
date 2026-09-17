import { JSDOM } from 'jsdom'
import * as THREE from 'three'
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const dom = new JSDOM('', { pretendToBeVisual: true })
globalThis.window = dom.window
globalThis.document = dom.window.document
globalThis.Blob = dom.window.Blob
globalThis.FileReader = dom.window.FileReader

async function main() {
  const out = path.join(path.dirname(fileURLToPath(import.meta.url)), '../public/models/laptop.glb')

  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.78,
    roughness: 0.28,
    emissive: 0x312e81,
    emissiveIntensity: 0.14,
  })
  const accentMat = new THREE.MeshStandardMaterial({
    color: 0xa855f7,
    metalness: 0.45,
    roughness: 0.35,
    emissive: 0x7c3aed,
    emissiveIntensity: 0.5,
  })
  const screenMat = new THREE.MeshStandardMaterial({
    color: 0x111827,
    emissive: 0x6d28d9,
    emissiveIntensity: 0.55,
    metalness: 0.05,
    roughness: 0.35,
  })
  const bezelMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    metalness: 0.65,
    roughness: 0.4,
  })

  const laptop = new THREE.Group()
  laptop.name = 'Laptop'

  const base = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.12, 2.1), bodyMat)
  base.name = 'Base'
  laptop.add(base)

  const pad = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.02, 0.7), bezelMat)
  pad.name = 'Trackpad'
  pad.position.set(0, 0.07, 0.35)
  laptop.add(pad)

  const keys = new THREE.Mesh(new THREE.BoxGeometry(2.7, 0.03, 0.95), accentMat)
  keys.name = 'Keyboard'
  keys.position.set(0, 0.07, -0.35)
  laptop.add(keys)

  const lid = new THREE.Group()
  lid.name = 'Lid'
  lid.position.set(0, 0.06, -1.0)
  lid.rotation.x = -Math.PI / 2.35

  const bezel = new THREE.Mesh(new THREE.BoxGeometry(3.2, 2.05, 0.08), bezelMat)
  bezel.name = 'Bezel'
  bezel.position.set(0, 1.02, 0)
  lid.add(bezel)

  const screen = new THREE.Mesh(new THREE.PlaneGeometry(2.9, 1.75), screenMat)
  screen.name = 'Screen'
  screen.position.set(0, 1.05, 0.05)
  lid.add(screen)

  const rim = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.04, 0.04), accentMat)
  rim.name = 'Rim'
  rim.position.set(0, 0.12, 0.06)
  lid.add(rim)

  laptop.add(lid)

  const glb = await new GLTFExporter().parseAsync(laptop, { binary: true })
  fs.mkdirSync(path.dirname(out), { recursive: true })
  fs.writeFileSync(out, Buffer.from(glb))
  console.log('Wrote', out, fs.statSync(out).size, 'bytes')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

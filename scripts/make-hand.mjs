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
  const out = path.join(path.dirname(fileURLToPath(import.meta.url)), '../public/models/hand.glb')
  const mat = new THREE.MeshStandardMaterial({
    color: 0xb8a0e8,
    metalness: 0.4,
    roughness: 0.3,
    emissive: 0x4c1d95,
    emissiveIntensity: 0.18,
  })

  const hand = new THREE.Group()
  hand.name = 'Hand'
  hand.add(new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.28, 1.35), mat.clone()))

  for (const f of [
    { x: -0.4, z: 0.85, h: 0.95 },
    { x: -0.13, z: 0.95, h: 1.1 },
    { x: 0.13, z: 0.95, h: 1.05 },
    { x: 0.4, z: 0.85, h: 0.85 },
  ]) {
    const finger = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, f.h), mat.clone())
    finger.position.set(f.x, 0.02, f.z)
    hand.add(finger)
  }

  const thumb = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.22, 0.7), mat.clone())
  thumb.position.set(-0.7, 0.02, 0.15)
  thumb.rotation.y = 0.55
  hand.add(thumb)

  const glb = await new GLTFExporter().parseAsync(hand, { binary: true })
  fs.mkdirSync(path.dirname(out), { recursive: true })
  fs.writeFileSync(out, Buffer.from(glb))
  console.log('Wrote', out, fs.statSync(out).size, 'bytes')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

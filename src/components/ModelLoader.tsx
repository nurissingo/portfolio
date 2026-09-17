import { useProgress, Html } from '@react-three/drei'

/** Canvas Suspense fallback — әдемі лоадер */
export function ModelLoader() {
  const { progress } = useProgress()

  return (
    <Html fullscreen zIndexRange={[2000, 0]}>
      <div className="model-loader" role="status" aria-live="polite">
        <div className="model-loader__card">
          <div className="model-loader__orb" />
          <p className="model-loader__title">3D модель жүктелуде</p>
          <div className="model-loader__bar">
            <span style={{ width: `${Math.min(100, progress || 8)}%` }} />
          </div>
          <p className="model-loader__pct">{Math.round(progress || 0)}%</p>
        </div>
      </div>
    </Html>
  )
}

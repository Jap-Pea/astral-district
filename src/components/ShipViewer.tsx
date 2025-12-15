// ShipViewer.tsx
import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF, Html, Environment } from '@react-three/drei'
import type { GLTF } from 'three-stdlib'
import type { Object3D } from 'three'

type ShipViewerProps = {
  src: string // '/models/spaceship.glb'
  width?: number | string
  height?: number | string
  background?: string
  autoRotate?: boolean
  initialScale?: number
}

function ShipModel({
  src,
  initialScale = 1,
}: {
  src: string
  initialScale?: number
}) {
  const { scene } = useGLTF(src) as GLTF & { scene: Object3D }

  return (
    <primitive object={scene} scale={initialScale} position={[0, -0.1, 0]} />
  )
}

export default function ShipViewer({
  src,
  width = '100%',
  height = 400,
  background = '#0b0f1a',
  autoRotate = false,
  initialScale = 1,
}: ShipViewerProps) {
  return (
    <div style={{ width, height }}>
      <Canvas camera={{ position: [0, 3, 10], fov: 45 }} style={{ background }}>
        {/* Lighting */}
        <ambientLight intensity={0.6} />
        <spotLight
          position={[10, 10, 10]}
          angle={0.8}
          intensity={1}
          castShadow
        />
        <pointLight position={[-10, -10, -10]} intensity={0.4} />

        <Suspense
          fallback={
            <Html center style={{ color: 'white' }}>
              Loading ship...
            </Html>
          }
        >
          {/* Environment provides a subtle HDR-like lighting */}
          <Environment preset="city" />

          <ShipModel src={src} initialScale={initialScale} />
        </Suspense>

        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          autoRotate={autoRotate}
        />
      </Canvas>
    </div>
  )
}

// Usage notes:
// 1) Install required packages:
//    npm install three @react-three/fiber @react-three/drei
//
// 2) Put your ship model (glb) in the public folder, e.g. public/models/ship.glb
//
// 3) Use the component anywhere in your React app:
//    <ShipViewer src="/models/ship.glb" height={480} width={600} autoRotate={false} initialScale={0.8} />
//
// 4) If the model looks too big/small, tweak initialScale.

// Optional: Preload helper (uncomment and call somewhere during app startup if you want):
// useGLTF.preload('/models/spaceship.glb')

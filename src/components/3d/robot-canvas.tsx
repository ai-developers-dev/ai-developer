import { Canvas } from '@react-three/fiber'
import { Float, OrbitControls, Environment } from '@react-three/drei'
import { RobotModel } from './robot-model.js'

export function RobotCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 1.5, 5.5], fov: 45 }}
      style={{ width: '100%', height: '100%' }}
      gl={{ alpha: true }}
    >
      {/* Soft ambient fill */}
      <ambientLight intensity={0.6} color="#F5F3FF" />

      {/* Key light — warm white from upper right */}
      <directionalLight position={[4, 6, 4]} intensity={1.2} color="#FFFFFF" />

      {/* Rim light — purple edge from behind left */}
      <directionalLight position={[-4, 3, -3]} intensity={0.6} color="#A78BFA" />

      {/* Fill light — soft purple from lower front */}
      <pointLight position={[0, -1, 4]} intensity={0.4} color="#DDD6FE" />

      {/* Accent light — cyan highlight from right */}
      <pointLight position={[3, 2, 2]} intensity={0.5} color="#06B6D4" />

      <Float speed={1.8} rotationIntensity={0.2} floatIntensity={0.6}>
        <RobotModel />
      </Float>

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={1.2}
        maxPolarAngle={Math.PI / 1.8}
        minPolarAngle={Math.PI / 3}
      />
      <Environment preset="studio" />
    </Canvas>
  )
}

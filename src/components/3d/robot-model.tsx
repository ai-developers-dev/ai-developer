import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'

export function RobotModel() {
  const groupRef = useRef<Group>(null)
  const headRef = useRef<Group>(null)

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y =
        Math.sin(state.clock.elapsedTime * 0.3) * 0.08
    }
    if (headRef.current) {
      headRef.current.rotation.y =
        Math.sin(state.clock.elapsedTime * 0.5 + 0.5) * 0.05
      headRef.current.rotation.x =
        Math.sin(state.clock.elapsedTime * 0.4) * 0.03
    }
  })

  // Material presets
  const white = { color: '#F0ECF8', metalness: 0.3, roughness: 0.35 }
  const whiteShiny = { color: '#FEFCFF', metalness: 0.4, roughness: 0.2 }
  const joint = { color: '#2D2440', metalness: 0.7, roughness: 0.25 }
  const accent = { color: '#8B5CF6', metalness: 0.5, roughness: 0.3 }
  const glow = {
    color: '#A78BFA',
    emissive: '#8B5CF6',
    emissiveIntensity: 1.8,
  }
  const cyanGlow = {
    color: '#67E8F9',
    emissive: '#06B6D4',
    emissiveIntensity: 2.5,
  }

  return (
    <group ref={groupRef} position={[0, -1.2, 0]}>
      {/* =================== HEAD =================== */}
      <group ref={headRef} position={[0, 3.05, 0]}>
        {/* Cranium — smooth rounded skull */}
        <mesh position={[0, 0.15, 0]}>
          <sphereGeometry args={[0.58, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
          <meshStandardMaterial {...whiteShiny} />
        </mesh>

        {/* Face plate — slightly narrower, human-like */}
        <mesh position={[0, -0.08, 0.08]}>
          <sphereGeometry args={[0.54, 32, 32]} />
          <meshStandardMaterial {...white} />
        </mesh>

        {/* Forehead panel line */}
        <mesh position={[0, 0.22, 0.48]}>
          <boxGeometry args={[0.6, 0.02, 0.02]} />
          <meshStandardMaterial {...accent} />
        </mesh>

        {/* Forehead sensors — 3 small dots */}
        {[-0.12, 0, 0.12].map((x) => (
          <mesh key={`sensor-${x}`} position={[x, 0.35, 0.46]}>
            <sphereGeometry args={[0.025, 12, 12]} />
            <meshStandardMaterial {...cyanGlow} />
          </mesh>
        ))}

        {/* Left eye — glowing recessed */}
        <group position={[-0.18, 0.05, 0.48]}>
          <mesh>
            <cylinderGeometry args={[0.08, 0.08, 0.04, 24]} />
            <meshStandardMaterial {...joint} />
          </mesh>
          <mesh position={[0, 0, 0.01]} rotation={[Math.PI / 2, 0, 0]}>
            <sphereGeometry args={[0.06, 16, 16]} />
            <meshStandardMaterial {...cyanGlow} />
          </mesh>
        </group>

        {/* Right eye — glowing recessed */}
        <group position={[0.18, 0.05, 0.48]}>
          <mesh>
            <cylinderGeometry args={[0.08, 0.08, 0.04, 24]} />
            <meshStandardMaterial {...joint} />
          </mesh>
          <mesh position={[0, 0, 0.01]} rotation={[Math.PI / 2, 0, 0]}>
            <sphereGeometry args={[0.06, 16, 16]} />
            <meshStandardMaterial {...cyanGlow} />
          </mesh>
        </group>

        {/* Nose ridge — subtle */}
        <mesh position={[0, -0.08, 0.53]}>
          <boxGeometry args={[0.04, 0.12, 0.04]} />
          <meshStandardMaterial {...white} />
        </mesh>

        {/* Mouth / chin speaker grille */}
        <mesh position={[0, -0.22, 0.48]}>
          <boxGeometry args={[0.22, 0.04, 0.02]} />
          <meshStandardMaterial {...joint} />
        </mesh>
        <mesh position={[0, -0.27, 0.46]}>
          <boxGeometry args={[0.16, 0.02, 0.02]} />
          <meshStandardMaterial {...joint} />
        </mesh>

        {/* Jaw line panels (left/right) */}
        <mesh position={[-0.38, -0.15, 0.25]} rotation={[0, 0.3, 0]}>
          <boxGeometry args={[0.18, 0.25, 0.06]} />
          <meshStandardMaterial {...white} />
        </mesh>
        <mesh position={[0.38, -0.15, 0.25]} rotation={[0, -0.3, 0]}>
          <boxGeometry args={[0.18, 0.25, 0.06]} />
          <meshStandardMaterial {...white} />
        </mesh>

        {/* Ear panels */}
        <mesh position={[-0.52, 0.0, 0.0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.08, 16]} />
          <meshStandardMaterial {...joint} />
        </mesh>
        <mesh position={[0.52, 0.0, 0.0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.08, 16]} />
          <meshStandardMaterial {...joint} />
        </mesh>

        {/* Headset boom mic — left side */}
        <group position={[-0.52, -0.05, 0.05]}>
          {/* Arm going down */}
          <mesh position={[0, -0.18, 0.08]} rotation={[0.3, 0, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.35, 8]} />
            <meshStandardMaterial {...joint} />
          </mesh>
          {/* Horizontal boom */}
          <mesh position={[0.18, -0.35, 0.22]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.02, 0.02, 0.35, 8]} />
            <meshStandardMaterial {...joint} />
          </mesh>
          {/* Mic tip */}
          <mesh position={[0.35, -0.35, 0.22]}>
            <sphereGeometry args={[0.045, 12, 12]} />
            <meshStandardMaterial {...glow} />
          </mesh>
        </group>

        {/* Headband across top */}
        <mesh position={[0, 0.42, 0]} rotation={[0, 0, 0]}>
          <torusGeometry args={[0.5, 0.025, 8, 32, Math.PI]} />
          <meshStandardMaterial {...joint} />
        </mesh>
      </group>

      {/* =================== NECK =================== */}
      <group position={[0, 2.5, 0]}>
        {/* Main neck cylinder */}
        <mesh>
          <cylinderGeometry args={[0.15, 0.2, 0.35, 16]} />
          <meshStandardMaterial {...joint} />
        </mesh>
        {/* Neck ring accent */}
        <mesh position={[0, -0.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.19, 0.015, 8, 24]} />
          <meshStandardMaterial {...glow} />
        </mesh>
      </group>

      {/* =================== TORSO =================== */}
      <group position={[0, 1.55, 0]}>
        {/* Upper chest — broad, trapezoidal feel */}
        <mesh position={[0, 0.35, 0]}>
          <boxGeometry args={[1.4, 0.7, 0.7]} />
          <meshStandardMaterial {...whiteShiny} />
        </mesh>
        {/* Rounded chest cover */}
        <mesh position={[0, 0.35, 0.2]}>
          <sphereGeometry args={[0.65, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.4]} />
          <meshStandardMaterial {...white} />
        </mesh>

        {/* Chest arc reactor / core light */}
        <mesh position={[0, 0.35, 0.55]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.12, 0.025, 12, 24]} />
          <meshStandardMaterial {...cyanGlow} />
        </mesh>
        <mesh position={[0, 0.35, 0.56]}>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshStandardMaterial {...cyanGlow} />
        </mesh>

        {/* Chest panel lines */}
        <mesh position={[0, 0.12, 0.53]}>
          <boxGeometry args={[0.7, 0.015, 0.01]} />
          <meshStandardMaterial {...accent} />
        </mesh>

        {/* Mid torso — narrower */}
        <mesh position={[0, -0.15, 0]}>
          <boxGeometry args={[1.1, 0.5, 0.6]} />
          <meshStandardMaterial {...white} />
        </mesh>

        {/* Waist / abdomen segments */}
        {[-0.15, -0.28, -0.41].map((y) => (
          <mesh key={`seg-${y}`} position={[0, y, 0.32]}>
            <boxGeometry args={[0.85, 0.04, 0.02]} />
            <meshStandardMaterial {...joint} />
          </mesh>
        ))}

        {/* Lower torso / pelvis */}
        <mesh position={[0, -0.55, 0]}>
          <boxGeometry args={[0.9, 0.3, 0.55]} />
          <meshStandardMaterial {...white} />
        </mesh>

        {/* Hip accent */}
        <mesh position={[0, -0.55, 0.29]}>
          <boxGeometry args={[0.6, 0.02, 0.02]} />
          <meshStandardMaterial {...glow} />
        </mesh>
      </group>

      {/* =================== LEFT ARM =================== */}
      <group position={[-0.85, 2.15, 0]}>
        {/* Shoulder ball joint */}
        <mesh>
          <sphereGeometry args={[0.17, 24, 24]} />
          <meshStandardMaterial {...joint} />
        </mesh>
        {/* Shoulder cap */}
        <mesh position={[-0.1, 0.05, 0]}>
          <sphereGeometry args={[0.2, 24, 24, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
          <meshStandardMaterial {...whiteShiny} />
        </mesh>

        {/* Upper arm */}
        <mesh position={[0, -0.4, 0]}>
          <cylinderGeometry args={[0.12, 0.1, 0.6, 16]} />
          <meshStandardMaterial {...white} />
        </mesh>
        {/* Upper arm accent stripe */}
        <mesh position={[0, -0.35, 0.11]}>
          <boxGeometry args={[0.04, 0.3, 0.01]} />
          <meshStandardMaterial {...accent} />
        </mesh>

        {/* Elbow joint */}
        <mesh position={[0, -0.75, 0]}>
          <sphereGeometry args={[0.1, 20, 20]} />
          <meshStandardMaterial {...joint} />
        </mesh>
        {/* Elbow glow ring */}
        <mesh position={[0, -0.75, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.11, 0.012, 8, 20]} />
          <meshStandardMaterial {...glow} />
        </mesh>

        {/* Forearm */}
        <mesh position={[0, -1.1, 0]}>
          <cylinderGeometry args={[0.1, 0.09, 0.55, 16]} />
          <meshStandardMaterial {...white} />
        </mesh>

        {/* Wrist */}
        <mesh position={[0, -1.4, 0]}>
          <cylinderGeometry args={[0.07, 0.08, 0.1, 16]} />
          <meshStandardMaterial {...joint} />
        </mesh>

        {/* Hand — simplified flat */}
        <mesh position={[0, -1.55, 0]}>
          <boxGeometry args={[0.14, 0.18, 0.08]} />
          <meshStandardMaterial {...whiteShiny} />
        </mesh>
        {/* Fingers (4 grouped) */}
        {[-0.04, -0.013, 0.013, 0.04].map((x) => (
          <mesh key={`lf-${x}`} position={[x, -1.72, 0]}>
            <boxGeometry args={[0.022, 0.16, 0.06]} />
            <meshStandardMaterial {...white} />
          </mesh>
        ))}
        {/* Thumb */}
        <mesh position={[-0.1, -1.58, 0]} rotation={[0, 0, 0.5]}>
          <boxGeometry args={[0.025, 0.12, 0.06]} />
          <meshStandardMaterial {...white} />
        </mesh>
      </group>

      {/* =================== RIGHT ARM =================== */}
      <group position={[0.85, 2.15, 0]}>
        <mesh>
          <sphereGeometry args={[0.17, 24, 24]} />
          <meshStandardMaterial {...joint} />
        </mesh>
        <mesh position={[0.1, 0.05, 0]}>
          <sphereGeometry args={[0.2, 24, 24, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
          <meshStandardMaterial {...whiteShiny} />
        </mesh>

        <mesh position={[0, -0.4, 0]}>
          <cylinderGeometry args={[0.12, 0.1, 0.6, 16]} />
          <meshStandardMaterial {...white} />
        </mesh>
        <mesh position={[0, -0.35, 0.11]}>
          <boxGeometry args={[0.04, 0.3, 0.01]} />
          <meshStandardMaterial {...accent} />
        </mesh>

        <mesh position={[0, -0.75, 0]}>
          <sphereGeometry args={[0.1, 20, 20]} />
          <meshStandardMaterial {...joint} />
        </mesh>
        <mesh position={[0, -0.75, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.11, 0.012, 8, 20]} />
          <meshStandardMaterial {...glow} />
        </mesh>

        <mesh position={[0, -1.1, 0]}>
          <cylinderGeometry args={[0.1, 0.09, 0.55, 16]} />
          <meshStandardMaterial {...white} />
        </mesh>

        <mesh position={[0, -1.4, 0]}>
          <cylinderGeometry args={[0.07, 0.08, 0.1, 16]} />
          <meshStandardMaterial {...joint} />
        </mesh>

        <mesh position={[0, -1.55, 0]}>
          <boxGeometry args={[0.14, 0.18, 0.08]} />
          <meshStandardMaterial {...whiteShiny} />
        </mesh>
        {[-0.04, -0.013, 0.013, 0.04].map((x) => (
          <mesh key={`rf-${x}`} position={[x, -1.72, 0]}>
            <boxGeometry args={[0.022, 0.16, 0.06]} />
            <meshStandardMaterial {...white} />
          </mesh>
        ))}
        <mesh position={[0.1, -1.58, 0]} rotation={[0, 0, -0.5]}>
          <boxGeometry args={[0.025, 0.12, 0.06]} />
          <meshStandardMaterial {...white} />
        </mesh>
      </group>

      {/* =================== LEFT LEG =================== */}
      <group position={[-0.3, 0.55, 0]}>
        {/* Hip joint */}
        <mesh>
          <sphereGeometry args={[0.14, 20, 20]} />
          <meshStandardMaterial {...joint} />
        </mesh>

        {/* Upper thigh */}
        <mesh position={[0, -0.4, 0]}>
          <cylinderGeometry args={[0.14, 0.12, 0.65, 16]} />
          <meshStandardMaterial {...white} />
        </mesh>

        {/* Knee */}
        <mesh position={[0, -0.78, 0]}>
          <sphereGeometry args={[0.11, 20, 20]} />
          <meshStandardMaterial {...joint} />
        </mesh>
        <mesh position={[0, -0.78, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.12, 0.012, 8, 20]} />
          <meshStandardMaterial {...glow} />
        </mesh>

        {/* Shin */}
        <mesh position={[0, -1.15, 0]}>
          <cylinderGeometry args={[0.11, 0.1, 0.6, 16]} />
          <meshStandardMaterial {...white} />
        </mesh>

        {/* Ankle */}
        <mesh position={[0, -1.5, 0]}>
          <cylinderGeometry args={[0.08, 0.09, 0.1, 16]} />
          <meshStandardMaterial {...joint} />
        </mesh>

        {/* Foot */}
        <mesh position={[0, -1.6, 0.08]}>
          <boxGeometry args={[0.2, 0.1, 0.38]} />
          <meshStandardMaterial {...whiteShiny} />
        </mesh>
        {/* Toe cap */}
        <mesh position={[0, -1.6, 0.28]}>
          <sphereGeometry args={[0.1, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
          <meshStandardMaterial {...white} />
        </mesh>
      </group>

      {/* =================== RIGHT LEG =================== */}
      <group position={[0.3, 0.55, 0]}>
        <mesh>
          <sphereGeometry args={[0.14, 20, 20]} />
          <meshStandardMaterial {...joint} />
        </mesh>

        <mesh position={[0, -0.4, 0]}>
          <cylinderGeometry args={[0.14, 0.12, 0.65, 16]} />
          <meshStandardMaterial {...white} />
        </mesh>

        <mesh position={[0, -0.78, 0]}>
          <sphereGeometry args={[0.11, 20, 20]} />
          <meshStandardMaterial {...joint} />
        </mesh>
        <mesh position={[0, -0.78, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.12, 0.012, 8, 20]} />
          <meshStandardMaterial {...glow} />
        </mesh>

        <mesh position={[0, -1.15, 0]}>
          <cylinderGeometry args={[0.11, 0.1, 0.6, 16]} />
          <meshStandardMaterial {...white} />
        </mesh>

        <mesh position={[0, -1.5, 0]}>
          <cylinderGeometry args={[0.08, 0.09, 0.1, 16]} />
          <meshStandardMaterial {...joint} />
        </mesh>

        <mesh position={[0, -1.6, 0.08]}>
          <boxGeometry args={[0.2, 0.1, 0.38]} />
          <meshStandardMaterial {...whiteShiny} />
        </mesh>
        <mesh position={[0, -1.6, 0.28]}>
          <sphereGeometry args={[0.1, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
          <meshStandardMaterial {...white} />
        </mesh>
      </group>
    </group>
  )
}

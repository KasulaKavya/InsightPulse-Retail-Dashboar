import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

function generatePositions(count = 5000) {
  const positions = [];
  for (let i = 0; i < count; i++) {
    positions.push(
      THREE.MathUtils.randFloatSpread(100),
      THREE.MathUtils.randFloatSpread(100),
      THREE.MathUtils.randFloatSpread(100)
    );
  }
  return new Float32Array(positions);
}

function generateColors(count = 5000) {
  const colors = [];
  const goldShades = ['#FFD700', '#FFBF00', '#FFE066', '#FFF8DC', '#FFECB3', '#FFF1A8', '#FCE205', '#FFFFE0', '#FFDAB9', '#FFFACD'];
  for (let i = 0; i < count; i++) {
    const color = new THREE.Color(goldShades[Math.floor(Math.random() * goldShades.length)]);
    colors.push(color.r, color.g, color.b);
  }
  return new Float32Array(colors);
}

function ParticleCloud() {
  const positions = React.useMemo(() => generatePositions(), []);
  const colors = React.useMemo(() => generateColors(positions.length / 3), [positions]);

  return (
    <Points
      key="glow-particles"
      positions={positions}
      colors={colors}
      stride={3}
      frustumCulled={false}
    >
      <PointMaterial
        vertexColors
        transparent
        size={0.45}
        sizeAttenuation={true}
        depthWrite={false}
      />
    </Points>
  );
}

function BackgroundParticles() {
  return (
    <div id="particle-wrapper">
      <Canvas
        style={{
          position: 'fixed',
          zIndex: -1,
          top: 0,
          left: 0,
          height: '100vh',
          width: '100vw',
          pointerEvents: 'none'
        }}
        camera={{ position: [0, 0, 1] }}
      >
        <ambientLight intensity={0.8} />
        <ParticleCloud />
      </Canvas>
    </div>
  );
}

export default BackgroundParticles;

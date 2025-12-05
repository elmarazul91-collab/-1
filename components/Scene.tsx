import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, ContactShadows, Float, Stars, Sparkles } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import { Tree } from './Tree';
import { Ornaments, FairyLights, Star } from './Decorations';
import { TreeMode } from '../types';

interface SceneProps {
  treeMode: TreeMode;
}

export const Scene: React.FC<SceneProps> = ({ treeMode }) => {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 2, 9], fov: 45 }}
      dpr={[1, 2]} // Quality scaling
      gl={{ antialias: false, stencil: false, depth: true }} // Perf optimization for post-processing
    >
      <color attach="background" args={['#050505']} />
      
      <Suspense fallback={null}>
        {/* Cinematic Lighting */}
        <ambientLight intensity={0.2} color="#022D19" />
        
        {/* Main "Moonlight/Spotlight" */}
        <spotLight 
          position={[5, 10, 5]} 
          angle={0.5} 
          penumbra={1} 
          intensity={80} 
          castShadow 
          shadow-bias={-0.0001}
          color="#FFD700" 
        />
        
        {/* Rim Light for drama */}
        <spotLight 
          position={[-5, 5, -5]} 
          angle={0.5} 
          penumbra={1} 
          intensity={50} 
          color="#0B4F32" 
        />
        
        <group position={[0, -0.5, 0]}>
          <Float 
            speed={treeMode === TreeMode.SCATTERED ? 0.5 : 2} 
            rotationIntensity={treeMode === TreeMode.SCATTERED ? 0.05 : 0.1} 
            floatIntensity={treeMode === TreeMode.SCATTERED ? 0.1 : 0.2}
          >
            <Tree treeMode={treeMode} />
            <Ornaments treeMode={treeMode} />
            <FairyLights treeMode={treeMode} />
            <Star treeMode={treeMode} />
          </Float>
          
          {/* Floor Reflections - Only visible when assembled to save perf or keep aesthetic focus */}
          <ContactShadows 
            opacity={0.7} 
            scale={15} 
            blur={2.5} 
            far={4.5} 
            color="#000000" 
          />
        </group>

        {/* Environment Atmosphere */}
        <Environment preset="city" environmentIntensity={0.5} />
        <Sparkles count={200} scale={10} size={2} speed={0.4} opacity={0.5} color="#F9E076" />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

        {/* Post Processing for the "Arix Signature" Look */}
        <EffectComposer disableNormalPass>
          <Bloom 
            luminanceThreshold={1.2} 
            mipmapBlur 
            intensity={1.5} 
            radius={0.6} 
          />
          <Vignette eskil={false} offset={0.1} darkness={1.1} />
          <Noise opacity={0.02} /> {/* Subtle film grain */}
        </EffectComposer>
        
      </Suspense>
    </Canvas>
  );
};
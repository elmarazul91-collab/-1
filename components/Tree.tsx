import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { InstancedMesh, Object3D, Vector3, Quaternion, MathUtils } from 'three';
import { emeraldMaterial } from './TreeMaterials';
import { TreeMode } from '../types';

interface TreeProps {
  treeMode: TreeMode;
}

export const Tree: React.FC<TreeProps> = ({ treeMode }) => {
  const meshRef = useRef<InstancedMesh>(null);
  const count = 1500; // Number of needles/particles
  
  // Reuse Three.js objects to avoid GC
  const dummy = useMemo(() => new Object3D(), []);
  const targetPos = useMemo(() => new Vector3(), []);
  const currentPos = useMemo(() => new Vector3(), []);
  
  // Generate Dual Positions
  const particles = useMemo(() => {
    const data = [];
    const height = 7;
    const baseRadius = 2.8;

    for (let i = 0; i < count; i++) {
      // 1. Calculate Tree Position (Cone Spiral)
      // Normalized height (0 at bottom, 1 at top)
      // Using a power function to put more leaves at the bottom
      const yNorm = Math.pow(Math.random(), 0.8); 
      const y = (1 - yNorm) * height - (height / 2); // Map to -3.5 to 3.5 range
      
      const radiusAtHeight = yNorm * baseRadius; // Cone calculation
      const angle = i * 0.1 + (Math.PI * 2 * y); // Spiral
      
      const tx = Math.cos(angle) * radiusAtHeight;
      const tz = Math.sin(angle) * radiusAtHeight;
      
      // Jitter the tree position slightly for natural look
      const jitter = 0.2;
      const treePos = new Vector3(
        tx + (Math.random() - 0.5) * jitter, 
        y, 
        tz + (Math.random() - 0.5) * jitter
      );

      // 2. Calculate Scattered Position (Random Sphere)
      const scatterRadius = 15;
      const sx = (Math.random() - 0.5) * scatterRadius;
      const sy = (Math.random() - 0.5) * scatterRadius;
      const sz = (Math.random() - 0.5) * scatterRadius;
      const scatterPos = new Vector3(sx, sy, sz);

      // Random rotation for scatter, Oriented rotation for tree
      // For tree, point outwards from center
      const treeRot = new Quaternion();
      const lookAtPos = new Vector3(tx * 2, y, tz * 2); // Look outward
      dummy.position.copy(treePos);
      dummy.lookAt(lookAtPos);
      treeRot.copy(dummy.quaternion);

      const scatterRot = new Quaternion();
      scatterRot.setFromEuler(
        new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI)
      );

      data.push({
        treePos,
        scatterPos,
        treeRot,
        scatterRot,
        currentPos: scatterPos.clone(), // Start scattered or assembled? Let's init based on prop but usually start pos
        scale: Math.random() * 0.5 + 0.5,
        speed: Math.random() * 0.02 + 0.02 // Individual move speed
      });
    }
    return data;
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;

    const time = state.clock.getElapsedTime();
    const isAssembled = treeMode === TreeMode.ASSEMBLED;
    
    particles.forEach((p, i) => {
      // Determine target for this frame
      const target = isAssembled ? p.treePos : p.scatterPos;
      const targetRot = isAssembled ? p.treeRot : p.scatterRot;

      // Lerp Position
      // Using a dampening function for smooth "magnetic" arrival
      // When assembled, add a tiny gentle wave motion
      const wave = isAssembled ? Math.sin(time * 2 + p.treePos.y) * 0.02 : Math.sin(time + i) * 0.05;
      
      p.currentPos.lerp(target, 0.05); // Smooth transition factor
      
      dummy.position.copy(p.currentPos);
      if (isAssembled) dummy.position.y += wave; // Add breathing effect to tree
      
      // Slerp Rotation
      dummy.quaternion.slerp(targetRot, 0.05);
      
      // Scale
      dummy.scale.setScalar(p.scale);
      
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    
    meshRef.current.instanceMatrix.needsUpdate = true;
    
    // Slow rotation of the whole tree when assembled
    if (isAssembled) {
      meshRef.current.rotation.y += 0.001;
    } else {
      // Gentle drift rotation when scattered
      meshRef.current.rotation.y += 0.0002;
    }
  });

  return (
    <group>
      {/* The Particle Needles */}
      <instancedMesh ref={meshRef} args={[undefined, undefined, count]} castShadow receiveShadow>
        {/* Using a Tetrahedron or thin Box for "Shards" of expensive crystal/metal */}
        <tetrahedronGeometry args={[0.2, 0]} />
        <primitive object={emeraldMaterial} />
      </instancedMesh>

      {/* Base remains static or fades out? Let's keep it simple for now, static base looks odd if tree explodes. 
          Let's hide base in scatter mode via scale or opacity, or make it part of particles. 
          For luxury feel, let's keep the gold ring but scale it to 0 when scattered. 
      */}
      <Base treeMode={treeMode} />
    </group>
  );
};

// Sub-component for the Pot/Base to handle its own animation
const Base: React.FC<{treeMode: TreeMode}> = ({ treeMode }) => {
  const groupRef = useRef<Object3D>(null);
  
  useFrame(() => {
    if(!groupRef.current) return;
    const targetScale = treeMode === TreeMode.ASSEMBLED ? 1 : 0;
    // Smooth scale transition
    groupRef.current.scale.lerp(new Vector3(targetScale, targetScale, targetScale), 0.05);
  });

  return (
    <group ref={groupRef}>
      <mesh position={[0, -3.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.8, 1, 1.5, 32]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, -2.8, 0]}>
         <torusGeometry args={[0.82, 0.05, 16, 64]} />
         <meshStandardMaterial color="#FFD700" metalness={1} roughness={0.1} />
      </mesh>
    </group>
  )
}

import * as THREE from 'three';
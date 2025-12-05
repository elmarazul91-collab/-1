import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { InstancedMesh, Object3D, Vector3, Color, MathUtils } from 'three';
import { goldMaterial, lightMaterial } from './TreeMaterials';
import { TreeMode } from '../types';

interface DecorationProps {
  treeMode: TreeMode;
}

// --- Sound Utilities (Singleton to prevent limit errors) ---
let audioCtx: AudioContext | null = null;

const getAudioContext = () => {
  if (!audioCtx && typeof window !== 'undefined') {
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    if (Ctx) audioCtx = new Ctx();
  }
  return audioCtx;
};

const playHoverSound = () => {
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === 'suspended') ctx.resume();

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  osc.type = 'sine';
  // Random high pitch chime
  const freq = 1500 + Math.random() * 500;
  osc.frequency.setValueAtTime(freq, ctx.currentTime);
  
  gain.gain.setValueAtTime(0.01, ctx.currentTime); // Very soft
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5);
  
  osc.start();
  osc.stop(ctx.currentTime + 0.5);
};

const playClickSound = () => {
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === 'suspended') ctx.resume();
  
  const now = ctx.currentTime;
  // Magical glitter sound (arpeggio)
  const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98]; 
  
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now + i * 0.05);
    
    gain.gain.setValueAtTime(0, now + i * 0.05);
    gain.gain.linearRampToValueAtTime(0.03, now + i * 0.05 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.4);
    
    osc.start(now + i * 0.05);
    osc.stop(now + i * 0.05 + 0.4);
  });
};

export const Star: React.FC<DecorationProps> = ({ treeMode }) => {
  const meshRef = useRef<any>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();
    const isAssembled = treeMode === TreeMode.ASSEMBLED;

    // Position: Top of tree (approx y=3.8) vs High up scattered
    const targetY = isAssembled ? 3.6 : 8;
    const targetScale = isAssembled ? (hovered ? 1.5 : 1.2) : 0; // Hide when scattered

    meshRef.current.position.y = MathUtils.lerp(meshRef.current.position.y, targetY, 0.05);
    meshRef.current.scale.lerp(new Vector3(targetScale, targetScale, targetScale), 0.1);

    // Spin
    meshRef.current.rotation.y += 0.01;
    meshRef.current.rotation.z = Math.sin(time) * 0.1;
  });

  return (
    <mesh
      ref={meshRef}
      position={[0, 10, 0]}
      onPointerOver={() => { setHovered(true); playHoverSound(); }}
      onPointerOut={() => setHovered(false)}
      onClick={(e) => { e.stopPropagation(); playClickSound(); }}
    >
      <octahedronGeometry args={[0.35, 0]} />
      <meshStandardMaterial 
        color="#F9E076" 
        emissive="#FFD700" 
        emissiveIntensity={3} 
        toneMapped={false} 
      />
    </mesh>
  );
};

export const Ornaments: React.FC<DecorationProps> = ({ treeMode }) => {
  const meshRef = useRef<InstancedMesh>(null);
  const count = 90; // Increased slightly for better density
  
  // Interaction State
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const clickedAnimations = useRef<Map<number, number>>(new Map());

  const dummy = useMemo(() => new Object3D(), []);
  const colorHelper = useMemo(() => new Color(), []);
  
  // Base Colors: Mix of Gold and Red
  const baseColors = useMemo(() => {
    const colors = [];
    for(let i=0; i<count; i++) {
        // 35% Chance of Red, rest Gold
        const isRed = Math.random() < 0.35;
        colors.push(isRed ? '#C41E3A' : '#FFD700'); // Cardinal Red or Gold
    }
    return colors;
  }, [count]);

  // Material setup
  const material = useMemo(() => {
    const m = goldMaterial.clone();
    m.color.setHex(0xffffff); 
    return m;
  }, []);

  const items = useMemo(() => {
    const data = [];
    for (let i = 0; i < count; i++) {
      const t = i / count;
      const angle = t * Math.PI * 18; // More spirals
      const y = (t * 6) - 3; 
      const radius = (1 - t) * 2.5 + 0.3;
      
      const treePos = new Vector3(
        Math.cos(angle) * radius,
        y,
        Math.sin(angle) * radius
      );

      const scatterRadius = 12;
      const scatterPos = new Vector3(
        (Math.random() - 0.5) * scatterRadius,
        (Math.random() - 0.5) * scatterRadius,
        (Math.random() - 0.5) * scatterRadius
      );

      data.push({
        treePos,
        scatterPos,
        currentPos: scatterPos.clone(),
        scale: Math.random() * 0.12 + 0.12,
        phase: Math.random() * Math.PI
      });
    }
    return data;
  }, []);

  // Initialize colors
  useEffect(() => {
    if (meshRef.current) {
      baseColors.forEach((col, i) => {
        meshRef.current!.setColorAt(i, colorHelper.set(col));
      });
      meshRef.current.instanceColor!.needsUpdate = true;
    }
  }, [count, colorHelper, baseColors]);

  const currentTimeRef = useRef(0);

  useFrame((state) => {
    if (!meshRef.current) return;
    
    const time = state.clock.getElapsedTime();
    currentTimeRef.current = time;
    const isAssembled = treeMode === TreeMode.ASSEMBLED;
    
    items.forEach((item, i) => {
      const target = isAssembled ? item.treePos : item.scatterPos;
      
      item.currentPos.lerp(target, 0.04);
      dummy.position.copy(item.currentPos);
      dummy.position.y += Math.sin(time + item.phase) * 0.02;
      
      let rotationX = time * 0.5 + item.phase;
      let rotationY = time * 0.3 + item.phase;
      let scale = item.scale;

      // --- Interaction Logic ---
      const isHovered = i === hoveredId;

      if (isHovered) {
        scale *= 1.4;
        // Glow effect: Brighter version of base color
        const base = baseColors[i];
        colorHelper.set(base);
        colorHelper.offsetHSL(0, 0, 0.2); // Make it lighter
        colorHelper.multiplyScalar(2.0); // Emission boost
        meshRef.current!.setColorAt(i, colorHelper);
      } else {
        // Restore base color if not interacting
        // Optimization: only update if it was previously hovered or first frame? 
        // For simplicity in this loop, we just reset it. 
        // In a heavier app, we'd track dirty states.
        meshRef.current!.setColorAt(i, colorHelper.set(baseColors[i]));
      }
      
      // Click Animation (Pop)
      if (clickedAnimations.current.has(i)) {
        const startTime = clickedAnimations.current.get(i)!;
        const elapsed = time - startTime;
        const duration = 0.8;

        if (elapsed < duration) {
           const progress = elapsed / duration;
           const animScale = Math.sin(progress * Math.PI) * 0.6; 
           scale += animScale * item.scale;
           rotationY += elapsed * 20; // Spin fast
        } else {
           clickedAnimations.current.delete(i);
        }
      }

      dummy.rotation.x = rotationX;
      dummy.rotation.y = rotationY;
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
    
    if(isAssembled) {
       meshRef.current.rotation.y += 0.001;
    } else {
       meshRef.current.rotation.y += 0.0005;
    }
  });

  const onPointerOver = (e: any) => {
    e.stopPropagation();
    if (e.instanceId !== hoveredId) {
      setHoveredId(e.instanceId);
      document.body.style.cursor = 'pointer';
      playHoverSound();
    }
  };

  const onPointerOut = (e: any) => {
    setHoveredId(null);
    document.body.style.cursor = 'auto';
  };

  const handleOrnamentClick = (e: any) => {
    e.stopPropagation();
    if (treeMode === TreeMode.ASSEMBLED) {
       clickedAnimations.current.set(e.instanceId, currentTimeRef.current);
       playClickSound();
    }
  }

  return (
    <instancedMesh 
      ref={meshRef} 
      args={[undefined, undefined, count]} 
      castShadow 
      receiveShadow
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
      onClick={handleOrnamentClick}
    >
      <sphereGeometry args={[1, 32, 32]} />
      <primitive object={material} />
    </instancedMesh>
  );
};

export const FairyLights: React.FC<DecorationProps> = ({ treeMode }) => {
  const meshRef = useRef<InstancedMesh>(null);
  const count = 200;
  const dummy = useMemo(() => new Object3D(), []);

  const items = useMemo(() => {
    const data = [];
    for (let i = 0; i < count; i++) {
       const h = Math.random() * 6 - 3;
       const r = (1 - (h + 3) / 6) * 2.7;
       const angle = Math.random() * Math.PI * 2;
       
       const treePos = new Vector3(
         Math.cos(angle) * r,
         h,
         Math.sin(angle) * r
       );

       const scatterRadius = 14;
       const scatterPos = new Vector3(
        (Math.random() - 0.5) * scatterRadius,
        (Math.random() - 0.5) * scatterRadius,
        (Math.random() - 0.5) * scatterRadius
       );

       data.push({
         treePos,
         scatterPos,
         currentPos: scatterPos.clone(),
         speed: Math.random() * 0.5 + 0.5,
         phase: Math.random() * Math.PI
       });
    }
    return data;
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();
    const isAssembled = treeMode === TreeMode.ASSEMBLED;
    
    items.forEach((item, i) => {
      const target = isAssembled ? item.treePos : item.scatterPos;
      item.currentPos.lerp(target, 0.03);
      
      dummy.position.copy(item.currentPos);
      
      const scaleBase = 0.04;
      const twinkle = Math.sin(time * item.speed + item.phase) * 0.02;
      dummy.scale.setScalar(Math.max(0, scaleBase + twinkle));
      
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
    
    if(isAssembled) {
       meshRef.current.rotation.y += 0.001;
    }
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 8, 8]} />
      <primitive object={lightMaterial} />
    </instancedMesh>
  );
};
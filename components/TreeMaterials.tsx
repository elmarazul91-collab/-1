import React from 'react';
import { MeshStandardMaterial, Color } from 'three';

// Highly reflective gold
export const goldMaterial = new MeshStandardMaterial({
  color: new Color('#FFD700'),
  metalness: 1,
  roughness: 0.15,
  emissive: new Color('#553300'),
  emissiveIntensity: 0.2,
});

// Deep luxury velvet emerald
export const emeraldMaterial = new MeshStandardMaterial({
  color: new Color('#022D19'),
  roughness: 0.8,
  metalness: 0.1,
});

// Glowing light material
export const lightMaterial = new MeshStandardMaterial({
  color: new Color('#FFF0CA'),
  emissive: new Color('#FFD700'),
  emissiveIntensity: 5,
  toneMapped: false,
});
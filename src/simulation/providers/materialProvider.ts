import * as THREE from 'three';
import type { MaterialPalette } from '../types/city';

export function createMaterialPalette(): MaterialPalette {
    return {
        grass: new THREE.MeshStandardMaterial({ color: 0x6ccf59, roughness: 0.8 }),
        water: new THREE.MeshStandardMaterial({ color: 0x2faaf0, roughness: 0.2, metalness: 0.1 }),
        kaojaiBody: new THREE.MeshStandardMaterial({ color: 0x4db8aa, roughness: 0.3 }),
        kaojaiFace: new THREE.MeshStandardMaterial({ color: 0x223355, roughness: 0.2 }),
        kaojaiEars: new THREE.MeshStandardMaterial({ color: 0xe05e5e }),
        dbTank: new THREE.MeshStandardMaterial({ color: 0x76d672, roughness: 0.4 }),
        dbMetal: new THREE.MeshStandardMaterial({ color: 0xaaccdd, metalness: 0.7, roughness: 0.2 }),
        glass: new THREE.MeshPhysicalMaterial({
            color: 0xaaddff,
            metalness: 0.1,
            roughness: 0.05,
            transmission: 0.9,
            thickness: 1.0,
            transparent: true,
        }),
        concrete: new THREE.MeshStandardMaterial({ color: 0xeeeeee }),
        shopRoof1: new THREE.MeshStandardMaterial({ color: 0xff9933 }),
        shopRoof2: new THREE.MeshStandardMaterial({ color: 0x3399ff }),
        shopBody: new THREE.MeshStandardMaterial({ color: 0xfff5e0 }),
        pipeYellow: new THREE.MeshStandardMaterial({ color: 0xffcc00, emissive: 0xffaa00, emissiveIntensity: 0.4 }),
        pipeBlue: new THREE.MeshStandardMaterial({ color: 0x3388ff, emissive: 0x2266cc, emissiveIntensity: 0.4 }),
        pipeRed: new THREE.MeshStandardMaterial({ color: 0xff3333, emissive: 0xcc2222, emissiveIntensity: 0.4 }),
        lineGreen: new THREE.MeshStandardMaterial({ color: 0x06c755 }),
        fbBlue: new THREE.MeshStandardMaterial({ color: 0x1877f2 }),
        instaPink: new THREE.MeshStandardMaterial({ color: 0xe1306c }),
        path: new THREE.MeshStandardMaterial({ color: 0xf2d2a9, roughness: 1.0 }),
    };
}

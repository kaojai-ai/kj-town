import * as THREE from 'three';
import type { MaterialPalette } from '../../types/city';

export function createGround(scene: THREE.Scene, materials: MaterialPalette): void {
    const geometry = new THREE.CylinderGeometry(600, 600, 40, 64);
    const ground = new THREE.Mesh(geometry, materials.grass);
    ground.position.y = -20;
    ground.receiveShadow = true;
    scene.add(ground);

    const waterGeo = new THREE.CylinderGeometry(1500, 1500, 20, 64);
    const water = new THREE.Mesh(waterGeo, materials.water);
    water.position.y = -50;
    scene.add(water);
}

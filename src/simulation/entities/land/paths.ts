import * as THREE from 'three';
import type { MaterialPalette } from '../../types/city';

export function createPaths(scene: THREE.Scene, materials: MaterialPalette): void {
    const yPos = -18;
    const pathConfig = [
        { w: 400, h: 60, x: -150, z: 0 },
        { w: 60, h: 300, x: 0, z: 120 },
        { w: 300, h: 50, x: 150, z: -50 },
        { w: 50, h: 200, x: -300, z: -100 },
    ];

    pathConfig.forEach((path) => {
        const mesh = new THREE.Mesh(new THREE.PlaneGeometry(path.w, path.h), materials.path);
        mesh.rotation.x = -Math.PI / 2;
        mesh.position.set(path.x, yPos, path.z);
        mesh.receiveShadow = true;
        scene.add(mesh);
    });
}

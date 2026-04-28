import * as THREE from 'three';
import type { MaterialPalette } from '../../types/city';

export function createPaths(scene: THREE.Scene, materials: MaterialPalette): void {
    const yPos = -18;
    const pathConfig = [
        { w: 400, h: 60, x: -150, z: 0 },
        { w: 60, h: 300, x: 0, z: 120 },
        { w: 300, h: 50, x: 150, z: -50 },
        { w: 50, h: 200, x: -300, z: -100 },
        { w: 220, h: 50, x: 170, z: 250 },
        { w: 120, h: 40, x: -200, z: 120 },
        { w: 140, h: 50, x: 120, z: 140 },
        { w: 120, h: 34, x: -300, z: 256 },
        { w: 110, h: 34, x: 300, z: -40 },
        { w: 170, h: 30, x: 54, z: 250 },
        { w: 130, h: 30, x: 256, z: 258 },
        { w: 120, h: 26, x: 182, z: 142 },
        { w: 130, h: 26, x: 90, z: 140 },
        { w: 200, h: 24, x: 210, z: 10 },
        { w: 150, h: 22, x: 190, z: 90 },
        { w: 120, h: 22, x: 250, z: 180 },
        { w: 110, h: 20, x: 96, z: 196 },
        { w: 90, h: 18, x: 260, z: 222 },
        { w: 80, h: 18, x: -348, z: 198 },
        { w: 92, h: 16, x: -8, z: 84 },
        { w: 210, h: 34, x: -66, z: 350 },
        { w: 34, h: 132, x: -80, z: 292 },
        { w: 150, h: 22, x: 16, z: 306 },
        { w: 124, h: 20, x: -198, z: 290 },
    ];

    pathConfig.forEach((path) => {
        const mesh = new THREE.Mesh(new THREE.PlaneGeometry(path.w, path.h), materials.path);
        mesh.rotation.x = -Math.PI / 2;
        mesh.position.set(path.x, yPos, path.z);
        mesh.receiveShadow = true;
        scene.add(mesh);
    });
}

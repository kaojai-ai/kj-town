import * as THREE from 'three';
import type { MaterialPalette, CityServices } from '../../types/city';

export function createAILab(
    scene: THREE.Scene,
    materials: MaterialPalette,
    services: CityServices,
    x: number,
    y: number,
    z: number
): void {
    const group = new THREE.Group();

    const width = 100;
    const height = 140;
    const depth = 100;

    const glassBox = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), materials.glass);
    glassBox.position.y = height / 2 + 10;
    glassBox.castShadow = true;

    const innerGeo = new THREE.BoxGeometry(60, 10, 60);
    for (let i = 0; i < 5; i++) {
        const inner = new THREE.Mesh(innerGeo, materials.dbMetal);
        inner.position.y = 30 + i * 25;
        group.add(inner);
    }

    const frameGeo = new THREE.BoxGeometry(width + 4, 10, depth + 4);
    const base = new THREE.Mesh(frameGeo, materials.concrete);
    base.position.y = 5;
    const top = new THREE.Mesh(frameGeo, materials.concrete);
    top.position.y = height + 15;

    group.add(glassBox, base, top);
    group.position.set(x, y, z);
    group.userData = { isBuilding: true, name: 'AI Laboratory' };

    services.addLabel(group, 'AI LAB', 170);
    scene.add(group);
}

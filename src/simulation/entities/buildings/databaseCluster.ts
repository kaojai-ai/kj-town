import * as THREE from 'three';
import type { MaterialPalette, CityServices } from '../../types/city';

export function createDatabaseCluster(
    scene: THREE.Scene,
    materials: MaterialPalette,
    services: CityServices,
    x: number,
    y: number,
    z: number
): void {
    const group = new THREE.Group();

    const disks = 5;
    const radius = 50;
    const height = 20;
    const gap = 2;

    for (let i = 0; i < disks; i++) {
        const diskGeo = new THREE.CylinderGeometry(radius, radius, height, 32);
        const disk = new THREE.Mesh(diskGeo, materials.dbTank);
        const yPos = 10 + i * (height + gap) + height / 2;
        disk.position.y = yPos;
        disk.castShadow = true;

        const ringGeo = new THREE.TorusGeometry(radius + 2, 2, 8, 32);
        const ring = new THREE.Mesh(ringGeo, materials.dbMetal);
        ring.rotateX(Math.PI / 2);
        ring.position.y = yPos;

        group.add(disk, ring);
    }

    const base = new THREE.Mesh(new THREE.CylinderGeometry(60, 60, 10, 32), materials.concrete);
    base.position.y = 5;
    group.add(base);

    group.position.set(x, y, z);
    group.userData = { isBuilding: true, name: 'Database Cluster' };

    services.addLabel(group, 'DATABASE', 150);
    scene.add(group);
}

import * as THREE from 'three';
import type { MaterialPalette, CityServices } from '../../types/city';

export function createNotificationHub(
    scene: THREE.Scene,
    materials: MaterialPalette,
    services: CityServices,
    x: number,
    y: number,
    z: number
): void {
    const group = new THREE.Group();

    const base = new THREE.Mesh(new THREE.CylinderGeometry(55, 65, 16, 32), materials.concrete);
    base.position.y = 8;

    const tower = new THREE.Mesh(new THREE.CylinderGeometry(18, 26, 70, 24), materials.partnerMetal);
    tower.position.y = 51;

    const crown = new THREE.Mesh(new THREE.TorusGeometry(26, 3, 12, 48), materials.screenAmber);
    crown.rotation.x = Math.PI / 2;
    crown.position.y = 78;

    const toggleGeo = new THREE.CylinderGeometry(3, 3, 20, 12);
    const togglePositions = [
        new THREE.Vector3(-25, 18, -20),
        new THREE.Vector3(-5, 18, -20),
        new THREE.Vector3(15, 18, -20),
        new THREE.Vector3(-15, 18, 0),
        new THREE.Vector3(5, 18, 0),
        new THREE.Vector3(25, 18, 0),
        new THREE.Vector3(-20, 18, 20),
        new THREE.Vector3(0, 18, 20),
        new THREE.Vector3(20, 18, 20),
    ];

    togglePositions.forEach((pos) => {
        const stem = new THREE.Mesh(toggleGeo, materials.partnerMetal);
        stem.position.copy(pos);
        const light = new THREE.Mesh(new THREE.SphereGeometry(4, 12, 12), materials.screenAmber);
        light.position.set(pos.x, pos.y + 12, pos.z);
        group.add(stem, light);
    });

    group.add(base, tower, crown);
    group.position.set(x, y, z);
    group.userData = { isBuilding: true, name: 'Notification Control Hub' };

    services.addLabel(group, 'Notification Control', 120);
    scene.add(group);
}

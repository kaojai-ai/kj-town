import * as THREE from 'three';
import type { MaterialPalette, CityServices } from '../../types/city';

export function createPartnerExchange(
    scene: THREE.Scene,
    materials: MaterialPalette,
    services: CityServices,
    x: number,
    y: number,
    z: number
): void {
    const group = new THREE.Group();

    const base = new THREE.Mesh(new THREE.BoxGeometry(140, 16, 90), materials.concrete);
    base.position.y = 8;
    base.receiveShadow = true;

    const hub = new THREE.Mesh(new THREE.CylinderGeometry(24, 24, 46, 24), materials.partnerMetal);
    hub.position.y = 39;
    hub.castShadow = true;

    const hubCap = new THREE.Mesh(new THREE.CylinderGeometry(18, 18, 10, 24), materials.screenBlue);
    hubCap.position.y = 62;

    const gatewayPositions = [
        new THREE.Vector3(-45, 20, -25),
        new THREE.Vector3(45, 20, -25),
        new THREE.Vector3(0, 20, 30),
    ];
    const gatewayColors = [materials.pipeYellow, materials.pipeBlue, materials.pipeRed];

    gatewayPositions.forEach((pos, index) => {
        const tower = new THREE.Mesh(new THREE.CylinderGeometry(10, 12, 40, 18), materials.partnerMetal);
        tower.position.copy(pos);
        tower.castShadow = true;
        const beacon = new THREE.Mesh(new THREE.SphereGeometry(8, 16, 16), gatewayColors[index]);
        beacon.position.set(pos.x, pos.y + 26, pos.z);
        group.add(tower, beacon);
    });

    const rail = new THREE.Mesh(new THREE.BoxGeometry(160, 6, 12), materials.pipeBlue);
    rail.position.set(-80, 14, 40);

    group.add(base, hub, hubCap, rail);
    group.position.set(x, y, z);
    group.userData = { isBuilding: true, name: 'Partner Sync Exchange' };

    services.addLabel(group, 'Partner Sync', 120);
    scene.add(group);
}

import * as THREE from 'three';
import type { MaterialPalette, CityServices } from '../../types/city';

export function createSocialChannels(
    scene: THREE.Scene,
    materials: MaterialPalette,
    services: CityServices,
    x: number,
    y: number,
    z: number
): void {
    const group = new THREE.Group();
    const size = 50;
    const gap = 60;

    const line = new THREE.Mesh(new THREE.BoxGeometry(size, size, size), materials.lineGreen);
    line.position.set(-gap, size / 2, 0);
    line.castShadow = true;

    const facebook = new THREE.Mesh(new THREE.BoxGeometry(size, size, size), materials.fbBlue);
    facebook.position.set(0, size / 2, gap / 2);
    facebook.castShadow = true;

    const instagram = new THREE.Mesh(new THREE.BoxGeometry(size, size, size), materials.instaPink);
    instagram.position.set(gap, size / 2, 0);
    instagram.castShadow = true;

    group.add(line, facebook, instagram);
    group.position.set(x, y, z);
    group.userData = { isBuilding: true, name: 'Social Channels' };

    services.addLabel(group, 'Social Channels', 100);
    scene.add(group);
}

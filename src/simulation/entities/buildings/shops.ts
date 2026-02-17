import * as THREE from 'three';
import type { MaterialPalette, CityServices } from '../../types/city';

export function createShops(
    scene: THREE.Scene,
    materials: MaterialPalette,
    services: CityServices,
    x: number,
    y: number,
    z: number
): void {
    const group = new THREE.Group();

    const width = 60;
    const height = 40;
    const depth = 60;
    const spacing = 70;
    const titles = ['Booking', 'Issues', 'FAQ', 'Fun'];

    for (let i = 0; i < 4; i++) {
        const shopGroup = new THREE.Group();

        const body = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), materials.shopBody);
        body.position.y = height / 2;
        body.castShadow = true;

        const roofGeo = new THREE.ConeGeometry(width * 0.8, 30, 4);
        roofGeo.rotateY(Math.PI / 4);
        const roofMaterial = i % 2 === 0 ? materials.shopRoof1 : materials.shopRoof2;
        const roof = new THREE.Mesh(roofGeo, roofMaterial);
        roof.position.y = height + 15;

        shopGroup.add(body, roof);
        shopGroup.position.set((i - 1.5) * spacing, 0, 0);
        shopGroup.userData = { isBuilding: true, name: titles[i] };

        services.addLabel(shopGroup, titles[i], 80);
        group.add(shopGroup);
    }

    group.position.set(x, y, z);
    scene.add(group);
}

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

        if (i === 0) {
            const canopy = new THREE.Mesh(new THREE.BoxGeometry(width * 1.3, 6, depth * 0.6), materials.shopRoof2);
            canopy.position.set(0, height + 8, depth * 0.2);
            const dayViewPanel = new THREE.Mesh(new THREE.BoxGeometry(width * 1.1, 26, 4), materials.screenBlue);
            dayViewPanel.position.set(0, height + 28, depth * 0.35);
            const searchKiosk = new THREE.Mesh(new THREE.CylinderGeometry(6, 6, 18, 16), materials.partnerMetal);
            searchKiosk.position.set(-width * 0.35, 9, depth * 0.4);
            const lens = new THREE.Mesh(new THREE.TorusGeometry(7, 1.5, 8, 24), materials.screenBlue);
            lens.rotation.x = Math.PI / 2;
            lens.position.set(-width * 0.35, 20, depth * 0.4);
            shopGroup.add(canopy, dayViewPanel, searchKiosk, lens);
        }

        if (i === 1) {
            const galleryFrame = new THREE.Mesh(new THREE.BoxGeometry(width * 0.9, 22, 4), materials.screenAmber);
            galleryFrame.position.set(0, height * 0.65, depth * 0.4);
            const galleryBase = new THREE.Mesh(new THREE.BoxGeometry(width * 0.95, 4, 6), materials.partnerMetal);
            galleryBase.position.set(0, height * 0.55, depth * 0.4);
            shopGroup.add(galleryFrame, galleryBase);
        }

        shopGroup.position.set((i - 1.5) * spacing, 0, 0);
        shopGroup.userData = { isBuilding: true, name: titles[i] };

        services.addLabel(shopGroup, titles[i], 80);
        group.add(shopGroup);
    }

    group.position.set(x, y, z);
    scene.add(group);
}

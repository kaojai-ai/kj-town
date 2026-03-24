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

    const webWidgetHub = new THREE.Mesh(new THREE.BoxGeometry(size, size, size), materials.screenBlue);
    webWidgetHub.position.set(0, size / 2, -gap);
    webWidgetHub.castShadow = true;

    const accountStackGeo = new THREE.BoxGeometry(size * 0.55, size * 0.55, size * 0.55);
    const accountOffsets = [
        new THREE.Vector3(-gap, size + 10, -15),
        new THREE.Vector3(-gap + 15, size + 35, 10),
        new THREE.Vector3(0, size + 10, gap / 2 - 15),
        new THREE.Vector3(15, size + 35, gap / 2 + 10),
        new THREE.Vector3(gap, size + 10, -15),
        new THREE.Vector3(gap - 15, size + 35, 10),
        new THREE.Vector3(0, size + 10, -gap - 15),
        new THREE.Vector3(12, size + 35, -gap + 6),
    ];
    const accountMats = [
        materials.lineGreen,
        materials.lineGreen,
        materials.fbBlue,
        materials.fbBlue,
        materials.instaPink,
        materials.instaPink,
        materials.screenBlue,
        materials.screenBlue,
    ];
    accountOffsets.forEach((offset, index) => {
        const node = new THREE.Mesh(accountStackGeo, accountMats[index]);
        node.position.copy(offset);
        node.castShadow = true;
        group.add(node);
    });

    const widgetPortal = new THREE.Mesh(new THREE.TorusGeometry(14, 2, 10, 32), materials.pipeBlue);
    widgetPortal.rotation.x = Math.PI / 2;
    widgetPortal.position.set(0, size + 24, -gap);

    const widgetSupport = new THREE.Mesh(new THREE.BoxGeometry(8, 26, 8), materials.partnerMetal);
    widgetSupport.position.set(0, size + 3, -gap);

    group.add(line, facebook, instagram, webWidgetHub, widgetPortal, widgetSupport);
    group.position.set(x, y, z);
    group.userData = { isBuilding: true, name: 'Social Channels' };

    services.addLabel(group, 'Social Channels', 100);
    services.addLabel(webWidgetHub, 'Website Widget', 42);
    scene.add(group);
}

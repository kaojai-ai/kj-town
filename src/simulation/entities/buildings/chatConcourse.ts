import * as THREE from 'three';
import type { MaterialPalette, CityServices } from '../../types/city';

export function createChatConcourse(
    scene: THREE.Scene,
    materials: MaterialPalette,
    services: CityServices,
    x: number,
    y: number,
    z: number
): void {
    const group = new THREE.Group();

    const base = new THREE.Mesh(new THREE.BoxGeometry(150, 12, 110), materials.concrete);
    base.position.y = 6;
    base.receiveShadow = true;

    const hall = new THREE.Mesh(new THREE.BoxGeometry(90, 45, 70), materials.glass);
    hall.position.y = 30;
    hall.castShadow = true;

    const crown = new THREE.Mesh(new THREE.BoxGeometry(100, 6, 80), materials.partnerMetal);
    crown.position.y = 55;

    const disclosureTower = new THREE.Mesh(new THREE.CylinderGeometry(6, 8, 38, 16), materials.partnerMetal);
    disclosureTower.position.set(-55, 25, 20);
    disclosureTower.castShadow = true;

    const disclosureRing = new THREE.Mesh(new THREE.TorusGeometry(12, 2, 10, 36), materials.screenAmber);
    disclosureRing.rotation.x = Math.PI / 2;
    disclosureRing.position.set(-55, 43, 20);

    const disclosurePanel = new THREE.Mesh(new THREE.BoxGeometry(30, 16, 3), materials.screenAmber);
    disclosurePanel.position.set(-55, 18, 48);

    const messageDeck = new THREE.Mesh(new THREE.BoxGeometry(80, 6, 50), materials.partnerMetal);
    messageDeck.position.set(35, 8, 5);

    const railLeft = new THREE.Mesh(new THREE.TorusGeometry(32, 2, 10, 48, Math.PI), materials.pipeBlue);
    railLeft.rotation.set(Math.PI / 2, 0, Math.PI / 2);
    railLeft.position.set(35, 22, -18);

    const railRight = new THREE.Mesh(new THREE.TorusGeometry(32, 2, 10, 48, Math.PI), materials.pipeYellow);
    railRight.rotation.set(Math.PI / 2, 0, -Math.PI / 2);
    railRight.position.set(35, 22, 28);

    const podGeo = new THREE.SphereGeometry(4, 12, 12);
    const podPositions = [
        new THREE.Vector3(10, 22, -18),
        new THREE.Vector3(30, 28, -18),
        new THREE.Vector3(50, 22, -18),
        new THREE.Vector3(10, 22, 28),
        new THREE.Vector3(30, 28, 28),
        new THREE.Vector3(50, 22, 28),
    ];

    podPositions.forEach((pos) => {
        const pod = new THREE.Mesh(podGeo, materials.screenBlue);
        pod.position.copy(pos);
        pod.castShadow = true;
        group.add(pod);
    });

    group.add(
        base,
        hall,
        crown,
        disclosureTower,
        disclosureRing,
        disclosurePanel,
        messageDeck,
        railLeft,
        railRight
    );

    group.position.set(x, y, z);
    group.userData = { isBuilding: true, name: 'Chat Concourse' };

    services.addLabel(group, 'Chat Module', 110);
    services.addLabel(disclosureTower, 'AI Disclosure', 60);
    scene.add(group);
}

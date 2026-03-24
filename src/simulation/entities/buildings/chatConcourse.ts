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

    const cancellationAnnex = new THREE.Mesh(new THREE.BoxGeometry(44, 16, 32), materials.glass);
    cancellationAnnex.position.set(-6, 14, 42);
    cancellationAnnex.castShadow = true;

    const cancellationGate = new THREE.Mesh(new THREE.TorusGeometry(12, 2, 10, 36), materials.screenAmber);
    cancellationGate.rotation.x = Math.PI / 2;
    cancellationGate.position.set(20, 24, 43);

    const cancellationChannel = new THREE.Mesh(new THREE.BoxGeometry(56, 2.6, 8), materials.pipeYellow);
    cancellationChannel.position.set(26, 10, 42);

    const cancellationReturnLane = new THREE.Mesh(new THREE.BoxGeometry(48, 2.3, 6), materials.pipeBlue);
    cancellationReturnLane.position.set(22, 16, 40);

    const humanTakeoverDeck = new THREE.Mesh(new THREE.BoxGeometry(30, 6, 18), materials.concrete);
    humanTakeoverDeck.position.set(-34, 12, -36);
    const humanTakeoverSignal = new THREE.Mesh(new THREE.CylinderGeometry(5, 5, 24, 16), materials.pipeRed);
    humanTakeoverSignal.position.set(-34, 24, -36);

    const railLeft = new THREE.Mesh(new THREE.TorusGeometry(32, 2, 10, 48, Math.PI), materials.pipeBlue);
    railLeft.rotation.set(Math.PI / 2, 0, Math.PI / 2);
    railLeft.position.set(35, 22, -18);

    const railRight = new THREE.Mesh(new THREE.TorusGeometry(32, 2, 10, 48, Math.PI), materials.pipeYellow);
    railRight.rotation.set(Math.PI / 2, 0, -Math.PI / 2);
    railRight.position.set(35, 22, 28);

    const stabilizerHub = new THREE.Mesh(new THREE.CylinderGeometry(7, 9, 24, 18), materials.screenBlue);
    stabilizerHub.position.set(58, 20, 5);
    stabilizerHub.castShadow = true;

    const stabilizerRing = new THREE.Mesh(new THREE.TorusGeometry(13, 1.7, 12, 36), materials.screenBlue);
    stabilizerRing.rotation.x = Math.PI / 2;
    stabilizerRing.position.set(58, 34, 5);

    const stabilizerStrutA = new THREE.Mesh(new THREE.BoxGeometry(3, 16, 3), materials.partnerMetal);
    stabilizerStrutA.position.set(47, 16, -4);
    const stabilizerStrutB = new THREE.Mesh(new THREE.BoxGeometry(3, 16, 3), materials.partnerMetal);
    stabilizerStrutB.position.set(47, 16, 14);
    const stabilizerStrutC = new THREE.Mesh(new THREE.BoxGeometry(3, 16, 3), materials.partnerMetal);
    stabilizerStrutC.position.set(69, 16, -4);
    const stabilizerStrutD = new THREE.Mesh(new THREE.BoxGeometry(3, 16, 3), materials.partnerMetal);
    stabilizerStrutD.position.set(69, 16, 14);

    const originalAppGate = new THREE.Mesh(new THREE.TorusGeometry(10, 1.6, 10, 32), materials.pipeBlue);
    originalAppGate.rotation.x = Math.PI / 2;
    originalAppGate.position.set(64, 18, -30);
    const originalAppRail = new THREE.Mesh(new THREE.BoxGeometry(36, 2.2, 6), materials.pipeBlue);
    originalAppRail.position.set(76, 12, -30);

    const listTurboLane = new THREE.Mesh(new THREE.BoxGeometry(90, 2.2, 7), materials.pipeYellow);
    listTurboLane.position.set(34, 12, -2);
    const listTurboEcho = new THREE.Mesh(new THREE.BoxGeometry(86, 2, 5), materials.pipeBlue);
    listTurboEcho.position.set(35, 15, -2);

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
        cancellationAnnex,
        cancellationGate,
        cancellationChannel,
        cancellationReturnLane,
        humanTakeoverDeck,
        humanTakeoverSignal,
        railLeft,
        railRight,
        stabilizerHub,
        stabilizerRing,
        stabilizerStrutA,
        stabilizerStrutB,
        stabilizerStrutC,
        stabilizerStrutD,
        originalAppGate,
        originalAppRail,
        listTurboLane,
        listTurboEcho
    );

    group.position.set(x, y, z);
    group.userData = { isBuilding: true, name: 'Chat Concourse' };

    services.addLabel(group, 'Chat Module', 110);
    services.addLabel(disclosureTower, 'AI Disclosure', 60);
    services.addLabel(cancellationAnnex, 'Cancel Clarity Annex', 36);
    services.addLabel(stabilizerHub, 'Message Stabilizer', 34);
    services.addLabel(humanTakeoverSignal, 'Human Handoff', 30);
    services.addLabel(originalAppGate, 'Original App Jump', 24);
    scene.add(group);
}

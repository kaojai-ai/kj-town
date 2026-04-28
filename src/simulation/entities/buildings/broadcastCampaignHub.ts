import * as THREE from 'three';
import type { MaterialPalette, CityServices } from '../../types/city';

export function createBroadcastCampaignHub(
    scene: THREE.Scene,
    materials: MaterialPalette,
    services: CityServices,
    x: number,
    y: number,
    z: number
): void {
    const group = new THREE.Group();

    const base = new THREE.Mesh(new THREE.BoxGeometry(170, 14, 118), materials.concrete);
    base.position.y = 7;
    base.receiveShadow = true;

    const campaignHall = new THREE.Mesh(new THREE.BoxGeometry(72, 38, 58), materials.glass);
    campaignHall.position.set(-30, 26, 0);
    campaignHall.castShadow = true;

    const composerScreen = new THREE.Mesh(new THREE.BoxGeometry(42, 20, 4), materials.screenBlue);
    composerScreen.position.set(-30, 32, 31);

    const sendBeacon = new THREE.Mesh(new THREE.CylinderGeometry(7, 9, 44, 18), materials.partnerMetal);
    sendBeacon.position.set(28, 34, 0);
    sendBeacon.castShadow = true;

    const beaconHalo = new THREE.Mesh(new THREE.TorusGeometry(17, 2, 12, 42), materials.screenAmber);
    beaconHalo.rotation.x = Math.PI / 2;
    beaconHalo.position.set(28, 58, 0);

    const audienceDeck = new THREE.Mesh(new THREE.BoxGeometry(118, 7, 34), materials.partnerMetal);
    audienceDeck.position.set(-10, 14, -38);

    const segmentGeo = new THREE.CylinderGeometry(10, 12, 30, 18);
    const segmentPositions = [
        { x: -58, label: 'Booked Recently', material: materials.pipeYellow },
        { x: -16, label: 'Checked-in Last Month', material: materials.pipeBlue },
        { x: 26, label: 'Recent Contacts', material: materials.pipeRed },
    ];

    segmentPositions.forEach((segment) => {
        const silo = new THREE.Mesh(segmentGeo, materials.glass);
        silo.position.set(segment.x, 30, -38);
        silo.castShadow = true;

        const cap = new THREE.Mesh(new THREE.SphereGeometry(7, 14, 14), segment.material);
        cap.position.set(segment.x, 49, -38);
        cap.castShadow = true;

        const selectorRail = new THREE.Mesh(new THREE.BoxGeometry(24, 2.3, 5), segment.material);
        selectorRail.position.set(segment.x, 17, -18);

        group.add(silo, cap, selectorRail);
        services.addLabel(silo, segment.label, 42);
    });

    const filterPrism = new THREE.Mesh(new THREE.CylinderGeometry(18, 18, 22, 3), materials.screenAmber);
    filterPrism.rotation.y = Math.PI / 6;
    filterPrism.position.set(-80, 24, -2);
    filterPrism.castShadow = true;

    const queueBuffer = new THREE.Mesh(new THREE.CylinderGeometry(20, 24, 22, 28), materials.partnerMetal);
    queueBuffer.position.set(70, 22, 0);
    queueBuffer.castShadow = true;

    const bufferRingA = new THREE.Mesh(new THREE.TorusGeometry(25, 1.8, 10, 42), materials.pipeBlue);
    bufferRingA.rotation.x = Math.PI / 2;
    bufferRingA.position.set(70, 34, 0);

    const bufferRingB = new THREE.Mesh(new THREE.TorusGeometry(31, 1.8, 10, 48), materials.pipeYellow);
    bufferRingB.rotation.x = Math.PI / 2;
    bufferRingB.position.set(70, 41, 0);

    const reliabilityDeck = new THREE.Mesh(new THREE.BoxGeometry(66, 8, 46), materials.concrete);
    reliabilityDeck.position.set(46, 11, 39);

    const workerTowerA = new THREE.Mesh(new THREE.CylinderGeometry(6, 7, 28, 16), materials.pipeBlue);
    workerTowerA.position.set(25, 28, 39);
    const workerTowerB = new THREE.Mesh(new THREE.CylinderGeometry(6, 7, 28, 16), materials.pipeYellow);
    workerTowerB.position.set(47, 28, 39);
    const workerTowerC = new THREE.Mesh(new THREE.CylinderGeometry(6, 7, 28, 16), materials.pipeRed);
    workerTowerC.position.set(69, 28, 39);

    const deliveryRailA = new THREE.Mesh(new THREE.BoxGeometry(82, 2.5, 5), materials.pipeBlue);
    deliveryRailA.position.set(46, 20, 27);
    const deliveryRailB = new THREE.Mesh(new THREE.BoxGeometry(82, 2.5, 5), materials.pipeYellow);
    deliveryRailB.position.set(46, 26, 39);
    const deliveryRailC = new THREE.Mesh(new THREE.BoxGeometry(82, 2.5, 5), materials.pipeRed);
    deliveryRailC.position.set(46, 20, 51);

    const smoothingGate = new THREE.Mesh(new THREE.TorusGeometry(14, 1.8, 10, 36), materials.screenBlue);
    smoothingGate.rotation.x = Math.PI / 2;
    smoothingGate.position.set(88, 36, 39);

    const outputFan = new THREE.Mesh(new THREE.CylinderGeometry(9, 14, 30, 5), materials.screenAmber);
    outputFan.rotation.z = Math.PI / 2;
    outputFan.position.set(100, 24, 39);
    outputFan.castShadow = true;

    const crmBridge = new THREE.Mesh(new THREE.BoxGeometry(62, 3, 7), materials.pipeBlue);
    crmBridge.position.set(-72, 18, -24);
    crmBridge.rotation.y = -Math.PI / 7;

    const chatBridge = new THREE.Mesh(new THREE.BoxGeometry(74, 3, 7), materials.pipeYellow);
    chatBridge.position.set(-28, 18, 42);
    chatBridge.rotation.y = Math.PI / 12;

    const reliabilitySpine = new THREE.Mesh(new THREE.BoxGeometry(230, 10, 28), materials.concrete);
    reliabilitySpine.position.set(8, 10, 88);
    reliabilitySpine.receiveShadow = true;

    const throttleCanal = new THREE.Mesh(new THREE.BoxGeometry(210, 4, 9), materials.pipeYellow);
    throttleCanal.position.set(2, 23, 88);

    const meteringTicksGeo = new THREE.BoxGeometry(3, 14, 13);
    for (let i = 0; i < 13; i++) {
        const tick = new THREE.Mesh(meteringTicksGeo, i % 3 === 0 ? materials.pipeRed : materials.partnerMetal);
        tick.position.set(-92 + i * 16, 25, 88);
        tick.castShadow = true;
        group.add(tick);
    }

    const throttleFlywheel = new THREE.Mesh(new THREE.TorusGeometry(21, 2.2, 12, 48), materials.screenAmber);
    throttleFlywheel.rotation.y = Math.PI / 2;
    throttleFlywheel.position.set(-108, 35, 88);
    throttleFlywheel.userData = { spinAxis: 'z', spinSpeed: 1.35 };
    services.registerAnimatedObject(throttleFlywheel);

    const identityLoomDeck = new THREE.Mesh(new THREE.BoxGeometry(62, 8, 50), materials.partnerMetal);
    identityLoomDeck.position.set(-120, 12, 44);

    const identityLedger = new THREE.Mesh(new THREE.BoxGeometry(38, 28, 8), materials.screenBlue);
    identityLedger.position.set(-120, 29, 20);
    identityLedger.castShadow = true;

    const identityLoomPinsGeo = new THREE.CylinderGeometry(2.5, 2.5, 26, 10);
    [-136, -120, -104].forEach((pinX, index) => {
        const pin = new THREE.Mesh(identityLoomPinsGeo, index === 1 ? materials.pipeYellow : materials.pipeBlue);
        pin.position.set(pinX, 28, 44);
        pin.castShadow = true;
        group.add(pin);
    });

    const consentGate = new THREE.Mesh(new THREE.TorusGeometry(13, 1.7, 10, 34), materials.pipeBlue);
    consentGate.rotation.x = Math.PI / 2;
    consentGate.position.set(-86, 30, 44);
    consentGate.userData = { spinAxis: 'z', spinSpeed: -0.8 };
    services.registerAnimatedObject(consentGate);

    const duplicateLedger = new THREE.Mesh(new THREE.BoxGeometry(44, 18, 28), materials.glass);
    duplicateLedger.position.set(18, 22, 118);
    duplicateLedger.castShadow = true;

    const duplicateSeal = new THREE.Mesh(new THREE.TorusGeometry(12, 1.8, 10, 36), materials.pipeRed);
    duplicateSeal.rotation.x = Math.PI / 2;
    duplicateSeal.position.set(18, 34, 118);
    duplicateSeal.userData = { spinAxis: 'z', spinSpeed: 0.65 };
    services.registerAnimatedObject(duplicateSeal);

    const retryGarden = new THREE.Mesh(new THREE.BoxGeometry(72, 7, 42), materials.concrete);
    retryGarden.position.set(88, 10, 94);

    const retryCoilGeo = new THREE.TorusGeometry(9, 1.6, 10, 30);
    [68, 88, 108].forEach((coilX, index) => {
        const retryCoil = new THREE.Mesh(retryCoilGeo, index === 1 ? materials.pipeYellow : materials.pipeBlue);
        retryCoil.rotation.x = Math.PI / 2;
        retryCoil.position.set(coilX, 25 + index * 3, 94);
        retryCoil.userData = { spinAxis: 'z', spinSpeed: 0.55 + index * 0.18 };
        services.registerAnimatedObject(retryCoil);
        group.add(retryCoil);
    });

    const deadLetterDock = new THREE.Mesh(new THREE.BoxGeometry(34, 18, 26), materials.partnerMetal);
    deadLetterDock.position.set(124, 20, 118);
    deadLetterDock.castShadow = true;

    const alertLens = new THREE.Mesh(new THREE.SphereGeometry(6, 14, 14), materials.pipeRed);
    alertLens.position.set(124, 34, 118);
    alertLens.userData = { bobAmplitude: 1.4, bobSpeed: 2.2, bobBaseY: 34 };
    services.registerAnimatedObject(alertLens);

    const deliveryCombiner = new THREE.Mesh(new THREE.CylinderGeometry(8, 13, 34, 5), materials.screenAmber);
    deliveryCombiner.rotation.z = Math.PI / 2;
    deliveryCombiner.position.set(128, 28, 88);
    deliveryCombiner.castShadow = true;

    const channelFanRailA = new THREE.Mesh(new THREE.BoxGeometry(78, 2.4, 5), materials.lineGreen);
    channelFanRailA.position.set(164, 22, 72);
    channelFanRailA.rotation.y = -Math.PI / 10;
    const channelFanRailB = new THREE.Mesh(new THREE.BoxGeometry(82, 2.4, 5), materials.fbBlue);
    channelFanRailB.position.set(166, 28, 88);
    const channelFanRailC = new THREE.Mesh(new THREE.BoxGeometry(78, 2.4, 5), materials.instaPink);
    channelFanRailC.position.set(164, 22, 104);
    channelFanRailC.rotation.y = Math.PI / 10;

    const campaignClock = new THREE.Mesh(new THREE.CylinderGeometry(11, 11, 8, 24), materials.screenBlue);
    campaignClock.rotation.x = Math.PI / 2;
    campaignClock.position.set(-34, 51, 0);
    campaignClock.userData = { spinAxis: 'z', spinSpeed: 0.5 };
    services.registerAnimatedObject(campaignClock);

    group.add(
        base,
        campaignHall,
        composerScreen,
        sendBeacon,
        beaconHalo,
        audienceDeck,
        filterPrism,
        queueBuffer,
        bufferRingA,
        bufferRingB,
        reliabilityDeck,
        workerTowerA,
        workerTowerB,
        workerTowerC,
        deliveryRailA,
        deliveryRailB,
        deliveryRailC,
        smoothingGate,
        outputFan,
        crmBridge,
        chatBridge,
        reliabilitySpine,
        throttleCanal,
        throttleFlywheel,
        identityLoomDeck,
        identityLedger,
        consentGate,
        duplicateLedger,
        duplicateSeal,
        retryGarden,
        deadLetterDock,
        alertLens,
        deliveryCombiner,
        channelFanRailA,
        channelFanRailB,
        channelFanRailC,
        campaignClock
    );

    group.position.set(x, y, z);
    group.userData = { isBuilding: true, name: 'Broadcast Campaign Hub' };

    services.addLabel(group, 'Broadcast Campaigns', 92);
    services.addLabel(campaignHall, 'Message Composer', 46);
    services.addLabel(filterPrism, 'Audience Filter', 34);
    services.addLabel(queueBuffer, 'Campaign Queue Buffer', 44);
    services.addLabel(reliabilityDeck, 'Reliable Delivery Workers', 34);
    services.addLabel(identityLedger, 'Audience Identity Loom', 40);
    services.addLabel(throttleFlywheel, 'Send Rate Smoother', 34);
    services.addLabel(duplicateLedger, 'Duplicate Guard', 34);
    services.addLabel(retryGarden, 'Retry Garden', 26);
    services.addLabel(deadLetterDock, 'Dead-letter Dock', 30);
    scene.add(group);
}

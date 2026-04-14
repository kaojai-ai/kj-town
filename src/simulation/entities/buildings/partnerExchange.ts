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

    const billingAtrium = new THREE.Mesh(new THREE.BoxGeometry(70, 32, 44), materials.glass);
    billingAtrium.position.set(0, 24, -30);
    billingAtrium.castShadow = true;

    const subscriptionCore = new THREE.Mesh(new THREE.CylinderGeometry(7, 7, 20, 14), materials.pipeBlue);
    subscriptionCore.position.set(-14, 12, -30);
    const topUpCore = new THREE.Mesh(new THREE.CylinderGeometry(7, 7, 20, 14), materials.pipeYellow);
    topUpCore.position.set(14, 12, -30);
    const billingBridge = new THREE.Mesh(new THREE.BoxGeometry(34, 3, 6), materials.partnerMetal);
    billingBridge.position.set(0, 20, -30);
    const billingHalo = new THREE.Mesh(new THREE.TorusGeometry(16, 1.7, 10, 34), materials.screenAmber);
    billingHalo.rotation.x = Math.PI / 2;
    billingHalo.position.set(0, 34, -30);

    const aiCostLedger = new THREE.Mesh(new THREE.BoxGeometry(56, 24, 20), materials.glass);
    aiCostLedger.position.set(-54, 22, 22);
    aiCostLedger.castShadow = true;
    const transactionFilterRail = new THREE.Mesh(new THREE.BoxGeometry(42, 2.4, 5), materials.pipeBlue);
    transactionFilterRail.position.set(-54, 12, 22);
    const spendGauge = new THREE.Mesh(new THREE.CylinderGeometry(5, 5, 16, 14), materials.pipeYellow);
    spendGauge.position.set(-72, 10, 22);
    const ledgerBeacon = new THREE.Mesh(new THREE.TorusGeometry(9, 1.5, 10, 28), materials.screenAmber);
    ledgerBeacon.rotation.x = Math.PI / 2;
    ledgerBeacon.position.set(-38, 30, 22);

    group.add(
        base,
        hub,
        hubCap,
        rail,
        billingAtrium,
        subscriptionCore,
        topUpCore,
        billingBridge,
        billingHalo,
        aiCostLedger,
        transactionFilterRail,
        spendGauge,
        ledgerBeacon
    );
    group.position.set(x, y, z);
    group.userData = { isBuilding: true, name: 'Partner Sync Exchange' };

    services.addLabel(group, 'Partner Sync', 120);
    services.addLabel(billingAtrium, 'Billing Unified', 30);
    services.addLabel(aiCostLedger, 'AI Transactions', 24);
    scene.add(group);
}

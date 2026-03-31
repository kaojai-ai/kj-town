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
            const availabilityRing = new THREE.Mesh(new THREE.TorusGeometry(12, 1.5, 10, 32), materials.pipeYellow);
            availabilityRing.rotation.x = Math.PI / 2;
            availabilityRing.position.set(width * 0.3, 24, depth * 0.38);
            const availabilityMeter = new THREE.Mesh(new THREE.CylinderGeometry(3.5, 3.5, 18, 12), materials.screenBlue);
            availabilityMeter.position.set(width * 0.3, 9, depth * 0.38);

            const landingArch = new THREE.Mesh(new THREE.TorusGeometry(20, 2.2, 12, 36, Math.PI), materials.pipeBlue);
            landingArch.rotation.z = Math.PI;
            landingArch.position.set(0, height + 18, -depth * 0.38);
            const landingFace = new THREE.Mesh(new THREE.BoxGeometry(width * 0.85, 18, 4), materials.screenAmber);
            landingFace.position.set(0, height + 18, -depth * 0.38);

            const domainBeacon = new THREE.Mesh(new THREE.CylinderGeometry(4, 5, 26, 14), materials.partnerMetal);
            domainBeacon.position.set(-width * 0.36, 13, -depth * 0.34);
            const domainRing = new THREE.Mesh(new THREE.TorusGeometry(8, 1.4, 10, 28), materials.pipeBlue);
            domainRing.rotation.x = Math.PI / 2;
            domainRing.position.set(-width * 0.36, 28, -depth * 0.34);

            const stylePillarLeft = new THREE.Mesh(new THREE.BoxGeometry(8, 24, 8), materials.pipeYellow);
            stylePillarLeft.position.set(width * 0.28, 12, -depth * 0.32);
            const stylePillarRight = new THREE.Mesh(new THREE.BoxGeometry(8, 24, 8), materials.pipeRed);
            stylePillarRight.position.set(width * 0.4, 12, -depth * 0.32);

            const quickStartLane = new THREE.Mesh(new THREE.BoxGeometry(width * 1.1, 3, 8), materials.pipeYellow);
            quickStartLane.position.set(0, 3, -depth * 0.08);
            const summaryBoard = new THREE.Mesh(new THREE.BoxGeometry(width * 0.72, 16, 4), materials.screenBlue);
            summaryBoard.position.set(0, height * 0.62, -depth * 0.3);
            shopGroup.add(
                canopy,
                dayViewPanel,
                searchKiosk,
                lens,
                availabilityRing,
                availabilityMeter,
                landingArch,
                landingFace,
                domainBeacon,
                domainRing,
                stylePillarLeft,
                stylePillarRight,
                quickStartLane,
                summaryBoard
            );

            services.addLabel(landingFace, 'Booking Landing', 18);
            services.addLabel(domainBeacon, 'Custom Domain', 20);
            services.addLabel(summaryBoard, 'Quick Summary', 20);
        }

        if (i === 1) {
            const galleryFrame = new THREE.Mesh(new THREE.BoxGeometry(width * 0.9, 22, 4), materials.screenAmber);
            galleryFrame.position.set(0, height * 0.65, depth * 0.4);
            const galleryBase = new THREE.Mesh(new THREE.BoxGeometry(width * 0.95, 4, 6), materials.partnerMetal);
            galleryBase.position.set(0, height * 0.55, depth * 0.4);
            const caseBeacon = new THREE.Mesh(new THREE.CylinderGeometry(5, 5, 26, 14), materials.screenBlue);
            caseBeacon.position.set(-width * 0.32, 13, depth * 0.36);
            const caseHalo = new THREE.Mesh(new THREE.TorusGeometry(9, 1.5, 10, 28), materials.pipeBlue);
            caseHalo.rotation.x = Math.PI / 2;
            caseHalo.position.set(-width * 0.32, 28, depth * 0.36);
            const quickFilterRail = new THREE.Mesh(new THREE.BoxGeometry(width * 1.04, 3, 8), materials.pipeBlue);
            quickFilterRail.position.set(0, 6, -depth * 0.32);
            const dateRail = new THREE.Mesh(new THREE.BoxGeometry(width * 0.8, 2.4, 6), materials.pipeYellow);
            dateRail.position.set(0, 10, -depth * 0.22);
            const testLane = new THREE.Mesh(new THREE.BoxGeometry(10, 20, 10), materials.pipeYellow);
            testLane.position.set(width * 0.27, 10, -depth * 0.2);
            const realLane = new THREE.Mesh(new THREE.BoxGeometry(10, 20, 10), materials.pipeBlue);
            realLane.position.set(width * 0.4, 10, -depth * 0.2);
            const totalsBoard = new THREE.Mesh(new THREE.BoxGeometry(width * 0.72, 14, 4), materials.screenBlue);
            totalsBoard.position.set(0, height * 0.92, 0);
            shopGroup.add(
                galleryFrame,
                galleryBase,
                caseBeacon,
                caseHalo,
                quickFilterRail,
                dateRail,
                testLane,
                realLane,
                totalsBoard
            );

            services.addLabel(quickFilterRail, 'Fast Filters', 12);
            services.addLabel(realLane, 'Real vs Test', 16);
        }

        if (i === 2) {
            const faqVault = new THREE.Mesh(new THREE.BoxGeometry(width * 0.68, 20, 6), materials.screenBlue);
            faqVault.position.set(0, height * 0.6, depth * 0.38);
            const replyRail = new THREE.Mesh(new THREE.BoxGeometry(width * 0.8, 3, 7), materials.pipeYellow);
            replyRail.position.set(0, height * 0.42, depth * 0.38);
            const memoryStackGeo = new THREE.BoxGeometry(8, 16, 8);
            for (let level = 0; level < 3; level++) {
                const memoryStack = new THREE.Mesh(memoryStackGeo, materials.partnerMetal);
                memoryStack.position.set(-width * 0.28 + level * 10, 8 + level * 5, -depth * 0.22);
                shopGroup.add(memoryStack);
            }
            shopGroup.add(faqVault, replyRail);
        }

        shopGroup.position.set((i - 1.5) * spacing, 0, 0);
        shopGroup.userData = { isBuilding: true, name: titles[i] };

        services.addLabel(shopGroup, titles[i], 80);
        group.add(shopGroup);
    }

    group.position.set(x, y, z);
    scene.add(group);
}

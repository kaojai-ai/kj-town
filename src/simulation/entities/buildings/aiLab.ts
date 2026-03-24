import * as THREE from 'three';
import type { MaterialPalette, CityServices } from '../../types/city';

export function createAILab(
    scene: THREE.Scene,
    materials: MaterialPalette,
    services: CityServices,
    x: number,
    y: number,
    z: number
): void {
    const group = new THREE.Group();

    const width = 100;
    const height = 140;
    const depth = 100;

    const glassBox = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), materials.glass);
    glassBox.position.y = height / 2 + 10;
    glassBox.castShadow = true;

    const innerGeo = new THREE.BoxGeometry(60, 10, 60);
    for (let i = 0; i < 5; i++) {
        const inner = new THREE.Mesh(innerGeo, materials.dbMetal);
        inner.position.y = 30 + i * 25;
        group.add(inner);
    }

    const knowledgeSpines = new THREE.Group();
    const spineGeo = new THREE.BoxGeometry(10, 50, 6);
    for (let i = 0; i < 6; i++) {
        const spine = new THREE.Mesh(spineGeo, materials.shopRoof2);
        spine.position.set(-30 + i * 12, 35, -25);
        knowledgeSpines.add(spine);
    }
    group.add(knowledgeSpines);

    const assistantCore = new THREE.Mesh(new THREE.SphereGeometry(18, 24, 24), materials.screenBlue);
    assistantCore.position.set(0, 90, 0);
    const orbitRing = new THREE.Mesh(new THREE.TorusGeometry(35, 2, 12, 60), materials.partnerMetal);
    orbitRing.rotation.x = Math.PI / 2;
    orbitRing.position.set(0, 90, 0);
    group.add(assistantCore, orbitRing);

    const playgroundDeck = new THREE.Mesh(new THREE.CylinderGeometry(36, 44, 8, 24), materials.concrete);
    playgroundDeck.position.set(-58, 14, 42);
    playgroundDeck.castShadow = true;

    const playgroundDome = new THREE.Mesh(new THREE.SphereGeometry(24, 22, 22), materials.glass);
    playgroundDome.position.set(-58, 32, 42);
    playgroundDome.scale.y = 0.7;

    const wizardStem = new THREE.Mesh(new THREE.BoxGeometry(56, 8, 18), materials.partnerMetal);
    wizardStem.position.set(60, 14, 42);

    const wizardStepGeo = new THREE.CylinderGeometry(6, 6, 22, 16);
    const wizardPositions = [42, 60, 78];
    wizardPositions.forEach((offset, index) => {
        const step = new THREE.Mesh(wizardStepGeo, materials.screenAmber);
        step.position.set(offset, 25 + index * 6, 42);
        step.castShadow = true;
        group.add(step);
    });

    const faqCondenser = new THREE.Mesh(new THREE.BoxGeometry(12, 34, 12), materials.screenBlue);
    faqCondenser.position.set(-20, 28, 44);
    const faqInlet = new THREE.Mesh(new THREE.BoxGeometry(30, 4, 10), materials.pipeYellow);
    faqInlet.position.set(-33, 17, 44);
    const faqOutlet = new THREE.Mesh(new THREE.BoxGeometry(24, 4, 10), materials.pipeBlue);
    faqOutlet.position.set(-5, 39, 44);

    const guidedRail = new THREE.Mesh(new THREE.TorusGeometry(20, 2, 10, 36), materials.pipeRed);
    guidedRail.rotation.x = Math.PI / 2;
    guidedRail.position.set(0, 56, -34);

    const guidedNode = new THREE.Mesh(new THREE.SphereGeometry(8, 16, 16), materials.pipeRed);
    guidedNode.position.set(0, 56, -54);

    group.add(
        playgroundDeck,
        playgroundDome,
        wizardStem,
        faqCondenser,
        faqInlet,
        faqOutlet,
        guidedRail,
        guidedNode
    );

    const frameGeo = new THREE.BoxGeometry(width + 4, 10, depth + 4);
    const base = new THREE.Mesh(frameGeo, materials.concrete);
    base.position.y = 5;
    const top = new THREE.Mesh(frameGeo, materials.concrete);
    top.position.y = height + 15;

    group.add(glassBox, base, top);
    group.position.set(x, y, z);
    group.userData = { isBuilding: true, name: 'AI Laboratory' };

    services.addLabel(group, 'AI LAB', 170);
    services.addLabel(playgroundDome, 'Playground', 34);
    services.addLabel(wizardStem, '3-Step Wizard', 22);
    services.addLabel(faqCondenser, 'FAQ Forge', 28);
    services.addLabel(guidedNode, 'Guided Agent', 24);
    scene.add(group);
}

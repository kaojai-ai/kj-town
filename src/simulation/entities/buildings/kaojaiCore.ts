import * as THREE from 'three';
import type { MaterialPalette, CityServices } from '../../types/city';

export function createKaojaiCore(
    scene: THREE.Scene,
    materials: MaterialPalette,
    services: CityServices,
    entityId: string,
    x: number,
    y: number,
    z: number
): void {
    const group = new THREE.Group();

    group.userData = {
        entityId,
        isBuilding: true,
        name: 'KaoJai Core'
    };

    const podium = new THREE.Mesh(
        new THREE.BoxGeometry(160, 20, 120),
        materials.concrete
    );

    podium.position.y = 10;
    podium.receiveShadow = true;

    const shape = new THREE.Shape();

    const w = 140;
    const h = 100;
    const r = 20;

    shape.moveTo(-w / 2 + r, h / 2);
    shape.lineTo(w / 2 - r, h / 2);
    shape.quadraticCurveTo(w / 2, h / 2, w / 2, h / 2 - r);
    shape.lineTo(w / 2, -h / 2 + r);
    shape.quadraticCurveTo(w / 2, -h / 2, w / 2 - r, -h / 2);

    const tailW = 20;
    const tailH = 20;

    shape.lineTo(-w / 2 + r + tailW + 30, -h / 2);
    shape.lineTo(-w / 2 + r, -h / 2 - tailH);
    shape.lineTo(-w / 2 + r, -h / 2);

    shape.quadraticCurveTo(-w / 2, -h / 2, -w / 2, -h / 2 + r);
    shape.lineTo(-w / 2, h / 2 - r);
    shape.quadraticCurveTo(-w / 2, h / 2, -w / 2 + r, h / 2);

    const geometry = new THREE.ExtrudeGeometry(
        shape,
        {
            depth: 60,
            bevelEnabled: true,
            bevelSegments: 2,
            bevelSize: 2,
            bevelThickness: 2
        }
    );

    geometry.center();

    const body = new THREE.Mesh(
        geometry,
        materials.kaojaiBody
    );

    body.position.y = 80;
    body.castShadow = true;

    group.add(
        podium,
        body
    );

    group.position.set(x, y, z);

    services.addLabel(
        group,
        'KaoJai.ai',
        180
    );

    scene.add(group);
}
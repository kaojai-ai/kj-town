import * as THREE from 'three';
import type { MaterialPalette, CityServices } from '../../types/city';

function createPipeSegment(start: THREE.Vector3, end: THREE.Vector3, material: THREE.Material): THREE.Mesh {
    const direction = new THREE.Vector3().subVectors(end, start);
    const length = direction.length();
    const geometry = new THREE.CylinderGeometry(6, 6, length, 12);

    geometry.translate(0, length / 2, 0);
    geometry.rotateX(Math.PI / 2);

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(start);
    mesh.lookAt(end);

    return mesh;
}

export function createEventBus(scene: THREE.Scene, materials: MaterialPalette, services: CityServices): void {
    const group = new THREE.Group();

    const p1 = createPipeSegment(new THREE.Vector3(-60, 40, 0), new THREE.Vector3(-300, 40, -150), materials.pipeYellow);
    const p2 = createPipeSegment(new THREE.Vector3(-60, 50, 20), new THREE.Vector3(-300, 50, 200), materials.pipeBlue);
    const p3 = createPipeSegment(new THREE.Vector3(0, 60, 50), new THREE.Vector3(0, 60, 250), materials.pipeRed);

    group.add(p1, p2, p3);

    [p1, p2, p3].forEach((pipe) => {
        const joint = new THREE.Mesh(new THREE.SphereGeometry(10), materials.dbMetal);
        joint.position.copy(pipe.position);
        group.add(joint);
    });

    group.position.set(-100, 20, 0);
    services.addLabel(group, 'Event Bus', 80);
    scene.add(group);
}

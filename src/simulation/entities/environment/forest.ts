import * as THREE from 'three';

function createTree(scene: THREE.Scene, x: number, y: number, z: number): void {
    const trunkGeo = new THREE.CylinderGeometry(4, 6, 20, 6);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 1.0 });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.set(x, y + 10, z);

    const leavesGeo = new THREE.IcosahedronGeometry(22, 0);
    const leavesMat = new THREE.MeshStandardMaterial({ color: 0x6ccf59, roughness: 0.9, flatShading: true });
    const leaves = new THREE.Mesh(leavesGeo, leavesMat);
    leaves.position.set(x, y + 35, z);

    trunk.castShadow = true;
    leaves.castShadow = true;

    scene.add(trunk);
    scene.add(leaves);
}

export function createForest(scene: THREE.Scene, x: number, z: number, count: number): void {
    for (let i = 0; i < count; i++) {
        const ox = (Math.random() - 0.5) * 100;
        const oz = (Math.random() - 0.5) * 100;
        createTree(scene, x + ox, 0, z + oz);
    }
}

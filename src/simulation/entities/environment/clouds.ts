import * as THREE from 'three';

export function createCloud(scene: THREE.Scene, x: number, y: number, z: number): void {
    const cloudGroup = new THREE.Group();
    const material = new THREE.MeshStandardMaterial({ color: 0xffffff, flatShading: true, transparent: true, opacity: 0.9 });

    const cloudBlocks = [
        [0, 0, 0, 40],
        [30, 10, 0, 30],
        [-30, 15, 10, 35],
        [20, 20, -10, 25],
    ];

    cloudBlocks.forEach((block) => {
        const geometry = new THREE.BoxGeometry(block[3], block[3], block[3]);
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(block[0], block[1], block[2]);
        cloudGroup.add(mesh);
    });

    cloudGroup.position.set(x, y, z);
    scene.add(cloudGroup);
}

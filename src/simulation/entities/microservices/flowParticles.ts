import * as THREE from 'three';

export function createFlowParticles(
    scene: THREE.Scene,
    particles: THREE.Mesh[],
    x: number,
    y: number,
    z: number,
    length: number
): void {
    const startX = x - length / 2;
    const endX = x + length / 2;

    for (let i = 0; i < 10; i++) {
        const geo = new THREE.SphereGeometry(3, 8, 8);
        const mat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const particle = new THREE.Mesh(geo, mat);

        particle.userData = {
            velocity: 2 + Math.random(),
            startX,
            endX,
        };

        particle.position.set(
            startX + Math.random() * length,
            y + 40 + (Math.random() * 20 - 10),
            z + (Math.random() * 20 - 10)
        );

        scene.add(particle);
        particles.push(particle);
    }
}

export function createMessageStream(
    scene: THREE.Scene,
    particles: THREE.Mesh[],
    x: number,
    y: number,
    z: number,
    length: number
): void {
    const count = 14;
    const startX = x - length / 2;
    const endX = x + length / 2;
    const spacing = length / count;

    for (let i = 0; i < count; i++) {
        const geo = new THREE.SphereGeometry(2.6, 10, 10);
        const mat = new THREE.MeshBasicMaterial({ color: 0x9fdcff });
        const particle = new THREE.Mesh(geo, mat);

        particle.userData = {
            velocity: 1.2 + (i % 3) * 0.05,
            startX,
            endX,
        };

        particle.position.set(startX + i * spacing, y + 44, z);

        scene.add(particle);
        particles.push(particle);
    }
}

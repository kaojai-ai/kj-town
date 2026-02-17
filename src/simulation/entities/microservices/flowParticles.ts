import * as THREE from 'three';

export function createFlowParticles(
    scene: THREE.Scene,
    particles: THREE.Mesh[],
    x: number,
    y: number,
    z: number,
    length: number
): void {
    for (let i = 0; i < 10; i++) {
        const geo = new THREE.SphereGeometry(3, 8, 8);
        const mat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const particle = new THREE.Mesh(geo, mat);

        particle.userData = {
            velocity: 2 + Math.random(),
            limit: length / 2,
            offset: Math.random() * length - length / 2,
        };

        particle.position.set(
            x + particle.userData.offset,
            y + 40 + (Math.random() * 20 - 10),
            z + (Math.random() * 20 - 10)
        );

        scene.add(particle);
        particles.push(particle);
    }
}

import * as THREE from 'three';

interface MessageStreamOptions {
    color?: number;
    count?: number;
    radius?: number;
    yOffset?: number;
    zOffset?: number;
    velocityBase?: number;
    velocityStep?: number;
    waveAmplitude?: number;
    waveSpeed?: number;
    laneSpread?: number;
}

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
    length: number,
    options: MessageStreamOptions = {}
): void {
    const count = options.count ?? 14;
    const radius = options.radius ?? 2.6;
    const color = options.color ?? 0x9fdcff;
    const yOffset = options.yOffset ?? 44;
    const zOffset = options.zOffset ?? 0;
    const velocityBase = options.velocityBase ?? 1.2;
    const velocityStep = options.velocityStep ?? 0.05;
    const waveAmplitude = options.waveAmplitude ?? 0.8;
    const waveSpeed = options.waveSpeed ?? 1.8;
    const laneSpread = options.laneSpread ?? 0.9;
    const startX = x - length / 2;
    const endX = x + length / 2;
    const spacing = length / count;

    for (let i = 0; i < count; i++) {
        const geo = new THREE.SphereGeometry(radius, 10, 10);
        const mat = new THREE.MeshBasicMaterial({ color });
        const particle = new THREE.Mesh(geo, mat);
        const laneOffset = ((i % 2) * 2 - 1) * laneSpread;
        const baseY = y + yOffset + (i % 3) * 0.25;
        const baseZ = z + zOffset + laneOffset;

        particle.userData = {
            velocity: velocityBase + (i % 3) * velocityStep,
            startX,
            endX,
            baseY,
            baseZ,
            phase: i * 0.45,
            waveAmplitude,
            waveSpeed,
        };

        particle.position.set(startX + i * spacing, baseY, baseZ);

        scene.add(particle);
        particles.push(particle);
    }
}

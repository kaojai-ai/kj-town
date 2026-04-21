import * as THREE from 'three';
import { createGround } from '../entities/land/ground';
import { createPaths } from '../entities/land/paths';
import { createEnvironment } from '../entities/environment/environment';
import { createKaojaiCore } from '../entities/buildings/kaojaiCore';
import { createDatabaseCluster } from '../entities/buildings/databaseCluster';
import { createAILab } from '../entities/buildings/aiLab';
import { createSocialChannels } from '../entities/buildings/socialChannels';
import { createShops } from '../entities/buildings/shops';
import { createPartnerExchange } from '../entities/buildings/partnerExchange';
import { createNotificationHub } from '../entities/buildings/notificationHub';
import { createChatConcourse } from '../entities/buildings/chatConcourse';
import { createEventBus } from '../entities/microservices/eventBus';
import { createFlowParticles as createFlowParticlesEntity, createMessageStream } from '../entities/microservices/flowParticles';
import { createMaterialPalette } from '../providers/materialProvider';
import { addLabel } from '../providers/labelProvider';
import type { CityServices, MaterialPalette } from '../types/city';

export class CityBuilder {
    private scene: THREE.Scene;
    private particles: THREE.Mesh[];
    private mixers: THREE.AnimationMixer[];
    private clock: THREE.Clock;
    private materials: MaterialPalette;
    private services: CityServices;

    constructor(scene: THREE.Scene) {
        this.scene = scene;
        this.particles = [];
        this.mixers = [];
        this.clock = new THREE.Clock();
        this.materials = createMaterialPalette();
        this.services = { addLabel };
    }

    build(): void {
        createGround(this.scene, this.materials);
        createEnvironment(this.scene);

        createKaojaiCore(this.scene, this.materials, this.services, 0, 0, 0);
        createDatabaseCluster(this.scene, this.materials, this.services, -300, 0, -200);
        createAILab(this.scene, this.materials, this.services, 300, 0, -100);
        createSocialChannels(this.scene, this.materials, this.services, -300, 0, 200);
        createChatConcourse(this.scene, this.materials, this.services, 120, 0, 140);
        createShops(this.scene, this.materials, this.services, 0, 0, 250);
        createPartnerExchange(this.scene, this.materials, this.services, 220, 0, 260);
        createNotificationHub(this.scene, this.materials, this.services, -180, 0, 120);

        createEventBus(this.scene, this.materials, this.services);
        createPaths(this.scene, this.materials);

        this.createFlowParticles(-40, 0, 250, 280);
        this.createMessageStream(120, 0, 140, 200);
        this.createMessageStream(88, 0, 168, 130, {
            color: 0xffd27a,
            count: 10,
            radius: 2.2,
            yOffset: 38,
            velocityBase: 0.95,
            velocityStep: 0.03,
            waveAmplitude: 0.25,
            waveSpeed: 1.2,
            laneSpread: 0.55,
        });
        this.createMessageStream(-300, 0, 200, 180, {
            color: 0x7ad7ff,
            count: 12,
            radius: 2.4,
            yOffset: 42,
            zOffset: 28,
            velocityBase: 1.35,
            velocityStep: 0.04,
            waveAmplitude: 0.45,
            waveSpeed: 2.1,
            laneSpread: 0.7,
        });
        this.createMessageStream(10, 0, 250, 240, {
            color: 0xffe08a,
            count: 16,
            radius: 2.1,
            yOffset: 47,
            zOffset: -20,
            velocityBase: 1.5,
            velocityStep: 0.07,
            waveAmplitude: 0.35,
            waveSpeed: 2.2,
            laneSpread: 0.5,
        });
        this.createMessageStream(220, 0, 260, 120, {
            color: 0xffc45a,
            count: 9,
            radius: 2.2,
            yOffset: 39,
            zOffset: -30,
            velocityBase: 1.1,
            velocityStep: 0.04,
            waveAmplitude: 0.3,
            waveSpeed: 1.6,
            laneSpread: 0.45,
        });
        this.createMessageStream(255, 0, -72, 170, {
            color: 0xffde74,
            count: 12,
            radius: 2.1,
            yOffset: 46,
            zOffset: 0,
            velocityBase: 1.35,
            velocityStep: 0.05,
            waveAmplitude: 0.33,
            waveSpeed: 1.9,
            laneSpread: 0.55,
        });
        this.createMessageStream(210, 0, 162, 160, {
            color: 0x8ad4ff,
            count: 11,
            radius: 2.1,
            yOffset: 40,
            zOffset: -6,
            velocityBase: 1.15,
            velocityStep: 0.04,
            waveAmplitude: 0.28,
            waveSpeed: 1.5,
            laneSpread: 0.5,
        });
        this.createMessageStream(120, 0, 106, 110, {
            color: 0xff8b8b,
            count: 8,
            radius: 2.0,
            yOffset: 35,
            zOffset: -18,
            velocityBase: 0.95,
            velocityStep: 0.03,
            waveAmplitude: 0.2,
            waveSpeed: 1.3,
            laneSpread: 0.4,
        });
        this.createMessageStream(120, 0, 140, 90, {
            color: 0xff9f9f,
            count: 8,
            radius: 2.3,
            yOffset: 34,
            zOffset: 32,
            velocityBase: 0.9,
            velocityStep: 0.03,
            waveAmplitude: 0.22,
            waveSpeed: 1.4,
            laneSpread: 0.5,
        });
        this.createMessageStream(74, 0, 190, 120, {
            color: 0xffd98c,
            count: 8,
            radius: 2.0,
            yOffset: 33,
            zOffset: 2,
            velocityBase: 0.85,
            velocityStep: 0.03,
            waveAmplitude: 0.21,
            waveSpeed: 1.5,
            laneSpread: 0.4,
        });
        this.createMessageStream(258, 0, 230, 78, {
            color: 0xffe070,
            count: 7,
            radius: 2.0,
            yOffset: 30,
            zOffset: -12,
            velocityBase: 0.82,
            velocityStep: 0.03,
            waveAmplitude: 0.2,
            waveSpeed: 1.35,
            laneSpread: 0.35,
        });
        this.createMessageStream(-344, 0, 198, 94, {
            color: 0x8dd6ff,
            count: 6,
            radius: 1.9,
            yOffset: 31,
            zOffset: 0,
            velocityBase: 0.8,
            velocityStep: 0.03,
            waveAmplitude: 0.18,
            waveSpeed: 1.25,
            laneSpread: 0.35,
        });
    }

    createFlowParticles(x: number, y: number, z: number, length: number): void {
        createFlowParticlesEntity(this.scene, this.particles, x, y, z, length);
    }

    createMessageStream(
        x: number,
        y: number,
        z: number,
        length: number,
        options?: {
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
    ): void {
        createMessageStream(this.scene, this.particles, x, y, z, length, options);
    }

    update(): void {
        const delta = this.clock.getDelta();
        const elapsed = this.clock.elapsedTime;

        this.mixers.forEach((mixer) => mixer.update(delta));

        this.particles.forEach((particle) => {
            particle.position.x += particle.userData.velocity;
            if (particle.position.x > particle.userData.endX) {
                particle.position.x = particle.userData.startX;
            }

            if (typeof particle.userData.baseY === 'number') {
                const phase = particle.userData.phase ?? 0;
                const waveSpeed = particle.userData.waveSpeed ?? 1;
                const waveAmplitude = particle.userData.waveAmplitude ?? 0;
                particle.position.y = particle.userData.baseY + Math.sin(elapsed * waveSpeed + phase) * waveAmplitude;
            }

            if (typeof particle.userData.baseZ === 'number') {
                const phase = particle.userData.phase ?? 0;
                const waveSpeed = particle.userData.waveSpeed ?? 1;
                const waveAmplitude = particle.userData.waveAmplitude ?? 0;
                particle.position.z = particle.userData.baseZ + Math.cos(elapsed * waveSpeed + phase) * waveAmplitude * 0.25;
            }
        });
    }
}

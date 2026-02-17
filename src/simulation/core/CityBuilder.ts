import * as THREE from 'three';
import { createGround } from '../entities/land/ground';
import { createPaths } from '../entities/land/paths';
import { createEnvironment } from '../entities/environment/environment';
import { createKaojaiCore } from '../entities/buildings/kaojaiCore';
import { createDatabaseCluster } from '../entities/buildings/databaseCluster';
import { createAILab } from '../entities/buildings/aiLab';
import { createSocialChannels } from '../entities/buildings/socialChannels';
import { createShops } from '../entities/buildings/shops';
import { createEventBus } from '../entities/microservices/eventBus';
import { createFlowParticles as createFlowParticlesEntity } from '../entities/microservices/flowParticles';
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
        createShops(this.scene, this.materials, this.services, 0, 0, 250);

        createEventBus(this.scene, this.materials, this.services);
        createPaths(this.scene, this.materials);
    }

    createFlowParticles(x: number, y: number, z: number, length: number): void {
        createFlowParticlesEntity(this.scene, this.particles, x, y, z, length);
    }

    update(): void {
        const delta = this.clock.getDelta();

        this.mixers.forEach((mixer) => mixer.update(delta));

        this.particles.forEach((particle) => {
            particle.position.x += particle.userData.velocity;
            if (particle.position.x > particle.userData.limit + (particle.parent?.position.x ?? 0)) {
                if (particle.position.x > -50) {
                    particle.position.x = -250;
                }
            }
        });
    }
}

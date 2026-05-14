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
import { createBroadcastCampaignHub } from '../entities/buildings/broadcastCampaignHub';

import { createEventBus } from '../entities/microservices/eventBus';

import {
    createFlowParticles as createFlowParticlesEntity,
    createMessageStream,
} from '../entities/microservices/flowParticles';

import { createMaterialPalette } from '../providers/materialProvider';
import { addLabel } from '../providers/labelProvider';

import type {
    CityServices,
    MaterialPalette,
} from '../types/city';

import { townEntities } from '../../town/townData';
import { TownInteraction } from '../../town/interaction';

export class CityBuilder {
    private scene: THREE.Scene;
    private particles: THREE.Mesh[];
    private mixers: THREE.AnimationMixer[];
    private animatedObjects: THREE.Object3D[];
    private clock: THREE.Clock;
    private materials: MaterialPalette;
    private services: CityServices;
    private interaction: TownInteraction;

    constructor(
        scene: THREE.Scene,
        camera: THREE.Camera
    ) {
        this.scene = scene;

        this.particles = [];
        this.mixers = [];
        this.animatedObjects = [];

        this.clock = new THREE.Clock();

        this.materials = createMaterialPalette();

        this.interaction = new TownInteraction(
            scene,
            camera
        );

        this.services = {
            addLabel,

            registerAnimatedObject: (
                object: THREE.Object3D
            ) => {
                this.animatedObjects.push(object);
            },
        };
    }

    private getEntityPosition(
        id: string
    ): [number, number, number] {
        const entity = townEntities.find(
            (e) => e.id === id
        );

        if (!entity) {
            return [0, 0, 0];
        }

        // fix readonly tuple issue
        return [
            entity.position[0],
            entity.position[1],
            entity.position[2],
        ];
    }

    private createBuildings(): void {
        townEntities.forEach((entity) => {
            const [x, y, z] = entity.position;

            const id = entity.id;

            switch (id) {
                case 'kaojai-core':
                    createKaojaiCore(
                        this.scene,
                        this.materials,
                        this.services,
                        id,
                        x,
                        y,
                        z
                    );
                    break;

                case 'database-cluster':
                    createDatabaseCluster(
                        this.scene,
                        this.materials,
                        this.services,
                        id,
                        x,
                        y,
                        z
                    );
                    break;

                case 'ai-engine':
                    createAILab(
                        this.scene,
                        this.materials,
                        this.services,
                        id,
                        x,
                        y,
                        z
                    );
                    break;

                case 'unified-inbox':
                    createSocialChannels(
                        this.scene,
                        this.materials,
                        this.services,
                        id,
                        x,
                        y,
                        z
                    );
                    break;

                case 'chatbot-orchestration':
                    createChatConcourse(
                        this.scene,
                        this.materials,
                        this.services,
                        id,
                        x,
                        y,
                        z
                    );
                    break;

                case 'broadcast-campaigns':
                    createBroadcastCampaignHub(
                        this.scene,
                        this.materials,
                        this.services,
                        id,
                        x,
                        y,
                        z
                    );
                    break;

                case 'booking-management':
                    createShops(
                        this.scene,
                        this.materials,
                        this.services,
                        id,
                        x,
                        y,
                        z
                    );
                    break;

                case 'partner-exchange':
                    createPartnerExchange(
                        this.scene,
                        this.materials,
                        this.services,
                        id,
                        x,
                        y,
                        z
                    );
                    break;

                case 'notification-hub':
                    createNotificationHub(
                        this.scene,
                        this.materials,
                        this.services,
                        id,
                        x,
                        y,
                        z
                    );
                    break;
            }
        });
    }

    private createTraffic(): void {
        const chatPos =
            this.getEntityPosition(
                'chatbot-orchestration'
            );

        const socialPos =
            this.getEntityPosition(
                'unified-inbox'
            );

        const shopPos =
            this.getEntityPosition(
                'booking-management'
            );

        const partnerPos =
            this.getEntityPosition(
                'partner-exchange'
            );

        const campaignPos =
            this.getEntityPosition(
                'broadcast-campaigns'
            );

        this.createFlowParticles(
            shopPos[0] - 40,
            0,
            shopPos[2],
            280
        );

        this.createMessageStream(
            chatPos[0],
            0,
            chatPos[2],
            200
        );

        this.createMessageStream(
            socialPos[0],
            0,
            socialPos[2],
            180
        );

        this.createMessageStream(
            partnerPos[0],
            0,
            partnerPos[2],
            140
        );

        this.createMessageStream(
            campaignPos[0],
            0,
            campaignPos[2],
            170
        );
    }

    build(): void {
        createGround(
            this.scene,
            this.materials
        );

        createEnvironment(
            this.scene
        );

        this.createBuildings();

        createEventBus(
            this.scene,
            this.materials,
            this.services
        );

        createPaths(
            this.scene,
            this.materials
        );

        this.createTraffic();
    }

    createFlowParticles(
        x: number,
        y: number,
        z: number,
        length: number
    ): void {
        createFlowParticlesEntity(
            this.scene,
            this.particles,
            x,
            y,
            z,
            length
        );
    }

    createMessageStream(
        x: number,
        y: number,
        z: number,
        length: number,
        options?: Record<string, unknown>
    ): void {
        createMessageStream(
            this.scene,
            this.particles,
            x,
            y,
            z,
            length,
            options
        );
    }

    update(): void {
        const delta =
            this.clock.getDelta();

        const elapsed =
            this.clock.elapsedTime;

        this.mixers.forEach(
            (mixer) => {
                mixer.update(delta);
            }
        );

        this.particles.forEach(
            (particle) => {
                particle.position.x +=
                    particle.userData.velocity;

                if (
                    particle.position.x >
                    particle.userData.endX
                ) {
                    particle.position.x =
                        particle.userData.startX;
                }

                if (
                    typeof particle.userData.baseY ===
                    'number'
                ) {
                    particle.position.y =
                        particle.userData.baseY +
                        Math.sin(elapsed) *
                            (
                                particle.userData.waveAmplitude ??
                                0
                            );
                }
            }
        );

        this.animatedObjects.forEach(
            (object) => {
                const speed =
                    object.userData.spinSpeed ?? 0;

                if (speed !== 0) {
                    object.rotation.y +=
                        speed * delta;
                }
            }
        );
    }

    destroy(): void {
        this.interaction.destroy();
    }
}
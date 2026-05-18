import * as THREE from 'three';
import type {
    MaterialPalette,
    CityServices
} from '../../types/city';

export function createBroadcastCampaignHub(
    scene: THREE.Scene,
    materials: MaterialPalette,
    services: CityServices,
    entityId: string,
    x: number,
    y: number,
    z: number
): void {
    const group =
        new THREE.Group();

    const base =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                170,
                14,
                118
            ),
            materials.concrete
        );

    base.position.y = 7;
    base.receiveShadow = true;

    const campaignHall =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                72,
                38,
                58
            ),
            materials.glass
        );

    campaignHall.position.set(
        -30,
        26,
        0
    );

    campaignHall.castShadow =
        true;

    const composerScreen =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                42,
                20,
                4
            ),
            materials.screenBlue
        );

    composerScreen.position.set(
        -30,
        32,
        31
    );

    const sendBeacon =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                7,
                9,
                44,
                18
            ),
            materials.partnerMetal
        );

    sendBeacon.position.set(
        28,
        34,
        0
    );

    sendBeacon.castShadow =
        true;

    const beaconHalo =
        new THREE.Mesh(
            new THREE.TorusGeometry(
                17,
                2,
                12,
                42
            ),
            materials.screenAmber
        );

    beaconHalo.rotation.x =
        Math.PI / 2;

    beaconHalo.position.set(
        28,
        58,
        0
    );

    const audienceDeck =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                118,
                7,
                34
            ),
            materials.partnerMetal
        );

    audienceDeck.position.set(
        -10,
        14,
        -38
    );

    const segmentGeo =
        new THREE.CylinderGeometry(
            10,
            12,
            30,
            18
        );

    const segmentPositions =
        [
            {
                x: -58,
                label:
                    'Booked Recently',
                material:
                    materials.pipeYellow,
            },
            {
                x: -16,
                label:
                    'Checked-in Last Month',
                material:
                    materials.pipeBlue,
            },
            {
                x: 26,
                label:
                    'Recent Contacts',
                material:
                    materials.pipeRed,
            },
        ];

    segmentPositions.forEach(
        (segment) => {
            const silo =
                new THREE.Mesh(
                    segmentGeo,
                    materials.glass
                );

            silo.position.set(
                segment.x,
                30,
                -38
            );

            silo.castShadow =
                true;

            const cap =
                new THREE.Mesh(
                    new THREE.SphereGeometry(
                        7,
                        14,
                        14
                    ),
                    segment.material
                );

            cap.position.set(
                segment.x,
                49,
                -38
            );

            const selectorRail =
                new THREE.Mesh(
                    new THREE.BoxGeometry(
                        24,
                        2.3,
                        5
                    ),
                    segment.material
                );

            selectorRail.position.set(
                segment.x,
                17,
                -18
            );

            group.add(
                silo,
                cap,
                selectorRail
            );

            services.addLabel(
                silo,
                segment.label,
                42
            );
        }
    );

    const filterPrism =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                18,
                18,
                22,
                3
            ),
            materials.screenAmber
        );

    filterPrism.rotation.y =
        Math.PI / 6;

    filterPrism.position.set(
        -80,
        24,
        -2
    );

    const queueBuffer =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                20,
                24,
                22,
                28
            ),
            materials.partnerMetal
        );

    queueBuffer.position.set(
        70,
        22,
        0
    );

    const bufferRingA =
        new THREE.Mesh(
            new THREE.TorusGeometry(
                25,
                1.8,
                10,
                42
            ),
            materials.pipeBlue
        );

    bufferRingA.rotation.x =
        Math.PI / 2;

    bufferRingA.position.set(
        70,
        34,
        0
    );

    const bufferRingB =
        new THREE.Mesh(
            new THREE.TorusGeometry(
                31,
                1.8,
                10,
                48
            ),
            materials.pipeYellow
        );

    bufferRingB.rotation.x =
        Math.PI / 2;

    bufferRingB.position.set(
        70,
        41,
        0
    );

    const reliabilityDeck =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                66,
                8,
                46
            ),
            materials.concrete
        );

    reliabilityDeck.position.set(
        46,
        11,
        39
    );

    const workerTowerA =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                6,
                7,
                28,
                16
            ),
            materials.pipeBlue
        );

    workerTowerA.position.set(
        25,
        28,
        39
    );

    const workerTowerB =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                6,
                7,
                28,
                16
            ),
            materials.pipeYellow
        );

    workerTowerB.position.set(
        47,
        28,
        39
    );

    const workerTowerC =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                6,
                7,
                28,
                16
            ),
            materials.pipeRed
        );

    workerTowerC.position.set(
        69,
        28,
        39
    );

    const throttleFlywheel =
        new THREE.Mesh(
            new THREE.TorusGeometry(
                21,
                2.2,
                12,
                48
            ),
            materials.screenAmber
        );

    throttleFlywheel.rotation.y =
        Math.PI / 2;

    throttleFlywheel.position.set(
        -108,
        35,
        88
    );

    throttleFlywheel.userData =
        {
            spinAxis: 'z',
            spinSpeed: 1.35,
        };

    services.registerAnimatedObject(
        throttleFlywheel
    );

    const campaignClock =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                11,
                11,
                8,
                24
            ),
            materials.screenBlue
        );

    campaignClock.rotation.x =
        Math.PI / 2;

    campaignClock.position.set(
        -34,
        51,
        0
    );

    campaignClock.userData =
        {
            spinAxis: 'z',
            spinSpeed: 0.5,
        };

    services.registerAnimatedObject(
        campaignClock
    );

    group.add(
        base,
        campaignHall,
        composerScreen,
        sendBeacon,
        beaconHalo,
        audienceDeck,
        filterPrism,
        queueBuffer,
        bufferRingA,
        bufferRingB,
        reliabilityDeck,
        workerTowerA,
        workerTowerB,
        workerTowerC,
        throttleFlywheel,
        campaignClock
    );

    group.position.set(
        x,
        y,
        z
    );

    // สำคัญ: set ครั้งเดียว
    group.userData = {
        entityId,
        isBuilding: true,
        name:
            'Broadcast Campaign Hub',
    };

    services.addLabel(
        group,
        'Broadcast Campaigns',
        92
    );

    services.addLabel(
        campaignHall,
        'Message Composer',
        46
    );

    services.addLabel(
        filterPrism,
        'Audience Filter',
        34
    );

    services.addLabel(
        queueBuffer,
        'Queue Buffer',
        44
    );

    services.addLabel(
        reliabilityDeck,
        'Delivery Workers',
        34
    );

    services.addLabel(
        throttleFlywheel,
        'Rate Smoother',
        34
    );

    scene.add(group);
}
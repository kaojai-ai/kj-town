import * as THREE from 'three';
import type {
    MaterialPalette,
    CityServices
} from '../../types/city';

export function createSocialChannels(
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

    group.userData = {
        entityId,
        isBuilding: true,
        name: 'Social Channels'
    };

    const size = 50;
    const gap = 60;

    const line =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                size,
                size,
                size
            ),
            materials.lineGreen
        );

    line.position.set(
        -gap,
        size / 2,
        0
    );

    const facebook =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                size,
                size,
                size
            ),
            materials.fbBlue
        );

    facebook.position.set(
        0,
        size / 2,
        gap / 2
    );

    const instagram =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                size,
                size,
                size
            ),
            materials.instaPink
        );

    instagram.position.set(
        gap,
        size / 2,
        0
    );

    const webWidgetHub =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                size,
                size,
                size
            ),
            materials.screenBlue
        );

    webWidgetHub.position.set(
        0,
        size / 2,
        -gap
    );

    group.add(
        line,
        facebook,
        instagram,
        webWidgetHub
    );

    const widgetPortal =
        new THREE.Mesh(
            new THREE.TorusGeometry(
                14,
                2,
                10,
                32
            ),
            materials.pipeBlue
        );

    widgetPortal.rotation.x =
        Math.PI / 2;

    widgetPortal.position.set(
        0,
        size + 24,
        -gap
    );

    const widgetSupport =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                8,
                26,
                8
            ),
            materials.partnerMetal
        );

    widgetSupport.position.set(
        0,
        size + 3,
        -gap
    );

    group.add(
        widgetPortal,
        widgetSupport
    );

    group.position.set(
        x,
        y,
        z
    );

    services.addLabel(
        group,
        'Social Channels',
        100
    );

    services.addLabel(
        webWidgetHub,
        'Website Widget',
        42
    );

    scene.add(group);
}
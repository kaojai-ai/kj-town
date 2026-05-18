import * as THREE from 'three';
import type {
    MaterialPalette,
    CityServices
} from '../../types/city';

export function createShops(
    scene: THREE.Scene,
    materials: MaterialPalette,
    services: CityServices,
    entityId: string,
    x: number,
    y: number,
    z: number
): void {
    const group = new THREE.Group();

    group.userData = {
        entityId,
        isBuilding: true,
        name: 'Booking Management'
    };

    const width = 60;
    const height = 40;
    const depth = 60;
    const spacing = 70;

    const titles = [
        'Booking',
        'Issues',
        'FAQ',
        'Fun'
    ];

    for (let i = 0; i < 4; i++) {
        const shopGroup =
            new THREE.Group();

        shopGroup.userData = {
            entityId,
            isBuilding: true,
            name: titles[i]
        };

        const body =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    width,
                    height,
                    depth
                ),
                materials.shopBody
            );

        body.position.y =
            height / 2;

        body.castShadow =
            true;

        const roofGeo =
            new THREE.ConeGeometry(
                width * 0.8,
                30,
                4
            );

        roofGeo.rotateY(
            Math.PI / 4
        );

        const roofMaterial =
            i % 2 === 0
                ? materials.shopRoof1
                : materials.shopRoof2;

        const roof =
            new THREE.Mesh(
                roofGeo,
                roofMaterial
            );

        roof.position.y =
            height + 15;

        shopGroup.add(
            body,
            roof
        );

        // BOOKING
        if (i === 0) {
            const canopy =
                new THREE.Mesh(
                    new THREE.BoxGeometry(
                        width * 1.3,
                        6,
                        depth * 0.6
                    ),
                    materials.shopRoof2
                );

            canopy.position.set(
                0,
                height + 8,
                depth * 0.2
            );

            const dayViewPanel =
                new THREE.Mesh(
                    new THREE.BoxGeometry(
                        width * 1.1,
                        26,
                        4
                    ),
                    materials.screenBlue
                );

            dayViewPanel.position.set(
                0,
                height + 28,
                depth * 0.35
            );

            shopGroup.add(
                canopy,
                dayViewPanel
            );

            services.addLabel(
                dayViewPanel,
                'Booking Landing',
                18
            );
        }

        // ISSUES
        if (i === 1) {
            const galleryFrame =
                new THREE.Mesh(
                    new THREE.BoxGeometry(
                        width * 0.9,
                        22,
                        4
                    ),
                    materials.screenAmber
                );

            galleryFrame.position.set(
                0,
                height * 0.65,
                depth * 0.4
            );

            shopGroup.add(
                galleryFrame
            );

            services.addLabel(
                galleryFrame,
                'Fast Filters',
                12
            );
        }

        // FAQ
        if (i === 2) {
            const faqVault =
                new THREE.Mesh(
                    new THREE.BoxGeometry(
                        width * 0.68,
                        20,
                        6
                    ),
                    materials.screenBlue
                );

            faqVault.position.set(
                0,
                height * 0.6,
                depth * 0.38
            );

            shopGroup.add(
                faqVault
            );
        }

        shopGroup.position.set(
            (i - 1.5) *
                spacing,
            0,
            0
        );

        services.addLabel(
            shopGroup,
            titles[i],
            80
        );

        group.add(
            shopGroup
        );
    }

    group.position.set(
        x,
        y,
        z
    );

    scene.add(group);
}
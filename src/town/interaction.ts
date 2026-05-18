import * as THREE from 'three';
import { entityById } from './townData';

export class TownInteraction {
    private scene: THREE.Scene;
    private camera: THREE.Camera;

    private raycaster =
        new THREE.Raycaster();

    private mouse =
        new THREE.Vector2();

    private hoveredObject:
        | THREE.Object3D
        | null = null;

    constructor(
        scene: THREE.Scene,
        camera: THREE.Camera
    ) {
        this.scene = scene;
        this.camera = camera;

        window.addEventListener(
            'mousemove',
            this.handleMouseMove
        );

        window.addEventListener(
            'click',
            this.handleClick
        );
    }

    private handleMouseMove = (
        event: MouseEvent
    ) => {
        this.mouse.x =
            (event.clientX /
                window.innerWidth) *
                2 -
            1;

        this.mouse.y =
            -(event.clientY /
                window.innerHeight) *
                2 +
            1;

        this.updateHover();
    };

    private handleClick = () => {
        const hit =
            this.getIntersectedObject();

        if (!hit) return;

        const entityId =
            hit.object.userData
                .entityId;

        if (!entityId) return;

        const entity =
            entityById.get(
                entityId
            );

        if (!entity) return;

        console.log(
            'SELECTED:',
            entity
        );
    };

    private updateHover() {
        const hit =
            this.getIntersectedObject();

        if (
            this.hoveredObject &&
            this.hoveredObject !==
                hit?.object
        ) {
            this.setHighlight(
                this.hoveredObject,
                false
            );

            this.hoveredObject =
                null;
        }

        if (
            hit &&
            this.hoveredObject !==
                hit.object
        ) {
            this.hoveredObject =
                hit.object;

            this.setHighlight(
                hit.object,
                true
            );
        }
    }

    private getIntersectedObject() {
        this.raycaster.setFromCamera(
            this.mouse,
            this.camera
        );

        const hits =
            this.raycaster.intersectObjects(
                this.scene.children,
                true
            );

        return hits[0];
    }

    private setHighlight(
        object: THREE.Object3D,
        active: boolean
    ) {
        object.traverse((child) => {
            if (
                child instanceof
                THREE.Mesh
            ) {
                const material =
                    child.material as THREE.MeshStandardMaterial;

                if (
                    material &&
                    material.emissive
                ) {
                    material.emissiveIntensity =
                        active
                            ? 1.5
                            : 0;
                }
            }
        });
    }

    destroy() {
        window.removeEventListener(
            'mousemove',
            this.handleMouseMove
        );

        window.removeEventListener(
            'click',
            this.handleClick
        );
    }
}
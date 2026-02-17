import * as THREE from 'three';
import { createForest } from './forest';
import { createCloud } from './clouds';

export function createEnvironment(scene: THREE.Scene): void {
    createForest(scene, -400, -300, 8);
    createForest(scene, 350, 250, 6);
    createForest(scene, 380, -250, 5);
    createForest(scene, -380, 250, 6);
    createForest(scene, 0, -300, 10);

    createCloud(scene, 200, 400, -200);
    createCloud(scene, -200, 450, 100);
    createCloud(scene, 0, 500, 0);
}

import * as THREE from 'three';

export type MaterialPalette = Record<string, THREE.Material>;

export interface CityServices {
    addLabel: (parent: THREE.Object3D, text: string, yOffset: number) => void;
}

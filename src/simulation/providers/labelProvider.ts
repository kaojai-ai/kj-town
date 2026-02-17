import * as THREE from 'three';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

export function addLabel(parent: THREE.Object3D, text: string, yOffset: number): void {
    const div = document.createElement('div');
    div.className = 'label';
    div.textContent = text;
    div.style.color = 'white';
    div.style.fontFamily = 'Arial, sans-serif';
    div.style.fontWeight = 'bold';
    div.style.fontSize = '12px';
    div.style.textShadow = '0px 0px 4px black';
    div.style.padding = '4px 8px';
    div.style.background = 'rgba(0,0,0,0.5)';
    div.style.borderRadius = '4px';

    const label = new CSS2DObject(div);
    label.position.set(0, yOffset, 0);
    parent.add(label);
}

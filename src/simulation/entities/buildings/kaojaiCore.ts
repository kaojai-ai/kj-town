import * as THREE from 'three';
import type { MaterialPalette, CityServices } from '../../types/city';

export function createKaojaiCore(
    scene: THREE.Scene,
    materials: MaterialPalette,
    services: CityServices,
    x: number,
    y: number,
    z: number
): void {
    const group = new THREE.Group();
    const podium = new THREE.Mesh(new THREE.BoxGeometry(160, 20, 120), materials.concrete);
    podium.position.y = 10;
    podium.receiveShadow = true;

    const shape = new THREE.Shape();
    const w = 140;
    const h = 100;
    const r = 20;

    shape.moveTo(-w / 2 + r, h / 2);
    shape.lineTo(w / 2 - r, h / 2);
    shape.quadraticCurveTo(w / 2, h / 2, w / 2, h / 2 - r);
    shape.lineTo(w / 2, -h / 2 + r);
    shape.quadraticCurveTo(w / 2, -h / 2, w / 2 - r, -h / 2);

    const tailW = 20;
    const tailH = 20;
    shape.lineTo(-w / 2 + r + tailW + 30, -h / 2);
    shape.lineTo(-w / 2 + r, -h / 2 - tailH);
    shape.lineTo(-w / 2 + r, -h / 2);

    shape.quadraticCurveTo(-w / 2, -h / 2, -w / 2, -h / 2 + r);
    shape.lineTo(-w / 2, h / 2 - r);
    shape.quadraticCurveTo(-w / 2, h / 2, -w / 2 + r, h / 2);

    const depth = 60;
    const extrudeSettings = { depth, bevelEnabled: true, bevelSegments: 2, bevelSize: 2, bevelThickness: 2 };
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometry.center();

    const body = new THREE.Mesh(geometry, materials.kaojaiBody);
    body.position.y = 20 + h / 2 + 10;
    body.castShadow = true;

    const featureMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 });

    const eyeR = 15;
    const eyeGeo = new THREE.CylinderGeometry(eyeR, eyeR, 5, 32);
    eyeGeo.rotateX(Math.PI / 2);

    const eyeL = new THREE.Mesh(eyeGeo, featureMat);
    eyeL.position.set(-30, body.position.y + 10, depth / 2 + 2);

    const eyeRight = new THREE.Mesh(eyeGeo, featureMat);
    eyeRight.position.set(30, body.position.y + 10, depth / 2 + 2);

    const mouthCurve = new THREE.EllipseCurve(0, 0, 26, 16, Math.PI * 1.2, Math.PI * 1.8, false, 0);
    const mouthPoints = mouthCurve.getPoints(50);
    const mouthPath3D = new THREE.CatmullRomCurve3(mouthPoints.map((p) => new THREE.Vector3(p.x, p.y, 0)));
    const mouthGeo = new THREE.TubeGeometry(mouthPath3D, 20, 3, 8, false);
    const mouth = new THREE.Mesh(mouthGeo, featureMat);
    mouth.position.set(0, body.position.y - 5, depth / 2 + 2);

    const antStemH = 30;
    const antStem = new THREE.Mesh(new THREE.CylinderGeometry(3, 3, antStemH), featureMat);
    antStem.position.set(0, body.position.y + h / 2 + antStemH / 2, 0);

    const antBall = new THREE.Mesh(new THREE.SphereGeometry(12), featureMat);
    antBall.position.set(0, body.position.y + h / 2 + antStemH + 8, 0);

    group.add(podium, body, eyeL, eyeRight, mouth, antStem, antBall);
    group.position.set(x, y, z);
    group.userData = { isBuilding: true, name: 'KAOJAI Core' };

    services.addLabel(group, 'KaoJai.ai', 180);
    scene.add(group);
}

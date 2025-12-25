import * as THREE from 'three';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

export class CityBuilder {
    constructor(scene) {
        this.scene = scene;
        this.particles = [];
        this.mixers = [];
        this.clock = new THREE.Clock();

        // Materials Palette
        this.materials = {
            grass: new THREE.MeshStandardMaterial({ color: 0x6ccf59, roughness: 0.8 }),
            water: new THREE.MeshStandardMaterial({ color: 0x2faaf0, roughness: 0.2, metalness: 0.1 }),

            // Building Materials
            kaojaiBody: new THREE.MeshStandardMaterial({ color: 0x4db8aa, roughness: 0.3 }),
            kaojaiFace: new THREE.MeshStandardMaterial({ color: 0x223355, roughness: 0.2 }),
            dbTank: new THREE.MeshStandardMaterial({ color: 0x76d672, roughness: 0.4 }),
            dbMetal: new THREE.MeshStandardMaterial({ color: 0xaaccdd, metalness: 0.6, roughness: 0.2 }),
            glass: new THREE.MeshPhysicalMaterial({
                color: 0xaaddff,
                metalness: 0.1,
                roughness: 0.05,
                transmission: 0.9,
                transparent: true
            }),
            concrete: new THREE.MeshStandardMaterial({ color: 0xeeeeee }),

            // Shops
            shopBody: new THREE.MeshStandardMaterial({ color: 0xfff5e0 }),
            shopRoof1: new THREE.MeshStandardMaterial({ color: 0xff9933 }),
            shopRoof2: new THREE.MeshStandardMaterial({ color: 0x3399ff }),

            // Social
            lineGreen: new THREE.MeshStandardMaterial({ color: 0x06c755 }),
            fbBlue: new THREE.MeshStandardMaterial({ color: 0x1877f2 }),
            instaPink: new THREE.MeshStandardMaterial({ color: 0xe1306c }),

            // Pipes/Neon - Increased Emissive for Bloom
            pipeYellow: new THREE.MeshStandardMaterial({ color: 0xffcc00, emissive: 0xffcc00, emissiveIntensity: 2.0 }),
            pipeBlue: new THREE.MeshStandardMaterial({ color: 0x3388ff, emissive: 0x3388ff, emissiveIntensity: 2.0 }),
            pipeRed: new THREE.MeshStandardMaterial({ color: 0xff3333, emissive: 0xff3333, emissiveIntensity: 2.0 }),

            // Environment
            path: new THREE.MeshStandardMaterial({ color: 0xe0cda8, roughness: 1.0 }),
            treeTrunk: new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 1.0 }),
            treeLeaves: new THREE.MeshStandardMaterial({ color: 0x5dbb4d, roughness: 0.8, flatShading: true }),
            lightPost: new THREE.MeshStandardMaterial({ color: 0x444444, roughness: 0.5 }),
            lightBulb: new THREE.MeshStandardMaterial({ color: 0xffffee, emissive: 0xffffee, emissiveIntensity: 3.0 })
        };
    }

    build() {
        this.createPlatform();

        // --- Tighter Layout ---
        // Center: KaoJai
        this.createKaojaiCore(0, 0, 0);

        // Top Left: Database Cluster
        this.createDatabase(-200, 0, -150);

        // Top Right: AI Lab
        this.createAILab(200, 0, -100);

        // Bottom Left: Social Cubes
        this.createSocialCubes(-180, 0, 180);

        // Bottom Right: Shops
        this.createShops(180, 0, 180);

        // --- Infrastructure ---
        this.createPaths();
        this.createEventBus(); // Update coords inside
        this.createEnvironment(); // Trees & Clouds
        this.createStreetLights(); // New Props
        this.createCars(); // New Props
    }

    createPlatform() {
        const width = 900;
        const depth = 800;
        const height = 40;

        // Island Base
        const geometry = new THREE.BoxGeometry(width, height, depth);
        const platform = new THREE.Mesh(geometry, this.materials.concrete);
        platform.position.y = -height/2;
        platform.receiveShadow = true;
        this.scene.add(platform);

        // Grass Top Layer (Thin)
        const grassGeo = new THREE.BoxGeometry(width - 20, 4, depth - 20);
        const grass = new THREE.Mesh(grassGeo, this.materials.grass);
        grass.position.y = 2; // Slightly above 0
        grass.receiveShadow = true;
        this.scene.add(grass);

        // Water
        const waterGeo = new THREE.PlaneGeometry(4000, 4000);
        const waterMat = new THREE.MeshStandardMaterial({
            color: 0x4fa4b8,
            roughness: 0.1,
            metalness: 0.1,
            transparent: true,
            opacity: 0.8
        });
        const water = new THREE.Mesh(waterGeo, waterMat);
        water.rotation.x = -Math.PI / 2;
        water.position.y = -height - 10;
        this.scene.add(water);
    }

    createPaths() {
        // T-Shape / Cross Layout
        const pathMat = this.materials.path;
        const yPos = 3; // Above grass, slightly thicker

        const paths = [
            // Center Horizontal
            { w: 500, h: 40, x: 0, z: 0 },
            // Center Vertical (Front)
            { w: 40, h: 300, x: 0, z: 100 },
            // Center Vertical (Back)
            { w: 40, h: 200, x: 0, z: -150 },
            // Diagonal to Social
            { w: 20, h: 150, x: -100, z: 100, rot: -0.5 },
             // Diagonal to Shops
            { w: 20, h: 150, x: 100, z: 100, rot: 0.5 },
        ];

        paths.forEach(p => {
            // Changed to BoxGeometry for thickness
            const mesh = new THREE.Mesh(new THREE.BoxGeometry(p.w, 2, p.h), pathMat);
            // mesh.rotation.x = -Math.PI / 2; // Box doesn't need rotation to be flat if we use (w, height, depth) logic right
            // Wait, I used (w, 2, h) -> X=w, Y=2, Z=h. Correct.

            if(p.rot) mesh.rotation.y = -p.rot; // Rotate around Y axis for a box on the ground
            mesh.position.set(p.x, yPos, p.z);
            mesh.receiveShadow = true;
            this.scene.add(mesh);
        });
    }

    createEnvironment() {
        // Trees around the edges and in gaps
        const treeLocs = [
            [-250, -200], [-300, -100], [-250, 0], // Left Cluster
            [250, -150], [300, -50], [280, 50],    // Right Cluster
            [-200, 250], [-100, 280],              // Front Left
            [200, 250], [100, 280],                // Front Right
            [0, -250], [50, -280], [-50, -280]     // Back
        ];

        treeLocs.forEach(pos => {
            const r = Math.random();
            const xx = pos[0] + Math.random()*30;
            const zz = pos[1] + Math.random()*30;

            if(r > 0.6) {
                this.createPineTree(xx, 0, zz);
            } else {
                this.createTree(xx, 0, zz);
            }
        });

        // Clouds
        this.createCloud(200, 300, -200);
        this.createCloud(-200, 350, 100);
    }

    createTree(x, y, z) {
        // Round Tree
        const group = new THREE.Group();

        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(4, 6, 20, 6), this.materials.treeTrunk);
        trunk.position.y = 10;
        trunk.castShadow = true;

        const leaves = new THREE.Mesh(new THREE.IcosahedronGeometry(18, 0), this.materials.treeLeaves);
        leaves.position.y = 28;
        leaves.castShadow = true;

        group.add(trunk, leaves);
        group.position.set(x, y, z);

        // Random scale
        const s = 0.8 + Math.random() * 0.4;
        group.scale.set(s, s, s);

        this.scene.add(group);
    }

    createPineTree(x, y, z) {
        const group = new THREE.Group();

        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(3, 5, 15, 6), this.materials.treeTrunk);
        trunk.position.y = 7.5;
        trunk.castShadow = true;

        // Layers of cones
        const c1 = new THREE.Mesh(new THREE.ConeGeometry(15, 20, 7), this.materials.treeLeaves);
        c1.position.y = 20;
        c1.castShadow = true;

        const c2 = new THREE.Mesh(new THREE.ConeGeometry(12, 18, 7), this.materials.treeLeaves);
        c2.position.y = 30;
        c2.castShadow = true;

        group.add(trunk, c1, c2);
        group.position.set(x, y, z);

        const s = 0.8 + Math.random() * 0.5;
        group.scale.set(s, s, s);

        this.scene.add(group);
    }

    createCloud(x, y, z) {
        const cloudGroup = new THREE.Group();
        const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, flatShading: true, transparent: true, opacity: 0.9 });

        const positions = [
            [0,0,0, 40],
            [25, 5, 0, 30],
            [-25, 10, 5, 35]
        ];

        positions.forEach(p => {
            const geo = new THREE.BoxGeometry(p[3], p[3], p[3]);
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.set(p[0], p[1], p[2]);
            cloudGroup.add(mesh);
        });

        cloudGroup.position.set(x, y, z);
        this.scene.add(cloudGroup);
    }

    createStreetLights() {
        const locs = [
            [-20, 0, 100], [20, 0, 100], // Front Path
            [-20, 0, 200], [20, 0, 200],
            [-100, 0, -20], [-200, 0, -20], // Side paths
            [100, 0, -20], [200, 0, -20]
        ];

        locs.forEach(p => {
            const group = new THREE.Group();

            // Post
            const post = new THREE.Mesh(new THREE.CylinderGeometry(2, 2, 25), this.materials.lightPost);
            post.position.y = 12.5;
            post.castShadow = true;

            // Arm
            const arm = new THREE.Mesh(new THREE.BoxGeometry(10, 2, 2), this.materials.lightPost);
            arm.position.set(3, 24, 0);

            // Bulb
            const bulb = new THREE.Mesh(new THREE.BoxGeometry(4, 2, 4), this.materials.lightBulb);
            bulb.position.set(7, 23, 0);

            group.add(post, arm, bulb);
            group.position.set(p[0], 0, p[1]);
            this.scene.add(group);
        });
    }

    createCars() {
        const carGeo = new THREE.BoxGeometry(14, 8, 8);
        const carMat = new THREE.MeshStandardMaterial({ color: 0xff5555 });

        for(let i=0; i<3; i++) {
            const car = new THREE.Mesh(carGeo, carMat);
            car.position.set(Math.random()*100 - 50, 6, 120 + Math.random()*100);
            car.castShadow = true;
            this.scene.add(car);
        }
    }

    // --- Buildings (Kept largely same but method calls repositioned) ---

    createKaojaiCore(x, y, z) {
        // ... (Same internal logic, just referencing for safety)
        // I'll rewrite it to ensure it fits the new style if needed, but for now just placement.
        // Actually, let's keep the creature-building, it's unique.

        const group = new THREE.Group();
        const podium = new THREE.Mesh(new THREE.BoxGeometry(160, 20, 120), this.materials.concrete);
        podium.position.y = 10;
        podium.receiveShadow = true;

        // Simplified shape reconstruction for brevity in this patch, but keeping the "Logo" look
        const shape = new THREE.Shape();
        const w = 140, h = 100, r = 20;
        shape.moveTo(-w/2 + r, h/2);
        shape.lineTo(w/2 - r, h/2);
        shape.quadraticCurveTo(w/2, h/2, w/2, h/2 - r);
        shape.lineTo(w/2, -h/2 + r);
        shape.quadraticCurveTo(w/2, -h/2, w/2 - r, -h/2);
        shape.lineTo(-w/2 + r + 50, -h/2);
        shape.lineTo(-w/2 + r, -h/2 - 20); // Tail
        shape.lineTo(-w/2 + r, -h/2);
        shape.quadraticCurveTo(-w/2, -h/2, -w/2, -h/2 + r);
        shape.lineTo(-w/2, h/2 - r);
        shape.quadraticCurveTo(-w/2, h/2, -w/2 + r, h/2);

        const extrudeSettings = { depth: 60, bevelEnabled: true, bevelSegments: 2, bevelSize: 2, bevelThickness: 2 };
        const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        geometry.center();

        const body = new THREE.Mesh(geometry, this.materials.kaojaiBody);
        body.position.y = 20 + h/2 + 10;
        body.castShadow = true;

        // Features
        const featureMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 });
        const eyeGeo = new THREE.CylinderGeometry(15, 15, 5, 32);
        eyeGeo.rotateX(Math.PI / 2);
        const eyeL = new THREE.Mesh(eyeGeo, featureMat);
        eyeL.position.set(-30, body.position.y + 10, 32);
        const eyeR = new THREE.Mesh(eyeGeo, featureMat);
        eyeR.position.set(30, body.position.y + 10, 32);

        group.add(podium, body, eyeL, eyeR);
        group.position.set(x, y, z);
        this.addLabel(group, "KaoJai.ai", 180);
        group.userData = { isBuilding: true, name: "KAOJAI Core" };
        this.scene.add(group);
    }

    createDatabase(x, y, z) {
        const group = new THREE.Group();
        // Server Rack
        const disks = 5;
        const radius = 50;
        const height = 20;

        for(let i=0; i<disks; i++) {
            const disk = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, height, 32), this.materials.dbTank);
            disk.position.y = 10 + i * 22 + 10;
            disk.castShadow = true;
            group.add(disk);

            // Ring
            const ring = new THREE.Mesh(new THREE.TorusGeometry(radius+2, 2, 8, 32), this.materials.dbMetal);
            ring.rotateX(Math.PI/2);
            ring.position.y = disk.position.y;
            group.add(ring);
        }

        // Pipes connecting to ground
        const p = new THREE.Mesh(new THREE.CylinderGeometry(10, 10, 60), this.materials.pipeYellow);
        p.position.set(radius, 30, 0);
        group.add(p);

        group.position.set(x, y, z);
        this.addLabel(group, "DATABASE", 150);
        group.userData = { isBuilding: true, name: "Database" };
        this.scene.add(group);
    }

    createAILab(x, y, z) {
        const group = new THREE.Group();
        // Glass structure
        const w=100, h=140, d=100;
        const glass = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), this.materials.glass);
        glass.position.y = h/2 + 10;
        glass.castShadow = true;

        // Cores
        const core = new THREE.Mesh(new THREE.BoxGeometry(60, 100, 60), this.materials.dbMetal);
        core.position.y = h/2 + 10;

        group.add(core, glass);
        group.position.set(x, y, z);
        this.addLabel(group, "AI LAB", 170);
        group.userData = { isBuilding: true, name: "AI Lab" };
        this.scene.add(group);
    }

    createSocialCubes(x, y, z) {
        const group = new THREE.Group();
        const s = 50;
        const cubes = [
            { mat: this.materials.lineGreen, x: -60, y: 0 },
            { mat: this.materials.fbBlue, x: 0, y: 30 }, // Stacked
            { mat: this.materials.instaPink, x: 60, y: 0 }
        ];

        cubes.forEach(c => {
            const mesh = new THREE.Mesh(new THREE.BoxGeometry(s, s, s), c.mat);
            mesh.position.set(c.x, s/2 + c.y, 0);
            mesh.castShadow = true;
            group.add(mesh);
        });

        group.position.set(x, y, z);
        this.addLabel(group, "Social", 120);
        group.userData = { isBuilding: true, name: "Social Media" };
        this.scene.add(group);
    }

    createShops(x, y, z) {
        const group = new THREE.Group();
        // 2x2 grid of shops
        const s = 60;
        const locs = [[-40, -40], [40, -40], [-40, 40], [40, 40]];

        locs.forEach((l, i) => {
            const g = new THREE.Group();
            const body = new THREE.Mesh(new THREE.BoxGeometry(s, 40, s), this.materials.shopBody);
            body.position.y = 20;
            body.castShadow = true;

            const roof = new THREE.Mesh(new THREE.ConeGeometry(s*0.8, 25, 4), i%2?this.materials.shopRoof1:this.materials.shopRoof2);
            roof.rotateY(Math.PI/4);
            roof.position.y = 52;

            g.add(body, roof);
            g.position.set(l[0], 0, l[1]);
            group.add(g);
        });

        group.position.set(x, y, z);
        this.addLabel(group, "Shops", 100);
        group.userData = { isBuilding: true, name: "Marketplace" };
        this.scene.add(group);
    }

    createEventBus() {
        // Redesigned to fit new layout
        // Connections: Center -> Left (DB), Center -> Right (AI), Center -> Bottom (Social/Shops)

        const group = new THREE.Group();
        const y = 30; // Height of pipes

        // Pipe 1: Center to Left DB (-200, 0, -150)
        this.createPipe(new THREE.Vector3(-60, y, 0), new THREE.Vector3(-200, y, -150), this.materials.pipeYellow, group);

        // Pipe 2: Center to Right AI (200, 0, -100)
        this.createPipe(new THREE.Vector3(60, y, 0), new THREE.Vector3(200, y, -100), this.materials.pipeBlue, group);

        this.scene.add(group);
    }

    createPipe(start, end, mat, parent) {
        const dist = start.distanceTo(end);
        const cyl = new THREE.CylinderGeometry(4, 4, dist, 8);
        cyl.translate(0, dist/2, 0);
        cyl.rotateX(Math.PI/2);
        const mesh = new THREE.Mesh(cyl, mat);
        mesh.position.copy(start);
        mesh.lookAt(end);
        parent.add(mesh);

        // Joint
        const joint = new THREE.Mesh(new THREE.SphereGeometry(6), this.materials.dbMetal);
        joint.position.copy(start);
        parent.add(joint);
    }

    addLabel(parent, text, yOffset) {
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

    update() {
        // Animation logic
    }
}

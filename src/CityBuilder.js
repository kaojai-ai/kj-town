import * as THREE from 'three';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

export class CityBuilder {
    constructor(scene) {
        this.scene = scene;
        this.particles = [];
        this.mixers = [];
        this.clock = new THREE.Clock();

        // Materials Palette based on kj-town.png
        this.materials = {
            grass: new THREE.MeshStandardMaterial({ color: 0x6ccf59, roughness: 0.8 }), // Vibrant Green
            water: new THREE.MeshStandardMaterial({ color: 0x2faaf0, roughness: 0.2, metalness: 0.1 }), // Deep Blue

            // Kaojai Core (Center)
            kaojaiBody: new THREE.MeshStandardMaterial({ color: 0x4db8aa, roughness: 0.3 }), // Teal
            kaojaiFace: new THREE.MeshStandardMaterial({ color: 0x223355, roughness: 0.2 }), // Dark Blue face
            kaojaiEars: new THREE.MeshStandardMaterial({ color: 0xe05e5e }), // Reddish

            // Database (Green Tank)
            dbTank: new THREE.MeshStandardMaterial({ color: 0x76d672, roughness: 0.4 }), // Green
            dbMetal: new THREE.MeshStandardMaterial({ color: 0xaaccdd, metalness: 0.7, roughness: 0.2 }),

            // AI Lab (Glass Building)
            glass: new THREE.MeshPhysicalMaterial({
                color: 0xaaddff,
                metalness: 0.1,
                roughness: 0.05,
                transmission: 0.9, // More transparent
                thickness: 1.0,
                transparent: true
            }),
            concrete: new THREE.MeshStandardMaterial({ color: 0xeeeeee }),

            // Shops
            shopRoof1: new THREE.MeshStandardMaterial({ color: 0xff9933 }), // Orange
            shopRoof2: new THREE.MeshStandardMaterial({ color: 0x3399ff }), // Blue
            shopBody: new THREE.MeshStandardMaterial({ color: 0xfff5e0 }), // Cream

            // Event Bus Pipes (Neon)
            pipeYellow: new THREE.MeshStandardMaterial({ color: 0xffcc00, emissive: 0xffaa00, emissiveIntensity: 0.4 }),
            pipeBlue: new THREE.MeshStandardMaterial({ color: 0x3388ff, emissive: 0x2266cc, emissiveIntensity: 0.4 }),
            pipeRed: new THREE.MeshStandardMaterial({ color: 0xff3333, emissive: 0xcc2222, emissiveIntensity: 0.4 }),

            // Social Cubes
            lineGreen: new THREE.MeshStandardMaterial({ color: 0x06c755 }),
            fbBlue: new THREE.MeshStandardMaterial({ color: 0x1877f2 }),
            instaPink: new THREE.MeshStandardMaterial({ color: 0xe1306c }),

            // Road/Path
            path: new THREE.MeshStandardMaterial({ color: 0xf2d2a9, roughness: 1.0 }), // Sandy path
        };
    }

    build() {
        this.createGround();
        this.createEnvironment();

        // --- Buildings ---
        this.createKaojaiCore(0, 0, 0);       // Center
        this.createDatabase(-300, 0, -200);   // Top Left
        this.createAILab(300, 0, -100);       // Right
        this.createSocialCubes(-300, 0, 200); // Bottom Left
        this.createShops(0, 0, 250);          // Bottom Center

        // Connections
        this.createEventBus();      // Center Left connection
        this.createPaths();
    }

    createPaths() {
        // Simple rectangular paths connecting areas
        const pathMat = this.materials.path;
        const yPos = -18; // Slightly above ground

        const paths = [
            { w: 400, h: 60, x: -150, z: 0 }, // Main Left
            { w: 60, h: 300, x: 0, z: 120 },  // Main Front
            { w: 300, h: 50, x: 150, z: -50 }, // Right Path
            { w: 50, h: 200, x: -300, z: -100 }, // Database connector
        ];

        paths.forEach(p => {
            const mesh = new THREE.Mesh(new THREE.PlaneGeometry(p.w, p.h), pathMat);
            mesh.rotation.x = -Math.PI / 2;
            mesh.position.set(p.x, yPos, p.z);
            mesh.receiveShadow = true;
            this.scene.add(mesh);
        });
    }

    createGround() {
        // Main Grass Platform (Rounded/Cylindrical feel)
        const geometry = new THREE.CylinderGeometry(600, 600, 40, 64);
        const ground = new THREE.Mesh(geometry, this.materials.grass);
        ground.position.y = -20;
        ground.receiveShadow = true;
        this.scene.add(ground);

        // Water base
        const waterGeo = new THREE.CylinderGeometry(1500, 1500, 20, 64);
        const water = new THREE.Mesh(waterGeo, this.materials.water);
        water.position.y = -50;
        this.scene.add(water);
    }

    createEnvironment() {
        // Forest Clusters
        this.createForest(-400, -300, 8);
        this.createForest(350, 250, 6);
        this.createForest(380, -250, 5);
        this.createForest(-380, 250, 6);
        this.createForest(0, -300, 10); // Back center

        // Clouds
        this.createCloud(200, 400, -200);
        this.createCloud(-200, 450, 100);
        this.createCloud(0, 500, 0);
    }

    createForest(x, z, count) {
        for(let i=0; i<count; i++) {
            const ox = (Math.random() - 0.5) * 100;
            const oz = (Math.random() - 0.5) * 100;
            this.createTree(x + ox, 0, z + oz);
        }
    }

    createTree(x, y, z) {
        const trunkGeo = new THREE.CylinderGeometry(4, 6, 20, 6);
        const trunkMat = new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 1.0 });
        const trunk = new THREE.Mesh(trunkGeo, trunkMat);
        trunk.position.set(x, y + 10, z);

        // Voxel/Lowpoly style foliage
        const leavesGeo = new THREE.IcosahedronGeometry(22, 0); // Detail 0 = Low poly
        const leavesMat = new THREE.MeshStandardMaterial({ color: 0x6ccf59, roughness: 0.9, flatShading: true });
        const leaves = new THREE.Mesh(leavesGeo, leavesMat);
        leaves.position.set(x, y + 35, z);

        trunk.castShadow = true;
        leaves.castShadow = true;

        this.scene.add(trunk);
        this.scene.add(leaves);
    }

    createCloud(x, y, z) {
        const cloudGroup = new THREE.Group();
        // Voxel Clouds (Cubes)
        const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, flatShading: true, transparent: true, opacity: 0.9 });

        const positions = [
            [0,0,0, 40],
            [30, 10, 0, 30],
            [-30, 15, 10, 35],
            [20, 20, -10, 25]
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

    // --- Specific Building Architectures ---

    createKaojaiCore(x, y, z) {
        const group = new THREE.Group();

        // Base Podium
        const podium = new THREE.Mesh(new THREE.BoxGeometry(160, 20, 120), this.materials.concrete);
        podium.position.y = 10;
        podium.receiveShadow = true;

        // Main Head Shape (Voxel Style)
        const headW = 120, headH = 100, headD = 90;
        const bodyGeo = new THREE.BoxGeometry(headW, headH, headD);
        const body = new THREE.Mesh(bodyGeo, this.materials.kaojaiBody);
        body.position.y = 20 + headH/2;
        body.castShadow = true;

        // Face Screen (Inset)
        const faceGeo = new THREE.BoxGeometry(headW - 20, headH - 40, 5);
        const face = new THREE.Mesh(faceGeo, this.materials.kaojaiFace);
        face.position.set(0, body.position.y, headD/2 + 2);

        // Eyes (Pixel/Voxel Eyes)
        const eyeSize = 18;
        const eyeGeo = new THREE.BoxGeometry(eyeSize, eyeSize, 5);
        const eyeMat = new THREE.MeshLambertMaterial({ color: 0x00ffff, emissive: 0x00ffff, emissiveIntensity: 0.8 });

        const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
        eyeL.position.set(-25, body.position.y + 10, headD/2 + 4);
        const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
        eyeR.position.set(25, body.position.y + 10, headD/2 + 4);

        // Ears / Antennae Panels
        const earGeo = new THREE.BoxGeometry(10, 60, 60);
        const earL = new THREE.Mesh(earGeo, this.materials.kaojaiEars);
        earL.position.set(-(headW/2 + 5), body.position.y, 0);

        const earR = new THREE.Mesh(earGeo, this.materials.kaojaiEars);
        earR.position.set((headW/2 + 5), body.position.y, 0);

        // Top Antenna
        const antStem = new THREE.Mesh(new THREE.CylinderGeometry(2, 2, 30), this.materials.concrete);
        antStem.position.set(0, body.position.y + headH/2 + 15, 0);
        const antBall = new THREE.Mesh(new THREE.SphereGeometry(8), this.materials.kaojaiEars);
        antBall.position.set(0, body.position.y + headH/2 + 30, 0);

        group.add(podium, body, face, eyeL, eyeR, earL, earR, antStem, antBall);
        group.position.set(x, y, z);

        this.addLabel(group, "KAOJAI", 180);
        group.userData = { isBuilding: true, name: "KAOJAI Core" };
        this.scene.add(group);
    }

    createDatabase(x, y, z) {
        const group = new THREE.Group();

        // Stack of "Servers" instead of one cylinder
        const disks = 5;
        const radius = 50;
        const height = 20;
        const gap = 2;

        for(let i=0; i<disks; i++) {
            const diskGeo = new THREE.CylinderGeometry(radius, radius, height, 32);
            const disk = new THREE.Mesh(diskGeo, this.materials.dbTank);
            const yPos = 10 + i * (height + gap) + height/2;
            disk.position.y = yPos;
            disk.castShadow = true;

            // Ring detail
            const ringGeo = new THREE.TorusGeometry(radius + 2, 2, 8, 32);
            const ring = new THREE.Mesh(ringGeo, this.materials.dbMetal);
            ring.rotateX(Math.PI/2);
            ring.position.y = yPos;

            group.add(disk, ring);
        }

        // Base
        const base = new THREE.Mesh(new THREE.CylinderGeometry(60, 60, 10, 32), this.materials.concrete);
        base.position.y = 5;
        group.add(base);

        group.position.set(x, y, z);
        this.addLabel(group, "DATABASE", 150);
        group.userData = { isBuilding: true, name: "Database Cluster" };
        this.scene.add(group);
    }

    createAILab(x, y, z) {
        const group = new THREE.Group();

        // Glass Box Container
        const width = 100, height = 140, depth = 100;
        const boxGeo = new THREE.BoxGeometry(width, height, depth);
        const glassBox = new THREE.Mesh(boxGeo, this.materials.glass);
        glassBox.position.y = height/2 + 10;
        glassBox.castShadow = true;

        // Internal Tech (floating blocks inside)
        const innerGeo = new THREE.BoxGeometry(60, 10, 60);
        for(let i=0; i<5; i++) {
            const inner = new THREE.Mesh(innerGeo, this.materials.dbMetal);
            inner.position.y = 30 + i * 25;
            group.add(inner);
        }

        // Concrete Frame/Base
        const frameGeo = new THREE.BoxGeometry(width + 4, 10, depth + 4);
        const base = new THREE.Mesh(frameGeo, this.materials.concrete);
        base.position.y = 5;
        const top = new THREE.Mesh(frameGeo, this.materials.concrete);
        top.position.y = height + 15;

        group.add(glassBox, base, top);
        group.position.set(x, y, z);

        this.addLabel(group, "AI LAB", 170);
        group.userData = { isBuilding: true, name: "AI Laboratory" };
        this.scene.add(group);
    }

    createSocialCubes(x, y, z) {
        const group = new THREE.Group();

        const size = 50;
        const gap = 60;

        // LINE Cube
        const line = new THREE.Mesh(new THREE.BoxGeometry(size, size, size), this.materials.lineGreen);
        line.position.set(-gap, size/2, 0);
        line.castShadow = true;

        // FB Cube
        const fb = new THREE.Mesh(new THREE.BoxGeometry(size, size, size), this.materials.fbBlue);
        fb.position.set(0, size/2, gap/2);
        fb.castShadow = true;

        // Insta Cube
        const insta = new THREE.Mesh(new THREE.BoxGeometry(size, size, size), this.materials.instaPink);
        insta.position.set(gap, size/2, 0);
        insta.castShadow = true;

        group.add(line, fb, insta);
        group.position.set(x, y, z);

        this.addLabel(group, "Social Channels", 100);
        group.userData = { isBuilding: true, name: "Social Channels" };
        this.scene.add(group);
    }

    createShops(x, y, z) {
        const group = new THREE.Group();

        const width = 60;
        const height = 40;
        const depth = 60;
        const spacing = 70;

        const titles = ["Booking", "Issues", "FAQ", "Fun"];

        for(let i=0; i<4; i++) {
            const shopGroup = new THREE.Group();

            // Body
            const body = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), this.materials.shopBody);
            body.position.y = height/2;
            body.castShadow = true;

            // Roof (Pyramid)
            const roofGeo = new THREE.ConeGeometry(width * 0.8, 30, 4);
            roofGeo.rotateY(Math.PI / 4); // Align with box
            const mat = i % 2 === 0 ? this.materials.shopRoof1 : this.materials.shopRoof2;
            const roof = new THREE.Mesh(roofGeo, mat);
            roof.position.y = height + 15;

            shopGroup.add(body, roof);

            // Layout in a slight curve or line
            shopGroup.position.set((i - 1.5) * spacing, 0, 0);

            this.addLabel(shopGroup, titles[i], 80);
            shopGroup.userData = { isBuilding: true, name: titles[i] };

            group.add(shopGroup);
        }

        group.position.set(x, y, z);
        this.scene.add(group);
    }

    createEventBus() {
        // Connects Kaojai (0,0,0) to Database (-300, 0, -200) and Social (-300, 0, 200)
        // Using "Pipes" with joints

        const createPipeSegment = (start, end, material) => {
            const direction = new THREE.Vector3().subVectors(end, start);
            const length = direction.length();

            const geometry = new THREE.CylinderGeometry(6, 6, length, 12);
            geometry.translate(0, length / 2, 0);
            geometry.rotateX(Math.PI / 2); // default vertical, rotate to horizontal? No, lookAt handles it.
            // Actually easier to just use lookAt on a cylinder that is typically Y-up.
            // Reset geometry
            const cyl = new THREE.CylinderGeometry(6, 6, length, 12);
            cyl.translate(0, length/2, 0);
            cyl.rotateX(Math.PI / 2);

            const mesh = new THREE.Mesh(cyl, material);
            mesh.position.copy(start);
            mesh.lookAt(end);

            return mesh;
        };

        const group = new THREE.Group();

        // Yellow Pipe (Database)
        const p1 = createPipeSegment(new THREE.Vector3(-60, 40, 0), new THREE.Vector3(-300, 40, -150), this.materials.pipeYellow);
        group.add(p1);

        // Blue Pipe (Social)
        const p2 = createPipeSegment(new THREE.Vector3(-60, 50, 20), new THREE.Vector3(-300, 50, 200), this.materials.pipeBlue);
        group.add(p2);

        // Red Pipe (Shops)
        const p3 = createPipeSegment(new THREE.Vector3(0, 60, 50), new THREE.Vector3(0, 60, 250), this.materials.pipeRed);
        group.add(p3);

        // Add "Nodes" (Joints)
        [p1, p2, p3].forEach(p => {
            const joint = new THREE.Mesh(new THREE.SphereGeometry(10), this.materials.dbMetal);
            joint.position.copy(p.position);
            group.add(joint);
        });

        this.scene.add(group);

        this.addLabel(group, "Event Bus", 80);
        group.position.set(-100, 20, 0); // Offset label center
    }

    createFlowParticles(x, y, z, length) {
        // Simple particles moving along the x-axis
        for(let i=0; i<10; i++) {
            const geo = new THREE.SphereGeometry(3, 8, 8);
            const mat = new THREE.MeshBasicMaterial({ color: 0xffffff });
            const p = new THREE.Mesh(geo, mat);

            p.userData = {
                velocity: 2 + Math.random(),
                limit: length / 2,
                offset: (Math.random() * length) - length/2
            };

            p.position.set(x + p.userData.offset, y + 40 + (Math.random()*20 - 10), z + (Math.random()*20 - 10));
            this.scene.add(p);
            this.particles.push(p);
        }
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
        const delta = this.clock.getDelta();

        // Update particles
        this.particles.forEach(p => {
            p.position.x += p.userData.velocity;
            if(p.position.x > p.userData.limit + p.parent?.position.x) { // Logic simplified for global coords
                 // Reset if it goes too far right
                 // Actually this logic is a bit flawed because particles are in global space but logic depends on local.
                 // Let's just wrap around a fixed range for now based on the EventBus position (-150)
                 if(p.position.x > -50) p.position.x = -250;
            }
        });
    }
}

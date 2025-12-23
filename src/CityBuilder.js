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
            grass: new THREE.MeshLambertMaterial({ color: 0x5dae4e }), // Bright Green
            water: new THREE.MeshLambertMaterial({ color: 0x4fb9e8 }), // Light Blue

            // Kaojai Core (Center)
            kaojaiBody: new THREE.MeshLambertMaterial({ color: 0x66cccc }), // Teal
            kaojaiFace: new THREE.MeshLambertMaterial({ color: 0x334466 }), // Dark Blue face
            kaojaiEars: new THREE.MeshLambertMaterial({ color: 0xcc6666 }), // Reddish

            // Database (Green Tank)
            dbTank: new THREE.MeshLambertMaterial({ color: 0x66cc66 }), // Green
            dbMetal: new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.5, roughness: 0.2 }),

            // AI Lab (Glass Building)
            glass: new THREE.MeshPhysicalMaterial({
                color: 0x88ccff,
                metalness: 0.1,
                roughness: 0.1,
                transmission: 0.6,
                transparent: true
            }),
            concrete: new THREE.MeshLambertMaterial({ color: 0xdddddd }),

            // Shops
            shopRoof1: new THREE.MeshLambertMaterial({ color: 0xffaa55 }), // Orange
            shopRoof2: new THREE.MeshLambertMaterial({ color: 0x55aaff }), // Blue
            shopBody: new THREE.MeshLambertMaterial({ color: 0xffffee }), // Cream

            // Event Bus Pipes
            pipeYellow: new THREE.MeshLambertMaterial({ color: 0xffdd44 }),
            pipeBlue: new THREE.MeshLambertMaterial({ color: 0x4488ff }),
            pipeRed: new THREE.MeshLambertMaterial({ color: 0xff4444 }),

            // Social Cubes
            lineGreen: new THREE.MeshLambertMaterial({ color: 0x06c755 }),
            fbBlue: new THREE.MeshLambertMaterial({ color: 0x1877f2 }),
            instaPink: new THREE.MeshLambertMaterial({ color: 0xd62976 }), // Simplified gradient

            // Road/Path
            path: new THREE.MeshLambertMaterial({ color: 0xeebb99 }), // Sandy path
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
        this.createEventBus(-150, 0, 0);      // Center Left connection
    }

    createGround() {
        // Main Grass Platform
        const geometry = new THREE.BoxGeometry(1000, 40, 800);
        const ground = new THREE.Mesh(geometry, this.materials.grass);
        ground.position.y = -20;
        ground.receiveShadow = true;
        this.scene.add(ground);

        // Water base
        const waterGeo = new THREE.BoxGeometry(1200, 20, 1000);
        const water = new THREE.Mesh(waterGeo, this.materials.water);
        water.position.y = -40;
        this.scene.add(water);
    }

    createEnvironment() {
        // Simple Trees
        const positions = [
            [-400, 0, -300], [-350, 0, -320], [400, 0, -300],
            [350, 0, 300], [-400, 0, 300], [420, 0, 100]
        ];

        positions.forEach(pos => {
            this.createTree(pos[0], pos[1], pos[2]);
        });

        // Clouds (Simple spheres)
        this.createCloud(200, 400, -200);
        this.createCloud(-200, 450, 100);
    }

    createTree(x, y, z) {
        const trunkGeo = new THREE.CylinderGeometry(5, 5, 30, 8);
        const trunkMat = new THREE.MeshLambertMaterial({ color: 0x8b5a2b });
        const trunk = new THREE.Mesh(trunkGeo, trunkMat);
        trunk.position.set(x, y + 15, z);

        const leavesGeo = new THREE.DodecahedronGeometry(25);
        const leavesMat = new THREE.MeshLambertMaterial({ color: 0x4dae4e });
        const leaves = new THREE.Mesh(leavesGeo, leavesMat);
        leaves.position.set(x, y + 45, z);

        trunk.castShadow = true;
        leaves.castShadow = true;

        this.scene.add(trunk);
        this.scene.add(leaves);
    }

    createCloud(x, y, z) {
        const cloudGroup = new THREE.Group();
        const mat = new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 });

        const p1 = new THREE.Mesh(new THREE.SphereGeometry(40, 16, 16), mat);
        const p2 = new THREE.Mesh(new THREE.SphereGeometry(30, 16, 16), mat);
        p2.position.set(30, 10, 0);
        const p3 = new THREE.Mesh(new THREE.SphereGeometry(35, 16, 16), mat);
        p3.position.set(-25, 5, 0);

        cloudGroup.add(p1, p2, p3);
        cloudGroup.position.set(x, y, z);
        this.scene.add(cloudGroup);

        // Animate cloud slightly?
        // We'll leave it static for now to keep performance high
    }

    // --- Specific Building Architectures ---

    createKaojaiCore(x, y, z) {
        const group = new THREE.Group();

        // Main Body (Robot Head Shape)
        const bodyGeo = new THREE.BoxGeometry(140, 120, 100);
        const body = new THREE.Mesh(bodyGeo, this.materials.kaojaiBody);
        body.position.y = 60;
        body.castShadow = true;
        body.receiveShadow = true;

        // Face Screen
        const faceGeo = new THREE.BoxGeometry(100, 60, 5);
        const face = new THREE.Mesh(faceGeo, this.materials.kaojaiFace);
        face.position.set(0, 60, 50); // Slightly forward

        // Eyes (Cylinders)
        const eyeGeo = new THREE.CylinderGeometry(15, 15, 10, 32);
        eyeGeo.rotateX(Math.PI / 2);
        const eyeMat = new THREE.MeshLambertMaterial({ color: 0x00ffff, emissive: 0x00ffff, emissiveIntensity: 0.5 });

        const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
        eyeL.position.set(-25, 60, 55);

        const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
        eyeR.position.set(25, 60, 55);

        // Antennae / Ears
        const earGeo = new THREE.BoxGeometry(20, 40, 20);
        const earL = new THREE.Mesh(earGeo, this.materials.kaojaiEars);
        earL.position.set(-80, 60, 0);
        const earR = new THREE.Mesh(earGeo, this.materials.kaojaiEars);
        earR.position.set(80, 60, 0);

        group.add(body, face, eyeL, eyeR, earL, earR);
        group.position.set(x, y, z);

        // Label
        this.addLabel(group, "KAOJAI", 150);

        group.userData = { isBuilding: true, name: "KAOJAI Core" };
        this.scene.add(group);
    }

    createDatabase(x, y, z) {
        const group = new THREE.Group();

        // Main Cylinder Tank
        const tankGeo = new THREE.CylinderGeometry(60, 60, 120, 32);
        const tank = new THREE.Mesh(tankGeo, this.materials.dbTank);
        tank.position.y = 60;
        tank.castShadow = true;

        // Metal Bands
        const bandGeo = new THREE.CylinderGeometry(61, 61, 10, 32);
        const band1 = new THREE.Mesh(bandGeo, this.materials.dbMetal);
        band1.position.y = 30;
        const band2 = new THREE.Mesh(bandGeo, this.materials.dbMetal);
        band2.position.y = 90;

        // Top Dome
        const domeGeo = new THREE.SphereGeometry(60, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
        const dome = new THREE.Mesh(domeGeo, this.materials.dbTank);
        dome.position.y = 120;

        group.add(tank, band1, band2, dome);
        group.position.set(x, y, z);

        this.addLabel(group, "DATABASE", 190);

        group.userData = { isBuilding: true, name: "Database Cluster" };
        this.scene.add(group);
    }

    createAILab(x, y, z) {
        const group = new THREE.Group();

        // Modern Slanted Building
        const shape = new THREE.Shape();
        shape.moveTo(0, 0);
        shape.lineTo(100, 0);
        shape.lineTo(100, 150); // Tall side
        shape.lineTo(0, 100);   // Short side
        shape.lineTo(0, 0);

        const extrudeSettings = { depth: 80, bevelEnabled: false };
        const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        geo.center(); // Center the geometry

        const building = new THREE.Mesh(geo, this.materials.glass);
        building.position.y = 75; // Adjust based on height
        building.castShadow = true;

        // Concrete Base
        const baseGeo = new THREE.BoxGeometry(120, 20, 100);
        const base = new THREE.Mesh(baseGeo, this.materials.concrete);
        base.position.y = 10;

        group.add(building, base);
        group.position.set(x, y, z);

        this.addLabel(group, "AI LAB", 160);

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

    createEventBus(x, y, z) {
        const group = new THREE.Group();

        // Represents the "Pipes" connecting things
        const pipeRadius = 8;
        const pipeLen = 200;

        const p1 = new THREE.Mesh(new THREE.CylinderGeometry(pipeRadius, pipeRadius, pipeLen, 16), this.materials.pipeYellow);
        p1.rotateZ(Math.PI / 2);
        p1.position.set(0, 20, 0);

        const p2 = new THREE.Mesh(new THREE.CylinderGeometry(pipeRadius, pipeRadius, pipeLen, 16), this.materials.pipeBlue);
        p2.rotateZ(Math.PI / 2);
        p2.position.set(20, 40, 10);

        const p3 = new THREE.Mesh(new THREE.CylinderGeometry(pipeRadius, pipeRadius, pipeLen, 16), this.materials.pipeRed);
        p3.rotateZ(Math.PI / 2);
        p3.position.set(-20, 60, -10);

        group.add(p1, p2, p3);
        group.position.set(x, y, z);

        this.addLabel(group, "EVENT BUS", 80);
        group.userData = { isBuilding: true, name: "Event Bus System" };
        this.scene.add(group);

        // Add animated particles flowing through pipes later?
        this.createFlowParticles(x, y, z, pipeLen);
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

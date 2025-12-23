import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { CityBuilder } from './CityBuilder.js';

// --- Scene Setup ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB); // Sky Blue
// scene.fog = new THREE.Fog(0x87CEEB, 200, 2000); // Soft fog

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
camera.position.set(0, 400, 800); // Frontal view slightly elevated
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
document.body.appendChild(renderer.domElement);

const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0px';
labelRenderer.domElement.style.pointerEvents = 'none';
document.body.appendChild(labelRenderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxPolarAngle = Math.PI / 2 - 0.05; // Don't go below ground
controls.minDistance = 100;
controls.maxDistance = 2000;
controls.autoRotate = false; // Disable auto rotate for user to inspect details

// --- Lighting (Sunny Day) ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
dirLight.position.set(300, 800, 500);
dirLight.castShadow = true;
dirLight.shadow.mapSize.width = 2048;
dirLight.shadow.mapSize.height = 2048;
dirLight.shadow.camera.near = 0.5;
dirLight.shadow.camera.far = 3000;
const d = 1000;
dirLight.shadow.camera.left = -d;
dirLight.shadow.camera.right = d;
dirLight.shadow.camera.top = d;
dirLight.shadow.camera.bottom = -d;
scene.add(dirLight);

const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
hemiLight.position.set(0, 200, 0);
scene.add(hemiLight);


// --- City Generation ---
const cityBuilder = new CityBuilder(scene);
cityBuilder.build();


// --- Interaction ---
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let INTERSECTED;

// Create tooltip
const tooltip = document.createElement('div');
tooltip.id = 'tooltip';
tooltip.style.position = 'absolute';
tooltip.style.background = 'rgba(255, 255, 255, 0.9)';
tooltip.style.color = '#000';
tooltip.style.padding = '10px';
tooltip.style.borderRadius = '8px';
tooltip.style.pointerEvents = 'none';
tooltip.style.display = 'none';
tooltip.style.border = '1px solid #ccc';
tooltip.style.fontFamily = 'sans-serif';
tooltip.style.zIndex = '1000';
tooltip.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
document.body.appendChild(tooltip);

function onPointerMove( event ) {
	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    tooltip.style.left = event.clientX + 15 + 'px';
    tooltip.style.top = event.clientY + 15 + 'px';
}

function onClick(event) {
    // Interaction logic
}

window.addEventListener( 'pointermove', onPointerMove );
window.addEventListener( 'mousedown', onClick );


// --- Animation Loop ---
function animate() {
    requestAnimationFrame(animate);

    cityBuilder.update(); // Update particles
    controls.update();

    // Raycasting
    raycaster.setFromCamera( mouse, camera );
    const intersects = raycaster.intersectObjects( scene.children, true ); // Recursive for Groups

    if ( intersects.length > 0 ) {
        let target = null;
        // Traverse up to find the root group with userData
        let obj = intersects[0].object;
        while(obj) {
            if(obj.userData && obj.userData.isBuilding) {
                target = obj;
                break;
            }
            obj = obj.parent;
        }

        if ( target ) {
             tooltip.style.display = 'block';
             tooltip.innerHTML = `<strong>${target.userData.name}</strong><br>Status: Online`;
        } else {
            tooltip.style.display = 'none';
        }
    } else {
        tooltip.style.display = 'none';
    }

    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
}

// --- Resize Handling ---
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
});

animate();

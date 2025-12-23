import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { CityBuilder } from './CityBuilder.js';

// --- Scene Setup ---
const scene = new THREE.Scene();
const skyColor = 0x87CEEB;
scene.background = new THREE.Color(skyColor);
scene.fog = new THREE.Fog(skyColor, 500, 2000); // Atmospheric depth

// --- Camera (Isometric) ---
const aspect = window.innerWidth / window.innerHeight;
const frustumSize = 1000;
const camera = new THREE.OrthographicCamera(
    frustumSize * aspect / -2,
    frustumSize * aspect / 2,
    frustumSize / 2,
    frustumSize / -2,
    1,
    5000
);
// Isometric angle: Look from a corner
camera.position.set(500, 500, 500);
camera.lookAt(0, 0, 0);
camera.zoom = 1.2;
camera.updateProjectionMatrix();

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Cap pixel ratio for perf
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Softer shadows
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
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
controls.enableZoom = true;
controls.maxPolarAngle = Math.PI / 2; // Prevent going under ground
controls.autoRotate = false;

// --- Lighting ---
// Ambient for base visibility
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);

// Hemisphere for nice gradient (Sky vs Ground reflection)
const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.5);
hemiLight.position.set(0, 500, 0);
scene.add(hemiLight);

// Directional Sun (Key Light)
const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
dirLight.position.set(-300, 500, 200); // Light coming from top-left-ish
dirLight.castShadow = true;
// High res shadow map
dirLight.shadow.mapSize.width = 2048;
dirLight.shadow.mapSize.height = 2048;
dirLight.shadow.bias = -0.0005;
// Fit shadow camera to scene
const d = 800;
dirLight.shadow.camera.left = -d;
dirLight.shadow.camera.right = d;
dirLight.shadow.camera.top = d;
dirLight.shadow.camera.bottom = -d;
dirLight.shadow.camera.near = 0.5;
dirLight.shadow.camera.far = 2000;
scene.add(dirLight);


// --- City Generation ---
const cityBuilder = new CityBuilder(scene);
cityBuilder.build();


// --- Interaction ---
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

const tooltip = document.createElement('div');
tooltip.id = 'tooltip';
Object.assign(tooltip.style, {
    position: 'absolute',
    background: 'rgba(255, 255, 255, 0.95)',
    color: '#333',
    padding: '8px 12px',
    borderRadius: '6px',
    pointerEvents: 'none',
    display: 'none',
    border: '1px solid #ddd',
    fontFamily: 'Segoe UI, sans-serif',
    fontSize: '13px',
    zIndex: '1000',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
});
document.body.appendChild(tooltip);

function onPointerMove( event ) {
	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    tooltip.style.left = event.clientX + 15 + 'px';
    tooltip.style.top = event.clientY + 15 + 'px';
}

window.addEventListener( 'pointermove', onPointerMove );

// --- Animation Loop ---
function animate() {
    requestAnimationFrame(animate);

    cityBuilder.update();
    controls.update();

    // Raycasting
    raycaster.setFromCamera( mouse, camera );
    const intersects = raycaster.intersectObjects( scene.children, true );

    let target = null;
    if ( intersects.length > 0 ) {
        let obj = intersects[0].object;
        while(obj) {
            if(obj.userData && obj.userData.isBuilding) {
                target = obj;
                break;
            }
            obj = obj.parent;
        }
    }

    if ( target ) {
         tooltip.style.display = 'block';
         tooltip.innerHTML = `<strong>${target.userData.name}</strong>`;
         document.body.style.cursor = 'pointer';
    } else {
        tooltip.style.display = 'none';
        document.body.style.cursor = 'default';
    }

    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
}

// --- Resize Handling ---
window.addEventListener('resize', () => {
    const aspect = window.innerWidth / window.innerHeight;

    // Update orthographic frustum
    camera.left = -frustumSize * aspect / 2;
    camera.right = frustumSize * aspect / 2;
    camera.top = frustumSize / 2;
    camera.bottom = -frustumSize / 2;

    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
});

animate();

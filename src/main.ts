import * as THREE from 'three';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

import { CityBuilder } from './simulation';

import {
    entityById,
} from './town/townData';


// ------------------------------------------------
// Scene
// ------------------------------------------------

const scene =
    new THREE.Scene();

const skyColor =
    0x87ceeb;

scene.background =
    new THREE.Color(
        skyColor
    );

scene.fog =
    new THREE.Fog(
        skyColor,
        500,
        2000
    );


// ------------------------------------------------
// Camera
// ------------------------------------------------

const aspect =
    window.innerWidth /
    window.innerHeight;

const frustumSize =
    1000;

const camera =
    new THREE.OrthographicCamera(
        (frustumSize * aspect) / -2,
        (frustumSize * aspect) / 2,
        frustumSize / 2,
        frustumSize / -2,
        1,
        5000
    );

camera.position.set(
    500,
    500,
    500
);

camera.lookAt(
    0,
    0,
    0
);

camera.zoom =
    1.2;

camera.updateProjectionMatrix();


// ------------------------------------------------
// Renderer
// ------------------------------------------------

const renderer =
    new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
    });

renderer.setSize(
    window.innerWidth,
    window.innerHeight
);

renderer.setPixelRatio(
    Math.min(
        window.devicePixelRatio,
        2
    )
);

renderer.shadowMap.enabled =
    true;

renderer.shadowMap.type =
    THREE.PCFSoftShadowMap;

renderer.toneMapping =
    THREE.ACESFilmicToneMapping;

renderer.toneMappingExposure =
    1.1;

document.body.appendChild(
    renderer.domElement
);


// ------------------------------------------------
// Labels
// ------------------------------------------------

const labelRenderer =
    new CSS2DRenderer();

labelRenderer.setSize(
    window.innerWidth,
    window.innerHeight
);

labelRenderer.domElement.style.position =
    'absolute';

labelRenderer.domElement.style.top =
    '0px';

labelRenderer.domElement.style.pointerEvents =
    'none';

document.body.appendChild(
    labelRenderer.domElement
);


// ------------------------------------------------
// Controls
// ------------------------------------------------

const controls =
    new OrbitControls(
        camera,
        renderer.domElement
    );

controls.enableDamping =
    true;

controls.dampingFactor =
    0.05;

controls.enableZoom =
    true;

controls.maxPolarAngle =
    Math.PI / 2;

controls.autoRotate =
    false;


// ------------------------------------------------
// Lights
// ------------------------------------------------

const ambientLight =
    new THREE.AmbientLight(
        0xffffff,
        0.7
    );

scene.add(
    ambientLight
);


const hemiLight =
    new THREE.HemisphereLight(
        0xffffff,
        0x444444,
        0.5
    );

hemiLight.position.set(
    0,
    500,
    0
);

scene.add(
    hemiLight
);


const dirLight =
    new THREE.DirectionalLight(
        0xffffff,
        1.0
    );

dirLight.position.set(
    -300,
    500,
    200
);

dirLight.castShadow =
    true;

dirLight.shadow.mapSize.width =
    2048;

dirLight.shadow.mapSize.height =
    2048;

dirLight.shadow.bias =
    -0.0005;

const d =
    800;

dirLight.shadow.camera.left =
    -d;

dirLight.shadow.camera.right =
    d;

dirLight.shadow.camera.top =
    d;

dirLight.shadow.camera.bottom =
    -d;

dirLight.shadow.camera.near =
    0.5;

dirLight.shadow.camera.far =
    2000;

scene.add(
    dirLight
);


// ------------------------------------------------
// City
// IMPORTANT: ส่ง camera เข้า builder
// ------------------------------------------------

const cityBuilder =
    new CityBuilder(
        scene,
        camera
    );

cityBuilder.build();


// ------------------------------------------------
// Interaction
// ------------------------------------------------

const raycaster =
    new THREE.Raycaster();

const mouse =
    new THREE.Vector2();


const tooltip =
    document.createElement(
        'div'
    );

tooltip.id =
    'tooltip';

Object.assign(
    tooltip.style,
    {
        position: 'absolute',
        background:
            'rgba(255,255,255,0.95)',
        color: '#333',
        padding: '8px 12px',
        borderRadius: '6px',
        pointerEvents: 'none',
        display: 'none',
        border:
            '1px solid #ddd',
        fontFamily:
            'Segoe UI, sans-serif',
        fontSize: '13px',
        zIndex: '1000',
        boxShadow:
            '0 4px 12px rgba(0,0,0,0.1)',
    }
);

document.body.appendChild(
    tooltip
);


function onPointerMove(
    event: PointerEvent
) {
    mouse.x =
        (event.clientX /
            window.innerWidth) *
            2 -
        1;

    mouse.y =
        -(
            event.clientY /
            window.innerHeight
        ) *
            2 +
        1;

    tooltip.style.left =
        event.clientX +
        15 +
        'px';

    tooltip.style.top =
        event.clientY +
        15 +
        'px';
}

window.addEventListener(
    'pointermove',
    onPointerMove
);


// ------------------------------------------------
// Animation
// ------------------------------------------------

function animate() {
    requestAnimationFrame(
        animate
    );

    cityBuilder.update();

    controls.update();


    raycaster.setFromCamera(
        mouse,
        camera
    );

    const intersects =
        raycaster.intersectObjects(
            scene.children,
            true
        );

    let entityId:
        | string
        | null = null;


    if (
        intersects.length > 0
    ) {
        let obj =
            intersects[0]
                .object;

        while (obj) {
            if (
                obj.userData
                    ?.entityId
            ) {
                entityId =
                    obj.userData
                        .entityId;

                break;
            }

            obj =
                obj.parent as THREE.Object3D;
        }
    }


    if (entityId) {
        const entity =
            entityById.get(
                entityId
            );

        if (entity) {
            tooltip.style.display =
                'block';

            tooltip.innerHTML = `
                <strong>${entity.name}</strong>
                <br/>
                ${entity.summary}
            `;

            document.body.style.cursor =
                'pointer';
        }
    } else {
        tooltip.style.display =
            'none';

        document.body.style.cursor =
            'default';
    }


    renderer.render(
        scene,
        camera
    );

    labelRenderer.render(
        scene,
        camera
    );
}


// ------------------------------------------------
// Resize
// ------------------------------------------------

window.addEventListener(
    'resize',
    () => {
        const aspect =
            window.innerWidth /
            window.innerHeight;

        camera.left =
            (-frustumSize *
                aspect) /
            2;

        camera.right =
            (frustumSize *
                aspect) /
            2;

        camera.top =
            frustumSize /
            2;

        camera.bottom =
            frustumSize /
            -2;

        camera.updateProjectionMatrix();

        renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );

        labelRenderer.setSize(
            window.innerWidth,
            window.innerHeight
        );
    }
);


animate();

import { KeyboardControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import {
    Bloom,
    EffectComposer,
    Vignette,
} from '@react-three/postprocessing';
import { Physics } from '@react-three/rapier';
import {
    Suspense,
    useMemo,
    useRef,
    useState,
} from 'react';

import { Hud } from './components/Hud';
import { TownWorld } from './components/TownWorld';

import type { InteractionState } from './town/geometry';

import {
    entityById,
    townDistricts,
    townEntities,
} from './town/townData';

type ControlName =
    | 'forward'
    | 'back'
    | 'left'
    | 'right'
    | 'interact'
    | 'close';

export function App() {
    const shellRef =
        useRef<HTMLElement>(null);

    const [
        selectedEntityId,
        setSelectedEntityId,
    ] = useState<string | null>(null);

    const [
        travelTargetEntityId,
        setTravelTargetEntityId,
    ] = useState<string | null>(null);

    const [
        activeDistrictId,
        setActiveDistrictId,
    ] = useState<string | null>(null);

    const [
        interaction,
        setInteraction,
    ] = useState<InteractionState>({
        nearestEntityId: null,
        playerPosition: [0, 0, 310],
    });

    const controls =
        useMemo(
            () => [
                {
                    name: 'forward' as ControlName,
                    keys: [
                        'ArrowUp',
                        'KeyW',
                    ],
                },
                {
                    name: 'back' as ControlName,
                    keys: [
                        'ArrowDown',
                        'KeyS',
                    ],
                },
                {
                    name: 'left' as ControlName,
                    keys: [
                        'ArrowLeft',
                        'KeyA',
                    ],
                },
                {
                    name: 'right' as ControlName,
                    keys: [
                        'ArrowRight',
                        'KeyD',
                    ],
                },
                {
                    name: 'interact' as ControlName,
                    keys: [
                        'KeyE',
                        'Enter',
                    ],
                },
                {
                    name: 'close' as ControlName,
                    keys: ['Escape'],
                },
            ],
            []
        );

    const selectedEntity =
        selectedEntityId
            ? entityById.get(
                  selectedEntityId
              ) ?? null
            : null;

    const nearestEntity =
        interaction.nearestEntityId
            ? entityById.get(
                  interaction.nearestEntityId
              ) ?? null
            : null;

    const handleTravelTarget = (
        entityId: string | null
    ) => {
        setSelectedEntityId(null);
        setTravelTargetEntityId(
            entityId
        );
    };

    const handleNavigatorSelect = (
        entityId: string
    ) => {
        setSelectedEntityId(entityId);
        setTravelTargetEntityId(
            entityId
        );
    };

    return (
        <KeyboardControls
            map={controls}
        >
            <main
                ref={shellRef}
                className={
                    selectedEntity
                        ? 'app-shell hud-panel-open'
                        : 'app-shell'
                }
            >
                <Canvas
                    camera={{
                        position: [
                            0,
                            250,
                            520,
                        ],
                        fov: 52,
                        near: 1,
                        far: 2400,
                    }}
                    dpr={[1, 2]}
                    gl={{
                        antialias: true,
                        alpha: false,
                    }}
                    shadows
                    fallback={
                        <div className="webgl-fallback">
                            WebGL is not
                            available.
                        </div>
                    }
                >
                    <color
                        attach="background"
                        args={['#78bff2']}
                    />

                    <fog
                        attach="fog"
                        args={[
                            '#a8d8f6',
                            920,
                            2050,
                        ]}
                    />

                    <Suspense
                        fallback={null}
                    >
                        <Physics
                            colliders={false}
                            gravity={[
                                0,
                                -9.81,
                                0,
                            ]}
                        >
                            <TownWorld
                                selectedEntityId={
                                    selectedEntityId
                                }
                                setSelectedEntityId={
                                    setSelectedEntityId
                                }
                                setInteraction={
                                    setInteraction
                                }
                                travelTargetEntityId={
                                    travelTargetEntityId
                                }
                                setTravelTargetEntityId={
                                    handleTravelTarget
                                }
                            />
                        </Physics>

                        <EffectComposer
                            multisampling={0}
                        >
                            <Bloom
                                luminanceThreshold={
                                    0.78
                                }
                                intensity={
                                    0.42
                                }
                                mipmapBlur
                            />

                            <Vignette
                                darkness={
                                    0.18
                                }
                                offset={
                                    0.24
                                }
                            />
                        </EffectComposer>
                    </Suspense>
                </Canvas>

                <DistrictNavigator
                    activeDistrictId={
                        activeDistrictId
                    }
                    selectedEntityId={
                        selectedEntityId
                    }
                    onSelectDistrict={
                        setActiveDistrictId
                    }
                    onSelectEntity={
                        handleNavigatorSelect
                    }
                />

                <Hud
                    selectedEntity={
                        selectedEntity
                    }
                    nearestEntity={
                        nearestEntity
                    }
                    onClose={() =>
                        setSelectedEntityId(
                            null
                        )
                    }
                    onSelect={(
                        entityId
                    ) =>
                        setSelectedEntityId(
                            entityId
                        )
                    }
                />
            </main>
        </KeyboardControls>
    );
}

function DistrictNavigator({
    activeDistrictId,
    selectedEntityId,
    onSelectDistrict,
    onSelectEntity,
}: {
    activeDistrictId: string | null;
    selectedEntityId: string | null;
    onSelectDistrict: (
        districtId: string | null
    ) => void;
    onSelectEntity: (
        entityId: string
    ) => void;
}) {
    const [
        collapsed,
        setCollapsed,
    ] = useState(false);

    const visibleDistricts =
        activeDistrictId === null
            ? townDistricts
            : townDistricts.filter(
                  (district) =>
                      district.id ===
                      activeDistrictId
              );

    if (collapsed) {
        return (
            <button
                type="button"
                className="district-navigator-toggle"
                onClick={() =>
                    setCollapsed(false)
                }
            >
                Explore districts
            </button>
        );
    }

    return (
        <aside className="district-navigator">
            <div className="district-navigator__topbar">
                <div className="district-navigator__header">
                    <p className="district-navigator__eyebrow">
                        Explore KJ Town
                    </p>

                    <h2>
                        District Navigator
                    </h2>

                    <p>
                        Choose a category
                        to see related
                        systems clearly.
                    </p>
                </div>

                <button
                    type="button"
                    className="district-navigator__collapse"
                    onClick={() =>
                        setCollapsed(
                            true
                        )
                    }
                    aria-label="Hide district navigator"
                >
                    Hide
                </button>
            </div>

            <div className="district-navigator__tabs">
                <button
                    type="button"
                    className={
                        activeDistrictId ===
                        null
                            ? 'active'
                            : ''
                    }
                    onClick={() =>
                        onSelectDistrict(
                            null
                        )
                    }
                >
                    All
                </button>

                {townDistricts.map(
                    (district) => (
                        <button
                            key={
                                district.id
                            }
                            type="button"
                            className={
                                activeDistrictId ===
                                district.id
                                    ? 'active'
                                    : ''
                            }
                            onClick={() =>
                                onSelectDistrict(
                                    district.id
                                )
                            }
                        >
                            {
                                district.name
                            }
                        </button>
                    )
                )}
            </div>

            <div className="district-navigator__groups">
                {visibleDistricts.map(
                    (district) => {
                        const districtEntities =
                            townEntities.filter(
                                (
                                    entity
                                ) =>
                                    entity.clusterId ===
                                    district.id
                            );

                        return (
                            <section
                                key={
                                    district.id
                                }
                                className="district-navigator__group"
                            >
                                <div className="district-navigator__group-title">
                                    <span
                                        style={{
                                            background:
                                                district.color,
                                        }}
                                    />

                                    <strong>
                                        {
                                            district.name
                                        }
                                    </strong>
                                </div>

                                <p className="district-navigator__description">
                                    {
                                        district.description
                                    }
                                </p>

                                <div className="district-navigator__items">
                                    {districtEntities.map(
                                        (
                                            entity
                                        ) => (
                                            <button
                                                key={
                                                    entity.id
                                                }
                                                type="button"
                                                className={
                                                    selectedEntityId ===
                                                    entity.id
                                                        ? 'active'
                                                        : ''
                                                }
                                                onClick={() =>
                                                    onSelectEntity(
                                                        entity.id
                                                    )
                                                }
                                            >
                                                <span>
                                                    {
                                                        entity.name
                                                    }
                                                </span>

                                                <small>
                                                    {
                                                        entity.kind
                                                    }{' '}
                                                    ·{' '}
                                                    {
                                                        entity.tier
                                                    }
                                                </small>
                                            </button>
                                        )
                                    )}
                                </div>
                            </section>
                        );
                    }
                )}
            </div>
        </aside>
    );
}
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
import {
    defaultTownExplorerFilters,
    filterTownEntities,
    hasActiveTownExplorerFilters,
    type TownExplorerFilters,
} from './town/explorer';
import {
    getTownSystemOverview,
    sortTownEntitiesForNavigator,
} from './town/systemStats';

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
        explorerFilters,
        setExplorerFilters,
    ] = useState<TownExplorerFilters>(
        defaultTownExplorerFilters
    );

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
                <div className="canvas-stage">
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
                        </Suspense>

                        <Suspense
                            fallback={null}
                        >
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
                </div>

                <DistrictNavigator
                    activeDistrictId={
                        activeDistrictId
                    }
                    filters={
                        explorerFilters
                    }
                    selectedEntityId={
                        selectedEntityId
                    }
                    onSelectDistrict={
                        setActiveDistrictId
                    }
                    onFiltersChange={
                        setExplorerFilters
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
    filters,
    selectedEntityId,
    onSelectDistrict,
    onFiltersChange,
    onSelectEntity,
}: {
    activeDistrictId: string | null;
    filters: TownExplorerFilters;
    selectedEntityId: string | null;
    onSelectDistrict: (
        districtId: string | null
    ) => void;
    onFiltersChange: (
        filters: TownExplorerFilters
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

    const filteredEntities =
        useMemo(
            () =>
                filterTownEntities(
                    townEntities,
                    filters
                ),
            [filters]
        );

    const systemOverview =
        useMemo(
            () =>
                getTownSystemOverview(
                    townDistricts,
                    townEntities,
                    filteredEntities
                ),
            [filteredEntities]
        );

    const visibleEntityCount =
        filteredEntities.filter(
            (entity) =>
                activeDistrictId ===
                    null ||
                entity.clusterId ===
                    activeDistrictId
        ).length;

    const filtersActive =
        hasActiveTownExplorerFilters(
            filters
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

            <div className="district-navigator__overview" aria-label="Town system overview">
                <div>
                    <strong>
                        {systemOverview.visibleEntities}
                    </strong>
                    <span>
                        of {systemOverview.totalEntities} systems
                    </span>
                </div>
                <div>
                    <strong>
                        {systemOverview.statusCounts.resilient}
                    </strong>
                    <span>
                        resilient
                    </span>
                </div>
                <div>
                    <strong>
                        {systemOverview.tierCounts.critical}
                    </strong>
                    <span>
                        critical
                    </span>
                </div>
            </div>

            <div className="district-navigator__search">
                <label htmlFor="district-navigator-search">
                    Find systems
                </label>
                <input
                    id="district-navigator-search"
                    type="search"
                    value={filters.query}
                    placeholder="Search by name, role, or flow"
                    onChange={(event) =>
                        onFiltersChange({
                            ...filters,
                            query: event
                                .target
                                .value,
                        })
                    }
                />
            </div>

            <div className="district-navigator__filters">
                <label>
                    <span>Tier</span>
                    <select
                        value={filters.tier}
                        onChange={(event) =>
                            onFiltersChange({
                                ...filters,
                                tier: event
                                    .target
                                    .value as TownExplorerFilters['tier'],
                            })
                        }
                    >
                        <option value="all">
                            All
                        </option>
                        <option value="foundation">
                            Foundation
                        </option>
                        <option value="critical">
                            Critical
                        </option>
                        <option value="business">
                            Business
                        </option>
                        <option value="edge">
                            Edge
                        </option>
                    </select>
                </label>

                <label>
                    <span>Status</span>
                    <select
                        value={filters.status}
                        onChange={(event) =>
                            onFiltersChange({
                                ...filters,
                                status: event
                                    .target
                                    .value as TownExplorerFilters['status'],
                            })
                        }
                    >
                        <option value="all">
                            All
                        </option>
                        <option value="resilient">
                            Resilient
                        </option>
                        <option value="operational">
                            Operational
                        </option>
                        <option value="observed">
                            Observed
                        </option>
                    </select>
                </label>

                {filtersActive ? (
                    <button
                        type="button"
                        onClick={() =>
                            onFiltersChange(
                                defaultTownExplorerFilters
                            )
                        }
                    >
                        Clear
                    </button>
                ) : null}
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
                            <small>
                                {
                                    systemOverview.districtSummaries.find(
                                        (summary) =>
                                            summary.id ===
                                            district.id
                                    )?.visibleEntities ?? 0
                                }
                            </small>
                        </button>
                    )
                )}
            </div>

            <div className="district-navigator__groups">
                {visibleEntityCount === 0 ? (
                    <div className="district-navigator__empty">
                        No matching systems.
                    </div>
                ) : null}

                {visibleDistricts.map(
                    (district) => {
                        const districtEntities =
                            sortTownEntitiesForNavigator(
                                filteredEntities.filter(
                                    (
                                        entity
                                    ) =>
                                        entity.clusterId ===
                                        district.id
                                )
                            );

                        if (
                            districtEntities.length ===
                            0
                        ) {
                            return null;
                        }

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
                                    <small>
                                        {
                                            districtEntities.length
                                        } / {
                                            systemOverview.districtSummaries.find(
                                                (summary) =>
                                                    summary.id ===
                                                    district.id
                                            )?.totalEntities ?? 0
                                        }
                                    </small>
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
                                                    }{' '}
                                                    ·{' '}
                                                    {
                                                        entity.status
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

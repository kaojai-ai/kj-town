import { OrbitControls, Text, useKeyboardControls } from '@react-three/drei';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { CuboidCollider, RigidBody, type RapierRigidBody } from '@react-three/rapier';
import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three/examples/jsm/controls/OrbitControls.js';
import { distance2d, findNearestEntity, midpoint, resolveBlockedPosition, type InteractionState } from '../town/geometry';
import { townDistricts, townEntities, type TownEntity, type Vec3 } from '../town/townData';

interface TownWorldProps {
    selectedEntityId: string | null;
    setSelectedEntityId: (entityId: string | null) => void;
    setInteraction: (state: InteractionState) => void;
    travelTargetEntityId: string | null;
    setTravelTargetEntityId: (entityId: string | null) => void;
}

type ControlName = 'forward' | 'back' | 'left' | 'right' | 'interact' | 'close';

interface PlayerCameraState {
    position: THREE.Vector3;
    yaw: number;
    keyboardNavigating: boolean;
}

interface PlayerCameraRef {
    current: PlayerCameraState;
}

const connectionPairs = townEntities.flatMap((entity) =>
    entity.connections.map((targetId) => ({ sourceId: entity.id, targetId }))
);

const unifiedInboxPosition: Vec3 = [-420, 0, 120];

const inboundSignalConfigs: readonly { start: Vec3; color: string; height: number; speed: number; phase: number }[] = [
    { start: [-850, 0, -250], color: '#ff4b5c', height: 180, speed: 0.18, phase: 0 },
    { start: [-860, 0, -130], color: '#ff9d23', height: 205, speed: 0.16, phase: 0.18 },
    { start: [-880, 0, 10], color: '#ffd33d', height: 220, speed: 0.2, phase: 0.36 },
    { start: [-875, 0, 155], color: '#06c755', height: 210, speed: 0.17, phase: 0.52 },
    { start: [-850, 0, 315], color: '#1877f2', height: 190, speed: 0.19, phase: 0.7 },
    { start: [-780, 0, 470], color: '#e1306c', height: 175, speed: 0.15, phase: 0.86 },
];

const cloudConfigs: readonly { position: Vec3; scale: Vec3; speed: number }[] = [
    { position: [-560, 255, -210], scale: [1.65, 0.9, 0.88], speed: 0.72 },
    { position: [-145, 295, -330], scale: [2.1, 1, 0.96], speed: 0.48 },
    { position: [340, 275, -245], scale: [1.8, 0.94, 0.9], speed: 0.62 },
    { position: [675, 245, -10], scale: [1.45, 0.78, 0.78], speed: 0.42 },
    { position: [-720, 235, 160], scale: [1.55, 0.82, 0.8], speed: 0.55 },
];

const treePositions: readonly Vec3[] = [
    [-610, 0, -95],
    [-565, 0, -40],
    [-510, 0, -120],
    [-430, 0, -510],
    [-380, 0, -575],
    [-320, 0, -535],
    [-245, 0, 565],
    [-180, 0, 650],
    [-110, 0, 690],
    [315, 0, 590],
    [390, 0, 540],
    [490, 0, 445],
    [635, 0, -250],
    [700, 0, -175],
    [650, 0, -35],
    [250, 0, -585],
    [335, 0, -655],
    [495, 0, -550],
];

export function TownWorld({
    selectedEntityId,
    setSelectedEntityId,
    setInteraction,
    travelTargetEntityId,
    setTravelTargetEntityId,
}: TownWorldProps) {
    const playerCameraRef = useRef<PlayerCameraState>({
        position: new THREE.Vector3(0, 6, 310),
        yaw: 0,
        keyboardNavigating: false,
    });
    const [arrivalEntityId, setArrivalEntityId] = useState<string | null>(null);
    const arrivalTimeoutRef = useRef<number | null>(null);

    useEffect(() => {
        return () => {
            if (arrivalTimeoutRef.current !== null) {
                window.clearTimeout(arrivalTimeoutRef.current);
            }
        };
    }, []);

    const handleArrival = useCallback(
        (entityId: string) => {
            if (arrivalTimeoutRef.current !== null) {
                window.clearTimeout(arrivalTimeoutRef.current);
            }

            setArrivalEntityId(entityId);
            arrivalTimeoutRef.current = window.setTimeout(() => {
                setSelectedEntityId(entityId);
                setArrivalEntityId(null);
                arrivalTimeoutRef.current = null;
            }, 420);
        },
        [setSelectedEntityId]
    );

    return (
        <>
            <SkyBackdrop />
            <SceneLighting />
            <VisualizerCameraControls playerCameraRef={playerCameraRef} />
            <Terrain />
            <DistantScenery />
            <LivingLandDetails />
            <CloudLayer />
            <RoadNetwork />
            <DistrictLabels />
            <ConnectionNetwork />
            <InboundSignalNetwork />
            <OpenAILogoLandmark />
            {townEntities.map((entity) => (
                <EntityBuilding
                    key={entity.id}
                    entity={entity}
                    selected={entity.id === selectedEntityId}
                    targeted={entity.id === travelTargetEntityId}
                    arriving={entity.id === arrivalEntityId}
                    onTravel={setTravelTargetEntityId}
                />
            ))}
            <PlayerController
                setInteraction={setInteraction}
                onSelect={setSelectedEntityId}
                playerCameraRef={playerCameraRef}
                travelTargetEntityId={travelTargetEntityId}
                setTravelTargetEntityId={setTravelTargetEntityId}
                onArrive={handleArrival}
            />
        </>
    );
}

function SkyBackdrop() {
    return (
        <mesh>
            <sphereGeometry args={[1900, 48, 32]} />
            <meshBasicMaterial color="#78bff2" side={THREE.BackSide} />
        </mesh>
    );
}

function VisualizerCameraControls({ playerCameraRef }: { playerCameraRef: PlayerCameraRef }) {
    const controlsRef = useRef<OrbitControlsImpl>(null);
    const focusPoint = useMemo(() => new THREE.Vector3(), []);

    useFrame(() => {
        if (!controlsRef.current) {
            return;
        }

        if (playerCameraRef.current.keyboardNavigating) {
            focusPoint.set(playerCameraRef.current.position.x, 34, playerCameraRef.current.position.z);
            controlsRef.current.target.lerp(focusPoint, 0.1);
        }

        controlsRef.current.update();
    });

    return (
        <OrbitControls
            ref={controlsRef}
            makeDefault
            enableDamping
            dampingFactor={0.08}
            enablePan
            enableRotate
            enableZoom
            target={[0, 48, 80]}
            minDistance={170}
            maxDistance={980}
            minPolarAngle={Math.PI * 0.16}
            maxPolarAngle={Math.PI * 0.48}
            screenSpacePanning={false}
        />
    );
}

function SceneLighting() {
    return (
        <>
            <ambientLight intensity={0.64} />
            <hemisphereLight args={['#cfeeff', '#8ec472', 0.72]} position={[0, 500, 0]} />
            <directionalLight
                position={[-360, 520, 260]}
                intensity={1.95}
                castShadow
                shadow-mapSize={[2048, 2048]}
                shadow-bias={-0.0005}
            >
                <orthographicCamera attach="shadow-camera" args={[-720, 720, 720, -720, 0.5, 1800]} />
            </directionalLight>
        </>
    );
}

function Terrain() {
    return (
        <>
            <RigidBody type="fixed" colliders={false}>
                <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
                    <planeGeometry args={[3600, 3200]} />
                    <meshStandardMaterial color="#7fca6b" roughness={0.86} />
                </mesh>
                <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.96, -980]}>
                    <planeGeometry args={[3600, 1350]} />
                    <meshStandardMaterial color="#72bf66" roughness={0.9} />
                </mesh>
                <CuboidCollider args={[1800, 1, 1600]} position={[0, -2, 0]} />
            </RigidBody>
            {townDistricts.map((district) => (
                <mesh key={district.id} rotation={[-Math.PI / 2, 0, 0]} position={[district.center[0], -0.82, district.center[2]]}>
                    <circleGeometry args={[district.radius, 56]} />
                    <meshStandardMaterial color={district.color} roughness={0.92} transparent opacity={0.13} />
                </mesh>
            ))}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.72, 220]}>
                <circleGeometry args={[92, 48]} />
                <meshStandardMaterial color="#eef4ec" roughness={0.78} />
            </mesh>
        </>
    );
}

function LivingLandDetails() {
    return (
        <>
            <Lake position={[-575, 0, 410]} scale={[1.2, 1, 0.72]} />
            <Lake position={[575, 0, 225]} scale={[0.86, 1, 0.56]} />
            <Lake position={[260, 0, -490]} scale={[0.72, 1, 0.42]} />
            {treePositions.map((position, index) => (
                <Tree key={`${position[0]}-${position[2]}`} position={position} variant={index % 3} />
            ))}
            <mesh receiveShadow position={[-536, 0.5, 396]} rotation={[-Math.PI / 2, 0, -0.18]}>
                <planeGeometry args={[54, 8]} />
                <meshStandardMaterial color="#e8d6a9" roughness={0.9} />
            </mesh>
            <mesh receiveShadow position={[566, 0.5, 205]} rotation={[-Math.PI / 2, 0, 0.42]}>
                <planeGeometry args={[42, 7]} />
                <meshStandardMaterial color="#e8d6a9" roughness={0.9} />
            </mesh>
        </>
    );
}

function DistantScenery() {
    return (
        <>
            <MountainRange />
            <DistantRainbow />
        </>
    );
}

const mountainPeaks: readonly { position: Vec3; radius: number; height: number; color: string; snowHeight: number }[] = [
    { position: [760, 0, -1320], radius: 255, height: 315, color: '#6f8a72', snowHeight: 60 },
    { position: [560, 0, -1380], radius: 185, height: 240, color: '#7b957b', snowHeight: 45 },
    { position: [960, 0, -1395], radius: 205, height: 275, color: '#63816d', snowHeight: 52 },
];

function MountainRange() {
    return (
        <group>
            {mountainPeaks.map((peak) => (
                <group key={`${peak.position[0]}-${peak.position[2]}`} position={peak.position}>
                    <mesh castShadow receiveShadow position={[0, peak.height * 0.5 - 2, 0]} rotation={[0, Math.PI * 0.08, 0]}>
                        <coneGeometry args={[peak.radius, peak.height, 6]} />
                        <meshStandardMaterial color={peak.color} roughness={0.88} metalness={0.02} />
                    </mesh>
                    <mesh castShadow position={[0, peak.height - peak.snowHeight * 0.48, 0]} rotation={[0, Math.PI * 0.08, 0]}>
                        <coneGeometry args={[peak.radius * 0.28, peak.snowHeight, 6]} />
                        <meshStandardMaterial color="#f7fbff" roughness={0.58} metalness={0.02} />
                    </mesh>
                </group>
            ))}
            <Waterfall />
        </group>
    );
}

function Waterfall() {
    const fallsRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (!fallsRef.current) {
            return;
        }

        fallsRef.current.children.forEach((child, index) => {
            child.position.y = 98 - ((state.clock.elapsedTime * 24 + index * 22) % 118);
        });
    });

    return (
        <group position={[780, 0, -1160]}>
            <mesh position={[0, 62, 0]} rotation={[-0.12, 0, 0]}>
                <planeGeometry args={[54, 160]} />
                <meshStandardMaterial color="#b9ecff" emissive="#77d9ff" emissiveIntensity={0.24} roughness={0.18} metalness={0.04} transparent opacity={0.78} side={THREE.DoubleSide} />
            </mesh>
            <group ref={fallsRef}>
                {[0, 1, 2, 3, 4].map((index) => (
                    <mesh key={index} position={[index % 2 === 0 ? -13 : 13, 96 - index * 22, 3]} scale={[1, 1.35, 1]}>
                        <sphereGeometry args={[5.5, 12, 12]} />
                        <meshStandardMaterial color="#f2fbff" emissive="#d8f7ff" emissiveIntensity={0.34} roughness={0.2} transparent opacity={0.82} />
                    </mesh>
                ))}
            </group>
            <mesh receiveShadow position={[0, 0.25, 24]} rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[72, 44]} />
                <meshStandardMaterial color="#55c6f2" roughness={0.2} metalness={0.06} transparent opacity={0.84} />
            </mesh>
            <mesh position={[0, 8, 20]}>
                <torusGeometry args={[66, 2.8, 10, 64]} />
                <meshStandardMaterial color="#e4fbff" emissive="#bff3ff" emissiveIntensity={0.32} transparent opacity={0.65} />
            </mesh>
        </group>
    );
}

const distantRainbowBands: readonly { color: string; radius: number }[] = [
    { color: '#ff4d6d', radius: 245 },
    { color: '#ff9f1c', radius: 234 },
    { color: '#ffdf4d', radius: 223 },
    { color: '#35d07f', radius: 212 },
    { color: '#4fb4ff', radius: 201 },
    { color: '#8f6cff', radius: 190 },
];

function DistantRainbow() {
    return (
        <group position={[-860, 10, -1280]} rotation={[0, -0.08, 0]}>
            {distantRainbowBands.map((band) => (
                <RainbowBand key={band.color} color={band.color} radius={band.radius} />
            ))}
        </group>
    );
}

function RainbowBand({ color, radius }: { color: string; radius: number }) {
    const curve = useMemo(() => {
        const points = Array.from({ length: 32 }, (_, index) => {
            const angle = Math.PI * (index / 31);
            return new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, 0);
        });

        return new THREE.CatmullRomCurve3(points);
    }, [radius]);
    const geometry = useMemo(() => new THREE.TubeGeometry(curve, 64, 4.5, 10, false), [curve]);

    return (
        <mesh geometry={geometry}>
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.26} roughness={0.42} transparent opacity={0.68} />
        </mesh>
    );
}

function Lake({ position, scale }: { position: Vec3; scale: Vec3 }) {
    return (
        <group position={position} scale={scale}>
            <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.55, 0]}>
                <circleGeometry args={[78, 48]} />
                <meshStandardMaterial color="#3fb9eb" roughness={0.18} metalness={0.08} transparent opacity={0.9} />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.49, 0]}>
                <ringGeometry args={[78, 86, 48]} />
                <meshStandardMaterial color="#d6e7ba" roughness={0.86} />
            </mesh>
        </group>
    );
}

function Tree({ position, variant }: { position: Vec3; variant: number }) {
    const crownColor = variant === 0 ? '#3f9d55' : variant === 1 ? '#5eaa4d' : '#2f8f62';
    const height = variant === 1 ? 26 : 22;

    return (
        <group position={position}>
            <mesh castShadow position={[0, height * 0.32, 0]}>
                <cylinderGeometry args={[3.2, 4.4, height * 0.64, 8]} />
                <meshStandardMaterial color="#9a6a3a" roughness={0.72} />
            </mesh>
            <mesh castShadow position={[0, height * 0.78, 0]}>
                <coneGeometry args={[16, height, 10]} />
                <meshStandardMaterial color={crownColor} roughness={0.68} />
            </mesh>
            <mesh castShadow position={[0, height * 1.06, 0]}>
                <coneGeometry args={[12, height * 0.78, 10]} />
                <meshStandardMaterial color={crownColor} roughness={0.66} />
            </mesh>
        </group>
    );
}

function CloudLayer() {
    const groupRef = useRef<THREE.Group>(null);

    useFrame((state, delta) => {
        if (!groupRef.current) {
            return;
        }

        groupRef.current.children.forEach((cloud, index) => {
            const config = cloudConfigs[index];
            const speed = config?.speed ?? 0.5;
            cloud.position.x += delta * speed;
            cloud.position.y = (config?.position[1] ?? cloud.position.y) + Math.sin(state.clock.elapsedTime * 0.42 + index * 1.7) * 5.5;

            if (cloud.position.x > 850) {
                cloud.position.x = -850;
            }
        });
    });

    return (
        <group ref={groupRef}>
            {cloudConfigs.map((cloud) => (
                <Cloud key={`${cloud.position[0]}-${cloud.position[2]}`} position={cloud.position} scale={cloud.scale} />
            ))}
        </group>
    );
}

const voxelCloudBlocks: readonly { position: Vec3; size: Vec3; color: string }[] = [
    { position: [-42, 0, 0], size: [34, 20, 22], color: '#ffffff' },
    { position: [-18, 8, 2], size: [38, 28, 24], color: '#ffffff' },
    { position: [13, 13, -1], size: [42, 32, 26], color: '#ffffff' },
    { position: [44, 4, 2], size: [34, 24, 22], color: '#ffffff' },
    { position: [-2, -8, 0], size: [66, 18, 24], color: '#fbfdff' },
    { position: [25, -9, -1], size: [42, 17, 22], color: '#fbfdff' },
    { position: [-55, -9, 2], size: [24, 16, 20], color: '#ffffff' },
];

function Cloud({ position, scale }: { position: Vec3; scale: Vec3 }) {
    return (
        <group position={position} scale={scale}>
            {voxelCloudBlocks.map((block) => (
                <mesh key={`${block.position[0]}-${block.position[1]}-${block.position[2]}`} castShadow={false} receiveShadow={false} position={block.position}>
                    <boxGeometry args={block.size} />
                    <meshStandardMaterial color={block.color} emissive="#ffffff" emissiveIntensity={0.12} roughness={0.72} transparent opacity={0.98} />
                </mesh>
            ))}
        </group>
    );
}

function DistrictLabels() {
    return (
        <>
            {townDistricts.map((district) => (
                <Text
                    key={district.id}
                    position={[district.center[0], 4, district.center[2] - district.radius * 0.62]}
                    rotation={[-Math.PI / 2, 0, 0]}
                    fontSize={10}
                    color="#23404a"
                    anchorX="center"
                    anchorY="middle"
                >
                    {district.name}
                </Text>
            ))}
        </>
    );
}

function RoadNetwork() {
    const districtRoads: readonly [Vec3, Vec3, number][] = [
        [[0, 0, 220], [0, 0, 0], 26],
        [[0, 0, 0], [420, 0, -230], 24],
        [[0, 0, 0], [120, 0, 390], 30],
        [[0, 0, 0], [-430, 0, 120], 28],
        [[0, 0, 0], [-300, 0, -360], 24],
        [[30, 0, 350], [120, 0, 460], 18],
        [[120, 0, 460], [235, 0, 520], 18],
        [[30, 0, 350], [235, 0, 390], 18],
        [[-420, 0, 120], [-530, 0, 20], 18],
        [[-420, 0, 120], [-575, 0, 165], 16],
        [[-420, 0, 120], [-650, 0, 78], 16],
        [[-420, 0, 120], [-570, 0, 250], 16],
        [[-420, 0, 120], [-485, 0, 305], 16],
        [[420, 0, -230], [545, 0, -315], 16],
        [[420, 0, -230], [305, 0, -150], 16],
    ];

    return (
        <>
            {districtRoads.map(([start, end, width]) => (
                <FlatSegment
                    key={`${start[0]}-${start[2]}-${end[0]}-${end[2]}`}
                    start={start}
                    end={end}
                    width={width}
                    y={0.05}
                    color="#e7d0a8"
                    opacity={1}
                />
            ))}
        </>
    );
}

function ConnectionNetwork() {
    return (
        <>
            {connectionPairs.map((pair) => {
                const source = townEntities.find((entity) => entity.id === pair.sourceId);
                const target = townEntities.find((entity) => entity.id === pair.targetId);
                if (!source || !target || source.id > target.id) {
                    return null;
                }

                return (
                    <ConnectionLink
                        key={`${source.id}-${target.id}`}
                        source={source}
                        target={target}
                        selected={source.tier === 'foundation' || target.tier === 'foundation'}
                    />
                );
            })}
        </>
    );
}

function InboundSignalNetwork() {
    return (
        <>
            {inboundSignalConfigs.map((signal, index) => (
                <InboundSignalArc
                    key={`${signal.start[0]}-${signal.start[2]}`}
                    start={signal.start}
                    target={[unifiedInboxPosition[0], 36, unifiedInboxPosition[2]]}
                    color={signal.color}
                    height={signal.height}
                    speed={signal.speed}
                    phase={signal.phase}
                    offset={index - inboundSignalConfigs.length / 2}
                />
            ))}
        </>
    );
}

interface InboundSignalArcProps {
    start: Vec3;
    target: Vec3;
    color: string;
    height: number;
    speed: number;
    phase: number;
    offset: number;
}

function InboundSignalArc({ start, target, color, height, speed, phase, offset }: InboundSignalArcProps) {
    const curve = useMemo(() => {
        const source = new THREE.Vector3(start[0], 58 + Math.abs(offset) * 4, start[2]);
        const destination = new THREE.Vector3(target[0], target[1] + offset * 1.8, target[2] + offset * 7);
        const controlA = new THREE.Vector3(start[0] + 145, height, start[2] + 25);
        const controlB = new THREE.Vector3(target[0] - 190, height * 0.92, target[2] + offset * 38);
        return new THREE.CubicBezierCurve3(source, controlA, controlB, destination);
    }, [height, offset, start, target]);

    const tubeGeometry = useMemo(() => new THREE.TubeGeometry(curve, 48, 1.6, 8, false), [curve]);

    return (
        <group>
            <mesh geometry={tubeGeometry}>
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.52} transparent opacity={0.56} />
            </mesh>
            <InboundSignalPacket curve={curve} color={color} speed={speed} phase={phase} size={6.5} />
            <InboundSignalPacket curve={curve} color="#ffffff" speed={speed * 1.14} phase={(phase + 0.46) % 1} size={4.4} />
        </group>
    );
}

function InboundSignalPacket({ curve, color, speed, phase, size }: { curve: THREE.CubicBezierCurve3; color: string; speed: number; phase: number; size: number }) {
    const ref = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (!ref.current) {
            return;
        }

        const t = (state.clock.elapsedTime * speed + phase) % 1;
        const point = curve.getPoint(t);
        const blink = 0.42 + Math.abs(Math.sin(state.clock.elapsedTime * 5.5 + phase * Math.PI * 2)) * 0.58;
        ref.current.position.copy(point);
        ref.current.scale.setScalar(blink);
    });

    return (
        <mesh ref={ref}>
            <sphereGeometry args={[size, 16, 16]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.1} transparent opacity={0.92} />
        </mesh>
    );
}

interface ConnectionLinkProps {
    source: TownEntity;
    target: TownEntity;
    selected: boolean;
}

function ConnectionLink({ source, target, selected }: ConnectionLinkProps) {
    const start: Vec3 = [source.position[0], 20, source.position[2]];
    const end: Vec3 = [target.position[0], 20, target.position[2]];
    const accent = selected ? '#f8d766' : source.accentColor;

    return (
        <>
            <OrientedCylinder start={start} end={end} radius={selected ? 1.45 : 0.72} color={accent} opacity={selected ? 0.45 : 0.2} />
            <FlowPacket start={start} end={end} color={accent} speed={selected ? 0.18 : 0.12} />
        </>
    );
}

interface FlatSegmentProps {
    start: Vec3;
    end: Vec3;
    width: number;
    y: number;
    color: string;
    opacity: number;
}

function FlatSegment({ start, end, width, y, color, opacity }: FlatSegmentProps) {
    const center = midpoint(start, end);
    const length = distance2d(start, end);
    const angle = Math.atan2(end[0] - start[0], end[2] - start[2]);

    return (
        <mesh position={[center[0], y, center[2]]} rotation={[-Math.PI / 2, 0, angle]} receiveShadow>
            <planeGeometry args={[width, length]} />
            <meshStandardMaterial color={color} roughness={0.95} transparent={opacity < 1} opacity={opacity} />
        </mesh>
    );
}

interface OrientedCylinderProps {
    start: Vec3;
    end: Vec3;
    radius: number;
    color: string;
    opacity: number;
}

function OrientedCylinder({ start, end, radius, color, opacity }: OrientedCylinderProps) {
    const transform = useMemo(() => {
        const source = new THREE.Vector3(...start);
        const target = new THREE.Vector3(...end);
        const direction = new THREE.Vector3().subVectors(target, source);
        const center = new THREE.Vector3().addVectors(source, target).multiplyScalar(0.5);
        const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize());
        return {
            center: [center.x, center.y, center.z] as const,
            quaternion: [quaternion.x, quaternion.y, quaternion.z, quaternion.w] as const,
            length: direction.length(),
        };
    }, [start, end]);

    return (
        <mesh position={transform.center} quaternion={transform.quaternion}>
            <cylinderGeometry args={[radius, radius, transform.length, 12]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.25} transparent opacity={opacity} />
        </mesh>
    );
}

interface FlowPacketProps {
    start: Vec3;
    end: Vec3;
    color: string;
    speed: number;
}

function FlowPacket({ start, end, color, speed }: FlowPacketProps) {
    const ref = useRef<THREE.Mesh>(null);
    const offset = useMemo(() => Math.random(), []);

    useFrame((state) => {
        if (!ref.current) {
            return;
        }

        const t = (state.clock.elapsedTime * speed + offset) % 1;
        ref.current.position.set(
            THREE.MathUtils.lerp(start[0], end[0], t),
            26 + Math.sin(t * Math.PI) * 18,
            THREE.MathUtils.lerp(start[2], end[2], t)
        );
    });

    return (
        <mesh ref={ref}>
            <sphereGeometry args={[3.2, 14, 14]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.9} />
        </mesh>
    );
}

interface EntityBuildingProps {
    entity: TownEntity;
    selected: boolean;
    targeted: boolean;
    arriving: boolean;
    onTravel: (entityId: string) => void;
}

function EntityBuilding({ entity, selected, targeted, arriving, onTravel }: EntityBuildingProps) {
    const [hovered, setHovered] = useState(false);
    const scale = selected || arriving ? 1.08 : targeted || hovered ? 1.04 : 1;
    const labelColor = entity.tier === 'foundation' ? '#063d38' : '#1f3340';

    const handleClick = (event: ThreeEvent<MouseEvent>) => {
        event.stopPropagation();
        onTravel(entity.id);
    };

    return (
        <RigidBody type="fixed" colliders={false} position={[entity.position[0], entity.position[1], entity.position[2]]}>
            <group
                scale={scale}
                onClick={handleClick}
                onPointerOver={(event) => {
                    event.stopPropagation();
                    setHovered(true);
                    document.body.style.cursor = 'pointer';
                }}
                onPointerOut={() => {
                    setHovered(false);
                    document.body.style.cursor = 'default';
                }}
            >
                <BuildingShape entity={entity} highlighted={selected || targeted || arriving || hovered} />
                {arriving ? <ArrivalPulse entity={entity} /> : null}
                <Text
                    position={[0, entity.size[1] + 18, 0]}
                    fontSize={entity.tier === 'foundation' ? 9.5 : 7}
                    color={labelColor}
                    outlineWidth={0.18}
                    outlineColor="#ffffff"
                    anchorX="center"
                    anchorY="middle"
                >
                    {entity.name}
                </Text>
            </group>
            <CuboidCollider args={[entity.size[0] * 0.33, entity.size[1] * 0.5, entity.size[2] * 0.33]} position={[0, entity.size[1] * 0.5, 0]} />
        </RigidBody>
    );
}

function ArrivalPulse({ entity }: { entity: TownEntity }) {
    const ringRef = useRef<THREE.Mesh>(null);
    const beaconRef = useRef<THREE.Mesh>(null);
    const startedAtRef = useRef<number | null>(null);

    useFrame((state) => {
        startedAtRef.current ??= state.clock.elapsedTime;
        const age = state.clock.elapsedTime - startedAtRef.current;
        const pulse = 1 + age * 1.8;
        const opacity = Math.max(0, 1 - age / 0.55);

        if (ringRef.current) {
            ringRef.current.scale.setScalar(pulse);
            const material = ringRef.current.material;
            if (material instanceof THREE.MeshStandardMaterial) {
                material.opacity = opacity;
            }
        }

        if (beaconRef.current) {
            beaconRef.current.position.y = entity.size[1] + 28 + Math.sin(state.clock.elapsedTime * 12) * 4;
            beaconRef.current.scale.setScalar(0.78 + Math.sin(state.clock.elapsedTime * 18) * 0.16);
        }
    });

    return (
        <group>
            <mesh ref={ringRef} position={[0, 4.8, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[Math.max(entity.size[0], entity.size[2]) * 0.58, 2.6, 10, 64]} />
                <meshStandardMaterial color="#fff2a6" emissive="#ffd85a" emissiveIntensity={0.95} transparent opacity={1} />
            </mesh>
            <mesh ref={beaconRef} position={[0, entity.size[1] + 28, 0]}>
                <sphereGeometry args={[7, 18, 18]} />
                <meshStandardMaterial color="#ffffff" emissive="#fff0a6" emissiveIntensity={1.2} />
            </mesh>
        </group>
    );
}

interface BuildingShapeProps {
    entity: TownEntity;
    highlighted: boolean;
}

type SocialLogoKind = 'line' | 'facebook' | 'instagram' | 'lazada';

function BuildingShape({ entity, highlighted }: BuildingShapeProps) {
    const emissiveIntensity = highlighted ? 0.34 : entity.tier === 'foundation' ? 0.18 : 0.05;

    if (entity.id === 'booking-management') {
        return <BookingClub entity={entity} emissiveIntensity={emissiveIntensity} />;
    }

    if (entity.id === 'issue-management') {
        return <IssueCallCenter entity={entity} emissiveIntensity={emissiveIntensity} />;
    }

    if (entity.id === 'faq-knowledge') {
        return <KnowledgeLibrary entity={entity} emissiveIntensity={emissiveIntensity} />;
    }

    if (entity.id === 'checkslip') {
        return <CheckSlipScanner entity={entity} emissiveIntensity={emissiveIntensity} />;
    }

    if (entity.id === 'billing-pricing') {
        return <BillingStation entity={entity} emissiveIntensity={emissiveIntensity} />;
    }

    if (entity.id === 'broadcast-campaigns') {
        return <BroadcastYard entity={entity} emissiveIntensity={emissiveIntensity} />;
    }

    if (entity.id === 'unified-inbox') {
        return <InboxConcourse entity={entity} emissiveIntensity={emissiveIntensity} />;
    }

    if (entity.id === 'chatbot-orchestration') {
        return <OrchestrationTower entity={entity} emissiveIntensity={emissiveIntensity} />;
    }

    if (entity.id === 'line-channel') {
        return <SocialLogoBuilding entity={entity} logo="line" emissiveIntensity={emissiveIntensity} />;
    }

    if (entity.id === 'facebook-channel') {
        return <SocialLogoBuilding entity={entity} logo="facebook" emissiveIntensity={emissiveIntensity} />;
    }

    if (entity.id === 'instagram-channel') {
        return <SocialLogoBuilding entity={entity} logo="instagram" emissiveIntensity={emissiveIntensity} />;
    }

    if (entity.id === 'lazada-channel') {
        return <SocialLogoBuilding entity={entity} logo="lazada" emissiveIntensity={emissiveIntensity} />;
    }

    if (entity.shape === 'citadel') {
        return <Citadel entity={entity} emissiveIntensity={emissiveIntensity} />;
    }

    if (entity.shape === 'database') {
        return <Database entity={entity} emissiveIntensity={emissiveIntensity} />;
    }

    if (entity.shape === 'bus') {
        return <Bus entity={entity} emissiveIntensity={emissiveIntensity} />;
    }

    if (entity.shape === 'lab') {
        return <Lab entity={entity} emissiveIntensity={emissiveIntensity} />;
    }

    if (entity.shape === 'gateway') {
        return <Gateway entity={entity} emissiveIntensity={emissiveIntensity} />;
    }

    if (entity.shape === 'tower') {
        return <Tower entity={entity} emissiveIntensity={emissiveIntensity} />;
    }

    if (entity.shape === 'platform') {
        return <Platform entity={entity} emissiveIntensity={emissiveIntensity} />;
    }

    return <Shop entity={entity} emissiveIntensity={emissiveIntensity} />;
}

function BasePad({ entity }: { entity: TownEntity }) {
    return (
        <mesh receiveShadow position={[0, 2, 0]}>
            <cylinderGeometry args={[Math.max(entity.size[0], entity.size[2]) * 0.62, Math.max(entity.size[0], entity.size[2]) * 0.72, 4, 8]} />
            <meshStandardMaterial color="#edf1f4" roughness={0.6} />
        </mesh>
    );
}

function Citadel({ entity, emissiveIntensity }: { entity: TownEntity; emissiveIntensity: number }) {
    return (
        <group>
            <BasePad entity={entity} />
            <mesh receiveShadow position={[0, 4, 0]}>
                <cylinderGeometry args={[92, 112, 8, 12]} />
                <meshStandardMaterial color="#e8f4f2" roughness={0.42} metalness={0.08} />
            </mesh>
            <mesh castShadow position={[0, 56, 0]}>
                <boxGeometry args={[92, 100, 88]} />
                <meshStandardMaterial color={entity.color} emissive={entity.color} emissiveIntensity={emissiveIntensity} roughness={0.28} metalness={0.22} />
            </mesh>
            <mesh castShadow position={[-70, 42, -12]}>
                <boxGeometry args={[28, 76, 42]} />
                <meshStandardMaterial color="#0f8f86" emissive="#0f8f86" emissiveIntensity={0.08} roughness={0.34} metalness={0.18} />
            </mesh>
            <mesh castShadow position={[70, 42, -12]}>
                <boxGeometry args={[28, 76, 42]} />
                <meshStandardMaterial color="#0f8f86" emissive="#0f8f86" emissiveIntensity={0.08} roughness={0.34} metalness={0.18} />
            </mesh>
            <mesh castShadow position={[0, 28, 48]}>
                <boxGeometry args={[128, 12, 18]} />
                <meshStandardMaterial color="#f3fbfb" roughness={0.28} metalness={0.12} />
            </mesh>
            <mesh castShadow position={[0, 103, 0]}>
                <cylinderGeometry args={[38, 48, 24, 6]} />
                <meshStandardMaterial color={entity.accentColor} roughness={0.22} metalness={0.12} />
            </mesh>
            <KaoJaiMascotModel color={entity.color} emissiveIntensity={emissiveIntensity} />
            <mesh position={[0, 126, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[62, 3, 12, 64]} />
                <meshStandardMaterial color="#fff5a6" emissive="#ffd45c" emissiveIntensity={0.72} />
            </mesh>
        </group>
    );
}

function KaoJaiMascotModel({ color, emissiveIntensity }: { color: string; emissiveIntensity: number }) {
    const mascotShape = useMemo(
        () =>
            createSpeechBubbleShape({
                width: 92,
                height: 66,
                radius: 13,
                tailLeftX: -27,
                tailRightX: -8,
                tailPointX: -30,
                tailDrop: 25,
            }),
        []
    );
    const faceShape = useMemo(
        () =>
            createSpeechBubbleShape({
                width: 77,
                height: 53,
                radius: 10,
                tailLeftX: -25,
                tailRightX: -7,
                tailPointX: -28,
                tailDrop: 20,
            }),
        []
    );
    const smileGeometry = useMemo(() => {
        const curve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(-9.5, -8, 13.6),
            new THREE.Vector3(-4.75, -12.6, 13.6),
            new THREE.Vector3(0, -14, 13.6),
            new THREE.Vector3(4.75, -12.6, 13.6),
            new THREE.Vector3(9.5, -8, 13.6),
        ]);

        return new THREE.TubeGeometry(curve, 36, 1.75, 12, false);
    }, []);

    return (
        <group position={[0, 73, 48]} scale={[1.08, 1.08, 1.08]}>
            <mesh castShadow>
                <extrudeGeometry args={[mascotShape, { depth: 10, bevelEnabled: true, bevelSegments: 6, bevelSize: 2.1, bevelThickness: 2.1 }]} />
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={emissiveIntensity + 0.04} roughness={0.5} metalness={0.02} />
            </mesh>
            <mesh castShadow position={[0, 1.4, 9.4]}>
                <extrudeGeometry args={[faceShape, { depth: 2.4, bevelEnabled: true, bevelSegments: 5, bevelSize: 1.15, bevelThickness: 1.15 }]} />
                <meshStandardMaterial color="#fbfffc" roughness={0.58} metalness={0.01} />
            </mesh>
            <mesh castShadow position={[-16.5, 4.6, 13.2]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[6.2, 6.2, 2.4, 36]} />
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.14} roughness={0.48} />
            </mesh>
            <mesh castShadow position={[16.5, 4.6, 13.2]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[6.2, 6.2, 2.4, 36]} />
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.14} roughness={0.48} />
            </mesh>
            <mesh castShadow geometry={smileGeometry}>
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.14} roughness={0.48} />
            </mesh>
            <mesh castShadow position={[0, 55, 5.2]}>
                <sphereGeometry args={[8.4, 28, 28]} />
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.1} roughness={0.52} />
            </mesh>
            <mesh castShadow position={[0, 43.5, 5.2]}>
                <cylinderGeometry args={[3.8, 3.8, 18, 22]} />
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.08} roughness={0.52} />
            </mesh>
            <mesh receiveShadow position={[0, -47, 3]}>
                <cylinderGeometry args={[44, 54, 7, 8]} />
                <meshStandardMaterial color="#ecf4f3" roughness={0.48} metalness={0.04} />
            </mesh>
        </group>
    );
}

function createRoundedRectShape(width: number, height: number, radius: number): THREE.Shape {
    const shape = new THREE.Shape();
    const halfWidth = width / 2;
    const halfHeight = height / 2;

    shape.moveTo(-halfWidth + radius, halfHeight);
    shape.lineTo(halfWidth - radius, halfHeight);
    shape.quadraticCurveTo(halfWidth, halfHeight, halfWidth, halfHeight - radius);
    shape.lineTo(halfWidth, -halfHeight + radius);
    shape.quadraticCurveTo(halfWidth, -halfHeight, halfWidth - radius, -halfHeight);
    shape.lineTo(-halfWidth + radius, -halfHeight);
    shape.quadraticCurveTo(-halfWidth, -halfHeight, -halfWidth, -halfHeight + radius);
    shape.lineTo(-halfWidth, halfHeight - radius);
    shape.quadraticCurveTo(-halfWidth, halfHeight, -halfWidth + radius, halfHeight);

    return shape;
}

interface SpeechBubbleShapeOptions {
    width: number;
    height: number;
    radius: number;
    tailLeftX: number;
    tailRightX: number;
    tailPointX: number;
    tailDrop: number;
}

function createSpeechBubbleShape({
    width,
    height,
    radius,
    tailLeftX,
    tailRightX,
    tailPointX,
    tailDrop,
}: SpeechBubbleShapeOptions): THREE.Shape {
    const halfWidth = width / 2;
    const halfHeight = height / 2;
    const shape = new THREE.Shape();

    shape.moveTo(-halfWidth + radius, halfHeight);
    shape.lineTo(halfWidth - radius, halfHeight);
    shape.quadraticCurveTo(halfWidth, halfHeight, halfWidth, halfHeight - radius);
    shape.lineTo(halfWidth, -halfHeight + radius);
    shape.quadraticCurveTo(halfWidth, -halfHeight, halfWidth - radius, -halfHeight);
    shape.lineTo(tailRightX, -halfHeight);
    shape.lineTo(tailPointX, -halfHeight - tailDrop);
    shape.lineTo(tailLeftX, -halfHeight);
    shape.lineTo(-halfWidth + radius, -halfHeight);
    shape.quadraticCurveTo(-halfWidth, -halfHeight, -halfWidth, -halfHeight + radius);
    shape.lineTo(-halfWidth, halfHeight - radius);
    shape.quadraticCurveTo(-halfWidth, halfHeight, -halfWidth + radius, halfHeight);

    return shape;
}

function BookingClub({ entity, emissiveIntensity }: { entity: TownEntity; emissiveIntensity: number }) {
    return (
        <group>
            <Shop entity={entity} emissiveIntensity={emissiveIntensity} />
            <mesh receiveShadow position={[-52, 1.8, -14]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[62, 34]} />
                <meshStandardMaterial color="#6abf83" roughness={0.7} />
            </mesh>
            <mesh position={[-52, 2.4, -14]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[17, 18.5, 32]} />
                <meshStandardMaterial color="#f6fbff" roughness={0.44} />
            </mesh>
            <mesh position={[-52, 4, -14]}>
                <boxGeometry args={[3, 18, 2]} />
                <meshStandardMaterial color="#ffffff" roughness={0.35} />
            </mesh>
            <mesh position={[-32, 14, 8]} rotation={[0, 0, -0.45]}>
                <coneGeometry args={[5, 18, 18]} />
                <meshStandardMaterial color="#f7f1d5" roughness={0.36} />
            </mesh>
            <mesh position={[-37, 25, 8]}>
                <sphereGeometry args={[4, 12, 12]} />
                <meshStandardMaterial color="#ffffff" roughness={0.28} />
            </mesh>
        </group>
    );
}

function IssueCallCenter({ entity, emissiveIntensity }: { entity: TownEntity; emissiveIntensity: number }) {
    const desks = [-22, 0, 22];
    return (
        <group>
            <Shop entity={entity} emissiveIntensity={emissiveIntensity} />
            <mesh castShadow position={[0, 58, 0]}>
                <boxGeometry args={[62, 10, 40]} />
                <meshStandardMaterial color="#d9eef8" emissive="#8fd7ff" emissiveIntensity={0.12} roughness={0.32} />
            </mesh>
            {desks.map((deskX) => (
                <group key={deskX} position={[deskX, 14, 42]}>
                    <mesh castShadow>
                        <boxGeometry args={[12, 6, 8]} />
                        <meshStandardMaterial color="#dde7ef" roughness={0.42} />
                    </mesh>
                    <mesh position={[0, 9, 0]} rotation={[Math.PI / 2, 0, 0]}>
                        <torusGeometry args={[6, 1, 8, 24, Math.PI * 1.5]} />
                        <meshStandardMaterial color="#263b46" roughness={0.4} />
                    </mesh>
                    <mesh position={[5, 7, 4]}>
                        <sphereGeometry args={[2.4, 10, 10]} />
                        <meshStandardMaterial color="#13b8a8" emissive="#13b8a8" emissiveIntensity={0.24} />
                    </mesh>
                </group>
            ))}
        </group>
    );
}

function KnowledgeLibrary({ entity, emissiveIntensity }: { entity: TownEntity; emissiveIntensity: number }) {
    const shelves = [-22, -8, 8, 22];
    return (
        <group>
            <Shop entity={entity} emissiveIntensity={emissiveIntensity} />
            {shelves.map((x, index) => (
                <mesh key={x} castShadow position={[x, 26 + index * 3, -38]}>
                    <boxGeometry args={[10, 36, 8]} />
                    <meshStandardMaterial color={index % 2 === 0 ? '#ffcf86' : '#8cc8ff'} emissive={entity.color} emissiveIntensity={0.08} roughness={0.48} />
                </mesh>
            ))}
            <mesh position={[0, 54, -38]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[24, 2, 10, 42]} />
                <meshStandardMaterial color={entity.accentColor} emissive={entity.accentColor} emissiveIntensity={0.32} />
            </mesh>
        </group>
    );
}

function CheckSlipScanner({ entity, emissiveIntensity }: { entity: TownEntity; emissiveIntensity: number }) {
    return (
        <group>
            <Shop entity={entity} emissiveIntensity={emissiveIntensity} />
            <mesh castShadow position={[0, 28, 44]}>
                <boxGeometry args={[58, 34, 8]} />
                <meshStandardMaterial color="#263b46" emissive="#ffb36d" emissiveIntensity={emissiveIntensity} roughness={0.24} metalness={0.2} />
            </mesh>
            <mesh position={[0, 28, 49]}>
                <boxGeometry args={[42, 3, 2]} />
                <meshStandardMaterial color="#79f2c6" emissive="#13b8a8" emissiveIntensity={0.65} />
            </mesh>
            <mesh position={[26, 46, 45]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[12, 2.4, 10, 34]} />
                <meshStandardMaterial color="#ff4d6d" emissive="#ff4d6d" emissiveIntensity={0.45} />
            </mesh>
        </group>
    );
}

function BillingStation({ entity, emissiveIntensity }: { entity: TownEntity; emissiveIntensity: number }) {
    return (
        <group>
            <Shop entity={entity} emissiveIntensity={emissiveIntensity} />
            <mesh castShadow position={[42, 23, 4]}>
                <cylinderGeometry args={[16, 18, 22, 32]} />
                <meshStandardMaterial color="#f7d66a" emissive="#f7d66a" emissiveIntensity={emissiveIntensity} roughness={0.35} metalness={0.2} />
            </mesh>
            <mesh castShadow position={[42, 42, 4]}>
                <cylinderGeometry args={[16, 16, 4, 32]} />
                <meshStandardMaterial color="#fff5bd" emissive="#fff5bd" emissiveIntensity={0.18} roughness={0.28} />
            </mesh>
            <mesh position={[42, 52, 4]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[22, 2, 10, 42]} />
                <meshStandardMaterial color="#5cc9d6" emissive="#5cc9d6" emissiveIntensity={0.44} />
            </mesh>
        </group>
    );
}

function BroadcastYard({ entity, emissiveIntensity }: { entity: TownEntity; emissiveIntensity: number }) {
    return (
        <group>
            <Platform entity={entity} emissiveIntensity={emissiveIntensity} />
            {[-44, 0, 44].map((x, index) => (
                <mesh key={x} castShadow position={[x, 48, 12]}>
                    <cylinderGeometry args={[6, 8, 64 - index * 8, 18]} />
                    <meshStandardMaterial color={index === 0 ? '#06c755' : index === 1 ? '#1877f2' : '#e1306c'} emissive={entity.color} emissiveIntensity={0.16} roughness={0.32} />
                </mesh>
            ))}
            <mesh position={[0, 82, 12]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[58, 2.2, 10, 64]} />
                <meshStandardMaterial color="#fff0b8" emissive="#ffd05a" emissiveIntensity={0.54} />
            </mesh>
        </group>
    );
}

function InboxConcourse({ entity, emissiveIntensity }: { entity: TownEntity; emissiveIntensity: number }) {
    const inboxIconShape = useMemo(
        () =>
            createSpeechBubbleShape({
                width: 48,
                height: 34,
                radius: 7,
                tailLeftX: -15,
                tailRightX: -4,
                tailPointX: -17,
                tailDrop: 11,
            }),
        []
    );

    return (
        <group>
            <Platform entity={entity} emissiveIntensity={emissiveIntensity} />
            {[-28, 0, 28].map((x) => (
                <mesh key={x} castShadow position={[x, 44, 38]}>
                    <boxGeometry args={[22, 28, 5]} />
                    <meshStandardMaterial color="#e8fbff" emissive="#8bd3ff" emissiveIntensity={0.18} roughness={0.24} />
                </mesh>
            ))}
            <mesh position={[0, 68, 38]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[38, 2.2, 10, 48]} />
                <meshStandardMaterial color="#9bdc77" emissive="#9bdc77" emissiveIntensity={0.35} />
            </mesh>
            <mesh castShadow position={[0, 85, 41]}>
                <extrudeGeometry args={[inboxIconShape, { depth: 5, bevelEnabled: true, bevelSegments: 3, bevelSize: 0.9, bevelThickness: 0.9 }]} />
                <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.2} roughness={0.38} />
            </mesh>
            <mesh castShadow position={[-13, 89, 47]}>
                <sphereGeometry args={[3.2, 16, 16]} />
                <meshStandardMaterial color={entity.color} emissive={entity.color} emissiveIntensity={0.4} />
            </mesh>
            <mesh castShadow position={[0, 89, 47]}>
                <sphereGeometry args={[3.2, 16, 16]} />
                <meshStandardMaterial color={entity.color} emissive={entity.color} emissiveIntensity={0.4} />
            </mesh>
            <mesh castShadow position={[13, 89, 47]}>
                <sphereGeometry args={[3.2, 16, 16]} />
                <meshStandardMaterial color={entity.color} emissive={entity.color} emissiveIntensity={0.4} />
            </mesh>
        </group>
    );
}

function OrchestrationTower({ entity, emissiveIntensity }: { entity: TownEntity; emissiveIntensity: number }) {
    return (
        <group>
            <Tower entity={entity} emissiveIntensity={emissiveIntensity} />
            <mesh position={[0, 72, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[36, 2.2, 12, 56]} />
                <meshStandardMaterial color="#8bd3ff" emissive="#8bd3ff" emissiveIntensity={0.5} />
            </mesh>
            {[-24, 0, 24].map((x, index) => (
                <mesh key={x} castShadow position={[x, 34, 38]}>
                    <sphereGeometry args={[6 + index, 16, 16]} />
                    <meshStandardMaterial color={index === 1 ? '#f7d66a' : '#13b8a8'} emissive={index === 1 ? '#f7d66a' : '#13b8a8'} emissiveIntensity={0.36} />
                </mesh>
            ))}
        </group>
    );
}

function OpenAILogoLandmark() {
    return (
        <group position={[342, 0, -318]} rotation={[0, -0.28, 0]}>
            <mesh receiveShadow position={[0, 2.2, 0]}>
                <cylinderGeometry args={[34, 41, 4.4, 48]} />
                <meshStandardMaterial color="#e9f7ed" roughness={0.66} />
            </mesh>
            <mesh castShadow position={[0, 29, 1]}>
                <cylinderGeometry args={[3.8, 5.2, 52, 16]} />
                <meshStandardMaterial color="#d6e8e2" roughness={0.42} metalness={0.18} />
            </mesh>
            <OpenAIBadge />
        </group>
    );
}

function OpenAIBadge() {
    const badgeShape = useMemo(() => createRoundedRectShape(74, 74, 13), []);

    return (
        <group position={[0, 62, -3.6]}>
            <mesh castShadow>
                <extrudeGeometry args={[badgeShape, { depth: 7.2, bevelEnabled: true, bevelSegments: 7, bevelSize: 2.2, bevelThickness: 2.2 }]} />
                <meshStandardMaterial color="#10a37f" emissive="#10a37f" emissiveIntensity={0.16} roughness={0.3} metalness={0.06} />
            </mesh>
            <OpenAIKnotMark />
        </group>
    );
}

const openAIKnotAngles: readonly number[] = [0, Math.PI / 3, (Math.PI * 2) / 3, Math.PI, (Math.PI * 4) / 3, (Math.PI * 5) / 3];

function OpenAIKnotMark() {
    return (
        <group position={[0, 0, 7.7]} scale={[0.86, 0.86, 0.86]}>
            {openAIKnotAngles.map((angle) => (
                <OpenAILoopStroke key={`loop-${angle}`} angle={angle + Math.PI / 6} />
            ))}
            {openAIKnotAngles.map((angle) => (
                <OpenAIInnerStroke key={`inner-${angle}`} angle={angle} />
            ))}
            <mesh castShadow position={[0, 0, 1.6]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[7.4, 7.4, 2.8, 6]} />
                <meshStandardMaterial color="#10a37f" emissive="#10a37f" emissiveIntensity={0.08} roughness={0.32} />
            </mesh>
        </group>
    );
}

function OpenAILoopStroke({ angle }: { angle: number }) {
    const geometry = useMemo(() => {
        const basePoints = createCapsuleLoopPoints(17.6, 31, 13.8, 14);
        const rotatedPoints = basePoints.map((point) => rotateOpenAIPoint(point, angle, 0));
        const curve = new THREE.CatmullRomCurve3(rotatedPoints, true, 'centripetal');
        return new THREE.TubeGeometry(curve, 72, 2.35, 16, true);
    }, [angle]);

    return (
        <mesh castShadow geometry={geometry}>
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.16} roughness={0.24} />
        </mesh>
    );
}

function OpenAIInnerStroke({ angle }: { angle: number }) {
    const geometry = useMemo(() => {
        const basePoints = [new THREE.Vector3(-2.5, 5.8, 1), new THREE.Vector3(10.6, 13.6, 1), new THREE.Vector3(21.1, 8.6, 1)];
        const rotatedPoints = basePoints.map((point) => rotateOpenAIPoint(point, angle + Math.PI / 6, 1));
        const curve = new THREE.CatmullRomCurve3(rotatedPoints, false, 'centripetal');
        return new THREE.TubeGeometry(curve, 28, 2.28, 16, false);
    }, [angle]);

    return (
        <mesh castShadow geometry={geometry}>
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.16} roughness={0.24} />
        </mesh>
    );
}

function createCapsuleLoopPoints(width: number, height: number, centerY: number, segmentCount: number): THREE.Vector3[] {
    const radius = width / 2;
    const topCenterY = centerY + height / 2 - radius;
    const bottomCenterY = centerY - height / 2 + radius;
    const points: THREE.Vector3[] = [];

    for (let index = 0; index <= segmentCount; index += 1) {
        const angle = Math.PI - (Math.PI * index) / segmentCount;
        points.push(new THREE.Vector3(Math.cos(angle) * radius, topCenterY + Math.sin(angle) * radius, 0));
    }

    for (let index = 0; index <= segmentCount; index += 1) {
        const angle = -(Math.PI * index) / segmentCount;
        points.push(new THREE.Vector3(Math.cos(angle) * radius, bottomCenterY + Math.sin(angle) * radius, 0));
    }

    return points;
}

function rotateOpenAIPoint(point: THREE.Vector3, angle: number, z: number): THREE.Vector3 {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return new THREE.Vector3(point.x * cos - point.y * sin, point.x * sin + point.y * cos, z);
}

function SocialLogoBuilding({ entity, logo, emissiveIntensity }: { entity: TownEntity; logo: SocialLogoKind; emissiveIntensity: number }) {
    return (
        <group>
            <BasePad entity={entity} />
            <mesh castShadow position={[0, entity.size[1] * 0.4, 0]}>
                <boxGeometry args={[entity.size[0] * 0.86, entity.size[1] * 0.72, entity.size[2] * 0.76]} />
                <meshStandardMaterial color="#f8fbff" roughness={0.48} metalness={0.04} />
            </mesh>
            <mesh castShadow position={[0, entity.size[1] * 0.84, 0]}>
                <boxGeometry args={[entity.size[0] * 0.94, 9, entity.size[2] * 0.84]} />
                <meshStandardMaterial color={entity.color} emissive={entity.color} emissiveIntensity={emissiveIntensity} roughness={0.34} metalness={0.1} />
            </mesh>
            <mesh castShadow position={[0, entity.size[1] * 0.46, entity.size[2] * 0.4 + 2]}>
                <boxGeometry args={[entity.size[0] * 0.88, entity.size[1] * 0.58, 5]} />
                <meshStandardMaterial color={entity.color} emissive={entity.color} emissiveIntensity={emissiveIntensity + 0.04} roughness={0.3} metalness={0.08} />
            </mesh>
            <group position={[0, entity.size[1] * 0.48, entity.size[2] * 0.4 + 6]} scale={[0.84, 0.84, 0.84]}>
                <SocialLogoMark logo={logo} />
            </group>
        </group>
    );
}

function SocialLogoMark({ logo }: { logo: SocialLogoKind }) {
    if (logo === 'line') {
        return <LineLogoMark />;
    }

    if (logo === 'facebook') {
        return <FacebookLogoMark />;
    }

    if (logo === 'instagram') {
        return <InstagramLogoMark />;
    }

    return <LazadaLogoMark />;
}

function LineLogoMark() {
    const bubbleShape = useMemo(
        () =>
            createSpeechBubbleShape({
                width: 36,
                height: 24,
                radius: 6,
                tailLeftX: 4,
                tailRightX: 13,
                tailPointX: 15,
                tailDrop: 7,
            }),
        []
    );

    return (
        <group>
            <mesh castShadow position={[0, 1, 0]}>
                <extrudeGeometry args={[bubbleShape, { depth: 4, bevelEnabled: true, bevelSegments: 3, bevelSize: 0.8, bevelThickness: 0.8 }]} />
                <meshStandardMaterial color="#ffffff" roughness={0.42} />
            </mesh>
            <Text position={[0, 1.4, 5.2]} fontSize={8} color="#06c755" anchorX="center" anchorY="middle">
                LINE
            </Text>
        </group>
    );
}

function FacebookLogoMark() {
    return (
        <group>
            <Text position={[0, -1, 2.5]} fontSize={34} color="#ffffff" anchorX="center" anchorY="middle">
                f
            </Text>
        </group>
    );
}

function InstagramLogoMark() {
    const roundedSquareShape = useMemo(() => createRoundedRectShape(36, 36, 7), []);

    return (
        <group>
            <mesh castShadow position={[0, 0, 0]}>
                <extrudeGeometry args={[roundedSquareShape, { depth: 3.4, bevelEnabled: true, bevelSegments: 4, bevelSize: 0.7, bevelThickness: 0.7 }]} />
                <meshStandardMaterial color="#d62976" emissive="#f77737" emissiveIntensity={0.22} roughness={0.34} metalness={0.04} />
            </mesh>
            <mesh position={[-10, -11, 3.2]} scale={[0.85, 0.85, 0.4]}>
                <sphereGeometry args={[10, 18, 14]} />
                <meshStandardMaterial color="#feda75" emissive="#feda75" emissiveIntensity={0.16} transparent opacity={0.82} />
            </mesh>
            <mesh position={[11, 11, 3.25]} scale={[0.75, 0.75, 0.4]}>
                <sphereGeometry args={[10, 18, 14]} />
                <meshStandardMaterial color="#515bd4" emissive="#515bd4" emissiveIntensity={0.18} transparent opacity={0.82} />
            </mesh>
            <mesh position={[0, 0, 6]} rotation={[0, 0, 0]}>
                <torusGeometry args={[10.2, 2, 12, 48]} />
                <meshStandardMaterial color="#ffffff" roughness={0.26} />
            </mesh>
            <mesh position={[10, 10, 6.2]}>
                <sphereGeometry args={[3, 16, 16]} />
                <meshStandardMaterial color="#ffffff" roughness={0.26} />
            </mesh>
        </group>
    );
}

function LazadaLogoMark() {
    return (
        <group>
            <mesh castShadow position={[-8, 3, 2]} rotation={[0, 0, Math.PI / 4]}>
                <boxGeometry args={[15, 15, 6]} />
                <meshStandardMaterial color="#ff9f00" emissive="#ff9f00" emissiveIntensity={0.18} roughness={0.34} />
            </mesh>
            <mesh castShadow position={[8, 3, 2]} rotation={[0, 0, Math.PI / 4]}>
                <boxGeometry args={[15, 15, 6]} />
                <meshStandardMaterial color="#ff1f8f" emissive="#ff1f8f" emissiveIntensity={0.18} roughness={0.34} />
            </mesh>
            <mesh castShadow position={[0, -7, 2]} rotation={[0, 0, Math.PI / 4]}>
                <boxGeometry args={[17, 17, 6]} />
                <meshStandardMaterial color="#ff6f00" emissive="#ff6f00" emissiveIntensity={0.16} roughness={0.34} />
            </mesh>
            <Text position={[0, -1.5, 8.2]} fontSize={11} color="#ffffff" anchorX="center" anchorY="middle">
                Laz
            </Text>
        </group>
    );
}

function Database({ entity, emissiveIntensity }: { entity: TownEntity; emissiveIntensity: number }) {
    const layers = [0, 1, 2, 3, 4];
    return (
        <group>
            <BasePad entity={entity} />
            {layers.map((layer) => (
                <mesh key={layer} castShadow position={[0, 18 + layer * 18, 0]}>
                    <cylinderGeometry args={[entity.size[0] * 0.42, entity.size[0] * 0.42, 14, 36]} />
                    <meshStandardMaterial color={entity.color} emissive={entity.color} emissiveIntensity={emissiveIntensity} roughness={0.38} metalness={0.18} />
                </mesh>
            ))}
            <mesh position={[0, 110, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[42, 3, 10, 48]} />
                <meshStandardMaterial color={entity.accentColor} emissive={entity.accentColor} emissiveIntensity={0.45} />
            </mesh>
        </group>
    );
}

function Bus({ entity, emissiveIntensity }: { entity: TownEntity; emissiveIntensity: number }) {
    return (
        <group>
            <BasePad entity={entity} />
            <mesh castShadow position={[0, 28, 0]}>
                <boxGeometry args={[entity.size[0], 22, entity.size[2]]} />
                <meshStandardMaterial color={entity.color} emissive={entity.color} emissiveIntensity={emissiveIntensity} roughness={0.35} metalness={0.08} />
            </mesh>
            <mesh position={[0, 48, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[entity.size[0] * 0.36, 4, 12, 56]} />
                <meshStandardMaterial color={entity.accentColor} emissive={entity.accentColor} emissiveIntensity={0.65} />
            </mesh>
            <mesh castShadow position={[0, 62, 0]}>
                <cylinderGeometry args={[8, 11, 36, 18]} />
                <meshStandardMaterial color="#d9dde7" roughness={0.25} metalness={0.6} />
            </mesh>
        </group>
    );
}

function Lab({ entity, emissiveIntensity }: { entity: TownEntity; emissiveIntensity: number }) {
    return (
        <group>
            <BasePad entity={entity} />
            <mesh castShadow position={[0, 56, 0]}>
                <boxGeometry args={[entity.size[0], 100, entity.size[2]]} />
                <meshPhysicalMaterial color={entity.color} emissive={entity.color} emissiveIntensity={emissiveIntensity} roughness={0.08} metalness={0.05} transparent opacity={0.56} />
            </mesh>
            <mesh castShadow position={[0, 82, 0]}>
                <sphereGeometry args={[24, 28, 28]} />
                <meshStandardMaterial color={entity.accentColor} emissive={entity.accentColor} emissiveIntensity={0.65} />
            </mesh>
            <mesh position={[0, 82, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[42, 2.4, 12, 64]} />
                <meshStandardMaterial color="#6cc9ff" emissive="#2b7fbf" emissiveIntensity={0.65} />
            </mesh>
        </group>
    );
}

function Shop({ entity, emissiveIntensity }: { entity: TownEntity; emissiveIntensity: number }) {
    return (
        <group>
            <BasePad entity={entity} />
            <mesh castShadow position={[0, entity.size[1] * 0.38, 0]}>
                <boxGeometry args={[entity.size[0] * 0.82, entity.size[1] * 0.64, entity.size[2] * 0.82]} />
                <meshStandardMaterial color="#fff7e8" roughness={0.58} />
            </mesh>
            <mesh castShadow position={[0, entity.size[1] * 0.78, 0]} rotation={[0, Math.PI / 4, 0]}>
                <coneGeometry args={[entity.size[0] * 0.56, entity.size[1] * 0.48, 4]} />
                <meshStandardMaterial color={entity.color} emissive={entity.color} emissiveIntensity={emissiveIntensity} roughness={0.42} />
            </mesh>
            <mesh position={[0, entity.size[1] * 0.52, entity.size[2] * 0.43]}>
                <boxGeometry args={[entity.size[0] * 0.52, entity.size[1] * 0.22, 3]} />
                <meshStandardMaterial color={entity.accentColor} emissive={entity.accentColor} emissiveIntensity={0.2} />
            </mesh>
        </group>
    );
}

function Gateway({ entity, emissiveIntensity }: { entity: TownEntity; emissiveIntensity: number }) {
    return (
        <group>
            <BasePad entity={entity} />
            <mesh castShadow position={[0, entity.size[1] * 0.42, 0]}>
                <boxGeometry args={[entity.size[0] * 0.72, entity.size[1] * 0.82, entity.size[2] * 0.32]} />
                <meshStandardMaterial color={entity.color} emissive={entity.color} emissiveIntensity={emissiveIntensity} roughness={0.34} metalness={0.15} />
            </mesh>
            <mesh position={[0, entity.size[1] * 0.52, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[entity.size[0] * 0.32, 3, 12, 48]} />
                <meshStandardMaterial color={entity.accentColor} emissive={entity.accentColor} emissiveIntensity={0.58} />
            </mesh>
        </group>
    );
}

function Tower({ entity, emissiveIntensity }: { entity: TownEntity; emissiveIntensity: number }) {
    return (
        <group>
            <BasePad entity={entity} />
            <mesh castShadow position={[0, entity.size[1] * 0.5, 0]}>
                <cylinderGeometry args={[entity.size[0] * 0.22, entity.size[0] * 0.32, entity.size[1], 18]} />
                <meshStandardMaterial color={entity.color} emissive={entity.color} emissiveIntensity={emissiveIntensity} roughness={0.32} metalness={0.22} />
            </mesh>
            <mesh castShadow position={[0, entity.size[1] + 9, 0]}>
                <sphereGeometry args={[entity.size[0] * 0.2, 18, 18]} />
                <meshStandardMaterial color={entity.accentColor} emissive={entity.accentColor} emissiveIntensity={0.74} />
            </mesh>
        </group>
    );
}

function Platform({ entity, emissiveIntensity }: { entity: TownEntity; emissiveIntensity: number }) {
    return (
        <group>
            <BasePad entity={entity} />
            <mesh castShadow position={[0, entity.size[1] * 0.26, 0]}>
                <boxGeometry args={[entity.size[0], entity.size[1] * 0.42, entity.size[2]]} />
                <meshStandardMaterial color={entity.color} emissive={entity.color} emissiveIntensity={emissiveIntensity} roughness={0.44} metalness={0.1} />
            </mesh>
            <mesh castShadow position={[0, entity.size[1] * 0.6, 0]}>
                <boxGeometry args={[entity.size[0] * 0.72, 8, entity.size[2] * 0.72]} />
                <meshStandardMaterial color={entity.accentColor} emissive={entity.accentColor} emissiveIntensity={0.24} />
            </mesh>
        </group>
    );
}

interface PlayerControllerProps {
    setInteraction: (state: InteractionState) => void;
    onSelect: (entityId: string | null) => void;
    playerCameraRef: PlayerCameraRef;
    travelTargetEntityId: string | null;
    setTravelTargetEntityId: (entityId: string | null) => void;
    onArrive: (entityId: string) => void;
}

function PlayerController({
    setInteraction,
    onSelect,
    playerCameraRef,
    travelTargetEntityId,
    setTravelTargetEntityId,
    onArrive,
}: PlayerControllerProps) {
    const bodyRef = useRef<RapierRigidBody>(null);
    const avatarRef = useRef<THREE.Group>(null);
    const [, getKeys] = useKeyboardControls<ControlName>();
    const positionRef = useRef<Vec3>([0, 6, 310]);
    const yawRef = useRef(0);
    const nearestRef = useRef<string | null>(null);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if ((event.code === 'KeyE' || event.code === 'Enter') && nearestRef.current) {
                onSelect(nearestRef.current);
            }

            if (event.code === 'Escape') {
                onSelect(null);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onSelect]);

    useFrame((_, delta) => {
        const keys = getKeys();
        const turnInput = Number(keys.right) - Number(keys.left);
        const moveInput = Number(keys.forward) - Number(keys.back);
        const hasKeyboardInput = turnInput !== 0 || moveInput !== 0;
        const travelTarget = travelTargetEntityId ? townEntities.find((entity) => entity.id === travelTargetEntityId) ?? null : null;
        const current = positionRef.current;
        let next: Vec3 = current;

        if (hasKeyboardInput) {
            if (travelTargetEntityId) {
                setTravelTargetEntityId(null);
            }

            yawRef.current -= turnInput * delta * 2.4;

            const forward = new THREE.Vector3(-Math.sin(yawRef.current), 0, -Math.cos(yawRef.current));
            const speed = keys.interact ? 62 : 118;

            if (moveInput !== 0) {
                next = resolveBlockedPosition(
                    [current[0] + forward.x * moveInput * speed * delta, 6, current[2] + forward.z * moveInput * speed * delta],
                    current,
                    townEntities
                );
                positionRef.current = next;
            }

            if (avatarRef.current) {
                avatarRef.current.rotation.y = yawRef.current;
            }
        } else if (travelTarget) {
            const dx = travelTarget.position[0] - current[0];
            const dz = travelTarget.position[2] - current[2];
            const distance = Math.hypot(dx, dz);
            const approachDistance = Math.max(travelTarget.size[0], travelTarget.size[2]) * 0.62 + 18;

            if (distance <= approachDistance) {
                setTravelTargetEntityId(null);
                onArrive(travelTarget.id);
            } else if (distance > 0.001) {
                const directionX = dx / distance;
                const directionZ = dz / distance;
                const speed = 136;

                next = resolveBlockedPosition(
                    [current[0] + directionX * speed * delta, 6, current[2] + directionZ * speed * delta],
                    current,
                    townEntities
                );
                positionRef.current = next;
                yawRef.current = Math.atan2(-directionX, -directionZ);

                if (avatarRef.current) {
                    avatarRef.current.rotation.y = yawRef.current;
                }
            }
        }

        playerCameraRef.current.position.set(positionRef.current[0], positionRef.current[1], positionRef.current[2]);
        playerCameraRef.current.yaw = yawRef.current;
        playerCameraRef.current.keyboardNavigating = hasKeyboardInput || Boolean(travelTarget);
        bodyRef.current?.setNextKinematicTranslation({ x: positionRef.current[0], y: positionRef.current[1], z: positionRef.current[2] });

        const nearest = findNearestEntity(positionRef.current, townEntities, 58);
        nearestRef.current = nearest?.id ?? null;
        setInteraction({ nearestEntityId: nearestRef.current, playerPosition: positionRef.current });

    });

    return (
        <RigidBody ref={bodyRef} type="kinematicPosition" colliders={false} position={[positionRef.current[0], positionRef.current[1], positionRef.current[2]]}>
            <CuboidCollider args={[7, 10, 7]} position={[0, 10, 0]} />
            <group ref={avatarRef}>
                <PlayerMascotAvatar />
            </group>
        </RigidBody>
    );
}

function PlayerMascotAvatar() {
    const propellerRef = useRef<THREE.Group>(null);
    const bodyShape = useMemo(
        () =>
            createSpeechBubbleShape({
                width: 34,
                height: 27,
                radius: 7,
                tailLeftX: -11,
                tailRightX: -2.5,
                tailPointX: -13,
                tailDrop: 10,
            }),
        []
    );
    const faceShape = useMemo(() => createRoundedRectShape(25, 17, 4.5), []);
    const mouthShape = useMemo(() => createOpenMouthShape(), []);

    useFrame((_, delta) => {
        if (!propellerRef.current) {
            return;
        }

        propellerRef.current.rotation.y += delta * 9.5;
    });

    return (
        <group position={[0, 27, 0]} scale={[1.05, 1.05, 1.05]}>
            <mesh castShadow>
                <extrudeGeometry args={[bodyShape, { depth: 7.5, bevelEnabled: true, bevelSegments: 5, bevelSize: 1.1, bevelThickness: 1.1 }]} />
                <meshStandardMaterial color="#f7a61f" emissive="#f7a61f" emissiveIntensity={0.08} roughness={0.5} />
            </mesh>
            <mesh castShadow position={[0, 1, -1]}>
                <extrudeGeometry args={[faceShape, { depth: 1.4, bevelEnabled: true, bevelSegments: 4, bevelSize: 0.8, bevelThickness: 0.8 }]} />
                <meshStandardMaterial color="#fffaf0" roughness={0.48} />
            </mesh>
            <mesh castShadow position={[-6, 3.1, -2.4]} scale={[1, 1, 0.32]}>
                <sphereGeometry args={[2.3, 18, 16]} />
                <meshStandardMaterial color="#f7a61f" emissive="#f7a61f" emissiveIntensity={0.08} roughness={0.42} />
            </mesh>
            <mesh castShadow position={[6, 3.1, -2.4]} scale={[1, 1, 0.32]}>
                <sphereGeometry args={[2.3, 18, 16]} />
                <meshStandardMaterial color="#f7a61f" emissive="#f7a61f" emissiveIntensity={0.08} roughness={0.42} />
            </mesh>
            <mesh castShadow position={[0, -3.2, -2.7]}>
                <extrudeGeometry args={[mouthShape, { depth: 1, bevelEnabled: true, bevelSegments: 3, bevelSize: 0.35, bevelThickness: 0.35 }]} />
                <meshStandardMaterial color="#26252b" roughness={0.36} />
            </mesh>
            <mesh castShadow position={[1.1, -6, -3.15]} scale={[1.25, 0.58, 0.32]}>
                <sphereGeometry args={[2.4, 18, 12]} />
                <meshStandardMaterial color="#ff9d8d" roughness={0.38} />
            </mesh>
            <PropellerHat propellerRef={propellerRef} />
            <mesh receiveShadow position={[0, -22, 4]}>
                <cylinderGeometry args={[8, 10, 3.2, 18]} />
                <meshStandardMaterial color="#eef4f3" roughness={0.56} />
            </mesh>
        </group>
    );
}

function PropellerHat({ propellerRef }: { propellerRef: RefObject<THREE.Group | null> }) {
    return (
        <group position={[0, 13.3, 1.4]}>
            <mesh castShadow position={[0, -0.8, -1.7]} scale={[1, 0.22, 0.62]}>
                <cylinderGeometry args={[8.1, 8.8, 2.2, 32]} />
                <meshStandardMaterial color="#e89a1c" roughness={0.5} />
            </mesh>
            <mesh castShadow position={[0, 0, -1.9]} scale={[1, 0.68, 0.78]}>
                <sphereGeometry args={[7.1, 16, 10, 0, Math.PI * 0.72, 0, Math.PI / 2]} />
                <meshStandardMaterial color="#f05f36" roughness={0.48} />
            </mesh>
            <mesh castShadow position={[0, 0, -1.9]} scale={[1, 0.68, 0.78]}>
                <sphereGeometry args={[7.1, 16, 10, Math.PI * 0.62, Math.PI * 0.74, 0, Math.PI / 2]} />
                <meshStandardMaterial color="#ffc83d" roughness={0.46} />
            </mesh>
            <mesh castShadow position={[0, 0, -1.9]} scale={[1, 0.68, 0.78]}>
                <sphereGeometry args={[7.1, 16, 10, Math.PI * 1.23, Math.PI * 0.77, 0, Math.PI / 2]} />
                <meshStandardMaterial color="#35c4b8" roughness={0.48} />
            </mesh>
            <mesh castShadow position={[0, 5.9, -1.5]}>
                <cylinderGeometry args={[0.75, 0.75, 5, 12]} />
                <meshStandardMaterial color="#27323a" roughness={0.42} />
            </mesh>
            <group ref={propellerRef} position={[0, 8.7, -1.5]}>
                <mesh castShadow position={[-4.6, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                    <capsuleGeometry args={[1.05, 5.8, 5, 14]} />
                    <meshStandardMaterial color="#ffb121" emissive="#ffb121" emissiveIntensity={0.08} roughness={0.38} />
                </mesh>
                <mesh castShadow position={[4.6, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                    <capsuleGeometry args={[1.05, 5.8, 5, 14]} />
                    <meshStandardMaterial color="#ffb121" emissive="#ffb121" emissiveIntensity={0.08} roughness={0.38} />
                </mesh>
                <mesh castShadow>
                    <sphereGeometry args={[1.7, 18, 16]} />
                    <meshStandardMaterial color="#f7a61f" roughness={0.35} />
                </mesh>
            </group>
        </group>
    );
}

function createOpenMouthShape(): THREE.Shape {
    const shape = new THREE.Shape();
    shape.moveTo(-5.2, 1.3);
    shape.bezierCurveTo(-3.5, 0.1, -1.6, -0.35, 0, -0.35);
    shape.bezierCurveTo(1.6, -0.35, 3.5, 0.1, 5.2, 1.3);
    shape.bezierCurveTo(4.4, -4.8, -4.4, -4.8, -5.2, 1.3);
    return shape;
}

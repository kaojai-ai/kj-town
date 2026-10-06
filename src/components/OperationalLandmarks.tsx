import { Suspense, useRef, useState, type ReactNode } from 'react';
import { Text } from '@react-three/drei';
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import type { TownEntity } from '../town/townData';
import { operationalEntities } from '../town/operationalEntities';

const landmarkIds = new Set(operationalEntities.map(entity => entity.id));
export const isOperationalLandmark = (id: string) => landmarkIds.has(id);

function Block({ at, size, color, glow = 0 }: {
    at: [number, number, number]; size: [number, number, number]; color: string; glow?: number;
}) {
    return <mesh position={at} castShadow receiveShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={glow} roughness={0.65} />
    </mesh>;
}

function Sign({ at, children, size = 4, color = '#f4fff9' }: {
    at: [number, number, number]; children: ReactNode; size?: number; color?: string;
}) {
    return <Suspense fallback={null}>
        <Text position={at} fontSize={size} color={color} anchorX="center" anchorY="middle">{children}</Text>
    </Suspense>;
}

function Control({ x, label, onClick, width = 25 }: { x: number; label: string; onClick: () => void; width?: number }) {
    return <group position={[x, 13, 25]} onClick={(event: ThreeEvent<MouseEvent>) => {
        event.stopPropagation();
        onClick();
    }}>
        <Block at={[0, 0, 0]} size={[width, 9, 3]} color="#24464c" />
        <Sign at={[0, 0, 1.6]} size={3}>{label}</Sign>
    </group>;
}

// Every detailed landmark fits its TownEntity footprint and fixed collider.
// Small meshes and text mount only at high LOD; no new lights or physics bodies.
export function OperationalLandmark({ entity, emissiveIntensity }: { entity: TownEntity; emissiveIntensity: number }) {
    const [width, height, depth] = entity.size;
    return <group>
        <Block at={[0, 2, 0]} size={[width, 4, depth]} color="#e5e8dc" />
        <Block at={[0, 7, 0]} size={[width - 6, 6, depth - 6]} color={entity.color} />
        {[-1, 1].flatMap(x => [-1, 1].map(z => <Block key={`${x}:${z}`}
            at={[x * (width / 2 - 7), (height + 10) / 2, z * (depth / 2 - 7)]}
            size={[5, height - 10, 5]} color="#355a5c" />))}
        <Block at={[0, height - 3, 0]} size={[width - 2, 6, depth - 2]} color={entity.color} glow={emissiveIntensity} />
        {entity.id === 'inbox-case-board' && <CaseArcade />}
        {entity.id === 'booking-intake' && <IntakeLockhouse />}
        {entity.id === 'case-report-clock' && <BusinessClock />}
        {entity.id === 'website-widget-studio' && <WelcomeCourt />}
        {entity.id === 'catalog-import-depot' && <CatalogDepot />}
        {entity.id === 'preset-reply-workshop' && <ReplyWorkshop />}
        {entity.id === 'staff-notification-belfry' && <StaffBelfry />}
    </group>;
}

const initialLanes = ['NEW', 'OWNED', 'CLOSED'] as const;
type CaseLane = typeof initialLanes[number];

function CaseArcade() {
    const [lanes, setLanes] = useState<CaseLane[]>([...initialLanes]);
    const [showClosed, setShowClosed] = useState(true);
    const compact = useThree(state => state.size.width < 840);
    const visibleLanes = lanes.filter(lane => showClosed || lane !== 'CLOSED');
    return <group>
        <Block at={[0, 40, 8]} size={[98, 54, 4]} color="#24464c" />
        {visibleLanes.map((lane, index) => {
            const x = (index - (visibleLanes.length - 1) / 2) * 30;
            // Identity belongs to a lane's case, so changing display order retains its card.
            const identity = initialLanes.indexOf(lane);
            const color = ['#78d4b4', '#ffd17e', '#afa3eb'][identity];
            return <group key={lane} position={[x, 0, 11]}>
                <Block at={[0, 40, 0]} size={[28, 48, 2]} color="#42686c" />
                <Sign at={[0, 59, 1.2]} size={3.5}>{lane}</Sign>
                <Block at={[0, 38, 2]} size={[24, 30, 2]} color="#f1f6e9" />
                <mesh position={[-5, 46, 3.2]}>
                    <circleGeometry args={[4.3, 12]} />
                    <meshStandardMaterial color={color} />
                </mesh>
                {identity === 0 ? <group position={[-5, 46, 3.4]}>
                    {/* A stylized available portrait; other customers use colored initials. */}
                    <mesh position={[0, 1, 0]}><circleGeometry args={[1.7, 10]} /><meshBasicMaterial color="#80583d" /></mesh>
                    <Block at={[0, -2, 0]} size={[4, 2, 0.2]} color="#80583d" />
                </group> : <Sign at={[-5, 46, 3.4]} size={3} color="#24464c">{identity === 1 ? 'PK' : 'AN'}</Sign>}
                <Sign at={[4, 39, 3.2]} size={3} color="#24464c">{['Mali', 'Pim', 'Anan'][identity]}</Sign>
                <Block at={[0, 29, 3.2]} size={[19, 6, 1]} color={color} />
                <Sign at={[0, 29, 3.8]} size={2.6} color="#24464c">{['BOOKING', 'VIP', 'FOLLOWUP'][identity]}</Sign>
            </group>;
        })}
        <Control x={-29} label={compact ? 'ORDER' : 'ROTATE LANES'} width={35}
            onClick={() => setLanes(current => [...current.slice(1), current[0]])} />
        <Control x={20} label={showClosed ? 'HIDE CLOSED' : 'SHOW CLOSED'} width={45}
            onClick={() => setShowClosed(current => !current)} />
    </group>;
}

function IntakeLockhouse() {
    const lights = useRef<THREE.Group>(null);
    const gate = useRef<THREE.Group>(null);
    useFrame(({ clock }) => {
        // Illustrative intake cycle: retain each detail; open only after all three arrive.
        const phase = clock.elapsedTime % 12;
        lights.current?.children.forEach((child, index) => {
            const material = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
            material.emissiveIntensity = phase >= index * 2 + 2 ? 0.75 : 0.02;
        });
        // Door pivots on a mounted hinge, rather than translating through a wall.
        if (gate.current) gate.current.rotation.y = phase >= 8 ? -Math.PI / 2 : 0;
    });
    return <group>
        <Block at={[0, 37, -10]} size={[42, 42, 4]} color="#24464c" />
        {['ACTIVITY', 'TIME', 'QUOTE'].map((label, index) => <Sign key={label} at={[0, 49 - index * 11, -7.8]} size={3.6}>{label}</Sign>)}
        <group ref={lights}>
            {[0, 1, 2].map(index => <mesh key={index} position={[18, 49 - index * 11, -7.7]}>
                <boxGeometry args={[3, 3, 1]} /><meshStandardMaterial color="#7eeac0" emissive="#7eeac0" />
            </mesh>)}
        </group>
        <Block at={[-21, 25, 16]} size={[4, 30, 4]} color="#355a5c" />
        <group ref={gate} position={[-19, 25, 16]}>
            <Block at={[19, 0, 0]} size={[38, 5, 3]} color="#efca6b" />
        </group>
        <Sign at={[0, 57, -7.5]} size={3}>DETAILS BEFORE CONFIRM</Sign>
    </group>;
}

function BusinessClock() {
    return <group>
        <Block at={[0, 38, 0]} size={[34, 56, 24]} color="#315256" />
        <mesh position={[0, 50, 12.2]}><circleGeometry args={[13, 24]} /><meshStandardMaterial color="#fff3ca" /></mesh>
        <Block at={[0, 54, 12.5]} size={[1.5, 8, 0.5]} color="#315256" />
        <Block at={[4, 50, 12.5]} size={[8, 1.5, 0.5]} color="#315256" />
        <Sign at={[0, 30, 12.6]} size={3}>OPEN / UNASSIGNED</Sign>
        <Sign at={[0, 23, 12.6]} size={3}>STAFF / SLA</Sign>
        <Sign at={[0, 16, 12.6]} size={2.8}>BUSINESS HOURS</Sign>
    </group>;
}

function WelcomeCourt() {
    const [activeSite, setActiveSite] = useState(0);
    const themes = ['#53c7a7', '#de9b76', '#a89beb'];
    return <group>
        {themes.map((theme, index) => <group key={theme} position={[(index - 1) * 27, 0, 0]}>
            <Block at={[0, 29, 0]} size={[23, 38, 12]} color={theme} glow={index === activeSite ? 0.18 : 0} />
            <Block at={[0, 32, 6.2]} size={[20, 22, 1]} color="#f4fff9" />
            <Sign at={[0, 49, 0]} size={3.3}>{`SITE ${index + 1}`}</Sign>
            <Sign at={[0, 39, 7]} size={2.8} color="#24464c">{['HELLO', 'WELCOME', 'SAWASDEE'][index]}</Sign>
            {/* Header, logo, welcome, starter keyword, and independent mobile preview. */}
            <Block at={[-6, 31, 7]} size={[4, 4, 1]} color={theme} />
            <Sign at={[3, 31, 7]} size={2.4} color="#24464c">CHAT</Sign>
            <Block at={[0, 24, 7]} size={[17, 4, 1]} color={theme} />
            <Sign at={[0, 24, 7.6]} size={2.4} color="#24464c">{['BOOK', 'HELP', 'PRICE'][index]}</Sign>
            <Block at={[7, 17, 9]} size={[6, 10, 2]} color="#24464c" />
            <Block at={[7, 17, 10.2]} size={[4, 7, 0.4]} color={theme} />
        </group>)}
        <Control x={0} label={`PREVIEW SITE ${activeSite + 1}`} width={55} onClick={() => setActiveSite(current => (current + 1) % 3)} />
    </group>;
}

function CatalogDepot() {
    const crates = useRef<THREE.Group>(null);
    const progress = useRef<THREE.Mesh>(null);
    useFrame(({ clock }) => {
        // A demonstration batch travels on supported loading beds, then rests at completion.
        const t = Math.min((clock.elapsedTime % 20) / 14, 1);
        if (crates.current) crates.current.children.forEach(child => { child.position.z = 15 - t * 26; });
        if (progress.current) {
            progress.current.scale.x = Math.max(0.01, t);
            progress.current.position.x = -40 + 40 * t;
        }
    });
    return <group>
        {['SHOPEE', 'LAZADA', 'TIKTOK SHOP'].map((name, index) => <group key={name} position={[(index - 1) * 33, 0, 0]}>
            <Block at={[0, 13, 0]} size={[26, 6, 42]} color="#3b555c" />
            <Block at={[0, 38, -22]} size={[27, 44, 3]} color="#354d53" />
            <Sign at={[0, 54, -20.3]} size={3}>{name}</Sign>
            <Sign at={[0, 43, -20.3]} size={2.9}>FULL CATALOG</Sign>
            <Sign at={[0, 32, -20.3]} size={2.6}>PREVIEW → IMPORT</Sign>
        </group>)}
        <group ref={crates}>
            {[0, 1, 2].map(index => <group key={index} position={[(index - 1) * 33, 0, 15]}>
                <Block at={[0, 22, 0]} size={[16, 12, 12]} color={['#ef8a53', '#8795ea', '#79d3cb'][index]} />
                <Block at={[0, 22, 6.1]} size={[3, 12, 0.2]} color="#fff1c9" />
            </group>)}
        </group>
        <Block at={[0, 59, 24]} size={[82, 5, 3]} color="#354d53" />
        {[-40, 40].map(x => <Block key={x} at={[x, 34.5, 24]} size={[3, 49, 3]} color="#354d53" />)}
        <mesh ref={progress} position={[-40, 59, 25.7]}>
            <boxGeometry args={[80, 3, 0.5]} /><meshStandardMaterial color="#7de5bb" emissive="#7de5bb" emissiveIntensity={0.2} />
        </mesh>
        <Sign at={[0, 64, 24]} size={3}>DEMO IMPORT PROGRESS</Sign>
    </group>;
}

function ReplyWorkshop() {
    const [reversed, setReversed] = useState(false);
    const [imageOpen, setImageOpen] = useState(true);
    const items = reversed ? ['IMAGE', 'TEXT', 'IMAGE', 'TEXT'] : ['TEXT', 'IMAGE', 'TEXT', 'IMAGE'];
    return <group>
        <Block at={[0, 36, 0]} size={[58, 52, 5]} color="#35565c" />
        {items.map((kind, index) => <group key={index} position={[0, 53 - index * 10, 3]}>
            <Block at={[0, 0, 0]} size={[50, 8, 2]} color={kind === 'TEXT' ? '#fff4d5' : '#c4e5ee'} />
            <Sign at={[0, 0, 1.1]} size={3} color="#24464c">{`${index + 1} · ${kind}`}</Sign>
        </group>)}
        {imageOpen && <group position={[25, 31, 10]}>
            <Block at={[0, 0, 0]} size={[15, 19, 2]} color="#b1dfc5" />
            <Sign at={[0, 0, 1.1]} size={2.4} color="#24464c">PHOTO</Sign>
        </group>}
        <Block at={[25, 22, 5]} size={[3, 24, 10]} color="#35565c" />
        <Control x={-14} label="REORDER" width={29} onClick={() => setReversed(current => !current)} />
        <Control x={20} label={imageOpen ? 'X' : 'IMAGE'} width={22} onClick={() => setImageOpen(current => !current)} />
        <Sign at={[0, 60, 3.2]} size={3}>FOUR MESSAGES → COMPOSER</Sign>
    </group>;
}

function StaffBelfry() {
    const clapper = useRef<THREE.Group>(null);
    const [push, setPush] = useState(false);
    useFrame(({ clock }) => {
        if (clapper.current) clapper.current.rotation.z = Math.sin(clock.elapsedTime * 3) * 0.2;
    });
    return <group>
        <Block at={[0, 74, 0]} size={[34, 4, 28]} color="#35565c" />
        <mesh position={[0, 61, 0]} castShadow>
            <cylinderGeometry args={[8, 15, 22, 16, 1, true]} />
            <meshStandardMaterial color="#eec567" metalness={0.45} roughness={0.35} side={THREE.DoubleSide} />
        </mesh>
        <group ref={clapper} position={[0, 70, 0]}>
            <Block at={[0, -12, 0]} size={[2, 24, 2]} color="#725332" />
            <mesh position={[0, -25, 0]} castShadow><sphereGeometry args={[3, 10, 8]} /><meshStandardMaterial color="#725332" /></mesh>
        </group>
        <Block at={[0, 30, 7]} size={[44, 38, 4]} color="#35565c" />
        <Sign at={[0, 43, 9.2]} size={3}>MESSAGE · CASE</Sign>
        <Sign at={[0, 35, 9.2]} size={3}>URGENT · ASSIGNED</Sign>
        <Sign at={[0, 27, 9.2]} size={3}>CATEGORY / CHAT SCOPE</Sign>
        <Sign at={[0, 20, 9.2]} size={3}>{push ? 'WEB PUSH' : 'IN APP'}</Sign>
        <Control x={0} label="PREVIEW ALERT ROUTE" width={47} onClick={() => setPush(current => !current)} />
    </group>;
}

import { KeyboardControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing';
import { Physics } from '@react-three/rapier';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Hud } from './components/Hud';
import { TownWorld } from './components/TownWorld';
import type { InteractionState } from './town/geometry';
import { entityById } from './town/townData';

type ControlName = 'forward' | 'back' | 'left' | 'right' | 'interact' | 'close';

export function App() {
    const shellRef = useRef<HTMLElement>(null);
    const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
    const [travelTargetEntityId, setTravelTargetEntityId] = useState<string | null>(null);
    const [interaction, setInteraction] = useState<InteractionState>({
        nearestEntityId: null,
        playerPosition: [0, 0, 310],
    });

    const controls = useMemo(
        () => [
            { name: 'forward' as ControlName, keys: ['ArrowUp', 'KeyW'] },
            { name: 'back' as ControlName, keys: ['ArrowDown', 'KeyS'] },
            { name: 'left' as ControlName, keys: ['ArrowLeft', 'KeyA'] },
            { name: 'right' as ControlName, keys: ['ArrowRight', 'KeyD'] },
            { name: 'interact' as ControlName, keys: ['KeyE', 'Enter'] },
            { name: 'close' as ControlName, keys: ['Escape'] },
        ],
        []
    );

    const selectedEntity = selectedEntityId ? entityById.get(selectedEntityId) ?? null : null;
    const nearestEntity = interaction.nearestEntityId ? entityById.get(interaction.nearestEntityId) ?? null : null;

    useEffect(() => {
        if (!selectedEntityId) {
            return;
        }

        if (interaction.nearestEntityId !== selectedEntityId) {
            setSelectedEntityId(null);
        }
    }, [interaction.nearestEntityId, selectedEntityId]);

    const handleTravelTarget = (entityId: string | null) => {
        setSelectedEntityId(null);
        setTravelTargetEntityId(entityId);
    };

    return (
        <KeyboardControls map={controls}>
            <main ref={shellRef} className="app-shell">
                <Canvas
                    camera={{ position: [0, 250, 520], fov: 52, near: 1, far: 2400 }}
                    dpr={[1, 2]}
                    gl={{ antialias: true, alpha: false }}
                    shadows
                    fallback={<div className="webgl-fallback">WebGL is not available.</div>}
                >
                    <color attach="background" args={['#78bff2']} />
                    <fog attach="fog" args={['#a8d8f6', 920, 2050]} />
                    <Suspense fallback={null}>
                        <Physics colliders={false} gravity={[0, -9.81, 0]}>
                            <TownWorld
                                selectedEntityId={selectedEntityId}
                                setSelectedEntityId={setSelectedEntityId}
                                setInteraction={setInteraction}
                                travelTargetEntityId={travelTargetEntityId}
                                setTravelTargetEntityId={handleTravelTarget}
                            />
                        </Physics>
                        <EffectComposer multisampling={0}>
                            <Bloom luminanceThreshold={0.78} intensity={0.42} mipmapBlur />
                            <Vignette darkness={0.18} offset={0.24} />
                        </EffectComposer>
                    </Suspense>
                </Canvas>
                <Hud
                    selectedEntity={selectedEntity}
                    nearestEntity={nearestEntity}
                    onClose={() => setSelectedEntityId(null)}
                    onSelect={(entityId) => setSelectedEntityId(entityId)}
                />
            </main>
        </KeyboardControls>
    );
}

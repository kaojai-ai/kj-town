import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { QualityTier, QualityPreset, QUALITY_PRESETS, PerformanceStats } from './types';
import { DeviceProfiler } from './DeviceProfiler';
import { RuntimePerformanceMonitor } from './RuntimePerformanceMonitor';
import { AdaptiveQualityController } from './AdaptiveQualityController';

interface AdaptiveQualityContextType {
    currentTier: QualityTier;
    preset: QualityPreset;
    perfStats: PerformanceStats;
    setTier: (tier: QualityTier) => void;
    updatePerfStats: (stats: Partial<PerformanceStats>) => void;
}

const defaultStats: PerformanceStats = {
    currentTier: 'MID',
    fps: 60,
    frameMs: 16.7,
    drawCalls: 0,
    triangles: 0,
    geometries: 0,
    textures: 0,
    visibleBuildings: 0,
    flowPacketInstances: 0,
    shadowEnabled: true,
    currentDPR: 1.25
};

const AdaptiveQualityContext = createContext<AdaptiveQualityContextType | null>(null);

export function AdaptiveQualityProvider({ children }: { children: React.ReactNode }) {
    const [currentTier, setCurrentTier] = useState<QualityTier>('MID');
    const [perfStats, setPerfStats] = useState<PerformanceStats>(defaultStats);

    const preset = QUALITY_PRESETS[currentTier];

    const updatePerfStats = (newStats: Partial<PerformanceStats>) => {
        setPerfStats(prev => ({
            ...prev,
            ...newStats,
            currentTier,
            currentDPR: preset.dpr
        }));
    };

    const setTier = (tier: QualityTier) => {
        setCurrentTier(tier);
    };

    return (
        <AdaptiveQualityContext.Provider value={{
            currentTier,
            preset,
            perfStats,
            setTier,
            updatePerfStats
        }}>
            {children}
        </AdaptiveQualityContext.Provider>
    );
}

export function useAdaptiveQuality() {
    const context = useContext(AdaptiveQualityContext);
    if (!context) {
        throw new Error('useAdaptiveQuality must be used within an AdaptiveQualityProvider');
    }
    return context;
}

// Inner manager to be mounted inside R3F <Canvas>
export function AdaptiveQualityManager() {
    const { gl } = useThree();
    const { currentTier, setTier, updatePerfStats } = useAdaptiveQuality();
    
    const controllerRef = useRef<AdaptiveQualityController | null>(null);
    const frameCountRef = useRef<number>(0);

    useEffect(() => {
        const profiler = new DeviceProfiler(gl.getContext());
        const monitor = new RuntimePerformanceMonitor(gl);
        const controller = new AdaptiveQualityController(profiler, monitor);
        
        // Sync initial tier suggested by the profiler
        setTier(controller.getTier());
        controllerRef.current = controller;
    }, [gl]);

    // Keep controller's internal tier synchronized with context tier (if changed manually or via state sync)
    useEffect(() => {
        if (controllerRef.current) {
            controllerRef.current.setTier(currentTier);
        }
    }, [currentTier]);

    useFrame(() => {
        const controller = controllerRef.current;
        if (!controller) return;

        // Run frame monitoring and adaptivity logic
        const tierChanged = controller.update();
        if (tierChanged) {
            setTier(controller.getTier());
        }

        // Throttle React state updates to avoid rendering overhead
        frameCountRef.current++;
        if (frameCountRef.current % 15 === 0) {
            const debugInfo = controller.getDebugInfo();
            updatePerfStats({
                fps: debugInfo.fps,
                frameMs: debugInfo.frameMs,
                drawCalls: debugInfo.stats.drawCalls,
                triangles: debugInfo.stats.triangles,
                geometries: debugInfo.stats.geometries,
                textures: debugInfo.stats.textures
            });
        }
    });

    return null;
}

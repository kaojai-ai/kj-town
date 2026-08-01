export type QualityTier = 'LOW' | 'MID' | 'HIGH';

export interface QualityPreset {
    dpr: number;
    lodHighDistance: number;
    lodMediumDistance: number;
    shadowDistance: number;
    flowPacketMaxDistance: number;
    flowPacketDensity: number;
    lodUpdateEveryFrames: number;
    maxDrawCalls: number;
    maxTriangles: number;
    maxTextures: number;
    postProcessing: boolean;
    bloomIntensity: number;
}

export const QUALITY_PRESETS: Record<QualityTier, QualityPreset> = {
    LOW: {
        dpr: 1.0,
        lodHighDistance: 1200,
        lodMediumDistance: 2000,
        shadowDistance: 0, // 0 means disabled
        flowPacketMaxDistance: 800,
        flowPacketDensity: 0.2,
        lodUpdateEveryFrames: 30,
        maxDrawCalls: 45,
        maxTriangles: 100000,
        maxTextures: 20,
        postProcessing: false,
        bloomIntensity: 0
    },
    MID: {
        dpr: 1.25,
        lodHighDistance: 2000,
        lodMediumDistance: 3000,
        shadowDistance: 600,
        flowPacketMaxDistance: 1200,
        flowPacketDensity: 0.5,
        lodUpdateEveryFrames: 15,
        maxDrawCalls: 90,
        maxTriangles: 300000,
        maxTextures: 80,
        postProcessing: true,
        bloomIntensity: 0.25
    },
    HIGH: {
        dpr: 1.5,
        lodHighDistance: 3000,
        lodMediumDistance: 4500,
        shadowDistance: 1200,
        flowPacketMaxDistance: 1800,
        flowPacketDensity: 1.0,
        lodUpdateEveryFrames: 10,
        maxDrawCalls: 180,
        maxTriangles: 750000,
        maxTextures: 100,
        postProcessing: true,
        bloomIntensity: 0.42
    }
};

export interface PerformanceStats {
    currentTier: QualityTier;
    fps: number;
    frameMs: number;
    drawCalls: number;
    triangles: number;
    geometries: number;
    textures: number;
    visibleBuildings: number;
    flowPacketInstances: number;
    shadowEnabled: boolean;
    currentDPR: number;
}

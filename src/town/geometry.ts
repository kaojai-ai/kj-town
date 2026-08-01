import type { TownEntity, Vec3 } from './townData';

export interface InteractionState {
    nearestEntityId: string | null;
    playerPosition: Vec3;
}

export function distance2d(a: Vec3, b: Vec3): number {
    const dx = a[0] - b[0];
    const dz = a[2] - b[2];
    return Math.hypot(dx, dz);
}

export function findNearestEntity(position: Vec3, entities: readonly TownEntity[], maxDistance: number): TownEntity | null {
    let nearest: TownEntity | null = null;
    let nearestDistance = maxDistance;

    for (const entity of entities) {
        const radius = Math.max(entity.size[0], entity.size[2]) * 0.58;
        const distance = distance2d(position, entity.position) - radius;
        if (distance < nearestDistance) {
            nearest = entity;
            nearestDistance = distance;
        }
    }

    return nearest;
}

export type EntityLODLevel = 'high' | 'medium' | 'low' | 'none';

export type EntityMaterialLOD = 'full' | 'simple' | 'flat';

export interface EntityRenderQuality {
    score: number;
    screenSizePx: number;
    lod: EntityLODLevel;
    material: EntityMaterialLOD;
    castsShadow: boolean;
    receivesShadow: boolean;
    showLabel: boolean;
    animationStride: number;
}

export interface EntityRenderQualityInput {
    cameraPosition: Vec3;
    cameraFovDegrees: number;
    viewportHeight: number;
    entityPosition: Vec3;
    entityRadius: number;
    inFrustum: boolean;
    qualityBias: number;
    labelMinScore: number;
}

function clamp01(value: number): number {
    return Math.max(0, Math.min(1, value));
}

function smoothstep(edge0: number, edge1: number, value: number): number {
    const t = clamp01((value - edge0) / (edge1 - edge0));
    return t * t * (3 - 2 * t);
}

export function getProjectedRadiusPixels(
    radius: number,
    distance: number,
    cameraFovDegrees: number,
    viewportHeight: number
): number {
    const fovRadians = (cameraFovDegrees * Math.PI) / 180;
    const safeDistance = Math.max(distance, 0.001);
    return (radius / safeDistance) * (viewportHeight / Math.tan(fovRadians * 0.5));
}

export function getEntityLODLevel(
    cameraPosition: Vec3,
    entityPosition: Vec3,
    inFrustum: boolean,
    highDistance: number = 800,
    mediumDistance: number = 1600
): EntityLODLevel {
    if (!inFrustum) {
        return 'none';
    }

    const dx = entityPosition[0] - cameraPosition[0];
    const dy = entityPosition[1] - cameraPosition[1];
    const dz = entityPosition[2] - cameraPosition[2];
    const distance3d = Math.hypot(dx, dy, dz);

    if (distance3d < highDistance) {
        return 'high';
    }

    if (distance3d < mediumDistance) {
        return 'medium';
    }

    return 'low';
}

export function getProgressiveEntityQuality({
    cameraPosition,
    cameraFovDegrees,
    viewportHeight,
    entityPosition,
    entityRadius,
    inFrustum,
    qualityBias,
    labelMinScore,
}: EntityRenderQualityInput): EntityRenderQuality {
    if (!inFrustum) {
        return {
            score: 0,
            screenSizePx: 0,
            lod: 'none',
            material: 'flat',
            castsShadow: false,
            receivesShadow: false,
            showLabel: false,
            animationStride: 60,
        };
    }

    const dx = entityPosition[0] - cameraPosition[0];
    const dy = entityPosition[1] - cameraPosition[1];
    const dz = entityPosition[2] - cameraPosition[2];
    const distance3d = Math.hypot(dx, dy, dz);
    const screenSizePx = getProjectedRadiusPixels(entityRadius, distance3d, cameraFovDegrees, viewportHeight);
    const score = clamp01(smoothstep(18, 260, screenSizePx) * qualityBias);

    if (score < 0.04) {
        return {
            score,
            screenSizePx,
            lod: 'none',
            material: 'flat',
            castsShadow: false,
            receivesShadow: false,
            showLabel: false,
            animationStride: 60,
        };
    }

    if (score < 0.28) {
        return {
            score,
            screenSizePx,
            lod: 'low',
            material: 'flat',
            castsShadow: false,
            receivesShadow: false,
            showLabel: score >= labelMinScore,
            animationStride: 30,
        };
    }

    if (score < 0.68) {
        return {
            score,
            screenSizePx,
            lod: 'medium',
            material: 'simple',
            castsShadow: score > 0.56,
            receivesShadow: true,
            showLabel: score >= labelMinScore,
            animationStride: 12,
        };
    }

    return {
        score,
        screenSizePx,
        lod: 'high',
        material: 'full',
        castsShadow: true,
        receivesShadow: true,
        showLabel: true,
        animationStride: 1,
    };
}

export function resolveBlockedPosition(nextPosition: Vec3, currentPosition: Vec3, entities: readonly TownEntity[]): Vec3 {
    const mapLimit = 720;
    let x = Math.max(-mapLimit, Math.min(mapLimit, nextPosition[0]));
    let z = Math.max(-mapLimit, Math.min(mapLimit, nextPosition[2]));

    for (const entity of entities) {
        const blockerRadius = Math.max(entity.size[0], entity.size[2]) * 0.62;
        const dx = x - entity.position[0];
        const dz = z - entity.position[2];
        const distance = Math.hypot(dx, dz);

        if (distance < blockerRadius) {
            if (distance < 0.001) {
                x = currentPosition[0];
                z = currentPosition[2];
                continue;
            }

            const push = blockerRadius / distance;
            x = entity.position[0] + dx * push;
            z = entity.position[2] + dz * push;
        }
    }

    return [x, nextPosition[1], z];
}

export function midpoint(a: Vec3, b: Vec3): Vec3 {
    return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];
}

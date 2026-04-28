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

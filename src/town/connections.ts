import type { TownEntity } from './townData';

export interface TownConnectionPair {
    id: string;
    sourceId: string;
    targetId: string;
    source: TownEntity;
    target: TownEntity;
}

export function getTownConnectionPairs(entities: readonly TownEntity[]): TownConnectionPair[] {
    const entityById = new Map(entities.map((entity) => [entity.id, entity]));
    const seenPairIds = new Set<string>();
    const pairs: TownConnectionPair[] = [];

    for (const source of entities) {
        for (const targetId of source.connections) {
            if (targetId === source.id) {
                continue;
            }

            const target = entityById.get(targetId);
            if (!target) {
                continue;
            }

            const id = getNormalizedConnectionId(source.id, target.id);
            if (seenPairIds.has(id)) {
                continue;
            }

            seenPairIds.add(id);
            pairs.push({
                id,
                sourceId: source.id,
                targetId: target.id,
                source,
                target,
            });
        }
    }

    return pairs;
}

export function getConnectedEntityIds(entityId: string | null, pairs: readonly TownConnectionPair[]): string[] {
    if (!entityId) {
        return [];
    }

    const connectedIds = new Set<string>();

    for (const pair of pairs) {
        if (pair.sourceId === entityId) {
            connectedIds.add(pair.targetId);
        }

        if (pair.targetId === entityId) {
            connectedIds.add(pair.sourceId);
        }
    }

    return [...connectedIds];
}

function getNormalizedConnectionId(sourceId: string, targetId: string): string {
    return sourceId < targetId ? `${sourceId}:${targetId}` : `${targetId}:${sourceId}`;
}


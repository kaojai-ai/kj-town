import type { TownDistrict, TownEntity } from './townData';

const tierRank: Record<TownEntity['tier'], number> = {
    foundation: 0,
    critical: 1,
    business: 2,
    edge: 3,
};

const statusRank: Record<TownEntity['status'], number> = {
    resilient: 0,
    operational: 1,
    observed: 2,
};

export interface TownDistrictSummary {
    id: string;
    name: string;
    color: string;
    totalEntities: number;
    visibleEntities: number;
}

export interface TownSystemOverview {
    totalEntities: number;
    visibleEntities: number;
    districtSummaries: TownDistrictSummary[];
    tierCounts: Record<TownEntity['tier'], number>;
    statusCounts: Record<TownEntity['status'], number>;
}

export function sortTownEntitiesForNavigator(entities: readonly TownEntity[]): TownEntity[] {
    return [...entities].sort((left, right) => {
        const tierDiff = tierRank[left.tier] - tierRank[right.tier];
        if (tierDiff !== 0) {
            return tierDiff;
        }

        const statusDiff = statusRank[left.status] - statusRank[right.status];
        if (statusDiff !== 0) {
            return statusDiff;
        }

        return left.name.localeCompare(right.name);
    });
}

export function getTownSystemOverview(
    districts: readonly TownDistrict[],
    entities: readonly TownEntity[],
    visibleEntities: readonly TownEntity[] = entities
): TownSystemOverview {
    const visibleIds = new Set(visibleEntities.map((entity) => entity.id));

    return {
        totalEntities: entities.length,
        visibleEntities: visibleEntities.length,
        districtSummaries: districts.map((district) => ({
            id: district.id,
            name: district.name,
            color: district.color,
            totalEntities: entities.filter((entity) => entity.clusterId === district.id).length,
            visibleEntities: entities.filter((entity) => entity.clusterId === district.id && visibleIds.has(entity.id)).length,
        })),
        tierCounts: countBy(visibleEntities, 'tier'),
        statusCounts: countBy(visibleEntities, 'status'),
    };
}

function countBy<Key extends 'tier' | 'status'>(
    entities: readonly TownEntity[],
    key: Key
): Record<TownEntity[Key], number> {
    const initial = key === 'tier'
        ? { foundation: 0, critical: 0, business: 0, edge: 0 }
        : { resilient: 0, operational: 0, observed: 0 };

    return entities.reduce((counts, entity) => {
        counts[entity[key]] += 1;
        return counts;
    }, initial as Record<TownEntity[Key], number>);
}


import type { TownEntity } from './townData';

export interface TownExplorerFilters {
    query: string;
    tier: TownEntity['tier'] | 'all';
    status: TownEntity['status'] | 'all';
}

export const defaultTownExplorerFilters: TownExplorerFilters = {
    query: '',
    tier: 'all',
    status: 'all',
};

export function hasActiveTownExplorerFilters(filters: TownExplorerFilters): boolean {
    return filters.query.trim().length > 0 || filters.tier !== 'all' || filters.status !== 'all';
}

export function filterTownEntities(entities: readonly TownEntity[], filters: TownExplorerFilters): TownEntity[] {
    const normalizedQuery = filters.query.trim().toLowerCase();

    return entities.filter((entity) => {
        if (filters.tier !== 'all' && entity.tier !== filters.tier) {
            return false;
        }

        if (filters.status !== 'all' && entity.status !== filters.status) {
            return false;
        }

        if (!normalizedQuery) {
            return true;
        }

        return getEntitySearchText(entity).includes(normalizedQuery);
    });
}

function getEntitySearchText(entity: TownEntity): string {
    return [
        entity.id,
        entity.name,
        entity.kind,
        entity.tier,
        entity.status,
        entity.shape,
        entity.summary,
        entity.details.purpose,
        entity.details.systemRole,
        ...entity.details.flows,
        ...entity.details.reliability,
        ...entity.details.related,
        ...entity.connections,
    ]
        .join(' ')
        .toLowerCase();
}


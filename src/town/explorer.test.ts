import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { getConnectedEntityIds, getTownConnectionPairs } from './connections';
import { defaultTownExplorerFilters, filterTownEntities, hasActiveTownExplorerFilters } from './explorer';
import { getTownSystemOverview, sortTownEntitiesForNavigator } from './systemStats';
import { townDistricts, townEntities, type TownEntity } from './townData';

describe('town explorer filters', () => {
    it('matches entities by name and summary text', () => {
        const results = filterTownEntities(townEntities, {
            ...defaultTownExplorerFilters,
            query: 'database',
        });

        assert.ok(results.some((entity) => entity.id === 'database-cluster'));
        assert.ok(results.every((entity) => entity.name.toLowerCase().includes('database') || entity.summary.toLowerCase().includes('database') || entity.details.systemRole.toLowerCase().includes('database') || entity.details.purpose.toLowerCase().includes('database') || entity.details.related.some((related) => related.toLowerCase().includes('database')) || entity.details.flows.some((flow) => flow.toLowerCase().includes('database')) || entity.details.reliability.some((item) => item.toLowerCase().includes('database')) || entity.connections.some((connection) => connection.includes('database'))));
    });

    it('combines query, tier, and status filters', () => {
        const results = filterTownEntities(townEntities, {
            query: 'ai',
            tier: 'critical',
            status: 'resilient',
        });

        assert.ok(results.length > 0);
        assert.ok(results.every((entity) => entity.tier === 'critical'));
        assert.ok(results.every((entity) => entity.status === 'resilient'));
    });

    it('reports whether filters are active', () => {
        assert.equal(hasActiveTownExplorerFilters(defaultTownExplorerFilters), false);
        assert.equal(hasActiveTownExplorerFilters({ ...defaultTownExplorerFilters, query: 'line' }), true);
        assert.equal(hasActiveTownExplorerFilters({ ...defaultTownExplorerFilters, tier: 'business' }), true);
        assert.equal(hasActiveTownExplorerFilters({ ...defaultTownExplorerFilters, status: 'observed' }), true);
    });
});

describe('town connection utilities', () => {
    it('deduplicates reciprocal connection pairs', () => {
        const source: TownEntity = {
            ...townEntities[0],
            id: 'source',
            name: 'Source',
            connections: ['target'],
        };
        const target: TownEntity = {
            ...townEntities[1],
            id: 'target',
            name: 'Target',
            connections: ['source'],
        };

        assert.deepEqual(getTownConnectionPairs([source, target]).map((pair) => pair.id), ['source:target']);
    });

    it('returns neighbors for either side of a connection', () => {
        const pairs = getTownConnectionPairs(townEntities);
        const connectedIds = getConnectedEntityIds('kaojai-core', pairs);

        assert.ok(connectedIds.includes('database-cluster'));
        assert.ok(connectedIds.includes('event-bus'));
    });
});

describe('town data integrity', () => {
    it('has unique entity ids', () => {
        const ids = townEntities.map((entity) => entity.id);

        assert.equal(new Set(ids).size, ids.length);
    });

    it('uses existing district ids for every entity cluster', () => {
        const districtIds = new Set(townDistricts.map((district) => district.id));
        const missingClusterIds = townEntities.filter((entity) => !districtIds.has(entity.clusterId));

        assert.deepEqual(missingClusterIds, []);
    });

    it('uses existing entity ids for every connection', () => {
        const entityIds = new Set(townEntities.map((entity) => entity.id));
        const missingConnections = townEntities.flatMap((entity) =>
            entity.connections
                .filter((targetId) => !entityIds.has(targetId))
                .map((targetId) => `${entity.id}->${targetId}`)
        );

        assert.deepEqual(missingConnections, []);
    });

    it('does not connect an entity to itself', () => {
        const selfConnections = townEntities.flatMap((entity) =>
            entity.connections
                .filter((targetId) => targetId === entity.id)
                .map((targetId) => `${entity.id}->${targetId}`)
        );

        assert.deepEqual(selfConnections, []);
    });
});



describe('town system overview', () => {
    it('summarizes visible entities by district, tier, and status', () => {
        const visibleEntities = townEntities.filter((entity) => entity.clusterId === 'ai');
        const overview = getTownSystemOverview(townDistricts, townEntities, visibleEntities);
        const aiSummary = overview.districtSummaries.find((summary) => summary.id === 'ai');

        assert.equal(overview.totalEntities, townEntities.length);
        assert.equal(overview.visibleEntities, visibleEntities.length);
        assert.equal(aiSummary?.visibleEntities, visibleEntities.length);
        assert.equal(overview.tierCounts.critical, visibleEntities.filter((entity) => entity.tier === 'critical').length);
        assert.equal(overview.statusCounts.resilient, visibleEntities.filter((entity) => entity.status === 'resilient').length);
    });

    it('sorts navigator entities by operational importance before name', () => {
        const sorted = sortTownEntitiesForNavigator([
            townEntities.find((entity) => entity.id === 'broadcast-campaigns')!,
            townEntities.find((entity) => entity.id === 'database-cluster')!,
            townEntities.find((entity) => entity.id === 'auth-service')!,
        ]);

        assert.deepEqual(sorted.map((entity) => entity.id), [
            'database-cluster',
            'auth-service',
            'broadcast-campaigns',
        ]);
    });
});

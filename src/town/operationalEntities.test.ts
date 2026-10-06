import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { townDistricts, townEntities } from './townData';
import { operationalEntities } from './operationalEntities';
import { getConnectedEntityIds, getTownConnectionPairs } from './connections';

// Protect architectural and physical constraints as the town continues to migrate.
describe('migrated operational landmarks', () => {
    it('keeps every landmark in a known district with resolvable graph connections', () => {
        const ids = new Set(townEntities.map(entity => entity.id));
        assert.equal(ids.size, townEntities.length);
        for (const entity of operationalEntities) {
            assert.ok(townDistricts.some(district => district.id === entity.clusterId));
            assert.ok(entity.connections.length > 0);
            for (const id of entity.connections) assert.ok(ids.has(id), `${entity.id} → ${id}`);
        }
    });

    it('leaves each new building grounded with clearance from neighboring footprints', () => {
        for (const entity of operationalEntities) {
            assert.equal(entity.position[1], 0);
            assert.ok(entity.size.every(dimension => dimension > 0));
            for (const other of townEntities) {
                if (other.id === entity.id) continue;
                const xClearance = Math.abs(entity.position[0] - other.position[0]) - (entity.size[0] + other.size[0]) / 2;
                const zClearance = Math.abs(entity.position[2] - other.position[2]) - (entity.size[2] + other.size[2]) / 2;
                assert.ok(xClearance >= 8 || zClearance >= 8, `${entity.id} overlaps ${other.id}`);
            }
        }
    });

    it('makes feature ownership discoverable from the existing modules', () => {
        const pairs = getTownConnectionPairs(townEntities);
        const inboxNeighbors = getConnectedEntityIds('unified-inbox', pairs);
        for (const id of ['inbox-case-board', 'website-widget-studio', 'preset-reply-workshop', 'staff-notification-belfry']) {
            assert.ok(inboxNeighbors.includes(id), id);
        }
        assert.ok(getConnectedEntityIds('booking-management', pairs).includes('booking-intake'));
        assert.ok(getConnectedEntityIds('partner-exchange', pairs).includes('catalog-import-depot'));
        assert.ok(getConnectedEntityIds('inbox-case-board', pairs).includes('issue-management'));
    });
});

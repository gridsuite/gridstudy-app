/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { extractUuidsFromVariationId, resolveForVariationId } from './sensitivity-analysis-utils';

describe('extractUuidsFromVarId', () => {
    it('extracts a single UUID from a standard varId', () => {
        const varId = '[1e34a601-fb40-4df1-8dc6-09aac5ef717e] (REGULAR)';
        expect(extractUuidsFromVariationId(varId)).toEqual(['1e34a601-fb40-4df1-8dc6-09aac5ef717e']);
    });

    it('extracts multiple comma-separated UUIDs', () => {
        const varId = '[1e34a601-fb40-4df1-8dc6-09aac5ef717e, 2b45c702-ac51-4e20-9ed7-10bbd6af828f] (REGULAR)';
        expect(extractUuidsFromVariationId(varId)).toEqual([
            '1e34a601-fb40-4df1-8dc6-09aac5ef717e',
            '2b45c702-ac51-4e20-9ed7-10bbd6af828f',
        ]);
    });

    it('returns an empty array when no UUIDs are present', () => {
        expect(extractUuidsFromVariationId('SomePlainText (REGULAR)')).toEqual([]);
    });

    it('returns an empty array for an empty string', () => {
        expect(extractUuidsFromVariationId('')).toEqual([]);
    });

    it('extracts UUIDs regardless of surrounding text', () => {
        const varId = 'prefix-1e34a601-fb40-4df1-8dc6-09aac5ef717e-suffix';
        expect(extractUuidsFromVariationId(varId)).toEqual(['1e34a601-fb40-4df1-8dc6-09aac5ef717e']);
    });

    it('handles three UUIDs', () => {
        const varId =
            '[aaaaaaaa-0000-0000-0000-000000000001, aaaaaaaa-0000-0000-0000-000000000002, aaaaaaaa-0000-0000-0000-000000000003] (CONTINGENCY)';
        expect(extractUuidsFromVariationId(varId)).toEqual([
            'aaaaaaaa-0000-0000-0000-000000000001',
            'aaaaaaaa-0000-0000-0000-000000000002',
            'aaaaaaaa-0000-0000-0000-000000000003',
        ]);
    });
});

describe('resolveVarId', () => {
    it('replaces a single UUID with its name', () => {
        const varId = '[1e34a601-fb40-4df1-8dc6-09aac5ef717e] (REGULAR)';
        const map = new Map([['1e34a601-fb40-4df1-8dc6-09aac5ef717e', 'FilterA']]);
        expect(resolveForVariationId(varId, map)).toBe('[FilterA] (REGULAR)');
    });

    it('replaces multiple comma-separated UUIDs with their names', () => {
        const varId = '[1e34a601-fb40-4df1-8dc6-09aac5ef717e, 2b45c702-ac51-4e20-9ed7-10bbd6af828f] (REGULAR)';
        const map = new Map([
            ['1e34a601-fb40-4df1-8dc6-09aac5ef717e', 'FilterA'],
            ['2b45c702-ac51-4e20-9ed7-10bbd6af828f', 'FilterB'],
        ]);
        expect(resolveForVariationId(varId, map)).toBe('[FilterA, FilterB] (REGULAR)');
    });

    it('leaves unknown UUIDs as-is when not found in the map', () => {
        const varId = '[1e34a601-fb40-4df1-8dc6-09aac5ef717e] (REGULAR)';
        const map = new Map<string, string>();
        expect(resolveForVariationId(varId, map)).toBe('[1e34a601-fb40-4df1-8dc6-09aac5ef717e] (REGULAR)');
    });

    it('replaces only known UUIDs and leaves unknown ones as-is', () => {
        const varId = '[1e34a601-fb40-4df1-8dc6-09aac5ef717e, 2b45c702-ac51-4e20-9ed7-10bbd6af828f] (REGULAR)';
        const map = new Map([['1e34a601-fb40-4df1-8dc6-09aac5ef717e', 'FilterA']]);
        expect(resolveForVariationId(varId, map)).toBe('[FilterA, 2b45c702-ac51-4e20-9ed7-10bbd6af828f] (REGULAR)');
    });

    it('returns the original string unchanged when no UUIDs are present', () => {
        const varId = 'SomePlainText (REGULAR)';
        const map = new Map([['1e34a601-fb40-4df1-8dc6-09aac5ef717e', 'FilterA']]);
        expect(resolveForVariationId(varId, map)).toBe('SomePlainText (REGULAR)');
    });

    it('handles an empty string', () => {
        expect(resolveForVariationId('', new Map())).toBe('');
    });

    it('preserves the suffix type (CONTINGENCY)', () => {
        const varId = '[1e34a601-fb40-4df1-8dc6-09aac5ef717e] (CONTINGENCY)';
        const map = new Map([['1e34a601-fb40-4df1-8dc6-09aac5ef717e', 'MyFilter']]);
        expect(resolveForVariationId(varId, map)).toBe('[MyFilter] (CONTINGENCY)');
    });
});

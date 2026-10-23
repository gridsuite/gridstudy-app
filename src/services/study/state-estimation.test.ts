/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { UUID } from 'node:crypto';
import { backendFetchJson, type GlobalFilters } from '@gridsuite/commons-ui';
import { fetchStateEstimationMeasurements, fetchStateEstimationResult } from './state-estimation';

jest.mock('@gridsuite/commons-ui', () => ({
    ...jest.requireActual('@gridsuite/commons-ui'),
    backendFetchJson: jest.fn(),
}));

const STUDY = '11111111-1111-1111-1111-111111111111' as UUID;
const NODE = '22222222-2222-2222-2222-222222222222' as UUID;
const ROOT = '33333333-3333-3333-3333-333333333333' as UUID;
const fetchJson = jest.mocked(backendFetchJson);

function lastUrl() {
    return new URL(String(fetchJson.mock.calls.at(-1)?.[0]), 'http://localhost');
}

beforeEach(() => {
    jest.spyOn(console, 'info').mockImplementation(() => {});
    jest.spyOn(console, 'debug').mockImplementation(() => {});
    fetchJson.mockReset();
    fetchJson.mockResolvedValue([]);
});

describe('fetchStateEstimationMeasurements', () => {
    it('targets the measurements route of the node and root network', async () => {
        await fetchStateEstimationMeasurements(STUDY, NODE, ROOT);

        expect(lastUrl().pathname).toMatch(
            new RegExp(`/studies/${STUDY}/root-networks/${ROOT}/nodes/${NODE}/state-estimation/measurements$`)
        );
    });

    it('sends no parameter without global filters', async () => {
        await fetchStateEstimationMeasurements(STUDY, NODE, ROOT);

        expect(lastUrl().search).toBe('');
    });

    it('sends the global filters as one raw JSON parameter, encoded once', async () => {
        const globalFilters = {
            countryCode: ['FR', 'a+b', '100%', '%41', 'x&y=z', 'é "q" \\'],
            voltageRanges: [[225, 400]],
            substationProperty: { region: ['sud ouest'] },
            substationOrVoltageLevelFilter: [NODE],
        } as GlobalFilters;

        await fetchStateEstimationMeasurements(STUDY, NODE, ROOT, globalFilters);

        const { searchParams, search } = lastUrl();
        expect([...searchParams.keys()]).toEqual(['globalFilters']);
        expect(JSON.parse(searchParams.get('globalFilters') as string)).toEqual(globalFilters);
        expect(search).toBe(`?${new URLSearchParams({ globalFilters: JSON.stringify(globalFilters) })}`);
    });

    it('is a plain GET without request options', async () => {
        await fetchStateEstimationMeasurements(STUDY, NODE, ROOT, { countryCode: ['FR'] });

        expect(fetchJson).toHaveBeenCalledTimes(1);
        expect(fetchJson.mock.calls[0]).toHaveLength(1);
    });

    it('returns the rows as they are, duplicates included', async () => {
        const row = { equipmentId: 'L1', measurementType: 'TENSION', outOfBound: false };
        fetchJson.mockResolvedValue([row, row]);

        await expect(fetchStateEstimationMeasurements(STUDY, NODE, ROOT)).resolves.toEqual([row, row]);
    });

    it('returns null when there is no result (204)', async () => {
        fetchJson.mockResolvedValue(null);

        await expect(fetchStateEstimationMeasurements(STUDY, NODE, ROOT)).resolves.toBeNull();
    });

    it('rejects when the request fails', async () => {
        fetchJson.mockRejectedValue(new Error('boom'));

        await expect(fetchStateEstimationMeasurements(STUDY, NODE, ROOT)).rejects.toThrow('boom');
    });
});

describe('fetchStateEstimationResult', () => {
    it('stays the unparameterized full result request', async () => {
        await fetchStateEstimationResult(STUDY, NODE, ROOT);

        expect(lastUrl().pathname).toMatch(/\/state-estimation\/result$/);
        expect(lastUrl().search).toBe('');
    });
});

/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    DEFAULT_MAP_MIN_SUBSTATION_NOMINAL_VOLTAGE,
    getDefaultFilteredNominalVoltages,
} from './nominal-voltage-filter-utils';

test('getDefaultFilteredNominalVoltages keeps only substations above 200 kV', () => {
    expect(getDefaultFilteredNominalVoltages([63, 90, 150, 200, 225, 400])).toEqual([225, 400]);
});

test('getDefaultFilteredNominalVoltages returns an empty selection when no substation is above 200 kV', () => {
    expect(getDefaultFilteredNominalVoltages([63, 90, 150, DEFAULT_MAP_MIN_SUBSTATION_NOMINAL_VOLTAGE])).toEqual([]);
});

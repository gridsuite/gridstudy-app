/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { ReadonlyDeep } from 'type-fest';
import type { SpreadsheetTabDefinition } from '../spreadsheet.type';
import { EQUIPMENT_TYPES } from '../../../utils/equipment-types';
import { defaultNumericFilterConfig, defaultTextFilterConfig, typeAndFetchers } from './common-config';
import { genericColumnOfPropertiesReadonly } from './column-properties';

export const BUS_TAB_DEF = {
    index: 14,
    name: 'Buses',
    ...typeAndFetchers(EQUIPMENT_TYPES.BUS),
    columns: [
        {
            id: 'ID',
            field: 'id',
            isDefaultSort: true,
            ...defaultTextFilterConfig,
        },
        {
            id: 'Magnitude',
            field: 'v',
            numeric: true,
            fractionDigits: 1,
            ...defaultNumericFilterConfig,
        },
        {
            id: 'Angle',
            field: 'angle',
            numeric: true,
            fractionDigits: 1,
            ...defaultNumericFilterConfig,
        },
        {
            id: 'ConnectedComponent',
            field: 'connectedComponentNum',
            ...defaultNumericFilterConfig,
        },
        {
            id: 'SynchronousComponent',
            field: 'synchronousComponentNum',
            ...defaultNumericFilterConfig,
        },
        {
            id: 'VoltageLevelId',
            field: 'voltageLevelId',
            ...defaultTextFilterConfig,
        },
        {
            id: 'Country',
            field: 'country',
            ...defaultTextFilterConfig,
        },
        {
            id: 'NominalV',
            field: 'nominalVoltage',
            numeric: true,
            fractionDigits: 0,
            ...defaultNumericFilterConfig,
        },
        genericColumnOfPropertiesReadonly,
    ],
} as const satisfies ReadonlyDeep<SpreadsheetTabDefinition>;

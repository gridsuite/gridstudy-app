/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { SpreadsheetTabDefinition } from '../spreadsheet.type';
import { EQUIPMENT_TYPES } from '../../../utils/equipment-types';
import { typeAndFetchers } from './common-config';
import { genericColumnOfPropertiesReadonly } from './column-properties';
import { numberColumnDefinition, textColumnDefinition } from '../common-column-definitions';

const tab = 'Buses';

export const BUS_TAB_DEF: SpreadsheetTabDefinition = {
    index: 14,
    name: tab,
    ...typeAndFetchers(EQUIPMENT_TYPES.BUS),
    columns: [
        {
            field: 'id',
            initialSort: 'asc',
            ...textColumnDefinition('id', 'ID', tab),
        },
        {
            field: 'v',
            ...numberColumnDefinition('magnitude', 'Voltage magnitude', tab, 1),
        },
        {
            field: 'angle',
            ...numberColumnDefinition('angle', 'Voltage angle', tab, 1),
        },
        {
            field: 'connectedComponentNum',
            ...numberColumnDefinition('connectedComponentNum', 'connected component', tab, 0),
        },
        {
            field: 'synchronousComponentNum',
            ...numberColumnDefinition('synchronousComponentNum', 'Synchronous component', tab, 0),
        },
        {
            field: 'voltageLevelId',
            ...textColumnDefinition('voltageLevelId', 'Voltage level ID', tab),
        },
        {
            field: 'country',
            ...textColumnDefinition('country', 'Country', tab),
        },
        {
            field: 'nominalVoltage',
            ...numberColumnDefinition('nominalVoltage', 'Nominal V', tab, 0),
        },
        genericColumnOfPropertiesReadonly(tab),
    ],
};

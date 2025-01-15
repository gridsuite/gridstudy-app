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
import { booleanColumnDefinition, numberColumnDefinition, textColumnDefinition } from '../common-column-definitions';

const tab = 'Loads';

export const LOAD_TAB_DEF: SpreadsheetTabDefinition = {
    index: 6,
    name: tab,
    ...typeAndFetchers(EQUIPMENT_TYPES.LOAD),
    columns: [
        {
            field: 'id',
            initialSort: 'asc',
            ...textColumnDefinition('id', 'ID', tab),
        },
        {
            field: 'name',
            ...textColumnDefinition('name', 'Name', tab),
        },
        {
            field: 'type',
            ...textColumnDefinition('type', 'Load Type', tab),
        },
        {
            field: 'voltageLevelId',
            ...textColumnDefinition('voltageLevelId', 'Voltage Level ID', tab),
        },
        {
            field: 'country',
            ...textColumnDefinition('country', 'Country', tab),
        },
        {
            field: 'nominalVoltage',
            ...numberColumnDefinition('country', 'Country', tab, 0),
        },
        {
            field: 'p',
            ...numberColumnDefinition('activePower', 'Active Power', tab, 1),
        },
        {
            field: 'q',
            ...numberColumnDefinition('reactivePower', 'Reactive Power', tab, 1),
        },
        {
            field: 'p0',
            ...numberColumnDefinition('p0', 'P0', tab, 1),
        },
        {
            field: 'q0',
            ...numberColumnDefinition('q0', 'Q0', tab, 1),
        },
        {
            field: 'terminalConnected',
            ...booleanColumnDefinition('terminalConnected', 'Connected', tab),
        },
        genericColumnOfPropertiesReadonly(tab),
    ],
};

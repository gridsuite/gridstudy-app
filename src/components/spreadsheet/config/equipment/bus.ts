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
            colId: 'ID',
            field: 'id',
            ...textColumnDefinition('ID', tab),
        },
        {
            colId: 'Magnitude',
            field: 'v',
            ...numberColumnDefinition('Voltage magnitude', tab, 1),
        },
        {
            colId: 'Angle',
            field: 'angle',
            ...numberColumnDefinition('Voltage angle', tab, 1),
        },
        {
            colId: 'ConnectedComponent',
            field: 'connectedComponentNum',
            ...numberColumnDefinition('Connected component', tab, 0),
        },
        {
            colId: 'SynchronousComponent',
            field: 'synchronousComponentNum',
            ...numberColumnDefinition('Synchronous component', tab, 0),
        },
        {
            colId: 'VoltageLevelId',
            field: 'voltageLevelId',
            ...textColumnDefinition('Voltage level ID', tab),
        },
        {
            colId: 'Country',
            field: 'country',
            ...textColumnDefinition('Country', tab),
        },
        {
            colId: 'NominalV',
            field: 'nominalVoltage',
            ...numberColumnDefinition('Nominal V', tab, 0),
        },
        genericColumnOfPropertiesReadonly(tab),
    ],
};

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
import { textAgGridColumnDefinition, numberAgGridColumnDefinition } from '../common-column-definitions';

export const BUS_TAB_DEF: SpreadsheetTabDefinition = {
    index: 14,
    name: 'Buses',
    ...typeAndFetchers(EQUIPMENT_TYPES.BUS),
    columns: [
        {
            id: 'ID',
            field: 'id',
            initialSort: 'asc',
            ...textAgGridColumnDefinition,
        },
        {
            id: 'Magnitude',
            field: 'v',
            ...numberAgGridColumnDefinition(1),
        },
        {
            id: 'Angle',
            field: 'angle',
            ...numberAgGridColumnDefinition(1),
        },
        {
            id: 'ConnectedComponent',
            field: 'connectedComponentNum',
            ...numberAgGridColumnDefinition(),
        },
        {
            id: 'SynchronousComponent',
            field: 'synchronousComponentNum',
            ...numberAgGridColumnDefinition(),
        },
        {
            id: 'VoltageLevelId',
            field: 'voltageLevelId',
            ...textAgGridColumnDefinition,
        },
        {
            id: 'Country',
            field: 'country',
            ...textAgGridColumnDefinition,
        },
        {
            id: 'NominalV',
            field: 'nominalVoltage',
            ...numberAgGridColumnDefinition(0),
        },
        genericColumnOfPropertiesReadonly,
    ],
};

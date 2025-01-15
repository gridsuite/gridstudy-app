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
import { textColumnDefinition, numberColumnDefinition, booleanColumnDefinition } from '../common-column-definitions';
import { unitToMicroUnit } from '@gridsuite/commons-ui';

const tab = 'Lines';

export const LINE_TAB_DEF: SpreadsheetTabDefinition = {
    index: 2,
    name: tab,
    ...typeAndFetchers(EQUIPMENT_TYPES.LINE),
    columns: [
        {
            field: 'id',
            initialSort: 'asc',
            ...textColumnDefinition('id', 'ID', tab),
        },
        {
            id: 'Name',
            field: 'name',
            ...textColumnDefinition('id', 'ID', tab),
        },
        {
            field: 'voltageLevelId1',
            ...textColumnDefinition('voltageLevelId1', 'Voltage Level ID 1', tab),
        },
        {
            field: 'voltageLevelId2',
            ...textColumnDefinition('voltageLevelId2', 'Voltage Level ID 2', tab),
        },
        {
            field: 'country1',
            ...textColumnDefinition('country1', 'Country 1', tab),
        },
        {
            field: 'country2',
            ...textColumnDefinition('country2', 'Country 2', tab),
        },
        {
            field: 'nominalVoltage1',
            ...numberColumnDefinition('nominalVoltage1', 'Nominal V side 1', tab, 0),
        },
        {
            field: 'nominalVoltage2',
            ...numberColumnDefinition('nominalVoltage2', 'Nominal V side 2', tab, 0),
        },
        {
            field: 'p1',
            ...numberColumnDefinition('ActivePowerSide1', 'Active Power side 1', tab, 1),
        },
        {
            field: 'p2',
            ...numberColumnDefinition('ActivePowerSide2', 'Active Power side 2', tab, 1),
        },
        {
            field: 'q1',
            ...numberColumnDefinition('ReactivePowerSide1', 'Reactive Power side 1', tab, 1),
        },
        {
            field: 'q2',
            ...numberColumnDefinition('ReactivePowerSide2', 'Reactive Power side 2', tab, 1),
        },
        {
            field: 'r',
            ...numberColumnDefinition('r', 'R', tab, 1),
        },
        {
            field: 'x',
            ...numberColumnDefinition('x', 'X', tab, 1),
        },
        {
            valueGetter: (params) => unitToMicroUnit(params.data.g1),
            ...numberColumnDefinition('g1', 'G side 1', tab, 1),
        },
        {
            valueGetter: (params) => unitToMicroUnit(params.data.g2),
            ...numberColumnDefinition('g2', 'G side 2', tab, 1),
        },
        {
            valueGetter: (params) => unitToMicroUnit(params.data.b1),
            ...numberColumnDefinition('b1', 'B side 1', tab, 1),
        },
        {
            valueGetter: (params) => unitToMicroUnit(params.data.b2),
            ...numberColumnDefinition('b2', 'B side 2', tab, 1),
        },
        {
            field: 'terminal1Connected',
            ...booleanColumnDefinition('terminal1Connected', 'Connected side 1', tab),
        },
        {
            field: 'terminal2Connected',
            ...booleanColumnDefinition('terminal2Connected', 'Connected side 2', tab),
        },
        genericColumnOfPropertiesReadonly(tab),
    ],
};

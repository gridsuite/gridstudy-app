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
import { unitToMicroUnit } from '@gridsuite/commons-ui';

const tab = 'Lines';

export const LINE_TAB_DEF: SpreadsheetTabDefinition = {
    index: 2,
    name: tab,
    ...typeAndFetchers(EQUIPMENT_TYPES.LINE),
    columns: [
        {
            colId: 'ID',
            field: 'id',
            ...textColumnDefinition('ID', tab),
        },
        {
            colId: 'Name',
            field: 'name',
            ...textColumnDefinition('Name', tab),
        },
        {
            colId: 'VoltageLevelIdSide1',
            field: 'voltageLevelId1',
            ...textColumnDefinition('Voltage level ID 1', tab),
        },
        {
            colId: 'VoltageLevelIdSide2',
            field: 'voltageLevelId2',
            ...textColumnDefinition('Voltage level ID 2', tab),
        },
        {
            colId: 'Country1',
            field: 'country1',
            ...textColumnDefinition('Country 1', tab),
        },
        {
            colId: 'Country2',
            field: 'country2',
            ...textColumnDefinition('Country 2', tab),
        },
        {
            colId: 'nominalVoltage1KV',
            field: 'nominalVoltage1',
            ...numberColumnDefinition('Nominal voltage 1 (kV)', tab, 0),
        },
        {
            colId: 'nominalVoltage2KV',
            field: 'nominalVoltage2',
            ...numberColumnDefinition('Nominal voltage 2 (kV)', tab, 0),
        },
        {
            colId: 'ActivePowerSide1',
            field: 'p1',
            ...numberColumnDefinition('p1 (MW)', tab, 1),
        },
        {
            colId: 'ActivePowerSide2',
            field: 'p2',
            ...numberColumnDefinition('p2 (MW)', tab, 1),
        },
        {
            colId: 'ReactivePowerSide1',
            field: 'q1',
            ...numberColumnDefinition('q1 (MVar)', tab, 1),
        },
        {
            colId: 'ReactivePowerSide2',
            field: 'q2',
            ...numberColumnDefinition('q2 (MVar)', tab, 1),
        },
        {
            colId: 'r',
            field: 'r',
            ...numberColumnDefinition('Series resistance (Ω)', tab, 1),
        },
        {
            colId: 'x',
            field: 'x',
            ...numberColumnDefinition('Series reactance (Ω)', tab, 1),
        },
        {
            colId: 'g1',
            valueGetter: (params) => unitToMicroUnit(params.data.g1),
            ...numberColumnDefinition('Shunt conductance 1 (μS)', tab, 1),
        },
        {
            colId: 'g2',
            valueGetter: (params) => unitToMicroUnit(params.data.g2),
            ...numberColumnDefinition('Shunt conductance 2 (μS)', tab, 1),
        },
        {
            colId: 'b1',
            valueGetter: (params) => unitToMicroUnit(params.data.b1),
            ...numberColumnDefinition('Shunt susceptance 1 (μS)', tab, 1),
        },
        {
            colId: 'b2',
            valueGetter: (params) => unitToMicroUnit(params.data.b2),
            ...numberColumnDefinition('Shunt susceptance 2 (μS)', tab, 1),
        },
        {
            colId: 'connected1',
            field: 'terminal1Connected',
            ...booleanColumnDefinition('Connected 1', tab),
        },
        {
            colId: 'connected2',
            field: 'terminal2Connected',
            ...booleanColumnDefinition('Connected 2', tab),
        },
        genericColumnOfPropertiesReadonly(tab),
    ],
};

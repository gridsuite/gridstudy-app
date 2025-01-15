/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { SpreadsheetTabDefinition } from '../spreadsheet.type';
import { EQUIPMENT_TYPES } from '../../../utils/equipment-types';
import { typeAndFetchers } from './common-config';
import { convertInputValue, FieldType } from '@gridsuite/commons-ui';
import { genericColumnOfPropertiesReadonly } from './column-properties';
import { booleanColumnDefinition, textColumnDefinition, numberColumnDefinition } from '../common-column-definitions';

const tab = 'TieLines';

export const TIE_LINE_TAB_DEF: SpreadsheetTabDefinition = {
    index: 15,
    name: tab,
    ...typeAndFetchers(EQUIPMENT_TYPES.TIE_LINE),
    columns: [
        {
            id: 'ID',
            initialSort: 'asc',
            ...textColumnDefinition('id', 'ID', tab),
        },
        {
            field: 'name',
            ...textColumnDefinition('name', 'Name', tab),
        },
        {
            field: 'voltageLevelId1',
            ...textColumnDefinition('voltageLevelId1', 'Voltage level ID 1', tab),
        },
        {
            field: 'voltageLevelId2',
            ...textColumnDefinition('voltageLevelId2', 'Voltage level ID 2', tab),
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
            ...numberColumnDefinition('nominalVoltage1', 'Nominal voltage 1 (kV)', tab, 0),
        },
        {
            field: 'nominalVoltage2',
            ...numberColumnDefinition('nominalVoltage2', 'Nominal voltage 2 (kV)', tab, 0),
        },
        {
            field: 'p1',
            ...numberColumnDefinition('ActivePowerSide1', 'p1 (MW)', tab, 1),
        },
        {
            field: 'p2',
            ...numberColumnDefinition('ActivePowerSide2', 'p2 (MW)', tab, 1),
        },
        {
            id: 'ReactivePowerSide1',
            field: 'q1',
            ...numberColumnDefinition('ReactivePowerSide1', 'q1 (MVar)', tab, 1),
        },
        {
            id: 'ReactivePowerSide2',
            field: 'q2',
            ...numberColumnDefinition('ReactivePowerSide2', 'q2 (MVar)', tab, 1),
        },
        {
            field: 'r',
            ...numberColumnDefinition('r', 'Series resistance (Ω)', tab, 1),
        },
        {
            field: 'x',
            ...numberColumnDefinition('x', 'Series reactance (Ω)', tab, 1),
        },
        {
            valueGetter: (params) => convertInputValue(FieldType.G1, params.data.g1),
            ...numberColumnDefinition('g1', 'Shunt conductance 1 (μS)', tab, 1),
        },
        {
            valueGetter: (params) => convertInputValue(FieldType.G2, params.data.g2),
            ...numberColumnDefinition('g2', 'Shunt conductance 1 (μS)', tab, 1),
        },
        {
            valueGetter: (params) => convertInputValue(FieldType.B1, params.data.b1),
            ...numberColumnDefinition('b1', 'Shunt susceptance 1 (μS)', tab, 1),
        },
        {
            valueGetter: (params) => convertInputValue(FieldType.B2, params.data.b2),
            ...numberColumnDefinition('b2', 'Shunt susceptance 2 (μS)', tab, 1),
        },
        {
            field: 'terminal1Connected',
            ...booleanColumnDefinition('terminal1Connected', 'Connected 1', tab),
        },
        {
            field: 'terminal2Connected',
            ...booleanColumnDefinition('terminal2Connected', 'Connected 2', tab),
        },
        genericColumnOfPropertiesReadonly(tab),
    ],
};

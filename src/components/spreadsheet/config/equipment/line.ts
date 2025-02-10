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
import {
    booleanColumnDefinition,
    enumColumnDefinition,
    numberColumnDefinition,
    textColumnDefinition,
} from '../common-column-definitions';
import { COLUMN_TYPES } from 'components/custom-aggrid/custom-aggrid-header.type';

const tab = 'Lines';

export const LINE_TAB_DEF: SpreadsheetTabDefinition = {
    index: 2,
    name: tab,
    ...typeAndFetchers(EQUIPMENT_TYPES.LINE),
    columns: [
        {
            id: 'ID',
            name: 'ID',
            type: COLUMN_TYPES.TEXT,
            formula: 'id',
            dependencies: [],
        },
        {
            id: 'Name',
            name: 'Name',
            type: COLUMN_TYPES.TEXT,
            formula: 'name',
            dependencies: [],
        },
        {
            id: 'VoltageLevelIdSide1',
            name: 'Voltage level ID 1',
            type: COLUMN_TYPES.TEXT,
            formula: 'voltageLevelId1',
            dependencies: [],
        },
        {
            id: 'VoltageLevelIdSide2',
            name: 'Voltage level ID 2',
            type: COLUMN_TYPES.TEXT,
            formula: 'voltageLevelId2',
            dependencies: [],
        },
        {
            id: 'Country1',
            name: 'Country 1',
            type: COLUMN_TYPES.ENUM,
            formula: 'country1',
            dependencies: [],
        },
        {
            id: 'Country2',
            name: 'Country 2',
            type: COLUMN_TYPES.ENUM,
            formula: 'country2',
            dependencies: [],
        },
        {
            id: 'NominalVoltage1KV',
            name: 'Nominal voltage 1 (kV)',
            type: COLUMN_TYPES.NUMBER,
            formula: 'nominalVoltage1',
            precision: 0,
            dependencies: [],
        },
        {
            id: 'NominalVoltage2KV',
            name: 'Nominal voltage 2 (kV)',
            type: COLUMN_TYPES.NUMBER,
            formula: 'nominalVoltage2',
            precision: 0,
            dependencies: [],
        },
        {
            id: 'ActivePowerSide1',
            name: 'p1 (MW)',
            type: COLUMN_TYPES.NUMBER,
            formula: 'p1',
            precision: 1,
            dependencies: [],
        },
        {
            id: 'ActivePowerSide2',
            name: 'p2 (MW)',
            type: COLUMN_TYPES.NUMBER,
            formula: 'p2',
            precision: 1,
            dependencies: [],
        },
        {
            id: 'ReactivePowerSide1',
            name: 'q1 (MVar)',
            type: COLUMN_TYPES.NUMBER,
            formula: 'q1',
            precision: 1,
            dependencies: [],
        },
        {
            id: 'ReactivePowerSide2',
            name: 'q2 (MVar)',
            type: COLUMN_TYPES.NUMBER,
            formula: 'q2',
            precision: 1,
            dependencies: [],
        },
        {
            id: 'R',
            name: 'Series resistance (Ω)',
            type: COLUMN_TYPES.NUMBER,
            formula: 'r',
            precision: 1,
            dependencies: [],
        },
        {
            id: 'X',
            name: 'Series reactance (Ω)',
            type: COLUMN_TYPES.NUMBER,
            formula: 'x',
            precision: 1,
            dependencies: [],
        },
        {
            id: 'G1',
            name: 'Shunt conductance 1 (μS)',
            type: COLUMN_TYPES.NUMBER,
            formula: 'g1',
            precision: 1,
            dependencies: [],
        },
        {
            id: 'G2',
            name: 'Shunt conductance 2 (μS)',
            type: COLUMN_TYPES.NUMBER,
            formula: 'g2',
            precision: 1,
            dependencies: [],
        },
        {
            id: 'B1',
            name: 'Shunt susceptance 1 (μS)',
            type: COLUMN_TYPES.NUMBER,
            formula: 'b1',
            precision: 1,
            dependencies: [],
        },
        {
            id: 'B2',
            name: 'Shunt susceptance 2 (μS)',
            type: COLUMN_TYPES.NUMBER,
            formula: 'b2',
            precision: 1,
            dependencies: [],
        },
        {
            id: 'Connected1',
            name: 'Connected 1',
            type: COLUMN_TYPES.BOOLEAN,
            formula: 'terminal1Connected',
            dependencies: [],
        },
        {
            id: 'Connected2',
            name: 'Connected 2',
            type: COLUMN_TYPES.BOOLEAN,
            formula: 'terminal2Connected',
            dependencies: [],
        },
    ],
    // columns: [
    //     {
    //         colId: 'ID',
    //         field: 'id',
    //         ...textColumnDefinition('ID', tab),
    //     },
    //     {
    //         colId: 'Name',
    //         field: 'name',
    //         ...textColumnDefinition('Name', tab),
    //     },
    //     {
    //         colId: 'VoltageLevelIdSide1',
    //         field: 'voltageLevelId1',
    //         ...textColumnDefinition('Voltage level ID 1', tab),
    //     },
    //     {
    //         colId: 'VoltageLevelIdSide2',
    //         field: 'voltageLevelId2',
    //         ...textColumnDefinition('Voltage level ID 2', tab),
    //     },
    //     {
    //         colId: 'Country1',
    //         field: 'country1',
    //         ...enumColumnDefinition('Country 1', tab),
    //     },
    //     {
    //         colId: 'Country2',
    //         field: 'country2',
    //         ...enumColumnDefinition('Country 2', tab),
    //     },
    //     {
    //         colId: 'nominalVoltage1KV',
    //         field: 'nominalVoltage1',
    //         ...numberColumnDefinition('Nominal voltage 1 (kV)', tab, 0),
    //     },
    //     {
    //         colId: 'nominalVoltage2KV',
    //         field: 'nominalVoltage2',
    //         ...numberColumnDefinition('Nominal voltage 2 (kV)', tab, 0),
    //     },
    //     {
    //         colId: 'ActivePowerSide1',
    //         field: 'p1',
    //         ...numberColumnDefinition('p1 (MW)', tab, 1),
    //     },
    //     {
    //         colId: 'ActivePowerSide2',
    //         field: 'p2',
    //         ...numberColumnDefinition('p2 (MW)', tab, 1),
    //     },
    //     {
    //         colId: 'ReactivePowerSide1',
    //         field: 'q1',
    //         ...numberColumnDefinition('q1 (MVar)', tab, 1),
    //     },
    //     {
    //         colId: 'ReactivePowerSide2',
    //         field: 'q2',
    //         ...numberColumnDefinition('q2 (MVar)', tab, 1),
    //     },
    //     {
    //         colId: 'r',
    //         field: 'r',
    //         ...numberColumnDefinition('Series resistance (Ω)', tab, 1),
    //     },
    //     {
    //         colId: 'x',
    //         field: 'x',
    //         ...numberColumnDefinition('Series reactance (Ω)', tab, 1),
    //     },
    //     {
    //         colId: 'g1',
    //         field: 'g1', // TODO: useless for AgGrid used only for static/custom columns export
    //         valueGetter: (params) => convertInputValue(FieldType.G1, params.data.g1),
    //         ...numberColumnDefinition('Shunt conductance 1 (μS)', tab, 1),
    //     },
    //     {
    //         colId: 'g2',
    //         field: 'g2', // TODO: useless for AgGrid used only for static/custom columns export
    //         valueGetter: (params) => convertInputValue(FieldType.G2, params.data.g2),
    //         ...numberColumnDefinition('Shunt conductance 2 (μS)', tab, 1),
    //     },
    //     {
    //         colId: 'b1',
    //         field: 'b1', // TODO: useless for AgGrid used only for static/custom columns export
    //         valueGetter: (params) => convertInputValue(FieldType.B1, params.data.b1),
    //         ...numberColumnDefinition('Shunt susceptance 1 (μS)', tab, 1),
    //     },
    //     {
    //         colId: 'b2',
    //         field: 'b2', // TODO: useless for AgGrid used only for static/custom columns export
    //         valueGetter: (params) => convertInputValue(FieldType.B2, params.data.b2),
    //         ...numberColumnDefinition('Shunt susceptance 2 (μS)', tab, 1),
    //     },
    //     {
    //         colId: 'connected1',
    //         field: 'terminal1Connected',
    //         ...booleanColumnDefinition('Connected 1', tab),
    //     },
    //     {
    //         colId: 'connected2',
    //         field: 'terminal2Connected',
    //         ...booleanColumnDefinition('Connected 2', tab),
    //     },
    //     genericColumnOfPropertiesReadonly(tab),
    // ],
};

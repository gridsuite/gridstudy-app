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
import { enumColumnDefinition, numberColumnDefinition, textColumnDefinition } from '../common-column-definitions';
import { COLUMN_TYPES } from 'components/custom-aggrid/custom-aggrid-header.type';

const tab = 'VoltageLevels';

export const VOLTAGE_LEVEL_TAB_DEF: SpreadsheetTabDefinition = {
    index: 1,
    name: tab,
    ...typeAndFetchers(EQUIPMENT_TYPES.VOLTAGE_LEVEL),
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
            id: 'SubstationId',
            name: 'Substation ID',
            type: COLUMN_TYPES.TEXT,
            formula: 'substationId',
            dependencies: [],
        },
        {
            id: 'Country',
            name: 'Country',
            type: COLUMN_TYPES.ENUM,
            formula: 'country',
            dependencies: [],
        },
        {
            id: 'NominalV',
            name: 'Nominal V',
            type: COLUMN_TYPES.NUMBER,
            formula: 'nominalV',
            precision: 0,
            dependencies: [],
        },
        {
            id: 'LowVoltageLimit',
            name: 'Low voltage limit (kV)',
            type: COLUMN_TYPES.NUMBER,
            formula: 'lowVoltageLimit',
            precision: 1,
            dependencies: [],
        },
        {
            id: 'HighVoltageLimit',
            name: 'High voltage limit (kV)',
            type: COLUMN_TYPES.NUMBER,
            formula: 'highVoltageLimit',
            precision: 1,
            dependencies: [],
        },
        {
            id: 'IpMin',
            name: 'ISC min (kA)',
            type: COLUMN_TYPES.NUMBER,
            formula: 'identifiableShortCircuit.ipMin',
            precision: 1,
            dependencies: [],
        },
        {
            id: 'IpMax',
            name: 'ISC max (kA)',
            type: COLUMN_TYPES.NUMBER,
            formula: 'identifiableShortCircuit.ipMax',
            precision: 1,
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
    //         colId: 'SubstationId',
    //         field: 'substationId',
    //         ...textColumnDefinition('Substation ID', tab),
    //     },
    //     {
    //         colId: 'Country',
    //         field: 'country',
    //         ...enumColumnDefinition('Country', tab),
    //     },
    //     {
    //         colId: 'NominalV',
    //         field: 'nominalV',
    //         ...numberColumnDefinition('Nominal V', tab, 0),
    //     },
    //     {
    //         colId: 'lowVoltageLimit',
    //         field: 'lowVoltageLimit',
    //         ...numberColumnDefinition('Low voltage limit (kV)', tab, 1),
    //     },
    //     {
    //         colId: 'highVoltageLimit',
    //         field: 'highVoltageLimit',
    //         ...numberColumnDefinition('High voltage limit (kV)', tab, 1),
    //     },
    //     {
    //         colId: 'IpMin',
    //         field: 'identifiableShortCircuit.ipMin', // TODO: useless for AgGrid used only for static/custom columns export
    //         valueGetter: (params) =>
    //             convertInputValue(
    //                 FieldType.LOW_SHORT_CIRCUIT_CURRENT_LIMIT,
    //                 params.data?.identifiableShortCircuit?.ipMin
    //             ),
    //         ...numberColumnDefinition('ISC min (kA)', tab, 1),
    //     },
    //     {
    //         colId: 'IpMax',
    //         field: 'identifiableShortCircuit.ipMax', // TODO: useless for AgGrid used only for static/custom columns export
    //         valueGetter: (params) =>
    //             convertInputValue(
    //                 FieldType.HIGH_SHORT_CIRCUIT_CURRENT_LIMIT,
    //                 params.data?.identifiableShortCircuit?.ipMax
    //             ),
    //         ...numberColumnDefinition('ISC max (kA)', tab, 1),
    //     },
    //     genericColumnOfPropertiesReadonly(tab),
    // ],
};

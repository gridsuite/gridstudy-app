/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { SpreadsheetTabDefinition } from '../spreadsheet.type';
import { EQUIPMENT_TYPES } from '../../../utils/equipment-types';
import { typeAndFetchers } from './common-config';
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
        {
            id: 'p1',
            name: 'p1 (MW)',
            type: COLUMN_TYPES.NUMBER,
            formula: 'p1',
            precision: 1,
            dependencies: [],
        },
        {
            id: 'p2',
            name: 'p2 (MW)',
            type: COLUMN_TYPES.NUMBER,
            formula: 'p2',
            precision: 1,
            dependencies: [],
        },
        {
            id: 'q1',
            name: 'q1 (MVar)',
            type: COLUMN_TYPES.NUMBER,
            formula: 'q1',
            precision: 1,
            dependencies: [],
        },
        {
            id: 'q2',
            name: 'q2 (MVar)',
            type: COLUMN_TYPES.NUMBER,
            formula: 'q2',
            precision: 1,
            dependencies: [],
        },
        {
            id: 'r',
            name: 'Series resistance (Ω)',
            type: COLUMN_TYPES.NUMBER,
            formula: 'r',
            precision: 1,
            dependencies: [],
        },
        {
            id: 'x',
            name: 'Series reactance (Ω)',
            type: COLUMN_TYPES.NUMBER,
            formula: 'x',
            precision: 1,
            dependencies: [],
        },
        {
            id: 'g1',
            name: 'Shunt conductance 1 (μS)',
            type: COLUMN_TYPES.NUMBER,
            formula: 'unitToMicroUnit(g1)',
            precision: 1,
            dependencies: [],
        },
        {
            id: 'g2',
            name: 'Shunt conductance 2 (μS)',
            type: COLUMN_TYPES.NUMBER,
            formula: 'unitToMicroUnit(g2)',
            precision: 1,
            dependencies: [],
        },
        {
            id: 'b1',
            name: 'Shunt susceptance 1 (μS)',
            type: COLUMN_TYPES.NUMBER,
            formula: 'unitToMicroUnit(b1)',
            precision: 1,
            dependencies: [],
        },
        {
            id: 'b2',
            name: 'Shunt susceptance 2 (μS)',
            type: COLUMN_TYPES.NUMBER,
            formula: 'unitToMicroUnit(b2)',
            precision: 1,
            dependencies: [],
        },
    ],
};

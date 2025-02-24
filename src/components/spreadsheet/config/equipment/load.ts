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

const tab = 'Loads';

export const LOAD_TAB_DEF: SpreadsheetTabDefinition = {
    index: 6,
    name: tab,
    ...typeAndFetchers(EQUIPMENT_TYPES.LOAD),
    columns: [
        {
            id: 'id',
            name: 'ID',
            type: COLUMN_TYPES.TEXT,
            formula: 'id',
            dependencies: [],
        },
        {
            id: 'name',
            name: 'Name',
            type: COLUMN_TYPES.TEXT,
            formula: 'name',
            dependencies: [],
        },
        {
            id: 'type',
            name: 'Type',
            type: COLUMN_TYPES.ENUM,
            formula: 'type',
            dependencies: [],
        },
        {
            id: 'country',
            name: 'Country',
            type: COLUMN_TYPES.ENUM,
            formula: 'country',
            dependencies: [],
        },
        {
            id: 'voltageLevelId',
            name: 'Voltage level ID',
            type: COLUMN_TYPES.TEXT,
            formula: 'voltageLevelId',
            dependencies: [],
        },
        {
            id: 'nominalVoltage',
            name: 'Nominal V',
            type: COLUMN_TYPES.NUMBER,
            formula: 'nominalVoltage',
            precision: 0,
            dependencies: [],
        },
        {
            id: 'terminalConnected',
            name: 'Connected',
            type: COLUMN_TYPES.BOOLEAN,
            formula: 'terminalConnected',
            dependencies: [],
        },
        {
            id: 'p',
            name: 'p (MW)',
            type: COLUMN_TYPES.NUMBER,
            formula: 'p',
            precision: 1,
            dependencies: [],
        },
        {
            id: 'q',
            name: 'q (MVar)',
            type: COLUMN_TYPES.NUMBER,
            formula: 'q',
            precision: 1,
            dependencies: [],
        },
        {
            id: 'p0',
            name: 'Constant P (MW)',
            type: COLUMN_TYPES.NUMBER,
            formula: 'p0',
            precision: 1,
            dependencies: [],
        },
        {
            id: 'q0',
            name: 'Constant Q (MVar)',
            type: COLUMN_TYPES.NUMBER,
            formula: 'q0',
            precision: 1,
            dependencies: [],
        },
    ],
};

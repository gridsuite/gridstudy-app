/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { EQUIPMENT_TYPES } from '../../../utils/equipment-types';
import { typeAndFetchers } from './common-config';
import type { SpreadsheetTabDefinition } from '../spreadsheet.type';
import { COLUMN_TYPES } from 'components/custom-aggrid/custom-aggrid-header.type';

const tab = 'Batteries';

export const BATTERY_TAB_DEF: SpreadsheetTabDefinition = {
    index: 9,
    name: tab,
    ...typeAndFetchers(EQUIPMENT_TYPES.BATTERY),
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
            id: 'minP',
            name: 'Min P (MW)',
            type: COLUMN_TYPES.NUMBER,
            formula: 'minP',
            precision: 1,
            dependencies: [],
        },
        {
            id: 'maxP',
            name: 'Max P (MW)',
            type: COLUMN_TYPES.NUMBER,
            formula: 'maxP',
            precision: 1,
            dependencies: [],
        },
        {
            id: 'targetP',
            name: 'Target P (MW)',
            type: COLUMN_TYPES.NUMBER,
            formula: 'targetP',
            precision: 1,
            dependencies: [],
        },
        {
            id: 'targetQ',
            name: 'Target Q (MVar)',
            type: COLUMN_TYPES.NUMBER,
            formula: 'targetQ',
            precision: 1,
            dependencies: [],
        },
        {
            id: 'activePowerControl.participate',
            name: 'Active power control',
            type: COLUMN_TYPES.BOOLEAN,
            formula: 'activePowerControl.participate',
            dependencies: [],
        },
        {
            id: 'activePowerControl.droop',
            name: 'Droop (%)',
            type: COLUMN_TYPES.NUMBER,
            formula: 'activePowerControl.droop',
            precision: 1,
            dependencies: [],
        },
    ],
};

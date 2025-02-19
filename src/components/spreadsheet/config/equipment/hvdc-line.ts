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

const tab = 'HvdcLines';

export const HVDC_LINE_TAB_DEF: SpreadsheetTabDefinition = {
    index: 10,
    name: tab,
    ...typeAndFetchers(EQUIPMENT_TYPES.HVDC_LINE),
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
            id: 'country1',
            name: 'Country 1',
            type: COLUMN_TYPES.ENUM,
            formula: 'country1',
            dependencies: [],
        },
        {
            id: 'country2',
            name: 'Country 2',
            type: COLUMN_TYPES.ENUM,
            formula: 'country2',
            dependencies: [],
        },
        {
            id: 'voltageLevelId1',
            name: 'Voltage level ID 1',
            type: COLUMN_TYPES.TEXT,
            formula: 'voltageLevelId1',
            dependencies: [],
        },
        {
            id: 'voltageLevelId2',
            name: 'Voltage level ID 2',
            type: COLUMN_TYPES.TEXT,
            formula: 'voltageLevelId2',
            dependencies: [],
        },
        {
            id: 'convertersMode',
            name: 'Converters mode',
            type: COLUMN_TYPES.ENUM,
            formula: 'convertersMode',
            dependencies: [],
        },
        {
            id: 'converterStationId1',
            name: 'Converter station ID 1',
            type: COLUMN_TYPES.TEXT,
            formula: 'converterStationId1',
            dependencies: [],
        },
        {
            id: 'converterStationId2',
            name: 'Converter station ID 2',
            type: COLUMN_TYPES.TEXT,
            formula: 'converterStationId2',
            dependencies: [],
        },
        {
            id: 'r',
            name: 'Resistance',
            type: COLUMN_TYPES.NUMBER,
            formula: 'r',
            precision: 1,
            dependencies: [],
        },
        {
            id: 'activePowerSetpoint',
            name: 'Active power set point (MW)',
            type: COLUMN_TYPES.NUMBER,
            formula: 'activePowerSetpoint',
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
            id: 'hvdcOperatorActivePowerRange.oprFromCS1toCS2',
            name: 'Operational limit (side_1 to side_2) (MW)',
            type: COLUMN_TYPES.NUMBER,
            formula: 'hvdcOperatorActivePowerRange.oprFromCS1toCS2',
            precision: 1,
            dependencies: [],
        },
        {
            id: 'hvdcOperatorActivePowerRange.oprFromCS2toCS1',
            name: 'Operational limit (side_2 to side_1) (MW)',
            type: COLUMN_TYPES.NUMBER,
            formula: 'hvdcOperatorActivePowerRange.oprFromCS2toCS1',
            precision: 1,
            dependencies: [],
        },
        {
            id: 'hvdcAngleDroopActivePowerControl.isEnabled',
            name: 'AC emulation',
            type: COLUMN_TYPES.BOOLEAN,
            formula: 'hvdcAngleDroopActivePowerControl.isEnabled',
            dependencies: [],
        },
        {
            id: 'hvdcAngleDroopActivePowerControl.droop',
            name: 'K (MW/Deg)',
            type: COLUMN_TYPES.NUMBER,
            formula: 'hvdcAngleDroopActivePowerControl.droop',
            precision: 1,
            dependencies: [],
        },
        {
            id: 'hvdcAngleDroopActivePowerControl.p0',
            name: 'P0 (side_1 to side_2) (MW)',
            type: COLUMN_TYPES.NUMBER,
            formula: 'hvdcAngleDroopActivePowerControl.p0',
            precision: 1,
            dependencies: [],
        },
    ],
};

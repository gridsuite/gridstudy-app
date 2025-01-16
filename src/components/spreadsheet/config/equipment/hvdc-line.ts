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

const tab = 'HvdcLines';

export const HVDC_LINE_TAB_DEF: SpreadsheetTabDefinition = {
    index: 10,
    name: tab,
    ...typeAndFetchers(EQUIPMENT_TYPES.HVDC_LINE),
    columns: [
        {
            colId: 'ID',
            field: 'id',
            initialSort: 'asc',
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
            colId: 'ConvertersMode',
            field: 'convertersMode',
            ...textColumnDefinition('Converters mode', tab),
        },
        {
            colId: 'ConverterStationId1',
            field: 'converterStationId1',
            ...textColumnDefinition('Converter station ID 1', tab),
        },
        {
            colId: 'ConverterStationId2',
            field: 'converterStationId2',
            ...textColumnDefinition('Converter station ID 2', tab),
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
            colId: 'R',
            field: 'r',
            ...numberColumnDefinition('Resistance', tab, 1),
        },
        {
            colId: 'ActivePowerSetpoint',
            field: 'activePowerSetpoint',
            ...numberColumnDefinition('Active power setpoint (MW)', tab, 1),
        },
        {
            colId: 'maxActivePower',
            field: 'maxP',
            ...numberColumnDefinition('Max P (MW)', tab, 1),
        },
        {
            colId: 'OprFromCS1toCS2',
            field: 'hvdcOperatorActivePowerRange.oprFromCS1toCS2',
            ...numberColumnDefinition('Operational limit (side_1 to side_2) (MW)', tab, 1),
        },
        {
            colId: 'OprFromCS2toCS1',
            field: 'hvdcOperatorActivePowerRange.oprFromCS2toCS1',
            ...numberColumnDefinition('Operational limit (side_2 to side_1) (MW)', tab, 1),
        },
        {
            colId: 'AcEmulation',
            field: 'hvdcAngleDroopActivePowerControl.isEnabled',
            ...booleanColumnDefinition('AC emulation', tab),
        },
        {
            colId: 'K',
            field: 'hvdcAngleDroopActivePowerControl.droop',
            ...numberColumnDefinition('K (MW/Deg)', tab, 1),
        },
        {
            colId: 'P0',
            field: 'hvdcAngleDroopActivePowerControl.p0',
            ...numberColumnDefinition('P0 (side_1 to side_2) (MW)', tab, 1),
        },
        genericColumnOfPropertiesReadonly(tab),
    ],
};

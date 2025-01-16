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
            field: 'id',
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
            id: 'ConvertersMode',
            field: 'convertersMode',
            ...textColumnDefinition('convertersMode', 'Converters mode', tab),
        },
        {
            id: 'ConverterStationId1',
            field: 'converterStationId1',
            ...textColumnDefinition('converterStationId1', 'Converter station ID 1', tab),
        },
        {
            id: 'ConverterStationId2',
            field: 'converterStationId2',
            ...textColumnDefinition('converterStationId2', 'Converter station ID 2', tab),
        },
        {
            id: 'Country1',
            field: 'country1',
            ...textColumnDefinition('country1', 'Country 1', tab),
        },
        {
            id: 'Country2',
            field: 'country2',
            ...textColumnDefinition('country2', 'Country 2', tab),
        },
        {
            id: 'R',
            field: 'r',
            ...numberColumnDefinition('r', 'Resistance', tab, 1),
        },
        {
            field: 'activePowerSetpoint',
            ...numberColumnDefinition('activePowerSetpoint', 'Active power setpoint (MW)', tab, 1),
        },
        {
            field: 'maxP',
            ...numberColumnDefinition('maxP', 'Max P (MW)', tab, 1),
        },
        {
            field: 'hvdcOperatorActivePowerRange.oprFromCS1toCS2',
            ...numberColumnDefinition('oprLimit1to2', 'Operational limit (side_1 to side_2) (MW)', tab, 1),
        },
        {
            field: 'hvdcOperatorActivePowerRange.oprFromCS2toCS1',
            ...numberColumnDefinition('oprLimit2to1', 'Operational limit (side_2 to side_1) (MW)', tab, 1),
        },
        {
            field: 'hvdcAngleDroopActivePowerControl.isEnabled',
            ...booleanColumnDefinition('acEmulationEnabled', 'AC emulation', tab),
        },
        {
            field: 'hvdcAngleDroopActivePowerControl.droop',
            ...numberColumnDefinition('acEmulationDroop', 'K (MW/Deg)', tab, 1),
        },
        {
            field: 'hvdcAngleDroopActivePowerControl.p0',
            ...numberColumnDefinition('acEmulationp0', 'P0 (side_1 to side_2) (MW)', tab, 1),
        },
        genericColumnOfPropertiesReadonly(tab),
    ],
};

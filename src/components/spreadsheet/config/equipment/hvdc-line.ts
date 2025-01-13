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
import {
    booleanAgGridColumnDefinition,
    textAgGridColumnDefinition,
    numberAgGridColumnDefinition,
} from '../common-column-definitions';

export const HVDC_LINE_TAB_DEF: SpreadsheetTabDefinition = {
    index: 10,
    name: 'HvdcLines',
    ...typeAndFetchers(EQUIPMENT_TYPES.HVDC_LINE),
    columns: [
        {
            id: 'ID',
            field: 'id',
            initialSort: 'asc',
            ...textAgGridColumnDefinition,
        },
        {
            id: 'Name',
            field: 'name',
            ...textAgGridColumnDefinition,
        },
        {
            id: 'VoltageLevelIdSide1',
            field: 'voltageLevelId1',
            ...textAgGridColumnDefinition,
        },
        {
            id: 'VoltageLevelIdSide2',
            field: 'voltageLevelId2',
            ...textAgGridColumnDefinition,
        },
        {
            id: 'ConvertersMode',
            field: 'convertersMode',
            ...textAgGridColumnDefinition,
        },
        {
            id: 'ConverterStationId1',
            field: 'converterStationId1',
            ...textAgGridColumnDefinition,
        },
        {
            id: 'ConverterStationId2',
            field: 'converterStationId2',
            ...textAgGridColumnDefinition,
        },
        {
            id: 'Country1',
            field: 'country1',
            ...textAgGridColumnDefinition,
        },
        {
            id: 'Country2',
            field: 'country2',
            ...textAgGridColumnDefinition,
        },
        {
            id: 'R',
            field: 'r',
            ...numberAgGridColumnDefinition(1),
        },
        {
            id: 'ActivePowerSetpoint',
            field: 'activePowerSetpoint',
            ...numberAgGridColumnDefinition(1),
        },
        {
            id: 'maxActivePower',
            field: 'maxP',
            ...numberAgGridColumnDefinition(1),
        },
        {
            id: 'OprFromCS1toCS2',
            field: 'hvdcOperatorActivePowerRange.oprFromCS1toCS2',
            ...numberAgGridColumnDefinition(1),
        },
        {
            id: 'OprFromCS2toCS1',
            field: 'hvdcOperatorActivePowerRange.oprFromCS2toCS1',
            ...numberAgGridColumnDefinition(1),
        },
        {
            id: 'AcEmulation',
            field: 'hvdcAngleDroopActivePowerControl.isEnabled',
            ...booleanAgGridColumnDefinition,
        },
        {
            id: 'K',
            field: 'hvdcAngleDroopActivePowerControl.droop',
            ...numberAgGridColumnDefinition(1),
        },
        {
            id: 'P0',
            field: 'hvdcAngleDroopActivePowerControl.p0',
            ...numberAgGridColumnDefinition(1),
        },
        genericColumnOfPropertiesReadonly,
    ],
};

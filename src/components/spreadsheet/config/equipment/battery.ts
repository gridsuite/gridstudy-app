/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { EQUIPMENT_TYPES } from '../../../utils/equipment-types';
import { typeAndFetchers } from './common-config';
import type { SpreadsheetTabDefinition } from '../spreadsheet.type';
import { genericColumnOfPropertiesReadonly } from './column-properties';
import {
    booleanAgGridColumnDefinition,
    numberAgGridColumnDefinition,
    textAgGridColumnDefinition,
} from '../common-column-definitions';

export const BATTERY_TAB_DEF: SpreadsheetTabDefinition = {
    index: 9,
    name: 'Batteries',
    ...typeAndFetchers(EQUIPMENT_TYPES.BATTERY),
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
            id: 'VoltageLevelId',
            field: 'voltageLevelId',
            ...textAgGridColumnDefinition,
        },
        {
            id: 'Country',
            field: 'country',
            ...textAgGridColumnDefinition,
        },
        {
            id: 'NominalV',
            field: 'nominalVoltage',
            ...numberAgGridColumnDefinition(0),
        },
        {
            id: 'activePower',
            field: 'p',
            ...numberAgGridColumnDefinition(1),
            fractionDigits: 1,
        },
        {
            id: 'ReactivePower',
            field: 'q',
            ...numberAgGridColumnDefinition(1),
        },
        {
            id: 'ActivePowerControl',
            field: 'activePowerControl.participate',
            ...booleanAgGridColumnDefinition,
        },
        {
            id: 'DroopColumnName',
            field: 'activePowerControl.droop',
            ...numberAgGridColumnDefinition(1),
        },
        {
            id: 'minP',
            field: 'minP',
            ...numberAgGridColumnDefinition(1),
        },
        {
            id: 'maxP',
            field: 'maxP',
            ...numberAgGridColumnDefinition(1),
        },
        {
            id: 'activePowerSetpoint',
            field: 'targetP',
            ...numberAgGridColumnDefinition(1),
        },
        {
            id: 'reactivePowerSetpoint',
            field: 'targetQ',
            ...numberAgGridColumnDefinition(1),
        },
        {
            id: 'connected',
            field: 'terminalConnected',
            ...booleanAgGridColumnDefinition,
        },
        genericColumnOfPropertiesReadonly,
    ],
};

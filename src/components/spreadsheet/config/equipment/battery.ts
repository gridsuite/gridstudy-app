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
import { booleanColumnDefinition, numberColumnDefinition, textColumnDefinition } from '../common-column-definitions';

export const BATTERY_TAB_DEF: SpreadsheetTabDefinition = {
    index: 9,
    name: 'Batteries',
    ...typeAndFetchers(EQUIPMENT_TYPES.BATTERY),
    columns: [
        {
            id: 'ID',
            field: 'id',
            initialSort: 'asc',
            ...textColumnDefinition('id', 'ID', 'Batteries'),
        },
        {
            id: 'Name',
            field: 'name',
            ...textColumnDefinition('name', 'Name', 'Batteries'),
        },
        {
            id: 'VoltageLevelId',
            field: 'voltageLevelId',
            ...textColumnDefinition('voltageLevelId', 'VoltageLevelId', 'Batteries'),
        },
        {
            id: 'Country',
            field: 'country',
            ...textColumnDefinition('country', 'Country', 'Batteries'),
        },
        {
            id: 'NominalV',
            field: 'nominalVoltage',
            ...numberColumnDefinition('nominalVoltage', 'NominalV', 'Batteries', 0),
        },
        {
            id: 'activePower',
            field: 'p',
            ...numberColumnDefinition('p', 'activePower', 'Batteries', 1),
            fractionDigits: 1,
        },
        {
            id: 'ReactivePower',
            field: 'q',
            ...numberColumnDefinition('q', 'ReactivePower', 'Batteries', 1),
        },
        {
            id: 'ActivePowerControl',
            field: 'activePowerControl.participate',
            ...booleanColumnDefinition('activePowerControl.participate', 'ActivePowerControl', 'Batteries'),
        },
        {
            id: 'DroopColumnName',
            field: 'activePowerControl.droop',
            ...numberColumnDefinition('activePowerControl.droop', 'DroopColumnName', 'Batteries', 1),
        },
        {
            id: 'minP',
            field: 'minP',
            ...numberColumnDefinition('minP', 'minP', 'Batteries', 1),
        },
        {
            id: 'maxP',
            field: 'maxP',
            ...numberColumnDefinition('maxP', 'maxP', 'Batteries', 1),
        },
        {
            id: 'activePowerSetpoint',
            field: 'targetP',
            ...numberColumnDefinition('targetP', 'activePowerSetpoint', 'Batteries', 1),
        },
        {
            id: 'reactivePowerSetpoint',
            field: 'targetQ',
            ...numberColumnDefinition('targetQ', 'reactivePowerSetpoint', 'Batteries', 1),
        },
        {
            id: 'connected',
            field: 'terminalConnected',
            ...booleanColumnDefinition('terminalConnected', 'connected', 'Batteries'),
        },
        genericColumnOfPropertiesReadonly,
    ],
};

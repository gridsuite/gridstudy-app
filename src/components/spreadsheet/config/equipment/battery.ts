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

const tab = 'Batteries';

export const BATTERY_TAB_DEF: SpreadsheetTabDefinition = {
    index: 9,
    name: tab,
    ...typeAndFetchers(EQUIPMENT_TYPES.BATTERY),
    columns: [
        {
            id: 'ID',
            field: 'id',
            initialSort: 'asc',
            ...textColumnDefinition('id', 'ID', tab),
        },
        {
            id: 'Name',
            field: 'name',
            ...textColumnDefinition('name', 'Name', tab),
        },
        {
            id: 'VoltageLevelId',
            field: 'voltageLevelId',
            ...textColumnDefinition('voltageLevelId', 'VoltageLevelId', tab),
        },
        {
            id: 'Country',
            field: 'country',
            ...textColumnDefinition('country', 'Country', tab),
        },
        {
            id: 'NominalV',
            field: 'nominalVoltage',
            ...numberColumnDefinition('nominalVoltage', 'NominalV', tab, 0),
        },
        {
            id: 'activePower',
            field: 'p',
            ...numberColumnDefinition('p', 'activePower', tab, 1),
            fractionDigits: 1,
        },
        {
            id: 'ReactivePower',
            field: 'q',
            ...numberColumnDefinition('q', 'ReactivePower', tab, 1),
        },
        {
            id: 'ActivePowerControl',
            field: 'activePowerControl.participate',
            ...booleanColumnDefinition('activePowerControl.participate', 'ActivePowerControl', tab),
        },
        {
            id: 'DroopColumnName',
            field: 'activePowerControl.droop',
            ...numberColumnDefinition('activePowerControl.droop', 'DroopColumnName', tab, 1),
        },
        {
            id: 'minP',
            field: 'minP',
            ...numberColumnDefinition('minP', 'minP', tab, 1),
        },
        {
            id: 'maxP',
            field: 'maxP',
            ...numberColumnDefinition('maxP', 'maxP', tab, 1),
        },
        {
            id: 'activePowerSetpoint',
            field: 'targetP',
            ...numberColumnDefinition('targetP', 'activePowerSetpoint', tab, 1),
        },
        {
            id: 'reactivePowerSetpoint',
            field: 'targetQ',
            ...numberColumnDefinition('targetQ', 'reactivePowerSetpoint', tab, 1),
        },
        {
            id: 'connected',
            field: 'terminalConnected',
            ...booleanColumnDefinition('terminalConnected', 'connected', tab),
        },
        genericColumnOfPropertiesReadonly(tab),
    ],
};

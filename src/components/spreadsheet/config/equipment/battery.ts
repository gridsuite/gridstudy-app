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
            colId: 'ID',
            field: 'id',
            ...textColumnDefinition('ID', tab),
        },
        {
            colId: 'Name',
            field: 'name',
            ...textColumnDefinition('Name', tab),
        },
        {
            colId: 'VoltageLevelId',
            field: 'voltageLevelId',
            ...textColumnDefinition('Voltage level ID', tab),
        },
        {
            colId: 'Country',
            field: 'country',
            ...textColumnDefinition('Country', tab),
        },
        {
            colId: 'NominalV',
            field: 'nominalVoltage',
            ...numberColumnDefinition('Nominal V', tab, 0),
        },
        {
            colId: 'activePower',
            field: 'p',
            ...numberColumnDefinition('p (MW)', tab, 1),
        },
        {
            colId: 'ReactivePower',
            field: 'q',
            ...numberColumnDefinition('q (MVar)', tab, 1),
        },
        {
            colId: 'ActivePowerControl',
            field: 'activePowerControl.participate',
            ...booleanColumnDefinition('Active power control', tab),
        },
        {
            colId: 'DroopColumnName',
            field: 'activePowerControl.droop',
            ...numberColumnDefinition('Droop (%)', tab, 1),
        },
        {
            colId: 'minP',
            field: 'minP',
            ...numberColumnDefinition('Min P (MW)', tab, 1),
        },
        {
            colId: 'maxP',
            field: 'maxP',
            ...numberColumnDefinition('Max P (MW)', tab, 1),
        },
        {
            colId: 'activePowerSetpoint',
            field: 'targetP',
            ...numberColumnDefinition('Target P (MW)', tab, 1),
        },
        {
            colId: 'reactivePowerSetpoint',
            field: 'targetQ',
            ...numberColumnDefinition('Target Q (MVar)', tab, 1),
        },
        {
            colId: 'connected',
            field: 'terminalConnected',
            ...booleanColumnDefinition('Connected', tab),
        },
        genericColumnOfPropertiesReadonly(tab),
    ],
};

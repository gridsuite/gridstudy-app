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
            field: 'voltageLevelId',
            ...textColumnDefinition('voltageLevelId', '', tab),
        },
        {
            id: 'Country',
            field: 'country',
            ...textColumnDefinition('country', 'Country', tab),
        },
        {
            field: 'nominalVoltage',
            ...numberColumnDefinition('nominalVoltage', 'Nominal V', tab, 0),
        },
        {
            field: 'p',
            ...numberColumnDefinition('p', 'p (MW)', tab, 1),
        },
        {
            field: 'q',
            ...numberColumnDefinition('q', 'q (MVar)', tab, 1),
        },
        {
            field: 'activePowerControl.participate',
            ...booleanColumnDefinition('activePowerControlParticipate', 'Active power control', tab),
        },
        {
            field: 'activePowerControl.droop',
            ...numberColumnDefinition('activePowerControlDroop', 'Droop (%)', tab, 1),
        },
        {
            field: 'minP',
            ...numberColumnDefinition('minP', 'Min P (MW)', tab, 1),
        },
        {
            field: 'maxP',
            ...numberColumnDefinition('maxP', 'Max P (MW)', tab, 1),
        },
        {
            field: 'targetP',
            ...numberColumnDefinition('activePowerSetpoint', 'Target P (MW)', tab, 1),
        },
        {
            field: 'targetQ',
            ...numberColumnDefinition('reactivePowerSetpoint', 'Target Q (MVar)', tab, 1),
        },
        {
            field: 'terminalConnected',
            ...booleanColumnDefinition('terminalConnected', 'Connected', tab),
        },
        genericColumnOfPropertiesReadonly(tab),
    ],
};

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
    booleanColumnDefinition,
    enumColumnDefinition,
    numberColumnDefinition,
    textColumnDefinition,
} from '../common-column-definitions';

const tab = 'StaticVarCompensators';

export const STATIC_VAR_COMPENSATOR_TAB_DEF: SpreadsheetTabDefinition = {
    index: 8,
    name: tab,
    ...typeAndFetchers(EQUIPMENT_TYPES.STATIC_VAR_COMPENSATOR),
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
            ...enumColumnDefinition('Country', tab),
        },
        {
            colId: 'NominalV',
            field: 'nominalV',
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
            colId: 'VoltageSetpointKV',
            field: 'voltageSetpoint',
            ...numberColumnDefinition('Voltage set point (kV)', tab, 1),
        },
        {
            colId: 'ReactivePowerSetpointMVAR',
            field: 'reactivePowerSetpoint',
            ...numberColumnDefinition('Reactive power set point (MVar)', tab, 1),
        },
        {
            colId: 'connected',
            field: 'terminalConnected',
            ...booleanColumnDefinition('Connected', tab),
        },
        genericColumnOfPropertiesReadonly(tab),
    ],
};

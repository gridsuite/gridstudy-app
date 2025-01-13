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

export const LOAD_TAB_DEF: SpreadsheetTabDefinition = {
    index: 6,
    name: 'Loads',
    ...typeAndFetchers(EQUIPMENT_TYPES.LOAD),
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
            id: 'loadType',
            field: 'type',
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
        },
        {
            id: 'ReactivePower',
            field: 'q',
            ...numberAgGridColumnDefinition(1),
        },
        {
            id: 'p0',
            field: 'p0',
            ...numberAgGridColumnDefinition(1),
        },
        {
            id: 'q0',
            field: 'q0',
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

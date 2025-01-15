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
import { unitToMicroUnit } from '@gridsuite/commons-ui';

export const TIE_LINE_TAB_DEF: SpreadsheetTabDefinition = {
    index: 15,
    name: 'TieLines',
    ...typeAndFetchers(EQUIPMENT_TYPES.TIE_LINE),
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
            id: 'nominalVoltage1KV',
            field: 'nominalVoltage1',
            ...numberAgGridColumnDefinition(0),
        },
        {
            id: 'nominalVoltage2KV',
            field: 'nominalVoltage2',
            ...numberAgGridColumnDefinition(0),
        },
        {
            id: 'ActivePowerSide1',
            field: 'p1',
            ...numberAgGridColumnDefinition(1),
        },
        {
            id: 'ActivePowerSide2',
            field: 'p2',
            ...numberAgGridColumnDefinition(1),
        },
        {
            id: 'ReactivePowerSide1',
            field: 'q1',
            ...numberAgGridColumnDefinition(1),
        },
        {
            id: 'ReactivePowerSide2',
            field: 'q2',
            ...numberAgGridColumnDefinition(1),
        },
        {
            id: 'r',
            field: 'r',
            ...numberAgGridColumnDefinition(1),
        },
        {
            id: 'x',
            field: 'x',
            ...numberAgGridColumnDefinition(1),
        },
        {
            id: 'g1',
            valueGetter: (params) => unitToMicroUnit(params.data.g1),
            ...numberAgGridColumnDefinition(1),
        },
        {
            id: 'g2',
            valueGetter: (params) => unitToMicroUnit(params.data.g2),
            ...numberAgGridColumnDefinition(1),
        },
        {
            id: 'b1',
            valueGetter: (params) => unitToMicroUnit(params.data.b1),
            ...numberAgGridColumnDefinition(1),
        },
        {
            id: 'b2',
            valueGetter: (params) => unitToMicroUnit(params.data.b2),
            ...numberAgGridColumnDefinition(1),
        },
        {
            id: 'connected1',
            field: 'terminal1Connected',
            ...booleanAgGridColumnDefinition,
        },
        {
            id: 'connected2',
            field: 'terminal2Connected',
            ...booleanAgGridColumnDefinition,
        },
        genericColumnOfPropertiesReadonly,
    ],
};

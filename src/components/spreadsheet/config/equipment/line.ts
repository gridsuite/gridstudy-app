/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { ReadonlyDeep } from 'type-fest';
import type { SpreadsheetTabDefinition } from '../spreadsheet.type';
import { EQUIPMENT_TYPES } from '../../../utils/equipment-types';
import { BooleanCellRenderer } from '../../utils/cell-renderers';
import {
    defaultBooleanFilterConfig,
    defaultNumericFilterConfig,
    defaultTextFilterConfig,
    typeAndFetchers,
} from './common-config';
import { MEDIUM_COLUMN_WIDTH } from '../../utils/constants';
import { genericColumnOfPropertiesReadonly } from './column-properties';
import { convertInputValue, FieldType } from '@gridsuite/commons-ui';

export const LINE_TAB_DEF = {
    index: 2,
    name: 'Lines',
    ...typeAndFetchers(EQUIPMENT_TYPES.LINE),
    columns: [
        {
            colId: 'ID',
            field: 'id',
            ...defaultTextFilterConfig,
            context: {
                ...defaultTextFilterConfig.context,
                isDefaultSort: true,
                columnWidth: MEDIUM_COLUMN_WIDTH,
            },
        },
        {
            colId: 'Name',
            field: 'name',
            ...defaultTextFilterConfig,
            context: {
                ...defaultTextFilterConfig.context,
                columnWidth: MEDIUM_COLUMN_WIDTH,
            },
        },
        {
            colId: 'VoltageLevelIdSide1',
            field: 'voltageLevelId1',
            ...defaultTextFilterConfig,
        },
        {
            colId: 'VoltageLevelIdSide2',
            field: 'voltageLevelId2',
            ...defaultTextFilterConfig,
        },
        {
            colId: 'Country1',
            field: 'country1',
            ...defaultTextFilterConfig,
        },
        {
            colId: 'Country2',
            field: 'country2',
            ...defaultTextFilterConfig,
        },
        {
            colId: 'nominalVoltage1KV',
            field: 'nominalVoltage1',
            ...defaultNumericFilterConfig,
            context: {
                ...defaultNumericFilterConfig.context,
                numeric: true,
                fractionDigits: 0,
            },
        },
        {
            colId: 'nominalVoltage2KV',
            field: 'nominalVoltage2',
            ...defaultNumericFilterConfig,
            context: {
                ...defaultNumericFilterConfig.context,
                numeric: true,
                fractionDigits: 0,
            },
        },
        {
            colId: 'ActivePowerSide1',
            field: 'p1',
            ...defaultNumericFilterConfig,
            context: {
                ...defaultNumericFilterConfig.context,
                numeric: true,
                fractionDigits: 1,
            },
        },
        {
            colId: 'ActivePowerSide2',
            field: 'p2',
            ...defaultNumericFilterConfig,
            context: {
                ...defaultNumericFilterConfig.context,
                numeric: true,
                fractionDigits: 1,
            },
        },
        {
            colId: 'ReactivePowerSide1',
            field: 'q1',
            ...defaultNumericFilterConfig,
            context: {
                ...defaultNumericFilterConfig.context,
                numeric: true,
                fractionDigits: 1,
            },
        },
        {
            colId: 'ReactivePowerSide2',
            field: 'q2',
            ...defaultNumericFilterConfig,
            context: {
                ...defaultNumericFilterConfig.context,
                numeric: true,
                fractionDigits: 1,
            },
        },
        {
            colId: 'r',
            field: 'r',
            ...defaultNumericFilterConfig,
            context: {
                ...defaultNumericFilterConfig.context,
                numeric: true,
                fractionDigits: 1,
            },
        },
        {
            colId: 'x',
            field: 'x',
            ...defaultNumericFilterConfig,
            context: {
                ...defaultNumericFilterConfig.context,
                numeric: true,
                fractionDigits: 1,
            },
        },
        {
            colId: 'g1',
            field: 'g1',
            ...defaultNumericFilterConfig,
            context: {
                ...defaultNumericFilterConfig.context,
                numeric: true,
                fractionDigits: 1,
            },
            valueGetter: (params) => convertInputValue(FieldType.G1, params.data.g1),
        },
        {
            colId: 'g2',
            field: 'g2',
            ...defaultNumericFilterConfig,
            context: {
                ...defaultNumericFilterConfig.context,
                numeric: true,
                fractionDigits: 1,
            },
            valueGetter: (params) => convertInputValue(FieldType.G2, params.data.g2),
        },
        {
            colId: 'b1',
            field: 'b1',
            ...defaultNumericFilterConfig,
            context: {
                ...defaultNumericFilterConfig.context,
                numeric: true,
                fractionDigits: 1,
            },
            valueGetter: (params) => convertInputValue(FieldType.B1, params.data.b1),
        },
        {
            colId: 'b2',
            field: 'b2',
            ...defaultNumericFilterConfig,
            context: {
                ...defaultNumericFilterConfig.context,
                numeric: true,
                fractionDigits: 1,
            },
            valueGetter: (params) => convertInputValue(FieldType.B2, params.data.b2),
        },
        {
            colId: 'connected1',
            field: 'terminal1Connected',
            cellRenderer: BooleanCellRenderer,
            ...defaultBooleanFilterConfig,
        },
        {
            colId: 'connected2',
            field: 'terminal2Connected',
            cellRenderer: BooleanCellRenderer,
            ...defaultBooleanFilterConfig,
        },
        genericColumnOfPropertiesReadonly,
    ],
} as const satisfies ReadonlyDeep<SpreadsheetTabDefinition>;

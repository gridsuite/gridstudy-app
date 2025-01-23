/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { ReadonlyDeep } from 'type-fest';
import type { SpreadsheetTabDefinition } from '../spreadsheet.type';
import { EQUIPMENT_TYPES } from '../../../utils/equipment-types';
import { defaultNumericFilterConfig, defaultTextFilterConfig, typeAndFetchers } from './common-config';
import { convertInputValue, FieldType } from '@gridsuite/commons-ui';
import { genericColumnOfPropertiesReadonly } from './column-properties';

export const VOLTAGE_LEVEL_TAB_DEF = {
    index: 1,
    name: 'VoltageLevels',
    ...typeAndFetchers(EQUIPMENT_TYPES.VOLTAGE_LEVEL),
    columns: [
        {
            colId: 'ID',
            field: 'id',
            ...defaultTextFilterConfig,
            context: {
                ...defaultTextFilterConfig.context,
                isDefaultSort: true,
            },
        },
        {
            colId: 'Name',
            field: 'name',
            ...defaultTextFilterConfig,
        },
        {
            colId: 'SubstationId',
            field: 'substationId',
            ...defaultTextFilterConfig,
        },
        {
            colId: 'Country',
            field: 'country',
            ...defaultTextFilterConfig,
        },
        {
            colId: 'NominalV',
            field: 'nominalV',
            ...defaultNumericFilterConfig,
            context: {
                ...defaultNumericFilterConfig.context,
                numeric: true,
                fractionDigits: 0,
            },
        },
        {
            colId: 'LowVoltageLimitkV',
            field: 'lowVoltageLimit',
            ...defaultNumericFilterConfig,
            context: {
                ...defaultNumericFilterConfig.context,
                numeric: true,
                fractionDigits: 1,
            },
        },
        {
            colId: 'HighVoltageLimitkV',
            field: 'highVoltageLimit',
            ...defaultNumericFilterConfig,
            context: {
                ...defaultNumericFilterConfig.context,
                numeric: true,
                fractionDigits: 1,
            },
        },
        {
            colId: 'IpMin',
            field: 'identifiableShortCircuit.ipMin',
            ...defaultNumericFilterConfig,
            context: {
                ...defaultNumericFilterConfig.context,
                numeric: true,
                fractionDigits: 1,
            },
            valueGetter: (params) =>
                convertInputValue(
                    FieldType.LOW_SHORT_CIRCUIT_CURRENT_LIMIT,
                    params.data?.identifiableShortCircuit?.ipMin
                ),
        },
        {
            colId: 'IpMax',
            field: 'identifiableShortCircuit.ipMax',
            ...defaultNumericFilterConfig,
            context: {
                ...defaultNumericFilterConfig.context,
                numeric: true,
                fractionDigits: 1,
            },
            valueGetter: (params) =>
                convertInputValue(
                    FieldType.HIGH_SHORT_CIRCUIT_CURRENT_LIMIT,
                    params.data?.identifiableShortCircuit?.ipMax
                ),
        },
        genericColumnOfPropertiesReadonly,
    ],
} as const satisfies ReadonlyDeep<SpreadsheetTabDefinition>;

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
import { convertInputValue, convertOutputValue, FieldType } from '@gridsuite/commons-ui';
import { genericColumnOfPropertiesReadonly } from './column-properties';

export const VOLTAGE_LEVEL_TAB_DEF = {
    index: 1,
    name: 'VoltageLevels',
    ...typeAndFetchers(EQUIPMENT_TYPES.VOLTAGE_LEVEL),
    columns: [
        {
            id: 'ID',
            field: 'id',
            isDefaultSort: true,
            ...defaultTextFilterConfig,
        },
        {
            id: 'Name',
            field: 'name',
            ...defaultTextFilterConfig,
        },
        {
            id: 'SubstationId',
            field: 'substationId',
            ...defaultTextFilterConfig,
        },
        {
            id: 'Country',
            field: 'country',
            ...defaultTextFilterConfig,
        },
        {
            id: 'NominalV',
            field: 'nominalV',
            numeric: true,
            ...defaultNumericFilterConfig,
            fractionDigits: 0,
        },
        {
            id: 'LowVoltageLimitkV',
            field: 'lowVoltageLimit',
            numeric: true,
            ...defaultNumericFilterConfig,
            fractionDigits: 1,
        },
        {
            id: 'HighVoltageLimitkV',
            field: 'highVoltageLimit',
            numeric: true,
            ...defaultNumericFilterConfig,
            fractionDigits: 1,
        },
        {
            id: 'IpMin',
            field: 'identifiableShortCircuit.ipMin',
            ...defaultNumericFilterConfig,
            fractionDigits: 1,
            numeric: true,
            valueGetter: (params) =>
                convertInputValue(
                    FieldType.LOW_SHORT_CIRCUIT_CURRENT_LIMIT,
                    params.data?.identifiableShortCircuit?.ipMin
                ),
        },
        {
            id: 'IpMax',
            field: 'identifiableShortCircuit.ipMax',
            ...defaultNumericFilterConfig,
            fractionDigits: 1,
            numeric: true,
            valueGetter: (params) =>
                convertInputValue(
                    FieldType.HIGH_SHORT_CIRCUIT_CURRENT_LIMIT,
                    params.data?.identifiableShortCircuit?.ipMax
                ),
        },
        genericColumnOfPropertiesReadonly,
    ],
} as const satisfies ReadonlyDeep<SpreadsheetTabDefinition>;

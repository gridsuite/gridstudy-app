/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { SpreadsheetTabDefinition } from '../spreadsheet.type';
import { EQUIPMENT_TYPES } from '../../../utils/equipment-types';
import { typeAndFetchers } from './common-config';
import { convertInputValue, FieldType } from '@gridsuite/commons-ui';
import { genericColumnOfPropertiesReadonly } from './column-properties';
import { textColumnDefinition, numberColumnDefinition } from '../common-column-definitions';

const tab = 'VoltageLevels';

export const VOLTAGE_LEVEL_TAB_DEF: SpreadsheetTabDefinition = {
    index: 1,
    name: tab,
    ...typeAndFetchers(EQUIPMENT_TYPES.VOLTAGE_LEVEL),
    columns: [
        {
            field: 'id',
            initialSort: 'asc',
            ...textColumnDefinition('id', 'ID', tab),
        },
        {
            field: 'name',
            ...textColumnDefinition('name', 'Name', tab),
        },
        {
            field: 'substationId',
            ...textColumnDefinition('substationId', 'Substation ID', tab),
        },
        {
            field: 'country',
            ...textColumnDefinition('country', 'Country', tab),
        },
        {
            field: 'nominalV',
            ...numberColumnDefinition('nominalV', 'Nominal V', tab, 0),
        },
        {
            field: 'lowVoltageLimit',
            ...numberColumnDefinition('lowVoltageLimit', 'Low voltage limit (kV)', tab, 1),
        },
        {
            field: 'highVoltageLimit',
            ...numberColumnDefinition('highVoltageLimit', 'High voltage limit (kV)', tab, 1),
        },
        {
            valueGetter: (params) =>
                convertInputValue(
                    FieldType.LOW_SHORT_CIRCUIT_CURRENT_LIMIT,
                    params.data?.identifiableShortCircuit?.ipMin
                ),
            ...numberColumnDefinition('IpMin', 'ISC min (kA)', tab, 1),
        },
        {
            valueGetter: (params) =>
                convertInputValue(
                    FieldType.HIGH_SHORT_CIRCUIT_CURRENT_LIMIT,
                    params.data?.identifiableShortCircuit?.ipMax
                ),
            ...numberColumnDefinition('IpMax', 'ISC max (kA)', tab, 1),
        },
        genericColumnOfPropertiesReadonly(tab),
    ],
};

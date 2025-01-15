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
import { textAgGridColumnDefinition, numberAgGridColumnDefinition } from '../common-column-definitions';
import { unitToKiloUnit } from '@gridsuite/commons-ui';

export const VOLTAGE_LEVEL_TAB_DEF: SpreadsheetTabDefinition = {
    index: 1,
    name: 'VoltageLevels',
    ...typeAndFetchers(EQUIPMENT_TYPES.VOLTAGE_LEVEL),
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
            id: 'SubstationId',
            field: 'substationId',
            ...textAgGridColumnDefinition,
        },
        {
            id: 'Country',
            field: 'country',
            ...textAgGridColumnDefinition,
        },
        {
            id: 'NominalV',
            field: 'nominalV',
            ...numberAgGridColumnDefinition(0),
        },
        {
            id: 'LowVoltageLimitkV',
            field: 'lowVoltageLimit',
            ...numberAgGridColumnDefinition(1),
        },
        {
            id: 'HighVoltageLimitkV',
            field: 'highVoltageLimit',
            ...numberAgGridColumnDefinition(1),
        },
        {
            id: 'IpMin',
            valueGetter: (params) => unitToKiloUnit(params.data?.identifiableShortCircuit?.ipMin),
            ...numberAgGridColumnDefinition(1),
        },
        {
            id: 'IpMax',
            valueGetter: (params) => unitToKiloUnit(params.data?.identifiableShortCircuit?.ipMax),
            ...numberAgGridColumnDefinition(1),
        },
        genericColumnOfPropertiesReadonly,
    ],
};

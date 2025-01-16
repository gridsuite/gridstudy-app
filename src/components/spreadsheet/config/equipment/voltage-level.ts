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
import { numberColumnDefinition, textColumnDefinition } from '../common-column-definitions';
import { unitToKiloUnit } from '@gridsuite/commons-ui';

const tab = 'VoltageLevels';

export const VOLTAGE_LEVEL_TAB_DEF: SpreadsheetTabDefinition = {
    index: 1,
    name: tab,
    ...typeAndFetchers(EQUIPMENT_TYPES.VOLTAGE_LEVEL),
    columns: [
        {
            colId: 'ID',
            field: 'id',
            initialSort: 'asc',
            ...textColumnDefinition('ID', tab),
        },
        {
            colId: 'Name',
            field: 'name',
            ...textColumnDefinition('Name', tab),
        },
        {
            colId: 'SubstationId',
            field: 'substationId',
            ...textColumnDefinition('Substation ID', tab),
        },
        {
            colId: 'Country',
            field: 'country',
            ...textColumnDefinition('Country', tab),
        },
        {
            colId: 'NominalV',
            field: 'nominalV',
            ...numberColumnDefinition('Nominal V', tab, 0),
        },
        {
            colId: 'lowVoltageLimit',
            field: 'lowVoltageLimit',
            ...numberColumnDefinition('Low voltage limit (kV)', tab, 1),
        },
        {
            colId: 'highVoltageLimit',
            field: 'highVoltageLimit',
            ...numberColumnDefinition('High voltage limit (kV)', tab, 1),
        },
        {
            colId: 'IpMin',
            valueGetter: (params) => unitToKiloUnit(params.data?.identifiableShortCircuit?.ipMin),
            ...numberColumnDefinition('ISC min (kA)', tab, 1),
        },
        {
            colId: 'IpMax',
            valueGetter: (params) => unitToKiloUnit(params.data?.identifiableShortCircuit?.ipMax),
            ...numberColumnDefinition('ISC max (kA)', tab, 1),
        },
        genericColumnOfPropertiesReadonly(tab),
    ],
};

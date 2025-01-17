/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { SpreadsheetTabDefinition } from '../spreadsheet.type';
import { EQUIPMENT_TYPES } from '../../../utils/equipment-types';
import { typeAndFetchers } from './common-config';
import { NOMINAL_V } from '../../../utils/field-constants';
import { genericColumnOfPropertiesReadonly } from './column-properties';
import { booleanColumnDefinition, numberColumnDefinition, textColumnDefinition } from '../common-column-definitions';

const tab = 'DanglingLines';

export const DANGLING_LINE_TAB_DEF: SpreadsheetTabDefinition = {
    index: 13,
    name: tab,
    ...typeAndFetchers(EQUIPMENT_TYPES.DANGLING_LINE),
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
            ...textColumnDefinition('Country', tab),
        },
        {
            colId: 'NominalV',
            field: NOMINAL_V,
            ...numberColumnDefinition('Nominal V', tab, 0),
        },
        {
            colId: 'PairingKey',
            field: 'pairingKey',
            ...textColumnDefinition('UCTE Xnode', tab),
        },
        {
            colId: 'activePower',
            field: 'p',
            ...numberColumnDefinition('p (MW)', tab, 1),
        },
        {
            colId: 'ReactivePower',
            field: 'q',
            ...numberColumnDefinition('q (MW)', tab, 1),
        },
        {
            colId: 'p0',
            field: 'p0',
            ...numberColumnDefinition('Constant p (MW)', tab, 1),
        },
        {
            colId: 'q0',
            field: 'q0',
            ...numberColumnDefinition('Constant q (MVar)', tab, 1),
        },
        {
            colId: 'connected',
            field: 'terminalConnected',
            ...booleanColumnDefinition('Connected', tab),
        },
        genericColumnOfPropertiesReadonly(tab),
    ],
};

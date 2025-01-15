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
            field: 'id',
            initialSort: 'asc',
            ...textColumnDefinition('id', 'ID', tab),
        },
        {
            field: 'name',
            ...textColumnDefinition('name', 'Name', tab),
        },
        {
            field: 'voltageLevelId',
            ...textColumnDefinition('voltageLevelId', 'Voltage Level ID', tab),
        },
        {
            id: 'Country',
            field: 'country',
            ...textColumnDefinition('country', 'Country', tab),
        },
        {
            id: 'NominalV',
            field: NOMINAL_V,
            ...numberColumnDefinition(NOMINAL_V, 'Nominal V', tab, 0),
        },
        {
            field: 'pairingKey',
            ...textColumnDefinition('pairingKey', 'Pairing Key', tab),
        },
        {
            field: 'p',
            ...numberColumnDefinition('activePower', 'Active Power', tab, 1),
        },
        {
            field: 'q',
            ...numberColumnDefinition('reactivePower', 'Reactive Power', tab, 1),
        },
        {
            field: 'p0',
            ...numberColumnDefinition('p0', 'p0', tab, 1),
        },
        {
            field: 'q0',
            ...numberColumnDefinition('q0', 'q0', tab, 1),
        },
        {
            field: 'terminalConnected',
            ...booleanColumnDefinition('connected', 'Connected', tab),
        },
        genericColumnOfPropertiesReadonly(tab),
    ],
};

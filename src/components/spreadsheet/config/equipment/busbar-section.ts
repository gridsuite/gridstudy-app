/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { SpreadsheetTabDefinition } from '../spreadsheet.type';
import { EQUIPMENT_TYPES } from '../../../utils/equipment-types';
import { typeAndFetchers } from './common-config';
import { textColumnDefinition } from '../common-column-definitions';

const tab = 'BusBarSections';

export const BUSBAR_SECTION_TAB_DEF: SpreadsheetTabDefinition = {
    index: 16,
    name: tab,
    ...typeAndFetchers(EQUIPMENT_TYPES.BUSBAR_SECTION),
    columns: [
        {
            colId: 'ID',
            field: 'id',
            initialSort: 'asc',
            ...textColumnDefinition('ID', tab),
        },
        {
            colId: 'VoltageLevelId',
            field: 'voltageLevelId',
            ...textColumnDefinition('Voltage level ID', tab),
        },
    ],
};

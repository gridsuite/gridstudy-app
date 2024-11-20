/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { SpreadsheetTabDefinition } from '../spreadsheet.type';
import { EQUIPMENT_TYPES } from '../../../utils/equipment-types';
import { defaultTextFilterConfig, typeAndFetchers } from './common-config';
import type { ReadonlyDeep } from 'type-fest';

export const BUSBAR_SECTION_TAB_DEF = {
    index: 16,
    name: 'BusBarSections',
    ...typeAndFetchers(EQUIPMENT_TYPES.BUSBAR_SECTION),
    columns: [
        {
            id: 'ID',
            field: 'id',
            isDefaultSort: true,
            ...defaultTextFilterConfig,
        },
        {
            id: 'VoltageLevelId',
            field: 'voltageLevelId',
            ...defaultTextFilterConfig,
        },
    ],
} as const satisfies ReadonlyDeep<SpreadsheetTabDefinition>;

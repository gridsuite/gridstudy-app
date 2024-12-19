/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { ReadonlyDeep } from 'type-fest';
import type { SpreadsheetTabDefinition } from '../spreadsheet.type';
import { EQUIPMENT_TYPES } from '../../../utils/equipment-types';
import { typeAndFetchers } from './common-config';
import { genericColumnOfProperties } from '../common/column-properties';
import {
    COUNTRY_TYPE,
    NUMERIC_0_FRACTION_DIGITS_TYPE,
    NUMERIC_1_FRACTION_DIGITS_TYPE,
    NUMERIC_CAN_BE_INVALIDATED_TYPE,
    NUMERIC_TYPE,
    TEXT_TYPE,
} from 'components/spreadsheet/utils/constants';
import { SortWay } from 'hooks/use-aggrid-sort';

export const BUS_TAB_DEF = {
    index: 14,
    name: 'Buses',
    ...typeAndFetchers(EQUIPMENT_TYPES.BUS),
    columns: [
        {
            id: 'ID',
            field: 'id',
            type: TEXT_TYPE,
            sort: SortWay.ASC,
        },
        {
            id: 'Magnitude',
            field: 'v',
            type: [NUMERIC_1_FRACTION_DIGITS_TYPE, NUMERIC_CAN_BE_INVALIDATED_TYPE],
        },
        {
            id: 'Angle',
            field: 'angle',
            type: [NUMERIC_1_FRACTION_DIGITS_TYPE, NUMERIC_CAN_BE_INVALIDATED_TYPE],
        },
        {
            id: 'ConnectedComponent',
            field: 'connectedComponentNum',
            type: NUMERIC_TYPE,
        },
        {
            id: 'SynchronousComponent',
            field: 'synchronousComponentNum',
            type: NUMERIC_TYPE,
        },
        {
            id: 'VoltageLevelId',
            field: 'voltageLevelId',
            type: TEXT_TYPE,
        },
        {
            id: 'Country',
            field: 'country',
            type: COUNTRY_TYPE,
        },
        {
            id: 'NominalV',
            field: 'nominalVoltage',
            type: NUMERIC_0_FRACTION_DIGITS_TYPE,
        },
        genericColumnOfProperties,
    ],
} as const satisfies ReadonlyDeep<SpreadsheetTabDefinition>;

/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { ReadonlyDeep } from 'type-fest';
import type { SpreadsheetTabDefinition } from '../spreadsheet.type';
import { EQUIPMENT_TYPES } from '../../../utils/equipment-types';
import CountryCellRenderer from '../../utils/country-cell-render';
import { typeAndFetchers } from './common-config';
import { genericColumnOfProperties } from '../common/column-properties';
import { COUNTRY_FILTER, NUMERIC_FILTER, TEXT_FILTER } from 'components/spreadsheet/utils/constants';

export const BUS_TAB_DEF = {
    index: 14,
    name: 'Buses',
    ...typeAndFetchers(EQUIPMENT_TYPES.BUS),
    columns: [
        {
            id: 'ID',
            field: 'id',
            isDefaultSort: true,
            type: TEXT_FILTER,
        },
        {
            id: 'Magnitude',
            field: 'v',
            numeric: true,
            fractionDigits: 1,
            canBeInvalidated: true,
            type: NUMERIC_FILTER,
        },
        {
            id: 'Angle',
            field: 'angle',
            numeric: true,
            fractionDigits: 1,
            canBeInvalidated: true,
            type: NUMERIC_FILTER,
        },
        {
            id: 'ConnectedComponent',
            field: 'connectedComponentNum',
            type: NUMERIC_FILTER,
        },
        {
            id: 'SynchronousComponent',
            field: 'synchronousComponentNum',
            type: NUMERIC_FILTER,
        },
        {
            id: 'VoltageLevelId',
            field: 'voltageLevelId',
            type: TEXT_FILTER,
        },
        {
            id: 'Country',
            field: 'country',
            type: COUNTRY_FILTER,
            cellRenderer: CountryCellRenderer,
        },
        {
            id: 'NominalV',
            field: 'nominalVoltage',
            numeric: true,
            fractionDigits: 0,
            type: NUMERIC_FILTER,
        },
        genericColumnOfProperties,
    ],
} as const satisfies ReadonlyDeep<SpreadsheetTabDefinition>;

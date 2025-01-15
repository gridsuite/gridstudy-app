/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { SpreadsheetTabDefinition } from '../spreadsheet.type';
import { EQUIPMENT_TYPES } from '../../../utils/equipment-types';
import CountryCellRenderer from '../../utils/country-cell-render';
import {
    countryEnumFilterConfig,
    defaultNumericFilterConfig,
    defaultTextFilterConfig,
    typeAndFetchers,
} from './common-config';
import { genericColumnOfProperties } from '../common/column-properties';
import { FilterType } from '../../../../hooks/use-filter-selector';

const filterParams = {
    type: FilterType.Spreadsheet,
    tab: 'Buses',
};

export const BUS_TAB_DEF = {
    index: 14,
    name: 'Buses',
    ...typeAndFetchers(EQUIPMENT_TYPES.BUS),
    columns: [
        {
            id: 'ID',
            field: 'id',
            isDefaultSort: true,
            ...defaultTextFilterConfig(filterParams),
        },
        {
            id: 'Magnitude',
            field: 'v',
            numeric: true,
            fractionDigits: 1,
            canBeInvalidated: true,
            ...defaultNumericFilterConfig(filterParams),
        },
        {
            id: 'Angle',
            field: 'angle',
            numeric: true,
            fractionDigits: 1,
            canBeInvalidated: true,
            ...defaultNumericFilterConfig(filterParams),
        },
        {
            id: 'ConnectedComponent',
            field: 'connectedComponentNum',
            ...defaultNumericFilterConfig(filterParams),
        },
        {
            id: 'SynchronousComponent',
            field: 'synchronousComponentNum',
            ...defaultNumericFilterConfig(filterParams),
        },
        {
            id: 'VoltageLevelId',
            field: 'voltageLevelId',
            ...defaultTextFilterConfig(filterParams),
        },
        {
            id: 'Country',
            field: 'country',
            ...countryEnumFilterConfig(filterParams),
            cellRenderer: CountryCellRenderer,
        },
        {
            id: 'NominalV',
            field: 'nominalVoltage',
            numeric: true,
            fractionDigits: 0,
            ...defaultNumericFilterConfig(filterParams),
        },
        genericColumnOfProperties,
    ],
} satisfies SpreadsheetTabDefinition;

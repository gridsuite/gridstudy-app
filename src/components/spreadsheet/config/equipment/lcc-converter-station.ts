/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { ReadonlyDeep } from 'type-fest';
import type { SpreadsheetTabDefinition } from '../spreadsheet.type';
import { EQUIPMENT_TYPES } from '../../../utils/equipment-types';
import { BooleanCellRenderer } from '../../utils/cell-renderers';
import {
    defaultBooleanFilterConfig,
    defaultNumericFilterConfig,
    defaultTextFilterConfig,
    excludeFromGlobalFilter,
    typeAndFetchers,
} from './common-config';
import { genericColumnOfProperties } from '../common/column-properties';

export const LCC_CONVERTER_STATION_TAB_DEF = {
    index: 11,
    name: 'LccConverterStations',
    ...typeAndFetchers(EQUIPMENT_TYPES.LCC_CONVERTER_STATION),
    columns: [
        {
            id: 'ID',
            field: 'id',
            isDefaultSort: true,
            ...defaultTextFilterConfig,
        },
        {
            id: 'Name',
            field: 'name',
            ...defaultTextFilterConfig,
        },
        {
            id: 'VoltageLevelId',
            field: 'voltageLevelId',
            ...defaultTextFilterConfig,
        },
        {
            id: 'Country',
            field: 'country',
            ...defaultTextFilterConfig,
        },
        {
            id: 'NominalV',
            field: 'nominalV',
            numeric: true,
            ...defaultNumericFilterConfig,
            fractionDigits: 0,
        },
        {
            id: 'HvdcLineId',
            field: 'hvdcLineId',
            ...defaultTextFilterConfig,
        },
        {
            id: 'activePower',
            field: 'p',
            numeric: true,
            ...defaultNumericFilterConfig,
            fractionDigits: 1,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'ReactivePower',
            field: 'q',
            numeric: true,
            ...defaultNumericFilterConfig,
            fractionDigits: 1,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'PowerFactor',
            field: 'powerFactor',
            numeric: true,
            ...defaultNumericFilterConfig,
            fractionDigits: 1,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'LossFactor',
            field: 'lossFactor',
            numeric: true,
            ...defaultNumericFilterConfig,
            fractionDigits: 1,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'connected',
            field: 'terminalConnected',
            cellRenderer: BooleanCellRenderer,
            ...defaultBooleanFilterConfig,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        genericColumnOfProperties,
    ],
} as const satisfies ReadonlyDeep<SpreadsheetTabDefinition>;

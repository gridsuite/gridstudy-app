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
import { BooleanCellRenderer } from '../../utils/cell-renderers';
import {
    countryEnumFilterConfig,
    defaultBooleanFilterConfig,
    defaultNumericFilterConfig,
    defaultTextFilterConfig,
    excludeFromGlobalFilter,
    typeAndFetchers,
} from './common-config';
import { NOMINAL_V } from '../../../utils/field-constants';
import { genericColumnOfProperties } from '../common/column-properties';

export const DANGLING_LINE_TAB_DEF = {
    index: 13,
    name: 'DanglingLines',
    ...typeAndFetchers(EQUIPMENT_TYPES.DANGLING_LINE),
    columns: [
        {
            colId: 'ID',
            field: 'id',
            ...defaultTextFilterConfig,
            context: {
                ...defaultTextFilterConfig.context,
                isDefaultSort: true,
            },
        },
        {
            colId: 'Name',
            field: 'name',
            ...defaultTextFilterConfig,
        },
        {
            colId: 'VoltageLevelId',
            field: 'voltageLevelId',
            ...defaultTextFilterConfig,
        },
        {
            colId: 'Country',
            field: 'country',
            ...countryEnumFilterConfig,
            cellRenderer: CountryCellRenderer,
        },
        {
            colId: 'NominalV',
            field: NOMINAL_V,
            ...defaultNumericFilterConfig,
            context: {
                ...defaultNumericFilterConfig.context,
                fractionDigits: 0,
                numeric: true,
            },
        },
        {
            colId: 'PairingKey',
            field: 'pairingKey',
            getQuickFilterText: excludeFromGlobalFilter,
            ...defaultTextFilterConfig,
        },
        {
            colId: 'activePower',
            field: 'p',
            ...defaultNumericFilterConfig,
            context: {
                ...defaultNumericFilterConfig.context,
                numeric: true,
                fractionDigits: 1,
                canBeInvalidated: true,
            },
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            colId: 'ReactivePower',
            field: 'q',
            ...defaultNumericFilterConfig,
            context: {
                ...defaultNumericFilterConfig.context,
                numeric: true,
                fractionDigits: 1,
                canBeInvalidated: true,
            },
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            colId: 'p0',
            field: 'p0',
            ...defaultNumericFilterConfig,
            context: {
                ...defaultNumericFilterConfig.context,
                numeric: true,
                fractionDigits: 1,
            },
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            colId: 'q0',
            field: 'q0',
            ...defaultNumericFilterConfig,
            context: {
                ...defaultNumericFilterConfig.context,
                numeric: true,
                fractionDigits: 1,
            },
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            colId: 'connected',
            field: 'terminalConnected',
            ...defaultBooleanFilterConfig,
            context: {
                ...defaultBooleanFilterConfig.context,
                boolean: true,
            },
            cellRenderer: BooleanCellRenderer,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        genericColumnOfProperties,
    ],
} as const satisfies ReadonlyDeep<SpreadsheetTabDefinition>;

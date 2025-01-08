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
import { MEDIUM_COLUMN_WIDTH } from '../../utils/constants';
import { genericColumnOfPropertiesReadonly } from '../common/column-properties';
import { convertInputValue, FieldType } from '@gridsuite/commons-ui';

export const TIE_LINE_TAB_DEF = {
    index: 15,
    name: 'TieLines',
    ...typeAndFetchers(EQUIPMENT_TYPES.TIE_LINE),
    columns: [
        {
            id: 'ID',
            field: 'id',
            columnWidth: MEDIUM_COLUMN_WIDTH,
            isDefaultSort: true,
            ...defaultTextFilterConfig,
        },
        {
            id: 'Name',
            field: 'name',
            columnWidth: MEDIUM_COLUMN_WIDTH,
            ...defaultTextFilterConfig,
        },
        {
            id: 'VoltageLevelIdSide1',
            field: 'voltageLevelId1',
            ...defaultTextFilterConfig,
        },
        {
            id: 'VoltageLevelIdSide2',
            field: 'voltageLevelId2',
            ...defaultTextFilterConfig,
        },
        {
            id: 'Country1',
            field: 'country1',
            ...countryEnumFilterConfig,
            cellRenderer: CountryCellRenderer,
        },
        {
            id: 'Country2',
            field: 'country2',
            ...countryEnumFilterConfig,
            cellRenderer: CountryCellRenderer,
        },
        {
            id: 'nominalVoltage1KV',
            field: 'nominalVoltage1',
            numeric: true,
            ...defaultNumericFilterConfig,
            fractionDigits: 0,
        },
        {
            id: 'nominalVoltage2KV',
            field: 'nominalVoltage2',
            numeric: true,
            ...defaultNumericFilterConfig,
            fractionDigits: 0,
        },
        {
            id: 'ActivePowerSide1',
            field: 'p1',
            numeric: true,
            ...defaultNumericFilterConfig,
            fractionDigits: 1,
            canBeInvalidated: true,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'ActivePowerSide2',
            field: 'p2',
            numeric: true,
            ...defaultNumericFilterConfig,
            fractionDigits: 1,
            canBeInvalidated: true,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'ReactivePowerSide1',
            field: 'q1',
            numeric: true,
            ...defaultNumericFilterConfig,
            fractionDigits: 1,
            canBeInvalidated: true,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'ReactivePowerSide2',
            field: 'q2',
            numeric: true,
            ...defaultNumericFilterConfig,
            fractionDigits: 1,
            canBeInvalidated: true,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'r',
            field: 'r',
            numeric: true,
            ...defaultNumericFilterConfig,
            fractionDigits: 1,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'x',
            field: 'x',
            numeric: true,
            ...defaultNumericFilterConfig,
            fractionDigits: 1,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'g1',
            field: 'g1',
            numeric: true,
            ...defaultNumericFilterConfig,
            fractionDigits: 1,
            valueGetter: (params) => convertInputValue(FieldType.G1, params.data.g1),
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'g2',
            field: 'g2',
            numeric: true,
            ...defaultNumericFilterConfig,
            fractionDigits: 1,
            valueGetter: (params) => convertInputValue(FieldType.G2, params.data.g2),
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'b1',
            field: 'b1',
            numeric: true,
            ...defaultNumericFilterConfig,
            fractionDigits: 1,
            valueGetter: (params) => convertInputValue(FieldType.B1, params.data.b1),
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'b2',
            field: 'b2',
            numeric: true,
            ...defaultNumericFilterConfig,
            fractionDigits: 1,
            valueGetter: (params) => convertInputValue(FieldType.B2, params.data.b2),
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'connected1',
            field: 'terminal1Connected',
            boolean: true,
            cellRenderer: BooleanCellRenderer,
            ...defaultBooleanFilterConfig,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'connected2',
            field: 'terminal2Connected',
            boolean: true,
            cellRenderer: BooleanCellRenderer,
            ...defaultBooleanFilterConfig,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        genericColumnOfPropertiesReadonly,
    ],
} as const satisfies ReadonlyDeep<SpreadsheetTabDefinition>;

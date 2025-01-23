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
    defaultEnumFilterConfig,
    defaultNumericFilterConfig,
    defaultTextFilterConfig,
    excludeFromGlobalFilter,
    typeAndFetchers,
} from './common-config';
import { LARGE_COLUMN_WIDTH, MEDIUM_COLUMN_WIDTH } from '../../utils/constants';
import { genericColumnOfProperties } from '../common/column-properties';

export const HVDC_LINE_TAB_DEF = {
    index: 10,
    name: 'HvdcLines',
    ...typeAndFetchers(EQUIPMENT_TYPES.HVDC_LINE),
    columns: [
        {
            colId: 'ID',
            field: 'id',
            ...defaultTextFilterConfig,
            context: {
                ...defaultTextFilterConfig.context,
                isDefaultSort: true,
                columnWidth: MEDIUM_COLUMN_WIDTH,
            },
        },
        {
            colId: 'Name',
            field: 'name',
            ...defaultTextFilterConfig,
            context: {
                ...defaultTextFilterConfig.context,
                columnWidth: MEDIUM_COLUMN_WIDTH,
            },
        },
        {
            colId: 'VoltageLevelIdSide1',
            field: 'voltageLevelId1',
            ...defaultTextFilterConfig,
        },
        {
            colId: 'VoltageLevelIdSide2',
            field: 'voltageLevelId2',
            ...defaultTextFilterConfig,
        },
        {
            colId: 'ConvertersMode',
            field: 'convertersMode',
            getQuickFilterText: excludeFromGlobalFilter,
            ...defaultEnumFilterConfig,
            context: {
                ...defaultEnumFilterConfig.context,
                columnWidth: LARGE_COLUMN_WIDTH,
            },
        },
        {
            colId: 'ConverterStationId1',
            field: 'converterStationId1',
            ...defaultTextFilterConfig,
            context: {
                ...defaultTextFilterConfig.context,
                columnWidth: LARGE_COLUMN_WIDTH,
            },
        },
        {
            colId: 'ConverterStationId2',
            field: 'converterStationId2',
            ...defaultTextFilterConfig,
            context: {
                ...defaultTextFilterConfig.context,
                columnWidth: LARGE_COLUMN_WIDTH,
            },
        },
        {
            colId: 'Country1',
            field: 'country1',
            ...countryEnumFilterConfig,
            cellRenderer: CountryCellRenderer,
        },
        {
            colId: 'Country2',
            field: 'country2',
            ...countryEnumFilterConfig,
            cellRenderer: CountryCellRenderer,
        },
        {
            colId: 'R',
            field: 'r',
            ...defaultNumericFilterConfig,
            getQuickFilterText: excludeFromGlobalFilter,
            context: {
                ...defaultNumericFilterConfig.context,
                numeric: true,
                fractionDigits: 1,
            },
        },
        {
            colId: 'ActivePowerSetpoint',
            field: 'activePowerSetpoint',
            ...defaultNumericFilterConfig,
            getQuickFilterText: excludeFromGlobalFilter,
            context: {
                ...defaultNumericFilterConfig.context,
                numeric: true,
                fractionDigits: 1,
            },
        },
        {
            colId: 'maxActivePower',
            field: 'maxP',
            ...defaultNumericFilterConfig,
            getQuickFilterText: excludeFromGlobalFilter,
            context: {
                ...defaultNumericFilterConfig.context,
                numeric: true,
                fractionDigits: 1,
            },
        },
        {
            colId: 'OprFromCS1toCS2',
            field: 'hvdcOperatorActivePowerRange.oprFromCS1toCS2',
            ...defaultNumericFilterConfig,
            getQuickFilterText: excludeFromGlobalFilter,
            context: {
                ...defaultNumericFilterConfig.context,
                numeric: true,
                fractionDigits: 1,
                columnWidth: LARGE_COLUMN_WIDTH,
            },
        },
        {
            colId: 'OprFromCS2toCS1',
            field: 'hvdcOperatorActivePowerRange.oprFromCS2toCS1',
            ...defaultNumericFilterConfig,
            getQuickFilterText: excludeFromGlobalFilter,
            context: {
                ...defaultNumericFilterConfig.context,
                numeric: true,
                fractionDigits: 1,
                columnWidth: LARGE_COLUMN_WIDTH,
            },
        },
        {
            colId: 'AcEmulation',
            field: 'hvdcAngleDroopActivePowerControl.isEnabled',
            cellRenderer: BooleanCellRenderer,
            ...defaultBooleanFilterConfig,
            getQuickFilterText: excludeFromGlobalFilter,
            context: {
                ...defaultBooleanFilterConfig.context,
                boolean: true,
            },
        },
        {
            colId: 'K',
            field: 'hvdcAngleDroopActivePowerControl.droop',
            ...defaultNumericFilterConfig,
            getQuickFilterText: excludeFromGlobalFilter,
            context: {
                ...defaultNumericFilterConfig.context,
                numeric: true,
                fractionDigits: 1,
            },
        },
        {
            colId: 'P0',
            field: 'hvdcAngleDroopActivePowerControl.p0',
            ...defaultNumericFilterConfig,
            getQuickFilterText: excludeFromGlobalFilter,
            context: {
                ...defaultNumericFilterConfig.context,
                numeric: true,
                fractionDigits: 1,
            },
        },
        genericColumnOfProperties,
    ],
} as const satisfies ReadonlyDeep<SpreadsheetTabDefinition>;

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
import { excludeFromGlobalFilter, typeAndFetchers } from './common-config';
import {
    COUNTRY_FILTER,
    LARGE_COLUMN_WIDTH,
    MEDIUM_COLUMN_WIDTH,
    NUMERIC_FILTER,
    TEXT_FILTER,
} from '../../utils/constants';
import { genericColumnOfProperties } from '../common/column-properties';

export const HVDC_LINE_TAB_DEF = {
    index: 10,
    name: 'HvdcLines',
    ...typeAndFetchers(EQUIPMENT_TYPES.HVDC_LINE),
    columns: [
        {
            id: 'ID',
            field: 'id',
            columnWidth: MEDIUM_COLUMN_WIDTH,
            isDefaultSort: true,
            type: TEXT_FILTER,
        },
        {
            id: 'Name',
            field: 'name',
            columnWidth: MEDIUM_COLUMN_WIDTH,
            type: TEXT_FILTER,
        },
        {
            id: 'VoltageLevelIdSide1',
            field: 'voltageLevelId1',
            type: TEXT_FILTER,
        },
        {
            id: 'VoltageLevelIdSide2',
            field: 'voltageLevelId2',
            type: TEXT_FILTER,
        },
        {
            id: 'ConvertersMode',
            field: 'convertersMode',
            columnWidth: LARGE_COLUMN_WIDTH,
            getQuickFilterText: excludeFromGlobalFilter,
            type: TEXT_FILTER,
        },
        {
            id: 'ConverterStationId1',
            field: 'converterStationId1',
            columnWidth: LARGE_COLUMN_WIDTH,
            type: TEXT_FILTER,
        },
        {
            id: 'ConverterStationId2',
            field: 'converterStationId2',
            columnWidth: LARGE_COLUMN_WIDTH,
            type: TEXT_FILTER,
        },
        {
            id: 'Country1',
            field: 'country1',
            type: COUNTRY_FILTER,
            cellRenderer: CountryCellRenderer,
        },
        {
            id: 'Country2',
            field: 'country2',
            type: COUNTRY_FILTER,
            cellRenderer: CountryCellRenderer,
        },
        {
            id: 'R',
            field: 'r',
            numeric: true,
            type: NUMERIC_FILTER,
            fractionDigits: 1,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'ActivePowerSetpoint',
            field: 'activePowerSetpoint',
            numeric: true,
            type: NUMERIC_FILTER,
            fractionDigits: 1,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'maxActivePower',
            field: 'maxP',
            numeric: true,
            type: NUMERIC_FILTER,
            fractionDigits: 1,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'OprFromCS1toCS2',
            field: 'hvdcOperatorActivePowerRange.oprFromCS1toCS2',
            numeric: true,
            type: NUMERIC_FILTER,
            fractionDigits: 1,
            columnWidth: LARGE_COLUMN_WIDTH,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'OprFromCS2toCS1',
            field: 'hvdcOperatorActivePowerRange.oprFromCS2toCS1',
            numeric: true,
            type: NUMERIC_FILTER,
            fractionDigits: 1,
            columnWidth: LARGE_COLUMN_WIDTH,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'AcEmulation',
            field: 'hvdcAngleDroopActivePowerControl.isEnabled',
            boolean: true,
            cellRenderer: BooleanCellRenderer,
            type: TEXT_FILTER,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'K',
            field: 'hvdcAngleDroopActivePowerControl.droop',
            numeric: true,
            type: NUMERIC_FILTER,
            fractionDigits: 1,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'P0',
            field: 'hvdcAngleDroopActivePowerControl.p0',
            numeric: true,
            type: NUMERIC_FILTER,
            fractionDigits: 1,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        genericColumnOfProperties,
    ],
} as const satisfies ReadonlyDeep<SpreadsheetTabDefinition>;

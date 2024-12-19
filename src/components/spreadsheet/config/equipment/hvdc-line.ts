/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { ReadonlyDeep } from 'type-fest';
import type { SpreadsheetTabDefinition } from '../spreadsheet.type';
import { EQUIPMENT_TYPES } from '../../../utils/equipment-types';
import { excludeFromGlobalFilter, typeAndFetchers } from './common-config';
import {
    BOOLEAN_TYPE,
    COUNTRY_TYPE,
    LARGE_COLUMN_WIDTH,
    MEDIUM_COLUMN_WIDTH,
    NUMERIC_1_FRACTION_DIGITS_TYPE,
    TEXT_TYPE,
} from '../../utils/constants';
import { genericColumnOfProperties } from '../common/column-properties';
import { SortWay } from 'hooks/use-aggrid-sort';

export const HVDC_LINE_TAB_DEF = {
    index: 10,
    name: 'HvdcLines',
    ...typeAndFetchers(EQUIPMENT_TYPES.HVDC_LINE),
    columns: [
        {
            id: 'ID',
            field: 'id',
            columnWidth: MEDIUM_COLUMN_WIDTH,
            type: TEXT_TYPE,
            sort: SortWay.ASC,
        },
        {
            id: 'Name',
            field: 'name',
            columnWidth: MEDIUM_COLUMN_WIDTH,
            type: TEXT_TYPE,
        },
        {
            id: 'VoltageLevelIdSide1',
            field: 'voltageLevelId1',
            type: TEXT_TYPE,
        },
        {
            id: 'VoltageLevelIdSide2',
            field: 'voltageLevelId2',
            type: TEXT_TYPE,
        },
        {
            id: 'ConvertersMode',
            field: 'convertersMode',
            columnWidth: LARGE_COLUMN_WIDTH,
            getQuickFilterText: excludeFromGlobalFilter,
            type: TEXT_TYPE,
        },
        {
            id: 'ConverterStationId1',
            field: 'converterStationId1',
            columnWidth: LARGE_COLUMN_WIDTH,
            type: TEXT_TYPE,
        },
        {
            id: 'ConverterStationId2',
            field: 'converterStationId2',
            columnWidth: LARGE_COLUMN_WIDTH,
            type: TEXT_TYPE,
        },
        {
            id: 'Country1',
            field: 'country1',
            type: COUNTRY_TYPE,
        },
        {
            id: 'Country2',
            field: 'country2',
            type: COUNTRY_TYPE,
        },
        {
            id: 'R',
            field: 'r',
            type: NUMERIC_1_FRACTION_DIGITS_TYPE,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'ActivePowerSetpoint',
            field: 'activePowerSetpoint',
            type: NUMERIC_1_FRACTION_DIGITS_TYPE,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'maxActivePower',
            field: 'maxP',
            type: NUMERIC_1_FRACTION_DIGITS_TYPE,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'OprFromCS1toCS2',
            field: 'hvdcOperatorActivePowerRange.oprFromCS1toCS2',
            type: NUMERIC_1_FRACTION_DIGITS_TYPE,
            columnWidth: LARGE_COLUMN_WIDTH,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'OprFromCS2toCS1',
            field: 'hvdcOperatorActivePowerRange.oprFromCS2toCS1',
            type: NUMERIC_1_FRACTION_DIGITS_TYPE,
            columnWidth: LARGE_COLUMN_WIDTH,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'AcEmulation',
            field: 'hvdcAngleDroopActivePowerControl.isEnabled',
            type: BOOLEAN_TYPE,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'K',
            field: 'hvdcAngleDroopActivePowerControl.droop',
            type: NUMERIC_1_FRACTION_DIGITS_TYPE,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'P0',
            field: 'hvdcAngleDroopActivePowerControl.p0',
            type: NUMERIC_1_FRACTION_DIGITS_TYPE,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        genericColumnOfProperties,
    ],
} as const satisfies ReadonlyDeep<SpreadsheetTabDefinition>;

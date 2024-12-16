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
import { excludeFromGlobalFilter, typeAndFetchers } from './common-config';
import { BOOLEAN_TYPE, COUNTRY_TYPE, MEDIUM_COLUMN_WIDTH, NUMERIC_TYPE, TEXT_TYPE } from '../../utils/constants';
import { unitToMicroUnit } from '../../../../utils/unit-converter';
import { genericColumnOfProperties } from '../common/column-properties';
import { SortWay } from 'hooks/use-aggrid-sort';

export const LINE_TAB_DEF = {
    index: 2,
    name: 'Lines',
    ...typeAndFetchers(EQUIPMENT_TYPES.LINE),
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
            id: 'Country1',
            field: 'country1',
            type: COUNTRY_TYPE,
        },
        {
            id: 'Country2',
            field: 'country2',
            type: COUNTRY_TYPE,
            cellRenderer: CountryCellRenderer,
        },
        {
            id: 'nominalVoltage1KV',
            field: 'nominalVoltage1',
            numeric: true,
            type: NUMERIC_TYPE,
            fractionDigits: 0,
        },
        {
            id: 'nominalVoltage2KV',
            field: 'nominalVoltage2',
            numeric: true,
            type: NUMERIC_TYPE,
            fractionDigits: 0,
        },
        {
            id: 'ActivePowerSide1',
            field: 'p1',
            numeric: true,
            type: NUMERIC_TYPE,
            fractionDigits: 1,
            canBeInvalidated: true,
            withFluxConvention: true,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'ActivePowerSide2',
            field: 'p2',
            numeric: true,
            type: NUMERIC_TYPE,
            fractionDigits: 1,
            canBeInvalidated: true,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'ReactivePowerSide1',
            field: 'q1',
            numeric: true,
            type: NUMERIC_TYPE,
            fractionDigits: 1,
            canBeInvalidated: true,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'ReactivePowerSide2',
            field: 'q2',
            numeric: true,
            type: NUMERIC_TYPE,
            fractionDigits: 1,
            canBeInvalidated: true,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'r',
            field: 'r',
            numeric: true,
            type: NUMERIC_TYPE,
            fractionDigits: 1,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'x',
            field: 'x',
            numeric: true,
            type: NUMERIC_TYPE,
            fractionDigits: 1,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'g1',
            field: 'g1',
            numeric: true,
            type: NUMERIC_TYPE,
            fractionDigits: 1,
            valueGetter: (params) => unitToMicroUnit(params.data.g1),
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'g2',
            field: 'g2',
            numeric: true,
            type: NUMERIC_TYPE,
            fractionDigits: 1,
            valueGetter: (params) => unitToMicroUnit(params.data.g2),
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'b1',
            field: 'b1',
            numeric: true,
            type: NUMERIC_TYPE,
            fractionDigits: 1,
            valueGetter: (params) => unitToMicroUnit(params.data.b1),
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'b2',
            field: 'b2',
            numeric: true,
            type: NUMERIC_TYPE,
            fractionDigits: 1,
            valueGetter: (params) => unitToMicroUnit(params.data.b2),
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'connected1',
            field: 'terminal1Connected',
            type: BOOLEAN_TYPE,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'connected2',
            field: 'terminal2Connected',
            boolean: true,
            type: BOOLEAN_TYPE,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        genericColumnOfProperties,
    ],
} as const satisfies ReadonlyDeep<SpreadsheetTabDefinition>;

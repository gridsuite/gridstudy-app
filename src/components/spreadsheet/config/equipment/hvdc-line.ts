/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { SpreadsheetTabDefinition } from '../spreadsheet.type';
import { EQUIPMENT_TYPES } from '../../../utils/equipment-types';
import { fetchHvdcLines } from '../../../../services/study/network';
import CountryCellRenderer from '../../utils/country-cell-render';
import { ValueSetterParams } from 'ag-grid-community';
import { BooleanCellRenderer, PropertiesCellRenderer } from '../../utils/cell-renderers';
import {
    countryEnumFilterConfig,
    defaultBooleanFilterConfig,
    defaultEnumFilterConfig,
    defaultNumericFilterConfig,
    defaultTextFilterConfig,
    excludeFromGlobalFilter,
    LARGE_COLUMN_WIDTH,
    MEDIUM_COLUMN_WIDTH,
    propertiesGetter,
} from './common-config';

export const HVDC_LINE_TAB_DEF: SpreadsheetTabDefinition = {
    index: 10,
    name: 'HvdcLines',
    type: EQUIPMENT_TYPES.HVDC_LINE,
    fetchers: [fetchHvdcLines],
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
            id: 'ConvertersMode',
            field: 'convertersMode',
            columnWidth: LARGE_COLUMN_WIDTH,
            getQuickFilterText: excludeFromGlobalFilter,
            ...defaultEnumFilterConfig,
        },
        {
            id: 'ConverterStationId1',
            field: 'converterStationId1',
            columnWidth: LARGE_COLUMN_WIDTH,
            ...defaultTextFilterConfig,
        },
        {
            id: 'ConverterStationId2',
            field: 'converterStationId2',
            columnWidth: LARGE_COLUMN_WIDTH,
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
            id: 'R',
            field: 'r',
            numeric: true,
            ...defaultNumericFilterConfig,
            fractionDigits: 1,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'ActivePowerSetpoint',
            field: 'activePowerSetpoint',
            numeric: true,
            ...defaultNumericFilterConfig,
            fractionDigits: 1,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'maxActivePower',
            field: 'maxP',
            numeric: true,
            ...defaultNumericFilterConfig,
            fractionDigits: 1,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'OprFromCS1toCS2',
            field: 'hvdcOperatorActivePowerRange.oprFromCS1toCS2',
            numeric: true,
            ...defaultNumericFilterConfig,
            fractionDigits: 1,
            columnWidth: LARGE_COLUMN_WIDTH,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'OprFromCS2toCS1',
            field: 'hvdcOperatorActivePowerRange.oprFromCS2toCS1',
            numeric: true,
            ...defaultNumericFilterConfig,
            fractionDigits: 1,
            columnWidth: LARGE_COLUMN_WIDTH,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'AcEmulation',
            field: 'hvdcAngleDroopActivePowerControl.isEnabled',
            boolean: true,
            cellRenderer: BooleanCellRenderer,
            ...defaultBooleanFilterConfig,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'K',
            field: 'hvdcAngleDroopActivePowerControl.droop',
            numeric: true,
            ...defaultNumericFilterConfig,
            fractionDigits: 1,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'P0',
            field: 'hvdcAngleDroopActivePowerControl.p0',
            numeric: true,
            ...defaultNumericFilterConfig,
            fractionDigits: 1,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'Properties',
            field: 'properties',
            valueGetter: propertiesGetter,
            cellRenderer: PropertiesCellRenderer,
            minWidth: 300,
            getQuickFilterText: excludeFromGlobalFilter,
            valueSetter: (params: ValueSetterParams) => {
                params.data.properties = params.newValue;
                return true;
            },
            ...defaultTextFilterConfig,
        },
    ],
};

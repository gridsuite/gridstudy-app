/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

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
import { genericColumnOfProperties } from '../common/column-properties';
import { FilterType } from '../../../custom-aggrid/hooks/use-aggrid-row-filter';

const filterParams = {
    filterType: FilterType.Spreadsheet,
    filterTab: 'VscConverterStations',
};

export const VSC_CONVERTER_STATION_TAB_DEF = {
    index: 12,
    name: 'VscConverterStations',
    ...typeAndFetchers(EQUIPMENT_TYPES.VSC_CONVERTER_STATION),
    columns: [
        {
            id: 'ID',
            field: 'id',
            columnWidth: MEDIUM_COLUMN_WIDTH,
            isDefaultSort: true,
            ...defaultTextFilterConfig(filterParams),
        },
        {
            id: 'Name',
            field: 'name',
            ...defaultTextFilterConfig(filterParams),
        },
        {
            id: 'VoltageLevelId',
            field: 'voltageLevelId',
            ...defaultTextFilterConfig(filterParams),
        },
        {
            id: 'Country',
            field: 'country',
            ...countryEnumFilterConfig,
            cellRenderer: CountryCellRenderer,
        },
        {
            id: 'NominalV',
            field: 'nominalV',
            numeric: true,
            ...defaultNumericFilterConfig(filterParams),
            fractionDigits: 0,
        },
        {
            id: 'HvdcLineId',
            field: 'hvdcLineId',
            ...defaultTextFilterConfig(filterParams),
        },
        {
            id: 'activePower',
            field: 'p',
            numeric: true,
            ...defaultNumericFilterConfig(filterParams),
            fractionDigits: 1,
            canBeInvalidated: true,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'ReactivePower',
            field: 'q',
            numeric: true,
            ...defaultNumericFilterConfig(filterParams),
            fractionDigits: 1,
            canBeInvalidated: true,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'LossFactor',
            field: 'lossFactor',
            numeric: true,
            ...defaultNumericFilterConfig(filterParams),
            fractionDigits: 1,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'voltageRegulationOn',
            field: 'voltageRegulatorOn',
            boolean: true,
            cellRenderer: BooleanCellRenderer,
            ...defaultBooleanFilterConfig(filterParams),
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'VoltageSetpointKV',
            field: 'voltageSetpoint',
            numeric: true,
            ...defaultNumericFilterConfig(filterParams),
            fractionDigits: 1,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'ReactivePowerSetpointMVAR',
            field: 'reactivePowerSetpoint',
            numeric: true,
            ...defaultNumericFilterConfig(filterParams),
            fractionDigits: 1,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'connected',
            field: 'terminalConnected',
            boolean: true,
            cellRenderer: BooleanCellRenderer,
            ...defaultBooleanFilterConfig(filterParams),
            getQuickFilterText: excludeFromGlobalFilter,
        },
        genericColumnOfProperties,
    ],
} satisfies SpreadsheetTabDefinition;

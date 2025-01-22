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
import { genericColumnOfProperties } from '../common/column-properties';

export const VSC_CONVERTER_STATION_TAB_DEF = {
    index: 12,
    name: 'VscConverterStations',
    ...typeAndFetchers(EQUIPMENT_TYPES.VSC_CONVERTER_STATION),
    columns: [
        {
            colId: 'ID',
            field: 'id',
            ...defaultTextFilterConfig,
            context: {
                ...defaultTextFilterConfig.context,
                columnWidth: MEDIUM_COLUMN_WIDTH,
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
            field: 'nominalV',
            ...defaultNumericFilterConfig,
            context: {
                ...defaultNumericFilterConfig.context,
                numeric: true,
                fractionDigits: 0,
            },
        },
        {
            colId: 'HvdcLineId',
            field: 'hvdcLineId',
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
            colId: 'LossFactor',
            field: 'lossFactor',
            ...defaultNumericFilterConfig,
            context: {
                ...defaultNumericFilterConfig.context,
                numeric: true,
                fractionDigits: 1,
            },
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            colId: 'voltageRegulationOn',
            field: 'voltageRegulatorOn',
            cellRenderer: BooleanCellRenderer,
            ...defaultBooleanFilterConfig,
            context: {
                ...defaultBooleanFilterConfig.context,
                boolean: true,
            },
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            colId: 'VoltageSetpointKV',
            field: 'voltageSetpoint',
            ...defaultNumericFilterConfig,
            context: {
                ...defaultNumericFilterConfig.context,
                numeric: true,
                fractionDigits: 1,
            },
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            colId: 'ReactivePowerSetpointMVAR',
            field: 'reactivePowerSetpoint',
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
            cellRenderer: BooleanCellRenderer,
            ...defaultBooleanFilterConfig,
            context: {
                ...defaultBooleanFilterConfig.context,
                boolean: true,
            },
            getQuickFilterText: excludeFromGlobalFilter,
        },
        genericColumnOfProperties,
    ],
} as const satisfies ReadonlyDeep<SpreadsheetTabDefinition>;

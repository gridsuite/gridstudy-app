/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { ReadonlyDeep } from 'type-fest';
import { EQUIPMENT_TYPES } from '../../../utils/equipment-types';
import CountryCellRenderer from '../../utils/country-cell-render';
import { BooleanCellRenderer } from '../../utils/cell-renderers';
import {
    countryEnumFilterConfig,
    defaultBooleanFilterConfig,
    defaultNumericFilterConfig,
    defaultTextFilterConfig,
    editableColumnConfig,
    excludeFromGlobalFilter,
    typeAndFetchers,
} from './common-config';
import type { SpreadsheetTabDefinition } from '../spreadsheet.type';
import { genericColumnOfPropertiesEditPopup } from '../common/column-properties';
import { booleanCellEditorConfig, numericalCellEditorConfig } from '../common/cell-editors';

export const BATTERY_TAB_DEF = {
    index: 9,
    name: 'Batteries',
    ...typeAndFetchers(EQUIPMENT_TYPES.BATTERY),
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
            ...editableColumnConfig,
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
            field: 'nominalVoltage',
            ...defaultNumericFilterConfig,
            context: {
                ...defaultNumericFilterConfig.context,
                numeric: true,
                fractionDigits: 0,
            },
        },
        {
            colId: 'activePower',
            field: 'p',
            ...defaultNumericFilterConfig,
            context: {
                ...defaultNumericFilterConfig.context,
                numeric: true,
                fractionDigits: 1,
                withFluxConvention: true,
                canBeInvalidated: true,
            },
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            colId: 'ReactivePower',
            field: 'q',
            getQuickFilterText: excludeFromGlobalFilter,
            ...defaultNumericFilterConfig,
            context: {
                ...defaultNumericFilterConfig.context,
                numeric: true,
                fractionDigits: 1,
                withFluxConvention: true,
                canBeInvalidated: true,
            },
        },
        {
            colId: 'ActivePowerControl',
            field: 'activePowerControl.participate',
            cellRenderer: BooleanCellRenderer,
            ...defaultBooleanFilterConfig,
            ...editableColumnConfig,
            valueSetter: (params) => {
                params.data.activePowerControl = {
                    ...(params.data.activePowerControl || {}),
                    participate: params.newValue,
                };
                return true;
            },
            ...booleanCellEditorConfig((params) => params.data?.activePowerControl?.participate ?? false),
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            colId: 'DroopColumnName',
            field: 'activePowerControl.droop',
            valueGetter: (params) => params.data?.activePowerControl?.droop,
            valueSetter: (params) => {
                params.data.activePowerControl = {
                    ...(params.data.activePowerControl || {}),
                    droop: params.newValue,
                };
                return true;
            },
            ...defaultNumericFilterConfig,
            ...editableColumnConfig,
            ...numericalCellEditorConfig((params) => params.data.activePowerControl?.droop),
            getQuickFilterText: excludeFromGlobalFilter,
            context: {
                ...defaultNumericFilterConfig.context,
                numeric: true,
                fractionDigits: 1,
                crossValidation: {
                    requiredOn: {
                        dependencyColumn: 'activePowerControl.participate',
                        columnValue: true,
                    },
                },
            },
        },
        {
            colId: 'minP',
            field: 'minP',
            ...defaultNumericFilterConfig,
            ...editableColumnConfig,
            ...numericalCellEditorConfig((params) => params.data.minP),
            getQuickFilterText: excludeFromGlobalFilter,
            context: {
                ...defaultNumericFilterConfig.context,
                numeric: true,
                fractionDigits: 1,
                crossValidation: {
                    minExpression: '0',
                },
            },
        },
        {
            colId: 'maxP',
            field: 'maxP',
            ...defaultNumericFilterConfig,
            ...editableColumnConfig,
            ...numericalCellEditorConfig((params) => params.data.maxP),
            getQuickFilterText: excludeFromGlobalFilter,
            context: {
                ...defaultNumericFilterConfig.context,
                numeric: true,
                fractionDigits: 1,
                crossValidation: {
                    minExpression: 'minP',
                },
            },
        },
        {
            colId: 'activePowerSetpoint',
            field: 'targetP',
            ...defaultNumericFilterConfig,
            ...editableColumnConfig,
            ...numericalCellEditorConfig((params) => params.data.targetP),
            getQuickFilterText: excludeFromGlobalFilter,
            context: {
                ...defaultNumericFilterConfig.context,
                numeric: true,
                fractionDigits: 1,
                crossValidation: {
                    minExpression: 'minP',
                    maxExpression: 'maxP',
                    allowZero: true,
                },
            },
        },
        {
            colId: 'reactivePowerSetpoint',
            field: 'targetQ',
            ...editableColumnConfig,
            ...defaultNumericFilterConfig,
            ...numericalCellEditorConfig((params) => params.data.targetQ),
            getQuickFilterText: excludeFromGlobalFilter,
            context: {
                ...defaultNumericFilterConfig.context,
                numeric: true,
                fractionDigits: 1,
            },
        },
        {
            colId: 'connected',
            field: 'terminalConnected',
            cellRenderer: BooleanCellRenderer,
            getQuickFilterText: excludeFromGlobalFilter,
            ...defaultBooleanFilterConfig,
            context: {
                ...defaultBooleanFilterConfig.context,
                boolean: true,
            },
        },
        genericColumnOfPropertiesEditPopup,
    ],
} as const satisfies ReadonlyDeep<SpreadsheetTabDefinition>;

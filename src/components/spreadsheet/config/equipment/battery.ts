/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { ReadonlyDeep } from 'type-fest';
import { EQUIPMENT_TYPES } from '../../../utils/equipment-types';
import { BooleanCellRenderer } from '../../utils/cell-renderers';
import {
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
            id: 'ID',
            field: 'id',
            isDefaultSort: true,
            ...defaultTextFilterConfig,
        },
        {
            id: 'Name',
            field: 'name',
            ...defaultTextFilterConfig,
            ...editableColumnConfig,
        },
        {
            id: 'VoltageLevelId',
            field: 'voltageLevelId',
            ...defaultTextFilterConfig,
        },
        {
            id: 'Country',
            field: 'country',
            ...defaultTextFilterConfig,
        },
        {
            id: 'NominalV',
            field: 'nominalVoltage',
            numeric: true,
            ...defaultNumericFilterConfig,
            fractionDigits: 0,
        },
        {
            id: 'activePower',
            field: 'p',
            numeric: true,
            fractionDigits: 1,
            ...defaultNumericFilterConfig,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'ReactivePower',
            field: 'q',
            numeric: true,
            fractionDigits: 1,
            ...defaultNumericFilterConfig,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'ActivePowerControl',
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
            id: 'DroopColumnName',
            field: 'activePowerControl.droop',
            numeric: true,
            ...defaultNumericFilterConfig,
            fractionDigits: 1,
            ...editableColumnConfig,
            ...numericalCellEditorConfig((params) => params.data.activePowerControl?.droop),
            valueGetter: (params) => params.data?.activePowerControl?.droop,
            valueSetter: (params) => {
                params.data.activePowerControl = {
                    ...(params.data.activePowerControl || {}),
                    droop: params.newValue,
                };
                return true;
            },
            crossValidation: {
                requiredOn: {
                    dependencyColumn: 'activePowerControl.participate',
                    columnValue: true,
                },
            },
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'minP',
            field: 'minP',
            numeric: true,
            ...defaultNumericFilterConfig,
            fractionDigits: 1,
            ...editableColumnConfig,
            ...numericalCellEditorConfig((params) => params.data.minP),
            crossValidation: {
                maxExpression: 'maxP',
            },
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'maxP',
            field: 'maxP',
            numeric: true,
            ...defaultNumericFilterConfig,
            fractionDigits: 1,
            ...editableColumnConfig,
            ...numericalCellEditorConfig((params) => params.data.maxP),
            crossValidation: {
                minExpression: 'minP',
            },
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'activePowerSetpoint',
            field: 'targetP',
            numeric: true,
            ...defaultNumericFilterConfig,
            fractionDigits: 1,
            ...editableColumnConfig,
            ...numericalCellEditorConfig((params) => params.data.targetP),
            crossValidation: {
                minExpression: 'minP',
                maxExpression: 'maxP',
                allowZero: true,
            },
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'reactivePowerSetpoint',
            field: 'targetQ',
            numeric: true,
            ...defaultNumericFilterConfig,
            fractionDigits: 1,
            ...editableColumnConfig,
            ...numericalCellEditorConfig((params) => params.data.targetQ),
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'connected',
            field: 'terminalConnected',
            cellRenderer: BooleanCellRenderer,
            ...defaultBooleanFilterConfig,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        genericColumnOfPropertiesEditPopup,
    ],
} as const satisfies ReadonlyDeep<SpreadsheetTabDefinition>;

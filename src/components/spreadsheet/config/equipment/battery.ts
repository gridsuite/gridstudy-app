/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { EQUIPMENT_TYPES } from '../../../utils/equipment-types';
import { fetchBatteries } from '../../../../services/study/network';
import { BooleanListField, NumericalField } from '../../utils/equipment-table-editors';
import CountryCellRenderer from '../../utils/country-cell-render';
import { ValueGetterParams, ValueSetterParams } from 'ag-grid-community';
import { BooleanCellRenderer, PropertiesCellRenderer } from '../../utils/cell-renderers';
import { SitePropertiesEditor } from '../../utils/equipement-table-popup-editors';
import {
    countryEnumFilterConfig,
    defaultBooleanFilterConfig,
    defaultNumericFilterConfig,
    defaultTextFilterConfig,
    editableCellStyle,
    excludeFromGlobalFilter,
    isEditable,
    propertiesGetter,
} from './common-config';
import { SpreadsheetTabDefinition } from '../spreadsheet.type';

export const BATTERY_TAB_DEF: SpreadsheetTabDefinition = {
    index: 9,
    name: 'Batteries',
    type: EQUIPMENT_TYPES.BATTERY,
    fetchers: [fetchBatteries],
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
            editable: isEditable,
            cellStyle: editableCellStyle,
        },
        {
            id: 'VoltageLevelId',
            field: 'voltageLevelId',
            ...defaultTextFilterConfig,
        },
        {
            id: 'Country',
            field: 'country',
            ...countryEnumFilterConfig,
            cellRenderer: CountryCellRenderer,
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
            canBeInvalidated: true,
            withFluxConvention: true,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'ReactivePower',
            field: 'q',
            numeric: true,
            fractionDigits: 1,
            ...defaultNumericFilterConfig,
            canBeInvalidated: true,
            withFluxConvention: true,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'ActivePowerControl',
            field: 'activePowerControl.participate',
            cellRenderer: BooleanCellRenderer,
            ...defaultBooleanFilterConfig,
            editable: isEditable,
            cellStyle: editableCellStyle,
            valueSetter: (params: ValueSetterParams) => {
                params.data.activePowerControl = {
                    ...(params.data.activePowerControl || {}),
                    participate: params.newValue,
                };
                return true;
            },
            cellEditor: BooleanListField,
            cellEditorParams: (params: any) => {
                return {
                    defaultValue:
                        params.data?.activePowerControl?.participate != null
                            ? +params.data?.activePowerControl?.participate
                            : '',
                    gridContext: params.context,
                    gridApi: params.api,
                    colDef: params.colDef,
                };
            },
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'DroopColumnName',
            field: 'activePowerControl.droop',
            numeric: true,
            ...defaultNumericFilterConfig,
            fractionDigits: 1,
            editable: isEditable,
            cellStyle: editableCellStyle,
            cellEditor: NumericalField,
            cellEditorParams: (params: any) => {
                return {
                    defaultValue: params.data.activePowerControl?.droop,
                    gridContext: params.context,
                    gridApi: params.api,
                    colDef: params.colDef,
                    rowData: params.data,
                };
            },
            valueGetter: (params: ValueGetterParams) => params.data?.activePowerControl?.droop,
            valueSetter: (params: ValueSetterParams) => {
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
            editable: isEditable,
            cellStyle: editableCellStyle,
            cellEditor: NumericalField,
            cellEditorParams: (params: any) => {
                return {
                    defaultValue: params.data.minP,
                    gridContext: params.context,
                    gridApi: params.api,
                    colDef: params.colDef,
                    rowData: params.data,
                };
            },
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
            editable: isEditable,
            cellStyle: editableCellStyle,
            cellEditor: NumericalField,
            cellEditorParams: (params: any) => {
                return {
                    defaultValue: params.data.maxP,
                    gridContext: params.context,
                    gridApi: params.api,
                    colDef: params.colDef,
                    rowData: params.data,
                };
            },
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
            editable: isEditable,
            cellStyle: editableCellStyle,
            cellEditor: NumericalField,
            cellEditorParams: (params: any) => {
                return {
                    defaultValue: params.data.targetP,
                    gridContext: params.context,
                    gridApi: params.api,
                    colDef: params.colDef,
                    rowData: params.data,
                };
            },
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
            editable: isEditable,
            cellStyle: editableCellStyle,
            cellEditor: NumericalField,
            cellEditorParams: (params: any) => {
                return {
                    defaultValue: params.data.targetQ,
                    gridContext: params.context,
                    gridApi: params.api,
                    colDef: params.colDef,
                    rowData: params.data,
                };
            },
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'connected',
            field: 'terminalConnected',
            boolean: true,
            cellRenderer: BooleanCellRenderer,
            ...defaultBooleanFilterConfig,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'Properties',
            field: 'properties',
            editable: isEditable,
            cellStyle: editableCellStyle,
            valueGetter: propertiesGetter,
            cellRenderer: PropertiesCellRenderer,
            minWidth: 300,
            getQuickFilterText: excludeFromGlobalFilter,
            valueSetter: (params: ValueSetterParams) => {
                params.data.properties = params.newValue;
                return true;
            },
            cellEditor: SitePropertiesEditor,
            cellEditorPopup: true,
            ...defaultTextFilterConfig,
        },
    ],
};

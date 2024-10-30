/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { SpreadsheetTabDefinition } from '../spreadsheet.type';
import { EQUIPMENT_TYPES } from '../../../utils/equipment-types';
import { fetchShuntCompensators } from '../../../../services/study/network';
import { EnumListField, NumericalField } from '../../utils/equipment-table-editors';
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
    getDefaultEnumCellEditorParams,
    getDefaultEnumConfig,
    isEditable,
    MEDIUM_COLUMN_WIDTH,
    MIN_COLUMN_WIDTH,
    propertiesGetter,
} from './common-config';
import { SHUNT_COMPENSATOR_TYPES } from '../../../network/constants';

export const SHUNT_COMPENSATOR_TAB_DEF: SpreadsheetTabDefinition = {
    index: 7,
    name: 'ShuntCompensators',
    type: EQUIPMENT_TYPES.SHUNT_COMPENSATOR,
    fetchers: [fetchShuntCompensators],
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
            ...defaultTextFilterConfig,
            editable: isEditable,
            cellStyle: editableCellStyle,
            columnWidth: MIN_COLUMN_WIDTH,
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
            id: 'maximumSectionCount',
            field: 'maximumSectionCount',
            editable: isEditable,
            cellStyle: editableCellStyle,
            numeric: true,
            cellEditor: NumericalField,
            cellEditorParams: (params: any) => {
                return {
                    defaultValue: params.data.maximumSectionCount,
                    gridContext: params.context,
                    gridApi: params.api,
                    colDef: params.colDef,
                    rowData: params.data,
                };
            },
            ...defaultNumericFilterConfig,
            getQuickFilterText: excludeFromGlobalFilter,
            crossValidation: {
                minExpression: 1,
            },
        },
        {
            id: 'sectionCount',
            field: 'sectionCount',
            editable: isEditable,
            cellStyle: editableCellStyle,
            numeric: true,
            cellEditor: NumericalField,
            cellEditorParams: (params: any) => {
                return {
                    defaultValue: params.data.sectionCount,
                    gridContext: params.context,
                    gridApi: params.api,
                    colDef: params.colDef,
                    rowData: params.data,
                };
            },
            ...defaultNumericFilterConfig,
            getQuickFilterText: excludeFromGlobalFilter,
            crossValidation: {
                minExpression: 0,
                maxExpression: 'maximumSectionCount',
            },
        },
        {
            id: 'Type',
            field: 'type',
            ...getDefaultEnumConfig(Object.values(SHUNT_COMPENSATOR_TYPES)),
            editable: isEditable,
            cellStyle: editableCellStyle,
            cellEditor: EnumListField,
            cellEditorParams: (params: any) =>
                getDefaultEnumCellEditorParams(params, params.data?.type, Object.values(SHUNT_COMPENSATOR_TYPES)),
        },
        {
            id: 'maxQAtNominalV',
            field: 'maxQAtNominalV',
            editable: isEditable,
            cellStyle: editableCellStyle,
            numeric: true,
            cellEditor: NumericalField,
            cellEditorParams: (params: any) => {
                return {
                    defaultValue: params.data.maxQAtNominalV,
                    gridContext: params.context,
                    gridApi: params.api,
                    colDef: params.colDef,
                    rowData: params.data,
                };
            },
            ...defaultNumericFilterConfig,
            fractionDigits: 1,
            getQuickFilterText: excludeFromGlobalFilter,
            crossValidation: {
                minExpression: 0,
            },
        },
        {
            id: 'SwitchedOnMaxQAtNominalV',
            field: 'switchedOnQAtNominalV',
            numeric: true,
            valueGetter: (params: ValueGetterParams) =>
                (params?.data?.maxQAtNominalV / params?.data?.maximumSectionCount) * params?.data?.sectionCount,
            ...defaultNumericFilterConfig,
            fractionDigits: 1,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'maxSusceptance',
            editable: isEditable,
            cellStyle: editableCellStyle,
            field: 'maxSusceptance',
            numeric: true,
            cellEditor: NumericalField,
            cellEditorParams: (params: any) => {
                return {
                    defaultValue: params.data.maxSusceptance,
                    gridContext: params.context,
                    gridApi: params.api,
                    colDef: params.colDef,
                    rowData: params.data,
                };
            },
            ...defaultNumericFilterConfig,
            fractionDigits: 5,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'SwitchedOnMaxSusceptance',
            field: 'switchedOnSusceptance',
            numeric: true,
            valueGetter: (params: ValueGetterParams) =>
                (params?.data?.maxSusceptance / params?.data?.maximumSectionCount) * params?.data?.sectionCount,
            ...defaultNumericFilterConfig,
            fractionDigits: 5,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'voltageSetpoint',
            field: 'targetV',
            numeric: true,
            ...defaultNumericFilterConfig,
            fractionDigits: 1,
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

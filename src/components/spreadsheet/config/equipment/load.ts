/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { SpreadsheetTabDefinition } from '../spreadsheet.type';
import { EQUIPMENT_TYPES } from '../../../utils/equipment-types';
import { EnumListField, NumericalField } from '../../utils/equipment-table-editors';
import CountryCellRenderer from '../../utils/country-cell-render';
import type { ValueSetterParams } from 'ag-grid-community';
import { BooleanCellRenderer, PropertiesCellRenderer } from '../../utils/cell-renderers';
import { SitePropertiesEditor } from '../../utils/equipement-table-popup-editors';
import {
    countryEnumFilterConfig,
    defaultBooleanFilterConfig,
    defaultNumericFilterConfig,
    defaultTextFilterConfig,
    editableColumnConfig,
    excludeFromGlobalFilter,
    getDefaultEnumCellEditorParams,
    getDefaultEnumConfig,
    propertiesGetter,
    typeAndFetchers,
} from './common-config';
import { MEDIUM_COLUMN_WIDTH } from '../../utils/constants';
import { LOAD_TYPES } from '../../../network/constants';

export const LOAD_TAB_DEF: SpreadsheetTabDefinition = {
    index: 6,
    name: 'Loads',
    ...typeAndFetchers(EQUIPMENT_TYPES.LOAD),
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
            columnWidth: MEDIUM_COLUMN_WIDTH,
            changeCmd: "equipment.setName('{}')\n",
            ...editableColumnConfig,
        },
        {
            id: 'loadType',
            field: 'type',
            ...getDefaultEnumConfig([...LOAD_TYPES, { id: 'UNDEFINED', label: 'Undefined' }]),
            changeCmd: 'equipment.setLoadType(LoadType.{})\n',
            ...editableColumnConfig,
            cellEditor: EnumListField,
            cellEditorParams: (params: any) =>
                getDefaultEnumCellEditorParams(params, params.data?.type, [
                    ...LOAD_TYPES,
                    { id: 'UNDEFINED', label: 'Undefined' },
                ]),
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
            ...defaultNumericFilterConfig,
            fractionDigits: 1,
            canBeInvalidated: true,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'ReactivePower',
            field: 'q',
            numeric: true,
            ...defaultNumericFilterConfig,
            fractionDigits: 1,
            canBeInvalidated: true,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'p0',
            field: 'p0',
            numeric: true,
            ...defaultNumericFilterConfig,
            fractionDigits: 1,
            changeCmd: 'equipment.setP0({})\n',
            ...editableColumnConfig,
            cellEditor: NumericalField,
            cellEditorParams: (params: any) => {
                return {
                    defaultValue: params.data.p0,
                    gridContext: params.context,
                    gridApi: params.api,
                    colDef: params.colDef,
                    rowData: params.data,
                };
            },
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'q0',
            field: 'q0',
            numeric: true,
            ...defaultNumericFilterConfig,
            fractionDigits: 1,
            changeCmd: 'equipment.setQ0({})\n',
            ...editableColumnConfig,
            cellEditor: NumericalField,
            cellEditorParams: (params: any) => {
                return {
                    defaultValue: params.data.q0,
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
            ...editableColumnConfig,
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

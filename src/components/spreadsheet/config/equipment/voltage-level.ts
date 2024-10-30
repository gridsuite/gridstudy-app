/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { SpreadsheetTabDefinition } from '../spreadsheet.type';
import { EQUIPMENT_TYPES } from '../../../utils/equipment-types';
import { NumericalField } from '../../utils/equipment-table-editors';
import CountryCellRenderer from '../../utils/country-cell-render';
import { ValueGetterParams, ValueSetterParams } from 'ag-grid-community';
import { PropertiesCellRenderer } from '../../utils/cell-renderers';
import { SitePropertiesEditor } from '../../utils/equipement-table-popup-editors';
import {
    countryEnumFilterConfig,
    defaultNumericFilterConfig,
    defaultTextFilterConfig,
    editableCellStyle,
    excludeFromGlobalFilter,
    isEditable,
    propertiesGetter,
} from './common-config';
import { kiloUnitToUnit, unitToKiloUnit } from '../../../../utils/unit-converter';
import { fetchVoltageLevels } from '../../../../services/study/network';

const generateEditableNumericColumnDefinition = (
    id: string,
    field: string,
    fractionDigits: number,
    changeCmd: string,
    optional: boolean,
    minExpression: string | undefined,
    maxExpression: string | undefined,
    excludeFromGlobalFilter: () => string
) => {
    return {
        id: id,
        field: field,
        numeric: true,
        ...defaultNumericFilterConfig,
        fractionDigits: fractionDigits,
        changeCmd: changeCmd,
        editable: isEditable,
        cellStyle: editableCellStyle,
        cellEditor: NumericalField,
        cellEditorParams: (params: any) => {
            return {
                defaultValue: params.data[field],
                gridContext: params.context,
                gridApi: params.api,
                colDef: params.colDef,
                rowData: params.data,
            };
        },
        crossValidation: {
            optional: optional,
            minExpression: minExpression,
            maxExpression: maxExpression,
        },
        ...(excludeFromGlobalFilter && {
            getQuickFilterText: excludeFromGlobalFilter,
        }),
    };
};

export const VOLTAGE_LEVEL_TAB_DEF: SpreadsheetTabDefinition = {
    index: 1,
    name: 'VoltageLevels',
    type: EQUIPMENT_TYPES.VOLTAGE_LEVEL,
    fetchers: [fetchVoltageLevels],
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
            editable: isEditable,
            cellStyle: editableCellStyle,
            ...defaultTextFilterConfig,
        },
        {
            id: 'SubstationId',
            field: 'substationId',
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
            field: 'nominalV',
            numeric: true,
            ...defaultNumericFilterConfig,
            fractionDigits: 0,
            editable: isEditable,
            cellStyle: editableCellStyle,
            cellEditor: NumericalField,
            cellEditorParams: (params: any) => {
                return {
                    defaultValue: params.data.nominalV,
                    gridContext: params.context,
                    gridApi: params.api,
                    colDef: params.colDef,
                    rowData: params.data,
                };
            },
        },
        generateEditableNumericColumnDefinition(
            'LowVoltageLimitkV',
            'lowVoltageLimit',
            1,
            'equipment.setLowVoltageLimit({})\n',
            true,
            undefined,
            'highVoltageLimit',
            excludeFromGlobalFilter
        ),
        generateEditableNumericColumnDefinition(
            'HighVoltageLimitkV',
            'highVoltageLimit',
            1,
            'equipment.setHighVoltageLimit({})\n',
            true,
            'lowVoltageLimit',
            undefined,
            excludeFromGlobalFilter
        ),
        {
            id: 'IpMin',
            field: 'identifiableShortCircuit.ipMin',
            ...defaultNumericFilterConfig,
            fractionDigits: 1,
            editable: isEditable,
            cellStyle: editableCellStyle,
            numeric: true,
            cellEditor: NumericalField,
            cellEditorParams: (params: any) => {
                return {
                    defaultValue: unitToKiloUnit(params.data?.identifiableShortCircuit?.ipMin),
                    gridContext: params.context,
                    gridApi: params.api,
                    colDef: params.colDef,
                    rowData: params.data,
                };
            },
            valueGetter: (params: ValueGetterParams) => unitToKiloUnit(params.data?.identifiableShortCircuit?.ipMin),
            valueSetter: (params: ValueSetterParams) => {
                params.data.identifiableShortCircuit = {
                    ...params.data.identifiableShortCircuit,
                    ipMin: kiloUnitToUnit(params.newValue),
                };
                return true;
            },
            ...(excludeFromGlobalFilter && {
                getQuickFilterText: excludeFromGlobalFilter,
            }),
            crossValidation: {
                optional: true,
            },
        },
        {
            id: 'IpMax',
            field: 'identifiableShortCircuit.ipMax',
            ...defaultNumericFilterConfig,
            fractionDigits: 1,
            editable: isEditable,
            cellStyle: editableCellStyle,
            numeric: true,
            cellEditor: NumericalField,
            cellEditorParams: (params: any) => {
                return {
                    defaultValue: unitToKiloUnit(params.data?.identifiableShortCircuit?.ipMax),
                    gridContext: params.context,
                    gridApi: params.api,
                    colDef: params.colDef,
                    rowData: params.data,
                };
            },
            valueGetter: (params: ValueGetterParams) => unitToKiloUnit(params.data?.identifiableShortCircuit?.ipMax),
            valueSetter: (params: ValueSetterParams) => {
                params.data.identifiableShortCircuit = {
                    ...params.data.identifiableShortCircuit,
                    ipMax: kiloUnitToUnit(params.newValue),
                };
                return true;
            },
            ...(excludeFromGlobalFilter && {
                getQuickFilterText: excludeFromGlobalFilter,
            }),
            ...{
                crossValidation: {
                    requiredOn: {
                        dependencyColumn: 'identifiableShortCircuit.ipMin',
                    },
                },
            },
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

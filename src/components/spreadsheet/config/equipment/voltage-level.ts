/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { SpreadsheetTabDefinition } from '../spreadsheet.type';
import { EQUIPMENT_TYPES } from '../../../utils/equipment-types';
import { NumericalField } from '../../utils/equipment-table-editors';
import CountryCellRenderer from '../../utils/country-cell-render';
import {
    countryEnumFilterConfig,
    defaultNumericFilterConfig,
    defaultTextFilterConfig,
    editableColumnConfig,
    excludeFromGlobalFilter,
    typeAndFetchers,
} from './common-config';
import { kiloUnitToUnit, unitToKiloUnit } from '../../../../utils/unit-converter';
import { genericColumnOfPropertiesEditPopup } from '../common/column-properties';

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
        ...editableColumnConfig,
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
    ...typeAndFetchers(EQUIPMENT_TYPES.VOLTAGE_LEVEL),
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
            ...editableColumnConfig,
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
            ...editableColumnConfig,
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
            ...editableColumnConfig,
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
            valueGetter: (params) => unitToKiloUnit(params.data?.identifiableShortCircuit?.ipMin),
            valueSetter: (params) => {
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
            ...editableColumnConfig,
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
            valueGetter: (params) => unitToKiloUnit(params.data?.identifiableShortCircuit?.ipMax),
            valueSetter: (params) => {
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
        genericColumnOfPropertiesEditPopup,
    ],
};

/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { ReadonlyDeep } from 'type-fest';
import type { SpreadsheetTabDefinition } from '../spreadsheet.type';
import type { CustomColDef } from '../../../custom-aggrid/custom-aggrid-header.type';
import { EQUIPMENT_TYPES } from '../../../utils/equipment-types';
import CountryCellRenderer from '../../utils/country-cell-render';
import {
    countryEnumFilterConfig,
    defaultNumericFilterConfig,
    defaultTextFilterConfig,
    editableColumnConfig,
    excludeFromGlobalFilter,
    typeAndFetchers,
} from './common-config';
import { genericColumnOfPropertiesEditPopup } from '../common/column-properties';
import { numericalCellEditorConfig } from '../common/cell-editors';
import { convertInputValue, convertOutputValue, FieldType } from '@gridsuite/commons-ui';

function generateEditableNumericColumnDefinition<
    TId extends string,
    TField extends string,
    TMin extends string | undefined,
    TMax extends string | undefined
>(id: TId, field: TField, minExpression: TMin, maxExpression: TMax) {
    return {
        colId: id,
        field: field,
        ...defaultNumericFilterConfig,
        context: {
            ...defaultNumericFilterConfig.context,
            numeric: true,
            fractionDigits: 1,
            crossValidation: {
                optional: true,
                minExpression: minExpression,
                maxExpression: maxExpression,
            },
        },
        ...editableColumnConfig,
        ...numericalCellEditorConfig((params) => params.data[field]),
        getQuickFilterText: excludeFromGlobalFilter,
    } as const satisfies ReadonlyDeep<CustomColDef>;
}

export const VOLTAGE_LEVEL_TAB_DEF = {
    index: 1,
    name: 'VoltageLevels',
    ...typeAndFetchers(EQUIPMENT_TYPES.VOLTAGE_LEVEL),
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
            ...editableColumnConfig,
            ...defaultTextFilterConfig,
        },
        {
            colId: 'SubstationId',
            field: 'substationId',
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
            ...editableColumnConfig,
            ...numericalCellEditorConfig((params) => params.data.nominalV),
        },
        generateEditableNumericColumnDefinition('LowVoltageLimitkV', 'lowVoltageLimit', undefined, 'highVoltageLimit'),
        generateEditableNumericColumnDefinition('HighVoltageLimitkV', 'highVoltageLimit', 'lowVoltageLimit', undefined),
        {
            colId: 'IpMin',
            field: 'identifiableShortCircuit.ipMin',
            ...defaultNumericFilterConfig,
            ...editableColumnConfig,
            context: {
                ...defaultNumericFilterConfig.context,
                numeric: true,
                fractionDigits: 1,
                crossValidation: {
                    optional: true,
                },
            },
            ...numericalCellEditorConfig((params) =>
                convertInputValue(
                    FieldType.LOW_SHORT_CIRCUIT_CURRENT_LIMIT,
                    params.data?.identifiableShortCircuit?.ipMin
                )
            ),
            valueGetter: (params) =>
                convertInputValue(
                    FieldType.LOW_SHORT_CIRCUIT_CURRENT_LIMIT,
                    params.data?.identifiableShortCircuit?.ipMin
                ),
            valueSetter: (params) => {
                params.data.identifiableShortCircuit = {
                    ...params.data.identifiableShortCircuit,
                    ipMin: convertOutputValue(FieldType.LOW_SHORT_CIRCUIT_CURRENT_LIMIT, params.newValue),
                };
                return true;
            },
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            colId: 'IpMax',
            field: 'identifiableShortCircuit.ipMax',
            ...defaultNumericFilterConfig,
            ...editableColumnConfig,
            context: {
                ...defaultNumericFilterConfig.context,
                numeric: true,
                fractionDigits: 1,
                crossValidation: {
                    requiredOn: {
                        dependencyColumn: 'identifiableShortCircuit.ipMin',
                    },
                },
            },
            ...numericalCellEditorConfig((params) =>
                convertInputValue(
                    FieldType.HIGH_SHORT_CIRCUIT_CURRENT_LIMIT,
                    params.data?.identifiableShortCircuit?.ipMax
                )
            ),
            valueGetter: (params) =>
                convertInputValue(
                    FieldType.HIGH_SHORT_CIRCUIT_CURRENT_LIMIT,
                    params.data?.identifiableShortCircuit?.ipMax
                ),
            valueSetter: (params) => {
                params.data.identifiableShortCircuit = {
                    ...params.data.identifiableShortCircuit,
                    ipMax: convertOutputValue(FieldType.HIGH_SHORT_CIRCUIT_CURRENT_LIMIT, params.newValue),
                };
                return true;
            },
            getQuickFilterText: excludeFromGlobalFilter,
        },
        genericColumnOfPropertiesEditPopup,
    ],
} as const satisfies ReadonlyDeep<SpreadsheetTabDefinition>;

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
import { kiloUnitToUnit, unitToKiloUnit } from '../../../../utils/unit-converter';
import { genericColumnOfPropertiesEditPopup } from '../common/column-properties';
import { numericalCellEditorConfig } from '../common/cell-editors';

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
        ...numericalCellEditorConfig((params) => params.data[field]),
        crossValidation: {
            optional: optional,
            minExpression: minExpression,
            maxExpression: maxExpression,
        },
        ...(excludeFromGlobalFilter && {
            getQuickFilterText: excludeFromGlobalFilter,
        }),
    } as const satisfies Partial<ReadonlyDeep<CustomColDef>>;
};

export const VOLTAGE_LEVEL_TAB_DEF = {
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
            ...numericalCellEditorConfig((params) => params.data.nominalV),
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
            ...numericalCellEditorConfig((params) => unitToKiloUnit(params.data?.identifiableShortCircuit?.ipMin)),
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
            ...numericalCellEditorConfig((params) => unitToKiloUnit(params.data?.identifiableShortCircuit?.ipMax)),
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
} as const satisfies ReadonlyDeep<SpreadsheetTabDefinition>;

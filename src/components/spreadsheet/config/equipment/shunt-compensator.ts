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
    editableColumnConfig,
    excludeFromGlobalFilter,
    getDefaultEnumConfig,
    typeAndFetchers,
} from './common-config';
import { MEDIUM_COLUMN_WIDTH, MIN_COLUMN_WIDTH } from '../../utils/constants';
import { SHUNT_COMPENSATOR_TYPES } from '../../../network/constants';
import { genericColumnOfPropertiesEditPopup } from '../common/column-properties';
import { enumCellEditorConfig, numericalCellEditorConfig } from '../common/cell-editors';

export const SHUNT_COMPENSATOR_TAB_DEF = {
    index: 7,
    name: 'ShuntCompensators',
    ...typeAndFetchers(EQUIPMENT_TYPES.SHUNT_COMPENSATOR),
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
            ...editableColumnConfig,
            context: {
                ...defaultTextFilterConfig.context,
                columnWidth: MIN_COLUMN_WIDTH,
            },
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
            colId: 'ReactivePower',
            field: 'q',
            ...defaultNumericFilterConfig,
            context: {
                ...defaultNumericFilterConfig.context,
                numeric: true,
                fractionDigits: 1,
                canBeInvalidated: true,
                withFluxConvention: true,
            },
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            colId: 'maximumSectionCount',
            field: 'maximumSectionCount',
            ...editableColumnConfig,
            ...numericalCellEditorConfig((params) => params.data.maximumSectionCount),
            ...defaultNumericFilterConfig,
            getQuickFilterText: excludeFromGlobalFilter,
            context: {
                ...defaultNumericFilterConfig.context,
                numeric: true,
                crossValidation: {
                    minExpression: 1,
                },
            },
        },
        {
            colId: 'sectionCount',
            field: 'sectionCount',
            ...editableColumnConfig,
            ...numericalCellEditorConfig((params) => params.data.sectionCount),
            ...defaultNumericFilterConfig,
            getQuickFilterText: excludeFromGlobalFilter,
            context: {
                ...defaultNumericFilterConfig.context,
                numeric: true,
                crossValidation: {
                    minExpression: 0,
                    maxExpression: 'maximumSectionCount',
                },
            },
        },
        {
            colId: 'Type',
            field: 'type',
            ...getDefaultEnumConfig(Object.values(SHUNT_COMPENSATOR_TYPES)),
            ...editableColumnConfig,
            ...enumCellEditorConfig((params) => params.data?.type, Object.values(SHUNT_COMPENSATOR_TYPES)),
        },
        {
            colId: 'maxQAtNominalV',
            field: 'maxQAtNominalV',
            ...editableColumnConfig,
            ...numericalCellEditorConfig((params) => params.data.maxQAtNominalV),
            ...defaultNumericFilterConfig,
            getQuickFilterText: excludeFromGlobalFilter,
            context: {
                ...defaultNumericFilterConfig.context,
                numeric: true,
                fractionDigits: 1,
                crossValidation: {
                    minExpression: 0,
                },
            },
        },
        {
            colId: 'SwitchedOnMaxQAtNominalV',
            field: 'switchedOnQAtNominalV',
            valueGetter: (params) =>
                (params?.data?.maxQAtNominalV / params?.data?.maximumSectionCount) * params?.data?.sectionCount,
            ...defaultNumericFilterConfig,
            context: {
                ...defaultNumericFilterConfig.context,
                numeric: true,
                fractionDigits: 1,
            },
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            colId: 'maxSusceptance',
            ...editableColumnConfig,
            field: 'maxSusceptance',
            ...numericalCellEditorConfig((params) => params.data.maxSusceptance),
            ...defaultNumericFilterConfig,
            context: {
                ...defaultNumericFilterConfig.context,
                numeric: true,
                fractionDigits: 5,
            },
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            colId: 'SwitchedOnMaxSusceptance',
            field: 'switchedOnSusceptance',
            valueGetter: (params) =>
                (params?.data?.maxSusceptance / params?.data?.maximumSectionCount) * params?.data?.sectionCount,
            ...defaultNumericFilterConfig,
            context: {
                ...defaultNumericFilterConfig.context,
                numeric: true,
                fractionDigits: 5,
            },
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            colId: 'voltageSetpoint',
            field: 'targetV',
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
        genericColumnOfPropertiesEditPopup,
    ],
} as const satisfies ReadonlyDeep<SpreadsheetTabDefinition>;

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
    defaultNumericFilterConfig,
    editableColumnConfig,
    excludeFromGlobalFilter,
    getDefaultEnumConfig,
    typeAndFetchers,
} from './common-config';
import {
    COUNTRY_FILTER,
    MEDIUM_COLUMN_WIDTH,
    MIN_COLUMN_WIDTH,
    NUMERIC_FILTER,
    TEXT_FILTER,
} from '../../utils/constants';
import { SHUNT_COMPENSATOR_TYPES } from '../../../network/constants';
import { genericColumnOfPropertiesEditPopup } from '../common/column-properties';
import { enumCellEditorConfig, numericalCellEditorConfig } from '../common/cell-editors';

export const SHUNT_COMPENSATOR_TAB_DEF = {
    index: 7,
    name: 'ShuntCompensators',
    ...typeAndFetchers(EQUIPMENT_TYPES.SHUNT_COMPENSATOR),
    columns: [
        {
            id: 'ID',
            field: 'id',
            columnWidth: MEDIUM_COLUMN_WIDTH,
            isDefaultSort: true,
            type: TEXT_FILTER,
        },
        {
            id: 'Name',
            field: 'name',
            type: TEXT_FILTER,
            ...editableColumnConfig,
            columnWidth: MIN_COLUMN_WIDTH,
        },
        {
            id: 'VoltageLevelId',
            field: 'voltageLevelId',
            type: TEXT_FILTER,
        },
        {
            id: 'Country',
            field: 'country',
            type: COUNTRY_FILTER,
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
            type: NUMERIC_FILTER,
            canBeInvalidated: true,
            withFluxConvention: true,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'maximumSectionCount',
            field: 'maximumSectionCount',
            ...editableColumnConfig,
            numeric: true,
            ...numericalCellEditorConfig((params) => params.data.maximumSectionCount),
            type: NUMERIC_FILTER,
            getQuickFilterText: excludeFromGlobalFilter,
            crossValidation: {
                minExpression: 1,
            },
        },
        {
            id: 'sectionCount',
            field: 'sectionCount',
            ...editableColumnConfig,
            numeric: true,
            ...numericalCellEditorConfig((params) => params.data.sectionCount),
            type: NUMERIC_FILTER,
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
            ...editableColumnConfig,
            ...enumCellEditorConfig((params) => params.data?.type, Object.values(SHUNT_COMPENSATOR_TYPES)),
        },
        {
            id: 'maxQAtNominalV',
            field: 'maxQAtNominalV',
            ...editableColumnConfig,
            numeric: true,
            ...numericalCellEditorConfig((params) => params.data.maxQAtNominalV),
            type: NUMERIC_FILTER,
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
            valueGetter: (params) =>
                (params?.data?.maxQAtNominalV / params?.data?.maximumSectionCount) * params?.data?.sectionCount,
            type: NUMERIC_FILTER,
            fractionDigits: 1,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'maxSusceptance',
            ...editableColumnConfig,
            field: 'maxSusceptance',
            numeric: true,
            ...numericalCellEditorConfig((params) => params.data.maxSusceptance),
            type: NUMERIC_FILTER,
            fractionDigits: 5,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'SwitchedOnMaxSusceptance',
            field: 'switchedOnSusceptance',
            numeric: true,
            valueGetter: (params) =>
                (params?.data?.maxSusceptance / params?.data?.maximumSectionCount) * params?.data?.sectionCount,
            type: NUMERIC_FILTER,
            fractionDigits: 5,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'voltageSetpoint',
            field: 'targetV',
            numeric: true,
            type: NUMERIC_FILTER,
            fractionDigits: 1,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'connected',
            field: 'terminalConnected',
            boolean: true,
            cellRenderer: BooleanCellRenderer,
            type: TEXT_FILTER,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        genericColumnOfPropertiesEditPopup,
    ],
} as const satisfies ReadonlyDeep<SpreadsheetTabDefinition>;

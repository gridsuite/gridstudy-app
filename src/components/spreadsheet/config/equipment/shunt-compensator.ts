/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { ReadonlyDeep } from 'type-fest';
import type { SpreadsheetTabDefinition } from '../spreadsheet.type';
import { EQUIPMENT_TYPES } from '../../../utils/equipment-types';
import { editableColumnConfig, excludeFromGlobalFilter, typeAndFetchers } from './common-config';
import {
    BOOLEAN_TYPE,
    COUNTRY_TYPE,
    MEDIUM_COLUMN_WIDTH,
    MIN_COLUMN_WIDTH,
    NUMERIC_0_FRACTION_DIGITS_TYPE,
    NUMERIC_1_FRACTION_DIGITS_TYPE,
    NUMERIC_5_FRACTION_DIGITS_TYPE,
    NUMERIC_CAN_BE_INVALIDATED_TYPE,
    NUMERIC_TYPE,
    SHUNT_COMPENSATOR_ENUM_TYPE,
    TEXT_TYPE,
} from '../../utils/constants';
import { SHUNT_COMPENSATOR_TYPES } from '../../../network/constants';
import { genericColumnOfPropertiesEditPopup } from '../common/column-properties';
import { enumCellEditorConfig, numericalCellEditorConfig } from '../common/cell-editors';
import { SortWay } from 'hooks/use-aggrid-sort';

export const SHUNT_COMPENSATOR_TAB_DEF = {
    index: 7,
    name: 'ShuntCompensators',
    ...typeAndFetchers(EQUIPMENT_TYPES.SHUNT_COMPENSATOR),
    columns: [
        {
            id: 'ID',
            field: 'id',
            columnWidth: MEDIUM_COLUMN_WIDTH,
            type: TEXT_TYPE,
            sort: SortWay.ASC,
        },
        {
            id: 'Name',
            field: 'name',
            type: TEXT_TYPE,
            ...editableColumnConfig,
            columnWidth: MIN_COLUMN_WIDTH,
        },
        {
            id: 'VoltageLevelId',
            field: 'voltageLevelId',
            type: TEXT_TYPE,
        },
        {
            id: 'Country',
            field: 'country',
            type: COUNTRY_TYPE,
        },
        {
            id: 'NominalV',
            field: 'nominalVoltage',
            type: NUMERIC_0_FRACTION_DIGITS_TYPE,
        },
        {
            id: 'ReactivePower',
            field: 'q',
            type: [NUMERIC_1_FRACTION_DIGITS_TYPE, NUMERIC_CAN_BE_INVALIDATED_TYPE],
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'maximumSectionCount',
            field: 'maximumSectionCount',
            ...editableColumnConfig,
            ...numericalCellEditorConfig((params) => params.data.maximumSectionCount),
            type: NUMERIC_TYPE,
            getQuickFilterText: excludeFromGlobalFilter,
            crossValidation: {
                minExpression: 1,
            },
        },
        {
            id: 'sectionCount',
            field: 'sectionCount',
            ...editableColumnConfig,
            ...numericalCellEditorConfig((params) => params.data.sectionCount),
            type: NUMERIC_TYPE,
            getQuickFilterText: excludeFromGlobalFilter,
            crossValidation: {
                minExpression: 0,
                maxExpression: 'maximumSectionCount',
            },
        },
        {
            id: 'Type',
            field: 'type',
            type: SHUNT_COMPENSATOR_ENUM_TYPE,
            ...editableColumnConfig,
            ...enumCellEditorConfig((params) => params.data?.type, Object.values(SHUNT_COMPENSATOR_TYPES)),
        },
        {
            id: 'maxQAtNominalV',
            field: 'maxQAtNominalV',
            ...editableColumnConfig,
            ...numericalCellEditorConfig((params) => params.data.maxQAtNominalV),
            type: NUMERIC_1_FRACTION_DIGITS_TYPE,
            getQuickFilterText: excludeFromGlobalFilter,
            crossValidation: {
                minExpression: 0,
            },
        },
        {
            id: 'SwitchedOnMaxQAtNominalV',
            field: 'switchedOnQAtNominalV',
            valueGetter: (params) =>
                (params?.data?.maxQAtNominalV / params?.data?.maximumSectionCount) * params?.data?.sectionCount,
            type: NUMERIC_0_FRACTION_DIGITS_TYPE,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'maxSusceptance',
            ...editableColumnConfig,
            field: 'maxSusceptance',
            ...numericalCellEditorConfig((params) => params.data.maxSusceptance),
            type: NUMERIC_5_FRACTION_DIGITS_TYPE,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'SwitchedOnMaxSusceptance',
            field: 'switchedOnSusceptance',
            valueGetter: (params) =>
                (params?.data?.maxSusceptance / params?.data?.maximumSectionCount) * params?.data?.sectionCount,
            type: NUMERIC_5_FRACTION_DIGITS_TYPE,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'voltageSetpoint',
            field: 'targetV',
            type: NUMERIC_1_FRACTION_DIGITS_TYPE,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'connected',
            field: 'terminalConnected',
            type: BOOLEAN_TYPE,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        genericColumnOfPropertiesEditPopup,
    ],
} as const satisfies ReadonlyDeep<SpreadsheetTabDefinition>;

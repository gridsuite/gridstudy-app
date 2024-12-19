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
    LOAD_ENUM_TYPE,
    MEDIUM_COLUMN_WIDTH,
    NUMERIC_0_FRACTION_DIGITS_TYPE,
    NUMERIC_1_FRACTION_DIGITS_TYPE,
    NUMERIC_CAN_BE_INVALIDATED_TYPE,
    TEXT_TYPE,
} from '../../utils/constants';
import { LOAD_TYPES } from '../../../network/constants';
import { genericColumnOfPropertiesEditPopup } from '../common/column-properties';
import { enumCellEditorConfig, numericalCellEditorConfig } from '../common/cell-editors';
import { SortWay } from 'hooks/use-aggrid-sort';

export const LOAD_TAB_DEF = {
    index: 6,
    name: 'Loads',
    ...typeAndFetchers(EQUIPMENT_TYPES.LOAD),
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
            columnWidth: MEDIUM_COLUMN_WIDTH,
            ...editableColumnConfig,
        },
        {
            id: 'loadType',
            field: 'type',
            type: LOAD_ENUM_TYPE,
            ...editableColumnConfig,
            ...enumCellEditorConfig(
                (params) => params.data?.type,
                [...LOAD_TYPES, { id: 'UNDEFINED', label: 'Undefined' }]
            ),
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
            id: 'activePower',
            field: 'p',
            type: [NUMERIC_1_FRACTION_DIGITS_TYPE, NUMERIC_CAN_BE_INVALIDATED_TYPE],
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'ReactivePower',
            field: 'q',
            type: [NUMERIC_1_FRACTION_DIGITS_TYPE, NUMERIC_CAN_BE_INVALIDATED_TYPE],
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'p0',
            field: 'p0',
            type: NUMERIC_1_FRACTION_DIGITS_TYPE,
            ...editableColumnConfig,
            ...numericalCellEditorConfig((params) => params.data.p0),
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'q0',
            field: 'q0',
            type: NUMERIC_1_FRACTION_DIGITS_TYPE,
            ...editableColumnConfig,
            ...numericalCellEditorConfig((params) => params.data.q0),
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

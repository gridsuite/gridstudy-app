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
import { editableColumnConfig, excludeFromGlobalFilter, getDefaultEnumConfig, typeAndFetchers } from './common-config';
import {
    BOOLEAN_FILTER,
    COUNTRY_FILTER,
    MEDIUM_COLUMN_WIDTH,
    NUMERIC_FILTER,
    TEXT_FILTER,
} from '../../utils/constants';
import { LOAD_TYPES } from '../../../network/constants';
import { genericColumnOfPropertiesEditPopup } from '../common/column-properties';
import { enumCellEditorConfig, numericalCellEditorConfig } from '../common/cell-editors';

export const LOAD_TAB_DEF = {
    index: 6,
    name: 'Loads',
    ...typeAndFetchers(EQUIPMENT_TYPES.LOAD),
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
            columnWidth: MEDIUM_COLUMN_WIDTH,
            ...editableColumnConfig,
        },
        {
            id: 'loadType',
            field: 'type',
            ...getDefaultEnumConfig([...LOAD_TYPES, { id: 'UNDEFINED', label: 'Undefined' }]),
            ...editableColumnConfig,
            ...enumCellEditorConfig(
                (params) => params.data?.type,
                [...LOAD_TYPES, { id: 'UNDEFINED', label: 'Undefined' }]
            ),
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
            type: NUMERIC_FILTER,
            fractionDigits: 0,
        },
        {
            id: 'activePower',
            field: 'p',
            numeric: true,
            type: NUMERIC_FILTER,
            fractionDigits: 1,
            canBeInvalidated: true,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'ReactivePower',
            field: 'q',
            numeric: true,
            type: NUMERIC_FILTER,
            fractionDigits: 1,
            canBeInvalidated: true,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'p0',
            field: 'p0',
            numeric: true,
            type: NUMERIC_FILTER,
            fractionDigits: 1,
            ...editableColumnConfig,
            ...numericalCellEditorConfig((params) => params.data.p0),
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'q0',
            field: 'q0',
            numeric: true,
            type: NUMERIC_FILTER,
            fractionDigits: 1,
            ...editableColumnConfig,
            ...numericalCellEditorConfig((params) => params.data.q0),
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'connected',
            field: 'terminalConnected',
            boolean: true,
            cellRenderer: BooleanCellRenderer,
            type: BOOLEAN_FILTER,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        genericColumnOfPropertiesEditPopup,
    ],
} as const satisfies ReadonlyDeep<SpreadsheetTabDefinition>;

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
import { excludeFromGlobalFilter, typeAndFetchers } from './common-config';
import {
    BOOLEAN_FILTER,
    COUNTRY_FILTER,
    MEDIUM_COLUMN_WIDTH,
    NUMERIC_FILTER,
    TEXT_FILTER,
} from '../../utils/constants';
import { NOMINAL_V } from '../../../utils/field-constants';
import { genericColumnOfProperties } from '../common/column-properties';

export const STATIC_VAR_COMPENSATOR_TAB_DEF = {
    index: 8,
    name: 'StaticVarCompensators',
    ...typeAndFetchers(EQUIPMENT_TYPES.STATIC_VAR_COMPENSATOR),
    columns: [
        {
            id: 'ID',
            field: 'id',
            isDefaultSort: true,
            type: TEXT_FILTER,
        },
        {
            id: 'Name',
            field: 'name',
            type: TEXT_FILTER,
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
            field: NOMINAL_V,
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
            id: 'VoltageSetpointKV',
            field: 'voltageSetpoint',
            numeric: true,
            type: NUMERIC_FILTER,
            fractionDigits: 1,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'ReactivePowerSetpointMVAR',
            field: 'reactivePowerSetpoint',
            numeric: true,
            type: NUMERIC_FILTER,
            fractionDigits: 1,
            columnWidth: MEDIUM_COLUMN_WIDTH,
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
        genericColumnOfProperties,
    ],
} as const satisfies ReadonlyDeep<SpreadsheetTabDefinition>;

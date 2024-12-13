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
import { NOMINAL_V } from '../../../utils/field-constants';
import { genericColumnOfProperties } from '../common/column-properties';
import { BOOLEAN_TYPE, COUNTRY_TYPE, NUMERIC_TYPE, TEXT_TYPE } from 'components/spreadsheet/utils/constants';

export const DANGLING_LINE_TAB_DEF = {
    index: 13,
    name: 'DanglingLines',
    ...typeAndFetchers(EQUIPMENT_TYPES.DANGLING_LINE),
    columns: [
        {
            id: 'ID',
            field: 'id',
            isDefaultSort: true,
            type: TEXT_TYPE,
        },
        {
            id: 'Name',
            field: 'name',
            type: TEXT_TYPE,
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
            field: NOMINAL_V,
            numeric: true,
            type: NUMERIC_TYPE,
            fractionDigits: 0,
        },
        {
            id: 'PairingKey',
            field: 'pairingKey',
            getQuickFilterText: excludeFromGlobalFilter,
            type: TEXT_TYPE,
        },
        {
            id: 'activePower',
            field: 'p',
            numeric: true,
            type: NUMERIC_TYPE,
            fractionDigits: 1,
            canBeInvalidated: true,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'ReactivePower',
            field: 'q',
            numeric: true,
            type: NUMERIC_TYPE,
            fractionDigits: 1,
            canBeInvalidated: true,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'p0',
            field: 'p0',
            numeric: true,
            type: NUMERIC_TYPE,
            fractionDigits: 1,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'q0',
            field: 'q0',
            numeric: true,
            type: NUMERIC_TYPE,
            fractionDigits: 1,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'connected',
            field: 'terminalConnected',
            boolean: true,
            cellRenderer: BooleanCellRenderer,
            type: BOOLEAN_TYPE,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        genericColumnOfProperties,
    ],
} as const satisfies ReadonlyDeep<SpreadsheetTabDefinition>;

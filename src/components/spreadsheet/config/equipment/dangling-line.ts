/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { SpreadsheetTabDefinition } from '../spreadsheet.type';
import { EQUIPMENT_TYPES } from '../../../utils/equipment-types';
import CountryCellRenderer from '../../utils/country-cell-render';
import { BooleanCellRenderer } from '../../utils/cell-renderers';
import {
    countryEnumFilterConfig,
    defaultBooleanFilterConfig,
    defaultNumericFilterConfig,
    defaultTextFilterConfig,
    excludeFromGlobalFilter,
    typeAndFetchers,
} from './common-config';
import { NOMINAL_V } from '../../../utils/field-constants';
import { genericColumnOfProperties } from '../common/column-properties';
import { FilterType } from '../../../custom-aggrid/hooks/use-aggrid-row-filter';

const filterParams = {
    filterType: FilterType.Spreadsheet,
    filterTab: 'DanglingLines',
};

export const DANGLING_LINE_TAB_DEF = {
    index: 13,
    name: 'DanglingLines',
    ...typeAndFetchers(EQUIPMENT_TYPES.DANGLING_LINE),
    columns: [
        {
            id: 'ID',
            field: 'id',
            isDefaultSort: true,
            ...defaultTextFilterConfig(filterParams),
        },
        {
            id: 'Name',
            field: 'name',
            ...defaultTextFilterConfig(filterParams),
        },
        {
            id: 'VoltageLevelId',
            field: 'voltageLevelId',
            ...defaultTextFilterConfig(filterParams),
        },
        {
            id: 'Country',
            field: 'country',
            ...countryEnumFilterConfig(filterParams),
            cellRenderer: CountryCellRenderer,
        },
        {
            id: 'NominalV',
            field: NOMINAL_V,
            numeric: true,
            ...defaultNumericFilterConfig(filterParams),
            fractionDigits: 0,
        },
        {
            id: 'PairingKey',
            field: 'pairingKey',
            getQuickFilterText: excludeFromGlobalFilter,
            ...defaultTextFilterConfig(filterParams),
        },
        {
            id: 'activePower',
            field: 'p',
            numeric: true,
            ...defaultNumericFilterConfig(filterParams),
            fractionDigits: 1,
            canBeInvalidated: true,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'ReactivePower',
            field: 'q',
            numeric: true,
            ...defaultNumericFilterConfig(filterParams),
            fractionDigits: 1,
            canBeInvalidated: true,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'p0',
            field: 'p0',
            numeric: true,
            ...defaultNumericFilterConfig(filterParams),
            fractionDigits: 1,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'q0',
            field: 'q0',
            numeric: true,
            ...defaultNumericFilterConfig(filterParams),
            fractionDigits: 1,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'connected',
            field: 'terminalConnected',
            boolean: true,
            cellRenderer: BooleanCellRenderer,
            ...defaultBooleanFilterConfig(filterParams),
            getQuickFilterText: excludeFromGlobalFilter,
        },
        genericColumnOfProperties,
    ],
} satisfies SpreadsheetTabDefinition;

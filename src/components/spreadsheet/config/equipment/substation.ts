/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { ReadonlyDeep } from 'type-fest';
import type { SpreadsheetTabDefinition } from '../spreadsheet.type';
import { EQUIPMENT_TYPES } from '../../../utils/equipment-types';
import { SelectCountryField } from '../../utils/equipment-table-editors';
import CountryCellRenderer from '../../utils/country-cell-render';
import {
    countryEnumFilterConfig,
    defaultTextFilterConfig,
    editableColumnConfig,
    typeAndFetchers,
} from './common-config';
import { genericColumnOfPropertiesEditPopup } from '../common/column-properties';

export const SUBSTATION_TAB_DEF = {
    index: 0,
    name: 'Substations',
    ...typeAndFetchers(EQUIPMENT_TYPES.SUBSTATION),
    columns: [
        {
            id: 'ID',
            field: 'id',
            ...defaultTextFilterConfig,
            isDefaultSort: true,
        },
        {
            id: 'Name',
            field: 'name',
            ...editableColumnConfig,
            ...defaultTextFilterConfig,
        },
        {
            id: 'Country',
            field: 'country',
            ...editableColumnConfig,
            cellEditor: SelectCountryField,
            cellRenderer: CountryCellRenderer,
            valueSetter: (params) => {
                params.data.country = params?.newValue;
                return true;
            },
            ...countryEnumFilterConfig,
        },
        genericColumnOfPropertiesEditPopup, // FIXME try valueFormatter?
    ],
} as const satisfies ReadonlyDeep<SpreadsheetTabDefinition>;

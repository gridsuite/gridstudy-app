/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { SpreadsheetTabDefinition } from '../spreadsheet.type';
import { EQUIPMENT_TYPES } from '../../../utils/equipment-types';
import { SelectCountryField } from '../../utils/equipment-table-editors';
import CountryCellRenderer from '../../utils/country-cell-render';
import type { ValueSetterParams } from 'ag-grid-community';
import { PropertiesCellRenderer } from '../../utils/cell-renderers';
import { SitePropertiesEditor } from '../../utils/equipement-table-popup-editors';
import {
    countryEnumFilterConfig,
    defaultTextFilterConfig,
    editableColumnConfig,
    excludeFromGlobalFilter,
    propertiesGetter,
    typeAndFetchers,
} from './common-config';

export const SUBSTATION_TAB_DEF: SpreadsheetTabDefinition = {
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
            valueSetter: (params: ValueSetterParams) => {
                params.data.country = params?.newValue;
                return true;
            },
            ...countryEnumFilterConfig,
        },
        {
            id: 'Properties',
            field: 'properties',
            ...editableColumnConfig,
            valueGetter: propertiesGetter, // FIXME try valueFormatter ?
            cellRenderer: PropertiesCellRenderer,
            minWidth: 300,
            getQuickFilterText: excludeFromGlobalFilter,
            valueSetter: (params: ValueSetterParams) => {
                params.data.properties = params.newValue;
                return true;
            },
            cellEditor: SitePropertiesEditor,
            cellEditorPopup: true,
            ...defaultTextFilterConfig,
        },
    ],
};

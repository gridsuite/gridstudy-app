/*
 * Copyright © 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { PropertiesCellRenderer } from '../../utils/cell-renderers';
import { SitePropertiesEditor } from '../../utils/equipement-table-popup-editors';
import type { ValueGetterFunc, ValueSetterParams } from 'ag-grid-community';
import { defaultTextFilterConfig, editableColumnConfig, excludeFromGlobalFilter } from '../equipment/common-config';
import { FilterType } from '../../../../hooks/use-filter-selector';
import { CustomColDef } from '../../../custom-aggrid/custom-aggrid-header.type';

const propertiesGetter: ValueGetterFunc = (params) => {
    const properties = params?.data?.properties;
    if (properties && Object.keys(properties).length) {
        return Object.keys(properties)
            .map((property) => `${property} : ${properties[property]}`)
            .join(' | ');
    } else {
        return null;
    }
};

const filterParams = {
    type: FilterType.Spreadsheet,
    tab: 'properties',
};

//TODO only used in tie-line config, is "valueSetter" forgotten?
export const genericColumnOfPropertiesReadonly = {
    id: 'Properties',
    field: 'properties',
    valueGetter: propertiesGetter,
    cellRenderer: PropertiesCellRenderer,
    minWidth: 300,
    getQuickFilterText: excludeFromGlobalFilter,
    ...defaultTextFilterConfig(filterParams),
};

export const genericColumnOfProperties = {
    ...genericColumnOfPropertiesReadonly,
    valueSetter: (params: ValueSetterParams) => {
        params.data.properties = params.newValue;
        return true;
    },
};

export const genericColumnOfPropertiesEditPopup = {
    ...editableColumnConfig,
    ...genericColumnOfProperties,
    cellEditor: SitePropertiesEditor,
    cellEditorPopup: true,
} satisfies Partial<CustomColDef>;

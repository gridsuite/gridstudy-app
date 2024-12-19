/*
 * Copyright © 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { SitePropertiesEditor } from '../../utils/equipement-table-popup-editors';
import type { ValueSetterParams } from 'ag-grid-community';
import { editableColumnConfig, excludeFromGlobalFilter } from '../equipment/common-config';

//TODO only used in tie-line config, is "valueSetter" forgotten?
export const genericColumnOfPropertiesReadonly = {
    id: 'Properties',
    field: 'properties',
    minWidth: 300,
    getQuickFilterText: excludeFromGlobalFilter,
    type: 'propertyType',
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
};

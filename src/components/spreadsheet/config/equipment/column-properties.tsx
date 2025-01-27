/*
 * Copyright © 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { PropertiesCellRenderer } from '../../utils/cell-renderers';
import type { ValueGetterFunc } from 'ag-grid-community';
import { textColumnDefinition } from '../common-column-definitions';

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

export const genericColumnOfPropertiesReadonly = (tab: string) => {
    return {
        colId: 'Properties',
        field: 'properties', // TODO: useless for AgGrid used only for static/custom columns export
        valueGetter: propertiesGetter,
        ...textColumnDefinition('Properties', tab),
        cellRenderer: PropertiesCellRenderer,
        minWidth: 300,
    };
};

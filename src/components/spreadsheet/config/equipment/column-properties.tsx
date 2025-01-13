/*
 * Copyright © 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { PropertiesCellRenderer } from '../../utils/cell-renderers';
import type { ValueGetterFunc } from 'ag-grid-community';
import { textAgGridColumnDefinition } from '../common-column-definitions';

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

//TODO only used in tie-line config, is "valueSetter" forgotten?
export const genericColumnOfPropertiesReadonly = {
    id: 'Properties',
    valueGetter: propertiesGetter,
    ...textAgGridColumnDefinition,
    cellRenderer: PropertiesCellRenderer,
    minWidth: 300,
};

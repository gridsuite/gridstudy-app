/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { SpreadsheetTabDefinition } from '../spreadsheet.type';
import { EQUIPMENT_TYPES } from '../../../utils/equipment-types';
import { fetchBuses } from '../../../../services/study/network';
import CountryCellRenderer from '../../utils/country-cell-render';
import { ValueSetterParams } from 'ag-grid-community';
import { PropertiesCellRenderer } from '../../utils/cell-renderers';
import {
    countryEnumFilterConfig,
    defaultNumericFilterConfig,
    defaultTextFilterConfig,
    excludeFromGlobalFilter,
    propertiesGetter,
} from './common-config';

export const BUS_TAB_DEF: SpreadsheetTabDefinition = {
    index: 14,
    name: 'Buses',
    type: EQUIPMENT_TYPES.BUS,
    fetchers: [fetchBuses],
    columns: [
        {
            id: 'ID',
            field: 'id',
            isDefaultSort: true,
            ...defaultTextFilterConfig,
        },
        {
            id: 'Magnitude',
            field: 'v',
            numeric: true,
            fractionDigits: 1,
            canBeInvalidated: true,
            ...defaultNumericFilterConfig,
        },
        {
            id: 'Angle',
            field: 'angle',
            numeric: true,
            fractionDigits: 1,
            canBeInvalidated: true,
            ...defaultNumericFilterConfig,
        },
        {
            id: 'ConnectedComponent',
            field: 'connectedComponentNum',
            ...defaultNumericFilterConfig,
        },
        {
            id: 'SynchronousComponent',
            field: 'synchronousComponentNum',
            ...defaultNumericFilterConfig,
        },
        {
            id: 'VoltageLevelId',
            field: 'voltageLevelId',
            ...defaultTextFilterConfig,
        },
        {
            id: 'Country',
            field: 'country',
            ...countryEnumFilterConfig,
            cellRenderer: CountryCellRenderer,
        },
        {
            id: 'NominalV',
            field: 'nominalVoltage',
            numeric: true,
            fractionDigits: 0,
            ...defaultNumericFilterConfig,
        },
        {
            id: 'Properties',
            field: 'properties',
            valueGetter: propertiesGetter,
            cellRenderer: PropertiesCellRenderer,
            minWidth: 300,
            getQuickFilterText: excludeFromGlobalFilter,
            valueSetter: (params: ValueSetterParams) => {
                params.data.properties = params.newValue;
                return true;
            },
            ...defaultTextFilterConfig,
        },
    ],
};

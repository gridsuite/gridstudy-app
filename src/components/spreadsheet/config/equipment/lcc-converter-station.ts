/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { SpreadsheetTabDefinition } from '../spreadsheet.type';
import { EQUIPMENT_TYPES } from '../../../utils/equipment-types';
import { typeAndFetchers } from './common-config';
import { genericColumnOfPropertiesReadonly } from './column-properties';
import { booleanColumnDefinition, numberColumnDefinition, textColumnDefinition } from '../common-column-definitions';

const tab = 'LccConverterStations';

export const LCC_CONVERTER_STATION_TAB_DEF: SpreadsheetTabDefinition = {
    index: 11,
    name: tab,
    ...typeAndFetchers(EQUIPMENT_TYPES.LCC_CONVERTER_STATION),
    columns: [
        {
            field: 'id',
            initialSort: 'asc',
            ...textColumnDefinition('id', 'ID', tab),
        },
        {
            id: 'Name',
            field: 'name',
            ...textColumnDefinition('name', 'Name', tab),
        },
        {
            field: 'voltageLevelId',
            ...textColumnDefinition('voltageLevelId', 'Voltage level ID', tab),
        },
        {
            field: 'country',
            ...textColumnDefinition('country', 'Country', tab),
        },
        {
            field: 'nominalV',
            ...numberColumnDefinition('nominalV', 'Nominal V', tab, 0),
        },
        {
            id: 'HvdcLineId',
            field: 'hvdcLineId',
            ...textColumnDefinition('hvdcLineId', 'HVDC Line ID', tab),
        },
        {
            field: 'p',
            ...numberColumnDefinition('activePower', 'p (MW)', tab, 1),
        },
        {
            field: 'q',
            ...numberColumnDefinition('reactivePower', 'q (MVar)', tab, 1),
        },
        {
            field: 'powerFactor',
            ...numberColumnDefinition('powerFactor', 'Power Factor', tab, 1),
        },
        {
            field: 'lossFactor',
            ...numberColumnDefinition('lossFactor', 'Loss Factor', tab, 1),
        },
        {
            field: 'terminalConnected',
            ...booleanColumnDefinition('connected', 'Connected', tab),
        },
        genericColumnOfPropertiesReadonly(tab),
    ],
};

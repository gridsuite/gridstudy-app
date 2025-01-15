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

const tab = 'ShuntCompensators';

export const SHUNT_COMPENSATOR_TAB_DEF: SpreadsheetTabDefinition = {
    index: 7,
    name: tab,
    ...typeAndFetchers(EQUIPMENT_TYPES.SHUNT_COMPENSATOR),
    columns: [
        {
            field: 'id',
            initialSort: 'asc',
            ...textColumnDefinition('id', 'ID', tab),
        },
        {
            field: 'name',
            ...textColumnDefinition('name', 'Name', tab),
        },
        {
            field: 'voltageLevelId',
            ...textColumnDefinition('voltageLevelId', 'Voltage Level ID', tab),
        },
        {
            field: 'country',
            ...textColumnDefinition('country', 'Country', tab),
        },
        {
            field: 'nominalVoltage',
            ...numberColumnDefinition('nominalVoltage', 'Nominal V', tab, 0),
        },
        {
            field: 'q',
            ...numberColumnDefinition('ReactivePower', 'Reactive Power', tab, 1),
        },
        {
            field: 'maximumSectionCount',
            ...numberColumnDefinition('maximumSectionCount', 'Maximum Section Count', tab),
        },
        {
            field: 'sectionCount',
            ...numberColumnDefinition('sectionCount', 'Section Count', tab),
        },
        {
            field: 'type',
            ...textColumnDefinition('type', 'Type', tab),
        },
        {
            field: 'maxQAtNominalV',
            ...numberColumnDefinition('maxQAtNominalV', 'Max Q at Nominal V', tab, 1),
        },
        {
            valueGetter: (params) =>
                (params?.data?.maxQAtNominalV / params?.data?.maximumSectionCount) * params?.data?.sectionCount,
            ...numberColumnDefinition('SwitchedOnMaxQAtNominalV', 'Switch-on Q at nominal voltage', tab, 1),
        },
        {
            field: 'maxSusceptance',
            ...numberColumnDefinition('maxSusceptance', 'Maximal susceptance available', tab, 5),
        },
        {
            valueGetter: (params) =>
                (params?.data?.maxSusceptance / params?.data?.maximumSectionCount) * params?.data?.sectionCount,
            ...numberColumnDefinition('SwitchedOnMaxSusceptance', 'Switch-on susceptance', tab, 5),
        },
        {
            field: 'targetV',
            ...numberColumnDefinition('targetV', 'Target V (kV)', tab, 1),
        },
        {
            field: 'terminalConnected',
            ...booleanColumnDefinition('terminalConnected', 'Connected', tab),
        },
        genericColumnOfPropertiesReadonly(tab),
    ],
};

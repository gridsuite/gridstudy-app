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
            colId: 'ID',
            field: 'id',
            ...textColumnDefinition('ID', tab),
        },
        {
            colId: 'Name',
            field: 'name',
            ...textColumnDefinition('Name', tab),
        },
        {
            colId: 'VoltageLevelId',
            field: 'voltageLevelId',
            ...textColumnDefinition('Voltage level ID', tab),
        },
        {
            colId: 'Country',
            field: 'country',
            ...textColumnDefinition('Country', tab),
        },
        {
            colId: 'NominalV',
            field: 'nominalVoltage',
            ...numberColumnDefinition('Nominal V', tab, 0),
        },
        {
            colId: 'ReactivePower',
            field: 'q',
            ...numberColumnDefinition('q (MVar)', tab, 1),
        },
        {
            colId: 'maximumSectionCount',
            field: 'maximumSectionCount',
            ...numberColumnDefinition('Maximum number of sections', tab),
        },
        {
            colId: 'sectionCount',
            field: 'sectionCount',
            ...numberColumnDefinition('Current number of sections', tab),
        },
        {
            colId: 'Type',
            field: 'type',
            ...textColumnDefinition('Type', tab),
        },
        {
            colId: 'maxQAtNominalV',
            field: 'maxQAtNominalV',
            ...numberColumnDefinition('Qmax available at nominal voltage', tab, 1),
        },
        {
            colId: 'SwitchedOnMaxQAtNominalV',
            valueGetter: (params) =>
                (params?.data?.maxQAtNominalV / params?.data?.maximumSectionCount) * params?.data?.sectionCount,
            ...numberColumnDefinition('Switch-on Q at nominal voltage', tab, 1),
        },
        {
            colId: 'maxSusceptance',
            field: 'maxSusceptance',
            ...numberColumnDefinition('Maximal susceptance available', tab, 5),
        },
        {
            colId: 'SwitchedOnMaxSusceptance',
            valueGetter: (params) =>
                (params?.data?.maxSusceptance / params?.data?.maximumSectionCount) * params?.data?.sectionCount,
            ...numberColumnDefinition('Switch-on susceptance', tab, 5),
        },
        {
            colId: 'voltageSetpoint',
            field: 'targetV',
            ...numberColumnDefinition('Target V (kV)', tab, 1),
        },
        {
            colId: 'connected',
            field: 'terminalConnected',
            ...booleanColumnDefinition('Connected', tab),
        },
        genericColumnOfPropertiesReadonly(tab),
    ],
};

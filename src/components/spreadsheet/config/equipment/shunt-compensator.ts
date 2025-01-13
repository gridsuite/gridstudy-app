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
import {
    booleanAgGridColumnDefinition,
    textAgGridColumnDefinition,
    numberAgGridColumnDefinition,
} from '../common-column-definitions';

export const SHUNT_COMPENSATOR_TAB_DEF: SpreadsheetTabDefinition = {
    index: 7,
    name: 'ShuntCompensators',
    ...typeAndFetchers(EQUIPMENT_TYPES.SHUNT_COMPENSATOR),
    columns: [
        {
            id: 'ID',
            field: 'id',
            initialSort: 'asc',
            ...textAgGridColumnDefinition,
        },
        {
            id: 'Name',
            field: 'name',
            ...textAgGridColumnDefinition,
        },
        {
            id: 'VoltageLevelId',
            field: 'voltageLevelId',
            ...textAgGridColumnDefinition,
        },
        {
            id: 'Country',
            field: 'country',
            ...textAgGridColumnDefinition,
        },
        {
            id: 'NominalV',
            field: 'nominalVoltage',
            ...numberAgGridColumnDefinition(0),
        },
        {
            id: 'ReactivePower',
            field: 'q',
            ...numberAgGridColumnDefinition(1),
        },
        {
            id: 'maximumSectionCount',
            field: 'maximumSectionCount',
            ...numberAgGridColumnDefinition(),
        },
        {
            id: 'sectionCount',
            field: 'sectionCount',
            ...numberAgGridColumnDefinition(),
        },
        {
            id: 'Type',
            field: 'type',
            ...textAgGridColumnDefinition,
        },
        {
            id: 'maxQAtNominalV',
            field: 'maxQAtNominalV',
            ...numberAgGridColumnDefinition(1),
        },
        {
            id: 'SwitchedOnMaxQAtNominalV',
            valueGetter: (params) =>
                (params?.data?.maxQAtNominalV / params?.data?.maximumSectionCount) * params?.data?.sectionCount,
            ...numberAgGridColumnDefinition(1),
        },
        {
            id: 'maxSusceptance',
            field: 'maxSusceptance',
            ...numberAgGridColumnDefinition(5),
        },
        {
            id: 'SwitchedOnMaxSusceptance',
            valueGetter: (params) =>
                (params?.data?.maxSusceptance / params?.data?.maximumSectionCount) * params?.data?.sectionCount,
            ...numberAgGridColumnDefinition(5),
        },
        {
            id: 'voltageSetpoint',
            field: 'targetV',
            ...numberAgGridColumnDefinition(1),
        },
        {
            id: 'connected',
            field: 'terminalConnected',
            ...booleanAgGridColumnDefinition,
        },
        genericColumnOfPropertiesReadonly,
    ],
};

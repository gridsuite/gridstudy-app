/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { SpreadsheetTabDefinition } from '../spreadsheet.type';
import { EQUIPMENT_TYPES } from '../../../utils/equipment-types';
import { typeAndFetchers } from './common-config';
import { COLUMN_TYPES } from 'components/custom-aggrid/custom-aggrid-header.type';

const tab = 'ShuntCompensators';

export const SHUNT_COMPENSATOR_TAB_DEF: SpreadsheetTabDefinition = {
    index: 7,
    name: tab,
    ...typeAndFetchers(EQUIPMENT_TYPES.SHUNT_COMPENSATOR),
    columns: [
        {
            id: 'id',
            name: 'ID',
            type: COLUMN_TYPES.TEXT,
            formula: 'id',
            dependencies: [],
        },
        {
            id: 'name',
            name: 'Name',
            type: COLUMN_TYPES.TEXT,
            formula: 'name',
            dependencies: [],
        },
        {
            id: 'type',
            name: 'Type',
            type: COLUMN_TYPES.ENUM,
            formula: 'type',
            dependencies: [],
        },
        {
            id: 'country',
            name: 'Country',
            type: COLUMN_TYPES.ENUM,
            formula: 'country',
            dependencies: [],
        },
        {
            id: 'voltageLevelId',
            name: 'Voltage level ID',
            type: COLUMN_TYPES.TEXT,
            formula: 'voltageLevelId',
            dependencies: [],
        },
        {
            id: 'nominalVoltage',
            name: 'Nominal V',
            type: COLUMN_TYPES.NUMBER,
            formula: 'nominalVoltage',
            precision: 0,
            dependencies: [],
        },
        {
            id: 'terminalConnected',
            name: 'Connected',
            type: COLUMN_TYPES.BOOLEAN,
            formula: 'terminalConnected',
            dependencies: [],
        },
        {
            id: 'q',
            name: 'q (MVar)',
            type: COLUMN_TYPES.NUMBER,
            formula: 'q',
            precision: 1,
            dependencies: [],
        },
        {
            id: 'maximumSectionCount',
            name: 'Maximum number of sections',
            type: COLUMN_TYPES.NUMBER,
            formula: 'maximumSectionCount',
            dependencies: [],
        },
        {
            id: 'sectionCount',
            name: 'Current number of sections',
            type: COLUMN_TYPES.NUMBER,
            formula: 'sectionCount',
            dependencies: [],
        },
        {
            id: 'maxQAtNominalV',
            name: 'Qmax available at nominal voltage',
            type: COLUMN_TYPES.NUMBER,
            formula: 'maxQAtNominalV',
            precision: 1,
            dependencies: [],
        },
        {
            id: 'switchedOnQAtNominalV',
            name: 'Switch-on Q at nominal voltage',
            type: COLUMN_TYPES.NUMBER,
            formula: '(maxQAtNominalV / maximumSectionCount) * sectionCount',
            precision: 1,
            dependencies: [],
        },
        {
            id: 'maxSusceptance',
            name: 'Maximal susceptance available',
            type: COLUMN_TYPES.NUMBER,
            formula: 'maxSusceptance',
            precision: 5,
            dependencies: [],
        },
        {
            id: 'switchedOnSusceptance',
            name: 'Switch-on susceptance',
            type: COLUMN_TYPES.NUMBER,
            formula: '(maxSusceptance / maximumSectionCount) * sectionCount',
            precision: 5,
            dependencies: [],
        },
        {
            id: 'targetV',
            name: 'Target V (kV)',
            type: COLUMN_TYPES.NUMBER,
            formula: 'targetV',
            precision: 1,
            dependencies: [],
        },
    ],
};

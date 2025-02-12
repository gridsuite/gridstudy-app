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

const tab = 'VoltageLevels';

export const VOLTAGE_LEVEL_TAB_DEF: SpreadsheetTabDefinition = {
    index: 1,
    name: tab,
    ...typeAndFetchers(EQUIPMENT_TYPES.VOLTAGE_LEVEL),
    columns: [
        {
            id: 'ID',
            name: 'ID',
            type: COLUMN_TYPES.TEXT,
            formula: 'id',
            dependencies: [],
        },
        {
            id: 'Name',
            name: 'Name',
            type: COLUMN_TYPES.TEXT,
            formula: 'name',
            dependencies: [],
        },
        {
            id: 'SubstationId',
            name: 'Substation ID',
            type: COLUMN_TYPES.TEXT,
            formula: 'substationId',
            dependencies: [],
        },
        {
            id: 'Country',
            name: 'Country',
            type: COLUMN_TYPES.ENUM,
            formula: 'country',
            dependencies: [],
        },
        {
            id: 'NominalV',
            name: 'Nominal V',
            type: COLUMN_TYPES.NUMBER,
            formula: 'nominalV',
            precision: 0,
            dependencies: [],
        },
        {
            id: 'LowVoltageLimit',
            name: 'Low voltage limit (kV)',
            type: COLUMN_TYPES.NUMBER,
            formula: 'lowVoltageLimit',
            precision: 1,
            dependencies: [],
        },
        {
            id: 'HighVoltageLimit',
            name: 'High voltage limit (kV)',
            type: COLUMN_TYPES.NUMBER,
            formula: 'highVoltageLimit',
            precision: 1,
            dependencies: [],
        },
        {
            id: 'IpMin',
            name: 'ISC min (kA)',
            type: COLUMN_TYPES.NUMBER,
            formula: 'unitToKiloUnit(identifiableShortCircuit.ipMin)',
            precision: 1,
            dependencies: [],
        },
        {
            id: 'IpMax',
            name: 'ISC max (kA)',
            type: COLUMN_TYPES.NUMBER,
            formula: 'unitToKiloUnit(identifiableShortCircuit.ipMax)',
            precision: 1,
            dependencies: [],
        },
    ],
};

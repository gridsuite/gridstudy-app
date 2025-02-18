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

const tab = 'Generators';

export const GENERATOR_TAB_DEF: SpreadsheetTabDefinition = {
    index: 5,
    name: tab,
    ...typeAndFetchers(EQUIPMENT_TYPES.GENERATOR),
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
            id: 'energySource',
            name: 'Energy Source',
            type: COLUMN_TYPES.ENUM,
            formula: 'energySource',
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
            id: 'p',
            name: 'p (MW)',
            type: COLUMN_TYPES.NUMBER,
            formula: 'p',
            precision: 1,
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
            id: 'minP',
            name: 'Min P (MW)',
            type: COLUMN_TYPES.NUMBER,
            formula: 'minP',
            precision: 1,
            dependencies: [],
        },
        {
            id: 'maxP',
            name: 'Max P (MW)',
            type: COLUMN_TYPES.NUMBER,
            formula: 'maxP',
            precision: 1,
            dependencies: [],
        },
        {
            id: 'targetP',
            name: 'Target P (MW)',
            type: COLUMN_TYPES.NUMBER,
            formula: 'targetP',
            precision: 1,
            dependencies: [],
        },
        {
            id: 'voltageRegulatorOn',
            name: 'Voltage regulation',
            type: COLUMN_TYPES.BOOLEAN,
            formula: 'voltageRegulatorOn',
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
        {
            id: 'targetQ',
            name: 'Target Q (MVar)',
            type: COLUMN_TYPES.NUMBER,
            formula: 'targetQ',
            precision: 1,
            dependencies: [],
        },
        {
            id: 'regulationTypeText',
            name: 'Regulation type',
            type: COLUMN_TYPES.ENUM,
            formula: 'RegulationTypeText',
            dependencies: [],
        },
        {
            id: 'regulatingTerminalConnectableId',
            name: 'Regulated terminal',
            type: COLUMN_TYPES.TEXT,
            formula: 'regulatingTerminalConnectableId',
            dependencies: [],
        },
        {
            id: 'activePowerControl.participate',
            name: 'Active power control',
            type: COLUMN_TYPES.BOOLEAN,
            formula: 'activePowerControl.participate',
            dependencies: [],
        },
        {
            id: 'activePowerControl.droop',
            name: 'Active power regulation droop',
            type: COLUMN_TYPES.NUMBER,
            formula: 'activePowerControl.droop',
            precision: 1,
            dependencies: [],
        },
        {
            id: 'coordinatedReactiveControl.qPercent',
            name: 'Reactive percentage',
            type: COLUMN_TYPES.NUMBER,
            formula: 'coordinatedReactiveControl.qPercent',
            precision: 1,
            dependencies: [],
        },
        {
            id: 'generatorShortCircuit.directTransX',
            name: 'Transient reactance (Ω)',
            type: COLUMN_TYPES.NUMBER,
            formula: 'generatorShortCircuit.directTransX',
            precision: 1,
            dependencies: [],
        },
        {
            id: 'generatorShortCircuit.stepUpTransformerX',
            name: 'Transformer reactance (Ω)',
            type: COLUMN_TYPES.NUMBER,
            formula: 'generatorShortCircuit.stepUpTransformerX',
            precision: 1,
            dependencies: [],
        },
        {
            id: 'generatorStartup.plannedActivePowerSetPoint',
            name: 'Planning P (MW)',
            type: COLUMN_TYPES.NUMBER,
            formula: 'generatorStartup.plannedActivePowerSetPoint',
            precision: 1,
            dependencies: [],
        },
        {
            id: 'generatorStartup.marginalCost',
            name: 'Startup Cost',
            type: COLUMN_TYPES.NUMBER,
            formula: 'generatorStartup.marginalCost',
            precision: 1,
            dependencies: [],
        },
        {
            id: 'generatorStartup.plannedOutageRate',
            name: 'Planning outage rate',
            type: COLUMN_TYPES.NUMBER,
            formula: 'generatorStartup.plannedOutageRate',
            precision: 2,
            dependencies: [],
        },
        {
            id: 'generatorStartup.forcedOutageRate',
            name: 'Forced outage rate',
            type: COLUMN_TYPES.NUMBER,
            formula: 'generatorStartup.forcedOutageRate',
            precision: 2,
            dependencies: [],
        },
    ],
};

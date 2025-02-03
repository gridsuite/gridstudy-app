/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { SpreadsheetTabDefinition } from '../spreadsheet.type';
import { EQUIPMENT_TYPES } from '../../../utils/equipment-types';
import type { ValueGetterFunc } from 'ag-grid-community';
import { typeAndFetchers } from './common-config';
import { genericColumnOfPropertiesReadonly } from './column-properties';
import {
    booleanColumnDefinition,
    enumColumnDefinition,
    numberColumnDefinition,
    textColumnDefinition,
} from '../common-column-definitions';

const RegulatingTerminalCellGetter: ValueGetterFunc = (params) => {
    const { regulatingTerminalConnectableId, regulatingTerminalVlId, regulatingTerminalConnectableType } =
        params?.data || {};

    if (
        regulatingTerminalVlId &&
        regulatingTerminalConnectableId &&
        regulatingTerminalConnectableType.trim() !== '' &&
        regulatingTerminalConnectableId.trim() !== ''
    ) {
        return `${regulatingTerminalConnectableType} (${regulatingTerminalConnectableId})`;
    }

    return null;
};

const tab = 'Generators';

export const GENERATOR_TAB_DEF: SpreadsheetTabDefinition = {
    index: 5,
    name: tab,
    ...typeAndFetchers(EQUIPMENT_TYPES.GENERATOR),
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
            ...enumColumnDefinition('Country', tab),
        },
        {
            colId: 'NominalV',
            field: 'nominalVoltage',
            ...numberColumnDefinition('Nominal V', tab, 0),
        },
        {
            colId: 'energySource',
            field: 'energySource',
            ...enumColumnDefinition('Energy Source', tab),
        },
        {
            colId: 'activePower',
            field: 'p',
            ...numberColumnDefinition('p (MW)', tab, 1),
        },
        {
            colId: 'ReactivePower',
            field: 'q',
            ...numberColumnDefinition('q (MVar)', tab, 1),
        },
        {
            colId: 'ActivePowerControl',
            field: 'activePowerControl.participate',
            ...booleanColumnDefinition('Active power control', tab),
        },
        {
            colId: 'ActivePowerRegulationDroop',
            field: 'activePowerControl.droop',
            ...numberColumnDefinition('Active power regulation droop', tab, 1),
        },
        {
            colId: 'minP',
            field: 'minP',
            ...numberColumnDefinition('Min P (MW)', tab, 1),
        },
        {
            colId: 'maxP',
            field: 'maxP',
            ...numberColumnDefinition('Max P (MW)', tab, 1),
        },
        {
            colId: 'activePowerSetpoint',
            field: 'targetP',
            ...numberColumnDefinition('Target P (MW)', tab, 1),
        },
        {
            colId: 'reactivePowerSetpoint',
            field: 'targetQ',
            ...numberColumnDefinition('Target Q (MVar)', tab, 1),
        },
        {
            colId: 'voltageRegulationOn',
            field: 'voltageRegulatorOn',
            ...booleanColumnDefinition('Voltage regulation', tab),
        },
        {
            colId: 'voltageSetpoint',
            field: 'targetV',
            ...numberColumnDefinition('Target V (kV)', tab, 1),
        },
        {
            colId: 'ReactivePercentageVoltageRegulation',
            field: 'coordinatedReactiveControl.qPercent', // TODO: useless for AgGrid used only for static/custom columns export
            valueGetter: (params) => {
                const qPercent = params.data?.coordinatedReactiveControl?.qPercent;
                return isNaN(qPercent) ? 0 : qPercent;
            },
            ...numberColumnDefinition('Reactive percentage', tab, 1),
        },
        {
            colId: 'directTransX',
            field: 'generatorShortCircuit.directTransX',
            ...numberColumnDefinition('Transient reactance (Ω)', tab, 1),
        },
        {
            colId: 'stepUpTransformerX',
            field: 'generatorShortCircuit.stepUpTransformerX',
            ...numberColumnDefinition('Transformer reactance (Ω)', tab, 1),
        },
        {
            colId: 'plannedActivePowerSetPoint',
            field: 'generatorStartup.plannedActivePowerSetPoint',
            ...numberColumnDefinition('Planning P (MW)', tab, 1),
        },
        {
            colId: 'marginalCost',
            field: 'generatorStartup.marginalCost',
            ...numberColumnDefinition('Startup Cost', tab, 1),
        },
        {
            colId: 'plannedOutageRate',
            field: 'generatorStartup.plannedOutageRate',
            ...numberColumnDefinition('Planning outage rate', tab, 2),
        },
        {
            colId: 'forcedOutageRate',
            field: 'generatorStartup.forcedOutageRate',
            ...numberColumnDefinition('Forced outage rate', tab, 2),
        },
        {
            colId: 'connected',
            field: 'terminalConnected',
            ...booleanColumnDefinition('Connected', tab),
        },
        {
            colId: 'RegulationTypeText',
            field: 'RegulationTypeText',
            ...enumColumnDefinition('Regulation type', tab),
        },
        {
            colId: 'RegulatingTerminalGenerator',
            field: 'regulatingTerminalConnectableId', // TODO: useless for AgGrid used only for static/custom columns export
            valueGetter: RegulatingTerminalCellGetter,
            ...textColumnDefinition('Regulated terminal', tab),
        },
        genericColumnOfPropertiesReadonly(tab),
    ],
};

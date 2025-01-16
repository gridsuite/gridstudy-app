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
import { booleanColumnDefinition, numberColumnDefinition, textColumnDefinition } from '../common-column-definitions';

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
            ...textColumnDefinition('voltageLevelId', 'Voltage level ID', tab),
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
            field: 'energySource',
            ...textColumnDefinition('energySource', 'Energy Source', tab),
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
            valueGetter: (params) => params.data?.activePowerControl?.participate?.toString(),
            ...booleanColumnDefinition('activePowerControl', 'Active power control', tab),
        },
        {
            field: 'activePowerControl.droop',
            ...numberColumnDefinition('activePowerRegulationDroop', 'Active power regulation droop', tab, 1),
        },
        {
            field: 'minP',
            ...numberColumnDefinition('minP', 'Min P (MW)', tab, 1),
        },
        {
            field: 'maxP',
            ...numberColumnDefinition('maxP', 'Max P (MW)', tab, 1),
        },
        {
            field: 'targetP',
            ...numberColumnDefinition('targetP', 'Target P (MW)', tab, 1),
        },
        {
            field: 'targetQ',
            ...numberColumnDefinition('targetQ', 'Target Q (MVar)', tab, 1),
        },
        {
            valueGetter: (params) => params.data?.voltageRegulatorOn?.toString(),
            ...booleanColumnDefinition('voltageRegulatorOn', 'Voltage regulation', tab),
        },
        {
            field: 'targetV',
            ...numberColumnDefinition('targetV', 'Target V (kV)', tab, 1),
        },
        {
            valueGetter: (params) => {
                const qPercent = params.data?.coordinatedReactiveControl?.qPercent;
                return isNaN(qPercent) ? 0 : qPercent;
            },
            ...numberColumnDefinition('ReactivePercentageVoltageRegulation', 'Reactive percentage', tab, 1),
        },
        {
            field: 'generatorShortCircuit.directTransX',
            ...numberColumnDefinition('directTransX', 'Transient reactance (Ω)', tab, 1),
        },
        {
            field: 'generatorShortCircuit.stepUpTransformerX',
            ...numberColumnDefinition('stepUpTransformerX', 'Transformer reactance (Ω)', tab, 1),
        },
        {
            field: 'generatorStartup.plannedActivePowerSetPoint',
            ...numberColumnDefinition('plannedActivePowerSetPoint', 'Planning P (MW)', tab, 1),
        },
        {
            field: 'generatorStartup.marginalCost',
            ...numberColumnDefinition('marginalCost', 'Startup Cost', tab, 1),
        },
        {
            field: 'generatorStartup.plannedOutageRate',
            ...numberColumnDefinition('plannedOutageRate', 'Planning outage rate', tab, 2),
        },
        {
            field: 'generatorStartup.forcedOutageRate',
            ...numberColumnDefinition('forcedOutageRate', 'Forced outage rate', tab, 2),
        },
        {
            valueGetter: (params) => params.data?.terminalConnected?.toString(),
            ...booleanColumnDefinition('terminalConnected', 'Connected', tab),
        },
        {
            field: 'RegulationTypeText',
            ...textColumnDefinition('RegulationTypeText', 'Regulation type', tab),
        },
        {
            valueGetter: RegulatingTerminalCellGetter,
            ...textColumnDefinition('RegulatingTerminalGenerator', 'Regulated terminal', tab),
        },
        genericColumnOfPropertiesReadonly(tab),
    ],
};

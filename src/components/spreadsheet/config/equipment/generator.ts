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

export const GENERATOR_TAB_DEF: SpreadsheetTabDefinition = {
    index: 5,
    name: 'Generators',
    ...typeAndFetchers(EQUIPMENT_TYPES.GENERATOR),
    columns: [
        {
            id: 'ID',
            field: 'id',
            initialSort: 'asc',
            ...textColumnDefinition('id', 'ID', 'Generators'),
        },
        {
            id: 'Name',
            field: 'name',
            ...textColumnDefinition('name', 'Name', 'Generators'),
        },
        {
            id: 'VoltageLevelId',
            field: 'voltageLevelId',
            ...textColumnDefinition('voltageLevelId', 'VoltageLevelId', 'Generators'),
        },
        {
            id: 'Country',
            field: 'country',
            ...textColumnDefinition('country', 'Country', 'Generators'),
        },
        {
            id: 'NominalV',
            field: 'nominalVoltage',
            ...numberColumnDefinition('nominalVoltage', 'NominalV', 'Generators', 0),
        },
        {
            id: 'energySource',
            field: 'energySource',
            ...textColumnDefinition('energySource', 'energySource', 'Generators'),
        },
        {
            id: 'activePower',
            field: 'p',
            ...numberColumnDefinition('p', 'activePower', 'Generators', 1),
        },
        {
            id: 'ReactivePower',
            field: 'q',
            ...numberColumnDefinition('q', 'ReactivePower', 'Generators', 1),
        },
        {
            id: 'ActivePowerControl',
            valueGetter: (params) => params.data?.activePowerControl?.participate?.toString(),
            ...booleanColumnDefinition('ActivePowerControl', 'ActivePowerControl', 'Generators'),
        },
        {
            id: 'ActivePowerRegulationDroop',
            field: 'activePowerControl.droop',
            ...numberColumnDefinition('activePowerControl.droop', 'ActivePowerRegulationDroop', 'Generators', 1),
        },
        {
            id: 'minP',
            field: 'minP',
            ...numberColumnDefinition('minP', 'minP', 'Generators', 1),
        },
        {
            id: 'maxP',
            field: 'maxP',
            ...numberColumnDefinition('maxP', 'maxP', 'Generators', 1),
        },
        {
            id: 'activePowerSetpoint',
            field: 'targetP',
            ...numberColumnDefinition('targetP', 'activePowerSetpoint', 'Generators', 1),
        },
        {
            id: 'reactivePowerSetpoint',
            field: 'targetQ',
            ...numberColumnDefinition('targetQ', 'reactivePowerSetpoint', 'Generators', 1),
        },
        {
            id: 'voltageRegulationOn',
            valueGetter: (params) => params.data?.voltageRegulatorOn?.toString(),
            ...booleanColumnDefinition('voltageRegulatorOn', 'voltageRegulationOn', 'Generators'),
        },
        {
            id: 'voltageSetpoint',
            field: 'targetV',
            ...numberColumnDefinition('targetV', 'voltageSetpoint', 'Generators', 1),
        },
        {
            id: 'ReactivePercentageVoltageRegulation',
            valueGetter: (params) => {
                const qPercent = params.data?.coordinatedReactiveControl?.qPercent;
                return isNaN(qPercent) ? 0 : qPercent;
            },
            ...numberColumnDefinition(
                'ReactivePercentageVoltageRegulation',
                'ReactivePercentageVoltageRegulation',
                'Generators',
                1
            ),
        },
        {
            id: 'directTransX',
            field: 'generatorShortCircuit.directTransX',
            ...numberColumnDefinition('generatorShortCircuit.directTransX', 'directTransX', 'Generators', 1),
        },
        {
            id: 'stepUpTransformerX',
            field: 'generatorShortCircuit.stepUpTransformerX',
            ...numberColumnDefinition(
                'generatorShortCircuit.stepUpTransformerX',
                'stepUpTransformerX',
                'Generators',
                1
            ),
        },
        {
            id: 'plannedActivePowerSetPoint',
            field: 'generatorStartup.plannedActivePowerSetPoint',
            ...numberColumnDefinition(
                'generatorStartup.plannedActivePowerSetPoint',
                'plannedActivePowerSetPoint',
                'Generators',
                1
            ),
        },
        {
            id: 'marginalCost',
            field: 'generatorStartup.marginalCost',
            ...numberColumnDefinition('generatorStartup.marginalCost', 'marginalCost', 'Generators', 1),
        },
        {
            id: 'plannedOutageRate',
            field: 'generatorStartup.plannedOutageRate',
            ...numberColumnDefinition('generatorStartup.plannedOutageRate', 'plannedOutageRate', 'Generators', 2),
        },
        {
            id: 'forcedOutageRate',
            field: 'generatorStartup.forcedOutageRate',
            ...numberColumnDefinition('generatorStartup.forcedOutageRate', 'forcedOutageRate', 'Generators', 2),
        },
        {
            id: 'connected',
            valueGetter: (params) => params.data?.terminalConnected?.toString(),
            ...booleanColumnDefinition('terminalConnected', 'connected', 'Generators'),
        },
        {
            id: 'RegulationTypeText',
            field: 'RegulationTypeText',
            ...textColumnDefinition('RegulationTypeText', 'RegulationTypeText', 'Generators'),
        },
        {
            id: 'RegulatingTerminalGenerator',
            valueGetter: RegulatingTerminalCellGetter,
            ...textColumnDefinition('RegulatingTerminalGenerator', 'RegulatingTerminalGenerator', 'Generators'),
        },
        genericColumnOfPropertiesReadonly,
    ],
};

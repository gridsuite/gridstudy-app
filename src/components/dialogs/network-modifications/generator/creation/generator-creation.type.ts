/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    ACTIVE_POWER_SET_POINT,
    ADDITIONAL_PROPERTIES,
    BUS_OR_BUSBAR_SECTION,
    CONNECTED,
    CONNECTION_DIRECTION,
    CONNECTION_NAME,
    CONNECTION_POSITION,
    CONNECTIVITY,
    DROOP,
    ENERGY_SOURCE,
    EQUIPMENT,
    EQUIPMENT_ID,
    EQUIPMENT_NAME,
    FORCED_OUTAGE_RATE,
    FREQUENCY_REGULATION,
    ID,
    MARGINAL_COST,
    MAX_Q,
    MAXIMUM_ACTIVE_POWER,
    MAXIMUM_REACTIVE_POWER,
    MIN_Q,
    MINIMUM_ACTIVE_POWER,
    MINIMUM_REACTIVE_POWER,
    NAME,
    NOMINAL_VOLTAGE,
    P,
    PLANNED_ACTIVE_POWER_SET_POINT,
    PLANNED_OUTAGE_RATE,
    Q_PERCENT,
    RATED_NOMINAL_POWER,
    REACTIVE_CAPABILITY_CURVE_CHOICE,
    REACTIVE_CAPABILITY_CURVE_TABLE,
    REACTIVE_LIMITS,
    REACTIVE_POWER_SET_POINT,
    SUBSTATION_ID,
    TOPOLOGY_KIND,
    TRANSFORMER_REACTANCE,
    TRANSIENT_REACTANCE,
    TYPE,
    VOLTAGE_LEVEL,
    VOLTAGE_REGULATION,
    VOLTAGE_REGULATION_TYPE,
    VOLTAGE_SET_POINT,
} from '../../../../utils/field-constants';
import { Property } from '../../common/properties/property-utils';
import { EquipmentType } from '@gridsuite/commons-ui';

export type GeneratorCreationSchemaForm = {
    [EQUIPMENT_ID]: string;
    [EQUIPMENT_NAME]?: string;
    [ENERGY_SOURCE]: string | null;
    [MAXIMUM_ACTIVE_POWER]: number | null;
    [MINIMUM_ACTIVE_POWER]: number | null;
    [RATED_NOMINAL_POWER]?: number;
    [TRANSFORMER_REACTANCE]?: number;
    [TRANSIENT_REACTANCE]?: number | null;
    [PLANNED_ACTIVE_POWER_SET_POINT]?: number | null;
    [MARGINAL_COST]?: number | null;
    [PLANNED_OUTAGE_RATE]?: number | null;
    [FORCED_OUTAGE_RATE]?: number | null;

    [CONNECTIVITY]: {
        [VOLTAGE_LEVEL]: { [ID]?: string };
        [BUS_OR_BUSBAR_SECTION]: { [ID]?: string; [NAME]?: string };
        [CONNECTION_DIRECTION]?: string;
        [CONNECTION_NAME]?: string;
        [CONNECTION_POSITION]?: number;
        [CONNECTED]?: boolean;
    };

    [VOLTAGE_REGULATION]?: boolean | null;
    [ACTIVE_POWER_SET_POINT]?: number;
    [REACTIVE_POWER_SET_POINT]?: number | null;
    [VOLTAGE_REGULATION_TYPE]?: string | null;
    [VOLTAGE_SET_POINT]?: number | null;
    [Q_PERCENT]?: number | null;

    [VOLTAGE_LEVEL]?: {
        [ID]?: string;
        [NAME]?: string;
        [SUBSTATION_ID]?: string;
        [NOMINAL_VOLTAGE]?: string;
        [TOPOLOGY_KIND]?: string | null;
    };

    [EQUIPMENT]?: {
        [ID]?: string;
        [NAME]?: string | null;
        [TYPE]?: string;
    };
    [FREQUENCY_REGULATION]?: boolean | null;
    [DROOP]?: number | null;
    [REACTIVE_LIMITS]: {
        [MINIMUM_REACTIVE_POWER]?: number | null;
        [MAXIMUM_REACTIVE_POWER]?: number | null;
        [REACTIVE_CAPABILITY_CURVE_CHOICE]: string | null;
        [REACTIVE_CAPABILITY_CURVE_TABLE]?: ReactiveCapabilityCurveTable[];
    };
    // Properties
    [ADDITIONAL_PROPERTIES]?: Property[];
};

export type ReactiveCapabilityCurveTable = {
    [P]: number;
    [MAX_Q]: number;
    [MIN_Q]: number;
};

export interface GeneratorCreationInfos {
    uuid: string;
    equipmentType: EquipmentType;
    equipmentId: string;
    equipmentName: string;
    energySource: string;
    maxP: number;
    minP: number;
    ratedS: number;
    targetP: number;
    voltageRegulationOn: boolean;
    targetV: number;
    targetQ: number;
    plannedActivePowerSetPoint: number;
    marginalCost: number;
    plannedOutageRate: number;
    forcedOutageRate: number;
    participate: boolean;
    droop: number;
    directTransX: number;
    stepUpTransformerX: number;
    qPercent: number;
    reactiveCapabilityCurve: boolean;
    minQ: number;
    maxQ: number;
    reactiveCapabilityCurvePoints: [];
    regulatingTerminalId: string;
    regulatingTerminalType: string;
    regulatingTerminalVlId: string;
    voltageLevelId: string;
    busOrBusbarSectionId: string;
    busbarSectionName?: string;
    connectionDirection: string | null;
    connectionName?: string | null;
    connectionPosition?: string | null;
    terminalConnected?: boolean | null;
    properties?: Property[];
}

interface ConnectablePositionFormInfos {
    connectionDirection: string | null;
    connectionName?: string | null;
    connectionPosition?: string | null;
}

interface GeneratorStartUpFormInfos {
    plannedActivePowerSetPoint: number | null;
    marginalCost?: number | null;
    plannedOutageRate?: number | null;
    forcedOutageRate?: number | null;
}

interface ActivePowerControlFormInfos {
    participate?: boolean | null;
    droop?: number | null;
}

interface GeneratorShortCircuitFormInfos {
    directTransX?: number | null;
    stepUpTransformerX?: number | null;
}

interface MinMaxReactiveLimitsFormInfos {
    minQ?: number | null;
    maxQ?: number | null;
}

export interface GeneratorFormInfos {
    id: string;
    name: string;
    energySource: string;
    maxP: number;
    minP: number;
    ratedS: number;
    targetP: number;
    voltageRegulatorOn: boolean;
    targetV: number;
    targetQ: number;
    generatorStartup: GeneratorStartUpFormInfos;
    connectablePosition: ConnectablePositionFormInfos;
    activePowerControl: ActivePowerControlFormInfos;
    generatorShortCircuit: GeneratorShortCircuitFormInfos;
    regulatingTerminalId: string;
    regulatingTerminalVlId: string;
    regulatingTerminalConnectableId: string;
    regulatingTerminalConnectableType: string;
    qPercent: number;
    minMaxReactiveLimits: MinMaxReactiveLimitsFormInfos;
    maxMaxReactiveLimits: number;
    reactiveCapabilityCurvePoints: [];
    voltageLevelId: string;
    busOrBusbarSectionId: string;
    busbarSectionName?: string;
    connectionDirection: string | null;
    connectionName?: string | null;
    connectionPosition?: string | null;
    terminalConnected?: boolean | null;
    properties: Record<string, string> | undefined;
}

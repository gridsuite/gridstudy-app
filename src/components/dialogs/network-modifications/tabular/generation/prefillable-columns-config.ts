/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {
    NOMINAL_V,
    LOW_VOLTAGE_LIMIT,
    HIGH_VOLTAGE_LIMIT,
    IP_MIN,
    IP_MAX,
    R,
    X,
    G1,
    G2,
    B1,
    B2,
    CONNECTED1,
    CONNECTED2,
    CONNECTION_NAME1,
    CONNECTION_DIRECTION1,
    CONNECTION_POSITION1,
    CONNECTION_NAME2,
    CONNECTION_DIRECTION2,
    CONNECTION_POSITION2,
    G,
    B,
    RATED_U1,
    RATED_U2,
    RATED_S,
    RATIO_TAP_CHANGER_LOAD_TAP_CHANGING_CAPABILITIES,
    RATIO_TAP_CHANGER_REGULATION_SIDE,
    ENERGY_SOURCE,
    CONNECTED,
    CONNECTION_NAME,
    CONNECTION_DIRECTION,
    CONNECTION_POSITION,
    MIN_P,
    MAX_P,
    MIN_Q,
    MAX_Q,
    REACTIVE_CAPABILITY_CURVE,
    TARGET_P,
    TARGET_Q,
    VOLTAGE_REGULATION_ON,
    TARGET_V,
    REGULATING_TERMINAL_ID,
    REGULATING_TERMINAL_TYPE,
    REGULATING_TERMINAL_VOLTAGE_LEVEL_ID,
    Q_PERCENT,
    PARTICIPATE,
    DROOP,
    TRANSIENT_REACTANCE,
    STEP_UP_TRANSFORMER_REACTANCE,
    PLANNED_ACTIVE_POWER_SET_POINT,
    MARGINAL_COST,
    PLANNED_OUTAGE_RATE,
    FORCED_OUTAGE_RATE,
    LOAD_TYPE,
    P0,
    Q0,
    MAXIMUM_SECTION_COUNT,
    SECTION_COUNT,
    SHUNT_COMPENSATOR_TYPE,
    MAX_Q_AT_NOMINAL_V,
    REACTIVE_CAPABILITY_CURVE_P_MIN,
    REACTIVE_CAPABILITY_CURVE_Q_MIN_P_MIN,
    REACTIVE_CAPABILITY_CURVE_Q_MAX_P_MIN,
    REACTIVE_CAPABILITY_CURVE_P_0,
    REACTIVE_CAPABILITY_CURVE_Q_MIN_P_0,
    REACTIVE_CAPABILITY_CURVE_Q_MAX_P_0,
    REACTIVE_CAPABILITY_CURVE_P_MAX,
    REACTIVE_CAPABILITY_CURVE_Q_MIN_P_MAX,
    REACTIVE_CAPABILITY_CURVE_Q_MAX_P_MAX,
    REGULATION_TYPE_TEXT,
} from 'components/utils/field-constants';
import { FieldConstants } from '@gridsuite/commons-ui';

/**
 * Represents a group of pre-fillable columns
 * A group can contain one or more CSV columns
 */
export interface PrefilledColumnGroup {
    /** Group identifier (used for translations) */
    labelId: string;
    /** List of CSV columns associated with this group */
    csvColumns: string[];
    /** Corresponding network fields to retrieve data from */
    networkFields: string[];
}

export const PREFILLED_COLUMNS_CONFIG: Record<string, PrefilledColumnGroup[]> = {
    SUBSTATION: [
        {
            labelId: FieldConstants.EQUIPMENT_NAME,
            csvColumns: [FieldConstants.EQUIPMENT_NAME],
            networkFields: ['name'],
        },
        {
            labelId: FieldConstants.COUNTRY,
            csvColumns: [FieldConstants.COUNTRY],
            networkFields: ['country'],
        },
    ],

    VOLTAGE_LEVEL: [
        {
            labelId: FieldConstants.EQUIPMENT_NAME,
            csvColumns: [FieldConstants.EQUIPMENT_NAME],
            networkFields: ['name'],
        },
        {
            labelId: 'withoutUnit.nominalV',
            csvColumns: [NOMINAL_V],
            networkFields: ['nominalV'],
        },
        {
            labelId: LOW_VOLTAGE_LIMIT,
            csvColumns: [LOW_VOLTAGE_LIMIT],
            networkFields: ['lowVoltageLimit'],
        },
        {
            labelId: HIGH_VOLTAGE_LIMIT,
            csvColumns: [HIGH_VOLTAGE_LIMIT],
            networkFields: ['highVoltageLimit'],
        },
        {
            labelId: 'withoutunit.ipMin',
            csvColumns: [IP_MIN],
            networkFields: ['identifiableShortCircuit.ipMin'],
        },
        {
            labelId: 'withoutunit.ipMax',
            csvColumns: [IP_MAX],
            networkFields: ['identifiableShortCircuit.ipMax'],
        },
    ],

    LINE: [
        {
            labelId: FieldConstants.EQUIPMENT_NAME,
            csvColumns: [FieldConstants.EQUIPMENT_NAME],
            networkFields: ['name'],
        },
        {
            labelId: 'withoutunit.r',
            csvColumns: [R],
            networkFields: ['r'],
        },
        {
            labelId: 'withoutunit.x',
            csvColumns: [X],
            networkFields: ['x'],
        },
        {
            labelId: 'PrefilledColumn.Conductance',
            csvColumns: [G1, G2],
            networkFields: ['g1', 'g2'],
        },
        {
            labelId: 'PrefilledColumn.Susceptance',
            csvColumns: [B1, B2],
            networkFields: ['b1', 'b2'],
        },
        {
            labelId: 'PrefilledColumn.Connected',
            csvColumns: [CONNECTED1, CONNECTED2],
            networkFields: ['terminal1Connected', 'terminal2Connected'],
        },
        {
            labelId: 'PrefilledColumn.ConnectionInfo',
            csvColumns: [
                CONNECTION_NAME1,
                CONNECTION_DIRECTION1,
                CONNECTION_POSITION1,
                CONNECTION_NAME2,
                CONNECTION_DIRECTION2,
                CONNECTION_POSITION2,
            ],
            networkFields: [
                'connectablePosition1.connectionName',
                'connectablePosition1.connectionDirection',
                'connectablePosition1.connectionPosition',
                'connectablePosition2.connectionName',
                'connectablePosition2.connectionDirection',
                'connectablePosition2.connectionPosition',
            ],
        },
    ],

    TWO_WINDINGS_TRANSFORMER: [
        {
            labelId: FieldConstants.EQUIPMENT_NAME,
            csvColumns: [FieldConstants.EQUIPMENT_NAME],
            networkFields: ['name'],
        },
        {
            labelId: 'withoutunit.r',
            csvColumns: [R],
            networkFields: ['r'],
        },
        {
            labelId: 'withoutunit.x',
            csvColumns: [X],
            networkFields: ['x'],
        },
        {
            labelId: 'withoutunit.g',
            csvColumns: [G],
            networkFields: ['g'],
        },
        {
            labelId: 'withoutunit.b',
            csvColumns: [B],
            networkFields: ['b'],
        },
        {
            labelId: 'PrefilledColumn.WindingVoltages',
            csvColumns: [RATED_U1, RATED_U2],
            networkFields: ['ratedU1', 'ratedU2'],
        },
        {
            labelId: RATED_S,
            csvColumns: [RATED_S],
            networkFields: ['ratedS'],
        },
        {
            labelId: 'PrefilledColumn.Connected',
            csvColumns: [CONNECTED1, CONNECTED2],
            networkFields: ['terminal1Connected', 'terminal2Connected'],
        },
        {
            labelId: 'PrefilledColumn.ConnectionInfo',
            csvColumns: [
                CONNECTION_NAME1,
                CONNECTION_DIRECTION1,
                CONNECTION_POSITION1,
                CONNECTION_NAME2,
                CONNECTION_DIRECTION2,
                CONNECTION_POSITION2,
            ],
            networkFields: [
                'connectablePosition1.connectionName',
                'connectablePosition1.connectionDirection',
                'connectablePosition1.connectionPosition',
                'connectablePosition2.connectionName',
                'connectablePosition2.connectionDirection',
                'connectablePosition2.connectionPosition',
            ],
        },
        {
            labelId: RATIO_TAP_CHANGER_LOAD_TAP_CHANGING_CAPABILITIES,
            csvColumns: [RATIO_TAP_CHANGER_LOAD_TAP_CHANGING_CAPABILITIES],
            networkFields: ['ratioTapChanger.hasLoadTapChangingCapabilities'],
        },
        {
            labelId: RATIO_TAP_CHANGER_REGULATION_SIDE,
            csvColumns: [RATIO_TAP_CHANGER_REGULATION_SIDE],
            networkFields: ['ratioTapChanger.regulationSide'],
        },
    ],

    GENERATOR: [
        {
            labelId: FieldConstants.EQUIPMENT_NAME,
            csvColumns: [FieldConstants.EQUIPMENT_NAME],
            networkFields: ['name'],
        },
        {
            labelId: ENERGY_SOURCE,
            csvColumns: [ENERGY_SOURCE],
            networkFields: ['energySource'],
        },
        {
            labelId: CONNECTED,
            csvColumns: [CONNECTED],
            networkFields: ['terminalConnected'],
        },
        {
            labelId: 'PrefilledColumn.ConnectionInfo',
            csvColumns: [CONNECTION_NAME, CONNECTION_DIRECTION, CONNECTION_POSITION],
            networkFields: [
                'connectablePosition.connectionName',
                'connectablePosition.connectionDirection',
                'connectablePosition.connectionPosition',
            ],
        },
        {
            labelId: 'PrefilledColumn.ActivePowerLimits',
            csvColumns: [MIN_P, MAX_P],
            networkFields: ['minP', 'maxP'],
        },
        {
            labelId: RATED_S,
            csvColumns: [RATED_S],
            networkFields: ['ratedS'],
        },
        {
            labelId: 'PrefilledColumn.ReactivePowerLimits',
            csvColumns: [MIN_Q, MAX_Q],
            networkFields: ['minMaxReactiveLimits.minQ', 'minMaxReactiveLimits.maxQ'],
        },
        {
            labelId: 'PrefilledColumn.ReactiveCapabilityCurve',
            csvColumns: [
                REACTIVE_CAPABILITY_CURVE,
                REACTIVE_CAPABILITY_CURVE_P_MIN,
                REACTIVE_CAPABILITY_CURVE_Q_MIN_P_MIN,
                REACTIVE_CAPABILITY_CURVE_Q_MAX_P_MIN,
                REACTIVE_CAPABILITY_CURVE_P_0,
                REACTIVE_CAPABILITY_CURVE_Q_MIN_P_0,
                REACTIVE_CAPABILITY_CURVE_Q_MAX_P_0,
                REACTIVE_CAPABILITY_CURVE_P_MAX,
                REACTIVE_CAPABILITY_CURVE_Q_MIN_P_MAX,
                REACTIVE_CAPABILITY_CURVE_Q_MAX_P_MAX,
            ],
            networkFields: [
                REACTIVE_CAPABILITY_CURVE,
                REACTIVE_CAPABILITY_CURVE_P_MIN,
                REACTIVE_CAPABILITY_CURVE_Q_MIN_P_MIN,
                REACTIVE_CAPABILITY_CURVE_Q_MAX_P_MIN,
                REACTIVE_CAPABILITY_CURVE_P_0,
                REACTIVE_CAPABILITY_CURVE_Q_MIN_P_0,
                REACTIVE_CAPABILITY_CURVE_Q_MAX_P_0,
                REACTIVE_CAPABILITY_CURVE_P_MAX,
                REACTIVE_CAPABILITY_CURVE_Q_MIN_P_MAX,
                REACTIVE_CAPABILITY_CURVE_Q_MAX_P_MAX,
            ],
        },
        {
            labelId: TARGET_P,
            csvColumns: [TARGET_P],
            networkFields: ['targetP'],
        },
        {
            labelId: TARGET_Q,
            csvColumns: [TARGET_Q],
            networkFields: ['targetQ'],
        },
        {
            labelId: VOLTAGE_REGULATION_ON,
            csvColumns: [VOLTAGE_REGULATION_ON],
            networkFields: ['voltageRegulatorOn'],
        },
        {
            labelId: TARGET_V,
            csvColumns: [TARGET_V],
            networkFields: ['targetV'],
        },
        {
            labelId: REGULATION_TYPE_TEXT,
            csvColumns: [REGULATION_TYPE_TEXT],
            networkFields: ['regulationTypeText'],
        },
        {
            labelId: REGULATING_TERMINAL_ID,
            csvColumns: [REGULATING_TERMINAL_ID],
            networkFields: ['regulatingTerminalConnectableId'],
        },
        {
            labelId: REGULATING_TERMINAL_TYPE,
            csvColumns: [REGULATING_TERMINAL_TYPE],
            networkFields: ['regulatingTerminalConnectableType'],
        },
        {
            labelId: REGULATING_TERMINAL_VOLTAGE_LEVEL_ID,
            csvColumns: [REGULATING_TERMINAL_VOLTAGE_LEVEL_ID],
            networkFields: ['regulatingTerminalVlId'],
        },
        {
            labelId: Q_PERCENT,
            csvColumns: [Q_PERCENT],
            networkFields: ['coordinatedReactiveControl.qPercent'],
        },
        {
            labelId: PARTICIPATE,
            csvColumns: [PARTICIPATE],
            networkFields: ['activePowerControl.participate'],
        },
        {
            labelId: DROOP,
            csvColumns: [DROOP],
            networkFields: ['activePowerControl.droop'],
        },
        {
            labelId: 'withoutunit.directTransX',
            csvColumns: [TRANSIENT_REACTANCE],
            networkFields: ['generatorShortCircuit.directTransX'],
        },
        {
            labelId: 'withoutunit.stepUpTransformerX',
            csvColumns: [STEP_UP_TRANSFORMER_REACTANCE],
            networkFields: ['generatorShortCircuit.stepUpTransformerX'],
        },
        {
            labelId: 'withoutunit.plannedActivePowerSetPoint',
            csvColumns: [PLANNED_ACTIVE_POWER_SET_POINT],
            networkFields: ['generatorStartup.plannedActivePowerSetPoint'],
        },
        {
            labelId: MARGINAL_COST,
            csvColumns: [MARGINAL_COST],
            networkFields: ['generatorStartup.marginalCost'],
        },
        {
            labelId: PLANNED_OUTAGE_RATE,
            csvColumns: [PLANNED_OUTAGE_RATE],
            networkFields: ['generatorStartup.plannedOutageRate'],
        },
        {
            labelId: FORCED_OUTAGE_RATE,
            csvColumns: [FORCED_OUTAGE_RATE],
            networkFields: ['generatorStartup.forcedOutageRate'],
        },
    ],

    LOAD: [
        {
            labelId: FieldConstants.EQUIPMENT_NAME,
            csvColumns: [FieldConstants.EQUIPMENT_NAME],
            networkFields: ['name'],
        },
        {
            labelId: LOAD_TYPE,
            csvColumns: [LOAD_TYPE],
            networkFields: ['type'],
        },
        {
            labelId: CONNECTED,
            csvColumns: [CONNECTED],
            networkFields: ['terminalConnected'],
        },
        {
            labelId: 'PrefilledColumn.ConnectionInfo',
            csvColumns: [CONNECTION_NAME, CONNECTION_DIRECTION, CONNECTION_POSITION],
            networkFields: [
                'connectablePosition.connectionName',
                'connectablePosition.connectionDirection',
                'connectablePosition.connectionPosition',
            ],
        },
        {
            labelId: P0,
            csvColumns: [P0],
            networkFields: ['p0'],
        },
        {
            labelId: Q0,
            csvColumns: [Q0],
            networkFields: ['q0'],
        },
    ],

    BATTERY: [
        {
            labelId: FieldConstants.EQUIPMENT_NAME,
            csvColumns: [FieldConstants.EQUIPMENT_NAME],
            networkFields: ['name'],
        },
        {
            labelId: CONNECTED,
            csvColumns: [CONNECTED],
            networkFields: ['terminalConnected'],
        },
        {
            labelId: 'PrefilledColumn.ConnectionInfo',
            csvColumns: [CONNECTION_NAME, CONNECTION_DIRECTION, CONNECTION_POSITION],
            networkFields: [
                'connectablePosition.connectionName',
                'connectablePosition.connectionDirection',
                'connectablePosition.connectionPosition',
            ],
        },
        {
            labelId: 'PrefilledColumn.ActivePowerLimits',
            csvColumns: [MIN_P, MAX_P],
            networkFields: ['minP', 'maxP'],
        },
        {
            labelId: 'PrefilledColumn.ReactivePowerLimits',
            csvColumns: [MIN_Q, MAX_Q],
            networkFields: ['minMaxReactiveLimits.minQ', 'minMaxReactiveLimits.maxQ'],
        },
        {
            labelId: 'PrefilledColumn.ReactiveCapabilityCurve',
            csvColumns: [
                REACTIVE_CAPABILITY_CURVE,
                REACTIVE_CAPABILITY_CURVE_P_MIN,
                REACTIVE_CAPABILITY_CURVE_Q_MIN_P_MIN,
                REACTIVE_CAPABILITY_CURVE_Q_MAX_P_MIN,
                REACTIVE_CAPABILITY_CURVE_P_0,
                REACTIVE_CAPABILITY_CURVE_Q_MIN_P_0,
                REACTIVE_CAPABILITY_CURVE_Q_MAX_P_0,
                REACTIVE_CAPABILITY_CURVE_P_MAX,
                REACTIVE_CAPABILITY_CURVE_Q_MIN_P_MAX,
                REACTIVE_CAPABILITY_CURVE_Q_MAX_P_MAX,
            ],
            networkFields: [
                REACTIVE_CAPABILITY_CURVE,
                REACTIVE_CAPABILITY_CURVE_P_MIN,
                REACTIVE_CAPABILITY_CURVE_Q_MIN_P_MIN,
                REACTIVE_CAPABILITY_CURVE_Q_MAX_P_MIN,
                REACTIVE_CAPABILITY_CURVE_P_0,
                REACTIVE_CAPABILITY_CURVE_Q_MIN_P_0,
                REACTIVE_CAPABILITY_CURVE_Q_MAX_P_0,
                REACTIVE_CAPABILITY_CURVE_P_MAX,
                REACTIVE_CAPABILITY_CURVE_Q_MIN_P_MAX,
                REACTIVE_CAPABILITY_CURVE_Q_MAX_P_MAX,
            ],
        },
        {
            labelId: TARGET_P,
            csvColumns: [TARGET_P],
            networkFields: ['targetP'],
        },
        {
            labelId: TARGET_Q,
            csvColumns: [TARGET_Q],
            networkFields: ['targetQ'],
        },
        {
            labelId: PARTICIPATE,
            csvColumns: [PARTICIPATE],
            networkFields: ['activePowerControl.participate'],
        },
        {
            labelId: DROOP,
            csvColumns: [DROOP],
            networkFields: ['activePowerControl.droop'],
        },
    ],

    SHUNT_COMPENSATOR: [
        {
            labelId: FieldConstants.EQUIPMENT_NAME,
            csvColumns: [FieldConstants.EQUIPMENT_NAME],
            networkFields: ['name'],
        },
        {
            labelId: CONNECTED,
            csvColumns: [CONNECTED],
            networkFields: ['terminalConnected'],
        },
        {
            labelId: 'PrefilledColumn.ConnectionInfo',
            csvColumns: [CONNECTION_NAME, CONNECTION_DIRECTION, CONNECTION_POSITION],
            networkFields: [
                'connectablePosition.connectionName',
                'connectablePosition.connectionDirection',
                'connectablePosition.connectionPosition',
            ],
        },
        {
            labelId: MAXIMUM_SECTION_COUNT,
            csvColumns: [MAXIMUM_SECTION_COUNT],
            networkFields: ['maximumSectionCount'],
        },
        {
            labelId: SECTION_COUNT,
            csvColumns: [SECTION_COUNT],
            networkFields: ['sectionCount'],
        },
        {
            labelId: SHUNT_COMPENSATOR_TYPE,
            csvColumns: [SHUNT_COMPENSATOR_TYPE],
            networkFields: ['type'],
        },
        {
            labelId: MAX_Q_AT_NOMINAL_V,
            csvColumns: [MAX_Q_AT_NOMINAL_V],
            networkFields: ['maxQAtNominalV'],
        },
    ],
};

export const getPrefilledColumnGroups = (equipmentType: string): PrefilledColumnGroup[] => {
    return PREFILLED_COLUMNS_CONFIG[equipmentType] ?? [];
};

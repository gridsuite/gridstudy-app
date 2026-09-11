/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { FieldConstants, TabularFieldConstants } from '@gridsuite/commons-ui';

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

const VOLTAGE_REGULATION_FIELDS: PrefilledColumnGroup[] = [
    {
        labelId: TabularFieldConstants.VOLTAGE_REGULATION_ON,
        csvColumns: [TabularFieldConstants.VOLTAGE_REGULATION_ON],
        networkFields: ['voltageRegulatorOn'],
    },
    {
        labelId: FieldConstants.TARGET_V,
        csvColumns: [FieldConstants.TARGET_V],
        networkFields: ['targetV'],
    },
    {
        labelId: FieldConstants.REGULATION_TYPE,
        csvColumns: [FieldConstants.REGULATION_TYPE],
        networkFields: ['regulationType'],
    },
    {
        labelId: TabularFieldConstants.REGULATING_TERMINAL_ID,
        csvColumns: [TabularFieldConstants.REGULATING_TERMINAL_ID],
        networkFields: ['regulatingTerminalConnectableId'],
    },
    {
        labelId: TabularFieldConstants.REGULATING_TERMINAL_TYPE,
        csvColumns: [TabularFieldConstants.REGULATING_TERMINAL_TYPE],
        networkFields: ['regulatingTerminalConnectableType'],
    },
    {
        labelId: FieldConstants.REGULATING_TERMINAL_VOLTAGE_LEVEL_ID,
        csvColumns: [FieldConstants.REGULATING_TERMINAL_VOLTAGE_LEVEL_ID],
        networkFields: ['regulatingTerminalVlId'],
    },
];

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
            csvColumns: [FieldConstants.NOMINAL_V],
            networkFields: ['nominalV'],
        },
        {
            labelId: FieldConstants.LOW_VOLTAGE_LIMIT,
            csvColumns: [FieldConstants.LOW_VOLTAGE_LIMIT],
            networkFields: ['lowVoltageLimit'],
        },
        {
            labelId: FieldConstants.HIGH_VOLTAGE_LIMIT,
            csvColumns: [FieldConstants.HIGH_VOLTAGE_LIMIT],
            networkFields: ['highVoltageLimit'],
        },
        {
            labelId: 'withoutunit.ipMin',
            csvColumns: [TabularFieldConstants.IP_MIN],
            networkFields: ['identifiableShortCircuit.ipMin'],
        },
        {
            labelId: 'withoutunit.ipMax',
            csvColumns: [TabularFieldConstants.IP_MAX],
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
            csvColumns: [FieldConstants.R],
            networkFields: ['r'],
        },
        {
            labelId: 'withoutunit.x',
            csvColumns: [FieldConstants.X],
            networkFields: ['x'],
        },
        {
            labelId: 'PrefilledColumn.Conductance',
            csvColumns: [FieldConstants.G1, FieldConstants.G2],
            networkFields: ['g1', 'g2'],
        },
        {
            labelId: 'PrefilledColumn.Susceptance',
            csvColumns: [FieldConstants.B1, FieldConstants.B2],
            networkFields: ['b1', 'b2'],
        },
        {
            labelId: 'PrefilledColumn.Connected',
            csvColumns: [TabularFieldConstants.CONNECTED1, TabularFieldConstants.CONNECTED2],
            networkFields: ['terminal1Connected', 'terminal2Connected'],
        },
        {
            labelId: 'PrefilledColumn.ConnectionInfo',
            csvColumns: [
                TabularFieldConstants.CONNECTION_NAME1,
                TabularFieldConstants.CONNECTION_DIRECTION1,
                TabularFieldConstants.CONNECTION_POSITION1,
                TabularFieldConstants.CONNECTION_NAME2,
                TabularFieldConstants.CONNECTION_DIRECTION2,
                TabularFieldConstants.CONNECTION_POSITION2,
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
            csvColumns: [FieldConstants.R],
            networkFields: ['r'],
        },
        {
            labelId: 'withoutunit.x',
            csvColumns: [FieldConstants.X],
            networkFields: ['x'],
        },
        {
            labelId: 'withoutunit.g',
            csvColumns: [FieldConstants.G],
            networkFields: ['g'],
        },
        {
            labelId: 'withoutunit.b',
            csvColumns: [FieldConstants.B],
            networkFields: ['b'],
        },
        {
            labelId: 'PrefilledColumn.WindingVoltages',
            csvColumns: [FieldConstants.RATED_U1, FieldConstants.RATED_U2],
            networkFields: ['ratedU1', 'ratedU2'],
        },
        {
            labelId: FieldConstants.RATED_S,
            csvColumns: [FieldConstants.RATED_S],
            networkFields: ['ratedS'],
        },
        {
            labelId: 'PrefilledColumn.Connected',
            csvColumns: [TabularFieldConstants.CONNECTED1, TabularFieldConstants.CONNECTED2],
            networkFields: ['terminal1Connected', 'terminal2Connected'],
        },
        {
            labelId: 'PrefilledColumn.ConnectionInfo',
            csvColumns: [
                TabularFieldConstants.CONNECTION_NAME1,
                TabularFieldConstants.CONNECTION_DIRECTION1,
                TabularFieldConstants.CONNECTION_POSITION1,
                TabularFieldConstants.CONNECTION_NAME2,
                TabularFieldConstants.CONNECTION_DIRECTION2,
                TabularFieldConstants.CONNECTION_POSITION2,
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
            labelId: TabularFieldConstants.RATIO_TAP_CHANGER_LOAD_TAP_CHANGING_CAPABILITIES,
            csvColumns: [TabularFieldConstants.RATIO_TAP_CHANGER_LOAD_TAP_CHANGING_CAPABILITIES],
            networkFields: ['ratioTapChanger.hasLoadTapChangingCapabilities'],
        },
        {
            labelId: TabularFieldConstants.RATIO_TAP_CHANGER_REGULATION_SIDE,
            csvColumns: [TabularFieldConstants.RATIO_TAP_CHANGER_REGULATION_SIDE],
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
            labelId: FieldConstants.ENERGY_SOURCE,
            csvColumns: [FieldConstants.ENERGY_SOURCE],
            networkFields: ['energySource'],
        },
        {
            labelId: FieldConstants.CONNECTED,
            csvColumns: [FieldConstants.CONNECTED],
            networkFields: ['terminalConnected'],
        },
        {
            labelId: 'PrefilledColumn.ConnectionInfo',
            csvColumns: [
                FieldConstants.CONNECTION_NAME,
                FieldConstants.CONNECTION_DIRECTION,
                FieldConstants.CONNECTION_POSITION,
            ],
            networkFields: [
                'connectablePosition.connectionName',
                'connectablePosition.connectionDirection',
                'connectablePosition.connectionPosition',
            ],
        },
        {
            labelId: 'PrefilledColumn.ActivePowerLimits',
            csvColumns: [TabularFieldConstants.MIN_P, TabularFieldConstants.MAX_P],
            networkFields: ['minP', 'maxP'],
        },
        {
            labelId: FieldConstants.RATED_S,
            csvColumns: [FieldConstants.RATED_S],
            networkFields: ['ratedS'],
        },
        {
            labelId: 'PrefilledColumn.ReactivePowerLimits',
            csvColumns: [FieldConstants.MIN_Q, FieldConstants.MAX_Q],
            networkFields: ['minMaxReactiveLimits.minQ', 'minMaxReactiveLimits.maxQ'],
        },
        {
            labelId: 'PrefilledColumn.ReactiveCapabilityCurve',
            csvColumns: [
                TabularFieldConstants.REACTIVE_CAPABILITY_CURVE,
                TabularFieldConstants.REACTIVE_CAPABILITY_CURVE_P_MIN,
                TabularFieldConstants.REACTIVE_CAPABILITY_CURVE_Q_MIN_P_MIN,
                TabularFieldConstants.REACTIVE_CAPABILITY_CURVE_Q_MAX_P_MIN,
                TabularFieldConstants.REACTIVE_CAPABILITY_CURVE_P_0,
                TabularFieldConstants.REACTIVE_CAPABILITY_CURVE_Q_MIN_P_0,
                TabularFieldConstants.REACTIVE_CAPABILITY_CURVE_Q_MAX_P_0,
                TabularFieldConstants.REACTIVE_CAPABILITY_CURVE_P_MAX,
                TabularFieldConstants.REACTIVE_CAPABILITY_CURVE_Q_MIN_P_MAX,
                TabularFieldConstants.REACTIVE_CAPABILITY_CURVE_Q_MAX_P_MAX,
            ],
            networkFields: [
                TabularFieldConstants.REACTIVE_CAPABILITY_CURVE,
                TabularFieldConstants.REACTIVE_CAPABILITY_CURVE_P_MIN,
                TabularFieldConstants.REACTIVE_CAPABILITY_CURVE_Q_MIN_P_MIN,
                TabularFieldConstants.REACTIVE_CAPABILITY_CURVE_Q_MAX_P_MIN,
                TabularFieldConstants.REACTIVE_CAPABILITY_CURVE_P_0,
                TabularFieldConstants.REACTIVE_CAPABILITY_CURVE_Q_MIN_P_0,
                TabularFieldConstants.REACTIVE_CAPABILITY_CURVE_Q_MAX_P_0,
                TabularFieldConstants.REACTIVE_CAPABILITY_CURVE_P_MAX,
                TabularFieldConstants.REACTIVE_CAPABILITY_CURVE_Q_MIN_P_MAX,
                TabularFieldConstants.REACTIVE_CAPABILITY_CURVE_Q_MAX_P_MAX,
            ],
        },
        {
            labelId: TabularFieldConstants.TARGET_P,
            csvColumns: [TabularFieldConstants.TARGET_P],
            networkFields: ['targetP'],
        },
        {
            labelId: TabularFieldConstants.TARGET_Q,
            csvColumns: [TabularFieldConstants.TARGET_Q],
            networkFields: ['targetQ'],
        },
        ...VOLTAGE_REGULATION_FIELDS,
        {
            labelId: FieldConstants.Q_PERCENT,
            csvColumns: [FieldConstants.Q_PERCENT],
            networkFields: ['coordinatedReactiveControl.qPercent'],
        },
        {
            labelId: TabularFieldConstants.PARTICIPATE,
            csvColumns: [TabularFieldConstants.PARTICIPATE],
            networkFields: ['activePowerControl.participate'],
        },
        {
            labelId: FieldConstants.DROOP,
            csvColumns: [FieldConstants.DROOP],
            networkFields: ['activePowerControl.droop'],
        },
        {
            labelId: 'withoutunit.directTransX',
            csvColumns: [FieldConstants.TRANSIENT_REACTANCE],
            networkFields: ['generatorShortCircuit.directTransX'],
        },
        {
            labelId: 'withoutunit.stepUpTransformerX',
            csvColumns: [TabularFieldConstants.STEP_UP_TRANSFORMER_REACTANCE],
            networkFields: ['generatorShortCircuit.stepUpTransformerX'],
        },
        {
            labelId: 'withoutunit.plannedActivePowerSetPoint',
            csvColumns: [FieldConstants.PLANNED_ACTIVE_POWER_SET_POINT],
            networkFields: ['generatorStartup.plannedActivePowerSetPoint'],
        },
        {
            labelId: FieldConstants.MARGINAL_COST,
            csvColumns: [FieldConstants.MARGINAL_COST],
            networkFields: ['generatorStartup.marginalCost'],
        },
        {
            labelId: FieldConstants.PLANNED_OUTAGE_RATE,
            csvColumns: [FieldConstants.PLANNED_OUTAGE_RATE],
            networkFields: ['generatorStartup.plannedOutageRate'],
        },
        {
            labelId: FieldConstants.FORCED_OUTAGE_RATE,
            csvColumns: [FieldConstants.FORCED_OUTAGE_RATE],
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
            labelId: FieldConstants.LOAD_TYPE,
            csvColumns: [FieldConstants.LOAD_TYPE],
            networkFields: ['type'],
        },
        {
            labelId: FieldConstants.CONNECTED,
            csvColumns: [FieldConstants.CONNECTED],
            networkFields: ['terminalConnected'],
        },
        {
            labelId: 'PrefilledColumn.ConnectionInfo',
            csvColumns: [
                FieldConstants.CONNECTION_NAME,
                FieldConstants.CONNECTION_DIRECTION,
                FieldConstants.CONNECTION_POSITION,
            ],
            networkFields: [
                'connectablePosition.connectionName',
                'connectablePosition.connectionDirection',
                'connectablePosition.connectionPosition',
            ],
        },
        {
            labelId: TabularFieldConstants.P0,
            csvColumns: [TabularFieldConstants.P0],
            networkFields: ['p0'],
        },
        {
            labelId: FieldConstants.Q0,
            csvColumns: [FieldConstants.Q0],
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
            labelId: FieldConstants.CONNECTED,
            csvColumns: [FieldConstants.CONNECTED],
            networkFields: ['terminalConnected'],
        },
        {
            labelId: 'PrefilledColumn.ConnectionInfo',
            csvColumns: [
                FieldConstants.CONNECTION_NAME,
                FieldConstants.CONNECTION_DIRECTION,
                FieldConstants.CONNECTION_POSITION,
            ],
            networkFields: [
                'connectablePosition.connectionName',
                'connectablePosition.connectionDirection',
                'connectablePosition.connectionPosition',
            ],
        },
        {
            labelId: 'PrefilledColumn.ActivePowerLimits',
            csvColumns: [TabularFieldConstants.MIN_P, TabularFieldConstants.MAX_P],
            networkFields: ['minP', 'maxP'],
        },
        {
            labelId: 'PrefilledColumn.ReactivePowerLimits',
            csvColumns: [FieldConstants.MIN_Q, FieldConstants.MAX_Q],
            networkFields: ['minMaxReactiveLimits.minQ', 'minMaxReactiveLimits.maxQ'],
        },
        {
            labelId: 'PrefilledColumn.ReactiveCapabilityCurve',
            csvColumns: [
                TabularFieldConstants.REACTIVE_CAPABILITY_CURVE,
                TabularFieldConstants.REACTIVE_CAPABILITY_CURVE_P_MIN,
                TabularFieldConstants.REACTIVE_CAPABILITY_CURVE_Q_MIN_P_MIN,
                TabularFieldConstants.REACTIVE_CAPABILITY_CURVE_Q_MAX_P_MIN,
                TabularFieldConstants.REACTIVE_CAPABILITY_CURVE_P_0,
                TabularFieldConstants.REACTIVE_CAPABILITY_CURVE_Q_MIN_P_0,
                TabularFieldConstants.REACTIVE_CAPABILITY_CURVE_Q_MAX_P_0,
                TabularFieldConstants.REACTIVE_CAPABILITY_CURVE_P_MAX,
                TabularFieldConstants.REACTIVE_CAPABILITY_CURVE_Q_MIN_P_MAX,
                TabularFieldConstants.REACTIVE_CAPABILITY_CURVE_Q_MAX_P_MAX,
            ],
            networkFields: [
                TabularFieldConstants.REACTIVE_CAPABILITY_CURVE,
                TabularFieldConstants.REACTIVE_CAPABILITY_CURVE_P_MIN,
                TabularFieldConstants.REACTIVE_CAPABILITY_CURVE_Q_MIN_P_MIN,
                TabularFieldConstants.REACTIVE_CAPABILITY_CURVE_Q_MAX_P_MIN,
                TabularFieldConstants.REACTIVE_CAPABILITY_CURVE_P_0,
                TabularFieldConstants.REACTIVE_CAPABILITY_CURVE_Q_MIN_P_0,
                TabularFieldConstants.REACTIVE_CAPABILITY_CURVE_Q_MAX_P_0,
                TabularFieldConstants.REACTIVE_CAPABILITY_CURVE_P_MAX,
                TabularFieldConstants.REACTIVE_CAPABILITY_CURVE_Q_MIN_P_MAX,
                TabularFieldConstants.REACTIVE_CAPABILITY_CURVE_Q_MAX_P_MAX,
            ],
        },
        {
            labelId: TabularFieldConstants.TARGET_P,
            csvColumns: [TabularFieldConstants.TARGET_P],
            networkFields: ['targetP'],
        },
        {
            labelId: TabularFieldConstants.TARGET_Q,
            csvColumns: [TabularFieldConstants.TARGET_Q],
            networkFields: ['targetQ'],
        },
        ...VOLTAGE_REGULATION_FIELDS,
        {
            labelId: TabularFieldConstants.PARTICIPATE,
            csvColumns: [TabularFieldConstants.PARTICIPATE],
            networkFields: ['activePowerControl.participate'],
        },
        {
            labelId: FieldConstants.DROOP,
            csvColumns: [FieldConstants.DROOP],
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
            labelId: FieldConstants.CONNECTED,
            csvColumns: [FieldConstants.CONNECTED],
            networkFields: ['terminalConnected'],
        },
        {
            labelId: 'PrefilledColumn.ConnectionInfo',
            csvColumns: [
                FieldConstants.CONNECTION_NAME,
                FieldConstants.CONNECTION_DIRECTION,
                FieldConstants.CONNECTION_POSITION,
            ],
            networkFields: [
                'connectablePosition.connectionName',
                'connectablePosition.connectionDirection',
                'connectablePosition.connectionPosition',
            ],
        },
        {
            labelId: FieldConstants.MAXIMUM_SECTION_COUNT,
            csvColumns: [FieldConstants.MAXIMUM_SECTION_COUNT],
            networkFields: ['maximumSectionCount'],
        },
        {
            labelId: FieldConstants.SECTION_COUNT,
            csvColumns: [FieldConstants.SECTION_COUNT],
            networkFields: ['sectionCount'],
        },
        {
            labelId: FieldConstants.SHUNT_COMPENSATOR_TYPE,
            csvColumns: [FieldConstants.SHUNT_COMPENSATOR_TYPE],
            networkFields: ['type'],
        },
        {
            labelId: FieldConstants.MAX_Q_AT_NOMINAL_V,
            csvColumns: [FieldConstants.MAX_Q_AT_NOMINAL_V],
            networkFields: ['maxQAtNominalV'],
        },
    ],
};

export const getPrefilledColumnGroups = (equipmentType: string): PrefilledColumnGroup[] => {
    return PREFILLED_COLUMNS_CONFIG[equipmentType] ?? [];
};

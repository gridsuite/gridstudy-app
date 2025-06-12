/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { MODIFICATION_TYPES } from '@gridsuite/commons-ui';
import {
    ACTIVE_POWER_SET_POINT,
    BUS_OR_BUSBAR_SECTION_ID,
    CONNECTED,
    CONNECTION_DIRECTION,
    CONNECTION_NAME,
    CONNECTION_POSITION,
    DROOP,
    ENERGY_SOURCE,
    EQUIPMENT_ID,
    EQUIPMENT_NAME,
    FORCED_OUTAGE_RATE,
    FREQUENCY_REGULATION,
    MARGINAL_COST,
    MAX_P,
    MAX_Q,
    MAX_Q_AT_NOMINAL_V,
    MAX_SUSCEPTANCE,
    MAXIMUM_REACTIVE_POWER,
    MAXIMUM_SECTION_COUNT,
    MIN_P,
    MIN_Q,
    MINIMUM_REACTIVE_POWER,
    PARTICIPATE,
    PLANNED_ACTIVE_POWER_SET_POINT,
    PLANNED_OUTAGE_RATE,
    Q_PERCENT,
    RATED_S,
    REACTIVE_CAPABILITY_CURVE,
    REACTIVE_CAPABILITY_CURVE_P_0,
    REACTIVE_CAPABILITY_CURVE_P_MAX,
    REACTIVE_CAPABILITY_CURVE_P_MIN,
    REACTIVE_CAPABILITY_CURVE_Q_MAX_P_0,
    REACTIVE_CAPABILITY_CURVE_Q_MAX_P_MAX,
    REACTIVE_CAPABILITY_CURVE_Q_MAX_P_MIN,
    REACTIVE_CAPABILITY_CURVE_Q_MIN_P_0,
    REACTIVE_CAPABILITY_CURVE_Q_MIN_P_MAX,
    REACTIVE_CAPABILITY_CURVE_Q_MIN_P_MIN,
    REACTIVE_POWER_SET_POINT,
    REGULATING_TERMINAL_ID,
    REGULATING_TERMINAL_TYPE,
    REGULATING_TERMINAL_VOLTAGE_LEVEL_ID,
    SECTION_COUNT,
    SHUNT_COMPENSATOR_TYPE,
    STEP_UP_TRANSFORMER_REACTANCE,
    TARGET_P,
    TARGET_Q,
    TARGET_V,
    TRANSIENT_REACTANCE,
    VOLTAGE_LEVEL_ID,
    VOLTAGE_REGULATION_ON,
    VOLTAGE_SET_POINT,
    LOAD_TYPE,
    P0,
    Q0,
    REACTIVE_CAPABILITY_CURVE_POINTS,
} from 'components/utils/field-constants';
import { ReactiveCapabilityCurvePoints } from '../../reactive-limits/reactive-limits.type';

export interface TabularCreationField {
    id: string;
    required?: boolean;
    requiredIf?: { id: string };
}

export interface TabularCreationFields {
    [key: string]: TabularCreationField[];
}

const REACTIVE_CAPABILITY_CURVE_FIELDS: TabularCreationField[] = [
    { id: REACTIVE_CAPABILITY_CURVE, required: true },
    { id: REACTIVE_CAPABILITY_CURVE_P_MIN, required: false },
    { id: REACTIVE_CAPABILITY_CURVE_Q_MIN_P_MIN, required: false },
    { id: REACTIVE_CAPABILITY_CURVE_Q_MAX_P_MIN, required: false },
    { id: REACTIVE_CAPABILITY_CURVE_P_0, required: false },
    { id: REACTIVE_CAPABILITY_CURVE_Q_MIN_P_0, required: false },
    { id: REACTIVE_CAPABILITY_CURVE_Q_MAX_P_0, required: false },
    { id: REACTIVE_CAPABILITY_CURVE_P_MAX, required: false },
    { id: REACTIVE_CAPABILITY_CURVE_Q_MIN_P_MAX, required: false },
    { id: REACTIVE_CAPABILITY_CURVE_Q_MAX_P_MAX, required: false },
];

export const TABULAR_CREATION_FIELDS: TabularCreationFields = {
    GENERATOR: [
        { id: EQUIPMENT_ID, required: true },
        { id: EQUIPMENT_NAME, required: false },
        { id: ENERGY_SOURCE, required: true },
        { id: VOLTAGE_LEVEL_ID, required: true },
        { id: BUS_OR_BUSBAR_SECTION_ID, required: true },
        { id: CONNECTED, required: true },
        { id: CONNECTION_NAME, required: false },
        { id: CONNECTION_DIRECTION, required: false },
        { id: CONNECTION_POSITION, required: false },
        { id: MIN_P, required: true },
        { id: MAX_P, required: true },
        { id: RATED_S, required: false },
        { id: MINIMUM_REACTIVE_POWER, required: false },
        { id: MAXIMUM_REACTIVE_POWER, required: false },
        ...REACTIVE_CAPABILITY_CURVE_FIELDS,
        { id: ACTIVE_POWER_SET_POINT, required: false },
        { id: REACTIVE_POWER_SET_POINT, required: false },
        { id: VOLTAGE_REGULATION_ON, required: true },
        { id: VOLTAGE_SET_POINT, required: false },
        { id: REGULATING_TERMINAL_ID, required: false },
        { id: REGULATING_TERMINAL_TYPE, required: false },
        { id: REGULATING_TERMINAL_VOLTAGE_LEVEL_ID, required: false },
        { id: Q_PERCENT, required: false },
        { id: FREQUENCY_REGULATION, required: true },
        { id: DROOP, required: false },
        { id: TRANSIENT_REACTANCE, required: false },
        { id: STEP_UP_TRANSFORMER_REACTANCE, required: false },
        { id: PLANNED_ACTIVE_POWER_SET_POINT, required: false },
        { id: MARGINAL_COST, required: false },
        { id: PLANNED_OUTAGE_RATE, required: false },
        { id: FORCED_OUTAGE_RATE, required: false },
    ],
    LOAD: [
        { id: EQUIPMENT_ID, required: true },
        { id: EQUIPMENT_NAME, required: false },
        { id: LOAD_TYPE, required: true },
        { id: VOLTAGE_LEVEL_ID, required: true },
        { id: BUS_OR_BUSBAR_SECTION_ID, required: true },
        { id: CONNECTED, required: true },
        { id: CONNECTION_NAME, required: false },
        { id: CONNECTION_DIRECTION, required: false },
        { id: CONNECTION_POSITION, required: false },
        { id: P0, required: true },
        { id: Q0, required: true },
    ],
    BATTERY: [
        { id: EQUIPMENT_ID, required: true },
        { id: EQUIPMENT_NAME, required: false },
        { id: VOLTAGE_LEVEL_ID, required: true },
        { id: BUS_OR_BUSBAR_SECTION_ID, required: true },
        { id: CONNECTED, required: true },
        { id: CONNECTION_NAME, required: false },
        { id: CONNECTION_DIRECTION, required: false },
        { id: CONNECTION_POSITION, required: false },
        { id: MIN_P, required: true },
        { id: MAX_P, required: true },
        { id: MINIMUM_REACTIVE_POWER, required: false },
        { id: MAXIMUM_REACTIVE_POWER, required: false },
        ...REACTIVE_CAPABILITY_CURVE_FIELDS,
        { id: ACTIVE_POWER_SET_POINT, required: false },
        { id: REACTIVE_POWER_SET_POINT, required: false },
        { id: FREQUENCY_REGULATION, required: true },
        { id: DROOP, required: false },
    ],
    SHUNT_COMPENSATOR: [
        { id: EQUIPMENT_ID, required: true },
        { id: EQUIPMENT_NAME, required: false },
        { id: VOLTAGE_LEVEL_ID, required: true },
        { id: BUS_OR_BUSBAR_SECTION_ID, required: true },
        { id: CONNECTED, required: true },
        { id: CONNECTION_NAME, required: false },
        { id: CONNECTION_DIRECTION, required: false },
        { id: CONNECTION_POSITION, required: false },
        { id: MAXIMUM_SECTION_COUNT, required: true },
        { id: SECTION_COUNT, required: true },
        { id: SHUNT_COMPENSATOR_TYPE, requiredIf: { id: MAX_Q_AT_NOMINAL_V } },
        { id: MAX_Q_AT_NOMINAL_V, requiredIf: { id: SHUNT_COMPENSATOR_TYPE } },
        { id: MAX_SUSCEPTANCE, required: false },
    ],
};

export const TABULAR_CREATION_TYPES: { [key: string]: string } = {
    GENERATOR: MODIFICATION_TYPES.GENERATOR_CREATION.type,
    BATTERY: MODIFICATION_TYPES.BATTERY_CREATION.type,
    LOAD: MODIFICATION_TYPES.LOAD_CREATION.type,
    SHUNT_COMPENSATOR: MODIFICATION_TYPES.SHUNT_COMPENSATOR_CREATION.type,
};

const convertReactiveCapabilityCurvePointsFromBackToFront = (value: ReactiveCapabilityCurvePoints[]) => {
    const curvePoint1 = value[0];
    const curvePoint2 = value[1];
    const curvePoint3 = value[2];

    if (!curvePoint1) {
        return [];
    }

    const result = [
        {
            key: REACTIVE_CAPABILITY_CURVE_P_MIN,
            value: curvePoint1.p,
        },
        {
            key: REACTIVE_CAPABILITY_CURVE_Q_MAX_P_MIN,
            value: curvePoint1.maxQ,
        },
        {
            key: REACTIVE_CAPABILITY_CURVE_Q_MIN_P_MIN,
            value: curvePoint1.minQ,
        },
    ];

    if (curvePoint2) {
        result.push(
            { key: REACTIVE_CAPABILITY_CURVE_P_0, value: curvePoint2.p },
            { key: REACTIVE_CAPABILITY_CURVE_Q_MAX_P_0, value: curvePoint2.maxQ },
            { key: REACTIVE_CAPABILITY_CURVE_Q_MIN_P_0, value: curvePoint2.minQ }
        );
    }

    if (curvePoint3) {
        result.push(
            { key: REACTIVE_CAPABILITY_CURVE_P_MAX, value: curvePoint3.p },
            { key: REACTIVE_CAPABILITY_CURVE_Q_MAX_P_MAX, value: curvePoint3.maxQ },
            { key: REACTIVE_CAPABILITY_CURVE_Q_MIN_P_MAX, value: curvePoint3.minQ }
        );
    }

    return result;
};

export const convertCreationFieldFromBackToFront = (
    key: string,
    value:
        | {
              value: string | number | boolean;
          }
        | unknown
) => {
    switch (key) {
        case PARTICIPATE:
            return { key: FREQUENCY_REGULATION, value: value };
        case TARGET_V:
            return { key: VOLTAGE_SET_POINT, value: value };
        case TARGET_P:
            return { key: ACTIVE_POWER_SET_POINT, value: value };
        case TARGET_Q:
            return { key: REACTIVE_POWER_SET_POINT, value: value };
        case MIN_Q:
            return { key: MINIMUM_REACTIVE_POWER, value: value };
        case MAX_Q:
            return { key: MAXIMUM_REACTIVE_POWER, value: value };
        case REACTIVE_CAPABILITY_CURVE_POINTS:
            return convertReactiveCapabilityCurvePointsFromBackToFront(value as ReactiveCapabilityCurvePoints[]);
        default:
            return { key: key, value: value };
    }
};

export const convertCreationFieldFromFrontToBack = (key: string, value: string | number | boolean) => {
    switch (key) {
        case FREQUENCY_REGULATION:
            return { key: PARTICIPATE, value: value };
        case VOLTAGE_SET_POINT:
            return { key: TARGET_V, value: value };
        case ACTIVE_POWER_SET_POINT:
            return { key: TARGET_P, value: value };
        case REACTIVE_POWER_SET_POINT:
            return { key: TARGET_Q, value: value };
        case MINIMUM_REACTIVE_POWER:
            return { key: MIN_Q, value: value };
        case MAXIMUM_REACTIVE_POWER:
            return { key: MAX_Q, value: value };
        case CONNECTION_DIRECTION:
            return { key: key, value: value ?? 'UNDEFINED' };
        default:
            return { key: key, value: value };
    }
};

export const getEquipmentTypeFromCreationType = (type: string) => {
    return Object.keys(TABULAR_CREATION_TYPES).find((key) => TABULAR_CREATION_TYPES[key] === type);
};

export const styles = {
    grid: { height: 500, width: '100%' },
};

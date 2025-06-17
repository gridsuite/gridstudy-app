/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { MODIFICATION_TYPES } from '@gridsuite/commons-ui';
import {
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
    LOAD_TYPE,
    MARGINAL_COST,
    MAX_P,
    MAX_Q,
    MAX_Q_AT_NOMINAL_V,
    MAX_SUSCEPTANCE,
    MAXIMUM_SECTION_COUNT,
    MIN_P,
    MIN_Q,
    P0,
    PARTICIPATE,
    PLANNED_ACTIVE_POWER_SET_POINT,
    PLANNED_OUTAGE_RATE,
    Q0,
    Q_PERCENT,
    RATED_S,
    REACTIVE_CAPABILITY_CURVE,
    REACTIVE_CAPABILITY_CURVE_P_0,
    REACTIVE_CAPABILITY_CURVE_P_MAX,
    REACTIVE_CAPABILITY_CURVE_P_MIN,
    REACTIVE_CAPABILITY_CURVE_POINTS,
    REACTIVE_CAPABILITY_CURVE_Q_MAX_P_0,
    REACTIVE_CAPABILITY_CURVE_Q_MAX_P_MAX,
    REACTIVE_CAPABILITY_CURVE_Q_MAX_P_MIN,
    REACTIVE_CAPABILITY_CURVE_Q_MIN_P_0,
    REACTIVE_CAPABILITY_CURVE_Q_MIN_P_MAX,
    REACTIVE_CAPABILITY_CURVE_Q_MIN_P_MIN,
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
        { id: MIN_Q, required: false },
        { id: MAX_Q, required: false },
        ...REACTIVE_CAPABILITY_CURVE_FIELDS,
        { id: TARGET_P, required: false },
        { id: TARGET_Q, required: false },
        { id: VOLTAGE_REGULATION_ON, required: true },
        { id: TARGET_V, required: false },
        { id: REGULATING_TERMINAL_ID, required: false },
        { id: REGULATING_TERMINAL_TYPE, required: false },
        { id: REGULATING_TERMINAL_VOLTAGE_LEVEL_ID, required: false },
        { id: Q_PERCENT, required: false },
        { id: PARTICIPATE, required: true },
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
        { id: MIN_Q, required: false },
        { id: MAX_Q, required: false },
        ...REACTIVE_CAPABILITY_CURVE_FIELDS,
        { id: TARGET_P, required: false },
        { id: TARGET_Q, required: false },
        { id: PARTICIPATE, required: true },
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
        const isLastPoint = !curvePoint3;

        result.push(
            {
                key: isLastPoint ? REACTIVE_CAPABILITY_CURVE_P_MAX : REACTIVE_CAPABILITY_CURVE_P_0,
                value: curvePoint2.p,
            },
            {
                key: isLastPoint ? REACTIVE_CAPABILITY_CURVE_Q_MAX_P_MAX : REACTIVE_CAPABILITY_CURVE_Q_MAX_P_0,
                value: curvePoint2.maxQ,
            },
            {
                key: isLastPoint ? REACTIVE_CAPABILITY_CURVE_Q_MIN_P_MAX : REACTIVE_CAPABILITY_CURVE_Q_MIN_P_0,
                value: curvePoint2.minQ,
            }
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

export const convertReactiveCapabilityCurvePointsFromFrontToBack = (creation: Record<string, unknown>) => {
    if (creation[REACTIVE_CAPABILITY_CURVE]) {
        //Convert list data to matrix
        const rccPoints = [];
        if (creation[REACTIVE_CAPABILITY_CURVE_P_MIN] !== null) {
            rccPoints.push({
                p: creation[REACTIVE_CAPABILITY_CURVE_P_MIN],
                maxQ: creation[REACTIVE_CAPABILITY_CURVE_Q_MAX_P_MIN],
                minQ: creation[REACTIVE_CAPABILITY_CURVE_Q_MIN_P_MIN],
            });
        }
        if (creation[REACTIVE_CAPABILITY_CURVE_P_0] !== null) {
            rccPoints.push({
                p: creation[REACTIVE_CAPABILITY_CURVE_P_0],
                maxQ: creation[REACTIVE_CAPABILITY_CURVE_Q_MAX_P_0],
                minQ: creation[REACTIVE_CAPABILITY_CURVE_Q_MIN_P_0],
            });
        }
        if (creation[REACTIVE_CAPABILITY_CURVE_P_MAX] !== null) {
            rccPoints.push({
                p: creation[REACTIVE_CAPABILITY_CURVE_P_MAX],
                maxQ: creation[REACTIVE_CAPABILITY_CURVE_Q_MAX_P_MAX],
                minQ: creation[REACTIVE_CAPABILITY_CURVE_Q_MIN_P_MAX],
            });
        }
        creation[REACTIVE_CAPABILITY_CURVE_POINTS] = rccPoints;
    }
};

export const convertCreationFieldFromBackToFront = (
    key: string,
    value:
        | {
              value: string | number | boolean;
          }
        | unknown
) => {
    if (key === REACTIVE_CAPABILITY_CURVE_POINTS) {
        return convertReactiveCapabilityCurvePointsFromBackToFront(value as ReactiveCapabilityCurvePoints[]);
    } else {
        return { key: key, value: value };
    }
};

export const convertCreationFieldFromFrontToBack = (key: string, value: string | number | boolean) => {
    if (key === CONNECTION_DIRECTION) {
        return { key: key, value: value ?? 'UNDEFINED' };
    } else {
        return { key: key, value: value };
    }
};

export const getEquipmentTypeFromCreationType = (type: string) => {
    return Object.keys(TABULAR_CREATION_TYPES).find((key) => TABULAR_CREATION_TYPES[key] === type);
};

export const styles = {
    grid: { height: 500, width: '100%' },
};

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
import {
    BOOLEAN,
    CONNECTION_DIRECTIONS,
    CONNECTION_DIRECTIONS_FOR_LOAD_TABULAR_CREATION_MODIFICATION,
    ENERGY_SOURCES,
    ENUM,
    LOAD_TYPES_FOR_LOAD_TABULAR_CREATION_MODIFICATION,
    NUMBER,
    REGULATING_TERMINAL_TYPES,
    SHUNT_COMPENSATOR_TYPES,
} from '../../../network/constants';
import { convertReactiveCapabilityCurvePointsFromBackToFront, TabularField, TabularFields } from './tabular-common';

const REACTIVE_CAPABILITY_CURVE_FIELDS: TabularField[] = [
    { id: REACTIVE_CAPABILITY_CURVE, required: true, type: BOOLEAN },
    { id: REACTIVE_CAPABILITY_CURVE_P_MIN, required: false, type: NUMBER },
    { id: REACTIVE_CAPABILITY_CURVE_Q_MIN_P_MIN, required: false, type: NUMBER },
    { id: REACTIVE_CAPABILITY_CURVE_Q_MAX_P_MIN, required: false, type: NUMBER },
    { id: REACTIVE_CAPABILITY_CURVE_P_0, required: false, type: NUMBER },
    { id: REACTIVE_CAPABILITY_CURVE_Q_MIN_P_0, required: false, type: NUMBER },
    { id: REACTIVE_CAPABILITY_CURVE_Q_MAX_P_0, required: false, type: NUMBER },
    { id: REACTIVE_CAPABILITY_CURVE_P_MAX, required: false, type: NUMBER },
    { id: REACTIVE_CAPABILITY_CURVE_Q_MIN_P_MAX, required: false, type: NUMBER },
    { id: REACTIVE_CAPABILITY_CURVE_Q_MAX_P_MAX, required: false, type: NUMBER },
];

const CONNECTION_FIELDS: TabularField[] = [
    { id: CONNECTED, required: true, type: BOOLEAN },
    { id: CONNECTION_NAME, required: false },
    {
        id: CONNECTION_DIRECTION,
        required: false,
        type: ENUM,
        options: CONNECTION_DIRECTIONS.map((direction) => direction.id),
    },
    { id: CONNECTION_POSITION, required: false, type: NUMBER },
];

export const TABULAR_CREATION_FIELDS: TabularFields = {
    GENERATOR: [
        { id: EQUIPMENT_ID, required: true },
        { id: EQUIPMENT_NAME, required: false },
        { id: ENERGY_SOURCE, required: true, type: ENUM, options: ENERGY_SOURCES.map((energy) => energy.id) },
        { id: VOLTAGE_LEVEL_ID, required: true },
        { id: BUS_OR_BUSBAR_SECTION_ID, required: true },
        ...CONNECTION_FIELDS,
        { id: MIN_P, required: true, type: NUMBER },
        { id: MAX_P, required: true, type: NUMBER },
        { id: RATED_S, required: false, type: NUMBER },
        { id: MIN_Q, required: false, type: NUMBER },
        { id: MAX_Q, required: false, type: NUMBER },
        ...REACTIVE_CAPABILITY_CURVE_FIELDS,
        { id: TARGET_P, required: true, type: NUMBER },
        { id: TARGET_Q, required: true, type: NUMBER },
        { id: VOLTAGE_REGULATION_ON, required: true, type: BOOLEAN },
        { id: TARGET_V, required: false, type: NUMBER },
        { id: REGULATING_TERMINAL_ID, required: false },
        { id: REGULATING_TERMINAL_TYPE, required: false, type: ENUM, options: REGULATING_TERMINAL_TYPES },
        { id: REGULATING_TERMINAL_VOLTAGE_LEVEL_ID, required: false },
        { id: Q_PERCENT, required: false, type: NUMBER },
        { id: PARTICIPATE, required: true, type: BOOLEAN },
        { id: DROOP, required: false, type: NUMBER },
        { id: TRANSIENT_REACTANCE, required: false, type: NUMBER },
        { id: STEP_UP_TRANSFORMER_REACTANCE, required: false, type: NUMBER },
        { id: PLANNED_ACTIVE_POWER_SET_POINT, required: false, type: NUMBER },
        { id: MARGINAL_COST, required: false, type: NUMBER },
        { id: PLANNED_OUTAGE_RATE, required: false, type: NUMBER },
        { id: FORCED_OUTAGE_RATE, required: false, type: NUMBER },
    ],
    LOAD: [
        { id: EQUIPMENT_ID, required: true },
        { id: EQUIPMENT_NAME, required: false },
        {
            id: LOAD_TYPE,
            required: true,
            type: ENUM,
            options: LOAD_TYPES_FOR_LOAD_TABULAR_CREATION_MODIFICATION.map((load) => load.id),
        },
        { id: VOLTAGE_LEVEL_ID, required: true },
        { id: BUS_OR_BUSBAR_SECTION_ID, required: true },
        { id: CONNECTED, required: true, type: BOOLEAN },
        { id: CONNECTION_NAME, required: false },
        {
            id: CONNECTION_DIRECTION,
            required: false,
            type: ENUM,
            options: CONNECTION_DIRECTIONS_FOR_LOAD_TABULAR_CREATION_MODIFICATION.map((direction) => direction.id),
        },
        { id: CONNECTION_POSITION, required: false, type: NUMBER },
        { id: P0, required: true, type: NUMBER },
        { id: Q0, required: true, type: NUMBER },
    ],
    BATTERY: [
        { id: EQUIPMENT_ID, required: true },
        { id: EQUIPMENT_NAME, required: false },
        { id: VOLTAGE_LEVEL_ID, required: true },
        { id: BUS_OR_BUSBAR_SECTION_ID, required: true },
        ...CONNECTION_FIELDS,
        { id: MIN_P, required: true, type: NUMBER },
        { id: MAX_P, required: true, type: NUMBER },
        { id: MIN_Q, required: false, type: NUMBER },
        { id: MAX_Q, required: false, type: NUMBER },
        ...REACTIVE_CAPABILITY_CURVE_FIELDS,
        { id: TARGET_P, required: true, type: NUMBER },
        { id: TARGET_Q, required: true, type: NUMBER },
        { id: PARTICIPATE, required: true, type: BOOLEAN },
        { id: DROOP, required: false, type: NUMBER },
    ],
    SHUNT_COMPENSATOR: [
        { id: EQUIPMENT_ID, required: true },
        { id: EQUIPMENT_NAME, required: false },
        { id: VOLTAGE_LEVEL_ID, required: true },
        { id: BUS_OR_BUSBAR_SECTION_ID, required: true },
        ...CONNECTION_FIELDS,
        { id: MAXIMUM_SECTION_COUNT, required: true, type: NUMBER },
        { id: SECTION_COUNT, required: true, type: NUMBER },
        {
            id: SHUNT_COMPENSATOR_TYPE,
            requiredIf: { id: MAX_Q_AT_NOMINAL_V },
            type: ENUM,
            options: Object.keys(SHUNT_COMPENSATOR_TYPES),
        },
        { id: MAX_Q_AT_NOMINAL_V, requiredIf: { id: SHUNT_COMPENSATOR_TYPE }, type: NUMBER },
        { id: MAX_SUSCEPTANCE, required: false, type: NUMBER },
    ],
};

export const TABULAR_CREATION_TYPES: { [key: string]: string } = {
    GENERATOR: MODIFICATION_TYPES.GENERATOR_CREATION.type,
    BATTERY: MODIFICATION_TYPES.BATTERY_CREATION.type,
    LOAD: MODIFICATION_TYPES.LOAD_CREATION.type,
    SHUNT_COMPENSATOR: MODIFICATION_TYPES.SHUNT_COMPENSATOR_CREATION.type,
};

export const convertCreationFieldFromBackToFront = (key: string, value: any) => {
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

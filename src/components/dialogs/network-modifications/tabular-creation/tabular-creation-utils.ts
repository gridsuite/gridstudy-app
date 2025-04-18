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
    MAXIMUM_REACTIVE_POWER,
    MIN_P,
    MIN_Q,
    MINIMUM_REACTIVE_POWER,
    PARTICIPATE,
    PLANNED_ACTIVE_POWER_SET_POINT,
    PLANNED_OUTAGE_RATE,
    Q_PERCENT,
    RATED_S,
    REACTIVE_POWER_SET_POINT,
    REGULATING_TERMINAL_ID,
    REGULATING_TERMINAL_TYPE,
    REGULATING_TERMINAL_VOLTAGE_LEVEL_ID,
    STEP_UP_TRANSFORMER_REACTANCE,
    TARGET_P,
    TARGET_Q,
    TARGET_V,
    TRANSIENT_REACTANCE,
    VOLTAGE_LEVEL_ID,
    VOLTAGE_REGULATION_ON,
    VOLTAGE_SET_POINT,
} from 'components/utils/field-constants';

export interface TabularCreationField {
    id: string;
    required: boolean;
}

export interface TabularCreationFields {
    [key: string]: TabularCreationField[];
}

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
        { id: ACTIVE_POWER_SET_POINT, required: true },
        { id: REACTIVE_POWER_SET_POINT, required: true },
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
};

export const TABULAR_CREATION_TYPES: { [key: string]: string } = {
    GENERATOR: MODIFICATION_TYPES.GENERATOR_CREATION.type,
};

export const convertCreationFieldFromBackToFront = (key: string, value: { value: string | number | boolean }) => {
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

/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Option } from '@gridsuite/commons-ui';
import {
    EDITED_FIELD,
    EQUIPMENT_TYPE_FIELD,
    FILTERS,
    PROPERTY_NAME_FIELD,
    SIMPLE_MODIFICATIONS,
    VALUE_FIELD,
} from '../../../../../utils/field-constants';
import { Filter } from '../../commons/by-filter.type';

// --- types for the configuration, see the constants file --- //

export enum DataType {
    ENUM = 'ENUM',
    BOOLEAN = 'BOOLEAN',
    INTEGER = 'INTEGER',
    DOUBLE = 'DOUBLE',
    PROPERTY = 'PROPERTY',
}

export type FieldOptionType = {
    id: string;
    label: string;
    dataType: DataType;
    values?: Option[];
};

export enum FieldType {
    PROPERTY = 'PROPERTY',
    RATED_NOMINAL_POWER = 'RATED_NOMINAL_POWER',
    MINIMUM_ACTIVE_POWER = 'MINIMUM_ACTIVE_POWER',
    MAXIMUM_ACTIVE_POWER = 'MAXIMUM_ACTIVE_POWER',
    ACTIVE_POWER_SET_POINT = 'ACTIVE_POWER_SET_POINT',
    REACTIVE_POWER_SET_POINT = 'REACTIVE_POWER_SET_POINT',
    VOLTAGE_SET_POINT = 'VOLTAGE_SET_POINT',
    PLANNED_ACTIVE_POWER_SET_POINT = 'PLANNED_ACTIVE_POWER_SET_POINT',
    MARGINAL_COST = 'MARGINAL_COST',
    PLANNED_OUTAGE_RATE = 'PLANNED_OUTAGE_RATE',
    FORCED_OUTAGE_RATE = 'FORCED_OUTAGE_RATE',
    DROOP = 'DROOP',
    TRANSIENT_REACTANCE = 'TRANSIENT_REACTANCE',
    STEP_UP_TRANSFORMER_REACTANCE = 'STEP_UP_TRANSFORMER_REACTANCE',
    Q_PERCENT = 'Q_PERCENT',
    VOLTAGE_REGULATOR_ON = 'VOLTAGE_REGULATOR_ON',
    MAXIMUM_SECTION_COUNT = 'MAXIMUM_SECTION_COUNT',
    SECTION_COUNT = 'SECTION_COUNT',
    MAXIMUM_SUSCEPTANCE = 'MAXIMUM_SUSCEPTANCE',
    MAXIMUM_Q_AT_NOMINAL_VOLTAGE = 'MAXIMUM_Q_AT_NOMINAL_VOLTAGE',
    NOMINAL_VOLTAGE = 'NOMINAL_VOLTAGE',
    LOW_VOLTAGE_LIMIT = 'LOW_VOLTAGE_LIMIT',
    HIGH_VOLTAGE_LIMIT = 'HIGH_VOLTAGE_LIMIT',
    LOW_SHORT_CIRCUIT_CURRENT_LIMIT = 'LOW_SHORT_CIRCUIT_CURRENT_LIMIT',
    HIGH_SHORT_CIRCUIT_CURRENT_LIMIT = 'HIGH_SHORT_CIRCUIT_CURRENT_LIMIT',
    ACTIVE_POWER = 'ACTIVE_POWER',
    REACTIVE_POWER = 'REACTIVE_POWER',
    R = 'R',
    X = 'X',
    G = 'G',
    B = 'B',
    RATED_U1 = 'RATED_U1',
    RATED_U2 = 'RATED_U2',
    RATED_S = 'RATED_S',
    TARGET_V = 'TARGET_V',
    RATIO_LOW_TAP_POSITION = 'RATIO_LOW_TAP_POSITION',
    RATIO_TAP_POSITION = 'RATIO_TAP_POSITION',
    RATIO_TARGET_DEADBAND = 'RATIO_TARGET_DEADBAND',
    REGULATION_VALUE = 'REGULATION_VALUE',
    PHASE_LOW_TAP_POSITION = 'PHASE_LOW_TAP_POSITION',
    PHASE_TAP_POSITION = 'PHASE_TAP_POSITION',
    PHASE_TARGET_DEADBAND = 'PHASE_TARGET_DEADBAND',
    LOAD_TYPE = 'LOAD_TYPE',
}

// --- types for the form model --- //

export type SimpleModification = {
    [FILTERS]: Filter[];
    [EDITED_FIELD]: string;
    [VALUE_FIELD]: string | number | boolean;
    [PROPERTY_NAME_FIELD]?: string;
};

export type BySimpleModification = {
    [EQUIPMENT_TYPE_FIELD]: string;
    [SIMPLE_MODIFICATIONS]: SimpleModification[];
};

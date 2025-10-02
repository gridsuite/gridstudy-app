/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { SetRequired } from 'type-fest';
import type { UUID } from 'crypto';
import { DataType, CombinatorType, OperatorType } from '@gridsuite/commons-ui';
import { type AbstractFilter, FilterType } from './filter';

export type ExpertFilter = AbstractFilter & {
    readonly type: FilterType.EXPERT;
    rules: ExpertRule; // mismatch: plural name but not an array
    topologyKind?: TopologyKind;
};

export enum TopologyKind {
    NODE_BREAKER = 'NODE_BREAKER',
    BUS_BREAKER = 'BUS_BREAKER',
}

export type ExpertRule =
    | BooleanExpertRule
    | CombinatorExpertRule
    | StringExpertRule
    | EnumExpertRule
    | FilterUuidExpertRule
    | NumberExpertRule
    | PropertiesExpertRule;

export type AbstractExpertRule = {
    dataType: DataType; // discriminator field
    operator?: OperatorType; // restricted support depending on the datatype
    // following fields depends on the implementing type but are always present in server implementation
    combinator?: CombinatorType;
    field?: ExpertFilterFieldType;
    rules?: ExpertRule[];
};

export enum ExpertFilterFieldType {
    ID = 'ID',
    NAME = 'NAME',
    NOMINAL_VOLTAGE = 'NOMINAL_VOLTAGE',
    MIN_P = 'MIN_P',
    MAX_P = 'MAX_P',
    P = 'P',
    Q = 'Q',
    P_ABSOLUTE = 'P_ABSOLUTE',
    Q_ABSOLUTE = 'Q_ABSOLUTE',
    TARGET_P = 'TARGET_P',
    TARGET_V = 'TARGET_V',
    TARGET_Q = 'TARGET_Q',
    ENERGY_SOURCE = 'ENERGY_SOURCE',
    COUNTRY = 'COUNTRY',
    VOLTAGE_REGULATOR_ON = 'VOLTAGE_REGULATOR_ON',
    PLANNED_ACTIVE_POWER_SET_POINT = 'PLANNED_ACTIVE_POWER_SET_POINT',
    VOLTAGE_LEVEL_ID = 'VOLTAGE_LEVEL_ID',
    CONNECTED = 'CONNECTED',
    RATED_S = 'RATED_S',
    RATED_S1 = 'RATED_S1',
    RATED_S2 = 'RATED_S2',
    RATED_S3 = 'RATED_S3',
    MARGINAL_COST = 'MARGINAL_COST',
    PLANNED_OUTAGE_RATE = 'PLANNED_OUTAGE_RATE',
    FORCED_OUTAGE_RATE = 'FORCED_OUTAGE_RATE',
    P0 = 'P0',
    Q0 = 'Q0',
    LOW_VOLTAGE_LIMIT = 'LOW_VOLTAGE_LIMIT',
    HIGH_VOLTAGE_LIMIT = 'HIGH_VOLTAGE_LIMIT',
    SECTION_COUNT = 'SECTION_COUNT',
    MAXIMUM_SECTION_COUNT = 'MAXIMUM_SECTION_COUNT',
    SHUNT_COMPENSATOR_TYPE = 'SHUNT_COMPENSATOR_TYPE',
    MAX_Q_AT_NOMINAL_V = 'MAX_Q_AT_NOMINAL_V',
    MIN_Q_AT_NOMINAL_V = 'MIN_Q_AT_NOMINAL_V',
    FIX_Q_AT_NOMINAL_V = 'FIX_Q_AT_NOMINAL_V',
    SWITCHED_ON_Q_AT_NOMINAL_V = 'SWITCHED_ON_Q_AT_NOMINAL_V',
    MAX_SUSCEPTANCE = 'MAX_SUSCEPTANCE',
    MIN_SUSCEPTANCE = 'MIN_SUSCEPTANCE',
    SWITCHED_ON_SUSCEPTANCE = 'SWITCHED_ON_SUSCEPTANCE',
    CONNECTED_1 = 'CONNECTED_1',
    CONNECTED_2 = 'CONNECTED_2',
    CONNECTED_3 = 'CONNECTED_3',
    VOLTAGE_LEVEL_ID_1 = 'VOLTAGE_LEVEL_ID_1',
    VOLTAGE_LEVEL_ID_2 = 'VOLTAGE_LEVEL_ID_2',
    VOLTAGE_LEVEL_ID_3 = 'VOLTAGE_LEVEL_ID_3',
    NOMINAL_VOLTAGE_1 = 'NOMINAL_VOLTAGE_1',
    NOMINAL_VOLTAGE_2 = 'NOMINAL_VOLTAGE_2',
    NOMINAL_VOLTAGE_3 = 'NOMINAL_VOLTAGE_3',
    RATED_VOLTAGE_0 = 'RATED_VOLTAGE_0',
    RATED_VOLTAGE_1 = 'RATED_VOLTAGE_1',
    RATED_VOLTAGE_2 = 'RATED_VOLTAGE_2',
    RATED_VOLTAGE_3 = 'RATED_VOLTAGE_3',
    COUNTRY_1 = 'COUNTRY_1',
    COUNTRY_2 = 'COUNTRY_2',
    SERIE_RESISTANCE = 'SERIE_RESISTANCE',
    SERIE_RESISTANCE_1 = 'SERIE_RESISTANCE_1',
    SERIE_RESISTANCE_2 = 'SERIE_RESISTANCE_2',
    SERIE_RESISTANCE_3 = 'SERIE_RESISTANCE_3',
    SERIE_REACTANCE = 'SERIE_REACTANCE',
    SHUNT_SUSCEPTANCE = 'SHUNT_SUSCEPTANCE',
    SHUNT_CONDUCTANCE = 'SHUNT_CONDUCTANCE',
    SERIE_REACTANCE_1 = 'SERIE_REACTANCE_1',
    SERIE_REACTANCE_2 = 'SERIE_REACTANCE_2',
    SERIE_REACTANCE_3 = 'SERIE_REACTANCE_3',
    SHUNT_CONDUCTANCE_1 = 'SHUNT_CONDUCTANCE_1',
    SHUNT_CONDUCTANCE_2 = 'SHUNT_CONDUCTANCE_2',
    SHUNT_SUSCEPTANCE_1 = 'SHUNT_SUSCEPTANCE_1',
    SHUNT_SUSCEPTANCE_2 = 'SHUNT_SUSCEPTANCE_2',
    MAGNETIZING_CONDUCTANCE = 'MAGNETIZING_CONDUCTANCE',
    MAGNETIZING_CONDUCTANCE_1 = 'MAGNETIZING_CONDUCTANCE_1',
    MAGNETIZING_CONDUCTANCE_2 = 'MAGNETIZING_CONDUCTANCE_2',
    MAGNETIZING_CONDUCTANCE_3 = 'MAGNETIZING_CONDUCTANCE_3',
    MAGNETIZING_SUSCEPTANCE = 'MAGNETIZING_SUSCEPTANCE',
    MAGNETIZING_SUSCEPTANCE_1 = 'MAGNETIZING_SUSCEPTANCE_1',
    MAGNETIZING_SUSCEPTANCE_2 = 'MAGNETIZING_SUSCEPTANCE_2',
    MAGNETIZING_SUSCEPTANCE_3 = 'MAGNETIZING_SUSCEPTANCE_3',
    LOAD_TYPE = 'LOAD_TYPE',
    HAS_RATIO_TAP_CHANGER = 'HAS_RATIO_TAP_CHANGER',
    HAS_RATIO_TAP_CHANGER_1 = 'HAS_RATIO_TAP_CHANGER_1',
    HAS_RATIO_TAP_CHANGER_2 = 'HAS_RATIO_TAP_CHANGER_2',
    HAS_RATIO_TAP_CHANGER_3 = 'HAS_RATIO_TAP_CHANGER_3',
    LOAD_TAP_CHANGING_CAPABILITIES = 'LOAD_TAP_CHANGING_CAPABILITIES',
    LOAD_TAP_CHANGING_CAPABILITIES_1 = 'LOAD_TAP_CHANGING_CAPABILITIES_1',
    LOAD_TAP_CHANGING_CAPABILITIES_2 = 'LOAD_TAP_CHANGING_CAPABILITIES_2',
    LOAD_TAP_CHANGING_CAPABILITIES_3 = 'LOAD_TAP_CHANGING_CAPABILITIES_3',
    RATIO_REGULATION_MODE = 'RATIO_REGULATION_MODE',
    RATIO_REGULATION_MODE_1 = 'RATIO_REGULATION_MODE_1',
    RATIO_REGULATION_MODE_2 = 'RATIO_REGULATION_MODE_2',
    RATIO_REGULATION_MODE_3 = 'RATIO_REGULATION_MODE_3',
    RATIO_TARGET_V = 'RATIO_TARGET_V',
    RATIO_TARGET_V1 = 'RATIO_TARGET_V1',
    RATIO_TARGET_V2 = 'RATIO_TARGET_V2',
    RATIO_TARGET_V3 = 'RATIO_TARGET_V3',
    HAS_PHASE_TAP_CHANGER = 'HAS_PHASE_TAP_CHANGER',
    HAS_PHASE_TAP_CHANGER_1 = 'HAS_PHASE_TAP_CHANGER_1',
    HAS_PHASE_TAP_CHANGER_2 = 'HAS_PHASE_TAP_CHANGER_2',
    HAS_PHASE_TAP_CHANGER_3 = 'HAS_PHASE_TAP_CHANGER_3',
    PHASE_REGULATION_MODE = 'PHASE_REGULATION_MODE',
    PHASE_REGULATION_MODE_1 = 'PHASE_REGULATION_MODE_1',
    PHASE_REGULATION_MODE_2 = 'PHASE_REGULATION_MODE_2',
    PHASE_REGULATION_MODE_3 = 'PHASE_REGULATION_MODE_3',
    PHASE_REGULATION_VALUE = 'PHASE_REGULATION_VALUE',
    PHASE_REGULATION_VALUE_1 = 'PHASE_REGULATION_VALUE_1',
    PHASE_REGULATION_VALUE_2 = 'PHASE_REGULATION_VALUE_2',
    PHASE_REGULATION_VALUE_3 = 'PHASE_REGULATION_VALUE_3',
    FREE_PROPERTIES = 'FREE_PROPERTIES',
    SUBSTATION_PROPERTIES = 'SUBSTATION_PROPERTIES',
    SUBSTATION_PROPERTIES_1 = 'SUBSTATION_PROPERTIES_1',
    SUBSTATION_PROPERTIES_2 = 'SUBSTATION_PROPERTIES_2',
    SUBSTATION_PROPERTIES_3 = 'SUBSTATION_PROPERTIES_3', // this FieldType value is obsolete but kept here to avoid crashes in case of remaining filters using it
    VOLTAGE_LEVEL_PROPERTIES = 'VOLTAGE_LEVEL_PROPERTIES',
    VOLTAGE_LEVEL_PROPERTIES_1 = 'VOLTAGE_LEVEL_PROPERTIES_1',
    VOLTAGE_LEVEL_PROPERTIES_2 = 'VOLTAGE_LEVEL_PROPERTIES_2',
    VOLTAGE_LEVEL_PROPERTIES_3 = 'VOLTAGE_LEVEL_PROPERTIES_3',
    SVAR_REGULATION_MODE = 'SVAR_REGULATION_MODE',
    VOLTAGE_SET_POINT = 'VOLTAGE_SET_POINT',
    REACTIVE_POWER_SET_POINT = 'REACTIVE_POWER_SET_POINT',
    ACTIVE_POWER_SET_POINT = 'ACTIVE_POWER_SET_POINT',
    REMOTE_REGULATED_TERMINAL = 'REMOTE_REGULATED_TERMINAL', // group criteria of REGULATING_TERMINAL_VL_ID and/or REGULATING_TERMINAL_CONNECTABLE_ID
    REGULATING_TERMINAL_VL_ID = 'REGULATING_TERMINAL_VL_ID',
    REGULATING_TERMINAL_CONNECTABLE_ID = 'REGULATING_TERMINAL_CONNECTABLE_ID',
    REGULATION_TYPE = 'REGULATION_TYPE',
    AUTOMATE = 'AUTOMATE',
    LOW_VOLTAGE_SET_POINT = 'LOW_VOLTAGE_SET_POINT',
    HIGH_VOLTAGE_SET_POINT = 'HIGH_VOLTAGE_SET_POINT',
    LOW_VOLTAGE_THRESHOLD = 'LOW_VOLTAGE_THRESHOLD',
    HIGH_VOLTAGE_THRESHOLD = 'HIGH_VOLTAGE_THRESHOLD',
    SUSCEPTANCE_FIX = 'SUSCEPTANCE_FIX',
    PAIRED = 'PAIRED',
    PAIRING_KEY = 'PAIRING_KEY',
    TIE_LINE_ID = 'TIE_LINE_ID',
    CONVERTERS_MODE = 'CONVERTERS_MODE',
    CONVERTER_STATION_ID_1 = 'CONVERTER_STATION_ID_1',
    CONVERTER_STATION_NOMINAL_VOLTAGE_1 = 'CONVERTER_STATION_NOMINAL_VOLTAGE_1',
    CONVERTER_STATION_ID_2 = 'CONVERTER_STATION_ID_2',
    CONVERTER_STATION_NOMINAL_VOLTAGE_2 = 'CONVERTER_STATION_NOMINAL_VOLTAGE_2',
    DC_NOMINAL_VOLTAGE = 'DC_NOMINAL_VOLTAGE',
    LOW_SHORT_CIRCUIT_CURRENT_LIMIT = 'LOW_SHORT_CIRCUIT_CURRENT_LIMIT',
    HIGH_SHORT_CIRCUIT_CURRENT_LIMIT = 'HIGH_SHORT_CIRCUIT_CURRENT_LIMIT',
    SUBSTATION_ID = 'SUBSTATION_ID',
    SUBSTATION_ID_1 = 'SUBSTATION_ID_1',
    SUBSTATION_ID_2 = 'SUBSTATION_ID_2',
}

export type EmptyOperatorsType = OperatorType.EXISTS | OperatorType.NOT_EXISTS;

export type MultipleOperatorsType =
    | OperatorType.IN
    | OperatorType.NOT_IN
    | OperatorType.BETWEEN
    | OperatorType.IS_PART_OF
    | OperatorType.IS_NOT_PART_OF;

export type SingleOperatorsType = Exclude<OperatorType, MultipleOperatorsType | EmptyOperatorsType>;

export type IsMultipleCriteriaOperator<O extends OperatorType> = O extends MultipleOperatorsType ? true : false;

export function isMultipleCriteriaOperator(operator: OperatorType): operator is MultipleOperatorsType {
    return (
        operator === OperatorType.IN ||
        operator === OperatorType.NOT_IN ||
        operator === OperatorType.BETWEEN ||
        operator === OperatorType.IS_PART_OF ||
        operator === OperatorType.IS_NOT_PART_OF
    );
}

export type BooleanExpertRule = SetRequired<AbstractExpertRule, 'field'> & {
    readonly dataType: DataType.BOOLEAN;
    operator: OperatorType.EQUALS | OperatorType.NOT_EQUALS | OperatorType.EXISTS | OperatorType.NOT_EXISTS;
    value: boolean;
};

export type CombinatorExpertRule = SetRequired<AbstractExpertRule, 'combinator' | 'rules'> & {
    readonly dataType: DataType.COMBINATOR;
};

type VariableValueExpertRule<T, D extends DataType, O extends OperatorType> = { readonly dataType: D } & (
    | {
          operator: Extract<O, MultipleOperatorsType>;
          value?: never;
          values: T[]; //Set<T>
      }
    | {
          operator: Extract<O, SingleOperatorsType>;
          value: T;
          values?: never;
      }
    | {
          operator: Extract<O, EmptyOperatorsType>;
          value?: never;
          values?: never;
      }
);

export type StringExpertRule = SetRequired<AbstractExpertRule, 'field'> &
    VariableValueExpertRule<
        string,
        DataType.STRING,
        | OperatorType.IS
        | OperatorType.CONTAINS
        | OperatorType.BEGINS_WITH
        | OperatorType.ENDS_WITH
        | OperatorType.EXISTS
        | OperatorType.NOT_EXISTS
        | OperatorType.IN
        | OperatorType.NOT_IN
    >;

export type EnumExpertRule<E extends string = string> = SetRequired<AbstractExpertRule, 'field'> &
    VariableValueExpertRule<
        E,
        DataType.ENUM,
        OperatorType.EQUALS | OperatorType.NOT_EQUALS | OperatorType.IN | OperatorType.NOT_IN
    >;

export type FilterUuidExpertRule = SetRequired<AbstractExpertRule, 'field'> &
    VariableValueExpertRule<UUID, DataType.FILTER_UUID, OperatorType.IS_PART_OF | OperatorType.IS_NOT_PART_OF>;

export type NumberExpertRule = SetRequired<AbstractExpertRule, 'field'> &
    VariableValueExpertRule<
        number,
        DataType.NUMBER,
        | OperatorType.EQUALS
        | OperatorType.GREATER_OR_EQUALS
        | OperatorType.GREATER
        | OperatorType.LOWER_OR_EQUALS
        | OperatorType.LOWER
        | OperatorType.BETWEEN
        | OperatorType.EXISTS
        | OperatorType.NOT_EXISTS
        | OperatorType.IN
        | OperatorType.NOT_IN
    >;

export type PropertiesExpertRule = SetRequired<AbstractExpertRule, 'field'> & {
    readonly dataType: DataType.PROPERTY;
    operator: OperatorType.IN | OperatorType.NOT_IN;
    propertyName: string;
    propertyValues: string[];
};

/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

// TODO this file is duplicated from the gridexplore-app => to be merged when merging two projects
export enum OperatorType {
    EQUALS = 'EQUALS',
    NOT_EQUALS = 'NOT_EQUALS',
    LOWER = 'LOWER',
    LOWER_OR_EQUALS = 'LOWER_OR_EQUALS',
    GREATER = 'GREATER',
    GREATER_OR_EQUALS = 'GREATER_OR_EQUALS',
    IS = 'IS',
    CONTAINS = 'CONTAINS',
    BEGINS_WITH = 'BEGINS_WITH',
    ENDS_WITH = 'ENDS_WITH',
    EXISTS = 'EXISTS',
    IN = 'IN',
    NOT_IN = 'NOT_IN',
    IS_PART_OF = 'IS_PART_OF',
}

export enum CombinatorType {
    AND = 'AND',
    OR = 'OR',
}

export enum FieldType {
    ID = 'ID',
    NAME = 'NAME',
    NOMINAL_VOLTAGE = 'NOMINAL_VOLTAGE',
    NOMINAL_VOLTAGE_1 = 'NOMINAL_VOLTAGE_1',
    NOMINAL_VOLTAGE_2 = 'NOMINAL_VOLTAGE_2',
    NOMINAL_VOLTAGE_3 = 'NOMINAL_VOLTAGE_3',
    MIN_P = 'MIN_P',
    MAX_P = 'MAX_P',
    TARGET_V = 'TARGET_V',
    TARGET_P = 'TARGET_P',
    TARGET_Q = 'TARGET_Q',
    ENERGY_SOURCE = 'ENERGY_SOURCE',
    COUNTRY = 'COUNTRY',
    COUNTRY_1 = 'COUNTRY_1',
    COUNTRY_2 = 'COUNTRY_2',
    FREE_PROPERTIES = 'FREE_PROPERTIES',
    SUBSTATION_PROPERTIES = 'SUBSTATION_PROPERTIES',
    SUBSTATION_PROPERTIES_1 = 'SUBSTATION_PROPERTIES_1',
    SUBSTATION_PROPERTIES_2 = 'SUBSTATION_PROPERTIES_2',
    SUBSTATION_PROPERTIES_3 = 'SUBSTATION_PROPERTIES_3',
    VOLTAGE_REGULATOR_ON = 'VOLTAGE_REGULATOR_ON',
    PLANNED_ACTIVE_POWER_SET_POINT = 'PLANNED_ACTIVE_POWER_SET_POINT',
    VOLTAGE_LEVEL_ID = 'VOLTAGE_LEVEL_ID',
}

export enum DataType {
    STRING = 'STRING',
    ENUM = 'ENUM',
    NUMBER = 'NUMBER',
    BOOLEAN = 'BOOLEAN',
    COMBINATOR = 'COMBINATOR',
    FILTER_UUID = 'FILTER_UUID',
    PROPERTIES = 'PROPERTIES',
}

export interface RuleTypeExport {
    field: FieldType;
    operator: OperatorType;
    value: string | number;
    dataType: DataType;
}

export interface RuleGroupTypeExport {
    combinator: CombinatorType;
    dataType: DataType;
    rules: (RuleTypeExport | RuleGroupTypeExport)[];
}

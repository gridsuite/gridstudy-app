/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { ReadonlyDeep } from 'type-fest';
import { DataType, FieldOptionType, FieldType } from './assignment.type';
import { LOAD_TYPES } from '../../../../../network/constants';
import { EquipmentType, kiloUnitToUnit, microUnitToUnit, unitToKiloUnit, unitToMicroUnit } from '@gridsuite/commons-ui';
import { KILO_AMPERE, MICRO_SIEMENS } from '../../../../../utils/field-constants';

export const FIELD_OPTIONS = {
    PROPERTY: {
        id: FieldType.PROPERTY,
        label: 'Property',
        dataType: DataType.PROPERTY,
    },
    RATED_NOMINAL_POWER: {
        id: FieldType.RATED_NOMINAL_POWER,
        label: 'RatedNominalPowerText',
        dataType: DataType.DOUBLE,
    },
    MINIMUM_ACTIVE_POWER: {
        id: FieldType.MINIMUM_ACTIVE_POWER,
        label: 'MinimumActivePowerText',
        dataType: DataType.DOUBLE,
    },
    MAXIMUM_ACTIVE_POWER: {
        id: FieldType.MAXIMUM_ACTIVE_POWER,
        label: 'MaximumActivePowerText',
        dataType: DataType.DOUBLE,
    },
    ACTIVE_POWER_SET_POINT: {
        id: FieldType.ACTIVE_POWER_SET_POINT,
        label: 'ActivePowerText',
        dataType: DataType.DOUBLE,
    },
    REACTIVE_POWER_SET_POINT: {
        id: FieldType.REACTIVE_POWER_SET_POINT,
        label: 'ReactivePowerText',
        dataType: DataType.DOUBLE,
    },
    VOLTAGE_SET_POINT: {
        id: FieldType.VOLTAGE_SET_POINT,
        label: 'GeneratorTargetV',
        dataType: DataType.DOUBLE,
    },
    PLANNED_ACTIVE_POWER_SET_POINT: {
        id: FieldType.PLANNED_ACTIVE_POWER_SET_POINT,
        label: 'PlannedActivePowerSetPointForm',
        dataType: DataType.DOUBLE,
    },
    MARGINAL_COST: {
        id: FieldType.MARGINAL_COST,
        label: 'marginalCost',
        dataType: DataType.DOUBLE,
    },
    PLANNED_OUTAGE_RATE: {
        id: FieldType.PLANNED_OUTAGE_RATE,
        label: 'plannedOutageRate',
        dataType: DataType.DOUBLE,
    },
    FORCED_OUTAGE_RATE: {
        id: FieldType.FORCED_OUTAGE_RATE,
        label: 'forcedOutageRate',
        dataType: DataType.DOUBLE,
    },
    DROOP: {
        id: FieldType.DROOP,
        label: 'ActivePowerRegulationDroop',
        dataType: DataType.DOUBLE,
    },
    TRANSIENT_REACTANCE: {
        id: FieldType.TRANSIENT_REACTANCE,
        label: 'TransientReactanceForm',
        dataType: DataType.DOUBLE,
    },
    STEP_UP_TRANSFORMER_REACTANCE: {
        id: FieldType.STEP_UP_TRANSFORMER_REACTANCE,
        label: 'TransformerReactanceForm',
        dataType: DataType.DOUBLE,
    },
    Q_PERCENT: {
        id: FieldType.Q_PERCENT,
        label: 'ReactivePercentageVoltageRegulation',
        dataType: DataType.DOUBLE,
    },
    VOLTAGE_REGULATOR_ON: {
        id: FieldType.VOLTAGE_REGULATOR_ON,
        label: 'voltageRegulationOn',
        dataType: DataType.BOOLEAN,
    },
    MAXIMUM_SECTION_COUNT: {
        id: FieldType.MAXIMUM_SECTION_COUNT,
        label: 'maximumSectionCount',
        dataType: DataType.INTEGER,
    },
    SECTION_COUNT: {
        id: FieldType.SECTION_COUNT,
        label: 'sectionCount',
        dataType: DataType.INTEGER,
    },
    MAX_SUSCEPTANCE: {
        id: FieldType.MAX_SUSCEPTANCE,
        label: 'maxSusceptance',
        unit: MICRO_SIEMENS,
        dataType: DataType.DOUBLE,
        outputConverter: (value) => microUnitToUnit(value),
        inputConverter: (value) => unitToMicroUnit(value),
    },
    MAX_Q_AT_NOMINAL_V: {
        id: FieldType.MAX_Q_AT_NOMINAL_V,
        label: 'maxQAtNominalV',
        unit: MICRO_SIEMENS,
        dataType: DataType.DOUBLE,
        outputConverter: (value) => microUnitToUnit(value),
        inputConverter: (value) => unitToMicroUnit(value),
    },
    NOMINAL_VOLTAGE: {
        id: FieldType.NOMINAL_VOLTAGE,
        label: 'NominalVoltage',
        dataType: DataType.DOUBLE,
    },
    LOW_VOLTAGE_LIMIT: {
        id: FieldType.LOW_VOLTAGE_LIMIT,
        label: 'LowVoltageLimit',
        dataType: DataType.DOUBLE,
    },
    HIGH_VOLTAGE_LIMIT: {
        id: FieldType.HIGH_VOLTAGE_LIMIT,
        label: 'HighVoltageLimit',
        dataType: DataType.DOUBLE,
    },
    LOW_SHORT_CIRCUIT_CURRENT_LIMIT: {
        id: FieldType.LOW_SHORT_CIRCUIT_CURRENT_LIMIT,
        label: 'LowShortCircuitCurrentLimit',
        unit: KILO_AMPERE,
        dataType: DataType.DOUBLE,
        outputConverter: (value) => kiloUnitToUnit(value),
        inputConverter: (value) => unitToKiloUnit(value),
    },
    HIGH_SHORT_CIRCUIT_CURRENT_LIMIT: {
        id: FieldType.HIGH_SHORT_CIRCUIT_CURRENT_LIMIT,
        label: 'HighShortCircuitCurrentLimit',
        unit: KILO_AMPERE,
        dataType: DataType.DOUBLE,
        outputConverter: (value) => kiloUnitToUnit(value),
        inputConverter: (value) => unitToKiloUnit(value),
    },
    ACTIVE_POWER: {
        id: FieldType.ACTIVE_POWER,
        label: 'ActivePowerText',
        dataType: DataType.DOUBLE,
    },
    REACTIVE_POWER: {
        id: FieldType.REACTIVE_POWER,
        label: 'ReactivePowerText',
        dataType: DataType.DOUBLE,
    },
    R: {
        id: FieldType.R,
        label: 'SeriesResistanceText',
        dataType: DataType.DOUBLE,
    },
    X: {
        id: FieldType.X,
        label: 'SeriesReactanceText',
        dataType: DataType.DOUBLE,
    },
    G: {
        id: FieldType.G,
        label: 'G',
        unit: MICRO_SIEMENS,
        dataType: DataType.DOUBLE,
        outputConverter: (value) => microUnitToUnit(value),
        inputConverter: (value) => unitToMicroUnit(value),
    },
    B: {
        id: FieldType.B,
        label: 'B',
        unit: MICRO_SIEMENS,
        dataType: DataType.DOUBLE,
        outputConverter: (value) => microUnitToUnit(value),
        inputConverter: (value) => unitToMicroUnit(value),
    },
    RATED_U1: {
        id: FieldType.RATED_U1,
        label: 'RatedU1',
        dataType: DataType.DOUBLE,
    },
    RATED_U2: {
        id: FieldType.RATED_U2,
        label: 'RatedU2',
        dataType: DataType.DOUBLE,
    },
    RATED_S: {
        id: FieldType.RATED_S,
        label: 'RatedNominalPowerText',
        dataType: DataType.DOUBLE,
    },
    TARGET_V: {
        id: FieldType.TARGET_V,
        label: 'RatioTargetV',
        dataType: DataType.DOUBLE,
    },
    RATIO_LOW_TAP_POSITION: {
        id: FieldType.RATIO_LOW_TAP_POSITION,
        label: 'RatioLowTapPosition',
        dataType: DataType.INTEGER,
    },
    RATIO_TAP_POSITION: {
        id: FieldType.RATIO_TAP_POSITION,
        label: 'RatioTapPosition',
        dataType: DataType.INTEGER,
    },
    RATIO_TARGET_DEADBAND: {
        id: FieldType.RATIO_TARGET_DEADBAND,
        label: 'RatioDeadBand',
        dataType: DataType.DOUBLE,
    },
    REGULATION_VALUE: {
        id: FieldType.REGULATION_VALUE,
        label: 'PhaseRegulatingValue',
        dataType: DataType.DOUBLE,
    },
    PHASE_LOW_TAP_POSITION: {
        id: FieldType.PHASE_LOW_TAP_POSITION,
        label: 'PhaseLowTapPosition',
        dataType: DataType.INTEGER,
    },
    PHASE_TAP_POSITION: {
        id: FieldType.PHASE_TAP_POSITION,
        label: 'PhaseTapPosition',
        dataType: DataType.INTEGER,
    },
    PHASE_TARGET_DEADBAND: {
        id: FieldType.PHASE_TARGET_DEADBAND,
        label: 'PhaseDeadBand',
        dataType: DataType.DOUBLE,
    },
    LOAD_TYPE: {
        id: FieldType.LOAD_TYPE,
        label: 'loadType',
        dataType: DataType.ENUM,
        values: LOAD_TYPES,
    },
} as const satisfies Record<string, ReadonlyDeep<FieldOptionType>>;

export const EQUIPMENTS_FIELDS = {
    [EquipmentType.SUBSTATION]: [FIELD_OPTIONS.PROPERTY],
    [EquipmentType.VOLTAGE_LEVEL]: [
        FIELD_OPTIONS.PROPERTY,
        FIELD_OPTIONS.NOMINAL_VOLTAGE,
        FIELD_OPTIONS.LOW_VOLTAGE_LIMIT,
        FIELD_OPTIONS.HIGH_VOLTAGE_LIMIT,
        FIELD_OPTIONS.LOW_SHORT_CIRCUIT_CURRENT_LIMIT,
        FIELD_OPTIONS.HIGH_SHORT_CIRCUIT_CURRENT_LIMIT,
    ],
    [EquipmentType.LINE]: [FIELD_OPTIONS.PROPERTY],
    [EquipmentType.TWO_WINDINGS_TRANSFORMER]: [
        FIELD_OPTIONS.PROPERTY,
        FIELD_OPTIONS.R,
        FIELD_OPTIONS.X,
        FIELD_OPTIONS.G,
        FIELD_OPTIONS.B,
        FIELD_OPTIONS.RATED_U1,
        FIELD_OPTIONS.RATED_U2,
        FIELD_OPTIONS.RATED_S,
        FIELD_OPTIONS.TARGET_V,
        FIELD_OPTIONS.RATIO_LOW_TAP_POSITION,
        FIELD_OPTIONS.RATIO_TAP_POSITION,
        FIELD_OPTIONS.RATIO_TARGET_DEADBAND,
        FIELD_OPTIONS.REGULATION_VALUE,
        FIELD_OPTIONS.PHASE_LOW_TAP_POSITION,
        FIELD_OPTIONS.PHASE_TAP_POSITION,
        FIELD_OPTIONS.PHASE_TARGET_DEADBAND,
    ],
    [EquipmentType.THREE_WINDINGS_TRANSFORMER]: [FIELD_OPTIONS.PROPERTY],
    [EquipmentType.GENERATOR]: [
        FIELD_OPTIONS.PROPERTY,
        FIELD_OPTIONS.VOLTAGE_REGULATOR_ON,
        FIELD_OPTIONS.RATED_NOMINAL_POWER,
        FIELD_OPTIONS.MINIMUM_ACTIVE_POWER,
        FIELD_OPTIONS.MAXIMUM_ACTIVE_POWER,
        FIELD_OPTIONS.ACTIVE_POWER_SET_POINT,
        FIELD_OPTIONS.REACTIVE_POWER_SET_POINT,
        FIELD_OPTIONS.VOLTAGE_SET_POINT,
        FIELD_OPTIONS.PLANNED_ACTIVE_POWER_SET_POINT,
        FIELD_OPTIONS.MARGINAL_COST,
        FIELD_OPTIONS.PLANNED_OUTAGE_RATE,
        FIELD_OPTIONS.FORCED_OUTAGE_RATE,
        FIELD_OPTIONS.DROOP,
        FIELD_OPTIONS.TRANSIENT_REACTANCE,
        FIELD_OPTIONS.STEP_UP_TRANSFORMER_REACTANCE,
        FIELD_OPTIONS.Q_PERCENT,
    ],
    [EquipmentType.BATTERY]: [
        FIELD_OPTIONS.PROPERTY,
        FIELD_OPTIONS.MINIMUM_ACTIVE_POWER,
        FIELD_OPTIONS.MAXIMUM_ACTIVE_POWER,
        FIELD_OPTIONS.ACTIVE_POWER_SET_POINT,
        FIELD_OPTIONS.REACTIVE_POWER_SET_POINT,
        FIELD_OPTIONS.DROOP,
    ],
    [EquipmentType.LOAD]: [
        FIELD_OPTIONS.PROPERTY,
        FIELD_OPTIONS.LOAD_TYPE,
        FIELD_OPTIONS.ACTIVE_POWER,
        FIELD_OPTIONS.REACTIVE_POWER,
    ],
    [EquipmentType.SHUNT_COMPENSATOR]: [
        FIELD_OPTIONS.PROPERTY,
        FIELD_OPTIONS.MAXIMUM_SECTION_COUNT,
        FIELD_OPTIONS.SECTION_COUNT,
        FIELD_OPTIONS.MAX_SUSCEPTANCE,
        FIELD_OPTIONS.MAX_Q_AT_NOMINAL_V,
    ],
    [EquipmentType.STATIC_VAR_COMPENSATOR]: [FIELD_OPTIONS.PROPERTY],
    [EquipmentType.HVDC_LINE]: [FIELD_OPTIONS.PROPERTY],
} as const;

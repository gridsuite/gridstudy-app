/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { EQUIPMENT_TYPES } from '../../../../utils/equipment-types';
import {
    EDITED_FIELD,
    FILTERS,
    ID,
    NAME,
    PROPERTY_NAME_FIELD,
    SPECIFIC_METADATA,
    TYPE,
    VALUE_FIELD,
} from '../../../../utils/field-constants';
import yup from 'components/utils/yup-config';
import { AnyObject, TestFunction } from 'yup';
import { searchTree } from '@gridsuite/commons-ui';

export type FieldOptionType = {
    id: string;
    label: string;
    dataType: DataType;
};
export enum DataType {
    STRING = 'STRING',
    ENUM = 'ENUM',
    NUMBER = 'NUMBER',
    BOOLEAN = 'BOOLEAN',
    PROPERTY = 'PROPERTIES',
}

export enum FieldType {
    PROPERTY = 'FREE_PROPERTIES',
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
}
export const FIELD_OPTIONS: {
    [key: string]: FieldOptionType;
} = {
    PROPERTY: {
        id: FieldType.PROPERTY,
        label: 'Property',
        dataType: DataType.PROPERTY,
    },
    RATED_NOMINAL_POWER: {
        id: FieldType.RATED_NOMINAL_POWER,
        label: 'RatedNominalPowerText',
        dataType: DataType.NUMBER,
    },
    MINIMUM_ACTIVE_POWER: {
        id: FieldType.MINIMUM_ACTIVE_POWER,
        label: 'MinimumActivePowerText',
        dataType: DataType.NUMBER,
    },
    MAXIMUM_ACTIVE_POWER: {
        id: FieldType.MAXIMUM_ACTIVE_POWER,
        label: 'MaximumActivePowerText',
        dataType: DataType.NUMBER,
    },
    ACTIVE_POWER_SET_POINT: {
        id: FieldType.ACTIVE_POWER_SET_POINT,
        label: 'ActivePowerText',
        dataType: DataType.NUMBER,
    },
    REACTIVE_POWER_SET_POINT: {
        id: FieldType.REACTIVE_POWER_SET_POINT,
        label: 'ReactivePowerText',
        dataType: DataType.NUMBER,
    },
    VOLTAGE_SET_POINT: {
        id: FieldType.VOLTAGE_SET_POINT,
        label: 'GeneratorTargetV',
        dataType: DataType.NUMBER,
    },
    PLANNED_ACTIVE_POWER_SET_POINT: {
        id: FieldType.PLANNED_ACTIVE_POWER_SET_POINT,
        label: 'PlannedActivePowerSetPointForm',
        dataType: DataType.NUMBER,
    },
    MARGINAL_COST: {
        id: FieldType.MARGINAL_COST,
        label: 'marginalCost',
        dataType: DataType.NUMBER,
    },
    PLANNED_OUTAGE_RATE: {
        id: FieldType.PLANNED_OUTAGE_RATE,
        label: 'plannedOutageRate',
        dataType: DataType.NUMBER,
    },
    FORCED_OUTAGE_RATE: {
        id: FieldType.FORCED_OUTAGE_RATE,
        label: 'forcedOutageRate',
        dataType: DataType.NUMBER,
    },
    DROOP: {
        id: FieldType.DROOP,
        label: 'ActivePowerRegulationDroop',
        dataType: DataType.NUMBER,
    },
    TRANSIENT_REACTANCE: {
        id: FieldType.TRANSIENT_REACTANCE,
        label: 'TransientReactanceForm',
        dataType: DataType.NUMBER,
    },
    STEP_UP_TRANSFORMER_REACTANCE: {
        id: FieldType.STEP_UP_TRANSFORMER_REACTANCE,
        label: 'TransformerReactanceForm',
        dataType: DataType.NUMBER,
    },
    Q_PERCENT: {
        id: FieldType.Q_PERCENT,
        label: 'ReactivePercentageVoltageRegulation',
        dataType: DataType.NUMBER,
    },
    MAXIMUM_SECTION_COUNT: {
        id: FieldType.MAXIMUM_SECTION_COUNT,
        label: 'maximumSectionCount',
        dataType: DataType.NUMBER,
    },
    SECTION_COUNT: {
        id: FieldType.SECTION_COUNT,
        label: 'sectionCount',
        dataType: DataType.NUMBER,
    },
    MAXIMUM_SUSCEPTANCE: {
        id: FieldType.MAXIMUM_SUSCEPTANCE,
        label: 'maxSusceptance',
        dataType: DataType.NUMBER,
    },
    MAXIMUM_Q_AT_NOMINAL_VOLTAGE: {
        id: FieldType.MAXIMUM_Q_AT_NOMINAL_VOLTAGE,
        label: 'maxQAtNominalV',
        dataType: DataType.NUMBER,
    },
    NOMINAL_VOLTAGE: {
        id: FieldType.NOMINAL_VOLTAGE,
        label: 'NominalVoltage',
        dataType: DataType.NUMBER,
    },
    LOW_VOLTAGE_LIMIT: {
        id: FieldType.LOW_VOLTAGE_LIMIT,
        label: 'LowVoltageLimit',
        dataType: DataType.NUMBER,
    },
    HIGH_VOLTAGE_LIMIT: {
        id: FieldType.HIGH_VOLTAGE_LIMIT,
        label: 'HighVoltageLimit',
        dataType: DataType.NUMBER,
    },
    LOW_SHORT_CIRCUIT_CURRENT_LIMIT: {
        id: FieldType.LOW_SHORT_CIRCUIT_CURRENT_LIMIT,
        label: 'LowShortCircuitCurrentLimit',
        dataType: DataType.NUMBER,
    },
    HIGH_SHORT_CIRCUIT_CURRENT_LIMIT: {
        id: FieldType.HIGH_SHORT_CIRCUIT_CURRENT_LIMIT,
        label: 'HighShortCircuitCurrentLimit',
        dataType: DataType.NUMBER,
    },
    ACTIVE_POWER: {
        id: FieldType.ACTIVE_POWER,
        label: 'ActivePowerText',
        dataType: DataType.NUMBER,
    },
    REACTIVE_POWER: {
        id: FieldType.REACTIVE_POWER,
        label: 'ReactivePowerText',
        dataType: DataType.NUMBER,
    },
    R: {
        id: FieldType.R,
        label: 'SeriesResistanceText',
        dataType: DataType.NUMBER,
    },
    X: {
        id: FieldType.X,
        label: 'SeriesReactanceText',
        dataType: DataType.NUMBER,
    },
    G: { id: FieldType.G, label: 'G', dataType: DataType.NUMBER },
    B: { id: FieldType.B, label: 'B', dataType: DataType.NUMBER },
    RATED_U1: {
        id: FieldType.RATED_U1,
        label: 'RatedU1',
        dataType: DataType.NUMBER,
    },
    RATED_U2: {
        id: FieldType.RATED_U2,
        label: 'RatedU2',
        dataType: DataType.NUMBER,
    },
    RATED_S: {
        id: FieldType.RATED_S,
        label: 'RatedNominalPowerText',
        dataType: DataType.NUMBER,
    },
    TARGET_V: {
        id: FieldType.TARGET_V,
        label: 'RatioTargetV',
        dataType: DataType.NUMBER,
    },
    RATIO_LOW_TAP_POSITION: {
        id: FieldType.RATIO_LOW_TAP_POSITION,
        label: 'RatioLowTapPosition',
        dataType: DataType.NUMBER,
    },
    RATIO_TAP_POSITION: {
        id: FieldType.RATIO_TAP_POSITION,
        label: 'RatioTapPosition',
        dataType: DataType.NUMBER,
    },
    RATIO_TARGET_DEADBAND: {
        id: FieldType.RATIO_TARGET_DEADBAND,
        label: 'RatioDeadBand',
        dataType: DataType.NUMBER,
    },
    REGULATION_VALUE: {
        id: FieldType.REGULATION_VALUE,
        label: 'PhaseRegulatingValue',
        dataType: DataType.NUMBER,
    },
    PHASE_LOW_TAP_POSITION: {
        id: FieldType.PHASE_LOW_TAP_POSITION,
        label: 'PhaseLowTapPosition',
        dataType: DataType.NUMBER,
    },
    PHASE_TAP_POSITION: {
        id: FieldType.PHASE_TAP_POSITION,
        label: 'PhaseTapPosition',
        dataType: DataType.NUMBER,
    },
    PHASE_TARGET_DEADBAND: {
        id: FieldType.PHASE_TARGET_DEADBAND,
        label: 'PhaseDeadBand',
        dataType: DataType.NUMBER,
    },
};

export const EQUIPMENTS_FIELDS = {
    [EQUIPMENT_TYPES.GENERATOR]: [
        FIELD_OPTIONS.PROPERTY,
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
    [EQUIPMENT_TYPES.BATTERY]: [
        FIELD_OPTIONS.PROPERTY,
        FIELD_OPTIONS.MINIMUM_ACTIVE_POWER,
        FIELD_OPTIONS.MAXIMUM_ACTIVE_POWER,
        FIELD_OPTIONS.ACTIVE_POWER_SET_POINT,
        FIELD_OPTIONS.REACTIVE_POWER_SET_POINT,
        FIELD_OPTIONS.DROOP,
    ],
    [EQUIPMENT_TYPES.SHUNT_COMPENSATOR]: [
        FIELD_OPTIONS.PROPERTY,
        FIELD_OPTIONS.MAXIMUM_SECTION_COUNT,
        FIELD_OPTIONS.SECTION_COUNT,
        FIELD_OPTIONS.MAXIMUM_SUSCEPTANCE,
        FIELD_OPTIONS.MAXIMUM_Q_AT_NOMINAL_VOLTAGE,
    ],
    [EQUIPMENT_TYPES.VOLTAGE_LEVEL]: [
        FIELD_OPTIONS.PROPERTY,
        FIELD_OPTIONS.NOMINAL_VOLTAGE,
        FIELD_OPTIONS.LOW_VOLTAGE_LIMIT,
        FIELD_OPTIONS.HIGH_VOLTAGE_LIMIT,
        FIELD_OPTIONS.LOW_SHORT_CIRCUIT_CURRENT_LIMIT,
        FIELD_OPTIONS.HIGH_SHORT_CIRCUIT_CURRENT_LIMIT,
    ],
    [EQUIPMENT_TYPES.LOAD]: [
        FIELD_OPTIONS.PROPERTY,
        FIELD_OPTIONS.ACTIVE_POWER,
        FIELD_OPTIONS.REACTIVE_POWER,
    ],
    [EQUIPMENT_TYPES.TWO_WINDINGS_TRANSFORMER]: [
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
};

const checkNumericValue: TestFunction<any, AnyObject> = (value, _) => {
    const newValue = value.replace(',', '.');
    if (!isNaN(parseFloat(newValue))) {
        return true;
    }
    return false;
};

const getDataType = (fieldName: string) => {
    return (searchTree(FIELD_OPTIONS, 'id', fieldName) as FieldOptionType)
        ?.dataType;
};

export const getModificationLineInitialValue = () => ({
    [FILTERS]: [],
    [EDITED_FIELD]: null,
    [PROPERTY_NAME_FIELD]: null,
    [VALUE_FIELD]: null,
});

export function getFormulaSchema(id: string) {
    return {
        [id]: yup.array().of(
            yup.object().shape({
                [FILTERS]: yup
                    .array()
                    .of(
                        yup.object().shape({
                            [ID]: yup.string().required(),
                            [NAME]: yup.string().required(),
                            [SPECIFIC_METADATA]: yup.object().shape({
                                [TYPE]: yup.string(),
                            }),
                        })
                    )
                    .required()
                    .min(1, 'FieldIsRequired'),
                [EDITED_FIELD]: yup.string().required(),
                [PROPERTY_NAME_FIELD]: yup
                    .string()
                    .when([EDITED_FIELD], ([editedField], schema) => {
                        const dataType = getDataType(editedField);
                        if (dataType === DataType.PROPERTY) {
                            return schema.required();
                        }
                        return schema.nullable();
                    }),
                [VALUE_FIELD]: yup
                    .mixed()
                    .required()
                    .when([EDITED_FIELD], ([editedField], schema) => {
                        const dataType = getDataType(editedField);
                        if (dataType === DataType.NUMBER) {
                            return schema.test(
                                'checkNumericValue',
                                'WrongNumericValueError',
                                checkNumericValue
                            );
                        }
                        return schema;
                    }),
            })
        ),
    };
}

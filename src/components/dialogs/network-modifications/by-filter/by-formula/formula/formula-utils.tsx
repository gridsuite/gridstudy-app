/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { EQUIPMENT_TYPES } from '../../../../../utils/equipment-types';
import {
    EDITED_FIELD,
    EQUIPMENT_TYPE_FIELD,
    FILTERS,
    ID,
    NAME,
    OPERATOR,
    REFERENCE_FIELD_OR_VALUE_1,
    REFERENCE_FIELD_OR_VALUE_2,
    SPECIFIC_METADATA,
    TYPE,
} from '../../../../../utils/field-constants';
import yup from 'components/utils/yup-config';
import { AnyObject, TestContext, TestFunction } from 'yup';
import {
    KILO_AMPERE,
    KILO_VOLT,
    MEGA_VAR,
    MEGA_VOLT_AMPERE,
    MEGA_WATT,
    MICRO_SIEMENS,
    OHM,
    PERCENTAGE,
    SIEMENS,
} from '@gridsuite/commons-ui';

export type EquipmentField = {
    id: string;
    label: string;
    unit?: string;
};
type EquipmentFieldsKeys =
    | EQUIPMENT_TYPES.GENERATOR
    | EQUIPMENT_TYPES.BATTERY
    | EQUIPMENT_TYPES.SHUNT_COMPENSATOR
    | EQUIPMENT_TYPES.VOLTAGE_LEVEL
    | EQUIPMENT_TYPES.LOAD
    | EQUIPMENT_TYPES.TWO_WINDINGS_TRANSFORMER;
type EquipmentFields = {
    [key in EquipmentFieldsKeys]: EquipmentField[];
};

export const EQUIPMENTS_FIELDS: EquipmentFields = {
    [EQUIPMENT_TYPES.GENERATOR]: [
        { id: 'RATED_NOMINAL_POWER', label: 'RatedNominalPowerText', unit: MEGA_WATT },
        { id: 'MINIMUM_ACTIVE_POWER', label: 'MinimumActivePowerText', unit: MEGA_WATT },
        { id: 'MAXIMUM_ACTIVE_POWER', label: 'MaximumActivePowerText', unit: MEGA_WATT },
        { id: 'ACTIVE_POWER_SET_POINT', label: 'ActivePowerText', unit: MEGA_WATT },
        { id: 'REACTIVE_POWER_SET_POINT', label: 'ReactivePowerText', unit: MEGA_VAR },
        { id: 'VOLTAGE_SET_POINT', label: 'GeneratorTargetV', unit: KILO_VOLT },
        {
            id: 'PLANNED_ACTIVE_POWER_SET_POINT',
            label: 'PlannedActivePowerSetPointForm',
            unit: MEGA_WATT,
        },
        { id: 'MARGINAL_COST', label: 'marginalCost' },
        { id: 'PLANNED_OUTAGE_RATE', label: 'plannedOutageRate' },
        { id: 'FORCED_OUTAGE_RATE', label: 'forcedOutageRate' },
        { id: 'DROOP', label: 'ActivePowerRegulationDroop', unit: PERCENTAGE },
        { id: 'TRANSIENT_REACTANCE', label: 'TransientReactanceForm', unit: OHM },
        {
            id: 'STEP_UP_TRANSFORMER_REACTANCE',
            label: 'TransformerReactanceForm',
            unit: OHM,
        },
        { id: 'Q_PERCENT', label: 'ReactivePercentageVoltageRegulation', unit: PERCENTAGE },
    ],
    [EQUIPMENT_TYPES.BATTERY]: [
        { id: 'MINIMUM_ACTIVE_POWER', label: 'MinimumActivePowerText', unit: MEGA_WATT },
        { id: 'MAXIMUM_ACTIVE_POWER', label: 'MaximumActivePowerText', unit: MEGA_WATT },
        { id: 'ACTIVE_POWER_SET_POINT', label: 'ActivePowerText', unit: MEGA_WATT },
        { id: 'REACTIVE_POWER_SET_POINT', label: 'ReactivePowerText', unit: MEGA_VAR },
        { id: 'DROOP', label: 'Droop', unit: PERCENTAGE },
    ],
    [EQUIPMENT_TYPES.SHUNT_COMPENSATOR]: [
        { id: 'MAXIMUM_SECTION_COUNT', label: 'maximumSectionCount' },
        { id: 'SECTION_COUNT', label: 'sectionCount' },
        { id: 'MAX_SUSCEPTANCE', label: 'maxSusceptance', unit: SIEMENS },
        { id: 'MAX_Q_AT_NOMINAL_V', label: 'maxQAtNominalV', unit: MEGA_VAR },
    ],
    [EQUIPMENT_TYPES.VOLTAGE_LEVEL]: [
        { id: 'NOMINAL_VOLTAGE', label: 'NominalVoltage', unit: KILO_VOLT },
        { id: 'LOW_VOLTAGE_LIMIT', label: 'LowVoltageLimit', unit: KILO_VOLT },
        { id: 'HIGH_VOLTAGE_LIMIT', label: 'HighVoltageLimit', unit: KILO_VOLT },
        {
            id: 'LOW_SHORT_CIRCUIT_CURRENT_LIMIT',
            label: 'LowShortCircuitCurrentLimit',
            unit: KILO_AMPERE,
        },
        {
            id: 'HIGH_SHORT_CIRCUIT_CURRENT_LIMIT',
            label: 'HighShortCircuitCurrentLimit',
            unit: KILO_AMPERE,
        },
    ],
    [EQUIPMENT_TYPES.LOAD]: [
        { id: 'ACTIVE_POWER', label: 'ActivePowerText', unit: MEGA_WATT },
        { id: 'REACTIVE_POWER', label: 'ReactivePowerText', unit: MEGA_VAR },
    ],
    [EQUIPMENT_TYPES.TWO_WINDINGS_TRANSFORMER]: [
        { id: 'R', label: 'SeriesResistanceText', unit: OHM },
        { id: 'X', label: 'SeriesReactanceText', unit: OHM },
        { id: 'G', label: 'G', unit: MICRO_SIEMENS },
        { id: 'B', label: 'B', unit: MICRO_SIEMENS },
        { id: 'RATED_U1', label: 'RatedU1', unit: KILO_VOLT },
        { id: 'RATED_U2', label: 'RatedU2', unit: KILO_VOLT },
        { id: 'RATED_S', label: 'RatedNominalPowerText', unit: MEGA_VOLT_AMPERE },
        { id: 'TARGET_V', label: 'RatioTargetV', unit: KILO_VOLT },
        { id: 'RATIO_LOW_TAP_POSITION', label: 'RatioLowTapPosition' },
        { id: 'RATIO_TAP_POSITION', label: 'RatioTapPosition' },
        { id: 'RATIO_TARGET_DEADBAND', label: 'RatioDeadBand', unit: KILO_VOLT },
        { id: 'REGULATION_VALUE', label: 'PhaseRegulatingValue' },
        { id: 'PHASE_LOW_TAP_POSITION', label: 'PhaseLowTapPosition' },
        { id: 'PHASE_TAP_POSITION', label: 'PhaseTapPosition' },
        { id: 'PHASE_TARGET_DEADBAND', label: 'PhaseDeadBand' },
    ],
};

function isValueInEquipmentFields(context: TestContext<AnyObject>, value: string) {
    // this will return the highest level parent, so we can get the equipment type
    const parent = context.from?.[context.from.length - 1];
    const equipmentType = parent?.value?.[EQUIPMENT_TYPE_FIELD];
    return parent
        ? // @ts-expect-error TODO: missing type in context
          EQUIPMENTS_FIELDS[equipmentType!]?.some((field: { id: string; label: string }) => field.id === value)
        : false;
}

const checkValueInEquipmentFieldsOrNumeric: TestFunction<any, AnyObject> = (value, context) => {
    const newValue = value.replace(',', '.');
    if (!isNaN(parseFloat(newValue))) {
        return true;
    }

    return isValueInEquipmentFields(context, value);
};

const checkValueInEquipmentFields: TestFunction<any, AnyObject> = (value, context) => {
    return isValueInEquipmentFields(context, value);
};

export const getFormulaInitialValue = () => ({
    [FILTERS]: [],
    [EDITED_FIELD]: null,
    [REFERENCE_FIELD_OR_VALUE_1]: null,
    [OPERATOR]: null,
    [REFERENCE_FIELD_OR_VALUE_2]: null,
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
                [OPERATOR]: yup.string().required(),
                [REFERENCE_FIELD_OR_VALUE_1]: yup
                    .mixed()
                    .required()
                    .test('checkRefOrValue', 'WrongRefOrValueError', checkValueInEquipmentFieldsOrNumeric)
                    .when([OPERATOR], {
                        is: 'PERCENTAGE',
                        then: (schema) =>
                            schema.test(
                                'checkValueIsReference',
                                'ValueMustBeNumericWhenPercentageError',
                                (value: any) => !isNaN(parseFloat(value)) && parseFloat(value) >= 0
                            ),
                    }),
                [REFERENCE_FIELD_OR_VALUE_2]: yup
                    .mixed()
                    .required()
                    .test('checkRefOrValue', 'WrongRefOrValueError', checkValueInEquipmentFieldsOrNumeric)
                    .when([OPERATOR], {
                        is: 'PERCENTAGE',
                        then: (schema) =>
                            schema.test(
                                'checkValueIsReference',
                                'ValueMustBeRefWhenPercentageError',
                                checkValueInEquipmentFields
                            ),
                    }),
            })
        ),
    };
}

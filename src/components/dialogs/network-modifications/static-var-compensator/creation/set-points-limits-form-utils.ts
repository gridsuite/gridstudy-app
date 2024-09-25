/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    CHARACTERISTICS_CHOICE,
    CHARACTERISTICS_CHOICES,
    EQUIPMENT,
    ID,
    MAX_Q_AT_NOMINAL_V,
    MAX_SUSCEPTANCE,
    MIN_Q_AT_NOMINAL_V,
    MIN_SUSCEPTANCE,
    REACTIVE_POWER_SET_POINT,
    SETPOINTS_LIMITS,
    TYPE,
    VOLTAGE_LEVEL,
    VOLTAGE_REGULATION_MODE,
    VOLTAGE_REGULATION_MODES,
    VOLTAGE_REGULATION_TYPE,
    VOLTAGE_SET_POINT,
} from 'components/utils/field-constants';
import yup from '../../../../utils/yup-config';
import { REGULATION_TYPES } from '../../../../network/constants';
import { computeQAtNominalV } from '../../../../utils/utils';
import { Schema } from 'yup';

export const getReactiveFormEmptyFormData = (id = SETPOINTS_LIMITS) => ({
    [id]: {
        [MAX_SUSCEPTANCE]: null,
        [MIN_SUSCEPTANCE]: null,
        [MAX_Q_AT_NOMINAL_V]: null,
        [MIN_Q_AT_NOMINAL_V]: null,
        [VOLTAGE_SET_POINT]: null,
        [REACTIVE_POWER_SET_POINT]: null,
        [CHARACTERISTICS_CHOICE]: CHARACTERISTICS_CHOICES.Q_AT_NOMINAL_V.id,
        [VOLTAGE_REGULATION_MODE]: VOLTAGE_REGULATION_MODES.OFF.id,
        [VOLTAGE_REGULATION_TYPE]: REGULATION_TYPES.LOCAL.id,
        [VOLTAGE_LEVEL]: null,
        [EQUIPMENT]: null,
    },
});

const requiredWhenDistantVoltageMode = (schema: Schema) =>
    schema.when([VOLTAGE_REGULATION_MODE, VOLTAGE_REGULATION_TYPE], {
        is: (voltageRegulationMode: string, voltageRegulationType: string) =>
            voltageRegulationMode === VOLTAGE_REGULATION_MODES.VOLTAGE.id &&
            voltageRegulationType === REGULATION_TYPES.DISTANT.id,
        then: (schema) => schema.required(),
    });

export const getReactiveFormValidationSchema = () =>
    yup.object().shape({
        [MAX_SUSCEPTANCE]: yup
            .number()
            .nullable()
            .when([CHARACTERISTICS_CHOICE], {
                is: (characteristicsChoice: string) => characteristicsChoice === CHARACTERISTICS_CHOICES.SUSCEPTANCE.id,
                then: (schema) =>
                    schema
                        .min(yup.ref(MIN_SUSCEPTANCE), 'StaticVarCompensatorErrorSMaxAtNominalVoltageGreaterThanSMin')
                        .required(),
            }),
        [MIN_SUSCEPTANCE]: yup
            .number()
            .nullable()
            .when([CHARACTERISTICS_CHOICE], {
                is: (characteristicsChoice: string) => characteristicsChoice === CHARACTERISTICS_CHOICES.SUSCEPTANCE.id,
                then: (schema) =>
                    schema
                        .max(yup.ref(MAX_SUSCEPTANCE), 'StaticVarCompensatorErrorSMinAtNominalVoltageLessThanSMax')
                        .required(),
            }),
        [MAX_Q_AT_NOMINAL_V]: yup
            .number()
            .nullable()
            .when([CHARACTERISTICS_CHOICE], {
                is: (characteristicsChoice: string) =>
                    characteristicsChoice === CHARACTERISTICS_CHOICES.Q_AT_NOMINAL_V.id,
                then: (schema) =>
                    schema
                        .min(
                            yup.ref(MIN_Q_AT_NOMINAL_V),
                            'StaticVarCompensatorErrorQMaxAtNominalVoltageGreaterThanQMin'
                        )
                        .required(),
            }),
        [MIN_Q_AT_NOMINAL_V]: yup
            .number()
            .nullable()
            .when([CHARACTERISTICS_CHOICE], {
                is: (characteristicsChoice: string) =>
                    characteristicsChoice === CHARACTERISTICS_CHOICES.Q_AT_NOMINAL_V.id,
                then: (schema) =>
                    schema
                        .max(yup.ref(MAX_Q_AT_NOMINAL_V), 'StaticVarCompensatorErrorQMinAtNominalVoltageLessThanQMax')
                        .required(),
            }),
        [VOLTAGE_SET_POINT]: yup
            .number()
            .nullable()
            .when([VOLTAGE_REGULATION_MODE], {
                is: (characteristicsChoice: string) => characteristicsChoice === VOLTAGE_REGULATION_MODES.VOLTAGE.id,
                then: (schema) => schema.required(),
                otherwise: (schema) => schema.notRequired(),
            }),
        [REACTIVE_POWER_SET_POINT]: yup
            .number()
            .nullable()
            .when([VOLTAGE_REGULATION_MODE], {
                is: (characteristicsChoice: string) =>
                    characteristicsChoice === VOLTAGE_REGULATION_MODES.REACTIVE_POWER.id,
                then: (schema) => schema.required(),
                otherwise: (schema) => schema.notRequired(),
            }),
        [CHARACTERISTICS_CHOICE]: yup.string().required(),
        [VOLTAGE_REGULATION_MODE]: yup.string().required(),
        [VOLTAGE_REGULATION_TYPE]: yup.string().required(),

        [VOLTAGE_LEVEL]: requiredWhenDistantVoltageMode(
            yup
                .object()
                .nullable()
                .shape({
                    [ID]: yup.string().required(),
                })
        ),
        [EQUIPMENT]: requiredWhenDistantVoltageMode(
            yup
                .object()
                .nullable()
                .shape({
                    [ID]: yup.string().required(),
                    [TYPE]: yup.string().required(),
                })
        ),
    });

export const getReactiveFormData = ({
    maxSusceptance,
    minSusceptance,
    nominalV,
    maxQAtNominalV,
    minQAtNominalV,
    regulationMode,
    voltageSetpoint,
    reactivePowerSetpoint,
    voltageRegulationType,
    voltageLevelId,
    equipmentType,
    equipmentId,
}: {
    maxSusceptance: any;
    minSusceptance: any;
    nominalV?: any;
    maxQAtNominalV?: any;
    minQAtNominalV?: any;
    regulationMode: any;
    voltageSetpoint: any;
    reactivePowerSetpoint: any;
    voltageRegulationType: any;
    voltageLevelId: any;
    equipmentType: any;
    equipmentId: any;
}) => ({
    [SETPOINTS_LIMITS]: {
        [CHARACTERISTICS_CHOICE]: maxSusceptance
            ? CHARACTERISTICS_CHOICES.SUSCEPTANCE.id
            : CHARACTERISTICS_CHOICES.Q_AT_NOMINAL_V.id,
        [VOLTAGE_REGULATION_MODE]: regulationMode,
        [MAX_SUSCEPTANCE]: maxSusceptance,
        [MIN_SUSCEPTANCE]: minSusceptance,
        [MAX_Q_AT_NOMINAL_V]: maxQAtNominalV ?? computeQAtNominalV(maxSusceptance, nominalV),
        [MIN_Q_AT_NOMINAL_V]: minQAtNominalV ?? computeQAtNominalV(minSusceptance, nominalV),
        [VOLTAGE_SET_POINT]: voltageSetpoint,
        [REACTIVE_POWER_SET_POINT]: reactivePowerSetpoint,
        [VOLTAGE_REGULATION_TYPE]: voltageRegulationType,
        [VOLTAGE_LEVEL]: voltageLevelId ? { [ID]: voltageLevelId } : null,
        [EQUIPMENT]: equipmentId
            ? {
                  [ID]: equipmentId,
                  [TYPE]: equipmentType,
              }
            : null, // set null because this object field is conditionally required, see in schema
    },
});

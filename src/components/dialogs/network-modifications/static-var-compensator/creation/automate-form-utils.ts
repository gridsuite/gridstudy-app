/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    ADD_AUTOMATE,
    B0,
    CHARACTERISTICS_CHOICE_AUTOMATE,
    CHARACTERISTICS_CHOICES,
    HIGH_VOLTAGE_SET_POINT,
    HIGH_VOLTAGE_THRESHOLD,
    LOW_VOLTAGE_SET_LIMIT,
    LOW_VOLTAGE_THRESHOLD,
    MAX_Q_AT_NOMINAL_V,
    MAX_SUSCEPTANCE,
    MIN_Q_AT_NOMINAL_V,
    MIN_SUSCEPTANCE,
    Q0,
    SLIDER_Q_NOMINAL,
    SLIDER_SUSCEPTANCE,
    STAND_BY_AUTOMATE,
    VOLTAGE_REGULATION_MODE,
    VOLTAGE_REGULATION_MODES,
} from 'components/utils/field-constants';
import yup from '../../../../utils/yup-config';
import { computeQAtNominalV } from '../../../../utils/utils';

export const getAutomateEmptyFormData = () => ({
    [ADD_AUTOMATE]: false,
    [CHARACTERISTICS_CHOICE_AUTOMATE]: CHARACTERISTICS_CHOICES.Q_AT_NOMINAL_V.id,
    [STAND_BY_AUTOMATE]: false,
    [LOW_VOLTAGE_SET_LIMIT]: null,
    [HIGH_VOLTAGE_SET_POINT]: null,
    [LOW_VOLTAGE_THRESHOLD]: null,
    [HIGH_VOLTAGE_THRESHOLD]: null,
    [SLIDER_SUSCEPTANCE]: null,
    [SLIDER_Q_NOMINAL]: null,
    [B0]: null,
    [Q0]: null,
});

export const getAutomateFormValidationSchema = () => {
    const requiredIfAddAutomate = (yup: any) =>
        yup.nullable().when([ADD_AUTOMATE], {
            is: true,
            then: (schema: any) => schema.required(),
        });

    return {
        [ADD_AUTOMATE]: yup.boolean().nullable(),
        [STAND_BY_AUTOMATE]: yup
            .boolean()
            .nullable()
            .when([ADD_AUTOMATE, VOLTAGE_REGULATION_MODE], {
                is: (addAutomate: boolean, voltageRegulationMode: string) =>
                    addAutomate && voltageRegulationMode === VOLTAGE_REGULATION_MODES.VOLTAGE.id,
                then: (schema) => schema.required(),
            }),
        [LOW_VOLTAGE_SET_LIMIT]: requiredIfAddAutomate(yup.number()),
        [HIGH_VOLTAGE_SET_POINT]: requiredIfAddAutomate(yup.number()),
        [LOW_VOLTAGE_THRESHOLD]: requiredIfAddAutomate(yup.number()),
        [HIGH_VOLTAGE_THRESHOLD]: requiredIfAddAutomate(yup.number()),
        [CHARACTERISTICS_CHOICE_AUTOMATE]: requiredIfAddAutomate(yup.string()),
        [B0]: yup
            .number()
            .nullable()
            .when([ADD_AUTOMATE, CHARACTERISTICS_CHOICE_AUTOMATE], {
                is: (addAutomate: boolean, characteristicsChoiceAutomate: string) =>
                    addAutomate && characteristicsChoiceAutomate === CHARACTERISTICS_CHOICES.SUSCEPTANCE.id,
                then: (schema) =>
                    schema
                        .min(yup.ref(MIN_SUSCEPTANCE), 'StaticVarCompensatorErrorQMaxAtNominalVoltageGreaterThanQMin')
                        .max(yup.ref(MAX_SUSCEPTANCE), 'StaticVarCompensatorErrorQMaxAtNominalVoltageGreaterThanQMin')
                        .required(),
            }),
        [Q0]: yup
            .number()
            .nullable()
            .when([ADD_AUTOMATE, CHARACTERISTICS_CHOICE_AUTOMATE], {
                is: (addAutomate: boolean, characteristicsChoiceAutomate: string) =>
                    addAutomate && characteristicsChoiceAutomate === CHARACTERISTICS_CHOICES.Q_AT_NOMINAL_V.id,
                then: (schema) =>
                    schema
                        .min(
                            yup.ref(MIN_Q_AT_NOMINAL_V),
                            'StaticVarCompensatorErrorQMaxAtNominalVoltageGreaterThanQMin'
                        )
                        .max(
                            yup.ref(MAX_Q_AT_NOMINAL_V),
                            'StaticVarCompensatorErrorQMaxAtNominalVoltageGreaterThanQMin'
                        )
                        .required(),
            }),
        [SLIDER_SUSCEPTANCE]: yup.number().nullable(),
        [SLIDER_Q_NOMINAL]: yup.number().nullable(),
    };
};

export const getAutomateFormData: ({
    addAutomate,
    standby,
    b0,
    nominalV,
    lVoltageSetpoint,
    hVoltageSetpoint,
    lVoltageThreshold,
    hVoltageThreshold,
}: {
    addAutomate: boolean;
    standby: boolean;
    b0: number;
    nominalV: number;
    lVoltageSetpoint: number;
    hVoltageSetpoint: number;
    lVoltageThreshold: number;
    hVoltageThreshold: number;
}) => {
    [ADD_AUTOMATE]: boolean;
    [STAND_BY_AUTOMATE]: boolean;
    [LOW_VOLTAGE_SET_LIMIT]: number;
    [HIGH_VOLTAGE_SET_POINT]: number;
    [LOW_VOLTAGE_THRESHOLD]: number;
    [HIGH_VOLTAGE_THRESHOLD]: number;
    [CHARACTERISTICS_CHOICE_AUTOMATE]: string;
    [B0]: number;
} = ({
    addAutomate,
    standby,
    b0,
    nominalV,
    lVoltageSetpoint,
    hVoltageSetpoint,
    lVoltageThreshold,
    hVoltageThreshold,
}) => {
    return {
        [ADD_AUTOMATE]: addAutomate,
        [STAND_BY_AUTOMATE]: standby,
        [LOW_VOLTAGE_SET_LIMIT]: lVoltageSetpoint,
        [HIGH_VOLTAGE_SET_POINT]: hVoltageSetpoint,
        [LOW_VOLTAGE_THRESHOLD]: lVoltageThreshold,
        [HIGH_VOLTAGE_THRESHOLD]: hVoltageThreshold,
        [CHARACTERISTICS_CHOICE_AUTOMATE]:
            b0 != null ? CHARACTERISTICS_CHOICES.SUSCEPTANCE.id : CHARACTERISTICS_CHOICES.Q_AT_NOMINAL_V.id,
        [B0]: b0,
        [Q0]: computeQAtNominalV(b0, nominalV),
        [SLIDER_SUSCEPTANCE]: b0,
        [SLIDER_Q_NOMINAL]: computeQAtNominalV(b0, nominalV),
    };
};

export const getAutomateFormDataValues: ({
    standByAutomateOn,
    standby,
    b0,
    q0,
    lVoltageSetpoint,
    hVoltageSetpoint,
    lVoltageThreshold,
    hVoltageThreshold,
}: {
    standByAutomateOn: boolean;
    standby: boolean;
    b0: number;
    q0: number;
    lVoltageSetpoint: number;
    hVoltageSetpoint: number;
    lVoltageThreshold: number;
    hVoltageThreshold: number;
}) => {
    [ADD_AUTOMATE]: boolean;
    [STAND_BY_AUTOMATE]: boolean;
    [LOW_VOLTAGE_SET_LIMIT]: number;
    [HIGH_VOLTAGE_SET_POINT]: number;
    [LOW_VOLTAGE_THRESHOLD]: number;
    [HIGH_VOLTAGE_THRESHOLD]: number;
    [CHARACTERISTICS_CHOICE_AUTOMATE]: string;
    [B0]: number;
    [Q0]: number;
} = ({
    standByAutomateOn,
    standby,
    b0,
    q0,
    lVoltageSetpoint,
    hVoltageSetpoint,
    lVoltageThreshold,
    hVoltageThreshold,
}) => {
    return {
        [ADD_AUTOMATE]: standByAutomateOn,
        [STAND_BY_AUTOMATE]: standby,
        [LOW_VOLTAGE_SET_LIMIT]: lVoltageSetpoint,
        [HIGH_VOLTAGE_SET_POINT]: hVoltageSetpoint,
        [LOW_VOLTAGE_THRESHOLD]: lVoltageThreshold,
        [HIGH_VOLTAGE_THRESHOLD]: hVoltageThreshold,
        [CHARACTERISTICS_CHOICE_AUTOMATE]:
            b0 != null ? CHARACTERISTICS_CHOICES.SUSCEPTANCE.id : CHARACTERISTICS_CHOICES.Q_AT_NOMINAL_V.id,
        [B0]: b0,
        [Q0]: q0,
        [SLIDER_SUSCEPTANCE]: b0,
        [SLIDER_Q_NOMINAL]: q0,
    };
};

export function getFloatNumber(value: any) {
    return !isNaN(value) ? parseFloat(value) : 0;
}

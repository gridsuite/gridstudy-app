/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    ADD_STAND_BY_AUTOMATON,
    B0,
    CHARACTERISTICS_CHOICE_AUTOMATON,
    CHARACTERISTICS_CHOICES,
    HIGH_VOLTAGE_SET_POINT,
    HIGH_VOLTAGE_THRESHOLD,
    LOW_VOLTAGE_SET_POINT,
    LOW_VOLTAGE_THRESHOLD,
    MAX_Q_AT_NOMINAL_V,
    MAX_SUSCEPTANCE,
    MIN_Q_AT_NOMINAL_V,
    MIN_SUSCEPTANCE,
    Q0,
    SLIDER_Q_NOMINAL,
    SLIDER_SUSCEPTANCE,
    STAND_BY_AUTOMATON,
    VOLTAGE_REGULATION_MODE,
    VOLTAGE_REGULATION_MODES,
} from 'components/utils/field-constants';
import yup from '../../../../utils/yup-config';
import { computeQAtNominalV } from '../../../../utils/utils';

export const getStandbyAutomatonEmptyFormData = () => ({
    [ADD_STAND_BY_AUTOMATON]: false,
    [CHARACTERISTICS_CHOICE_AUTOMATON]: CHARACTERISTICS_CHOICES.Q_AT_NOMINAL_V.id,
    [STAND_BY_AUTOMATON]: false,
    [LOW_VOLTAGE_SET_POINT]: null,
    [HIGH_VOLTAGE_SET_POINT]: null,
    [LOW_VOLTAGE_THRESHOLD]: null,
    [HIGH_VOLTAGE_THRESHOLD]: null,
    [SLIDER_SUSCEPTANCE]: null,
    [SLIDER_Q_NOMINAL]: null,
    [B0]: null,
    [Q0]: null,
});

export const getStandbyAutomatonFormValidationSchema = () => {
    const requiredIfAddStandbyAutomaton = (yup: any) =>
        yup.nullable().when([ADD_STAND_BY_AUTOMATON], {
            is: true,
            then: (schema: any) => schema.required(),
        });

    return {
        [ADD_STAND_BY_AUTOMATON]: yup.boolean().nullable(),
        [STAND_BY_AUTOMATON]: yup
            .boolean()
            .nullable()
            .when([ADD_STAND_BY_AUTOMATON, VOLTAGE_REGULATION_MODE], {
                is: (addStandbyAutomaton: boolean, voltageRegulationMode: string) =>
                    addStandbyAutomaton && voltageRegulationMode === VOLTAGE_REGULATION_MODES.VOLTAGE.id,
                then: (schema) => schema.required(),
            }),
        [LOW_VOLTAGE_SET_POINT]: requiredIfAddStandbyAutomaton(yup.number()),
        [HIGH_VOLTAGE_SET_POINT]: requiredIfAddStandbyAutomaton(yup.number()),
        [LOW_VOLTAGE_THRESHOLD]: requiredIfAddStandbyAutomaton(yup.number()),
        [HIGH_VOLTAGE_THRESHOLD]: requiredIfAddStandbyAutomaton(yup.number()),
        [CHARACTERISTICS_CHOICE_AUTOMATON]: requiredIfAddStandbyAutomaton(yup.string()),
        [B0]: yup
            .number()
            .nullable()
            .when([ADD_STAND_BY_AUTOMATON, CHARACTERISTICS_CHOICE_AUTOMATON], {
                is: (addStandbyAutomaton: boolean, characteristicsChoiceAutomaton: string) =>
                    addStandbyAutomaton && characteristicsChoiceAutomaton === CHARACTERISTICS_CHOICES.SUSCEPTANCE.id,
                then: (schema) =>
                    schema
                        .min(yup.ref(MIN_SUSCEPTANCE), 'StaticVarCompensatorErrorQMaxAtNominalVoltageGreaterThanQMin')
                        .max(yup.ref(MAX_SUSCEPTANCE), 'StaticVarCompensatorErrorQMaxAtNominalVoltageGreaterThanQMin')
                        .required(),
            }),
        [Q0]: yup
            .number()
            .nullable()
            .when([ADD_STAND_BY_AUTOMATON, CHARACTERISTICS_CHOICE_AUTOMATON], {
                is: (addStandbyAutomaton: boolean, characteristicsChoiceAutomaton: string) =>
                    addStandbyAutomaton && characteristicsChoiceAutomaton === CHARACTERISTICS_CHOICES.Q_AT_NOMINAL_V.id,
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

export type StandbyAutomatonFormDataProps = {
    addStandbyAutomaton: boolean;
    standby: boolean;
    b0: number;
    nominalV: number;
    lVoltageSetpoint: number;
    hVoltageSetpoint: number;
    lVoltageThreshold: number;
    hVoltageThreshold: number;
};

export const getStandbyAutomatonFormData: ({
    addStandbyAutomaton,
    standby,
    b0,
    nominalV,
    lVoltageSetpoint,
    hVoltageSetpoint,
    lVoltageThreshold,
    hVoltageThreshold,
}: {
    addStandbyAutomaton: any;
    standby: any;
    b0: any;
    nominalV: any;
    lVoltageSetpoint: any;
    hVoltageSetpoint: any;
    lVoltageThreshold: any;
    hVoltageThreshold: any;
}) => {
    [CHARACTERISTICS_CHOICE_AUTOMATON]: string;
    [SLIDER_SUSCEPTANCE]: number;
    [HIGH_VOLTAGE_SET_POINT]: number;
    [HIGH_VOLTAGE_THRESHOLD]: number;
    [SLIDER_Q_NOMINAL]: number;
    [STAND_BY_AUTOMATON]: boolean;
    [LOW_VOLTAGE_SET_POINT]: number;
    [ADD_STAND_BY_AUTOMATON]: boolean;
    [LOW_VOLTAGE_THRESHOLD]: number;
    [B0]: number;
    [Q0]: number;
} = ({
    addStandbyAutomaton,
    standby,
    b0,
    nominalV,
    lVoltageSetpoint,
    hVoltageSetpoint,
    lVoltageThreshold,
    hVoltageThreshold,
}) => {
    return {
        [ADD_STAND_BY_AUTOMATON]: addStandbyAutomaton,
        [STAND_BY_AUTOMATON]: standby,
        [LOW_VOLTAGE_SET_POINT]: lVoltageSetpoint,
        [HIGH_VOLTAGE_SET_POINT]: hVoltageSetpoint,
        [LOW_VOLTAGE_THRESHOLD]: lVoltageThreshold,
        [HIGH_VOLTAGE_THRESHOLD]: hVoltageThreshold,
        [CHARACTERISTICS_CHOICE_AUTOMATON]:
            b0 != null ? CHARACTERISTICS_CHOICES.SUSCEPTANCE.id : CHARACTERISTICS_CHOICES.Q_AT_NOMINAL_V.id,
        [B0]: b0,
        [Q0]: computeQAtNominalV(b0, nominalV),
        [SLIDER_SUSCEPTANCE]: b0,
        [SLIDER_Q_NOMINAL]: computeQAtNominalV(b0, nominalV),
    };
};

export const getStandbyAutomatonFormDataValues: ({
    standbyAutomatonOn,
    standby,
    b0,
    q0,
    lVoltageSetpoint,
    hVoltageSetpoint,
    lVoltageThreshold,
    hVoltageThreshold,
}: {
    standbyAutomatonOn: any;
    standby: any;
    b0: any;
    q0: any;
    lVoltageSetpoint: any;
    hVoltageSetpoint: any;
    lVoltageThreshold: any;
    hVoltageThreshold: any;
}) => {
    [CHARACTERISTICS_CHOICE_AUTOMATON]: string;
    [SLIDER_SUSCEPTANCE]: number | null;
    [HIGH_VOLTAGE_SET_POINT]: number | null;
    [HIGH_VOLTAGE_THRESHOLD]: number | null;
    [SLIDER_Q_NOMINAL]: number | null;
    [STAND_BY_AUTOMATON]: boolean;
    [LOW_VOLTAGE_SET_POINT]: number | null;
    [ADD_STAND_BY_AUTOMATON]: boolean;
    [LOW_VOLTAGE_THRESHOLD]: number | null;
    [B0]: number | null;
    [Q0]: number | null;
} = ({
    standbyAutomatonOn,
    standby,
    b0,
    q0,
    lVoltageSetpoint,
    hVoltageSetpoint,
    lVoltageThreshold,
    hVoltageThreshold,
}) => {
    return {
        [ADD_STAND_BY_AUTOMATON]: standbyAutomatonOn,
        [STAND_BY_AUTOMATON]: standby,
        [LOW_VOLTAGE_SET_POINT]: lVoltageSetpoint,
        [HIGH_VOLTAGE_SET_POINT]: hVoltageSetpoint,
        [LOW_VOLTAGE_THRESHOLD]: lVoltageThreshold,
        [HIGH_VOLTAGE_THRESHOLD]: hVoltageThreshold,
        [CHARACTERISTICS_CHOICE_AUTOMATON]:
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

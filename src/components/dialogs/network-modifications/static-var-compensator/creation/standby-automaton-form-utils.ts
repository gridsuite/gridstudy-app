/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    ADD_STAND_BY_AUTOMATON,
    AUTOMATON,
    B0,
    CHARACTERISTICS_CHOICE_AUTOMATON,
    CHARACTERISTICS_CHOICES,
    HIGH_VOLTAGE_SET_POINT,
    HIGH_VOLTAGE_THRESHOLD,
    LOW_VOLTAGE_SET_POINT,
    LOW_VOLTAGE_THRESHOLD,
    MAX_Q_AUTOMATON,
    MAX_S_AUTOMATON,
    MIN_Q_AUTOMATON,
    MIN_S_AUTOMATON,
    Q0,
    STAND_BY_AUTOMATON,
    VOLTAGE_REGULATION_MODE,
    VOLTAGE_REGULATION_MODES,
} from 'components/utils/field-constants';
import yup from '../../../../utils/yup-config';

export const getStandbyAutomatonEmptyFormData = (id = AUTOMATON) => ({
    [id]: {
        [ADD_STAND_BY_AUTOMATON]: false,
        [STAND_BY_AUTOMATON]: false,
        [LOW_VOLTAGE_SET_POINT]: null,
        [HIGH_VOLTAGE_SET_POINT]: null,
        [LOW_VOLTAGE_THRESHOLD]: null,
        [HIGH_VOLTAGE_THRESHOLD]: null,
        [CHARACTERISTICS_CHOICE_AUTOMATON]: CHARACTERISTICS_CHOICES.Q_AT_NOMINAL_V.id,
        [MIN_Q_AUTOMATON]: null,
        [MAX_Q_AUTOMATON]: null,
        [MIN_S_AUTOMATON]: null,
        [MAX_S_AUTOMATON]: null,
        [B0]: null,
        [Q0]: null,
    },
});

const requiredIfAddStandbyAutomaton = (yup: any) =>
    yup.nullable().when([ADD_STAND_BY_AUTOMATON], {
        is: true,
        then: (schema: any) => schema.required(),
    });

const requiredWhenSusceptanceChoice = (schema: any) =>
    schema.when([ADD_STAND_BY_AUTOMATON, CHARACTERISTICS_CHOICE_AUTOMATON], {
        is: (addStandbyAutomaton: boolean, characteristicsChoiceAutomaton: string) =>
            addStandbyAutomaton && characteristicsChoiceAutomaton === CHARACTERISTICS_CHOICES.SUSCEPTANCE.id,
        then: (schema: any) =>
            schema
                .min(yup.ref(MIN_S_AUTOMATON), 'StaticVarCompensatorErrorSFixLessThanSMin')
                .max(yup.ref(MAX_S_AUTOMATON), 'StaticVarCompensatorErrorSFixGreaterThanSMax')
                .required(),
    });

const requiredWhenQatNominalVChoice = (schema: any) =>
    schema.when([ADD_STAND_BY_AUTOMATON, CHARACTERISTICS_CHOICE_AUTOMATON], {
        is: (addStandbyAutomaton: boolean, characteristicsChoiceAutomaton: string) =>
            addStandbyAutomaton && characteristicsChoiceAutomaton === CHARACTERISTICS_CHOICES.Q_AT_NOMINAL_V.id,
        then: (schema: any) =>
            schema
                .min(yup.ref(MIN_Q_AUTOMATON), 'StaticVarCompensatorErrorQFixLessThanQMin')
                .max(yup.ref(MAX_Q_AUTOMATON), 'StaticVarCompensatorErrorQFixGreaterThanQMax')
                .required(),
    });

export const getStandbyAutomatonFormValidationSchema = () =>
    yup.object().shape({
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
        [B0]: requiredWhenSusceptanceChoice(yup.number().nullable()),
        [Q0]: requiredWhenQatNominalVChoice(yup.number().nullable()),
    });

export const getStandbyAutomatonFormData = ({
    addStandbyAutomaton,
    standby,
    b0,
    q0,
    nominalV,
    lVoltageSetpoint,
    hVoltageSetpoint,
    lVoltageThreshold,
    hVoltageThreshold,
}: {
    addStandbyAutomaton: any;
    standby: any;
    b0: any;
    q0?: any;
    nominalV?: any;
    lVoltageSetpoint: any;
    hVoltageSetpoint: any;
    lVoltageThreshold: any;
    hVoltageThreshold: any;
}) => ({
    [AUTOMATON]: {
        [ADD_STAND_BY_AUTOMATON]: addStandbyAutomaton,
        [STAND_BY_AUTOMATON]: standby,
        [LOW_VOLTAGE_SET_POINT]: lVoltageSetpoint,
        [HIGH_VOLTAGE_SET_POINT]: hVoltageSetpoint,
        [LOW_VOLTAGE_THRESHOLD]: lVoltageThreshold,
        [HIGH_VOLTAGE_THRESHOLD]: hVoltageThreshold,
        [B0]: b0,
        [Q0]: q0 === null && nominalV !== null && b0 !== null ? b0 * Math.pow(nominalV, 2) : q0,
    },
});

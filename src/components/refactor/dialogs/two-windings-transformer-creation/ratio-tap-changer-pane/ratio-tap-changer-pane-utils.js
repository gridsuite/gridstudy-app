/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    ENABLED,
    EQUIPMENT,
    HIGH_TAP_POSITION,
    ID,
    LOAD_TAP_CHANGING_CAPABILITIES,
    LOW_TAP_POSITION,
    NAME,
    NOMINAL_VOLTAGE,
    RATIO_TAP_CHANGER,
    REGULATING,
    REGULATION_SIDE,
    REGULATION_TYPE,
    STEPS,
    STEPS_CONDUCTANCE,
    STEPS_RATIO,
    STEPS_REACTANCE,
    STEPS_RESISTANCE,
    STEPS_SUSCEPTANCE,
    STEPS_TAP,
    SUBSTATION_ID,
    TAP_POSITION,
    TARGET_DEADBAND,
    TARGET_V,
    TOPOLOGY_KIND,
    TYPE,
    VOLTAGE_LEVEL,
} from 'components/refactor/utils/field-constants';
import {
    areNumbersOrdered,
    areArrayElementsUnique,
} from '../../../utils/utils';
import yup from '../../../utils/yup-config';
import {
    getRegulatingTerminalEmptyFormData,
    getRegulatingTerminalFormData,
} from '../../regulating-terminal/regulating-terminal-form-utils';
import { REGULATION_TYPES } from '../../../../network/constants';

const ratioTapChangerValidationSchema = (id) => ({
    [id]: yup.object().shape({
        [ENABLED]: yup.bool().required(),
        [LOAD_TAP_CHANGING_CAPABILITIES]: yup.bool().required(),
        [REGULATING]: yup.bool().required(),
        [REGULATION_TYPE]: yup
            .string()
            .nullable()
            .when([ENABLED, REGULATING], {
                is: (enabled, regulating) => enabled && regulating,
                then: (schema) => schema.required(),
            }),
        [REGULATION_SIDE]: yup
            .string()
            .nullable()
            .when([ENABLED, REGULATING, REGULATION_TYPE], {
                is: (enabled, regulating, regulationType) =>
                    enabled &&
                    regulating &&
                    regulationType === REGULATION_TYPES.LOCAL.id,
                then: (schema) => schema.required(),
            }),
        [TARGET_V]: yup
            .number()
            .nullable()
            .positive('TargetVoltageGreaterThanZero')
            .when(REGULATING, {
                is: true,
                then: (schema) => schema.required(),
            }),
        [TARGET_DEADBAND]: yup
            .number()
            .nullable()
            .positive('TargetDeadbandGreaterThanZero'),
        [LOW_TAP_POSITION]: yup
            .number()
            .nullable()
            .max(100)
            .when(ENABLED, {
                is: true,
                then: (schema) =>
                    schema
                        .required()
                        .test(
                            'incoherentLowTapPosition',
                            'IncoherentLowTapPositionError',
                            (lowTapPosition, context) =>
                                isLowTapPositionCoherent(
                                    lowTapPosition,
                                    context
                                )
                        ),
            }),
        [HIGH_TAP_POSITION]: yup
            .number()
            .nullable()
            .min(yup.ref(LOW_TAP_POSITION), 'HighTapPositionError')
            .max(100, 'HighTapPositionError')
            .when(ENABLED, {
                is: true,
                then: (schema) =>
                    schema
                        .required()
                        .test(
                            'incoherentHighTapPosition',
                            'IncoherentHighTapPositionError',
                            (highTapPosition, context) =>
                                isHighTapPositionCoherent(
                                    highTapPosition,
                                    context
                                )
                        ),
            }),
        [TAP_POSITION]: yup
            .number()
            .nullable()
            .when(ENABLED, {
                is: true,
                then: (schema) =>
                    schema
                        .required()
                        .min(
                            yup.ref(LOW_TAP_POSITION),
                            'TapPositionBetweenLowAndHighTapPositionValue'
                        )
                        .max(
                            yup.ref(HIGH_TAP_POSITION),
                            'TapPositionBetweenLowAndHighTapPositionValue'
                        ),
            }),
        [STEPS]: yup
            .array()
            .of(
                yup.object().shape({
                    [STEPS_TAP]: yup.number().required(),
                    [STEPS_RESISTANCE]: yup.number(),
                    [STEPS_REACTANCE]: yup.number(),
                    [STEPS_CONDUCTANCE]: yup.number(),
                    [STEPS_SUSCEPTANCE]: yup.number(),
                    [STEPS_RATIO]: yup.number(),
                })
            )
            .when(ENABLED, {
                is: true,
                then: (schema) => schema.min(1, 'GenerateRatioTapRowsError'),
            })
            .test('distinctOrderedRatio', 'RatioValuesError', (array) => {
                const ratioArray = array.map((step) => step[STEPS_RATIO]);
                return (
                    areNumbersOrdered(ratioArray) &&
                    areArrayElementsUnique(ratioArray)
                );
            }),
        //regulating terminal fields
        //TODO: is it possible to move it to regulating-terminal-utils.js properly since it depends on "ENABLED" ?
        [VOLTAGE_LEVEL]: yup
            .object()
            .nullable()
            .shape({
                [ID]: yup.string(),
                [NAME]: yup.string(),
                [SUBSTATION_ID]: yup.string(),
                [NOMINAL_VOLTAGE]: yup.string(),
                [TOPOLOGY_KIND]: yup.string().nullable(),
            })
            .when([REGULATING, REGULATION_TYPE], {
                is: (regulating, regulationType) =>
                    regulating &&
                    regulationType === REGULATION_TYPES.DISTANT.id,
                then: (schema) => schema.required(),
            }),
        [EQUIPMENT]: yup
            .object()
            .nullable()
            .shape({
                [ID]: yup.string(),
                [NAME]: yup.string().nullable(),
                [TYPE]: yup.string(),
            })
            .when([REGULATING, REGULATION_TYPE], {
                is: (regulating, regulationType) =>
                    regulating &&
                    regulationType === REGULATION_TYPES.DISTANT.id,
                then: (schema) => schema.required(),
            }),
    }),
});

export const getRatioTapChangerValidationSchema = (id = RATIO_TAP_CHANGER) => {
    return ratioTapChangerValidationSchema(id);
};

const isLowTapPositionCoherent = (value, context) => {
    const stepsTap = context.parent[STEPS]?.map((step) => step[STEPS_TAP]);
    return stepsTap.length > 0 ? value === Math.min(...stepsTap) : true;
};

const isHighTapPositionCoherent = (value, context) => {
    const stepsTap = context.parent[STEPS]?.map((step) => step[STEPS_TAP]);
    return stepsTap.length > 0 ? value === Math.max(...stepsTap) : true;
};

const ratioTapChangerEmptyFormData = (id) => ({
    [id]: {
        [ENABLED]: false,
        [LOAD_TAP_CHANGING_CAPABILITIES]: false,
        [REGULATING]: false,
        [REGULATION_TYPE]: null,
        [REGULATION_SIDE]: null,
        [TARGET_V]: null,
        [TARGET_DEADBAND]: null,
        [LOW_TAP_POSITION]: null,
        [HIGH_TAP_POSITION]: null,
        [TAP_POSITION]: null,
        [STEPS]: [],
        ...getRegulatingTerminalEmptyFormData(),
    },
});

export const getRatioTapChangerEmptyFormData = (id = RATIO_TAP_CHANGER) => {
    return ratioTapChangerEmptyFormData(id);
};

export const getRatioTapChangerFormData = (
    {
        enabled = false,
        regulating = false,
        loadTapChangingCapabilities = false,
        regulationType = null,
        regulationSide = null,
        targetV = null,
        targetDeadband = null,
        lowTapPosition = null,
        highTapPosition = null,
        tapPosition = null,
        steps = [],
        voltageLevelId,
        equipmentId,
        equipmentType,
    },
    id = RATIO_TAP_CHANGER
) => ({
    [id]: {
        [ENABLED]: enabled,
        [REGULATING]: regulating,
        [LOAD_TAP_CHANGING_CAPABILITIES]: loadTapChangingCapabilities,
        [REGULATION_TYPE]: regulationType,
        [REGULATION_SIDE]: regulationSide,
        [TARGET_V]: targetV,
        [TARGET_DEADBAND]: targetDeadband,
        [LOW_TAP_POSITION]: lowTapPosition,
        [HIGH_TAP_POSITION]: highTapPosition,
        [TAP_POSITION]: tapPosition,
        [STEPS]: steps,
        ...getRegulatingTerminalFormData({
            equipmentId,
            voltageLevelId,
            equipmentType,
        }),
    },
});

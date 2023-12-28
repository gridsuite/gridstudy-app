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
    REGULATION_MODE,
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
} from 'components/utils/field-constants';
import {
    areNumbersOrdered,
    areArrayElementsUnique,
} from 'components/utils/utils';
import yup from 'components/utils/yup-config';
import {
    getRegulatingTerminalEmptyFormData,
    getRegulatingTerminalFormData,
} from '../../../../regulating-terminal/regulating-terminal-form-utils';
import {
    RATIO_REGULATION_MODES,
    REGULATION_TYPES,
    SIDE,
} from 'components/network/constants';

const ratioTapChangerValidationSchema = (id) => ({
    [id]: yup.object().shape({
        [ENABLED]: yup.bool().required(),
        [LOAD_TAP_CHANGING_CAPABILITIES]: yup.bool().required(),
        [REGULATION_MODE]: yup
            .string()
            .nullable()
            .when([ENABLED, LOAD_TAP_CHANGING_CAPABILITIES], {
                is: (enabled, loadTapChangingCapabilities) =>
                    enabled && loadTapChangingCapabilities,
                then: (schema) => schema.required(),
            }),
        [REGULATION_TYPE]: yup
            .string()
            .nullable()
            .when([ENABLED, LOAD_TAP_CHANGING_CAPABILITIES, REGULATION_MODE], {
                is: (enabled, loadTapChangingCapabilities, regulationMode) =>
                    enabled &&
                    loadTapChangingCapabilities &&
                    regulationMode ===
                        RATIO_REGULATION_MODES.VOLTAGE_REGULATION.id,
                then: (schema) => schema.required(),
            }),
        [REGULATION_SIDE]: yup
            .string()
            .nullable()
            .when(
                [
                    ENABLED,
                    LOAD_TAP_CHANGING_CAPABILITIES,
                    REGULATION_MODE,
                    REGULATION_TYPE,
                ],
                {
                    is: (
                        enabled,
                        loadTapChangingCapabilities,
                        regulationMode,
                        regulationType
                    ) =>
                        enabled &&
                        loadTapChangingCapabilities &&
                        regulationMode ===
                            RATIO_REGULATION_MODES.VOLTAGE_REGULATION.id &&
                        regulationType === REGULATION_TYPES.LOCAL.id,
                    then: (schema) => schema.required(),
                }
            ),
        [TARGET_V]: yup
            .mixed()
            .when([LOAD_TAP_CHANGING_CAPABILITIES], {
                is: true,
                then: () =>
                    yup
                        .number()
                        .nullable()
                        .positive('TargetVoltageGreaterThanZero'),
            })
            .when([REGULATION_MODE, LOAD_TAP_CHANGING_CAPABILITIES], {
                is: (regulationMode, loadTapChangingCapabilities) => {
                    return (
                        loadTapChangingCapabilities === true &&
                        regulationMode ===
                            RATIO_REGULATION_MODES.VOLTAGE_REGULATION.id
                    );
                },
                then: (schema) => schema.required(),
                otherwise: (schema) => schema.nullable(),
            }),
        [TARGET_DEADBAND]: yup
            .mixed()
            .nullable()
            .when(LOAD_TAP_CHANGING_CAPABILITIES, {
                is: true,
                then: () =>
                    yup
                        .number()
                        .nullable()
                        .min(0, 'TargetDeadbandGreaterOrEqualThanZero'),
            }),
        [LOW_TAP_POSITION]: yup
            .number()
            .nullable()
            .when(ENABLED, {
                is: true,
                then: (schema) => schema.required(),
            }),
        [HIGH_TAP_POSITION]: yup.number().nullable(),
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
            .when(
                [
                    ENABLED,
                    LOAD_TAP_CHANGING_CAPABILITIES,
                    REGULATION_MODE,
                    REGULATION_TYPE,
                ],
                {
                    is: (
                        enabled,
                        loadTapChangingCapabilities,
                        regulationMode,
                        regulationType
                    ) =>
                        enabled &&
                        loadTapChangingCapabilities &&
                        regulationMode ===
                            RATIO_REGULATION_MODES.VOLTAGE_REGULATION.id &&
                        regulationType === REGULATION_TYPES.DISTANT.id,
                    then: (schema) => schema.required(),
                }
            ),
        [EQUIPMENT]: yup
            .object()
            .nullable()
            .shape({
                [ID]: yup.string(),
                [NAME]: yup.string().nullable(),
                [TYPE]: yup.string(),
            })
            .when(
                [
                    ENABLED,
                    LOAD_TAP_CHANGING_CAPABILITIES,
                    REGULATION_MODE,
                    REGULATION_TYPE,
                ],
                {
                    is: (
                        enabled,
                        loadTapChangingCapabilities,
                        regulationMode,
                        regulationType
                    ) =>
                        enabled &&
                        loadTapChangingCapabilities &&
                        regulationMode ===
                            RATIO_REGULATION_MODES.VOLTAGE_REGULATION.id &&
                        regulationType === REGULATION_TYPES.DISTANT.id,
                    then: (schema) => schema.required(),
                }
            ),
    }),
});

const ratioTapChangerModificationValidationSchema = (previousValues, id) => ({
    [id]: yup.object().shape({
        [ENABLED]: yup.bool().required(),
        [LOAD_TAP_CHANGING_CAPABILITIES]: yup.bool().nullable(),
        [REGULATION_MODE]: yup.string().nullable(),
        [REGULATION_TYPE]: yup.string().nullable(),
        [REGULATION_SIDE]: yup.string().nullable(),
        [TARGET_V]: yup
            .number()
            .nullable()
            .positive('TargetVoltageGreaterThanZero'),
        [TARGET_DEADBAND]: yup
            .number()
            .nullable()
            .min(0, 'TargetDeadbandGreaterOrEqualThanZero'),
        [LOW_TAP_POSITION]: yup.number().nullable(),
        [HIGH_TAP_POSITION]: yup.number().nullable(),
        [TAP_POSITION]: yup.number().nullable(),
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
            .test('distinctOrderedRatio', 'RatioValuesError', (array) => {
                const ratioArray = array.map((step) => step[STEPS_RATIO]);
                return (
                    areNumbersOrdered(ratioArray) &&
                    areArrayElementsUnique(ratioArray)
                );
            }),
        //regulating terminal fields
        [VOLTAGE_LEVEL]: yup
            .object()
            .nullable()
            .shape({
                [ID]: yup.string(),
                [NAME]: yup.string(),
                [SUBSTATION_ID]: yup.string(),
                [NOMINAL_VOLTAGE]: yup.string(),
                [TOPOLOGY_KIND]: yup.string().nullable(),
            }),

        [EQUIPMENT]: yup
            .object()
            .nullable()
            .shape({
                [ID]: yup.string(),
                [NAME]: yup.string().nullable(),
                [TYPE]: yup.string(),
            }),
    }),
});

export const getRatioTapChangerValidationSchema = (id = RATIO_TAP_CHANGER) => {
    return ratioTapChangerValidationSchema(id);
};

export const getRatioTapChangerModificationValidationSchema = (
    previousValues,
    id = RATIO_TAP_CHANGER
) => {
    return ratioTapChangerModificationValidationSchema(previousValues, id);
};

const ratioTapChangerEmptyFormData = (id) => ({
    [id]: {
        [ENABLED]: false,
        [LOAD_TAP_CHANGING_CAPABILITIES]: false,
        [REGULATION_MODE]: null,
        [REGULATION_TYPE]: null,
        [REGULATION_SIDE]: SIDE.SIDE1.id,
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
        loadTapChangingCapabilities = false,
        regulationMode = null,
        regulationType = null,
        regulationSide = SIDE.SIDE1.id,
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
        [LOAD_TAP_CHANGING_CAPABILITIES]: loadTapChangingCapabilities,
        [REGULATION_MODE]: regulationMode,
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

export const getComputedPreviousRatioRegulationType = (previousValues) => {
    if (
        !previousValues?.[RATIO_TAP_CHANGER]?.[
            LOAD_TAP_CHANGING_CAPABILITIES
        ] ||
        !previousValues?.[RATIO_TAP_CHANGER]?.regulatingTerminalConnectableId
    ) {
        return null;
    }
    if (
        previousValues?.[RATIO_TAP_CHANGER]?.regulatingTerminalConnectableId !==
        previousValues?.id
    ) {
        return REGULATION_TYPES.DISTANT.id;
    } else {
        return REGULATION_TYPES.LOCAL.id;
    }
};

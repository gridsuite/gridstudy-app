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
import { areNumbersOrdered, areArrayElementsUnique } from 'components/utils/utils';
import yup from 'components/utils/yup-config';
import {
    getRegulatingTerminalEmptyFormData,
    getRegulatingTerminalFormData,
} from '../../../../regulating-terminal/regulating-terminal-form-utils';
import { RATIO_REGULATION_MODES, REGULATION_TYPES, SIDE } from 'components/network/constants';

const ratioTapChangerValidationSchema = (id) => ({
    [id]: yup.object().shape({
        [ENABLED]: yup.bool().required(),
        [LOAD_TAP_CHANGING_CAPABILITIES]: yup.bool().required(),
        [REGULATION_MODE]: yup
            .string()
            .nullable()
            .when([ENABLED, LOAD_TAP_CHANGING_CAPABILITIES], {
                is: (enabled, hasLoadTapChangingCapabilities) => enabled && hasLoadTapChangingCapabilities,
                then: (schema) => schema.required(),
            }),
        [REGULATION_TYPE]: yup
            .string()
            .nullable()
            .when([ENABLED, LOAD_TAP_CHANGING_CAPABILITIES, REGULATION_MODE], {
                is: (enabled, hasLoadTapChangingCapabilities, regulationMode) =>
                    enabled &&
                    hasLoadTapChangingCapabilities &&
                    regulationMode === RATIO_REGULATION_MODES.VOLTAGE_REGULATION.id,
                then: (schema) => schema.required(),
            }),
        [REGULATION_SIDE]: yup
            .string()
            .nullable()
            .when([ENABLED, LOAD_TAP_CHANGING_CAPABILITIES, REGULATION_MODE, REGULATION_TYPE], {
                is: (enabled, hasLoadTapChangingCapabilities, regulationMode, regulationType) =>
                    enabled &&
                    hasLoadTapChangingCapabilities &&
                    regulationMode === RATIO_REGULATION_MODES.VOLTAGE_REGULATION.id &&
                    regulationType === REGULATION_TYPES.LOCAL.id,
                then: (schema) => schema.required(),
            }),
        [TARGET_V]: yup
            .mixed()
            .when([LOAD_TAP_CHANGING_CAPABILITIES], {
                is: true,
                then: () => yup.number().nullable().positive('TargetVoltageMustBeGreaterThanZero'),
            })
            .when([REGULATION_MODE, LOAD_TAP_CHANGING_CAPABILITIES], {
                is: (regulationMode, hasLoadTapChangingCapabilities) => {
                    return (
                        hasLoadTapChangingCapabilities === true &&
                        regulationMode === RATIO_REGULATION_MODES.VOLTAGE_REGULATION.id
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
                then: () => yup.number().nullable().min(0, 'TargetDeadbandMustBeGreaterOrEqualToZero'),
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
                        .min(yup.ref(LOW_TAP_POSITION), 'TapPositionMustBeBetweenLowAndHighTapPositionValue')
                        .max(yup.ref(HIGH_TAP_POSITION), 'TapPositionMustBeBetweenLowAndHighTapPositionValue'),
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
                return areNumbersOrdered(ratioArray) && areArrayElementsUnique(ratioArray);
            }),
        //regulating terminal fields
        //TODO: is it possible to move it to regulating-terminal-utils.ts properly since it depends on "ENABLED" ?
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
            .when([ENABLED, LOAD_TAP_CHANGING_CAPABILITIES, REGULATION_MODE, REGULATION_TYPE], {
                is: (enabled, hasLoadTapChangingCapabilities, regulationMode, regulationType) =>
                    enabled &&
                    hasLoadTapChangingCapabilities &&
                    regulationMode === RATIO_REGULATION_MODES.VOLTAGE_REGULATION.id &&
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
            .when([ENABLED, LOAD_TAP_CHANGING_CAPABILITIES, REGULATION_MODE, REGULATION_TYPE], {
                is: (enabled, hasLoadTapChangingCapabilities, regulationMode, regulationType) =>
                    enabled &&
                    hasLoadTapChangingCapabilities &&
                    regulationMode === RATIO_REGULATION_MODES.VOLTAGE_REGULATION.id &&
                    regulationType === REGULATION_TYPES.DISTANT.id,
                then: (schema) => schema.required(),
            }),
    }),
});

const ratioTapChangerModificationValidationSchema = (previousValues, id) => ({
    [id]: yup.object().shape({
        [ENABLED]: yup.bool().required(),
        [LOAD_TAP_CHANGING_CAPABILITIES]: yup.bool().nullable(),
        [REGULATION_MODE]: yup.string().nullable(),
        [REGULATION_TYPE]: yup.string().nullable(),
        [REGULATION_SIDE]: yup.string().nullable(),
        [TARGET_V]: yup.number().nullable().positive('TargetVoltageMustBeGreaterThanZero'),
        [TARGET_DEADBAND]: yup.number().nullable().min(0, 'TargetDeadbandMustBeGreaterOrEqualToZero'),
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
                return areNumbersOrdered(ratioArray) && areArrayElementsUnique(ratioArray);
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

export const getRatioTapChangerModificationValidationSchema = (previousValues, id = RATIO_TAP_CHANGER) => {
    return ratioTapChangerModificationValidationSchema(previousValues, id);
};

const ratioTapChangerEmptyFormData = (isModification, id) => ({
    [id]: {
        [ENABLED]: false,
        [LOAD_TAP_CHANGING_CAPABILITIES]: isModification ? null : false,
        [REGULATION_MODE]: null,
        [REGULATION_TYPE]: null,
        [REGULATION_SIDE]: isModification ? null : SIDE.SIDE1.id,
        [TARGET_V]: null,
        [TARGET_DEADBAND]: null,
        [LOW_TAP_POSITION]: null,
        [HIGH_TAP_POSITION]: null,
        [TAP_POSITION]: null,
        [STEPS]: [],
        ...getRegulatingTerminalEmptyFormData(),
    },
});

export const getRatioTapChangerEmptyFormData = (isModification = false, id = RATIO_TAP_CHANGER) => {
    return ratioTapChangerEmptyFormData(isModification, id);
};

export const getRatioTapChangerFormData = (
    {
        enabled = false,
        hasLoadTapChangingCapabilities = false,
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
        [LOAD_TAP_CHANGING_CAPABILITIES]: hasLoadTapChangingCapabilities,
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

export const getComputedRegulationType = (twt) => {
    if (
        !twt?.[RATIO_TAP_CHANGER]?.[LOAD_TAP_CHANGING_CAPABILITIES] ||
        !twt?.[RATIO_TAP_CHANGER]?.regulatingTerminalConnectableId
    ) {
        return null;
    }
    if (twt?.[RATIO_TAP_CHANGER]?.regulatingTerminalConnectableId !== twt?.id) {
        return REGULATION_TYPES.DISTANT;
    } else {
        return REGULATION_TYPES.LOCAL;
    }
};

export const getComputedRegulationTypeId = (twt) => {
    const regulationType = getComputedRegulationType(twt);
    return regulationType?.id || null;
};

export const getComputedRegulationMode = (twt) => {
    const ratioTapChangerValues = twt?.ratioTapChanger;
    if (!ratioTapChangerValues) {
        return null;
    }
    if (ratioTapChangerValues[REGULATING]) {
        return RATIO_REGULATION_MODES.VOLTAGE_REGULATION;
    } else {
        return RATIO_REGULATION_MODES.FIXED_RATIO;
    }
};

export const getInitialTwtRatioRegulationModeId = (twt) => {
    // if onLoadTapChangingCapabilities is set to false or undefined, we set the regulation mode to null
    if (!twt?.ratioTapChanger?.hasLoadTapChangingCapabilities) {
        return null;
    }
    //otherwise, we compute it
    const computedRegulationMode = getComputedRegulationMode(twt);
    return computedRegulationMode?.id || null;
};

export const getComputedPreviousRatioRegulationType = (previousValues) => {
    const previousReulationType = getComputedRegulationType(previousValues);
    return previousReulationType?.id || null;
};

export const getComputedTapSideId = (twt) => {
    const ratioTapChangerValues = twt?.ratioTapChanger;
    if (!ratioTapChangerValues || !twt) {
        return null;
    }
    if (ratioTapChangerValues?.regulatingTerminalConnectableId === twt?.id) {
        return ratioTapChangerValues?.regulatingTerminalVlId === twt?.voltageLevelId1 ? SIDE.SIDE1.id : SIDE.SIDE2.id;
    } else {
        return null;
    }
};

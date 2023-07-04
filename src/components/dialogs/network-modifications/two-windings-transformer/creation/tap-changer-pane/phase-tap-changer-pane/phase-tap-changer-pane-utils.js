/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    CURRENT_LIMITER_REGULATING_VALUE,
    ENABLED,
    EQUIPMENT,
    FLOW_SET_POINT_REGULATING_VALUE,
    HIGH_TAP_POSITION,
    ID,
    LOW_TAP_POSITION,
    NAME,
    NOMINAL_VOLTAGE,
    PHASE_TAP_CHANGER,
    REGULATING,
    REGULATION_MODE,
    REGULATION_SIDE,
    REGULATION_TYPE,
    STEPS,
    STEPS_ALPHA,
    STEPS_CONDUCTANCE,
    STEPS_MODIFIED,
    STEPS_RATIO,
    STEPS_REACTANCE,
    STEPS_RESISTANCE,
    STEPS_SUSCEPTANCE,
    STEPS_TAP,
    SUBSTATION_ID,
    TAP_POSITION,
    TARGET_DEADBAND,
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
    PHASE_REGULATION_MODES,
    REGULATION_TYPES,
    SIDE,
} from 'components/network/constants';
import {
    getRegulatingTerminalEmptyFormData,
    getRegulatingTerminalFormData,
} from 'components/dialogs/regulating-terminal/regulating-terminal-form-utils';

const phaseTapChangerValidationSchema = (modification, id) => ({
    [id]: yup.object().shape({
        [ENABLED]: yup.bool().required(),
        [REGULATION_MODE]: modification
            ? yup.string().nullable()
            : yup
                  .string()
                  .nullable()
                  .when([ENABLED], {
                      is: true,
                      then: (schema) => schema.required(),
                  }),
        [REGULATION_TYPE]: modification
            ? yup.string().nullable()
            : yup
                  .string()
                  .nullable()
                  .when([ENABLED, REGULATION_MODE], {
                      is: (enabled, regulationMode) =>
                          enabled &&
                          regulationMode !==
                              PHASE_REGULATION_MODES.FIXED_TAP.id,
                      then: (schema) => schema.required(),
                  }),
        [REGULATION_SIDE]: modification
            ? yup.string().nullable()
            : yup
                  .string()
                  .nullable()
                  .when([ENABLED, REGULATION_MODE, REGULATION_TYPE], {
                      is: (enabled, regulationMode, regulationType) =>
                          enabled &&
                          regulationMode !==
                              PHASE_REGULATION_MODES.FIXED_TAP.id &&
                          regulationType === REGULATION_TYPES.LOCAL.id,
                      then: (schema) => schema.required(),
                  }),
        [CURRENT_LIMITER_REGULATING_VALUE]: modification
            ? yup.string().nullable()
            : yup
                  .number()
                  .nullable()
                  .positive('CurrentLimiterGreaterThanZero')
                  .when([ENABLED, REGULATION_MODE], {
                      is: (enabled, regulationMode) =>
                          enabled &&
                          regulationMode ===
                              PHASE_REGULATION_MODES.CURRENT_LIMITER.id,
                      then: (schema) => schema.required(),
                  }),
        [FLOW_SET_POINT_REGULATING_VALUE]: modification
            ? yup.string().nullable()
            : yup
                  .number()
                  .nullable()
                  .when([ENABLED, REGULATION_MODE], {
                      is: (enabled, regulationMode) =>
                          enabled &&
                          regulationMode ===
                              PHASE_REGULATION_MODES.ACTIVE_POWER_CONTROL.id,
                      then: (schema) => schema.required(),
                  }),
        [TARGET_DEADBAND]: yup
            .number()
            .nullable()
            .positive('TargetDeadbandGreaterThanZero'),
        [LOW_TAP_POSITION]: yup
            .number()
            .nullable()
            .when(ENABLED, {
                is: true,
                then: (schema) => (modification ? schema : schema.required()),
            }),
        [HIGH_TAP_POSITION]: yup.number().nullable(),
        [TAP_POSITION]: yup
            .number()
            .nullable()
            .when(ENABLED, {
                is: true,
                then: (schema) =>
                    modification
                        ? schema
                              .nullable()
                              .min(
                                  yup.ref(LOW_TAP_POSITION),
                                  'TapPositionBetweenLowAndHighTapPositionValue'
                              )
                              .max(
                                  yup.ref(HIGH_TAP_POSITION),
                                  'TapPositionBetweenLowAndHighTapPositionValue'
                              )
                        : schema
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
                    [STEPS_ALPHA]: yup.number(),
                })
            )
            .when(ENABLED, {
                is: true,
                then: (schema) => schema.min(1, 'GeneratePhaseTapRowsError'),
            })
            .test('distinctOrderedAlpha', 'PhaseShiftValuesError', (array) => {
                const alphaArray = array.map((step) => step[STEPS_ALPHA]);
                return (
                    areNumbersOrdered(alphaArray) &&
                    areArrayElementsUnique(alphaArray)
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
            .when([ENABLED, REGULATION_MODE, REGULATION_TYPE], {
                is: (enabled, regulationMode, regulationType) =>
                    enabled &&
                    regulationMode !== PHASE_REGULATION_MODES.FIXED_TAP.id &&
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
            .when([ENABLED, REGULATION_MODE, REGULATION_TYPE], {
                is: (enabled, regulationMode, regulationType) =>
                    enabled &&
                    regulationMode !== PHASE_REGULATION_MODES.FIXED_TAP.id &&
                    regulationType === REGULATION_TYPES.DISTANT.id,
                then: (schema) => schema.required(),
            }),
    }),
});

export const getPhaseTapChangerValidationSchema = (
    modification = false,
    id = PHASE_TAP_CHANGER
) => {
    return phaseTapChangerValidationSchema(modification, id);
};

const phaseTapChangerEmptyFormData = (id) => ({
    [id]: {
        [ENABLED]: false,
        [REGULATION_MODE]: null,
        [REGULATION_TYPE]: null,
        [REGULATION_SIDE]: SIDE.SIDE1.id,
        [CURRENT_LIMITER_REGULATING_VALUE]: null,
        [FLOW_SET_POINT_REGULATING_VALUE]: null,
        [TARGET_DEADBAND]: null,
        [LOW_TAP_POSITION]: null,
        [HIGH_TAP_POSITION]: null,
        [TAP_POSITION]: null,
        [STEPS]: [],
        ...getRegulatingTerminalEmptyFormData(),
    },
});

export const getPhaseTapChangerEmptyFormData = (id = PHASE_TAP_CHANGER) => {
    return phaseTapChangerEmptyFormData(id);
};

export const getPhaseTapChangerFormData = (
    {
        enabled = false,
        stepsModified = false,
        regulationMode = null,
        regulationType = null,
        regulationSide = SIDE.SIDE1.id,
        currentLimiterRegulatingValue = null,
        flowSetpointRegulatingValue = null,
        targetDeadband = null,
        lowTapPosition = null,
        highTapPosition = null,
        tapPosition = null,
        steps = [],
        voltageLevelId,
        equipmentId,
        equipmentType,
    },
    id = PHASE_TAP_CHANGER
) => ({
    [id]: {
        [ENABLED]: enabled,
        [STEPS_MODIFIED]: stepsModified,
        [REGULATION_MODE]: regulationMode,
        [REGULATION_TYPE]: regulationType,
        [REGULATION_SIDE]: regulationSide,
        [CURRENT_LIMITER_REGULATING_VALUE]: currentLimiterRegulatingValue,
        [FLOW_SET_POINT_REGULATING_VALUE]: flowSetpointRegulatingValue,
        [TARGET_DEADBAND]: targetDeadband,
        [LOW_TAP_POSITION]: lowTapPosition,
        [HIGH_TAP_POSITION]: highTapPosition,
        [TAP_POSITION]: tapPosition,
        [STEPS]: steps,
        ...getRegulatingTerminalFormData({
            equipmentId,
            equipmentType,
            voltageLevelId,
        }),
    },
});

export const getComputedPhaseTapChangerRegulationMode = (
    phaseTapChangerFormValues
) => {
    if (
        phaseTapChangerFormValues?.[REGULATION_MODE] ===
            PHASE_REGULATION_MODES.FIXED_TAP.id ||
        phaseTapChangerFormValues?.[REGULATING] === false
    ) {
        return PHASE_REGULATION_MODES.FIXED_TAP;
    } else if (
        phaseTapChangerFormValues?.[REGULATION_MODE] ===
            PHASE_REGULATION_MODES.CURRENT_LIMITER.id &&
        phaseTapChangerFormValues?.[REGULATING] === true
    ) {
        return PHASE_REGULATION_MODES.CURRENT_LIMITER;
    } else if (
        phaseTapChangerFormValues?.[REGULATION_MODE] ===
            PHASE_REGULATION_MODES.ACTIVE_POWER_CONTROL.id &&
        phaseTapChangerFormValues?.[REGULATING] === true
    ) {
        return PHASE_REGULATION_MODES.ACTIVE_POWER_CONTROL;
    }
};

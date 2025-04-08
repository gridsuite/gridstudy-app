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
    LOW_TAP_POSITION,
    PHASE_TAP_CHANGER,
    REGULATION_MODE,
    REGULATION_SIDE,
    REGULATION_TYPE,
    STEPS,
    STEPS_ALPHA,
    TAP_POSITION,
    TARGET_DEADBAND,
    VOLTAGE_LEVEL,
} from 'components/utils/field-constants';
import { areArrayElementsUnique, areNumbersOrdered } from 'components/utils/utils';
import yup from 'components/utils/yup-config';
import {
    getRegulatingTerminalEmptyFormData,
    getRegulatingTerminalFormData,
} from '../../../../regulating-terminal/regulating-terminal-form-utils';
import { PHASE_REGULATION_MODES, REGULATION_TYPES, SIDE } from 'components/network/constants';
import { PhaseTapChangerFormInfos } from './phase-tap-changer.type';
import {
    getEquipmentValidationSchema,
    getPhaseTapChangerStepsValidationSchema,
    getRegulatedTerminalValidationSchema,
    getVoltageLevelValidationSchema,
} from '../tap-changer-pane-utils';

const phaseTapChangerCreationValidationSchema = (id: string) => ({
    [id]: yup.object().shape({
        [ENABLED]: yup.bool().required(),
        [REGULATION_MODE]: yup
            .string()
            .nullable()
            .when([ENABLED], {
                is: true,
                then: (schema) => schema.required(),
            }),
        [REGULATION_TYPE]: yup
            .string()
            .nullable()
            .when([ENABLED, REGULATION_MODE], {
                is: (enabled: boolean, regulationMode: string) =>
                    enabled && regulationMode !== PHASE_REGULATION_MODES.FIXED_TAP.id,
                then: (schema) => schema.required(),
            }),
        [REGULATION_SIDE]: yup
            .string()
            .nullable()
            .when([ENABLED, REGULATION_MODE, REGULATION_TYPE], {
                is: (enabled: boolean, regulationMode: string, regulationType: string) =>
                    enabled &&
                    regulationMode !== PHASE_REGULATION_MODES.FIXED_TAP.id &&
                    regulationType === REGULATION_TYPES.LOCAL.id,
                then: (schema) => schema.required(),
            }),
        [CURRENT_LIMITER_REGULATING_VALUE]: yup
            .number()
            .nullable()
            .when([ENABLED, REGULATION_MODE], {
                is: (enabled: boolean, regulationMode: string) =>
                    enabled && regulationMode === PHASE_REGULATION_MODES.CURRENT_LIMITER.id,
                then: (schema) => schema.positive('CurrentLimiterMustBeGreaterThanZero').required(),
            }),
        [FLOW_SET_POINT_REGULATING_VALUE]: yup
            .number()
            .nullable()
            .when([ENABLED, REGULATION_MODE], {
                is: (enabled: boolean, regulationMode: string) =>
                    enabled && regulationMode === PHASE_REGULATION_MODES.ACTIVE_POWER_CONTROL.id,
                then: (schema) => schema.required(),
            }),
        [TARGET_DEADBAND]: yup.number().nullable().min(0, 'TargetDeadbandMustBeGreaterOrEqualToZero'),
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
        [STEPS]: getPhaseTapChangerStepsValidationSchema()
            .when(ENABLED, {
                is: true,
                then: (schema) => schema.min(1, 'GeneratePhaseTapRowsError'),
            })
            .test('distinctOrderedAlpha', 'PhaseShiftValuesError', (array) => {
                const alphaArray = array?.map((step) => step[STEPS_ALPHA]);
                return areNumbersOrdered(alphaArray) && alphaArray && areArrayElementsUnique(alphaArray);
            }),
        //regulating terminal fields
        [VOLTAGE_LEVEL]: getRegulatedTerminalValidationSchema(getVoltageLevelValidationSchema()),
        [EQUIPMENT]: getRegulatedTerminalValidationSchema(getEquipmentValidationSchema()),
    }),
});

const phaseTapChangerModificationValidationSchema = (id: string) => ({
    [id]: yup.object().shape({
        [ENABLED]: yup.bool().required(),
        [REGULATION_MODE]: yup.string().nullable(),
        [REGULATION_TYPE]: yup.string().nullable(),
        [REGULATION_SIDE]: yup.string().nullable(),
        [CURRENT_LIMITER_REGULATING_VALUE]: yup.number().nullable().positive('CurrentLimiterMustBeGreaterThanZero'),
        [FLOW_SET_POINT_REGULATING_VALUE]: yup.number().nullable(),
        [TARGET_DEADBAND]: yup.number().nullable().min(0, 'TargetDeadbandMustBeGreaterOrEqualToZero'),
        [LOW_TAP_POSITION]: yup.number().nullable(),
        [HIGH_TAP_POSITION]: yup.number().nullable(),
        [TAP_POSITION]: yup.number().nullable(),
        [STEPS]: getPhaseTapChangerStepsValidationSchema().test(
            'distinctOrderedAlpha',
            'PhaseShiftValuesError',
            (array) => {
                const alphaArray = array?.map((step) => step[STEPS_ALPHA]);
                return areNumbersOrdered(alphaArray) && alphaArray && areArrayElementsUnique(alphaArray);
            }
        ),
        //regulating terminal fields
        [VOLTAGE_LEVEL]: getVoltageLevelValidationSchema(),
        [EQUIPMENT]: getEquipmentValidationSchema(),
    }),
});

export const getPhaseTapChangerValidationSchema = (id = PHASE_TAP_CHANGER) => {
    return phaseTapChangerCreationValidationSchema(id);
};

export const getPhaseTapChangerModificationValidationSchema = (id = PHASE_TAP_CHANGER) => {
    return phaseTapChangerModificationValidationSchema(id);
};

const phaseTapChangerEmptyFormData = (isModification: boolean, id: string) => ({
    [id]: {
        [ENABLED]: false,
        [REGULATION_MODE]: null,
        [REGULATION_TYPE]: null,
        [REGULATION_SIDE]: isModification ? null : SIDE.SIDE1.id,
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

export const getPhaseTapChangerEmptyFormData = (isModification = false, id = PHASE_TAP_CHANGER) => {
    return phaseTapChangerEmptyFormData(isModification, id);
};

export const getPhaseTapChangerFormData = (
    {
        enabled = false,
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
        voltageLevelId = undefined,
        equipmentId = undefined,
        equipmentType = undefined,
    },
    id = PHASE_TAP_CHANGER
) => ({
    [id]: {
        [ENABLED]: enabled,
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

export const getComputedPhaseTapChangerRegulationMode = (regulationMode?: string, isRegulating?: boolean) => {
    if (regulationMode === PHASE_REGULATION_MODES.FIXED_TAP.id || isRegulating === false) {
        return PHASE_REGULATION_MODES.FIXED_TAP;
    } else if (regulationMode === PHASE_REGULATION_MODES.CURRENT_LIMITER.id && isRegulating === true) {
        return PHASE_REGULATION_MODES.CURRENT_LIMITER;
    } else if (regulationMode === PHASE_REGULATION_MODES.ACTIVE_POWER_CONTROL.id && isRegulating === true) {
        return PHASE_REGULATION_MODES.ACTIVE_POWER_CONTROL;
    }
};

export const getPhaseTapRegulationSideId = (
    equipmentId: string,
    voltageLevelId1: string,
    phaseTapChangerFormValues: PhaseTapChangerFormInfos
) => {
    if (!phaseTapChangerFormValues) {
        return null;
    }
    if (phaseTapChangerFormValues?.regulatingTerminalConnectableId === equipmentId) {
        return phaseTapChangerFormValues?.regulatingTerminalVlId === voltageLevelId1 ? SIDE.SIDE1.id : SIDE.SIDE2.id;
    } else {
        return null;
    }
};

export const getComputedPhaseRegulationType = (
    equipmentId?: string,
    phaseTapChangerFormInfos?: PhaseTapChangerFormInfos
) => {
    if (!phaseTapChangerFormInfos) {
        return null;
    }
    if (phaseTapChangerFormInfos?.regulatingTerminalConnectableId !== equipmentId) {
        return REGULATION_TYPES.DISTANT;
    } else {
        return REGULATION_TYPES.LOCAL;
    }
};

export const getComputedPhaseRegulationTypeId = (
    equipmentId?: string,
    phaseTapChangerFormInfos?: PhaseTapChangerFormInfos
) => {
    const regulationType = getComputedPhaseRegulationType(equipmentId, phaseTapChangerFormInfos);
    return regulationType?.id || null;
};

export const getComputedPreviousPhaseRegulationType = (
    equipmentId?: string,
    phaseTapChangerFormInfos?: PhaseTapChangerFormInfos
) => {
    const previousRegulationType = getComputedPhaseRegulationType(equipmentId, phaseTapChangerFormInfos);
    return previousRegulationType?.id || null;
};

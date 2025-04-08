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
    LOAD_TAP_CHANGING_CAPABILITIES,
    LOW_TAP_POSITION,
    RATIO_TAP_CHANGER,
    REGULATION_MODE,
    REGULATION_SIDE,
    REGULATION_TYPE,
    STEPS,
    TAP_POSITION,
    TARGET_DEADBAND,
    TARGET_V,
    VOLTAGE_LEVEL,
} from 'components/utils/field-constants';
import yup from 'components/utils/yup-config';
import {
    getRegulatingTerminalEmptyFormData,
    getRegulatingTerminalFormData,
} from '../../../../regulating-terminal/regulating-terminal-form-utils';
import { RATIO_REGULATION_MODES, REGULATION_TYPES, SIDE } from 'components/network/constants';
import { RatioTapChangerFormInfos } from './ratio-tap-changer.type';
import {
    getEquipmentValidationSchema,
    getRatioTapChangerStepsValidationSchema,
    getVoltageLevelValidationSchema,
} from '../tap-changer-pane-utils';

const ratioTapChangerCreationValidationSchema = (id: string) => ({
    [id]: yup.object().shape({
        [ENABLED]: yup.bool().required(),
        [LOAD_TAP_CHANGING_CAPABILITIES]: yup.bool().required(),
        [REGULATION_MODE]: yup
            .string()
            .nullable()
            .when([ENABLED, LOAD_TAP_CHANGING_CAPABILITIES], {
                is: (enabled: boolean, hasLoadTapChangingCapabilities: boolean) =>
                    enabled && hasLoadTapChangingCapabilities,
                then: (schema) => schema.required(),
            }),
        [REGULATION_TYPE]: yup
            .string()
            .nullable()
            .when([ENABLED, LOAD_TAP_CHANGING_CAPABILITIES, REGULATION_MODE], {
                is: (enabled: boolean, hasLoadTapChangingCapabilities: boolean, regulationMode: string) =>
                    enabled &&
                    hasLoadTapChangingCapabilities &&
                    regulationMode === RATIO_REGULATION_MODES.VOLTAGE_REGULATION.id,
                then: (schema) => schema.required(),
            }),
        [REGULATION_SIDE]: yup
            .string()
            .nullable()
            .when([ENABLED, LOAD_TAP_CHANGING_CAPABILITIES, REGULATION_MODE, REGULATION_TYPE], {
                is: (
                    enabled: boolean,
                    hasLoadTapChangingCapabilities: boolean,
                    regulationMode: string,
                    regulationType: string
                ) =>
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
                is: (regulationMode: string, hasLoadTapChangingCapabilities: boolean) => {
                    return (
                        hasLoadTapChangingCapabilities &&
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
        [STEPS]: getRatioTapChangerStepsValidationSchema().when(ENABLED, {
            is: true,
            then: (schema) => schema.min(1, 'GenerateRatioTapRowsError'),
        }),
        //regulating terminal fields
        [VOLTAGE_LEVEL]: getVoltageLevelValidationSchema().when(
            [ENABLED, LOAD_TAP_CHANGING_CAPABILITIES, REGULATION_MODE, REGULATION_TYPE],
            {
                is: (
                    enabled: boolean,
                    hasLoadTapChangingCapabilities: boolean,
                    regulationMode: string,
                    regulationType: string
                ) =>
                    enabled &&
                    hasLoadTapChangingCapabilities &&
                    regulationMode === RATIO_REGULATION_MODES.VOLTAGE_REGULATION.id &&
                    regulationType === REGULATION_TYPES.DISTANT.id,
                then: (schema) => schema.required(),
            }
        ),
        [EQUIPMENT]: getEquipmentValidationSchema().when(
            [ENABLED, LOAD_TAP_CHANGING_CAPABILITIES, REGULATION_MODE, REGULATION_TYPE],
            {
                is: (
                    enabled: boolean,
                    hasLoadTapChangingCapabilities: boolean,
                    regulationMode: string,
                    regulationType: string
                ) =>
                    enabled &&
                    hasLoadTapChangingCapabilities &&
                    regulationMode === RATIO_REGULATION_MODES.VOLTAGE_REGULATION.id &&
                    regulationType === REGULATION_TYPES.DISTANT.id,
                then: (schema) => schema.required(),
            }
        ),
    }),
});

const ratioTapChangerModificationValidationSchema = (id: string) => ({
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
        [STEPS]: getRatioTapChangerStepsValidationSchema(),
        //regulating terminal fields
        [VOLTAGE_LEVEL]: getVoltageLevelValidationSchema(),
        [EQUIPMENT]: getEquipmentValidationSchema(),
    }),
});

export const getRatioTapChangerValidationSchema = (id = RATIO_TAP_CHANGER) => {
    return ratioTapChangerCreationValidationSchema(id);
};

export const getRatioTapChangerModificationValidationSchema = (id = RATIO_TAP_CHANGER) => {
    return ratioTapChangerModificationValidationSchema(id);
};

const ratioTapChangerEmptyFormData = (isModification: boolean, id: string) => ({
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
        voltageLevelId = undefined,
        equipmentId = undefined,
        equipmentType = undefined,
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

export const getComputedRegulationTypeId = (
    equipmentId: string,
    ratioTapChangerFormInfos: RatioTapChangerFormInfos
) => {
    const regulationType = getComputedRegulationType(equipmentId, ratioTapChangerFormInfos);
    return regulationType?.id || null;
};

export const getComputedRegulationType = (
    equipmentId?: string,
    ratioTapChangerFormInfos?: RatioTapChangerFormInfos
) => {
    if (
        !ratioTapChangerFormInfos?.hasLoadTapChangingCapabilities ||
        !ratioTapChangerFormInfos?.regulatingTerminalConnectableId
    ) {
        return null;
    }
    if (ratioTapChangerFormInfos?.regulatingTerminalConnectableId !== equipmentId) {
        return REGULATION_TYPES.DISTANT;
    } else {
        return REGULATION_TYPES.LOCAL;
    }
};

export const getComputedRegulationMode = (ratioTapChangerFormInfos: RatioTapChangerFormInfos) => {
    if (!ratioTapChangerFormInfos) {
        return null;
    }
    if (ratioTapChangerFormInfos?.isRegulating) {
        return RATIO_REGULATION_MODES.VOLTAGE_REGULATION;
    } else {
        return RATIO_REGULATION_MODES.FIXED_RATIO;
    }
};

export const getInitialTwtRatioRegulationModeId = (ratioTapChangerFormInfos: RatioTapChangerFormInfos) => {
    // if onLoadTapChangingCapabilities is set to false or undefined, we set the regulation mode to null
    if (!ratioTapChangerFormInfos?.hasLoadTapChangingCapabilities) {
        return null;
    }
    //otherwise, we compute it
    const computedRegulationMode = getComputedRegulationMode(ratioTapChangerFormInfos);
    return computedRegulationMode?.id || null;
};

export const getComputedPreviousRatioRegulationType = (
    equipmentId?: string,
    ratioTapChangerFormInfos?: RatioTapChangerFormInfos
) => {
    const previousRegulationType = getComputedRegulationType(equipmentId, ratioTapChangerFormInfos);
    return previousRegulationType?.id || null;
};

export const getComputedTapSideId = (
    equipmentId?: string,
    voltageLevelId1?: string,
    ratioTapChangerFormInfos?: RatioTapChangerFormInfos
) => {
    if (!ratioTapChangerFormInfos || !equipmentId) {
        return null;
    }
    if (ratioTapChangerFormInfos?.regulatingTerminalConnectableId === equipmentId) {
        return ratioTapChangerFormInfos?.regulatingTerminalVlId === voltageLevelId1 ? SIDE.SIDE1.id : SIDE.SIDE2.id;
    } else {
        return null;
    }
};

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
import { areArrayElementsUnique, areNumbersOrdered } from 'components/utils/utils';
import yup from 'components/utils/yup-config';
import {
    getRegulatingTerminalEmptyFormData,
    getRegulatingTerminalFormData,
} from '../../../../regulating-terminal/regulating-terminal-form-utils';
import { RATIO_REGULATION_MODES, REGULATION_TYPES, SIDE } from 'components/network/constants';
import { TapChangerStep } from '../tap-changer-pane.types';
import { TwoWindingsTransformerData } from '../../two-windings-transformer.types';

const getRegulatingTerminalRatioTapChangerValidationSchema = () => ({
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
        .when([ENABLED, LOAD_TAP_CHANGING_CAPABILITIES, REGULATION_TYPE], {
            is: (enabled: boolean, hasLoadTapChangingCapabilities: boolean, regulationType: string) =>
                enabled && hasLoadTapChangingCapabilities && regulationType === REGULATION_TYPES.DISTANT.id,
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
        .when([ENABLED, LOAD_TAP_CHANGING_CAPABILITIES, REGULATION_TYPE], {
            is: (enabled: boolean, hasLoadTapChangingCapabilities: boolean, regulationType: string) =>
                enabled && hasLoadTapChangingCapabilities && regulationType === REGULATION_TYPES.DISTANT.id,
            then: (schema) => schema.required(),
        }),
});

const ratioTapChangerValidationSchema = (isModification: boolean, id: string) => ({
    [id]: yup.object().shape({
        [ENABLED]: yup.bool().required(),
        [LOAD_TAP_CHANGING_CAPABILITIES]: yup
            .bool()
            .nullable()
            .when({
                is: !isModification,
                then: (schema) => schema.required(),
            }),
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
            .when([ENABLED, LOAD_TAP_CHANGING_CAPABILITIES, REGULATION_TYPE], {
                is: (enabled: boolean, hasLoadTapChangingCapabilities: boolean, regulationType: string) =>
                    enabled && hasLoadTapChangingCapabilities && regulationType === REGULATION_TYPES.LOCAL.id,
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
                is: (enabled: boolean) => enabled && !isModification,
                then: (schema) => schema.required(),
            }),
        [HIGH_TAP_POSITION]: yup
            .number()
            .nullable()
            .when(ENABLED, {
                is: (enabled: boolean) => enabled && !isModification,
                then: (schema) => schema.required(),
            }),
        [TAP_POSITION]: yup
            .number()
            .nullable()
            .when(ENABLED, {
                is: (enabled: boolean) => enabled && !isModification,
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
                const ratioArray = (array ?? []).map((step) => step[STEPS_RATIO]);
                return areNumbersOrdered(ratioArray) && areArrayElementsUnique(ratioArray);
            }),
        ...getRegulatingTerminalRatioTapChangerValidationSchema(),
    }),
});

export const getRatioTapChangerValidationSchema = (isModification = false, id = RATIO_TAP_CHANGER) => {
    return ratioTapChangerValidationSchema(isModification, id);
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

interface RatioTapChangerFormParams {
    enabled?: boolean;
    hasLoadTapChangingCapabilities?: boolean | null;
    regulationMode?: string | null;
    regulationType?: string | null;
    regulationSide?: string | null;
    targetV?: number | null;
    targetDeadband?: number | null;
    lowTapPosition?: number | null;
    highTapPosition?: number | null;
    tapPosition?: number | null;
    steps?: TapChangerStep[];
    voltageLevelId?: string;
    equipmentId?: string;
    equipmentType?: string;
}

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
    }: RatioTapChangerFormParams,
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

export const getComputedRegulationType = (twt: TwoWindingsTransformerData) => {
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

export const getComputedRegulationTypeId = (twt: TwoWindingsTransformerData) => {
    const regulationType = getComputedRegulationType(twt);
    return regulationType?.id || null;
};

export const getComputedRegulationMode = (twt: TwoWindingsTransformerData) => {
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

export const getInitialTwtRatioRegulationModeId = (twt: TwoWindingsTransformerData) => {
    // if onLoadTapChangingCapabilities is set to false or undefined, we set the regulation mode to null
    if (!twt?.ratioTapChanger?.hasLoadTapChangingCapabilities) {
        return null;
    }
    //otherwise, we compute it
    const computedRegulationMode = getComputedRegulationMode(twt);
    return computedRegulationMode?.id || null;
};

export const getComputedRegulationModeId = (twt: TwoWindingsTransformerData) => {
    return getComputedRegulationMode(twt)?.id || null;
};

export const getComputedPreviousRatioRegulationType = (previousValues: TwoWindingsTransformerData) => {
    const previousRegulationType = getComputedRegulationType(previousValues);
    return previousRegulationType?.id || null;
};

export const getComputedTapSide = (twt: TwoWindingsTransformerData) => {
    const ratioTapChangerValues = twt?.ratioTapChanger;
    if (!ratioTapChangerValues || !twt) {
        return null;
    }
    if (ratioTapChangerValues?.regulatingTerminalConnectableId === twt?.id) {
        return ratioTapChangerValues?.regulatingTerminalVlId === twt?.voltageLevelId1 ? SIDE.SIDE1 : SIDE.SIDE2;
    } else {
        return null;
    }
};

export const getComputedTapSideId = (twt: TwoWindingsTransformerData) => {
    return getComputedTapSide(twt)?.id || null;
};

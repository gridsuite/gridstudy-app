/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import yup from '../../../../../utils/yup-config';
import {
    ACTIVE_POWER_SETPOINT,
    ANGLE_DROOP_ACTIVE_POWER_CONTROL,
    CONVERTERS_MODE,
    NOMINAL_V,
    R,
    DROOP,
    MAX_P,
    OPERATOR_ACTIVE_POWER_LIMIT_SIDE1,
    OPERATOR_ACTIVE_POWER_LIMIT_SIDE2,
    P0,
} from '../../../../../utils/field-constants';
import { VscFormInfos } from '../vsc-dialog.type';
import { VscCreationInfos } from '../../../../../../services/network-modification-types';

export function getVscHvdcLinePaneSchema(id: string) {
    return {
        [id]: yup.object().shape(
            {
                [NOMINAL_V]: yup.number().nullable().min(0, 'mustBeGreaterOrEqualToZero').required(),
                [R]: yup.number().nullable().min(0, 'mustBeGreaterOrEqualToZero').required(),
                [MAX_P]: yup.number().nullable().required(),
                [OPERATOR_ACTIVE_POWER_LIMIT_SIDE1]: yup.number().nullable(),
                [OPERATOR_ACTIVE_POWER_LIMIT_SIDE2]: yup.number().nullable(),
                [CONVERTERS_MODE]: yup.string().required(),
                [ANGLE_DROOP_ACTIVE_POWER_CONTROL]: yup.boolean(),
                [ACTIVE_POWER_SETPOINT]: yup.number().nullable().required(),
                [P0]: yup
                    .number()
                    .nullable()
                    .when([ANGLE_DROOP_ACTIVE_POWER_CONTROL, DROOP], {
                        is: (angleDroopActivePowerControl: boolean, droop: number) =>
                            angleDroopActivePowerControl || (droop !== null && droop !== undefined),
                        then: (schema) => schema.required(),
                    }),
                [DROOP]: yup
                    .number()
                    .nullable()
                    .when([ANGLE_DROOP_ACTIVE_POWER_CONTROL, P0], {
                        is: (angleDroopActivePowerControl: boolean, p0: number) =>
                            angleDroopActivePowerControl || (p0 !== null && p0 !== undefined),
                        then: (schema) => schema.required(),
                    }),
            },
            [[P0, DROOP]]
        ),
    };
}

export function getVscHvdcLineModificationPaneSchema(id: string) {
    return {
        [id]: yup.object().shape(
            {
                [NOMINAL_V]: yup.number().nullable().min(0, 'mustBeGreaterOrEqualToZero'),
                [R]: yup.number().nullable().min(0, 'mustBeGreaterOrEqualToZero'),
                [MAX_P]: yup.number().nullable(),
                [OPERATOR_ACTIVE_POWER_LIMIT_SIDE1]: yup.number().nullable(),
                [OPERATOR_ACTIVE_POWER_LIMIT_SIDE2]: yup.number().nullable(),
                [CONVERTERS_MODE]: yup.string().nullable(),
                [ANGLE_DROOP_ACTIVE_POWER_CONTROL]: yup.boolean().nullable(),
                [ACTIVE_POWER_SETPOINT]: yup.number().nullable().nullable(),
                [P0]: yup.number().nullable(),
                [DROOP]: yup.number().nullable(),
            },
            [[P0, DROOP]]
        ),
    };
}
export function getVscHvdcLinePaneEmptyFormData(id: string, isModification: boolean) {
    return {
        [id]: {
            [NOMINAL_V]: null,
            [R]: null,
            [MAX_P]: null,
            [OPERATOR_ACTIVE_POWER_LIMIT_SIDE1]: null,
            [OPERATOR_ACTIVE_POWER_LIMIT_SIDE2]: null,
            [CONVERTERS_MODE]: null,
            [ACTIVE_POWER_SETPOINT]: null,
            [ANGLE_DROOP_ACTIVE_POWER_CONTROL]: isModification ? null : false,
            [P0]: null,
            [DROOP]: null,
        },
    };
}

export function getVscHvdcLineTabFormData(id: string, hvdcLine: VscFormInfos) {
    return {
        [id]: {
            [NOMINAL_V]: hvdcLine.nominalV,
            [R]: hvdcLine.r,
            [MAX_P]: hvdcLine.maxP,
            [OPERATOR_ACTIVE_POWER_LIMIT_SIDE1]: hvdcLine?.hvdcOperatorActivePowerRange?.oprFromCS1toCS2,
            [OPERATOR_ACTIVE_POWER_LIMIT_SIDE2]: hvdcLine?.hvdcOperatorActivePowerRange?.oprFromCS1toCS2,
            [CONVERTERS_MODE]: hvdcLine.convertersMode,
            [ACTIVE_POWER_SETPOINT]: hvdcLine.activePowerSetpoint,
            [ANGLE_DROOP_ACTIVE_POWER_CONTROL]: hvdcLine?.hvdcAngleDroopActivePowerControl?.isEnabled,
            [P0]: hvdcLine?.hvdcAngleDroopActivePowerControl?.p0,
            [DROOP]: hvdcLine?.hvdcAngleDroopActivePowerControl?.droop,
        },
    };
}

export function getVscHvdcLineTabFormEditData(id: string, hvdcLine: VscCreationInfos) {
    return {
        [id]: {
            [NOMINAL_V]: hvdcLine.nominalV,
            [R]: hvdcLine.r,
            [MAX_P]: hvdcLine.maxP,
            [OPERATOR_ACTIVE_POWER_LIMIT_SIDE1]: hvdcLine?.operatorActivePowerLimitFromSide2ToSide1,
            [OPERATOR_ACTIVE_POWER_LIMIT_SIDE2]: hvdcLine?.operatorActivePowerLimitFromSide1ToSide2,
            [CONVERTERS_MODE]: hvdcLine.convertersMode,
            [ACTIVE_POWER_SETPOINT]: hvdcLine.activePowerSetpoint,
            [ANGLE_DROOP_ACTIVE_POWER_CONTROL]: hvdcLine?.angleDroopActivePowerControl,
            [P0]: hvdcLine?.p0,
            [DROOP]: hvdcLine?.droop,
        },
    };
}

export function getVscHvdcLineModificationTabFormData(id: string, hvdcLine: any) {
    return {
        [id]: {
            [NOMINAL_V]: hvdcLine?.nominalV?.value ?? null,
            [R]: hvdcLine?.r?.value ?? null,
            [MAX_P]: hvdcLine?.maxP?.value ?? null,
            [OPERATOR_ACTIVE_POWER_LIMIT_SIDE1]: hvdcLine?.operatorActivePowerLimitFromSide1ToSide2?.value ?? null,
            [OPERATOR_ACTIVE_POWER_LIMIT_SIDE2]: hvdcLine?.operatorActivePowerLimitFromSide2ToSide1?.value ?? null,
            [CONVERTERS_MODE]: hvdcLine?.convertersMode?.value ?? null,
            [ACTIVE_POWER_SETPOINT]: hvdcLine?.activePowerSetpoint?.value ?? null,
            [ANGLE_DROOP_ACTIVE_POWER_CONTROL]: hvdcLine?.angleDroopActivePowerControl?.value ?? null,
            [P0]: hvdcLine?.p0?.value ?? null,
            [DROOP]: hvdcLine?.droop?.value ?? null,
        },
    };
}

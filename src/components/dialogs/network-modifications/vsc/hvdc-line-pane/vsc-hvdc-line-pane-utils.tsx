/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import yup from '../../../../utils/yup-config';
import {
    ACTIVE_POWER,
    ANGLE_DROOP_ACTIVE_POWER_CONTROL,
    CONVERTERS_MODE,
    DC_NOMINAL_VOLTAGE,
    DC_RESISTANCE,
    DROOP,
    MAXIMUM_ACTIVE_POWER,
    OPERATOR_ACTIVE_POWER_LIMIT_SIDE1,
    OPERATOR_ACTIVE_POWER_LIMIT_SIDE2,
    P0,
} from '../../../../utils/field-constants';

export function getVscHvdcLinePaneSchema(id: string) {
    return {
        [id]: yup.object().shape(
            {
                [DC_NOMINAL_VOLTAGE]: yup.number().nullable().required(),
                [DC_RESISTANCE]: yup.number().nullable().required(),
                [MAXIMUM_ACTIVE_POWER]: yup.number().nullable().required(),
                [OPERATOR_ACTIVE_POWER_LIMIT_SIDE1]: yup.number().nullable(),
                [OPERATOR_ACTIVE_POWER_LIMIT_SIDE2]: yup.number().nullable(),
                [CONVERTERS_MODE]: yup.string().required(),
                [ANGLE_DROOP_ACTIVE_POWER_CONTROL]: yup.boolean(),
                [ACTIVE_POWER]: yup.number().nullable().required(),
                [P0]: yup
                    .number()
                    .nullable()
                    .when([ANGLE_DROOP_ACTIVE_POWER_CONTROL, DROOP], {
                        is: (
                            angleDroopActivePowerControl: boolean,
                            droop: number
                        ) => angleDroopActivePowerControl || droop,
                        then: (schema) => schema.required(),
                    }),
                [DROOP]: yup
                    .number()
                    .nullable()
                    .when([ANGLE_DROOP_ACTIVE_POWER_CONTROL, P0], {
                        is: (
                            angleDroopActivePowerControl: boolean,
                            p0: number
                        ) => angleDroopActivePowerControl || p0,
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
                [DC_NOMINAL_VOLTAGE]: yup.number().nullable(),
                [DC_RESISTANCE]: yup.number().nullable(),
                [MAXIMUM_ACTIVE_POWER]: yup.number().nullable(),
                [OPERATOR_ACTIVE_POWER_LIMIT_SIDE1]: yup.number().nullable(),
                [OPERATOR_ACTIVE_POWER_LIMIT_SIDE2]: yup.number().nullable(),
                [CONVERTERS_MODE]: yup.string().nullable(),
                [ANGLE_DROOP_ACTIVE_POWER_CONTROL]: yup.boolean().nullable(),
                [ACTIVE_POWER]: yup.number().nullable().nullable(),
                [P0]: yup.number().nullable(),
                [DROOP]: yup.number().nullable(),
            },
            [[P0, DROOP]]
        ),
    };
}
export function getVscHvdcLinePaneEmptyFormData(
    id: string,
    isModification: boolean
) {
    return {
        [id]: {
            [DC_NOMINAL_VOLTAGE]: null,
            [DC_RESISTANCE]: null,
            [MAXIMUM_ACTIVE_POWER]: null,
            [OPERATOR_ACTIVE_POWER_LIMIT_SIDE1]: null,
            [OPERATOR_ACTIVE_POWER_LIMIT_SIDE2]: null,
            [CONVERTERS_MODE]: null,
            [ACTIVE_POWER]: null,
            [ANGLE_DROOP_ACTIVE_POWER_CONTROL]: isModification ? null : false,
            [P0]: null,
            [DROOP]: null,
        },
    };
}
export interface hvdcLineTabEditData {
    dcNominalVoltage: number;
    dcResistance: number;
    maximumActivePower: number;
    operatorActivePowerLimitFromSide1ToSide2?: number | null;
    operatorActivePowerLimitFromSide2ToSide1?: number | null;
    convertersMode: string;
    activePower: number;
    angleDroopActivePowerControl: boolean;
    p0?: number | null;
    droop?: number | null;
}

export function getVscHvdcLineTabFormData(
    id: string,
    hvdcLine: hvdcLineTabEditData
) {
    return {
        [id]: {
            [DC_NOMINAL_VOLTAGE]: hvdcLine.dcNominalVoltage,
            [DC_RESISTANCE]: hvdcLine.dcResistance,
            [MAXIMUM_ACTIVE_POWER]: hvdcLine.maximumActivePower,
            [OPERATOR_ACTIVE_POWER_LIMIT_SIDE1]:
                hvdcLine?.operatorActivePowerLimitFromSide1ToSide2,
            [OPERATOR_ACTIVE_POWER_LIMIT_SIDE2]:
                hvdcLine?.operatorActivePowerLimitFromSide2ToSide1,
            [CONVERTERS_MODE]: hvdcLine.convertersMode,
            [ACTIVE_POWER]: hvdcLine.activePower,
            [ANGLE_DROOP_ACTIVE_POWER_CONTROL]:
                hvdcLine.angleDroopActivePowerControl,
            [P0]: hvdcLine?.p0,
            [DROOP]: hvdcLine?.droop,
        },
    };
}

export function getVscHvdcLineModificationTabFormData(
    id: string,
    hvdcLine: any
) {
    return {
        [id]: {
            [DC_NOMINAL_VOLTAGE]: hvdcLine?.dcNominalVoltage?.value ?? null,
            [DC_RESISTANCE]: hvdcLine?.dcResistance?.value ?? null,
            [MAXIMUM_ACTIVE_POWER]: hvdcLine?.maximumActivePower?.value ?? null,
            [OPERATOR_ACTIVE_POWER_LIMIT_SIDE1]:
                hvdcLine?.operatorActivePowerLimitFromSide1ToSide2?.value ??
                null,
            [OPERATOR_ACTIVE_POWER_LIMIT_SIDE2]:
                hvdcLine?.operatorActivePowerLimitFromSide2ToSide1?.value ??
                null,
            [CONVERTERS_MODE]: hvdcLine?.convertersMode?.value ?? null,
            [ACTIVE_POWER]: hvdcLine?.activePower?.value ?? null,
            [ANGLE_DROOP_ACTIVE_POWER_CONTROL]:
                hvdcLine?.angleDroopActivePowerControl?.value ?? null,
            [P0]: hvdcLine?.p0?.value ?? null,
            [DROOP]: hvdcLine?.droop?.value ?? null,
        },
    };
}

/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {
    PARAM_SA_FLOW_PROPORTIONAL_THRESHOLD,
    PARAM_SA_HIGH_VOLTAGE_ABSOLUTE_THRESHOLD,
    PARAM_SA_HIGH_VOLTAGE_PROPORTIONAL_THRESHOLD,
    PARAM_SA_LOW_VOLTAGE_ABSOLUTE_THRESHOLD,
    PARAM_SA_LOW_VOLTAGE_PROPORTIONAL_THRESHOLD,
} from 'utils/config-params';
import yup from '../../../../utils/yup-config';

export const LIMIT_REDUCTIONS_FORM = 'limitReductionsForm';
export const VOLTAGE_LEVELS_FORM = 'voltageLevelsForm';
export const IST_FORM = 'istForm';
export const LIMIT_DURATION_FORM = 'limitReductionForm';

export interface IVoltageLevel {
    nominalV: number;
    lowBound: number;
    highBound: number;
}

export interface ILimitDuration {
    lowBound: number;
    lowClosed: boolean;
    highBound: number;
    highClosed: boolean;
}

export interface ITemporaryLimitReduction {
    reduction: number;
    limitDuration: ILimitDuration;
}

export interface ILimitReductionsByVoltageLevel {
    voltageLevel: IVoltageLevel;
    permanentLimitReduction: number;
    temporaryLimitReductions: ITemporaryLimitReduction[];
}

export interface ISAParameters {
    limitReductions: ILimitReductionsByVoltageLevel[];
    [PARAM_SA_FLOW_PROPORTIONAL_THRESHOLD]: number;
    [PARAM_SA_LOW_VOLTAGE_PROPORTIONAL_THRESHOLD]: number;
    [PARAM_SA_LOW_VOLTAGE_ABSOLUTE_THRESHOLD]: number;
    [PARAM_SA_HIGH_VOLTAGE_PROPORTIONAL_THRESHOLD]: number;
    [PARAM_SA_HIGH_VOLTAGE_ABSOLUTE_THRESHOLD]: number;
}

export enum TAB_VALUES {
    'General' = 0,
    'LimitReductions' = 1,
}

export const TAB_INFO = [
    { label: TAB_VALUES[TAB_VALUES.General], developerModeOnly: false },
    { label: TAB_VALUES[TAB_VALUES.LimitReductions], developerModeOnly: true },
];

export interface IColumnsDef {
    label: string;
    dataKey: string;
    width?: string;
}

export const COLUMNS_DEFINITIONS_LIMIT_REDUCTIONS = [
    {
        label: 'VoltageLevels',
        dataKey: VOLTAGE_LEVELS_FORM,
    },
    {
        label: 'IST',
        dataKey: IST_FORM,
    },
];

export const getLimitReductionsFormSchema = (nbTemporaryLimits: number) => {
    return yup
        .object()
        .shape({
            [LIMIT_REDUCTIONS_FORM]: yup.array().of(
                yup.object().shape({
                    [VOLTAGE_LEVELS_FORM]: yup.string(),
                    [IST_FORM]: yup.number().min(0, 'RealPercentage').max(1, 'RealPercentage').nullable().required(),
                    [LIMIT_DURATION_FORM]: yup
                        .array() //TODO check still working
                        .length(nbTemporaryLimits)
                        .of(yup.number().min(0, 'RealPercentage').max(1, 'RealPercentage').nullable().required())
                        .required(),
                })
            ),
        })
        .required();
};

export const getSAParametersFromSchema = (limitReductions?: ILimitReductionsByVoltageLevel[]) => {
    const limitReductionsSchema = getLimitReductionsFormSchema(
        limitReductions ? limitReductions[0].temporaryLimitReductions.length : 0
    );

    const thresholdsSchema = yup.object().shape({
        [PARAM_SA_FLOW_PROPORTIONAL_THRESHOLD]: yup
            .number()
            .min(0, 'NormalizedPercentage')
            .max(100, 'NormalizedPercentage')
            .required(),
        [PARAM_SA_LOW_VOLTAGE_PROPORTIONAL_THRESHOLD]: yup
            .number()
            .min(0, 'NormalizedPercentage')
            .max(100, 'NormalizedPercentage')
            .required(),
        [PARAM_SA_LOW_VOLTAGE_ABSOLUTE_THRESHOLD]: yup.number().required(),
        [PARAM_SA_HIGH_VOLTAGE_PROPORTIONAL_THRESHOLD]: yup
            .number()
            .min(0, 'NormalizedPercentage')
            .max(100, 'NormalizedPercentage')
            .required(),
        [PARAM_SA_HIGH_VOLTAGE_ABSOLUTE_THRESHOLD]: yup.number().required(),
    });

    return yup.object().shape({
        ...limitReductionsSchema.fields,
        ...thresholdsSchema.fields,
    });
};

/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import yup from '../../../utils/yup-config';
import { NumberSchema } from 'yup';

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
    lowClosed: number;
    highBound: number;
    highClosed: number;
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

export enum TAB_VALUES {
    'General' = 0,
    'LimitReductions' = 1,
}

export interface IColumnsDef {
    label: string;
    dataKey: string;
    width?: string;
}

export const COLUMNS_DEFINITIONS_LIMIT_REDUCTIONS = [
    {
        label: 'VoltageLevels',
        dataKey: VOLTAGE_LEVELS_FORM,
        width: '40%',
    },
    {
        label: 'IST',
        dataKey: IST_FORM,
        width: '20%',
    },
];

const getLimitDurationsFormSchema = (
    limits: ILimitReductionsByVoltageLevel[]
) => {
    let limitDurationsFormSchema: Record<string, NumberSchema> = {};
    if (limits) {
        for (let i = 0; i < limits[0].temporaryLimitReductions.length; i++) {
            limitDurationsFormSchema[LIMIT_DURATION_FORM + i] = yup.number();
        }
    }
    return limitDurationsFormSchema;
};

export const getLimitReductionsFormSchema = (
    limits: ILimitReductionsByVoltageLevel[]
) => {
    return yup
        .object()
        .shape({
            [LIMIT_REDUCTIONS_FORM]: yup.array().of(
                yup.object().shape({
                    [VOLTAGE_LEVELS_FORM]: yup.string(),
                    [IST_FORM]: yup.number(),
                    ...getLimitDurationsFormSchema(limits),
                })
            ),
        })
        .required();
};

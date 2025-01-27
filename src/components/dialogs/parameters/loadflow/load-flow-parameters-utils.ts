/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import yup from 'components/utils/yup-config';
import { ILimitReductionsByVoltageLevel, LIMIT_REDUCTIONS_FORM } from '../common/limitreductions/columns-definitions';
import { PROVIDER } from 'components/utils/field-constants';
import {
    BALANCE_TYPE,
    COMMON_PARAMETERS,
    CONNECTED_COMPONENT_MODE,
    COUNTRIES_TO_BALANCE,
    DC,
    DC_POWER_FACTOR,
    DC_USE_TRANSFORMER_RATIO,
    DISTRIBUTED_SLACK,
    HVDC_AC_EMULATION,
    PHASE_SHIFTER_REGULATION_ON,
    READ_SLACK_BUS,
    SHUNT_COMPENSATOR_VOLTAGE_CONTROL_ON,
    SPECIFIC_PARAMETERS,
    TRANSFORMER_VOLTAGE_CONTROL_ON,
    TWT_SPLIT_SHUNT_ADMITTANCE,
    TYPES,
    USE_REACTIVE_LIMITS,
    VOLTAGE_INIT_MODE,
    WRITE_SLACK_BUS,
} from './constants';

export interface ParameterDescription {
    name: string;
    type: string;
    description?: string;
    label?: string;
    possibleValues?: { id: string; label: string }[] | string[];
    defaultValue?: any;
}

export interface FormLimits {
    [PROVIDER]: string;
    [COMMON_PARAMETERS]: Record<string, unknown>;
    [SPECIFIC_PARAMETERS]: Record<string, unknown>;
    [LIMIT_REDUCTIONS_FORM]: Record<string, unknown>[];
}

export interface Parameters {
    provider: string;
    commonParameters: Record<string, unknown>;
    specificParametersPerProvider: Record<string, Record<string, unknown>>;
    limitReductions: ILimitReductionsByVoltageLevel[];
}

export enum TAB_VALUES {
    GENERAL = 'General',
    LIMIT_REDUCTIONS = 'LimitReductions',
}

export const getBasicLoadFlowParametersFormSchema = () => {
    return yup.object().shape({
        [TRANSFORMER_VOLTAGE_CONTROL_ON]: yup.boolean().required(),
        [PHASE_SHIFTER_REGULATION_ON]: yup.boolean().required(),
        [DC]: yup.boolean().required(),
        [BALANCE_TYPE]: yup.string().required(),
        [COUNTRIES_TO_BALANCE]: yup.array().of(yup.string()).required(),
        [CONNECTED_COMPONENT_MODE]: yup.string().required(),
        [HVDC_AC_EMULATION]: yup.boolean().required(),
    });
};

export const getAdvancedLoadFlowParametersFormSchema = () => {
    return yup.object().shape({
        [VOLTAGE_INIT_MODE]: yup.string().required(),
        [USE_REACTIVE_LIMITS]: yup.boolean().required(),
        [TWT_SPLIT_SHUNT_ADMITTANCE]: yup.boolean().required(),
        [READ_SLACK_BUS]: yup.boolean().required(),
        [WRITE_SLACK_BUS]: yup.boolean().required(),
        [DISTRIBUTED_SLACK]: yup.boolean().required(),
        [SHUNT_COMPENSATOR_VOLTAGE_CONTROL_ON]: yup.boolean().required(),
        [DC_USE_TRANSFORMER_RATIO]: yup.boolean().required(),
        [DC_POWER_FACTOR]: yup
            .number()
            .required()
            .min(0, 'dcPowerFactorValidationErrorMessage')
            .max(1, 'dcPowerFactorValidationErrorMessage'),
    });
};

export const getCommonLoadFlowParametersFormSchema = () => {
    return yup.object().shape({
        [COMMON_PARAMETERS]: yup.object().shape({
            ...getBasicLoadFlowParametersFormSchema().fields,
            ...getAdvancedLoadFlowParametersFormSchema().fields,
        }),
    });
};

export const getSpecificLoadFlowParametersFormSchema = (specificParameters: ParameterDescription[]) => {
    const shape: { [key: string]: yup.AnySchema } = {};

    specificParameters?.forEach((param: ParameterDescription) => {
        switch (param.type) {
            case TYPES.STRING:
                shape[param.name] = yup.string().required();
                break;
            case TYPES.DOUBLE:
                shape[param.name] = yup.number().required();
                break;
            case TYPES.INTEGER:
                shape[param.name] = yup.number().required();
                break;
            case TYPES.BOOLEAN:
                shape[param.name] = yup.boolean().required();
                break;
            case TYPES.STRING_LIST:
                shape[param.name] = yup.array().of(yup.string()).required();
                break;
            default:
                shape[param.name] = yup.mixed().required();
        }
    });

    return yup.object().shape({
        [SPECIFIC_PARAMETERS]: yup.object().shape(shape),
    });
};

export const getDefaultSpecificParamsValues = (specificParams: ParameterDescription[]) => {
    return specificParams?.reduce((acc: Record<string, any>, param: ParameterDescription) => {
        if (param.type === TYPES.STRING_LIST && param.defaultValue === null) {
            acc[param.name] = [];
        } else if ((param.type === TYPES.DOUBLE || param.type === TYPES.INTEGER) && isNaN(param.defaultValue)) {
            acc[param.name] = 0;
        } else {
            acc[param.name] = param.defaultValue;
        }
        return acc;
    }, {});
};

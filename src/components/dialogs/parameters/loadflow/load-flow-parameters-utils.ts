/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import yup from 'components/utils/yup-config';
import {
    ILimitReductionsByVoltageLevel,
    IST_FORM,
    LIMIT_DURATION_FORM,
    LIMIT_REDUCTIONS_FORM,
} from '../common/limitreductions/columns-definitions';
import {
    BALANCE_TYPE,
    COMMON_PARAMETERS,
    CONNECTED_COMPONENT_MODE,
    COUNTRIES_TO_BALANCE,
    DC,
    DC_POWER_FACTOR,
    DC_USE_TRANSFORMER_RATIO,
    DEFAULT_LIMIT_REDUCTION_VALUE,
    DISTRIBUTED_SLACK,
    HVDC_AC_EMULATION,
    PHASE_SHIFTER_REGULATION_ON,
    READ_SLACK_BUS,
    SHUNT_COMPENSATOR_VOLTAGE_CONTROL_ON,
    SPECIFIC_PARAMETERS,
    TRANSFORMER_VOLTAGE_CONTROL_ON,
    TWT_SPLIT_SHUNT_ADMITTANCE,
    USE_REACTIVE_LIMITS,
    VOLTAGE_INIT_MODE,
    WRITE_SLACK_BUS,
} from './constants';
import { toFormValuesLimitReductions } from '../common/limitreductions/limit-reductions-form-util';
import { PARAM_LIMIT_REDUCTION, PARAM_PROVIDER_OPENLOADFLOW } from 'utils/config-params';
import { UseFormReturn } from 'react-hook-form';
import { ParameterType, SpecificParameterInfos } from '../parameters.type';
import { SpecificParametersPerProvider } from 'services/study/loadflow.type';

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
            .positive('dcPowerFactorGreaterThan0')
            .max(1, 'dcPowerFactorLessOrEqualThan1'),
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

export const getSpecificLoadFlowParametersFormSchema = (specificParameters: SpecificParameterInfos[]) => {
    const shape: { [key: string]: yup.AnySchema } = {};

    specificParameters?.forEach((param: SpecificParameterInfos) => {
        switch (param.type) {
            case ParameterType.STRING:
                shape[param.name] = yup.string().required();
                break;
            case ParameterType.DOUBLE:
                shape[param.name] = yup.number().required();
                break;
            case ParameterType.INTEGER:
                shape[param.name] = yup.number().required();
                break;
            case ParameterType.BOOLEAN:
                shape[param.name] = yup.boolean().required();
                break;
            case ParameterType.STRING_LIST:
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

export const getDefaultSpecificParamsValues = (
    specificParams: SpecificParameterInfos[]
): SpecificParametersPerProvider => {
    return specificParams?.reduce((acc: Record<string, any>, param: SpecificParameterInfos) => {
        if (param.type === ParameterType.STRING_LIST && param.defaultValue === null) {
            acc[param.name] = [];
        } else if (
            (param.type === ParameterType.DOUBLE || param.type === ParameterType.INTEGER) &&
            isNaN(param.defaultValue)
        ) {
            acc[param.name] = 0;
        } else {
            acc[param.name] = param.defaultValue;
        }
        return acc;
    }, {});
};

export const setSpecificParameters = (
    provider: string,
    specificParamsDescriptions: Record<string, SpecificParameterInfos[]> | null,
    formMethods: UseFormReturn
) => {
    const specificParams = provider ? specificParamsDescriptions?.[provider] ?? [] : [];
    const specificParamsValues = getDefaultSpecificParamsValues(specificParams);
    formMethods.setValue(SPECIFIC_PARAMETERS, specificParamsValues);
};

export const setLimitReductions = (
    provider: string,
    defaultLimitReductions: ILimitReductionsByVoltageLevel[],
    formMethods: UseFormReturn
) => {
    if (provider === PARAM_PROVIDER_OPENLOADFLOW) {
        formMethods.setValue(
            LIMIT_REDUCTIONS_FORM,
            toFormValuesLimitReductions(defaultLimitReductions)[LIMIT_REDUCTIONS_FORM]
        );
        formMethods.setValue(PARAM_LIMIT_REDUCTION, null);
    } else {
        formMethods.setValue(PARAM_LIMIT_REDUCTION, DEFAULT_LIMIT_REDUCTION_VALUE);
        formMethods.setValue(LIMIT_REDUCTIONS_FORM, []);
    }
};

export const mapLimitReductions = (
    vlLimits: ILimitReductionsByVoltageLevel,
    formLimits: Record<string, unknown>[],
    indexVl: number
): ILimitReductionsByVoltageLevel => {
    let vlLNewLimits: ILimitReductionsByVoltageLevel = {
        ...vlLimits,
        permanentLimitReduction: formLimits[indexVl][IST_FORM] as number,
    };
    vlLimits.temporaryLimitReductions.forEach((temporaryLimit, index) => {
        vlLNewLimits.temporaryLimitReductions[index] = {
            ...temporaryLimit,
            reduction: formLimits[indexVl][LIMIT_DURATION_FORM + index] as number,
        };
    });
    return vlLNewLimits;
};

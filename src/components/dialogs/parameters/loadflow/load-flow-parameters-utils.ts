/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import yup from 'components/utils/yup-config';

export const COMMON_PARAMETERS = 'commonParameters';
export const SPECIFIC_PARAMETERS = 'specificParametersPerProvider';

// BasicLoadFlowParameters
export const TRANSFORMER_VOLTAGE_CONTROL_ON = 'transformerVoltageControlOn';
export const PHASE_SHIFTER_REGULATION_ON = 'phaseShifterRegulationOn';
export const DC = 'dc';
export const BALANCE_TYPE = 'balanceType';
export const COUNTRIES_TO_BALANCE = 'countriesToBalance';
export const CONNECTED_COMPONENT_MODE = 'connectedComponentMode';
export const HVDC_AC_EMULATION = 'hvdcAcEmulation';

// AdvancedLoadFlowParameters
export const VOLTAGE_INIT_MODE = 'voltageInitMode';
export const USE_REACTIVE_LIMITS = 'useReactiveLimits';
export const TWT_SPLIT_SHUNT_ADMITTANCE = 'twtSplitShuntAdmittance';
export const READ_SLACK_BUS = 'readSlackBus';
export const WRITE_SLACK_BUS = 'writeSlackBus';
export const DISTRIBUTED_SLACK = 'distributedSlack';
export const SHUNT_COMPENSATOR_VOLTAGE_CONTROL_ON = 'shuntCompensatorVoltageControlOn';
export const DC_USE_TRANSFORMER_RATIO = 'dcUseTransformerRatio';
export const DC_POWER_FACTOR = 'dcPowerFactor';

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
        [DC_POWER_FACTOR]: yup.number().required(),
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

export const TYPES = {
    STRING_LIST: 'STRING_LIST',
    BOOLEAN: 'BOOLEAN',
    COUNTRIES: 'COUNTRIES',
    DOUBLE: 'DOUBLE',
    STRING: 'STRING',
    INTEGER: 'INTEGER',
};

export const getSpecificLoadFlowParametersFormSchema = (specificParameters: any) => {
    const shape: { [key: string]: yup.AnySchema } = {};

    specificParameters?.forEach((param: any) => {
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

export enum TAB_VALUES {
    GENERAL = 'General',
    LIMIT_REDUCTIONS = 'LimitReductions',
}

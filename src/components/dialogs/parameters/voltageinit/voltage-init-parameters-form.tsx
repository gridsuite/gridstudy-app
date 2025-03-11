/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import yup from '../../../utils/yup-config';
import {
    FILTERS,
    GENERATORS_SELECTION_TYPE,
    VARIABLE_Q_GENERATORS,
    HIGH_VOLTAGE_LIMIT,
    ID,
    LOW_VOLTAGE_LIMIT,
    NAME,
    SELECTED,
    UPDATE_BUS_VOLTAGE,
    SHUNT_COMPENSATORS_SELECTION_TYPE,
    VARIABLE_SHUNT_COMPENSATORS,
    TRANSFORMERS_SELECTION_TYPE,
    VARIABLE_TRANSFORMERS,
    VOLTAGE_LIMITS_DEFAULT,
    VOLTAGE_LIMITS_MODIFICATION,
} from '../../../utils/field-constants';
import { isBlankOrEmpty } from '../../../utils/validation-functions';
import { REACTIVE_SLACKS_THRESHOLD, SHUNT_COMPENSATOR_ACTIVATION_THRESHOLD } from './voltage-init-constants';

import { EquipmentsSelectionType } from './voltage-init.type';

export const GENERAL = 'GENERAL';
export const GENERAL_APPLY_MODIFICATIONS = 'GENERAL_APPLY_MODIFICATIONS';

export const DEFAULT_GENERAL_APPLY_MODIFICATIONS = true;
export const DEFAULT_UPDATE_BUS_VOLTAGE = true;
export const DEFAULT_REACTIVE_SLACKS_THRESHOLD = 500;
export const DEFAULT_SHUNT_COMPENSATOR_ACTIVATION_THRESHOLD = 0;

export enum TabValue {
    GENERAL = 'GENERAL',
    VOLTAGE_LIMITS = 'voltageLimits',
    EQUIPMENTS_SELECTION = 'equipmentSelection',
}

export const initialVoltageInitParametersForm: VoltageInitParametersForm = {
    [GENERAL]: {
        [GENERAL_APPLY_MODIFICATIONS]: DEFAULT_GENERAL_APPLY_MODIFICATIONS,
        [UPDATE_BUS_VOLTAGE]: DEFAULT_UPDATE_BUS_VOLTAGE,
        [REACTIVE_SLACKS_THRESHOLD]: DEFAULT_REACTIVE_SLACKS_THRESHOLD,
        [SHUNT_COMPENSATOR_ACTIVATION_THRESHOLD]: DEFAULT_SHUNT_COMPENSATOR_ACTIVATION_THRESHOLD,
    },
    [VOLTAGE_LIMITS_MODIFICATION]: [],
    [VOLTAGE_LIMITS_DEFAULT]: [],
    [GENERATORS_SELECTION_TYPE]: 'ALL_EXCEPT',
    [VARIABLE_Q_GENERATORS]: [],
    [TRANSFORMERS_SELECTION_TYPE]: 'NONE_EXCEPT',
    [VARIABLE_TRANSFORMERS]: [],
    [SHUNT_COMPENSATORS_SELECTION_TYPE]: 'NONE_EXCEPT',
    [VARIABLE_SHUNT_COMPENSATORS]: [],
};

export const voltageInitParametersFormSchema = yup.object().shape({
    [TabValue.GENERAL]: yup.object().shape({
        [GENERAL_APPLY_MODIFICATIONS]: yup.boolean().required(),
        [UPDATE_BUS_VOLTAGE]: yup.boolean().required(),
        [REACTIVE_SLACKS_THRESHOLD]: yup
            .number()
            .min(0, 'ReactiveSlacksThresholdMustBeGreaterOrEqualToZero')
            .required(),
        [SHUNT_COMPENSATOR_ACTIVATION_THRESHOLD]: yup
            .number()
            .min(0, 'ShuntCompensatorActivationThresholdMustBeGreaterOrEqualToZero')
            .required(),
    }),
    [VOLTAGE_LIMITS_MODIFICATION]: yup.array().of(
        yup.object().shape({
            [FILTERS]: yup
                .array()
                .of(
                    yup.object().shape({
                        [ID]: yup.string().required(),
                        [NAME]: yup.string().required(),
                    })
                )
                .min(1, 'FilterInputMinError'),
            [LOW_VOLTAGE_LIMIT]: yup.number().nullable(),
            [HIGH_VOLTAGE_LIMIT]: yup.number().nullable(),
        })
    ),
    [VOLTAGE_LIMITS_DEFAULT]: yup.array().of(
        yup.object().shape({
            [FILTERS]: yup
                .array()
                .of(
                    yup.object().shape({
                        [ID]: yup.string().required(),
                        [NAME]: yup.string().required(),
                    })
                )
                .min(1, 'FilterInputMinError'),
            [LOW_VOLTAGE_LIMIT]: yup
                .number()
                .min(0)
                .nullable()
                .test((value, context) => {
                    return !isBlankOrEmpty(value) || !isBlankOrEmpty(context.parent[HIGH_VOLTAGE_LIMIT]);
                }),
            [HIGH_VOLTAGE_LIMIT]: yup
                .number()
                .min(0)
                .nullable()
                .test((value, context) => {
                    return !isBlankOrEmpty(value) || !isBlankOrEmpty(context.parent[LOW_VOLTAGE_LIMIT]);
                }),
            [SELECTED]: yup.boolean().required(),
        })
    ),
    [GENERATORS_SELECTION_TYPE]: yup.mixed<keyof typeof EquipmentsSelectionType>().required(),
    [VARIABLE_Q_GENERATORS]: yup.array().of(
        yup.object().shape({
            [ID]: yup.string().required(),
            [NAME]: yup.string().required(),
        })
    ),
    [TRANSFORMERS_SELECTION_TYPE]: yup.mixed<keyof typeof EquipmentsSelectionType>().required(),
    [VARIABLE_TRANSFORMERS]: yup.array().of(
        yup.object().shape({
            [ID]: yup.string().required(),
            [NAME]: yup.string().required(),
        })
    ),
    [SHUNT_COMPENSATORS_SELECTION_TYPE]: yup.mixed<keyof typeof EquipmentsSelectionType>().required(),
    [VARIABLE_SHUNT_COMPENSATORS]: yup.array().of(
        yup.object().shape({
            [ID]: yup.string().required(),
            [NAME]: yup.string().required(),
        })
    ),
});

export type VoltageInitParametersForm = yup.InferType<typeof voltageInitParametersFormSchema>;

import yup from '../../../utils/yup-config';
import {
    FILTERS,
    FIXED_GENERATORS,
    HIGH_VOLTAGE_LIMIT,
    ID,
    LOW_VOLTAGE_LIMIT,
    NAME,
    SELECTED,
    VARIABLE_SHUNT_COMPENSATORS,
    VARIABLE_TRANSFORMERS,
    VOLTAGE_LIMITS_DEFAULT,
    VOLTAGE_LIMITS_MODIFICATION,
} from '../../../utils/field-constants';
import { isBlankOrEmpty } from '../../../utils/validation-functions';

export const GENERAL = 'GENERAL';
export const GENERAL_APPLY_MODIFICATIONS = 'GENERAL_APPLY_MODIFICATIONS';

export const DEFAULT_GENERAL_APPLY_MODIFICATIONS = true;

export enum TabValue {
    GENERAL = 'GENERAL',
    VOLTAGE_LIMITS = 'voltageLimits',
    EQUIPMENTS_SELECTION = 'equipmentSelection',
}

export const initialVoltageInitParametersForm: VoltageInitParametersForm = {
    [GENERAL]: {
        [GENERAL_APPLY_MODIFICATIONS]: DEFAULT_GENERAL_APPLY_MODIFICATIONS,
    },
    [VOLTAGE_LIMITS_MODIFICATION]: [],
    [VOLTAGE_LIMITS_DEFAULT]: [],
    [FIXED_GENERATORS]: [],
    [VARIABLE_TRANSFORMERS]: [],
    [VARIABLE_SHUNT_COMPENSATORS]: [],
};

export const voltageInitParametersFormSchema = yup.object().shape({
    [TabValue.GENERAL]: yup.object().shape({
        [GENERAL_APPLY_MODIFICATIONS]: yup.boolean().required(),
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
                    return (
                        !isBlankOrEmpty(value) ||
                        !isBlankOrEmpty(context.parent[HIGH_VOLTAGE_LIMIT])
                    );
                }),
            [HIGH_VOLTAGE_LIMIT]: yup
                .number()
                .min(0)
                .nullable()
                .test((value, context) => {
                    return (
                        !isBlankOrEmpty(value) ||
                        !isBlankOrEmpty(context.parent[LOW_VOLTAGE_LIMIT])
                    );
                }),
            [SELECTED]: yup.boolean().required(),
        })
    ),
    [FIXED_GENERATORS]: yup.array().of(
        yup.object().shape({
            [ID]: yup.string().required(),
            [NAME]: yup.string().required(),
        })
    ),
    [VARIABLE_TRANSFORMERS]: yup.array().of(
        yup.object().shape({
            [ID]: yup.string().required(),
            [NAME]: yup.string().required(),
        })
    ),
    [VARIABLE_SHUNT_COMPENSATORS]: yup.array().of(
        yup.object().shape({
            [ID]: yup.string().required(),
            [NAME]: yup.string().required(),
        })
    ),
});

export type VoltageInitParametersForm = yup.InferType<
    typeof voltageInitParametersFormSchema
>;

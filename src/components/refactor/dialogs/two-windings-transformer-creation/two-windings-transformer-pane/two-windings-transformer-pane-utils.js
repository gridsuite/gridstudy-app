import yup from '../../../utils/yup-config';
import {
    CURRENT_LIMITS_1,
    CURRENT_LIMITS_2,
    EQUIPMENT_ID,
    EQUIPMENT_NAME,
    MAGNETIZING_CONDUCTANCE,
    MAGNETIZING_SUSCEPTANCE,
    PERMANENT_LIMIT,
    RATED_S,
    RATED_VOLTAGE_1,
    RATED_VOLTAGE_2,
    SERIES_REACTANCE,
    SERIES_RESISTANCE,
} from '../two-windings-transformer-creation-dialog-utils';

const twoWindingsTransformerValidationSchema = (id) => ({
    [EQUIPMENT_ID]: yup.string().required(),
    [EQUIPMENT_NAME]: yup.string(),
    [SERIES_RESISTANCE]: yup.number().nullable().required(),
    [SERIES_REACTANCE]: yup.number().nullable().required(),
    [MAGNETIZING_CONDUCTANCE]: yup.number().nullable().required(),
    [MAGNETIZING_SUSCEPTANCE]: yup.number().nullable().required(),
    [RATED_S]: yup
        .number()
        .nullable()
        .test('min', 'RatedNominalPowerGreaterThanZero', (val) => val >= 0),
    [RATED_VOLTAGE_1]: yup.number().nullable().required(),
    [RATED_VOLTAGE_2]: yup.number().nullable().required(),
    [CURRENT_LIMITS_1]: yup.object().shape({
        [PERMANENT_LIMIT]: yup
            .number()
            .nullable()
            .test(
                'min',
                'permanentCurrentLimitGreaterThanZero',
                (val) => val >= 0
            ),
    }),
    [CURRENT_LIMITS_2]: yup.object().shape({
        [PERMANENT_LIMIT]: yup
            .number()
            .nullable()
            .test(
                'min',
                'permanentCurrentLimitGreaterThanZero',
                (val) => val >= 0
            ),
    }),
});

export const getTwoWindingsTransformerValidationSchema = () => {
    return twoWindingsTransformerValidationSchema();
};

const twoWindingsTransformerEmptyFormData = (id) => ({
    // [id]: {
    [EQUIPMENT_ID]: '',
    [EQUIPMENT_NAME]: '',
    [SERIES_RESISTANCE]: '',
    [SERIES_REACTANCE]: '',
    [MAGNETIZING_CONDUCTANCE]: '',
    [MAGNETIZING_SUSCEPTANCE]: '',
    [RATED_S]: '',
    [RATED_VOLTAGE_1]: '',
    [RATED_VOLTAGE_2]: '',
    [CURRENT_LIMITS_1]: {
        [PERMANENT_LIMIT]: '',
    },
    [CURRENT_LIMITS_2]: {
        [PERMANENT_LIMIT]: '',
    },
    // }
});

export const getTwoWindingsTransformerEmptyFormData = () => {
    return twoWindingsTransformerEmptyFormData();
};

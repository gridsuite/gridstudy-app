import yup from '../../../utils/yup-config';
import {
    getRegulatingTerminalEmptyFormData,
    getRegulatingTerminalValidationSchema,
} from '../../regulating-terminal/regulating-terminal-form-utils';
import {
    ENABLED,
    HIGH_TAP_POSITION,
    LOW_TAP_POSITION,
    REGULATING,
    STEPS,
    STEPS_ALPHA,
    STEPS_CONDUCTANCE,
    STEPS_RATIO,
    STEPS_REACTANCE,
    STEPS_RESISTANCE,
    STEPS_SUSCEPTANCE,
    STEPS_TAP,
    TAP_POSITION,
    TARGET_DEADBAND,
} from '../two-windings-transformer-creation-dialog-utils';

//tab ratio_tap_changer
export const RATIO_TAP_CHANGER = 'ratioTapChanger';
export const LOAD_TAP_CHANGING_CAPABILITIES = 'loadTapChangingCapabilities';
export const TARGET_V = 'targetV';

const ratioTapChangerValidationSchema = (id) => ({
    [id]: yup.object().shape({
        [ENABLED]: yup.bool().required(),
        [LOAD_TAP_CHANGING_CAPABILITIES]: yup.bool().required(),
        [REGULATING]: yup.bool().required(),
        [TARGET_V]: yup
            .number()
            .nullable()
            .test('min', 'TargetVoltageGreaterThanZero', (val) => val >= 0)
            .when(REGULATING, {
                is: true,
                then: (schema) => schema.required(),
            }),
        [TARGET_DEADBAND]: yup
            .number()
            .nullable()
            .min(0, 'TargetDeadbandGreaterThanZero'),
        [LOW_TAP_POSITION]: yup
            .number()
            .nullable()
            .min(0)
            .max(100)
            .when(ENABLED, {
                is: true,
                then: (schema) => schema.required(),
            }),
        [HIGH_TAP_POSITION]: yup
            .number()
            .nullable()
            .min(yup.ref(LOW_TAP_POSITION), 'HighTapPositionError')
            .max(100, 'HighTapPositionError'),
        [TAP_POSITION]: yup
            .number()
            .nullable()
            .when(ENABLED, {
                is: true,
                then: (schema) => schema.required(),
            }),
        [STEPS]: yup.array().of(
            yup.object().shape({
                [STEPS_TAP]: yup.number().required(),
                [STEPS_RESISTANCE]: yup.number(),
                [STEPS_REACTANCE]: yup.number(),
                [STEPS_CONDUCTANCE]: yup.number(),
                [STEPS_SUSCEPTANCE]: yup.number(),
                [STEPS_RATIO]: yup.number(),
                [STEPS_ALPHA]: yup.number(),
            })
        ),
        ...getRegulatingTerminalValidationSchema(),
    }),
});

export const getRatioTapChangerValidationSchema = (id = RATIO_TAP_CHANGER) => {
    return ratioTapChangerValidationSchema(id);
};

const ratioTapChangerEmptyFormData = (id) => ({
    [id]: {
        [ENABLED]: false,
        [LOAD_TAP_CHANGING_CAPABILITIES]: false,
        [REGULATING]: false,
        [TARGET_V]: null,
        [TARGET_DEADBAND]: null,
        [LOW_TAP_POSITION]: null,
        [HIGH_TAP_POSITION]: null,
        [TAP_POSITION]: null,
        [STEPS]: [],
        ...getRegulatingTerminalEmptyFormData(),
    },
});

export const getRatioTapChangerEmptyFormData = (id = RATIO_TAP_CHANGER) => {
    return ratioTapChangerEmptyFormData(id);
};

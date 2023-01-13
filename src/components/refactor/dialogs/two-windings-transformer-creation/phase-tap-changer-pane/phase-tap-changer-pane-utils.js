import { REGULATION_MODES } from '../../../../network/constants';
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

//tab phase_tap_changer
export const PHASE_TAP_CHANGER = 'phaseTapChanger';
export const REGULATION_MODE = 'regulationMode';
export const CURRENT_LIMITER_REGULATING_VALUE = 'currentLimiterRegulatingValue';
export const FLOW_SET_POINT_REGULATING_VALUE = 'flowSetPointRegulatingValue';

const phaseTapChangerValidationSchema = (id) => ({
    [id]: yup.object().shape({
        [ENABLED]: yup.bool().required(),
        [REGULATION_MODE]: yup.string().nullable().required(),
        [REGULATING]: yup.bool().required(),
        [CURRENT_LIMITER_REGULATING_VALUE]: yup
            .number()
            .nullable()
            .min(0, 'CurrentLimiterGreaterThanZero')
            .when([REGULATING, REGULATION_MODE], {
                is: (regulating, regulationMode) =>
                    regulating &&
                    regulationMode === REGULATION_MODES.CURRENT_LIMITER.id,
                then: (schema) => schema.required(),
            }),
        [FLOW_SET_POINT_REGULATING_VALUE]: yup
            .number()
            .nullable()
            .when([REGULATING, REGULATION_MODE], {
                is: (regulating, regulationMode) =>
                    regulating &&
                    regulationMode === REGULATION_MODES.ACTIVE_POWER_CONTROL.id,
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
            .when(`${ENABLED}`, {
                is: true,
                then: (schema) => schema.required(),
            }),
        [HIGH_TAP_POSITION]: yup
            .number()
            .nullable()
            .min(yup.ref(LOW_TAP_POSITION), 'HighTapPositionError')
            .max(100, 'HighTapPositionError'),
        [TAP_POSITION]: yup.lazy((value) => {
            if (value === '') {
                return yup.string();
            }

            return yup.number().when(`${ENABLED}`, {
                is: true,
                then: (schema) => schema.required(),
            });
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

export const getPhaseTapChangerValidationSchema = (id = PHASE_TAP_CHANGER) => {
    return phaseTapChangerValidationSchema(id);
};

const phaseTapChangerEmptyFormData = (id) => ({
    [id]: {
        [ENABLED]: false,
        [REGULATION_MODE]: null,
        [REGULATING]: false,
        [CURRENT_LIMITER_REGULATING_VALUE]: null,
        [FLOW_SET_POINT_REGULATING_VALUE]: null,
        [TARGET_DEADBAND]: '',
        [LOW_TAP_POSITION]: null,
        [HIGH_TAP_POSITION]: null,
        [TAP_POSITION]: '',
        [STEPS]: [],
        ...getRegulatingTerminalEmptyFormData(),
    },
});

export const getPhaseTapChangerEmptyFormData = (id = PHASE_TAP_CHANGER) => {
    return phaseTapChangerEmptyFormData(id);
};

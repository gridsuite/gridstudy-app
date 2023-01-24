import { REGULATION_MODES } from '../../../../network/constants';
import {
    areArrayElementsOrdered,
    areArrayElementsUnique,
} from '../../../utils/utils';
import yup from '../../../utils/yup-config';
import {
    EQUIPMENT,
    EQUIPMENT_ID,
    EQUIPMENT_NAME,
    EQUIPMENT_TYPE,
    getRegulatingTerminalEmptyFormData,
    getRegulatingTerminalFormData,
    VOLTAGE_LEVEL,
    VOLTAGE_LEVEL_ID,
    VOLTAGE_LEVEL_NAME,
    VOLTAGE_LEVEL_NOMINAL_VOLTAGE,
    VOLTAGE_LEVEL_SUBSTATION_ID,
    VOLTAGE_LEVEL_TOPOLOGY_KIND,
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
        [REGULATION_MODE]: yup
            .string()
            .nullable()
            .when([ENABLED], {
                is: true,
                then: (schema) => schema.required(),
            }),
        [REGULATING]: yup.bool().required(),
        [CURRENT_LIMITER_REGULATING_VALUE]: yup
            .number()
            .nullable()
            .min(0, 'CurrentLimiterGreaterThanZero')
            .when([ENABLED, REGULATING, REGULATION_MODE], {
                is: (enabled, regulating, regulationMode) =>
                    enabled &&
                    regulating &&
                    regulationMode === REGULATION_MODES.CURRENT_LIMITER.id,
                then: (schema) => schema.required(),
            }),
        [FLOW_SET_POINT_REGULATING_VALUE]: yup
            .number()
            .nullable()
            .when([ENABLED, REGULATING, REGULATION_MODE], {
                is: (enabled, regulating, regulationMode) =>
                    enabled &&
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
            .when(ENABLED, {
                is: true,
                then: (schema) => schema.required(),
            }),
        [HIGH_TAP_POSITION]: yup
            .number()
            .nullable()
            .min(yup.ref(LOW_TAP_POSITION), 'HighTapPositionError')
            .max(100, 'HighTapPositionError')
            .when([ENABLED], {
                is: true,
                then: (schema) => schema.required(),
            }),
        [TAP_POSITION]: yup
            .number()
            .nullable()
            .when(ENABLED, {
                is: true,
                then: (schema) => schema.required(),
            }),
        [STEPS]: yup
            .array()
            .of(
                yup.object().shape({
                    [STEPS_TAP]: yup.number().required(),
                    [STEPS_RESISTANCE]: yup.number(),
                    [STEPS_REACTANCE]: yup.number(),
                    [STEPS_CONDUCTANCE]: yup.number(),
                    [STEPS_SUSCEPTANCE]: yup.number(),
                    [STEPS_RATIO]: yup.number(),
                    [STEPS_ALPHA]: yup.number(),
                })
            )
            .when(ENABLED, {
                is: true,
                then: (schema) => schema.min(1),
            })
            .test('distinctOrderedAlpha', 'PhaseShiftValuesError', (array) => {
                const alphaArray = array.map((step) => step[STEPS_ALPHA]);
                return (
                    areArrayElementsOrdered(alphaArray) &&
                    areArrayElementsUnique(alphaArray)
                );
            }),
        //regulating terminal fields
        //TODO: is it possible to move it to regulating-terminal-utils.js properly since it depends on "ENABLED" ?
        [VOLTAGE_LEVEL]: yup
            .object()
            .nullable()
            .shape({
                [VOLTAGE_LEVEL_ID]: yup.string(),
                [VOLTAGE_LEVEL_NAME]: yup.string(),
                [VOLTAGE_LEVEL_SUBSTATION_ID]: yup.string(),
                [VOLTAGE_LEVEL_NOMINAL_VOLTAGE]: yup.string(),
                [VOLTAGE_LEVEL_TOPOLOGY_KIND]: yup.string().nullable(),
            })
            .when([ENABLED, REGULATING], {
                is: (enabled, regulating) => enabled && regulating,
                then: (schema) => schema.required(),
            }),
        [EQUIPMENT]: yup
            .object()
            .nullable()
            .shape({
                [EQUIPMENT_ID]: yup.string(),
                [EQUIPMENT_NAME]: yup.string(),
                [EQUIPMENT_TYPE]: yup.string(),
            })
            .when([ENABLED, REGULATING], {
                is: (enabled, regulating) => enabled && regulating,
                then: (schema) => schema.required(),
            }),
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
        [TARGET_DEADBAND]: null,
        [LOW_TAP_POSITION]: null,
        [HIGH_TAP_POSITION]: null,
        [TAP_POSITION]: null,
        [STEPS]: [],
        ...getRegulatingTerminalEmptyFormData(),
    },
});

export const getPhaseTapChangerEmptyFormData = (id = PHASE_TAP_CHANGER) => {
    return phaseTapChangerEmptyFormData(id);
};

export const getPhaseTapChangerFormData = (
    {
        enabled = false,
        regulationMode = null,
        regulating = false,
        currentLimiterRegulatingValue = null,
        flowSetpointRegulatingValue = null,
        targetDeadband = null,
        lowTapPosition = null,
        highTapPosition = null,
        tapPosition = null,
        steps = [],
        voltageLevelId,
        equipmentId,
        equipmentType,
    },
    id = PHASE_TAP_CHANGER
) => ({
    [id]: {
        [ENABLED]: enabled,
        [REGULATION_MODE]: regulationMode,
        [REGULATING]: regulating,
        [CURRENT_LIMITER_REGULATING_VALUE]: currentLimiterRegulatingValue,
        [FLOW_SET_POINT_REGULATING_VALUE]: flowSetpointRegulatingValue,
        [TARGET_DEADBAND]: targetDeadband,
        [LOW_TAP_POSITION]: lowTapPosition,
        [HIGH_TAP_POSITION]: highTapPosition,
        [TAP_POSITION]: tapPosition,
        [STEPS]: steps,
        ...getRegulatingTerminalFormData({
            equipmentId,
            equipmentType,
            voltageLevelId,
        }),
    },
});

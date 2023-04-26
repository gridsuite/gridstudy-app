import {
    HIGH_TAP_POSITION,
    LOW_TAP_POSITION,
} from 'components/utils/field-constants';
import yup from 'components/utils/yup-config';

const createRuleValidationSchema = () =>
    yup.object().shape({
        [LOW_TAP_POSITION]: yup.number().nullable().required(),
        [HIGH_TAP_POSITION]: yup.number().nullable().required(),
    });

export const getCreateRuleValidationSchema = () => createRuleValidationSchema();

const createRuleEmptyFormData = () => ({
    [LOW_TAP_POSITION]: null,
    [HIGH_TAP_POSITION]: null,
});

export const getCreateRuteEmptyFormData = () => createRuleEmptyFormData();

import yup from '../../../utils/yup-config';
import {
    ANGLE_FLOW_SENSITIVITY_VALUE_THRESHOLD,
    FLOW_FLOW_SENSITIVITY_VALUE_THRESHOLD,
    FLOW_VOLTAGE_SENSITIVITY_VALUE_THRESHOLD,
    PROVIDER,
} from '../../../utils/field-constants';
import {
    getSensiHVDCsFormSchema,
    getSensiInjectionsFormSchema,
    getSensiInjectionsSetFormSchema,
    getSensiNodesFormSchema,
    getSensiPSTsFormSchema,
} from './utils';

export const formSchema = yup
    .object()
    .shape({
        [PROVIDER]: yup.string().required(),
        [FLOW_FLOW_SENSITIVITY_VALUE_THRESHOLD]: yup.number().required(),
        [ANGLE_FLOW_SENSITIVITY_VALUE_THRESHOLD]: yup.number().required(),
        [FLOW_VOLTAGE_SENSITIVITY_VALUE_THRESHOLD]: yup.number().required(),
        ...getSensiInjectionsSetFormSchema(),
        ...getSensiInjectionsFormSchema(),
        ...getSensiHVDCsFormSchema(),
        ...getSensiPSTsFormSchema(),
        ...getSensiNodesFormSchema(),
    })
    .required();
export type SensitivityAnalysisParametersFormSchema = yup.InferType<typeof formSchema>;

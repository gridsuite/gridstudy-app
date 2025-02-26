import yup from '../../../utils/yup-config';
import { PROVIDER } from '../../../utils/field-constants';
import {
    getContingenciesFormSchema,
    getGenerationStagesDefinitionFormSchema,
    getGenerationStagesSelectionFormSchema,
    getGeneratorsCappingsFormSchema,
    getMonitoredBranchesFormSchema,
} from './utils';

export const formSchema = yup
    .object()
    .shape({
        [PROVIDER]: yup.string().required(),
        ...getGenerationStagesDefinitionFormSchema(),
        ...getGenerationStagesSelectionFormSchema(),
        ...getGeneratorsCappingsFormSchema(),
        ...getMonitoredBranchesFormSchema(),
        ...getContingenciesFormSchema(),
    })
    .required();
export type NonEvacuatedEnergyParametersForm = yup.InferType<typeof formSchema>;

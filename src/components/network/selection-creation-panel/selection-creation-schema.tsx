import { EquipmentType, yup } from '@gridsuite/commons-ui';
import { EQUIPMENT_TYPE_FIELD, NAME, SELECTION_TYPE } from 'components/utils/field-constants';
import { SELECTION_TYPES } from './selection-types';

const formSchema = yup
    .object()
    .shape({
        TOTO: yup.string().nullable().required(),
        [SELECTION_TYPE]: yup.mixed<SELECTION_TYPES>().oneOf(Object.values(SELECTION_TYPES)).nullable().required(),
        [NAME]: yup.string().when([SELECTION_TYPE], {
            is: (value: SELECTION_TYPES) =>
                value === SELECTION_TYPES.CONTIGENCY_LIST || value === SELECTION_TYPES.FILTER,
            then: (schema) => schema.required(),
        }),
        [EQUIPMENT_TYPE_FIELD]: yup
            .mixed<EquipmentType>()
            .oneOf(Object.values(EquipmentType))
            .nullable()
            .when([SELECTION_TYPE], {
                is: (value: SELECTION_TYPES) =>
                    value === SELECTION_TYPES.CONTIGENCY_LIST || value === SELECTION_TYPES.FILTER,
                then: (schema) => schema.required(),
            }),
    })
    .required();

export const getSelectionCreationSchema = () => formSchema;

// used for useForm typing
export type SelectionCreationPanelFormSchema = yup.InferType<typeof formSchema>;

export type SelectionCreationPanelNadFields = SelectionCreationPanelFormSchema & {
    [SELECTION_TYPE]: SELECTION_TYPES.NAD;
};

export type SelectionCreationPanelNotNadFields = SelectionCreationPanelFormSchema & {
    [SELECTION_TYPE]: SELECTION_TYPES.CONTIGENCY_LIST | SELECTION_TYPES.FILTER;
    [NAME]: string;
    [EQUIPMENT_TYPE_FIELD]: EquipmentType;
};

// used for handleSubmit typing -> makes type discrimination possible
export type SelectionCreationPaneFields = SelectionCreationPanelNadFields | SelectionCreationPanelNotNadFields;

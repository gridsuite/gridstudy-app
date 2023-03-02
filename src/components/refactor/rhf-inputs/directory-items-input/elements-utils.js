import yup from '../../utils/yup-config';
import { ID, NAME, SPECIFIC_METADATA, TYPE } from '../../utils/field-constants';

export const getElementsInputSchema = (id) => ({
    [id]: yup.array().of(
        yup.object().shape({
            [ID]: yup.string().required(),
            [NAME]: yup.string().required(),
            [SPECIFIC_METADATA]: yup.object().shape({
                [TYPE]: yup.string().required(),
            }),
        })
    )

});

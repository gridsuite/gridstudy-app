import yup from '../../../utils/yup-config';
import {
    FILTERS,
    ID,
    NAME,
    SPECIFIC_METADATA,
    TYPE,
    VARIATION_MODE,
    VARIATION_VALUE,
} from '../../../utils/field-constants';

export const getVariationSchema = () =>
    yup
        .object()
        .nullable()
        .shape({
            [VARIATION_MODE]: yup.string().nullable().required(),
            [VARIATION_VALUE]: yup.number().nullable().required(),
            [FILTERS]: yup
                .array()
                .of(
                    yup.object().shape({
                        [ID]: yup.string().required(),
                        [NAME]: yup.string().required(),
                        [SPECIFIC_METADATA]: yup.object().shape({
                            [TYPE]: yup.string().required(),
                        }),
                    })
                )
                .min(1, 'FieldIsRequired')
                .when([VARIATION_MODE], {
                    is: 'STACKING_UP' || 'VENTILATION',
                    then: (schema) =>
                        schema.test(
                            'AllFiltersAreExplicitNaming',
                            'AllExplicitNamingFiltersError',
                            (values) =>
                                values.every(
                                    (f) =>
                                        f?.specificMetadata?.type ===
                                        'IDENTIFIER_LIST'
                                )
                        ),
                }),
        });

export const getVariationsSchema = (id) => ({
    [id]: yup
        .array()
        .nullable()
        .min(1, 'EmptyList/variations')
        .of(getVariationSchema()),
});

export const getVariationEmptyForm = (variationMode) => {
    return {
        [VARIATION_MODE]: variationMode,
        [VARIATION_VALUE]: null,
        [FILTERS]: [],
    };
};

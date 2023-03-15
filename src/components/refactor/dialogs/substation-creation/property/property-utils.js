import { fetchAppsAndUrls } from '../../../../../utils/rest-api';
import yup from '../../../utils/yup-config';
import {
    ADDITIONAL_PROPERTIES,
    NAME,
    VALUE,
} from '../../../utils/field-constants';

export const fetchPredefinedProperties = () => {
    return fetchAppsAndUrls().then((res) => {
        const studyMetadata = res.find((metadata) => metadata.name === 'Study');
        if (!studyMetadata) {
            return Promise.reject(
                'Study entry could not be found in metadatas'
            );
        }

        return Promise.resolve(studyMetadata.predefinedEquipmentProperties);
    });
};

export const getPropertiesSchema = (id = ADDITIONAL_PROPERTIES) => ({
    [id]: yup
        .array()
        .of(
            yup.object().shape({
                [NAME]: yup.string().nullable().required(),
                [VALUE]: yup.string().nullable().required(),
            })
        )
        .test(
            'checkUniqueProperties',
            'DuplicatedProps',
            (values) => values.length === new Set(values.map((v) => v.name)).size
        ),
});

/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { fetchAppsAndUrls } from '../../../../utils/rest-api';
import yup from '../../../utils/yup-config';
import {
    ADDITIONAL_PROPERTIES,
    DELETION_MARK,
    NAME,
    PREVIOUS_VALUE,
    VALUE,
    ADDED,
} from '../../../utils/field-constants';

export const checkUniqueProperties = (properties) => {
    const validValues = properties.filter((v) => v?.name && v?.value);
    return validValues.length === new Set(validValues.map((v) => v.name)).size;
};

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

export const getPropertyInitialValues = () => {
    return {
        [NAME]: null,
        [VALUE]: null,
        [PREVIOUS_VALUE]: null,
        [DELETION_MARK]: false,
        [ADDED]: true,
    };
};
export const getPropertiesSchema = (id = ADDITIONAL_PROPERTIES) => ({
    [id]: yup
        .array()
        .of(
            yup.object().shape({
                [NAME]: yup.string().nullable().required(),
                [VALUE]: yup.string().nullable().required(),
                [PREVIOUS_VALUE]: yup.string().nullable(),
                [DELETION_MARK]: yup.boolean(),
                [ADDED]: yup.boolean(),
            })
        )
        .test('checkUniqueProperties', 'DuplicatedProps', (values) =>
            checkUniqueProperties(values)
        ),
});

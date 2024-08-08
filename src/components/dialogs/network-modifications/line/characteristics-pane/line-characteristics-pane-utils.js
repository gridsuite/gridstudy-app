/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    CHARACTERISTICS,
    CONNECTIVITY_1,
    CONNECTIVITY_2,
    R,
    G1,
    G2,
    B1,
    B2,
    X,
} from 'components/utils/field-constants';
import yup from 'components/utils/yup-config';
import {
    getConnectivityWithPositionEmptyFormData,
    getConnectivityWithPositionValidationSchema,
} from '../../../connectivity/connectivity-form-utils';

const characteristicsValidationSchema = (id, displayConnectivity, modification) => ({
    [id]: yup.object().shape({
        [R]: modification ? yup.number().nullable() : yup.number().nullable().required(),
        [X]: modification ? yup.number().nullable() : yup.number().nullable().required(),
        [B1]: yup.number().nullable(),
        [G1]: yup.number().nullable(),
        [B2]: yup.number().nullable(),
        [G2]: yup.number().nullable(),
        ...(displayConnectivity && getConnectivityWithPositionValidationSchema(false, CONNECTIVITY_1)),
        ...(displayConnectivity && getConnectivityWithPositionValidationSchema(false, CONNECTIVITY_2)),
    }),
});

export const getCharacteristicsValidationSchema = (id, displayConnectivity, modification = false) => {
    return characteristicsValidationSchema(id, displayConnectivity, modification);
};

const characteristicsEmptyFormData = (id, displayConnectivity = true) => ({
    [id]: {
        [R]: null,
        [X]: null,
        [B1]: null,
        [G1]: null,
        [B2]: null,
        [G2]: null,
        ...(displayConnectivity && getConnectivityWithPositionEmptyFormData(false, CONNECTIVITY_1)),
        ...(displayConnectivity && getConnectivityWithPositionEmptyFormData(false, CONNECTIVITY_2)),
    },
});

export const getCharacteristicsEmptyFormData = (id = CHARACTERISTICS, displayConnectivity = true) => {
    return characteristicsEmptyFormData(id, displayConnectivity);
};

export const getCharacteristicsFormData = (
    { r = null, x = null, g1 = null, b1 = null, g2 = null, b2 = null, connectivity1 = null, connectivity2 = null },
    id = CHARACTERISTICS
) => ({
    [id]: {
        [R]: r,
        [X]: x,
        [G1]: g1,
        [B1]: b1,
        [G2]: g2,
        [B2]: b2,
        [CONNECTIVITY_1]: connectivity1,
        [CONNECTIVITY_2]: connectivity2,
    },
});

export const getCharacteristicsWithOutConnectivityFormData = (
    { r = null, x = null, g1 = null, b1 = null, g2 = null, b2 = null },
    id = CHARACTERISTICS
) => ({
    [id]: {
        [R]: r,
        [X]: x,
        [G1]: g1,
        [B1]: b1,
        [G2]: g2,
        [B2]: b2,
    },
});

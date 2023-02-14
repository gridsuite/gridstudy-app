/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    CHARACTERISTICS,
    CONNECTIVITY_1,
    CONNECTIVITY_2,
    CURRENT_LIMITS_1,
    CURRENT_LIMITS_2,
    EQUIPMENT_ID,
    EQUIPMENT_NAME,
    G,
    B,
    PERMANENT_LIMIT,
    RATED_S,
    RATED_U1,
    RATED_U2,
    X,
    R,
} from 'components/refactor/utils/field-constants';
import yup from '../../../utils/yup-config';
import {
    getConnectivityEmptyFormData,
    getConnectivityFormValidationSchema,
} from '../../connectivity/connectivity-form-utils';

const twoWindingsTransformerValidationSchema = (id) => ({
    [id]: yup.object().shape({
        [EQUIPMENT_ID]: yup.string().required(),
        [EQUIPMENT_NAME]: yup.string(),
        [R]: yup.number().nullable().required(),
        [X]: yup.number().nullable().required(),
        [G]: yup.number().nullable().required(),
        [B]: yup.number().nullable().required(),
        [RATED_S]: yup
            .number()
            .nullable()
            .positive('RatedNominalPowerGreaterThanZero'),
        [RATED_U1]: yup.number().nullable().required(),
        [RATED_U2]: yup.number().nullable().required(),
        [CURRENT_LIMITS_1]: yup.object().shape({
            [PERMANENT_LIMIT]: yup
                .number()
                .nullable()
                .positive('permanentCurrentLimitGreaterThanZero'),
        }),
        [CURRENT_LIMITS_2]: yup.object().shape({
            [PERMANENT_LIMIT]: yup
                .number()
                .nullable()
                .positive('permanentCurrentLimitGreaterThanZero'),
        }),
        ...getConnectivityFormValidationSchema(CONNECTIVITY_1),
        ...getConnectivityFormValidationSchema(CONNECTIVITY_2),
    }),
});

export const getTwoWindingsTransformerValidationSchema = (
    id = CHARACTERISTICS
) => {
    return twoWindingsTransformerValidationSchema(id);
};

const twoWindingsTransformerEmptyFormData = (id) => ({
    [id]: {
        [EQUIPMENT_ID]: '',
        [EQUIPMENT_NAME]: '',
        [R]: null,
        [X]: null,
        [G]: null,
        [B]: null,
        [RATED_S]: null,
        [RATED_U1]: null,
        [RATED_U2]: null,
        [CURRENT_LIMITS_1]: {
            [PERMANENT_LIMIT]: null,
        },
        [CURRENT_LIMITS_2]: {
            [PERMANENT_LIMIT]: null,
        },
        ...getConnectivityEmptyFormData(CONNECTIVITY_1),
        ...getConnectivityEmptyFormData(CONNECTIVITY_2),
    },
});

export const getTwoWindingsTransformerEmptyFormData = (
    id = CHARACTERISTICS
) => {
    return twoWindingsTransformerEmptyFormData(id);
};

export const getTwoWindingsTransformerFormData = (
    {
        equipmentId,
        equipmentName = '',
        r = null,
        x = null,
        g = null,
        b = null,
        ratedS = null,
        ratedU1 = null,
        ratedU2 = null,
        permanentLimit1 = null,
        permanentLimit2 = null,
        connectivity1 = null,
        connectivity2 = null,
    },
    id = CHARACTERISTICS
) => {
    return {
        [id]: {
            [EQUIPMENT_ID]: equipmentId,
            [EQUIPMENT_NAME]: equipmentName,
            [R]: r,
            [X]: x,
            [G]: g,
            [B]: b,
            [RATED_S]: ratedS,
            [RATED_U1]: ratedU1,
            [RATED_U2]: ratedU2,
            [CURRENT_LIMITS_1]: {
                [PERMANENT_LIMIT]: permanentLimit1,
            },
            [CURRENT_LIMITS_2]: {
                [PERMANENT_LIMIT]: permanentLimit2,
            },
            [CONNECTIVITY_1]: connectivity1,
            [CONNECTIVITY_2]: connectivity2,
        },
    };
};

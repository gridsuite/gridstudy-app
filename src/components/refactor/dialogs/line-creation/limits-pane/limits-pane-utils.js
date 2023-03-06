/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    LIMITS,
    CURRENT_LIMITS_1,
    CURRENT_LIMITS_2,
    PERMANENT_LIMIT,
} from 'components/refactor/utils/field-constants';
import yup from '../../../utils/yup-config';

const limitsValidationSchema = (id) => ({
    [id]: yup.object().shape({
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
    }),
});

export const getLimitsValidationSchema = (id = LIMITS) => {
    return limitsValidationSchema(id);
};

const limitsEmptyFormData = (id) => ({
    [id]: {
        [CURRENT_LIMITS_1]: {
            [PERMANENT_LIMIT]: null,
        },
        [CURRENT_LIMITS_2]: {
            [PERMANENT_LIMIT]: null,
        },
    },
});

export const getLimitsEmptyFormData = (id = LIMITS) => {
    return limitsEmptyFormData(id);
};

export const getLimitsFormData = (
    { permanentLimit1 = null, permanentLimit2 = null },
    id = LIMITS
) => ({
    [id]: {
        [CURRENT_LIMITS_1]: {
            [PERMANENT_LIMIT]: permanentLimit1,
        },
        [CURRENT_LIMITS_2]: {
            [PERMANENT_LIMIT]: permanentLimit2,
        },
    },
});

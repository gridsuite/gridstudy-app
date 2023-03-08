/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    MAXIMUM_REACTIVE_POWER,
    MINIMUM_REACTIVE_POWER,
    REACTIVE_CAPABILITY_CURVE_CHOICE,
} from '../../../utils/field-constants';
import {
    getReactiveCapabilityCurveEmptyFormData,
    getReactiveCapabilityCurveValidationSchema,
} from './reactive-capability-curve/reactive-capability-utils';
import yup from '../../../utils/yup-config';

export const getReactiveLimitsEmptyFormData = () => ({
    [REACTIVE_CAPABILITY_CURVE_CHOICE]: 'CURVE',
    [MINIMUM_REACTIVE_POWER]: null,
    [MAXIMUM_REACTIVE_POWER]: null,
    ...getReactiveCapabilityCurveEmptyFormData(),
});

export const getReactiveLimitsSchema = () => ({
    [REACTIVE_CAPABILITY_CURVE_CHOICE]: yup.string().nullable().required(),
    [MINIMUM_REACTIVE_POWER]: yup
        .number()
        .nullable()
        .when([MAXIMUM_REACTIVE_POWER], {
            is: true,
            then: (schema) => schema.required(),
        }),
    [MAXIMUM_REACTIVE_POWER]: yup
        .number()
        .nullable()
        .when([MINIMUM_REACTIVE_POWER], {
            is: true,
            then: (schema) => schema.required(),
        }),
    ...getReactiveCapabilityCurveValidationSchema(),
});

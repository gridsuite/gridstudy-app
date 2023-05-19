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
    REACTIVE_CAPABILITY_CURVE_TABLE,
} from '../../../../utils/field-constants';
import {
    getReactiveCapabilityCurveEmptyFormData,
    getReactiveCapabilityCurveValidationSchema,
} from './reactive-capability-curve/reactive-capability-utils';
import yup from '../../../../utils/yup-config';

export const getReactiveLimitsEmptyFormData = (
    isGeneratorModification = false
) => ({
    [REACTIVE_CAPABILITY_CURVE_CHOICE]: 'CURVE',
    [MINIMUM_REACTIVE_POWER]: null,
    [MAXIMUM_REACTIVE_POWER]: null,
    ...getReactiveCapabilityCurveEmptyFormData(REACTIVE_CAPABILITY_CURVE_TABLE),
});

export const getReactiveLimitsSchema = (isGeneratorModification = false) => ({
    [REACTIVE_CAPABILITY_CURVE_CHOICE]: yup.string().nullable().required(),
    [MINIMUM_REACTIVE_POWER]: yup
        .number()
        .nullable()
        .when([MAXIMUM_REACTIVE_POWER], {
            is: (maximumReactivePower) =>
                !isGeneratorModification && maximumReactivePower != null,
            then: (schema) => schema.required(),
        }),
    [MAXIMUM_REACTIVE_POWER]: yup
        .number()
        .nullable()
        .when([MINIMUM_REACTIVE_POWER], {
            is: (minimumReactivePower) =>
                !isGeneratorModification && minimumReactivePower != null,
            then: (schema) => schema.required(),
        }),
    ...getReactiveCapabilityCurveValidationSchema(
        REACTIVE_CAPABILITY_CURVE_TABLE,
        isGeneratorModification
    ),
});

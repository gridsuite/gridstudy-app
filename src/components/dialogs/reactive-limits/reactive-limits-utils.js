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
    REACTIVE_LIMITS,
} from 'components/utils/field-constants';
import {
    getReactiveCapabilityCurveValidationSchema,
    getRowEmptyFormData,
} from './reactive-capability-curve/reactive-capability-utils';
import yup from 'components/utils/yup-config';

export const getReactiveLimitsFormData = ({
    id = REACTIVE_LIMITS,
    reactiveCapabilityCurveChoice = 'CURVE',
    minimumReactivePower,
    maximumReactivePower,
    reactiveCapabilityCurveTable,
}) => ({
    [id]: {
        [REACTIVE_CAPABILITY_CURVE_CHOICE]: reactiveCapabilityCurveChoice,
        [MINIMUM_REACTIVE_POWER]: minimumReactivePower ?? null,
        [MAXIMUM_REACTIVE_POWER]: maximumReactivePower ?? null,
        [REACTIVE_CAPABILITY_CURVE_TABLE]: reactiveCapabilityCurveTable ?? [
            getRowEmptyFormData(),
            getRowEmptyFormData(),
        ],
    },
});

export const getReactiveLimitsEmptyFormData = (id = REACTIVE_LIMITS) => ({
    [id]: {
        [REACTIVE_CAPABILITY_CURVE_CHOICE]: 'CURVE',
        [MINIMUM_REACTIVE_POWER]: null,
        [MAXIMUM_REACTIVE_POWER]: null,
        [REACTIVE_CAPABILITY_CURVE_TABLE]: [getRowEmptyFormData(), getRowEmptyFormData()],
    },
});

export const getReactiveLimitsSchema = (
    isEquipmentModification = false,
    positiveAndNegativePExist = false, // if true, we check that Reactive Capability table have at least one row with negative P and one with positive one
    id = REACTIVE_LIMITS
) => ({
    [id]: yup.object().shape(
        {
            [REACTIVE_CAPABILITY_CURVE_CHOICE]: yup.string().nullable().required(),
            [MINIMUM_REACTIVE_POWER]: yup
                .number()
                .nullable()
                .when([MAXIMUM_REACTIVE_POWER], {
                    is: (maximumReactivePower) => !isEquipmentModification && maximumReactivePower != null,
                    then: (schema) => schema.required(),
                }),
            [MAXIMUM_REACTIVE_POWER]: yup
                .number()
                .nullable()
                .when([MINIMUM_REACTIVE_POWER], {
                    is: (minimumReactivePower) => !isEquipmentModification && minimumReactivePower != null,
                    then: (schema) => schema.required(),
                }),
            ...getReactiveCapabilityCurveValidationSchema(REACTIVE_CAPABILITY_CURVE_TABLE, positiveAndNegativePExist),
        },
        [MAXIMUM_REACTIVE_POWER, MINIMUM_REACTIVE_POWER]
    ),
});

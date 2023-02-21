/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    toNumber,
    validateValueIsANumber,
} from '../../../../../util/validation-functions';
import yup from '../../../../utils/yup-config';
import {
    P,
    Q_MAX_P,
    Q_MIN_P,
    REACTIVE_CAPABILITY_CURVE_CHOICE,
    REACTIVE_CAPABILITY_CURVE_TABLE,
} from '../../../../utils/field-constants';

const getRowSchema = () =>
    yup.object().shape({
        [Q_MAX_P]: yup.number().nullable().required(),
        [Q_MIN_P]: yup
            .number()
            .nullable()
            .required()
            .max(
                yup.ref(Q_MAX_P),
                'ReactiveCapabilityCurveCreationErrorQminPQmaxPIncoherence'
            ),
        [P]: yup
            .number()
            .nullable()
            .required()
            .min(
                yup.ref(Q_MIN_P),
                'ReactiveCapabilityCurveCreationErrorPHigherPmin'
            )
            .max(
                yup.ref(Q_MAX_P),
                'ReactiveCapabilityCurveCreationErrorPLowerPmax'
            ),
    });

const getRowEmptyFormData = () => ({
    [P]: null,
    [Q_MAX_P]: null,
    [Q_MIN_P]: null,
});

export const getReactiveCapabilityCurveEmptyFormData = (
    id = REACTIVE_CAPABILITY_CURVE_TABLE
) => ({
    [id]: [getRowEmptyFormData(), getRowEmptyFormData()],
});

function getValidActivePowerValues(values) {
    return values
        .map((element) =>
            // Note : convertion toNumber is necessary here to prevent corner cases like if
            // two values are "-0" and "0", which would be considered different by the Set below.
            validateValueIsANumber(element.p) ? toNumber(element.p) : null
        )
        .filter((p) => p !== null);
}

function checkPUnique(values) {
    const validActivePowerValues = getValidActivePowerValues(values);
    const setOfPs = [...new Set(validActivePowerValues)];
    return setOfPs.length === validActivePowerValues.length;
}

function checkPInRange(values) {
    const validActivePowerValues = getValidActivePowerValues(values);
    const minP = validActivePowerValues[0];
    const maxP = validActivePowerValues[validActivePowerValues.length - 1];

    return validActivePowerValues.every((p) => p >= minP && p <= maxP);
}

export const getReactiveCapabilityCurveValidationSchema = (
    id = REACTIVE_CAPABILITY_CURVE_TABLE
) => ({
    [id]: yup
        .array()
        .nullable()
        .when([REACTIVE_CAPABILITY_CURVE_CHOICE], {
            is: 'CURVE',
            then: (schema) =>
                schema
                    .of(getRowSchema())
                    .min(2, 'ReactiveCapabilityCurveCreationErrorMissingPoints')
                    .test(
                        'checkPUnique',
                        'ReactiveCapabilityCurveCreationErrorPInvalid',
                        (values) => checkPUnique(values)
                    )
                    .test(
                        'checkPInRange',
                        'ReactiveCapabilityCurveCreationErrorPOutOfRange',
                        (values) => checkPInRange(values)
                    ),
        }),
});

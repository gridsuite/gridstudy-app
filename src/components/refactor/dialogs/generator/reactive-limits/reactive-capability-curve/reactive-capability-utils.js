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
    OLD_P,
    OLD_Q_MAX_P,
    OLD_Q_MIN_P,
    P,
    Q_MAX_P,
    Q_MIN_P,
    REACTIVE_CAPABILITY_CURVE_CHOICE,
    REACTIVE_CAPABILITY_CURVE_TABLE,
} from '../../../../utils/field-constants';

const getRowSchema = () =>
    yup.object().shape({
        [OLD_Q_MAX_P]: yup.number().nullable(),
        [OLD_Q_MIN_P]: yup.number().nullable(),
        [OLD_P]: yup.number().nullable(),
        [Q_MAX_P]: yup
            .number()
            .nullable()
            .when([OLD_Q_MAX_P], {
                is: (value) => checkValueField(value),
                then: (schema) => schema.required(),
            }),
        [Q_MIN_P]: yup
            .number()
            .nullable()
            .when([OLD_Q_MIN_P], {
                is: (value) => checkValueField(value),
                then: (schema) => schema.required(),
            })
            .when([Q_MAX_P], {
                is: (value) => {
                    return value !== null;
                },
                then: (schema) =>
                    schema.max(
                        yup.ref(Q_MAX_P),
                        'ReactiveCapabilityCurveCreationErrorQminPQmaxPIncoherence'
                    ),
                otherwise: (schema) =>
                    schema.max(
                        yup.ref(OLD_Q_MAX_P),
                        'ReactiveCapabilityCurveCreationErrorQminPQmaxPIncoherence'
                    ),
            }),
        [P]: yup
            .number()
            .nullable()
            .when([OLD_P], {
                is: (value) => checkValueField(value),
                then: (schema) => schema.required(),
            }),
    });

const getRowEmptyFormData = () => ({
    [P]: null,
    [Q_MAX_P]: null,
    [Q_MIN_P]: null,
    [OLD_P]: null,
    [OLD_Q_MAX_P]: null,
    [OLD_Q_MIN_P]: null,
});

export const getReactiveCapabilityCurveEmptyFormData = (
    id = REACTIVE_CAPABILITY_CURVE_TABLE
) => ({
    [id]: [getRowEmptyFormData(), getRowEmptyFormData()],
});

function checkValueField(value) {
    return value == null || value === undefined || isNaN(value);
}

function getNotNullNumbersFromArray(values) {
    return values
        .map((element) =>
            // Note : convertion toNumber is necessary here to prevent corner cases like if
            // two values are "-0" and "0", which would be considered different by the Set below.
            validateValueIsANumber(element.p ?? element?.oldP)
                ? toNumber(element.p ?? element?.oldP)
                : null
        )
        .filter((p) => p !== null);
}

function checkAllValuesAreUnique(values) {
    const validActivePowerValues = getNotNullNumbersFromArray(values);
    const setOfPs = [...new Set(validActivePowerValues)];
    return setOfPs.length === validActivePowerValues.length;
}

function checkAllValuesBetweenMinMax(values) {
    const validActivePowerValues = getNotNullNumbersFromArray(values);
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
                        'checkAllValuesAreUnique',
                        'ReactiveCapabilityCurveCreationErrorPInvalid',
                        (values) => checkAllValuesAreUnique(values)
                    )
                    .test(
                        'checkAllValuesBetweenMinMax',
                        'ReactiveCapabilityCurveCreationErrorPOutOfRange',
                        (values) => checkAllValuesBetweenMinMax(values)
                    ),
        }),
});

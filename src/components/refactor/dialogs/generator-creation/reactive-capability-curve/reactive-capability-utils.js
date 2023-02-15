/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {
    P,
    Q_MAX_P,
    Q_MIN_P,
    REACTIVE_CAPABILITY_CURVE_CHOICE,
    REACTIVE_CAPABILITY_CURVE_TABLE,
} from '../../../utils/field-constants';
import yup from '../../../utils/yup-config';
import {
    toNumber,
    validateValueIsANumber,
} from '../../../../util/validation-functions';

const reactiveCapabilityCurveRowEmptyFormData = {
    [P]: null,
    [Q_MAX_P]: null,
    [Q_MIN_P]: null,
};
export const getReactiveCapabilityCurveEmptyFormData = (
    id = REACTIVE_CAPABILITY_CURVE_TABLE
) => ({
    [id]: [
        reactiveCapabilityCurveRowEmptyFormData,
        reactiveCapabilityCurveRowEmptyFormData,
    ],
});

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
                    .of(
                        yup.object().shape({
                            [Q_MAX_P]: yup.number().nullable().required(),
                            [Q_MIN_P]: yup
                                .number()
                                .nullable()
                                .required()
                                .lessThan(
                                    yup.ref(Q_MAX_P),
                                    'ReactiveCapabilityCurveCreationErrorQminPQmaxPIncoherence'
                                ),
                            [P]: yup
                                .number()
                                .nullable()
                                .required()
                                .min(
                                    yup.ref(Q_MIN_P),
                                    'ReactiveCapabilityCurveCreationErrorPOutOfRange'
                                )
                                .max(
                                    yup.ref(Q_MAX_P),
                                    'ReactiveCapabilityCurveCreationErrorPOutOfRange'
                                ),
                        })
                    )
                    .min(2, 'ReactiveCapabilityCurveCreationErrorMissingPoints')
                    .test(
                        'validateP',
                        'ReactiveCapabilityCurveCreationErrorPInvalid',
                        (values) => {
                            const everyValidP = values
                                .map((element) =>
                                    // Note : convertion toNumber is necessary here to prevent corner cases like if
                                    // two values are "-0" and "0", which would be considered different by the Set below.
                                    validateValueIsANumber(element.p)
                                        ? toNumber(element.p)
                                        : null
                                )
                                .filter((p) => p !== null);
                            const setOfPs = [...new Set(everyValidP)];
                            return setOfPs.length === everyValidP.length;
                        }
                    ),
        }),
});

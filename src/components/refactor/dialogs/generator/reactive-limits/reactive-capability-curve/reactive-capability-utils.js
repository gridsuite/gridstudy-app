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

export const INSERT = 'INSERT';
export const REMOVE = 'REMOVE';

const getCreationRowSchema = () =>
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
        [P]: yup.number().nullable().required(),
    });

const getModificationRowSchema = () =>
    yup.object().shape({
        [Q_MAX_P]: yup
            .number()
            .nullable()
            .when([OLD_Q_MAX_P], {
                is: (oldQmaxP) => oldQmaxP === null,
                then: (schema) => schema.required(),
            }),
        [Q_MIN_P]: yup
            .number()
            .nullable()
            .when([OLD_Q_MIN_P], {
                is: (oldQminP) => oldQminP === null,
                then: (schema) => schema.required(),
            })
            .when([Q_MAX_P], {
                is: (value) => value != null,
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
                is: (oldP) => oldP === null,
                then: (schema) => schema.required(),
            }),
        [OLD_Q_MAX_P]: yup.number().nullable(),
        [OLD_Q_MIN_P]: yup.number().nullable(),
        [OLD_P]: yup.number().nullable(),
    });

const getCreationRowEmptyFormData = () => ({
    [P]: null,
    [Q_MAX_P]: null,
    [Q_MIN_P]: null,
});

export const getModificationRowEmptyFormData = () => ({
    [P]: null,
    [Q_MAX_P]: null,
    [Q_MIN_P]: null,
    [OLD_P]: null,
    [OLD_Q_MAX_P]: null,
    [OLD_Q_MIN_P]: null,
});

export const getReactiveCapabilityCurveEmptyFormData = (
    id = REACTIVE_CAPABILITY_CURVE_TABLE,
    isGeneratorModification = false
) => {
    const rowEmptyFormData = isGeneratorModification
        ? getModificationRowEmptyFormData()
        : getCreationRowEmptyFormData();
    return {
        [id]: [rowEmptyFormData, rowEmptyFormData],
    };
};

function getNotNullPFromArray(values, isGeneratorModification) {
    return values
        .map((element) => {
            //in case of modification, if p is null, we validate old_p value
            const pValue =
                isGeneratorModification && !element[P]
                    ? element[OLD_P]
                    : element[P];

            // Note : convertion toNumber is necessary here to prevent corner cases like if
            // two values are "-0" and "0", which would be considered different by the Set below.
            return validateValueIsANumber(pValue) ? toNumber(pValue) : null;
        })
        .filter((p) => p !== null);
}

function checkAllPValuesAreUnique(values, isGeneratorModification) {
    const validActivePowerValues = getNotNullPFromArray(
        values,
        isGeneratorModification
    );
    const setOfPs = [...new Set(validActivePowerValues)];
    return setOfPs.length === validActivePowerValues.length;
}

function checkAllPValuesBetweenMinMax(values, isGeneratorModification) {
    const validActivePowerValues = getNotNullPFromArray(
        values,
        isGeneratorModification
    );
    const minP = validActivePowerValues[0];
    const maxP = validActivePowerValues[validActivePowerValues.length - 1];

    return validActivePowerValues.every((p) => p >= minP && p <= maxP);
}

export const getReactiveCapabilityCurveValidationSchema = (
    id = REACTIVE_CAPABILITY_CURVE_TABLE,
    isGeneratorModification = false
) => ({
    [id]: yup
        .array()
        .nullable()
        .when([REACTIVE_CAPABILITY_CURVE_CHOICE], {
            is: 'CURVE',
            then: (schema) =>
                schema
                    .when([], {
                        is: () => !isGeneratorModification,
                        then: (schema) => schema.of(getCreationRowSchema()),
                        otherwise: (schema) =>
                            schema.of(getModificationRowSchema()),
                    })
                    .min(2, 'ReactiveCapabilityCurveCreationErrorMissingPoints')
                    .test(
                        'checkAllValuesAreUnique',
                        'ReactiveCapabilityCurveCreationErrorPInvalid',
                        (values) =>
                            checkAllPValuesAreUnique(
                                values,
                                isGeneratorModification
                            )
                    )
                    .test(
                        'checkAllValuesBetweenMinMax',
                        'ReactiveCapabilityCurveCreationErrorPOutOfRange',
                        (values) =>
                            checkAllPValuesBetweenMinMax(
                                values,
                                isGeneratorModification
                            )
                    ),
        }),
});

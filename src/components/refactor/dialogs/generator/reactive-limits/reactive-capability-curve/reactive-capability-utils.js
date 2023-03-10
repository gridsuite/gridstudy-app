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

const buildValidationError = (errors, field) => {
    return errors.length === 0
        ? true
        : {
              name: 'ValidationError',
              path: `${field}`,
              errors: [],
              inner: errors,
          };
};

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
        [Q_MAX_P]: yup.number().nullable(),
        [Q_MIN_P]: yup.number().nullable(),
        [P]: yup.number().nullable(),
    });

// it is not possible to access array index in yup, in order to compare currentValues with previous ones, we need to it manually
const validationModificationRow = (currentValues, previousValues, id) => {
    const errors = [];

    const mergedValues = mergeCurrentAndPreviousValues(
        currentValues,
        previousValues
    );

    const requiredProperties = [P, Q_MAX_P, Q_MIN_P];

    mergedValues.forEach((value, index) => {
        requiredProperties.forEach((property) => {
            if (value?.[property] == null) {
                errors.push(
                    new yup.ValidationError(
                        'YupRequired',
                        null,
                        `${id}[${index}].${property}`
                    )
                );
            }
        });

        if (value?.[Q_MIN_P] > value?.[Q_MAX_P]) {
            errors.push(
                new yup.ValidationError(
                    'ReactiveCapabilityCurveCreationErrorQminPQmaxPIncoherence',
                    null,
                    `${id}[${index}].${Q_MIN_P}`
                )
            );
        }
    });

    return buildValidationError(errors, id);
};

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

//merge previous and current values for validation, if current value is null, we take previous one for a specific field
function mergeCurrentAndPreviousValues(currentValues, previousValues) {
    if (previousValues === null) {
        return currentValues;
    }

    return currentValues.map((curVal, index) => {
        for (const [key, value] of Object.entries(curVal)) {
            if (value === null) {
                curVal[key] = previousValues[index]?.[key];
            }
        }

        return curVal;
    });
}

function checkAllValuesBetweenMinMax(values) {
    const validActivePowerValues = getNotNullNumbersFromArray(values);
    const minP = validActivePowerValues[0];
    const maxP = validActivePowerValues[validActivePowerValues.length - 1];

    return validActivePowerValues.every((p) => p >= minP && p <= maxP);
}

export const getReactiveCapabilityCurveValidationSchema = (
    id = REACTIVE_CAPABILITY_CURVE_TABLE,
    previousValues = null
) => ({
    [id]: yup
        .array()
        .nullable()
        .when([REACTIVE_CAPABILITY_CURVE_CHOICE], {
            is: 'CURVE',
            then: (schema) =>
                schema
                    .when([], {
                        is: () => previousValues === null,
                        then: (schema) => schema.of(getCreationRowSchema()),
                        otherwise: schema
                            .of(getModificationRowSchema())
                            .test('validate-modification-rows', (values) =>
                                validationModificationRow(
                                    values,
                                    previousValues,
                                    id
                                )
                            ),
                    })
                    .min(2, 'ReactiveCapabilityCurveCreationErrorMissingPoints')
                    .test(
                        'checkAllValuesAreUnique',
                        'ReactiveCapabilityCurveCreationErrorPInvalid',
                        (values) =>
                            checkAllValuesAreUnique(
                                mergeCurrentAndPreviousValues(
                                    values,
                                    previousValues
                                )
                            )
                    )
                    .test(
                        'checkAllValuesBetweenMinMax',
                        'ReactiveCapabilityCurveCreationErrorPOutOfRange',
                        (values) =>
                            checkAllValuesBetweenMinMax(
                                mergeCurrentAndPreviousValues(
                                    values,
                                    previousValues
                                )
                            )
                    ),
        }),
});

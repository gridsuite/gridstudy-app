/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { toNumber, validateValueIsANumber } from 'components/utils/validation-functions';
import * as yup from 'yup';
import {
    MAX_Q,
    MIN_Q,
    P,
    REACTIVE_CAPABILITY_CURVE_CHOICE,
    REACTIVE_CAPABILITY_CURVE_TABLE,
    REACTIVE_LIMITS,
} from 'components/utils/field-constants';
import { ReactiveCapabilityCurve } from '../reactive-limits.type';
import { FieldValues, UseFormSetValue } from 'react-hook-form';
import type { IntlShape } from 'react-intl';

export const INSERT = 'INSERT';
export const REMOVE = 'REMOVE';

const getCreationRowSchema = (intl: IntlShape) =>
    yup.object().shape({
        [MAX_Q]: yup.number().nullable().required(),
        [MIN_Q]: yup
            .number()
            .nullable()
            .required()
            .max(
                yup.ref(MAX_Q),
                intl.formatMessage({ id: 'ReactiveCapabilityCurveCreationErrorQminPQmaxPIncoherence' })
            ),
        [P]: yup.number().nullable().required(),
    });

export const getRowEmptyFormData = () => ({
    [P]: null,
    [MAX_Q]: null,
    [MIN_Q]: null,
});

function getNotNullPFromArray(values: ReactiveCapabilityCurve) {
    return values
        ?.map((element) => {
            const pValue = element[P];
            // Note : conversion toNumber is necessary here to prevent corner cases like if
            // two values are "-0" and "0", which would be considered different by the Set below.
            return validateValueIsANumber(pValue) ? toNumber(pValue) : null;
        })
        .filter((p) => p !== null);
}

function checkAllPValuesAreUnique(values: ReactiveCapabilityCurve) {
    const validActivePowerValues = getNotNullPFromArray(values);
    return [...new Set(validActivePowerValues)].length === validActivePowerValues?.length;
}

function checkAllPValuesBetweenMinMax(values: ReactiveCapabilityCurve) {
    const validActivePowerValues = getNotNullPFromArray(values);
    if (validActivePowerValues) {
        const minP = validActivePowerValues[0];
        const maxP = validActivePowerValues[validActivePowerValues.length - 1];
        return validActivePowerValues.every((p: number) => p >= minP && p <= maxP);
    }
}

export function getReactiveCapabilityCurveValidationSchema(
    intl: IntlShape,
    id = REACTIVE_CAPABILITY_CURVE_TABLE,
    positiveAndNegativePExist = false
) {
    return {
        [id]: yup
            .array()
            .nullable()
            .when([REACTIVE_CAPABILITY_CURVE_CHOICE], {
                is: 'CURVE',
                then: (schema) =>
                    schema
                        .of(getCreationRowSchema(intl))
                        .when([], {
                            is: () => positiveAndNegativePExist,
                            then: (schema) =>
                                schema
                                    .test(
                                        'checkATLeastThereIsOneNegativeP',
                                        intl.formatMessage({
                                            id: 'ReactiveCapabilityCurveCreationErrorMissingNegativeP',
                                        }),
                                        (values) => values?.some((value) => value.p < 0)
                                    )
                                    .test(
                                        'checkATLeastThereIsOnePositiveP',
                                        intl.formatMessage({
                                            id: 'ReactiveCapabilityCurveCreationErrorMissingPositiveP',
                                        }),
                                        (values) => values?.some((value) => value.p >= 0)
                                    ),
                        })
                        .min(2, 'ReactiveCapabilityCurveCreationErrorMissingPoints')
                        .test(
                            'checkAllValuesAreUnique',
                            intl.formatMessage({ id: 'ReactiveCapabilityCurveCreationErrorPInvalid' }),
                            (values) => checkAllPValuesAreUnique(values)
                        )
                        .test(
                            'checkAllValuesBetweenMinMax',
                            intl.formatMessage({ id: 'ReactiveCapabilityCurveCreationErrorPOutOfRange' }),
                            (values) => checkAllPValuesBetweenMinMax(values)
                        ),
            }),
    };
}

export function setSelectedReactiveLimits(
    id: string,
    minMaxReactiveLimits: number,
    setValue: UseFormSetValue<FieldValues>
) {
    setValue(id, minMaxReactiveLimits ? 'MINMAX' : 'CURVE');
}

export function setCurrentReactiveCapabilityCurveTable(
    previousReactiveCapabilityCurveTable: ReactiveCapabilityCurve,
    fieldKey: string,
    setValue: UseFormSetValue<FieldValues>
) {
    setValue(fieldKey, previousReactiveCapabilityCurveTable);
}

export function setCurrentReactiveCapabilityCurveChoice(
    previousReactiveCapabilityCurveTable: ReactiveCapabilityCurve,
    fieldKey: string,
    setValue: UseFormSetValue<FieldValues>
) {
    setValue(`${REACTIVE_LIMITS}.${REACTIVE_CAPABILITY_CURVE_CHOICE}`, 'MINMAX');
}

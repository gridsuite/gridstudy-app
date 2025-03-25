/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { toNumber, validateValueIsANumber } from 'components/utils/validation-functions';
import yup from 'components/utils/yup-config';
import {
    MAX_Q,
    MIN_Q,
    P,
    REACTIVE_CAPABILITY_CURVE_CHOICE,
    REACTIVE_CAPABILITY_CURVE_TABLE,
} from 'components/utils/field-constants';
import { ReactiveCapabilityCurve, ReactiveCapabilityCurvePoints } from '../reactive-limits.type';
import { FieldValues, UseFormGetValues, UseFormSetValue } from 'react-hook-form';

export const INSERT = 'INSERT';
export const REMOVE = 'REMOVE';

const getCreationRowSchema = () =>
    yup.object().shape({
        [MAX_Q]: yup.number().nullable().required(),
        [MIN_Q]: yup
            .number()
            .nullable()
            .required()
            .max(yup.ref(MAX_Q), 'ReactiveCapabilityCurveCreationErrorQminPQmaxPIncoherence'),
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

            // Note : convertion toNumber is necessary here to prevent corner cases like if
            // two values are "-0" and "0", which would be considered different by the Set below.
            return validateValueIsANumber(pValue) ? toNumber(pValue) : null;
        })
        .filter((p) => p !== null);
}

function checkAllPValuesAreUnique(values: ReactiveCapabilityCurve) {
    const validActivePowerValues = getNotNullPFromArray(values);
    const setOfPs = [...new Set(validActivePowerValues)];
    return setOfPs.length === validActivePowerValues?.length;
}

function checkAllPValuesBetweenMinMax(values: ReactiveCapabilityCurve) {
    const validActivePowerValues = getNotNullPFromArray(values);
    if (validActivePowerValues) {
        const minP = validActivePowerValues[0];
        const maxP = validActivePowerValues[validActivePowerValues.length - 1];
        return validActivePowerValues.every((p: number) => p >= minP && p <= maxP);
    }
}

export const getReactiveCapabilityCurveValidationSchema = (
    id = REACTIVE_CAPABILITY_CURVE_TABLE,
    positiveAndNegativePExist = false
) => ({
    [id]: yup
        .array()
        .nullable()
        .when([REACTIVE_CAPABILITY_CURVE_CHOICE], {
            is: 'CURVE',
            then: (schema) =>
                schema
                    .of(getCreationRowSchema())
                    .when([], {
                        is: () => positiveAndNegativePExist,
                        then: (schema) =>
                            schema
                                .test(
                                    'checkATLeastThereIsOneNegativeP',
                                    'ReactiveCapabilityCurveCreationErrorMissingNegativeP',
                                    (values) => values?.some((value) => value.p < 0)
                                )
                                .test(
                                    'checkATLeastThereIsOnePositiveP',
                                    'ReactiveCapabilityCurveCreationErrorMissingPositiveP',
                                    (values) => values?.some((value) => value.p >= 0)
                                ),
                    })
                    .min(2, 'ReactiveCapabilityCurveCreationErrorMissingPoints')
                    .test('checkAllValuesAreUnique', 'ReactiveCapabilityCurveCreationErrorPInvalid', (values) =>
                        checkAllPValuesAreUnique(values)
                    )
                    .test('checkAllValuesBetweenMinMax', 'ReactiveCapabilityCurveCreationErrorPOutOfRange', (values) =>
                        checkAllPValuesBetweenMinMax(values)
                    ),
        }),
});

export function setSelectedReactiveLimits(
    id: string,
    minMaxReactiveLimits: number,
    setValue: UseFormSetValue<FieldValues>
) {
    setValue(id, minMaxReactiveLimits ? 'MINMAX' : 'CURVE');
}

export function setCurrentReactiveCapabilityCurveTable(
    previousReactiveCapabilityCurveTable: ReactiveCapabilityCurvePoints,
    fieldKey: string,
    getValues: UseFormGetValues<FieldValues>,
    setValue: UseFormSetValue<FieldValues>,
    isNodeBuilt?: boolean
) {
    const currentReactiveCapabilityCurveTable = getValues(fieldKey);
    if (isNodeBuilt || !currentReactiveCapabilityCurveTable) {
        setValue(fieldKey, previousReactiveCapabilityCurveTable);
    }
}

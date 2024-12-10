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

function getNotNullPFromArray(values) {
    return values
        .map((element) => {
            const pValue = element[P];

            // Note : convertion toNumber is necessary here to prevent corner cases like if
            // two values are "-0" and "0", which would be considered different by the Set below.
            return validateValueIsANumber(pValue) ? toNumber(pValue) : null;
        })
        .filter((p) => p !== null);
}

function checkAllPValuesAreUnique(values) {
    const validActivePowerValues = getNotNullPFromArray(values);
    const setOfPs = [...new Set(validActivePowerValues)];
    return setOfPs.length === validActivePowerValues.length;
}

function checkAllPValuesBetweenMinMax(values) {
    const validActivePowerValues = getNotNullPFromArray(values);
    const minP = validActivePowerValues[0];
    const maxP = validActivePowerValues[validActivePowerValues.length - 1];

    return validActivePowerValues.every((p) => p >= minP && p <= maxP);
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
                                    (values) => values.some((value) => value.p < 0)
                                )
                                .test(
                                    'checkATLeastThereIsOnePositiveP',
                                    'ReactiveCapabilityCurveCreationErrorMissingPositiveP',
                                    (values) => values.some((value) => value.p >= 0)
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

export const insertEmptyRowAtSecondToLastIndex = (table) => {
    table.splice(table.length - 1, 0, {
        [P]: null,
        [MAX_Q]: null,
        [MIN_Q]: null,
    });
};

export function setSelectedReactiveLimits(id, minMaxReactiveLimits, setValue) {
    setValue(id, minMaxReactiveLimits ? 'MINMAX' : 'CURVE');
}

export function setCurrentReactiveCapabilityCurveTable(
    previousReactiveCapabilityCurveTable,
    fieldKey,
    getValues,
    setValue,
    isNodeBuilt
) {
    if (previousReactiveCapabilityCurveTable) {
        const currentReactiveCapabilityCurveTable = getValues(fieldKey);

        const sizeDiff = previousReactiveCapabilityCurveTable.length - currentReactiveCapabilityCurveTable.length;

        // if there are more values in previousValues table, we need to insert rows to current tables to match the number of previousValues table rows
        if (sizeDiff > 0) {
            for (let i = 0; i < sizeDiff; i++) {
                insertEmptyRowAtSecondToLastIndex(currentReactiveCapabilityCurveTable);
            }
            setValue(fieldKey, currentReactiveCapabilityCurveTable, {
                shouldValidate: true,
            });
        } else if (sizeDiff < 0) {
            // if there are more values in current table, we need to add rows to previousValues tables to match the number of current table rows
            for (let i = 0; i > sizeDiff; i--) {
                insertEmptyRowAtSecondToLastIndex(previousReactiveCapabilityCurveTable);
            }
        } else if (!isNodeBuilt && currentReactiveCapabilityCurveTable) {
            setValue(fieldKey, currentReactiveCapabilityCurveTable, {
                shouldValidate: true,
            });
        } else {
            setValue(fieldKey, previousReactiveCapabilityCurveTable, {
                shouldValidate: true,
            });
        }
    }
}

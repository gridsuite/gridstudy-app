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

const getModificationRowSchema = () =>
    yup.object().shape({
        [MAX_Q]: yup.number().nullable(),
        [MIN_Q]: yup
            .number()
            .nullable()
            .when([MAX_Q], {
                is: (value) => value != null,
                then: (schema) =>
                    schema.max(yup.ref(MAX_Q), 'ReactiveCapabilityCurveCreationErrorQminPQmaxPIncoherence'),
            }),
        [P]: yup.number().nullable(),
    });

export const getRowEmptyFormData = () => ({
    [P]: null,
    [MAX_Q]: null,
    [MIN_Q]: null,
});

export const getReactiveCapabilityCurveEmptyFormData = (id = REACTIVE_CAPABILITY_CURVE_TABLE) => {
    return {
        [id]: [getRowEmptyFormData(), getRowEmptyFormData()],
    };
};

function getNotNullPFromArray(values, isEquipmentModification) {
    return values
        .map((element) => {
            const pValue = element[P];

            // Note : convertion toNumber is necessary here to prevent corner cases like if
            // two values are "-0" and "0", which would be considered different by the Set below.
            return validateValueIsANumber(pValue) ? toNumber(pValue) : null;
        })
        .filter((p) => p !== null);
}

function checkAllPValuesAreUnique(values, isEquipmentModification) {
    const validActivePowerValues = getNotNullPFromArray(values, isEquipmentModification);
    const setOfPs = [...new Set(validActivePowerValues)];
    return setOfPs.length === validActivePowerValues.length;
}

function checkAllPValuesBetweenMinMax(values, isEquipmentModification) {
    const validActivePowerValues = getNotNullPFromArray(values, isEquipmentModification);
    const minP = validActivePowerValues[0];
    const maxP = validActivePowerValues[validActivePowerValues.length - 1];

    return validActivePowerValues.every((p) => p >= minP && p <= maxP);
}

export const getReactiveCapabilityCurveValidationSchema = (
    id = REACTIVE_CAPABILITY_CURVE_TABLE,
    isEquipmentModification = false,
    positiveAndNegativePExist = false
) => ({
    [id]: yup
        .array()
        .nullable()
        .when([REACTIVE_CAPABILITY_CURVE_CHOICE], {
            is: 'CURVE',
            then: (schema) =>
                schema
                    .when([], {
                        is: () => !isEquipmentModification,
                        then: (schema) => schema.of(getCreationRowSchema()),
                        otherwise: (schema) => schema.of(getModificationRowSchema()),
                    })
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
                        checkAllPValuesAreUnique(values, isEquipmentModification)
                    )
                    .test('checkAllValuesBetweenMinMax', 'ReactiveCapabilityCurveCreationErrorPOutOfRange', (values) =>
                        checkAllPValuesBetweenMinMax(values, isEquipmentModification)
                    ),
        }),
});

export const completeReactiveCapabilityCurvePointsData = (reactiveCapabilityCurvePoints) => {
    reactiveCapabilityCurvePoints.map((rcc) => {
        if (!(P in rcc)) {
            rcc[P] = null;
        }
        if (!(MAX_Q in rcc)) {
            rcc[MAX_Q] = null;
        }
        if (!(MIN_Q in rcc)) {
            rcc[MIN_Q] = null;
        }
        return rcc;
    });
    return reactiveCapabilityCurvePoints;
};

export const insertEmptyRowAtSecondToLastIndex = (table) => {
    table.splice(table.length - 1, 0, {
        [P]: null,
        [MAX_Q]: null,
        [MIN_Q]: null,
    });
};

export const calculateCurvePointsToStore = (reactiveCapabilityCurve, equipmentToModify) => {
    if (reactiveCapabilityCurve.every((point) => point.p == null && point.minQ == null && point.maxQ == null)) {
        return null;
    } else {
        const pointsToStore = [];
        reactiveCapabilityCurve.forEach((point, index) => {
            if (point) {
                const previousPoint = equipmentToModify?.reactiveCapabilityCurveTable?.[index];
                let pointToStore = {
                    p: point?.[P],
                    oldP: previousPoint?.p ?? null,
                    minQ: point?.minQ,
                    oldMinQ: previousPoint?.minQ ?? null,
                    maxQ: point?.maxQ,
                    oldMaxQ: previousPoint?.maxQ ?? null,
                };
                pointsToStore.push(pointToStore);
            }
        });
        return pointsToStore.filter(
            (point) =>
                point.p != null ||
                point.oldP != null ||
                point.maxQ != null ||
                point.oldMaxQ != null ||
                point.minQ != null ||
                point.oldMinQ != null
        );
    }
};

export function setSelectedReactiveLimits(id, minMaxReactiveLimits, setValue) {
    setValue(id, minMaxReactiveLimits ? 'MINMAX' : 'CURVE');
}

export function setCurrentReactiveCapabilityCurveTable(
    previousReactiveCapabilityCurveTable,
    fieldKey,
    getValues,
    setValue
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
        }
    }
}

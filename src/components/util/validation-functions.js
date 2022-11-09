/*
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

function toNumber(val) {
    // Watch out, this will convert an empty string to zero.
    return typeof val === 'number' ? val : Number(val.replace(',', '.'));
}

/*
 * Returns true if the value is a valid number, per Gridsuite's standard (allows coma instead of dots for decimal).
 */
export function validateValueIsANumber(value) {
    if (value === undefined || value === '') {
        return false;
    }
    return !isNaN(toNumber(value));
}

/*
 * Returns true IF and ONLY IF :
 * - the first parameter value is a valid number
 * - the second parameter valueToCompareTo is a valid number
 * - the first parameter's value is lower or equal than the second's
 */
export function validateValueIsLessOrEqualThan(value, valueToCompareTo) {
    return (
        validateValueIsANumber(value) &&
        validateValueIsANumber(valueToCompareTo) &&
        toNumber(value) <= toNumber(valueToCompareTo)
    );
}

export function validateField(value, toValidate) {
    // TODO: maybe update this function with the help of the new ones just above.
    if (toValidate.isFieldRequired) {
        if (
            (!toValidate.isFieldNumeric && !value) ||
            (toValidate.isFieldNumeric && value === '')
        ) {
            return makeErrorRecord('FieldIsRequired');
        }
    }

    if (toValidate.isFieldNumeric) {
        // TODO: remove replace when parsing behaviour will be made according to locale
        // TODO EDIT : are these comments still up to date ? The replace call was transfered to the toNumber function above. Maybe add a (clearer) comment in the toNumber function above ?
        const valueNumericVal = toNumber(value);
        if (isNaN(valueNumericVal)) {
            return makeErrorRecord('FieldAcceptNumeric');
        }
    }

    if (toValidate.isValueLessOrEqualTo !== undefined) {
        if (value && toValidate.isValueLessOrEqualTo) {
            // TODO: remove replace when parsing behaviour will be made according to locale
            const maxValue = toNumber(toValidate.isValueLessOrEqualTo);
            if (!isNaN(maxValue)) {
                // TODO: remove replace when parsing behaviour will be made according to locale
                const valueNumericVal = toNumber(value);
                if (valueNumericVal > maxValue) {
                    return makeErrorRecord(toValidate.errorMsgId);
                }
            }
        }
    }

    if (toValidate.isValueGreaterThan !== undefined) {
        if (value && toValidate.isValueGreaterThan) {
            // TODO: remove replace when parsing behaviour will be made according to locale
            const minValue = toNumber(toValidate.isValueGreaterThan);

            if (!isNaN(minValue)) {
                // TODO: remove replace when parsing behaviour will be made according to locale
                const valueNumericVal = toNumber(value);
                if (valueNumericVal <= minValue) {
                    return makeErrorRecord(toValidate.errorMsgId);
                }
            }
        }
    }

    if (toValidate.function) return makeErrorRecord(toValidate.function(value));

    return makeErrorRecord(null);
}

export function makeErrorRecord(msgId) {
    return {
        error: !!msgId,
        errorMsgId: msgId,
    };
}

export function makeErrorHelper(errors, intl, fieldId) {
    let errEntry = errors.get(fieldId);
    if (!errEntry || !errEntry.error) return '';
    return intl.formatMessage({
        id: errEntry.errorMsgId,
    });
}

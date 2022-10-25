/*
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export function validateField(value, toValidate) {
    function toNumber(val) {
        return typeof val === 'number' ? val : Number(val.replace(',', '.'));
    }

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

    if (toValidate.isValueGreaterOrEqualThan !== undefined) {
        if (value && toValidate.isValueGreaterOrEqualThan) {
            // TODO: remove replace when parsing behaviour will be made according to locale
            const minValue = toNumber(toValidate.isValueGreaterOrEqualThan);

            if (!isNaN(minValue)) {
                // TODO: remove replace when parsing behaviour will be made according to locale
                const valueNumericVal = toNumber(value);
                if (valueNumericVal < minValue) {
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

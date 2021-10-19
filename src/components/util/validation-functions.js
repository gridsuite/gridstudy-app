/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export function validateField(value, toValidate) {
    if (toValidate.isFieldRequired) {
        if (!value) {
            return {
                error: true,
                errorMsgId: 'FieldIsRequired',
            };
        }
    }

    if (toValidate.isFieldNumeric) {
        // TODO: remove replace when parsing behaviour will be made according to locale
        const valueNumericVal = Number(value.replace(',', '.'));
        if (isNaN(valueNumericVal)) {
            return {
                error: true,
                errorMsgId: 'FieldAcceptNumeric',
            };
        }
    }

    if (toValidate.isValueLessOrEqualTo !== undefined) {
        if (value && toValidate.isValueLessOrEqualTo) {
            // TODO: remove replace when parsing behaviour will be made according to locale
            const maxValue = Number(
                toValidate.isValueLessOrEqualTo.replace(',', '.')
            );
            if (!isNaN(maxValue)) {
                // TODO: remove replace when parsing behaviour will be made according to locale
                const valueNumericVal = Number(value.replace(',', '.'));
                if (valueNumericVal > maxValue) {
                    return {
                        error: true,
                        errorMsgId: toValidate.errorMsgId,
                    };
                }
            }
        }
        return { error: false, errorMsgId: '' };
    }

    if (toValidate.isValueGreaterThan !== undefined) {
        if (value) {
            // TODO: remove replace when parsing behaviour will be made according to locale
            const minValue = Number(
                toValidate.isValueGreaterThan.replace(',', '.')
            );
            if (!isNaN(minValue)) {
                // TODO: remove replace when parsing behaviour will be made according to locale
                const valueNumericVal = Number(value.replace(',', '.'));
                if (valueNumericVal <= minValue) {
                    return {
                        error: true,
                        errorMsgId: toValidate.errorMsgId,
                    };
                }
            }
        }
        return { error: false, errorMsgId: '' };
    }

    return {
        error: false,
        errorMsgId: '',
    };
}

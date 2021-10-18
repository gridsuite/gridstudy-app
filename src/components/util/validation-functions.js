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

    if (toValidate.checkFieldValue) {
        return toValidate.checkFieldValue();
    }

    return {
        error: false,
        errorMsgId: '',
    };
}

/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const NO_ERROR = {
    error: false,
    errorMsgId: null,
};

/*
 * Returns a Number corresponding to provided value, or NaN if not a valid number per
 * Gridsuite's standard (allows either coma or dots for decimal).
 */
export function toNumber(value: unknown) {
    if (typeof value === 'number') {
        return value;
    } else if (typeof value === 'string') {
        const sanitizedString = value.replace(',', '.').trim();
        if (value.length > 0) {
            return Number(sanitizedString);
        }
    }
    console.error('Error while trying to convert a value to Number. Value :', value);
    return NaN;
}

export function isNotBlankOrEmpty<T>(value: T): value is NonNullable<T> {
    return !isBlankOrEmpty(value);
}

/*
 * Returns true if value is either undefined, null, empty or only contains whitespaces.
 * Otherwise, if value is a boolean or a number, returns false.
 */
export function isBlankOrEmpty<T>(value: T) {
    if (value === undefined || value === null) {
        return true;
    }
    if (typeof value === 'string') {
        return /^\s*$/.test(value);
    }
    return false;
}

/*
 * Returns true if the value is a valid number, per Gridsuite's standard (allows either coma or dots for decimal).
 */
export function validateValueIsANumber(value?: string | number | null | boolean): value is number {
    if (value == null || value === '') {
        return false;
    }
    return !isNaN(toNumber(value));
}

/*
 * Returns true IF and ONLY IF :
 * - the first parameter value is a valid number
 * - the second parameter valueToCompareTo is a valid number
 * - the first parameter's value is lower or equal to the second's
 */
export function validateValueIsLessThanOrEqualTo(
    value?: string | number | null | boolean,
    valueToCompareTo?: string | number | null | boolean
) {
    return (
        validateValueIsANumber(value) &&
        validateValueIsANumber(valueToCompareTo) &&
        toNumber(value) <= toNumber(valueToCompareTo)
    );
}

/*
 * Returns true IF and ONLY IF :
 * - the first parameter value is a valid number
 * - the second parameter valueToCompareTo is a valid number
 * - the first parameter's value is greater or equal to the second's
 */
export function validateValueIsGreaterThanOrEqualTo(
    value?: string | number | null | boolean,
    valueToCompareTo?: string | number | null | boolean
) {
    return (
        validateValueIsANumber(value) &&
        validateValueIsANumber(valueToCompareTo) &&
        toNumber(value) >= toNumber(valueToCompareTo)
    );
}

/*
 * Returns true IF and ONLY IF :
 * - the first parameter value is a valid number
 * - the second parameter valueToCompareTo is a valid number
 * - the first parameter's value is lower than the second's
 */
export function validateValueIsLessThan(
    value?: string | number | null | boolean,
    valueToCompareTo?: string | number | null | boolean
) {
    return (
        validateValueIsANumber(value) &&
        validateValueIsANumber(valueToCompareTo) &&
        toNumber(value) < toNumber(valueToCompareTo)
    );
}

/*
 * Returns true IF and ONLY IF :
 * - the first parameter value is a valid number
 * - the second parameter valueToCompareTo is a valid number
 * - the first parameter's value is greater than the second's
 */
export function validateValueIsGreaterThan(
    value?: string | number | null | boolean,
    valueToCompareTo?: string | number | null | boolean
) {
    return (
        validateValueIsANumber(value) &&
        validateValueIsANumber(valueToCompareTo) &&
        toNumber(value) > toNumber(valueToCompareTo)
    );
}

interface ToValidateType {
    isFieldRequired?: boolean;
    forceValidation?: boolean;
    isFieldNumeric?: boolean;
    valueLessThanOrEqualTo?: number;
    valueGreaterThanOrEqualTo?: number;
    valueLessThan?: number;
    valueGreaterThan?: number;
    errorMsgId?: string;
}

/*
 * Rule : if the field is NOT required (toValidate.isFieldRequired is either undefined or equals to false),
 * then any check that applies to the value will pass if the value is empty.
 */
export function validateField(
    value: string | number | null | undefined | boolean,
    toValidate: ToValidateType,
    disabled = false
) {
    if (disabled && !toValidate.forceValidation) {
        return NO_ERROR;
    }
    const isValueBlankOrEmpty = isBlankOrEmpty(value);

    if (toValidate.isFieldRequired && isValueBlankOrEmpty) {
        return makeErrorRecord('FieldIsRequired');
    }

    if (!isValueBlankOrEmpty && toValidate.isFieldNumeric && !validateValueIsANumber(value)) {
        return makeErrorRecord('FieldAcceptNumeric');
    }

    if (toValidate.valueLessThanOrEqualTo !== undefined) {
        if (!isValueBlankOrEmpty && !validateValueIsLessThanOrEqualTo(value, toValidate.valueLessThanOrEqualTo)) {
            return makeErrorRecord(toValidate.errorMsgId);
        }
    }

    if (toValidate.valueGreaterThanOrEqualTo !== undefined) {
        if (!isValueBlankOrEmpty && !validateValueIsGreaterThanOrEqualTo(value, toValidate.valueGreaterThanOrEqualTo)) {
            return makeErrorRecord(toValidate.errorMsgId);
        }
    }

    if (toValidate.valueLessThan !== undefined) {
        if (!isValueBlankOrEmpty && !validateValueIsLessThan(value, toValidate.valueLessThan)) {
            return makeErrorRecord(toValidate.errorMsgId);
        }
    }

    if (toValidate.valueGreaterThan !== undefined) {
        if (!isValueBlankOrEmpty && !validateValueIsGreaterThan(value, toValidate.valueGreaterThan)) {
            return makeErrorRecord(toValidate.errorMsgId);
        }
    }

    return NO_ERROR;
}

function makeErrorRecord(msgId?: string) {
    if (msgId === undefined) {
        console.warn('Error message id missing in validation function !');
    }
    return {
        error: true,
        errorMsgId: msgId,
    };
}

export const exportedForTesting = {
    toNumber,
    isBlankOrEmpty,
};

/*
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
function toNumber(value) {
    if (typeof value === 'number') {
        return value;
    } else if (typeof value === 'string') {
        const sanitizedString = value.replace(',', '.').trim();
        if (value.length > 0) {
            return Number(sanitizedString);
        }
    }
    console.error(
        'Error while trying to convert a value to Number. Value :',
        value
    );
    return NaN;
}

/*
 * Returns true if value is either undefined, null, empty or only contains whitespaces.
 * Otherwise, if value is a boolean or a number, returns false.
 */
function isBlankOrEmpty(value) {
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
 * - the first parameter's value is lower or equal to the second's
 */
export function validateValueIsLessThanOrEqualTo(value, valueToCompareTo) {
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
export function validateValueIsGreaterThanOrEqualTo(value, valueToCompareTo) {
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
export function validateValueIsLessThan(value, valueToCompareTo) {
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
export function validateValueIsGreaterThan(value, valueToCompareTo) {
    return (
        validateValueIsANumber(value) &&
        validateValueIsANumber(valueToCompareTo) &&
        toNumber(value) > toNumber(valueToCompareTo)
    );
}

/*
 * Rule : if the field is NOT required (toValidate.isFieldRequired is either undefined or equals to false),
 * then any check that applies to the value will pass if the value is empty.
 */
export function validateField(value, toValidate) {
    if (toValidate.skipValidation) {
        return NO_ERROR;
    }
    const isValueBlankOrEmpty = isBlankOrEmpty(value);

    if (toValidate.isFieldRequired && isValueBlankOrEmpty) {
        return makeErrorRecord('FieldIsRequired');
    }

    if (
        !isValueBlankOrEmpty &&
        toValidate.isFieldNumeric &&
        !validateValueIsANumber(value)
    ) {
        return makeErrorRecord('FieldAcceptNumeric');
    }

    if (toValidate.valueLessThanOrEqualTo !== undefined) {
        if (
            !isValueBlankOrEmpty &&
            !validateValueIsLessThanOrEqualTo(
                value,
                toValidate.valueLessThanOrEqualTo
            )
        ) {
            return makeErrorRecord(toValidate.errorMsgId);
        }
    }

    if (toValidate.valueGreaterThanOrEqualTo !== undefined) {
        if (
            !isValueBlankOrEmpty &&
            !validateValueIsGreaterThanOrEqualTo(
                value,
                toValidate.valueGreaterThanOrEqualTo
            )
        ) {
            return makeErrorRecord(toValidate.errorMsgId);
        }
    }

    if (toValidate.valueLessThan !== undefined) {
        if (
            !isValueBlankOrEmpty &&
            !validateValueIsLessThan(value, toValidate.valueLessThan)
        ) {
            return makeErrorRecord(toValidate.errorMsgId);
        }
    }

    if (toValidate.valueGreaterThan !== undefined) {
        if (
            !isValueBlankOrEmpty &&
            !validateValueIsGreaterThan(value, toValidate.valueGreaterThan)
        ) {
            return makeErrorRecord(toValidate.errorMsgId);
        }
    }

    if (toValidate.function) {
        //return makeErrorRecord(toValidate.function(value)); // TODO Seems to not be used anymore ? To remove ?
        console.error(
            'Validation by function, this is still used, and needs to be fixed.'
        );
    }

    return NO_ERROR;
}

/**
 * Checks if the provided reactive capabilty curve is valid. Returns a list of
 * errors if any, or an empty array otherwise.
 * @param reactiveCapabilityCurve an array of reactive capability curve points of
 * this format : [{ p: '', qminP: '', qmaxP: '' }, { p: '', qminP: '', qmaxP: '' }]
 * @returns An array of error messages. If there is no error, returns an empty array.
 */
export function checkReactiveCapabilityCurve(reactiveCapabilityCurve) {
    let errorMessages = [];

    // At least four points must be set
    if (reactiveCapabilityCurve.length < 2) {
        errorMessages.push('ReactiveCapabilityCurveCreationErrorMissingPoints');
    }

    // Each P must be a unique valid number
    const everyValidP = reactiveCapabilityCurve
        .map((element) =>
            // Note : convertion toNumber is necessary here to prevent corner cases like if
            // two values are "-0" and "0", which would be considered different by the Set below.
            validateValueIsANumber(element.p) ? toNumber(element.p) : null
        )
        .filter((p) => p !== null);
    const setOfPs = [...new Set(everyValidP)];

    if (setOfPs.length !== everyValidP.length) {
        errorMessages.push('ReactiveCapabilityCurveCreationErrorPInvalid');
    } else {
        // The first P must be the lowest value
        // The last P must be the highest value
        // The P in between must be in the range defined by the first and last P
        const minP = everyValidP[0];
        const maxP = everyValidP[everyValidP.length - 1];
        const pAreInRange = everyValidP.filter(
            (p) =>
                validateValueIsLessThanOrEqualTo(minP, p) &&
                validateValueIsLessThanOrEqualTo(p, maxP)
        );
        if (pAreInRange.length !== everyValidP.length) {
            errorMessages.push(
                'ReactiveCapabilityCurveCreationErrorPOutOfRange'
            );
        }
    }

    // Each qMin must be inferior or equal to qMax
    for (let element of reactiveCapabilityCurve) {
        if (!validateValueIsLessThanOrEqualTo(element.qminP, element.qmaxP)) {
            errorMessages.push(
                'ReactiveCapabilityCurveCreationErrorQminPQmaxPIncoherence'
            );
            break;
        }
    }
    return errorMessages;
}

function makeErrorRecord(msgId) {
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

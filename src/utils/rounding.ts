/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

// add some little margin of error to 64bit doubles which have 15-17 decimal digits
// this allows for computations or conversions which result in a number very close to a nice short decimal number to be shown as the nice number
// in exchange for getting nicer shorter numbers more often, we choose to drop all precision beyond this limit to have uniform precision.
// The number of significant digits, e.g. 12345.67890123 or 1.234567890123 or 1234567890123 or 0.00000001234567890123
// note: this is not the digits after the decimal point, this is the total number of digits after the first non zero digit
export const GRIDSUITE_DEFAULT_PRECISION = 13;

// convert to rounded decimal string and reparse to get a nicer number
// example: with precision=13,
//   round most numbers in approximately the range [0x1.3333333333000p+0, 0x1.3333333334000]
//   to 0x1.3333333333333p+0 (in decimal "1.1999999999999999555910790149937383830547332763671875" or just "1.2" in the nice short form)
//   so we get
//      "1.1999999999995" => "1.199999999999"
//      "1.1999999999996" => "1.2"
//      .. many numbers in between
//      "1.2000000000004" => "1.2"
//      "1.2000000000005" => "1.200000000001"
// Note: this is not guaranteed to always round in the same direction:
// roundToPrecision(300000.00000365, 13) => 300000.0000037
// roundToPrecision(900000.00000365, 13) => 900000.0000036
export const roundToPrecision = (num: number, precision: number) => Number(num.toPrecision(precision));
export const roundToDefaultPrecision = (num: number) => roundToPrecision(num, GRIDSUITE_DEFAULT_PRECISION);

/**
 * Counts the number of decimal places in a given number.
 * Converts the number to a string and checks for a decimal point.
 * If a decimal point is found, it returns the length of the sequence following the decimal point.
 * Returns 0 if there is no decimal part.
 * @param {number} number - The number whose decimal places are to be counted.
 * @returns {number} The number of decimal places in the input number.
 */
export const countDecimalPlaces = (number: number) => {
    // Convert the number to a string for easier manipulation
    const numberAsString = number.toString();
    return countDecimalPlacesFromString(numberAsString);
};

export const countDecimalPlacesFromString = (numberAsString: string) => {
    // Check if the number has a decimal part
    if (numberAsString.includes('.')) {
        // Return the length of the part after the decimal point
        return numberAsString.split('.')[1].length;
    }

    // If the number does not have a decimal part, return 0
    return 0;
};

export const truncateNumber = (value: number, decimalPrecision: number) => {
    // Calculate the factor based on the decimal precision (e.g., 100 for two decimal places)
    let factor = Math.pow(10, decimalPrecision);

    // Truncate the number to maintain precision
    // Here, 'value' is multiplied by a factor before being floored.
    // This truncation helps in eliminating floating point arithmetic issues like 0.1 + 0.2 not exactly equaling 0.3.
    // After flooring, the value is divided by the same factor to revert it to its original scale but truncated.
    let truncatedNumber = Math.floor(value * factor) / factor;

    return truncatedNumber;
};

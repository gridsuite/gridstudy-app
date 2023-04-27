/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { isBlankOrEmpty } from 'components/utils/validation-functions';

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
export const roundToPrecision = (num, precision) =>
    Number(num.toPrecision(precision));
export const roundToDefaultPrecision = (num) =>
    roundToPrecision(num, GRIDSUITE_DEFAULT_PRECISION);

export const unitToMicroUnit = (num) =>
    isBlankOrEmpty(num) ? undefined : roundToDefaultPrecision(num * 1e6);
export const microUnitToUnit = (num) =>
    isBlankOrEmpty(num) ? undefined : roundToDefaultPrecision(num / 1e6);
export const kiloUnitToUnit = (num) =>
    isBlankOrEmpty(num) ? undefined : roundToDefaultPrecision(num * 1e3);
export const unitToKiloUnit = (num) =>
    isBlankOrEmpty(num) ? undefined : roundToDefaultPrecision(num / 1e3);

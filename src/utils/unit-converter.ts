/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { isBlankOrEmpty } from '../components/utils/validation-functions';
import { roundToDefaultPrecision } from './rounding';

export enum DISPLAY_CONVERSION {
    NONE, // default mode : data fetched from the back are displayed without any change
    TO_KILO, // values are divided by 1000 before display
}

/**
 * Typically this function should be called whenever a 'backend' value should be displayed differently on the 'frontend'
 */
export function convertFromRealValuesToDisplay(
    val: number,
    mode: DISPLAY_CONVERSION
): number | undefined {
    switch (mode) {
        case DISPLAY_CONVERSION.NONE:
            return val;
        case DISPLAY_CONVERSION.TO_KILO:
            return unitToKiloUnit(val);
    }
}

/**
 * Typically this function should be called whenever a 'frontend' value should be converted to a 'backend' value format
 * example : when a user sends data but enter them in a different unit than how this data is stored in the 'backend'
 */
export function convertFromDisplayToRealValues(
    val: string,
    mode: DISPLAY_CONVERSION
): string | number | undefined {
    switch (mode) {
        case DISPLAY_CONVERSION.NONE:
            return val;
        case DISPLAY_CONVERSION.TO_KILO:
            return kiloUnitToUnit(val);
    }
}

export const unitToMicroUnit = (num: any) =>
    isBlankOrEmpty(num) ? undefined : roundToDefaultPrecision(num * 1e6);
export const microUnitToUnit = (num: any) =>
    isBlankOrEmpty(num) ? undefined : roundToDefaultPrecision(num / 1e6);
export const kiloUnitToUnit = (num: any) =>
    isBlankOrEmpty(num) ? undefined : roundToDefaultPrecision(num * 1e3);
export const unitToKiloUnit = (num: any) =>
    isBlankOrEmpty(num) ? undefined : roundToDefaultPrecision(num / 1e3);

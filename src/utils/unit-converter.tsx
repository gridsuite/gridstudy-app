import { kiloUnitToUnit, unitToKiloUnit } from './rounding';

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

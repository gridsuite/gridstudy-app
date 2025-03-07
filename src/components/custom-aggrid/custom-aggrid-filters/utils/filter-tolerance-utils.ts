/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { isNumber } from 'mathjs';
import { countDecimalPlaces, countDecimalPlacesFromString } from '../../../../utils/rounding';
import { FilterConfig } from '../../../../types/custom-aggrid-types';
import { FILTER_NUMBER_COMPARATORS, UNDISPLAYED_FILTER_NUMBER_COMPARATORS } from '../custom-aggrid-filter.type';

/**
 * Compute the tolerance that should be applied when comparing filter values to database values
 * @param value value entered in the filter
 */
export const computeTolerance = (value: unknown) => {
    if (!value) {
        return 0;
    }
    let decimalPrecision: number;
    // the reference for the comparison is the number of digits after the decimal point in 'value'
    // extra digits are ignored, but the user may add '0's after the decimal point in order to get a better precision
    if (isNumber(value)) {
        decimalPrecision = countDecimalPlaces(value);
    } else {
        decimalPrecision = countDecimalPlacesFromString(value as string);
    }
    // tolerance is multiplied by 0.5 to simulate the fact that the database value is rounded (in the front, from the user viewpoint)
    // more than 13 decimal after dot will likely cause rounding errors due to double precision
    return (1 / Math.pow(10, decimalPrecision)) * 0.5;
};

export const addToleranceToFilter = (
    filters: FilterConfig[],
    tolerance: number | undefined = undefined
): FilterConfig[] => {
    let finalTolerance: number;
    if (tolerance !== undefined) {
        finalTolerance = tolerance;
    }
    return filters
        .map((filter): FilterConfig | FilterConfig[] => {
            // Attempt to convert filter value to a number if it's a string, otherwise keep it as is
            let valueAsNumber = typeof filter.value === 'string' ? parseFloat(filter.value) : filter.value;
            // If the value is successfully converted to a number, apply tolerance adjustments
            if (typeof valueAsNumber === 'number') {
                if (tolerance === undefined) {
                    // better to use the string value (filter.value) in order not to lose the decimal precision for values like 420.0000000
                    finalTolerance = computeTolerance(filter.value);
                }

                // Depending on the filter type, adjust the filter value by adding or subtracting the tolerance
                switch (filter.type) {
                    // Creates two conditions to test we are not in [value-tolerance..value+tolerance] (handles rounded decimal precision)
                    case FILTER_NUMBER_COMPARATORS.NOT_EQUAL:
                        return [
                            {
                                ...filter,
                                type: UNDISPLAYED_FILTER_NUMBER_COMPARATORS.GREATER_THAN,
                                value: valueAsNumber + finalTolerance,
                            },
                            {
                                ...filter,
                                type: UNDISPLAYED_FILTER_NUMBER_COMPARATORS.LESS_THAN,
                                value: valueAsNumber - finalTolerance,
                            },
                        ];
                    case FILTER_NUMBER_COMPARATORS.LESS_THAN_OR_EQUAL:
                        // Adjust the value upwards by the tolerance
                        return {
                            ...filter,
                            value: valueAsNumber + finalTolerance,
                        };
                    case FILTER_NUMBER_COMPARATORS.GREATER_THAN_OR_EQUAL:
                        return {
                            ...filter,
                            value: valueAsNumber - finalTolerance,
                        };
                    default:
                        return filter;
                }
            }
            return filter;
        })
        .flat(); // Flatten the array in case any filters were expanded into multiple conditions
};

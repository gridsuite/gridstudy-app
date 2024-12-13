/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FILTER_NUMBER_COMPARATORS, FILTER_TEXT_COMPARATORS } from 'components/custom-aggrid/custom-aggrid-header.type';
import { getEnumLabelById } from 'components/utils/utils';
import { EnumOption } from 'components/utils/utils-type';

const contains = (target: string, lookingFor: string): boolean => {
    if (target && lookingFor) {
        return target?.toLowerCase().indexOf(lookingFor.toLowerCase()) >= 0;
    }
    return false;
};

export const getEnumFilterConfig = (enumOptions: EnumOption[]) => {
    return {
        filter: 'agTextColumnFilter',
        filterParams: {
            caseSensitive: false,
            maxNumConditions: 1,
            filterOptions: [FILTER_TEXT_COMPARATORS.CONTAINS],
            textMatcher: ({ value, filterText, context }: any): boolean => {
                if (value) {
                    const label = enumOptions
                        ? getEnumLabelById(enumOptions as EnumOption[], value.toUpperCase())
                        : value;
                    const displayedValue = label ? context.intl.formatMessage({ id: label }) : value;
                    return contains(displayedValue, filterText || '');
                }
                return false;
            },
            debounceMs: 200,
        },
    };
};

export const defaultColumnType = {
    textFilter: {
        filter: 'agTextColumnFilter',
        filterParams: {
            caseSensitive: false,
            maxNumConditions: 1,
            filterOptions: [FILTER_TEXT_COMPARATORS.STARTS_WITH, FILTER_TEXT_COMPARATORS.CONTAINS],
        },
        sortable: true,
        resizable: true,
    },
    numericFilter: {
        filter: 'agNumberColumnFilter',
        filterParams: {
            maxNumConditions: 1,
            filterOptions: Object.values(FILTER_NUMBER_COMPARATORS),
            debounceMs: 200,
        },
        sortable: false,
        resizable: true,
    },
    booleanFilter: {
        filter: 'agTextColumnFilter',
        filterParams: {
            caseSensitive: false,
            maxNumConditions: 1,
            filterOptions: [FILTER_TEXT_COMPARATORS.EQUALS],
            textMatcher: ({ value, filterText, context }: any): boolean => {
                if (value) {
                    const displayedValue = context.intl.formatMessage({ id: value }) ?? value;
                    return contains(displayedValue, filterText || '');
                }
                return false;
            },
        },
        sortable: true,
        resizable: true,
    },
    countryFilter: {
        filter: 'agTextColumnFilter',
        filterParams: {
            caseSensitive: false,
            maxNumConditions: 1,
            filterOptions: [FILTER_TEXT_COMPARATORS.CONTAINS],
            textMatcher: ({ value, filterText, context }: { value: string; filterText: string; context: any }) => {
                if (value) {
                    const countryCode = value?.toUpperCase();
                    const countryName = context?.translateCountryCode(countryCode);
                    return contains(countryName, filterText || '') || contains(value, filterText);
                }
                return false;
            },
            debounceMs: 200,
        },
        sortable: true,
        resizable: true,
    },
};

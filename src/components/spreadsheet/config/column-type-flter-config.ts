/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FILTER_NUMBER_COMPARATORS, FILTER_TEXT_COMPARATORS } from 'components/custom-aggrid/custom-aggrid-header.type';

function contains(target: string, lookingFor: string) {
    return target && target?.toLowerCase().indexOf(lookingFor.toLowerCase()) >= 0;
}

export const getEnumFilterConfig = () => {
    return {
        enumFilter: {
            filter: 'agTextColumnFilter',
            filterParams: {
                caseSensitive: false,
                maxNumConditions: 1,
                filterOptions: [FILTER_TEXT_COMPARATORS.CONTAINS],
                textMatcher: ({ value, filterText }: { value: string; filterText: string }) => {
                    if (value) {
                        return contains(value, filterText || '');
                    }
                    return false;
                },
                debounceMs: 200,
            },
        },
    };
};

export const defaultColumnType = {
    textFilter: {
        filter: 'agTextColumnFilter',
        filterParams: {
            caseSensitive: false,
            filterOptions: [FILTER_TEXT_COMPARATORS.STARTS_WITH, FILTER_TEXT_COMPARATORS.CONTAINS],
        },
        sortable: true,
        resizable: true,
    },
    numericFilter: {
        filter: 'agNumberColumnFilter',
        filterParams: {
            filterOptions: Object.values(FILTER_NUMBER_COMPARATORS),
            debounceMs: 200,
        },
        sortable: false,
        resizable: true,
    },
};

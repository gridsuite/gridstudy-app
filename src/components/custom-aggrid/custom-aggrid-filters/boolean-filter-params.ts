/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import type { IFilterOptionDef } from 'ag-grid-community';
import { BooleanFilterValue } from '@gridsuite/commons-ui';

export const booleanFilterParams = {
    filterOptions: [
        {
            displayKey: 'booleanMatches',
            displayName: 'booleanMatches', // translation key
            predicate: (filterValues: string[], cellValue: boolean) => {
                const filterValue = filterValues.at(0);
                if (filterValue === undefined) {
                    return false;
                }
                // We receive here the filter boolean value as a string (filterValue)
                // we check if the cellValue is not null neither undefined
                if (cellValue != null) {
                    return filterValue === cellValue.toString();
                }

                // we return true if the filter chosen is undefinedValue
                return filterValue === BooleanFilterValue.UNDEFINED;
            },
        },
    ] as IFilterOptionDef[],
};

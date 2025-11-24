/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import type { MuiStyles } from '@gridsuite/commons-ui';
import { NA_Value } from '@gridsuite/commons-ui';
import { IntlShape } from 'react-intl';
import { FilterConfig, SortConfig } from 'types/custom-aggrid-types';

export const PERMANENT_LIMIT_NAME = 'permanent';

export const translateLimitNameBackToFront = (limitName: string | null | undefined, intl: IntlShape) => {
    switch (limitName) {
        case PERMANENT_LIMIT_NAME:
            return intl.formatMessage({ id: 'PermanentLimitName' });
        case NA_Value:
            return intl.formatMessage({ id: 'Undefined' });
        default:
            return limitName;
    }
};

export const translateLimitNameFrontToBack = (limitName: string, intl: IntlShape) => {
    switch (limitName) {
        case intl.formatMessage({ id: 'PermanentLimitName' }):
            return PERMANENT_LIMIT_NAME;
        case intl.formatMessage({ id: 'Undefined' }).toUpperCase(): // we need to upper if we want to match because we only store capslock values
            return NA_Value;
        default:
            return limitName;
    }
};

export enum FilterType {
    VOLTAGE_LEVEL = 'voltageLevel',
    COUNTRY = 'country',
    GENERIC_FILTER = 'genericFilter', // generic filters which uses the filter library
    SUBSTATION_PROPERTY = 'substationProperty',
}

export interface Selector {
    page: number;
    size: number;
    filter: FilterConfig[] | null;
    sort: SortConfig[];
}

export const resultsStyles = {
    sldLink: {
        color: 'node.background',
        maxWidth: '100%',
    },
} as const satisfies MuiStyles;

export type Pageable = {
    offset?: number;
    pageNumber?: number;
    pageSize?: number;
    paged?: boolean;
    sort?: Sort;
    unpaged?: boolean;
};

export type Sort = {
    empty?: boolean;
    sorted?: boolean;
    unsorted?: boolean;
};

export interface Page<ResultType> {
    content?: ResultType[];
    pageable?: Pageable;
    last?: boolean;
    totalPages?: number;
    totalElements?: number;
    first?: boolean;
    size?: number;
    number?: number;
    sort?: Sort;
    numberOfElements?: number;
    empty?: boolean;
}

/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useState } from 'react';

/**
 * This is the config of a single sort.
 * A complete sort config may use several simple ColumnSortConfig (successively applied)
 */
export type ColumnSortConfig = {
    colKey: string;
    sortWay: number;
    secondary?: boolean; // if true, this sort config is always applied after the regular (primary) sorts
};

/**
 * May contain several sorts, especially a primary and a secondary
 * it should always contain at least one sort by default
 */
export type SortConfigType = ColumnSortConfig[];

export function getPrimarySort(multipleSort: SortConfigType): ColumnSortConfig {
    for (const sort of multipleSort) {
        if (!sort.secondary) {
            return sort;
        }
    }
    // should not happen => there should always be at least one primary sort active
    return multipleSort[0];
}

export function getSecondarySort(
    multipleSort: SortConfigType
): ColumnSortConfig | undefined {
    for (const sort of multipleSort) {
        if (sort.secondary) {
            return sort;
        }
    }
    return undefined;
}

export type SortPropsType = {
    onSortChanged: (
        colKey: string,
        sortWay: number,
        secondary: boolean
    ) => void;
    sortConfig: SortConfigType;
    initSort?: (colKey: string) => void;
};

export const SORT_WAYS = {
    asc: 1,
    desc: -1,
};

export const getSortValue = (sortWay: number) => {
    if (sortWay > 0) {
        return 'asc';
    } else {
        return 'desc';
    }
};

export const useAgGridSort = (
    initSortConfig: ColumnSortConfig
): SortPropsType => {
    const { sortWay: initSortWay } = initSortConfig;

    const [sortConfig, setSortConfig] = useState<SortConfigType>([
        initSortConfig,
    ]);

    const onSortChanged = useCallback(
        (colKey: string, sortWay: number, secondary: boolean) => {
            setSortConfig(
                sortConfig
                    .map((sort) =>
                        sort.secondary === undefined
                            ? {
                                  colKey: sort.colKey,
                                  sortWay: sort.sortWay,
                                  secondary: false,
                              }
                            : sort
                    )
                    .filter((sort) => sort.secondary !== secondary)
                    .concat({ colKey, sortWay, secondary })
            );
        },
        [sortConfig]
    );

    const initSort = useCallback(
        (colKey: string) =>
            setSortConfig([
                {
                    colKey: colKey,
                    sortWay: initSortWay,
                    secondary: false,
                },
            ]),
        [initSortWay]
    );

    return { onSortChanged, sortConfig, initSort };
};

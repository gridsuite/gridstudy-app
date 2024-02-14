/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useState } from 'react';

export type SortConfigType = {
    colKey: string;
    sortWay: number;
    secColKey: string;
    secSortWay: number;
};

export type SortPropsType = {
    onSortChanged: (
        colKey: string,
        sortWay: number,
        secColKey: string,
        secSortWay: number
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
    initSortConfig: SortConfigType
): SortPropsType => {
    const {
        colKey: initColKey,
        sortWay: initSortWay,
        secColKey: initSecColKey,
        secSortWay: initSecSortWay,
    } = initSortConfig;

    const [sortConfig, setSortConfig] = useState<SortConfigType>({
        colKey: initColKey,
        sortWay: initSortWay,
        secColKey: initSecColKey,
        secSortWay: initSecSortWay,
    });

    const onSortChanged = useCallback(
        (
            colKey: string,
            sortWay: number,
            secColKey: string,
            secSortWay: number
        ) =>
            setSortConfig({
                colKey: colKey,
                sortWay: sortWay,
                secColKey: secColKey,
                secSortWay: secSortWay,
            }),
        []
    );

    const initSort = useCallback(
        (colKey: string) =>
            setSortConfig({
                colKey: colKey,
                sortWay: initSortWay,
                secColKey: colKey,
                secSortWay: initSortWay,
            }),
        [initSortWay]
    );

    return { onSortChanged, sortConfig, initSort };
};

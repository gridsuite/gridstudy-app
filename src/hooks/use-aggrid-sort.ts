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
};

export type SortPropsType = {
    onSortChanged: (colKey: string, sortWay: number) => void;
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
    const { colKey: initColKey, sortWay: initSortWay } = initSortConfig;

    const [sortConfig, setSortConfig] = useState<SortConfigType>({
        colKey: initColKey,
        sortWay: initSortWay,
    });

    const onSortChanged = useCallback(
        (colKey: string, sortWay: number) => setSortConfig({ colKey, sortWay }),
        []
    );

    const initSort = useCallback(
        (colKey: string) => setSortConfig({ colKey, sortWay: initSortWay }),
        [initSortWay]
    );

    return { onSortChanged, sortConfig, initSort };
};

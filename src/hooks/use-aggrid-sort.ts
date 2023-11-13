/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useState } from 'react';
import { SortConfigType } from '../components/custom-aggrid/custom-aggrid-header.type';

export const SORT_WAYS = {
    asc: 1,
    desc: -1,
};

export const getSortValue = (sortWay: number | null) => {
    if (sortWay === 1) {
        return 'asc';
    } else if (sortWay === -1) {
        return 'desc';
    } else {
        return undefined;
    }
};

export const useAgGridSort = (initSortConfig: SortConfigType[] = []) => {
    const [sortConfig, setSortConfig] =
        useState<SortConfigType[]>(initSortConfig);

    const onSortChanged = useCallback(setSortConfig, [setSortConfig]);

    const resetSortConfig = useCallback(() => {
        setSortConfig([]);
    }, []);

    return { onSortChanged, sortConfig, resetSortConfig };
};

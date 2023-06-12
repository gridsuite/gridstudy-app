/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useState } from 'react';

export const SORT_WAYS = {
    asc: 1,
    desc: -1,
};

const getSortSelector = (colKey, sortWay) =>
    colKey && sortWay
        ? { sortKeysWithWeightAndDirection: { [colKey]: sortWay } }
        : {};

export const useAgGridSort = (dataKeyToSortKey, initSortConfig) => {
    const { colKey, sortWay } = initSortConfig || {};

    const [sortSelector, setSortSelector] = useState(
        getSortSelector(colKey, sortWay)
    );

    const onSortChanged = useCallback(
        (event) => {
            const { columnApi } = event || {};

            const changedColumn = columnApi
                ?.getColumns()
                ?.find((column) => !!column?.getSort());

            const changedSortKey = dataKeyToSortKey[changedColumn?.getId()];
            const changedSortDirection = SORT_WAYS[changedColumn?.getSort()];

            setSortSelector(
                getSortSelector(changedSortKey, changedSortDirection)
            );
        },
        [dataKeyToSortKey]
    );

    return { onSortChanged, sortSelector };
};

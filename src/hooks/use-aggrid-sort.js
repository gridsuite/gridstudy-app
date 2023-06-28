/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useState } from 'react';

const SORT_WAYS = {
    asc: 1,
    desc: -1,
};

const getSortSelector = (dataKeyToSortKey, key, way) =>
    key && way
        ? {
              sortKeysWithWeightAndDirection: {
                  [dataKeyToSortKey[key]]: SORT_WAYS[way],
              },
          }
        : {};

export const useAgGridSort = (dataKeyToSortKey, initSortConfig) => {
    const { colKey, sortWay } = initSortConfig || {};

    const [sortConfig, setSortConfig] = useState({
        selector: getSortSelector(dataKeyToSortKey, colKey, sortWay),
        colKey,
        sortWay,
    });

    const onSortChanged = useCallback(
        (colKey, sortWay) => {
            setSortConfig({
                selector: getSortSelector(dataKeyToSortKey, colKey, sortWay),
                colKey,
                sortWay,
            });
        },
        [dataKeyToSortKey]
    );

    return { onSortChanged, sortConfig };
};

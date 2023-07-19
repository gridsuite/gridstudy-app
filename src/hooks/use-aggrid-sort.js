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

const getKeyByValue = (object, value) => {
    return Object.keys(object).find((key) => object[key] === value);
};

const getSortConfig = (dataKeyToSortKey, colKey, sortWay) => {
    return {
        colKey: getKeyByValue(dataKeyToSortKey, colKey),
        sortWay,
    };
};

export const useAgGridSort = (dataKeyToSortKey, initSortConfig) => {
    const { colKey, sortWay } = initSortConfig || {};

    const [sortConfig, setSortConfig] = useState(
        getSortConfig(dataKeyToSortKey, colKey, sortWay)
    );

    const onSortChanged = useCallback(
        (colKey, sortWay) =>
            setSortConfig(getSortConfig(dataKeyToSortKey, colKey, sortWay)),
        [dataKeyToSortKey]
    );

    const initSort = useCallback(
        () => setSortConfig(getSortConfig(dataKeyToSortKey, colKey, sortWay)),
        [colKey, dataKeyToSortKey, sortWay]
    );

    return { onSortChanged, sortConfig, initSort };
};

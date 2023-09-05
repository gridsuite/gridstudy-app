/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useState } from 'react';

export interface ISortConfig {
    colKey: string;
    sortWay: number;
}

type DataKeyToSortKey = Record<string, string>;

export const SORT_WAYS = {
    asc: 1,
    desc: -1,
};

const getKeyByValue = (
    object: Record<string, any>,
    value: any
): string | undefined => {
    return Object.keys(object).find((key) => object[key] === value);
};

const getSortConfig = (
    dataKeyToSortKey: DataKeyToSortKey | undefined,
    colKey: string,
    sortWay: number
): ISortConfig => {
    return {
        colKey: dataKeyToSortKey
            ? getKeyByValue(dataKeyToSortKey, colKey) || colKey
            : colKey,
        sortWay,
    };
};

interface IUseAgGridSortProps {
    dataKeyToSortKey?: DataKeyToSortKey;
    initSortConfig?: ISortConfig;
}

export const useAgGridSort = ({
    dataKeyToSortKey,
    initSortConfig,
}: IUseAgGridSortProps = {}) => {
    const { colKey: initColKey, sortWay: initSortWay } = initSortConfig || {
        colKey: '',
        sortWay: SORT_WAYS.asc,
    };

    const [sortConfig, setSortConfig] = useState<ISortConfig>(
        getSortConfig(dataKeyToSortKey, initColKey, initSortWay)
    );

    const onSortChanged = useCallback(
        (colKey: string, sortWay: number) =>
            setSortConfig(getSortConfig(dataKeyToSortKey, colKey, sortWay)),
        [dataKeyToSortKey]
    );

    const initSort = useCallback(
        (colKey: string) =>
            setSortConfig(getSortConfig(dataKeyToSortKey, colKey, initSortWay)),
        [dataKeyToSortKey, initSortWay]
    );

    return { onSortChanged, sortConfig, initSort };
};

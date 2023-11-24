/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useState } from 'react';

export type SortConfigType = {
    colKey: string;
    sortWay: string | number;
};

interface IUseAgGridSortProps {
    dataKeyToSortKey?: DataKeyToSortKey;
    initSortConfig: SortConfigType;
}

export type SortPropsType = {
    onSortChanged: (colKey: string, sortWay: number) => void;
    sortConfig: SortConfigType;
    initSort?: (colKey: string) => void;
};

type DataKeyToSortKey = Record<string, string>;

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

const getKeyByValue = (
    object: Record<string, any>,
    value: any
): string | undefined => {
    return Object.keys(object).find((key) => object[key] === value);
};

const getSortConfig = (
    dataKeyToSortKey: DataKeyToSortKey | undefined,
    colKey: string,
    sortWay: number | string
): SortConfigType => {
    return {
        colKey: dataKeyToSortKey
            ? getKeyByValue(dataKeyToSortKey, colKey) || colKey
            : colKey,
        sortWay,
    };
};

export const useAgGridSort = ({
    dataKeyToSortKey,
    initSortConfig,
}: IUseAgGridSortProps): SortPropsType => {
    const { colKey: initColKey, sortWay: initSortWay } = initSortConfig;

    const [sortConfig, setSortConfig] = useState<SortConfigType>(
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

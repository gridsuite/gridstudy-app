/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { AnyAction } from 'redux';

export type SortConfigType = {
    colId: string;
    sort: SortWay;
    children?: boolean;
};

export type SortPropsType = {
    onSortChanged: (sortConfig: SortConfigType) => void;
    sortConfig: SortConfigType[];
    initSort?: (colKey: string) => void;
    children?: boolean;
};

export enum SortWay {
    ASC = 'asc',
    DESC = 'desc',
}

export const useAgGridSort = (
    initSortConfig: SortConfigType,
    sortAction?: (colId: string, sortWay: string, tab: string) => AnyAction,
    tab?: string
): SortPropsType => {
    const [sortConfig, setSortConfig] =
        useState<SortConfigType[]>(initSortConfig);
    const dispatch = useDispatch();

    const onSortChanged = useCallback(
        (newSortConfig: SortConfigType) => {
            const updatedSortConfig = sortConfig
                .filter(
                    (sort) =>
                        (sort.children ?? false) !==
                        (newSortConfig.children ?? false)
                )
                .concat(newSortConfig);

            setSortConfig(updatedSortConfig);
            sortAction && tab && dispatch(sortAction(tab, updatedSortConfig));
        },
        [dispatch, sortAction, tab, sortConfig]
    );

    const initSort = useCallback(
        (config: SortConfigType) => setSortConfig(config),
        []
    );

    return { onSortChanged, sortConfig, initSort };
};

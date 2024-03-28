/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useState } from 'react';

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
    initSortConfig: SortConfigType
): SortPropsType => {
    const [sortConfig, setSortConfig] = useState<SortConfigType[]>([
        initSortConfig,
    ]);

    const onSortChanged = useCallback((newSortConfig: SortConfigType) => {
        setSortConfig((prevSortConfig) =>
            prevSortConfig
                // for now, we can have only one parent sort and one children sort
                .filter(
                    (sort) =>
                        (sort.children ?? false) !==
                        (newSortConfig.children ?? false)
                )
                .concat(newSortConfig)
        );
    }, []);

    const initSort = useCallback(
        (colKey: string) =>
            setSortConfig([{ colId: colKey, sort: initSortConfig.sort }]),
        [initSortConfig.sort]
    );

    return { onSortChanged, sortConfig, initSort };
};

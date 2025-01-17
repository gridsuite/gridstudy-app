/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { IconButton } from '@mui/material';
import { SortWay } from '../../hooks/use-aggrid-sort';
import { ArrowDownward, ArrowUpward } from '@mui/icons-material';
import React from 'react';
import { useCustomAggridSort } from './hooks/use-custom-aggrid-sort';
import { CustomHeaderSortParams } from './custom-aggrid-header.type';

const styles = {
    iconSize: {
        fontSize: '1rem',
    },
};

interface CustomAggridSortProps {
    field: string;
    sortParams: CustomHeaderSortParams;
}

export const CustomAggridSort = ({ field, sortParams }: CustomAggridSortProps) => {
    const { columnSort, handleSortChange } = useCustomAggridSort(field, sortParams);
    const { isSortable } = sortParams;
    const handleClick = () => {
        handleSortChange();
    };
    const isColumnSorted = !!columnSort;

    return (
        isSortable &&
        isColumnSorted && (
            <IconButton onClick={handleClick}>
                {columnSort.sort === SortWay.ASC ? (
                    <ArrowUpward sx={styles.iconSize} />
                ) : (
                    <ArrowDownward sx={styles.iconSize} />
                )}
            </IconButton>
        )
    );
};

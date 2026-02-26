/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { MouseEventHandler } from 'react';
import { Badge, Grid, IconButton } from '@mui/material';
import { FilterAlt } from '@mui/icons-material';
import { type MuiStyles } from '@gridsuite/commons-ui';
import { isNonEmptyStringOrArray } from '../../../utils/types-utils';
import { FILTER_TEXT_COMPARATORS } from './custom-aggrid-filter.type';

const styles = {
    iconSize: { fontSize: '1rem' },
    gridRoot: { overflow: 'visible' },
} as const satisfies MuiStyles;

interface CustomFilterIconProps {
    handleShowFilter: MouseEventHandler<HTMLButtonElement> | undefined;
    selectedFilterData: unknown;
    selectedFilterComparator?: string;
}

export const CustomFilterIcon = ({
    handleShowFilter,
    selectedFilterData,
    selectedFilterComparator,
}: CustomFilterIconProps) => {
    // a filter is active if it has data or if it's using IS_EMPTY or IS_NOT_EMPTY comparators
    const isFilterActive =
        selectedFilterData !== undefined &&
        selectedFilterData !== null &&
        (isNonEmptyStringOrArray(selectedFilterData) ||
            selectedFilterComparator === FILTER_TEXT_COMPARATORS.IS_EMPTY ||
            selectedFilterComparator === FILTER_TEXT_COMPARATORS.IS_NOT_EMPTY);

    return (
        <Grid item sx={styles.gridRoot}>
            <Grid item>
                <IconButton size={'small'} onClick={handleShowFilter}>
                    <Badge color="secondary" variant={isFilterActive ? 'dot' : undefined} invisible={!isFilterActive}>
                        <FilterAlt sx={styles.iconSize} />
                    </Badge>
                </IconButton>
            </Grid>
        </Grid>
    );
};

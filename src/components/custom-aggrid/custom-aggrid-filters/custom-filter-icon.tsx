/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { MouseEventHandler } from 'react';
import { Badge, Grid, IconButton } from '@mui/material';
import { FilterAlt } from '@mui/icons-material';
import { isNonEmptyStringOrArray } from '../../../utils/types-utils';

const styles = {
    iconSize: {
        fontSize: '1rem',
    },
};

interface CustomFilterIconProps {
    handleShowFilter: MouseEventHandler<HTMLButtonElement> | undefined;
    selectedFilterData: unknown;
}

export const CustomFilterIcon = ({ handleShowFilter, selectedFilterData }: CustomFilterIconProps) => (
    <Grid
        item
        sx={{
            overflow: 'visible',
        }}
    >
        <Grid item>
            <IconButton size={'small'} onClick={handleShowFilter}>
                <Badge
                    color="secondary"
                    variant={isNonEmptyStringOrArray(selectedFilterData) ? 'dot' : undefined}
                    invisible={!selectedFilterData}
                >
                    <FilterAlt sx={styles.iconSize} />
                </Badge>
            </IconButton>
        </Grid>
    </Grid>
);

/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { PropsWithChildren } from 'react';
import { Grid } from '@mui/material';

interface GridItemProps extends PropsWithChildren {
    size?: number;
    alignItem?: string;
}

export function GridItem({ children, size = 6, alignItem = 'flex-start' }: Readonly<GridItemProps>) {
    return (
        <Grid item xs={size} alignItems={alignItem}>
            {children}
        </Grid>
    );
}

/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { type ReactNode } from 'react';
import { type Breakpoint, Grid, type GridProps, type GridSize, Tooltip } from '@mui/material';

export type GridItemProps = Omit<GridProps, 'item' | 'container' | Breakpoint> & {
    size?: GridSize;
    tooltip?: ReactNode;
};

export default function GridItem({ children, size = 6, tooltip, ...otherProps }: Readonly<GridItemProps>) {
    return (
        <Grid item xs={size} {...otherProps}>
            {children &&
                (tooltip ? (
                    <Tooltip title={tooltip}>
                        <>{children}</>
                    </Tooltip>
                ) : (
                    children
                ))}
        </Grid>
    );
}

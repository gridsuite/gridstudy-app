/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { PropsWithChildren, ReactNode } from 'react';
import { Grid, GridSize, Tooltip } from '@mui/material';

export interface GridItemProps extends PropsWithChildren {
    size?: GridSize;
    alignItem?: string;
    tooltip?: ReactNode;
}

export default function GridItem({ children, size = 6, alignItem = 'flex-start', tooltip }: Readonly<GridItemProps>) {
    return (
        <Grid item xs={size} alignItems={alignItem}>
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

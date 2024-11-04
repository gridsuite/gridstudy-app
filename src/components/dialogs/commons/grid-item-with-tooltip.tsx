/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { PropsWithChildren, ReactElement } from 'react';
import { Grid, Tooltip } from '@mui/material';

interface GridItemWithTooltipProps extends PropsWithChildren {
    tooltip?: string;
    size?: number;
    alignItem?: string;
}

export function GridItemWithTooltip({
    children,
    tooltip = '',
    size = 6,
    alignItem = 'flex-start',
}: Readonly<GridItemWithTooltipProps>) {
    return (
        <Grid item xs={size} alignItems={alignItem}>
            {children ? <Tooltip title={tooltip}>{children as ReactElement}</Tooltip> : null}{' '}
        </Grid>
    );
}

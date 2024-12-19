/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { Divider, Grid, type GridProps } from '@mui/material';

export default function LineSeparator({ xs = 12, ...props }: Readonly<Omit<GridProps, 'item' | 'container'>>) {
    return (
        <Grid item xs={xs} {...props}>
            <Divider />
        </Grid>
    );
}

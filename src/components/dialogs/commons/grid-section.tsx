/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { Box, Grid, SxProps, Theme } from '@mui/material';
import { FormattedMessage } from 'react-intl';

export interface GridSectionProps {
    title: string;
    heading?: 1 | 2 | 3 | 4 | 5 | 6;
    size?: number;
    customStyle?: SxProps<Theme>;
}

export default function GridSection({ title, heading = 3, size = 12, customStyle }: Readonly<GridSectionProps>) {
    return (
        <Grid container spacing={2}>
            <Grid item xs={size}>
                <Box sx={customStyle} component={`h${heading}`}>
                    <FormattedMessage id={title} />
                </Box>
            </Grid>
        </Grid>
    );
}

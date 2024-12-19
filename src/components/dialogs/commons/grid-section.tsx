/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { Box, Grid, type GridSize, type SxProps, type Theme, Typography } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { mergeSx } from '@gridsuite/commons-ui';

const styles = {
    base: {
        marginTop: 1,
        marginBottom: 1,
    },
    header: { margin: 0 },
} as const satisfies SxProps<Theme>;

export interface GridSectionProps {
    title: string;
    heading?: 1 | 2 | 3 | 4 | 5 | 6;
    size?: GridSize;
    customStyle?: SxProps<Theme>;
}

export default function GridSection({ title, heading = 3, size = 12, customStyle }: Readonly<GridSectionProps>) {
    return (
        <Grid item spacing={2} xs={size} sx={customStyle ? mergeSx(styles.base, customStyle) : styles.base}>
            <Box component={`h${heading}`} sx={styles.header}>
                <FormattedMessage id={title} />
            </Box>
        </Grid>
    );
}

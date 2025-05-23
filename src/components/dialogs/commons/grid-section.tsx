/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { Box, Grid, SxProps, Theme, Tooltip } from '@mui/material';
import { FormattedMessage, useIntl } from 'react-intl';
import { InfoOutlined } from '@mui/icons-material';

export interface GridSectionProps {
    title: string;
    heading?: 1 | 2 | 3 | 4 | 5 | 6;
    size?: number;
    customStyle?: SxProps<Theme>;
    tooltipEnabled?: boolean,
    tooltipMessage?: string;
}

export default function GridSection({
    title,
    heading = 3,
    size = 12,
    customStyle,
    tooltipEnabled = false,
    tooltipMessage,
}: Readonly<GridSectionProps>) {
    const intl = useIntl();
    return (
        <Grid container spacing={2}>
            <Grid item xs={size}>
                <Box sx={customStyle} component={`h${heading}`}>
                    <FormattedMessage id={title} />
                    {tooltipEnabled && (
                        <Tooltip sx={{ paddingLeft: 1 }} title={intl.formatMessage({ id: tooltipMessage })}>
                            <InfoOutlined color="info" fontSize="medium" />
                        </Tooltip>
                    )}
                </Box>
            </Grid>
        </Grid>
    );
}

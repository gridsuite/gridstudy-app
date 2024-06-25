/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Box, Theme, Typography, TypographyProps } from '@mui/material';

const styles = {
    panel: (theme: Theme) => ({
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(1),
    }),
};

interface TabPanelProps<T> extends TypographyProps {
    index: T;
    value: T;
    keepState: boolean;
}

export const TabPanel = <T,>(props: TabPanelProps<T>) => {
    const { children, value, index, keepState, ...other } = props;
    return (
        <Typography
            component="div"
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            style={{ flexGrow: 1 }}
            {...other}
        >
            {(value === index || keepState) && (
                <Box sx={styles.panel}>{children}</Box>
            )}
        </Typography>
    );
};

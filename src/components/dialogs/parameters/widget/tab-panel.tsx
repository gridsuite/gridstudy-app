/*
 * Copyright © 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Box, type SxProps, type Theme, Typography, TypographyProps } from '@mui/material';
import { CSSProperties, PropsWithChildren } from 'react';

const styles = {
    panel: (theme) => ({
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(1),
    }),
} as const satisfies Record<string, SxProps<Theme>>;

const rawStyles = {
    typo: { flexGrow: 1 },
} as const satisfies Record<string, CSSProperties>;

export type TabPanelProps<TValue> = Omit<
    TypographyProps<'div'>,
    'component' | 'role' | 'hidden' | 'id' | 'aria-labelledby' | 'style'
> &
    PropsWithChildren<{
        value: TValue;
        index: TValue;
        keepState?: boolean;
    }>;

export default function TabPanel<TValue>({
    children,
    value,
    index,
    keepState,
    ...other
}: Readonly<TabPanelProps<TValue>>) {
    return (
        <Typography
            component="div"
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            style={rawStyles.typo}
            {...other}
        >
            {(value === index || keepState) && <Box sx={styles.panel}>{children}</Box>}
        </Typography>
    );
}

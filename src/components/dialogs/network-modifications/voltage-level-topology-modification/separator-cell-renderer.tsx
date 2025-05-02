/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { Theme, Typography } from '@mui/material';
import React from 'react';

const styles = {
    separator: (theme: Theme) => ({
        color: theme.palette.text.primary,
        fontWeight: 'bold',
        fontSize: '1rem',
        width: '100%',
        marginTop: '2%',
    }),
};

interface SeparatorCellRendererProps {
    value: string;
}

export function SeparatorCellRenderer({ value }: Readonly<SeparatorCellRendererProps>) {
    return (
        <Typography variant="subtitle1" sx={styles.separator}>
            {value}
        </Typography>
    );
}

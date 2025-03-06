/*
 * Copyright © 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { SxProps, Theme } from '@mui/material';

/**
 * Shared styles for dialog components
 */
export const dialogStyles = {
    dialogContent: {
        width: '20%',
        height: '30%',
        maxWidth: 'none',
        margin: 'auto',
    },
    actionButtons: {
        display: 'flex',
        gap: 2,
        justifyContent: 'end',
    },
} as const satisfies Record<string, SxProps<Theme>>;

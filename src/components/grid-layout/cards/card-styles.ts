/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { type MuiStyles } from '@gridsuite/commons-ui';

export const cardStyles = {
    card: {
        display: 'flex',
        flexDirection: 'column',
        '& .react-resizable-handle, .card-header-close-button': {
            visibility: 'hidden',
        },
        '&:hover': {
            '& .react-resizable-handle, .card-header-close-button': {
                visibility: 'visible',
            },
        },
    },
    diagramContainer: (theme) => ({
        flexGrow: 1,
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: theme.palette.mode === 'light' ? theme.palette.background.paper : '#292e33',
        borderRadius: '0 0 ' + theme.spacing(2) + ' ' + theme.spacing(2),
        border:
            theme.palette.mode === 'light'
                ? `1px solid ${theme.palette.grey[500]}`
                : `1px solid ${theme.palette.grey[800]}`,
        borderTop: 'none', // remove the top border to avoid double border with CustomCardHeader
    }),
} as const satisfies MuiStyles;

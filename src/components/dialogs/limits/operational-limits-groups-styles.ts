/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { MuiStyles } from '@gridsuite/commons-ui';
import { stylesLayout } from '../../utils/tab-utils';
import { blue } from '@mui/material/colors';

export const limitsStyles = {
    tabs: () => ({
        ...stylesLayout.listDisplay,
        minHeight: '100%',
        height: '100%',
        maxHeight: '100%',
        borderRight: 1,
        borderColor: 'divider',
        transition: 'transform 0.3s ease-in-out',
        '& .MuiTabs-indicator': {
            borderRight: `3px solid ${blue[700]}`,
        },
        '.MuiTab-root.MuiButtonBase-root': {
            textTransform: 'none',
            textAlign: 'left',
            alignItems: 'stretch',
            p: 0,
        },
    }),
    tabBackground: {
        '&:hover': {
            backgroundColor: 'rgba(25, 118, 210, 0.05)', // blue[700]
        },
        maxWidth: 600,
        width: '100%',
        p: 1,
        minHeight: 60,
    },
    copyLimitsToRightBackground: {
        height: 200,
        display: 'flex',
    },
    copyLimitsToLeftBackground: {
        height: '50%',
    },
    copyLimitsButtons: {
        alignSelf: 'flex-end',
        minWidth: '0px',
        height: 'auto',
        padding: '1',
    },
} as const satisfies MuiStyles;

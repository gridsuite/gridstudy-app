/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { type SxStyle } from '@gridsuite/commons-ui';
import { Theme } from '@mui/material';

export const buildStatusChipStyles = {
    base: (theme: Theme) =>
        ({
            padding: theme.spacing(1, 0.5),
            fontSize: '12px',
            fontWeight: 400,
            lineHeight: '100%',
        }) as const,

    notBuilt: {
        background: (theme: Theme) => theme.node.buildStatus.notBuilt,
        color: (theme: Theme) => theme.palette.getContrastText(theme.node.buildStatus.notBuilt),
    } as SxStyle,
} as const;

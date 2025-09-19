/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { type MuiStyles } from '@gridsuite/commons-ui';

export const reportStyles = {
    mainContainer: (theme) => {
        return {
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            gap: theme.spacing(1),
            p: theme.spacing(1),
        };
    },
} as const satisfies MuiStyles;

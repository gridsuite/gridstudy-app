/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { Theme } from '@mui/material';

export const reportStyles = {
    mainContainer: (theme: Theme) => {
        return {
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            gap: theme.spacing(1),
            p: theme.spacing(1),
        };
    },
};

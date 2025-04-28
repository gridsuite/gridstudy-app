/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import ResetSettings from '@material-symbols/svg-400/outlined/reset_settings.svg?react';
import { useTheme } from '@mui/material';

export function ResetSettingsIcon() {
    const theme = useTheme();

    return (
        <ResetSettings
            style={{
                width: 24,
                height: 24,
                fill: theme.palette.text.primary,
            }}
        />
    );
}

/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { Theme } from '@mui/material';

export const getPanelBorder = (theme: Theme, isFocused: boolean, maximized: boolean, isEditing: boolean) => {
    if (isEditing) {
        return isFocused ? `2px solid ${theme.palette.primary.main}` : `1px solid ${theme.palette.primary.main}`;
    }
    if (theme.palette.mode === 'light') {
        return `1px solid ${theme.palette.grey[500]}`;
    }
    if (isFocused && !maximized) {
        return `1px solid ${theme.palette.grey[100]}`;
    }
    return `1px solid ${theme.palette.grey[800]}`;
};

/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { type MuiStyles } from '@gridsuite/commons-ui';

export const styles = {
    autocomplete: (theme) => ({
        '.MuiAutocomplete-inputRoot': {
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'flex-start',
            flexWrap: 'nowrap',
            padding: '1px',
            paddingLeft: '5px',
        },
        '.MuiAutocomplete-tag': {
            maxWidth: '100px',
        },
        '.Mui-expanded, .Mui-focused, .Mui-focusVisible': {
            width: 'inherit',
            background: theme.palette.tabBackground,
            flexWrap: 'wrap',
        },
    }),
} as const satisfies MuiStyles;

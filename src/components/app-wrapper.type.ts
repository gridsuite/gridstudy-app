/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Theme } from '@mui/material/styles';

// used to customize mui theme
// https://mui.com/material-ui/customization/theming/#typescript
declare module '@mui/material/styles' {
    interface Theme {
        aggrid: string;
        selectedRow: {
            background: string;
        };
        link: {
            color: string;
        };
        overlay: {
            background: string;
        };
    }

    interface ThemeOptions {
        aggrid: string;
        selectedRow: {
            background: string;
        };
        link: {
            color: string;
        };
        overlay: {
            background: string;
        };
    }
}

declare module 'ag-grid-community' {
    // used to add properties that are not supported by ColDef such as numeric, fractionDigits...
    interface ColDef {
        numeric?: boolean;
        fractionDigits?: number;
    }
}

/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { DefaultTheme } from '@mui/styles';
import { Theme } from '@mui/material/styles';

// used to accept properties from muiV4 like spacing, palette...
// https://mui.com/material-ui/migration/troubleshooting/#types-property-quot-palette-quot-quot-spacing-quot-does-not-exist-on-type-defaulttheme
declare module '@mui/styles/defaultTheme' {
    interface DefaultTheme extends Theme {}
}

export interface GridStudyTheme extends DefaultTheme {
    aggrid: string;
    selectedRow: {
        background: string;
    };
}

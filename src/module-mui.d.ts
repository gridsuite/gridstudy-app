/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Theme as MuiTheme, ThemeOptions as MuiThemeOptions } from '@mui/material/styles/createTheme';

// used to customize mui theme
// https://mui.com/material-ui/customization/theming/#typescript
declare module '@mui/material/styles' {
    export * from '@mui/material/styles';
    interface PaletteExtension {
        cancelButtonColor: { main: string };
        tabBackground: string;
    }
    export interface Palette extends MuiPalette, Required<PaletteExtension> {}
    export interface PaletteOptions extends MuiPaletteOptions, Partial<PaletteExtension> {}

    interface ThemeExtension {
        aggrid: string;
        aggridValueChangeHighlightBackgroundColor: string;
        selectedRow: {
            background: string;
        };
        link: {
            color: string;
        };
        overlay: {
            background: string;
        };
        palette: {
            tabBackground: string;
        };
        node: {
            background: string;
            hover: string;
            border: string;
        };
        searchedText: {
            highlightColor: string;
            currentHighlightColor: string;
        };
        severityChip: {
            disabledColor: string;
        };
    }
    export interface Theme extends MuiTheme, Required<ThemeExtension> {}

    // allow configuration using `createTheme`
    export interface ThemeOptions extends MuiThemeOptions, Partial<ThemeExtension> {}
}

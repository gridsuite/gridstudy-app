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
        toolbarBackground: string;
    }
    export interface Palette extends MuiPalette, Required<PaletteExtension> {}
    export interface PaletteOptions extends MuiPaletteOptions, Partial<PaletteExtension> {}

    interface ThemeExtension {
        aggrid: {
            theme: string;
            overlay: {
                background: string;
            };
        };
        networkModificationPanel: {
            backgroundColor: string;
            border: string;
        };
        reactflow: {
            backgroundColor: string;
            labeledGroup: {
                backgroundColor: string;
                borderColor: string;
            };
            edge: {
                stroke: string;
            };
            handle: {
                border: string;
                background: string;
            };
        };
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
            common: {
                background: string;
                activeBackground: string;
            };
            modification: {
                border: string;
                selectedBorder: string;
                hoverBorderColor: string;
                activeBorderColor: string;
                selectedBackground: string;
            };
            root: {
                border: string;
                selectedBackground: string;
                hoverBorderColor: string;
                activeBorderColor: string;
                icon: {
                    fill: string;
                    background: string;
                };
            };
            buildStatus: {
                error: string;
                warning: string;
                success: string;
                notBuilt: string;
            };
        };
        searchedText: {
            highlightColor: string;
            currentHighlightColor: string;
        };
        severityChip: {
            disabledColor: string;
        };
        formFiller: {
            background: string;
        };
    }
    export interface Theme extends MuiTheme, Required<ThemeExtension> {}

    // allow configuration using `createTheme`
    export interface ThemeOptions extends MuiThemeOptions, Partial<ThemeExtension> {}
}

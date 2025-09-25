/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import type { Property } from 'csstype';
import type { PaletteColor, SimplePaletteColorOptions } from '@mui/material';

// Just to be sure that commons-ui's mui augmentation is seen by tsc
import type {} from '@gridsuite/commons-ui';

// https://mui.com/x/react-charts/quickstart/#typescript
import type {} from '@mui/x-charts/themeAugmentation';

// used to customize mui theme
declare module '@mui/material/styles' {
    // https://mui.com/material-ui/customization/palette/#typescript
    interface PaletteExtension {
        tabBackground: Property.Background;
        toolbarBackgroundColor: Property.BackgroundColor;
    }

    interface Palette extends PaletteExtension {
        cancelButtonColor: PaletteColor;
    }

    interface PaletteOptions extends PaletteExtension {
        // note: options aren't optional because there aren't default values in code
        cancelButtonColor: SimplePaletteColorOptions;
    }

    // https://mui.com/material-ui/customization/theming/#typescript
    interface ThemeExtension {
        networkModificationPanel: {
            backgroundColor: Property.BackgroundColor;
            border: Property.Border;
        };
        reactflow: {
            backgroundColor: Property.BackgroundColor;
            labeledGroup: {
                backgroundColor: Property.BackgroundColor;
                borderColor: Property.BorderColor;
            };
            edge: {
                stroke: Property.Stroke;
            };
            handle: {
                border: Property.Border;
                background: Property.Background;
            };
        };
        selectedRow: {
            backgroundColor: Property.BackgroundColor;
        };
        // palette -> Palette & PaletteOptions
        node: {
            common: {
                background: Property.BackgroundColor;
                activeBackground: Property.Background;
            };
            modification: {
                border: Property.Border;
                selectedBorder: Property.Border;
                hoverBorderColor: Property.BorderColor;
                activeBorderColor: Property.BorderColor;
                selectedBackground: Property.Background;
            };
            root: {
                border: Property.Border;
                selectedBackground: Property.Background;
                hoverBorderColor: Property.BorderColor;
                activeBorderColor: Property.BorderColor;
                icon: {
                    fill: Property.Fill;
                    background: Property.Background;
                };
            };
            buildStatus: {
                error: Property.BackgroundColor;
                warning: Property.BackgroundColor;
                success: Property.BackgroundColor;
                notBuilt: Property.BackgroundColor;
            };
        };
        searchedText: {
            highlightColor: Property.Color;
            currentHighlightColor: Property.Color;
        };
        severityChip: {
            disabledColor: Property.BackgroundColor;
        };
        formFiller: {
            backgroundColor: Property.BackgroundColor;
        };
        tooltipTable: {
            backgroundColor: Property.BackgroundColor;
        };
    }

    export interface Theme extends ThemeExtension {}

    // allow configuration using `createTheme`
    export interface ThemeOptions extends ThemeExtension {
        // note: options aren't optional because there aren't default values in code
    }
}

declare module '@mui/material/Button' {
    interface ButtonPropsColorOverrides {
        cancelButtonColor: true;
    }
}

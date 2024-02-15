/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import App from './app';
import React from 'react';
import {
    createTheme,
    ThemeProvider,
    StyledEngineProvider,
} from '@mui/material/styles';
import {
    LIGHT_THEME,
    CardErrorBoundary,
    login_en,
    login_fr,
    report_viewer_en,
    report_viewer_fr,
    SnackbarProvider,
    top_bar_en,
    top_bar_fr,
    table_en,
    table_fr,
    element_search_fr,
    element_search_en,
    equipment_search_fr,
    equipment_search_en,
    treeview_finder_fr,
    treeview_finder_en,
    card_error_boundary_en,
    card_error_boundary_fr,
    flat_parameters_en,
    flat_parameters_fr,
    multiple_selection_dialog_en,
    multiple_selection_dialog_fr,
    common_button_en,
    common_button_fr,
} from '@gridsuite/commons-ui';
import { IntlProvider } from 'react-intl';
import { BrowserRouter } from 'react-router-dom';
import { Provider, useSelector } from 'react-redux';
import messages_en from '../translations/en.json';
import messages_fr from '../translations/fr.json';
import network_modifications_locale_en from '../translations/dynamic/network-modifications-locale-en';
import network_modifications_locale_fr from '../translations/dynamic/network-modifications-locale-fr';
import exportParameters_en from '../translations/external/export-parameters-en.json';
import exportParameters_fr from '../translations/external/export-parameters-fr.json';
import messages_plugins from '../plugins/translations';
import aggrid_locale_en from '../translations/external/aggrid-locale-en';
import aggrid_locale_fr from '../translations/external/aggrid-locale-fr';
import backend_locale_en from '../translations/external/backend-locale-en';
import backend_locale_fr from '../translations/external/backend-locale-fr';
import dynamic_mapping_models_en from '../translations/external/dynamic-mapping-models-en';
import dynamic_mapping_models_fr from '../translations/external/dynamic-mapping-models-fr';
import csv_locale_en from '../translations/dynamic/csv-locale-en';
import csv_locale_fr from '../translations/dynamic/csv-locale-fr';
import filter_locale_en from '../translations/dynamic/filter-locale-en';
import filter_locale_fr from '../translations/dynamic/filter-locale-fr';
import menu_locale_en from '../translations/dynamic/menu-locale-en';
import menu_locale_fr from '../translations/dynamic/menu-locale-fr';
import table_locale_en from '../translations/dynamic/table-locale-en';
import table_locale_fr from '../translations/dynamic/table-locale-fr';
import errors_locale_en from '../translations/dynamic/errors-locale-en';
import errors_locale_fr from '../translations/dynamic/errors-locale-fr';
import { store } from '../redux/store';
import CssBaseline from '@mui/material/CssBaseline';
import {
    PARAM_THEME,
    basemap_style_theme_key,
    MAP_BASEMAP_MAPBOX,
    MAP_BASEMAP_CARTO,
    MAP_BASEMAP_CARTO_NOLABEL,
} from '../utils/config-params';

let lightTheme = createTheme({
    components: {
        MuiTab: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                },
            },
        },
    },
    palette: {
        mode: 'light',
    },
    link: {
        color: 'blue',
    },
    node: {
        background: '#1976d2',
        hover: '#84adce',
        border: '#0f3d68',
    },
    selectedRow: {
        background: '#8E9C9B',
    },
    editableCell: {
        outline: 'solid 1px #1976D2',
        border: 'solid 1px #BABFC7',
        borderRadius: '3px',
        boxShadow: '0 1px 20px 1px #BABFC766',
    },
    editableCellError: {
        outline: 'solid 1px red',
        border: 'solid 1px #BABFC7',
        borderRadius: '3px',
        boxShadow: '0 1px 20px 1px #BABFC766',
    },
    aggridValueChangeHighlightBackgroundColor: '#C8E6C9 !important',
    tooltipTable: {
        background: '#e6e6e6',
    },
    formFiller: {
        background: '#e6e6e6',
    },
    [basemap_style_theme_key(MAP_BASEMAP_MAPBOX)]:
        'mapbox://styles/mapbox/light-v9',
    [basemap_style_theme_key(MAP_BASEMAP_CARTO_NOLABEL)]:
        'https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json',
    [basemap_style_theme_key(MAP_BASEMAP_CARTO)]:
        'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
    aggrid: 'ag-theme-alpine',
    overlay: {
        background: '#e6e6e6',
    },
});

lightTheme = createTheme(lightTheme, {
    palette: {
        cancelButtonColor: {
            main: lightTheme.palette.text.secondary,
        },
    },
    components: {
        CancelButton: {
            defaultProps: {
                color: 'cancelButtonColor',
            },
        },
    },
});

let darkTheme = createTheme({
    components: {
        MuiTab: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                },
            },
        },
    },
    palette: {
        mode: 'dark',
    },
    link: {
        color: 'green',
    },
    node: {
        background: '#1976d2',
        hover: '#90caf9',
        border: '#cce3f9',
    },
    selectedRow: {
        background: '#545C5B',
    },
    editableCell: {
        outline: 'solid 1px #90CAF9',
        border: 'solid 1px #68686E',
        borderRadius: '3px',
        boxShadow: '0 1px 20px 1px #000',
    },
    editableCellError: {
        outline: 'solid 1px red',
        border: 'solid 1px #68686E',
        borderRadius: '3px',
        boxShadow: '0 1px 20px 1px #000',
    },
    tooltipTable: {
        background: '#121212',
    },
    formFiller: {
        background: '#2C2C2C',
    },
    [basemap_style_theme_key(MAP_BASEMAP_MAPBOX)]:
        'mapbox://styles/mapbox/dark-v9',
    [basemap_style_theme_key(MAP_BASEMAP_CARTO_NOLABEL)]:
        'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json',
    [basemap_style_theme_key(MAP_BASEMAP_CARTO)]:
        'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
    aggrid: 'ag-theme-alpine-dark',
    overlay: {
        background: '#121212',
    },
});

darkTheme = createTheme(darkTheme, {
    palette: {
        cancelButtonColor: {
            main: darkTheme.palette.text.secondary,
        },
    },
    components: {
        CancelButton: {
            defaultProps: {
                color: 'cancelButtonColor',
            },
        },
    },
});

const getMuiTheme = (theme) => {
    if (theme === LIGHT_THEME) {
        return lightTheme;
    } else {
        return darkTheme;
    }
};

const messages = {
    en: {
        ...treeview_finder_en,
        ...messages_en,
        ...network_modifications_locale_en,
        ...exportParameters_en,
        ...report_viewer_en,
        ...login_en,
        ...top_bar_en,
        ...table_en,
        ...element_search_en,
        ...equipment_search_en,
        ...card_error_boundary_en,
        ...flat_parameters_en,
        ...multiple_selection_dialog_en,
        ...common_button_en,
        ...aggrid_locale_en,
        ...backend_locale_en,
        ...dynamic_mapping_models_en,
        ...csv_locale_en,
        ...filter_locale_en,
        ...menu_locale_en,
        ...table_locale_en,
        ...errors_locale_en,
        ...messages_plugins.en, // keep it at the end to allow translation overwriting
    },
    fr: {
        ...treeview_finder_fr,
        ...messages_fr,
        ...network_modifications_locale_fr,
        ...exportParameters_fr,
        ...report_viewer_fr,
        ...login_fr,
        ...top_bar_fr,
        ...table_fr,
        ...element_search_fr,
        ...equipment_search_fr,
        ...card_error_boundary_fr,
        ...flat_parameters_fr,
        ...multiple_selection_dialog_fr,
        ...common_button_fr,
        ...aggrid_locale_fr,
        ...backend_locale_fr,
        ...dynamic_mapping_models_fr,
        ...csv_locale_fr,
        ...filter_locale_fr,
        ...menu_locale_fr,
        ...table_locale_fr,
        ...errors_locale_fr,
        ...messages_plugins.fr, // keep it at the end to allow translation overwriting
    },
};

const basename = new URL(document.querySelector('base').href).pathname;

const AppWrapperWithRedux = () => {
    const computedLanguage = useSelector((state) => state.computedLanguage);

    const theme = useSelector((state) => state[PARAM_THEME]);

    return (
        <IntlProvider
            locale={computedLanguage}
            messages={messages[computedLanguage]}
        >
            <BrowserRouter basename={basename}>
                <StyledEngineProvider injectFirst>
                    <ThemeProvider theme={getMuiTheme(theme)}>
                        <SnackbarProvider hideIconVariant={false}>
                            <CssBaseline />
                            <CardErrorBoundary>
                                <App />
                            </CardErrorBoundary>
                        </SnackbarProvider>
                    </ThemeProvider>
                </StyledEngineProvider>
            </BrowserRouter>
        </IntlProvider>
    );
};

const AppWrapper = () => {
    return (
        <Provider store={store}>
            <AppWrapperWithRedux />
        </Provider>
    );
};

export default AppWrapper;

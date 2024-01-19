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
import networkModification_en from '../translations/network-modifications-en.json';
import networkModification_fr from '../translations/network-modifications-fr.json';
import exportParameters_en from '../translations/export-parameters-en.json';
import exportParameters_fr from '../translations/export-parameters-fr.json';
import messages_plugins from '../plugins/translations';
import external_labels_en from '../translations/extern-en.json';
import external_labels_fr from '../translations/extern-fr.json';
import { store } from '../redux/store';
import CssBaseline from '@mui/material/CssBaseline';
import { PARAM_THEME } from '../utils/config-params';

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
    mapboxStyle: 'mapbox://styles/mapbox/light-v9',
    aggrid: 'ag-theme-alpine',
    overlay: {
        background: '#e6e6e6',
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
    mapboxStyle: 'mapbox://styles/mapbox/dark-v9',
    aggrid: 'ag-theme-alpine-dark',
    overlay: {
        background: '#121212',
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
        ...networkModification_en,
        ...external_labels_en,
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
        ...messages_plugins.en, // keep it at the end to allow translation overwriting
    },
    fr: {
        ...treeview_finder_fr,
        ...messages_fr,
        ...networkModification_fr,
        ...external_labels_fr,
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

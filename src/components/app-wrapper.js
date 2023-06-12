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
} from '@gridsuite/commons-ui';
import { IntlProvider } from 'react-intl';
import { BrowserRouter } from 'react-router-dom';
import { Provider, useSelector } from 'react-redux';
import messages_en from '../translations/en.json';
import messages_fr from '../translations/fr.json';
import networkModification_en from '../translations/network-modifications-en.json';
import networkModification_fr from '../translations/network-modifications-fr.json';
import messages_plugins_en from '../plugins/translations/en.json';
import messages_plugins_fr from '../plugins/translations/fr.json';
import { store } from '../redux/store';
import CssBaseline from '@mui/material/CssBaseline';
import { PARAM_THEME } from '../utils/config-params';

const lightTheme = createTheme({
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
    tooltipTable: {
        background: '#e6e6e6',
    },
    formFiller: {
        background: '#e6e6e6',
    },
    mapboxStyle: 'mapbox://styles/mapbox/light-v9',
    aggrid: 'ag-theme-alpine',
});

const darkTheme = createTheme({
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
    tooltipTable: {
        background: '#121212',
    },
    formFiller: {
        background: '#2C2C2C',
    },
    mapboxStyle: 'mapbox://styles/mapbox/dark-v9',
    aggrid: 'ag-theme-alpine-dark',
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
        ...report_viewer_en,
        ...login_en,
        ...top_bar_en,
        ...table_en,
        ...element_search_en,
        ...equipment_search_en,
        ...card_error_boundary_en,
        ...messages_plugins_en, // keep it at the end to allow translation overwritting
    },
    fr: {
        ...treeview_finder_fr,
        ...messages_fr,
        ...networkModification_fr,
        ...report_viewer_fr,
        ...login_fr,
        ...top_bar_fr,
        ...table_fr,
        ...element_search_fr,
        ...equipment_search_fr,
        ...card_error_boundary_fr,
        ...messages_plugins_fr, // keep it at the end to allow translation overwritting
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

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
} from '@gridsuite/commons-ui';
import { IntlProvider } from 'react-intl';
import { BrowserRouter } from 'react-router-dom';
import { Provider, useSelector } from 'react-redux';
import study_messages_en from 'translations/en.json';
import study_messages_fr from 'translations/fr.json';
import explore_messages_en from 'explore/translations/en.json';
import explore_messages_fr from 'explore/translations/fr.json';
import networkModification_en from '../translations/network-modifications-en.json';
import networkModification_fr from '../translations/network-modifications-fr.json';
import exportParameters_en from '../translations/export-parameters-en.json';
import exportParameters_fr from '../translations/export-parameters-fr.json';
import messages_plugins from '../plugins/translations';
import external_labels_en from '../translations/extern-en.json';
import external_labels_fr from '../translations/extern-fr.json';
import import_parameters_en from 'explore/translations/import-parameters-en';
import import_parameters_fr from 'explore/translations/import-parameters-fr';
import { store } from '../redux/store';
import CssBaseline from '@mui/material/CssBaseline';
import { PARAM_THEME } from '../utils/config-params';

const lightTheme = createTheme({
    palette: {
        mode: 'light',
    },
    link: {
        color: 'blue', //TODO FM black in gridexplore
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
    arrow: {
        fill: '#212121',
        stroke: '#212121',
    },
    arrow_hover: {
        fill: 'white',
        stroke: 'white',
    },
    circle: {
        stroke: 'white',
        fill: 'white',
    },
    circle_hover: {
        stroke: '#212121',
        fill: '#212121',
    },
    row: {
        primary: '#E8E8E8',
        secondary: '#F4F4F4',
        hover: '#8E9C9B',
    },
    mapboxStyle: 'mapbox://styles/mapbox/light-v9',
    aggrid: 'ag-theme-alpine',
    agGridBackground: {
        color: 'white',
    },
});

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
    },
    link: {
        color: 'green', //TODO FM white in gridexplore
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
    arrow: {
        fill: 'white',
        stroke: 'white',
    },
    arrow_hover: {
        fill: '#424242',
        stroke: '#424242',
    },
    circle: {
        stroke: '#424242',
        fill: '#424242',
    },
    circle_hover: {
        stroke: 'white',
        fill: 'white',
    },
    row: {
        primary: '#272727',
        secondary: '#323232',
        hover: '#545C5B',
    },
    mapboxStyle: 'mapbox://styles/mapbox/dark-v9',
    aggrid: 'ag-theme-alpine-dark',
    agGridBackground: {
        color: '#383838',
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
        ...study_messages_en,
        ...explore_messages_en,
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
        ...import_parameters_en,
        ...messages_plugins.en, // keep it at the end to allow translation overwriting
    },
    fr: {
        ...treeview_finder_fr,
        ...study_messages_fr,
        ...explore_messages_fr,
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
        ...import_parameters_fr,
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

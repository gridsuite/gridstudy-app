/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import App from './app';
import React from 'react';
import { createTheme, ThemeProvider } from '@material-ui/core/styles';
import {
    LIGHT_THEME,
    login_en,
    login_fr,
    report_viewer_en,
    report_viewer_fr,
    SnackbarProvider,
    top_bar_en,
    top_bar_fr,
    table_en,
    table_fr,
    equipment_search_fr,
    equipment_search_en,
} from '@gridsuite/commons-ui';
import { IntlProvider } from 'react-intl';
import { BrowserRouter } from 'react-router-dom';
import { Provider, useSelector } from 'react-redux';
import messages_en from '../translations/en.json';
import messages_fr from '../translations/fr.json';
import { store } from '../redux/store';
import CssBaseline from '@material-ui/core/CssBaseline';
import { PARAM_THEME } from '../utils/config-params';

const lightTheme = createTheme({
    palette: {
        type: 'light',
    },
    link: {
        color: 'blue',
    },
    mapboxStyle: 'mapbox://styles/mapbox/light-v9',
});

const darkTheme = createTheme({
    palette: {
        type: 'dark',
    },
    link: {
        color: 'green',
    },
    mapboxStyle: 'mapbox://styles/mapbox/dark-v9',
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
        ...messages_en,
        ...report_viewer_en,
        ...login_en,
        ...top_bar_en,
        ...table_en,
        ...equipment_search_en,
    },
    fr: {
        ...messages_fr,
        ...report_viewer_fr,
        ...login_fr,
        ...top_bar_fr,
        ...table_fr,
        ...equipment_search_fr,
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
                <ThemeProvider theme={getMuiTheme(theme)}>
                    <SnackbarProvider hideIconVariant={false}>
                        <CssBaseline />
                        <App />
                    </SnackbarProvider>
                </ThemeProvider>
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

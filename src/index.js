/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import 'core-js/es/array/flat-map';

import 'typeface-roboto';

import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { IntlProvider } from 'react-intl';

import './index.css';
import App from './components/app';
import { store } from './redux/store';

import messages_en from './translations/en.json';
import messages_fr from './translations/fr.json';

import {
    top_bar_en,
    top_bar_fr,
    login_fr,
    login_en,
} from '@gridsuite/commons-ui';

const messages = {
    en: { ...messages_en, ...login_en, ...top_bar_en },
    fr: { ...messages_fr, ...login_fr, ...top_bar_fr },
};

const basename = new URL(document.querySelector('base').href).pathname;

const ApplicationWrapper = () => {
    const [language, setLanguage] = useState();
    return (
        <IntlProvider locale={language} messages={messages[language]}>
            <Provider store={store}>
                <BrowserRouter basename={basename}>
                    <App setLanguage={setLanguage} />
                </BrowserRouter>
            </Provider>
        </IntlProvider>
    );
};

ReactDOM.render(<ApplicationWrapper />, document.getElementById('root'));

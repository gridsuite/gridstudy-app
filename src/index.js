/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import "typeface-roboto";

import React from 'react';
import ReactDOM from 'react-dom';
import {createStore} from 'redux'
import {Provider} from 'react-redux'
import {BrowserRouter} from 'react-router-dom';
import {IntlProvider} from 'react-intl';

import './index.css';
import App from './components/app';
import {reducer} from './redux/reducer';

import messages_en from "./translations/en.json";
import messages_fr from "./translations/fr.json";

import * as serviceWorker from './serviceWorker';

const store = createStore(reducer);

const messages = {
    'en': messages_en,
    'fr': messages_fr
};

const language = navigator.language.split(/[-_]/)[0];  // language without region code

ReactDOM.render(
    <IntlProvider locale={language} messages={messages[language]}>
        <Provider store={store}>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </Provider>
    </IntlProvider>,
    document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register();


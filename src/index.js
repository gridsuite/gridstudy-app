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
import {createReducer} from '@reduxjs/toolkit';
import {IntlProvider} from 'react-intl';

import './index.css';
import App from './app';
import {
    LOAD_NETWORK_SUCCESS,
    LOAD_STUDIES_SUCCESS,
    LOAD_VOLTAGE_LEVEL_DIAGRAM_SUCCESS,
    OPEN_STUDY,
    REMOVE_VOLTAGE_LEVEL_DIAGRAM,
    SELECT_DARK_THEME
} from './actions';
import messages_en from "./translations/en.json";
import messages_fr from "./translations/fr.json";

const initialState = {
    network: null,
    studies: [],
    darkTheme: true
};

const reducer = createReducer(initialState, {

    [LOAD_STUDIES_SUCCESS]: (state, action) => {
        state.studies = action.studies;
    },

    [OPEN_STUDY]: (state, action) => {
        state.openedStudyName = action.studyName;
    },

    [LOAD_NETWORK_SUCCESS]: (state, action) => {
        state.network = action.network;
    },

    [SELECT_DARK_THEME]: (state, action) => {
        state.darkTheme = action.darkTheme;
    },

    [LOAD_VOLTAGE_LEVEL_DIAGRAM_SUCCESS]: (state, action) => {
        state.diagram = action.diagram;
    },

    [REMOVE_VOLTAGE_LEVEL_DIAGRAM]: (state, action) => {
        state.diagram = null;
    }
});

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

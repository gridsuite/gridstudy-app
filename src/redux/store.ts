/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { compose, legacy_createStore as createStore, Store } from 'redux';
import { Actions, AppState, reducer } from './reducer';
import { setCommonStore } from '@gridsuite/commons-ui';
import { setUserStore } from './user-store';

// Define the type for the Redux DevTools extension
declare global {
    interface Window {
        __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: typeof compose;
    }
}

// Use Redux DevTools extension if available, otherwise use default compose
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export const store = createStore(reducer, composeEnhancers());

setCommonStore(store);
setUserStore(store);
export type AppDispatch = Store<AppState, Actions>['dispatch'];

// to avoid to reset the state with HMR
// https://redux.js.org/usage/configuring-your-store#hot-reloading
if (import.meta.env.DEV && import.meta.hot) {
    import.meta.hot.accept('./reducer', () => store.replaceReducer(reducer));
}

/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { type Action, legacy_createStore as createStore, Store } from 'redux';
import { Actions, AppState, reducer } from './reducer';
import { setCommonStore } from '@gridsuite/commons-ui';
import { setUserStore } from './user-store';
import { devToolsEnhancerLogOnlyInProduction } from '@redux-devtools/extension';
import { User } from 'oidc-client';
import { APP_NAME } from '../utils/config-params';

function sanitizeUser(data: User | null) {
    return (
        data &&
        ({
            ...data,
            id_token: data?.id_token && '*****',
            access_token: data?.access_token && '*****',
            refresh_token: data?.refresh_token && '*****',
            //state: data.state && '<?>',
        } as User | null)
    );
}
function stateSanitizer<S>(state: S, index: number): S {
    // @ts-expect-error haven't found why generic can't be set to `AppState`...
    return { ...state, user: sanitizeUser(state.user) };
}
function actionSanitizer<A extends Action>(action: A, id: number): A {
    if (action.type === 'USER') {
        // @ts-expect-error haven't found why generic can't be set to `Actions`...
        action.user = sanitizeUser(action.user);
    }
    return action;
}

export const store = createStore(
    reducer,
    // https://github.com/reduxjs/redux-devtools/tree/main/extension#installation
    devToolsEnhancerLogOnlyInProduction({
        // https://github.com/zalmoxisus/redux-devtools-extension/blob/master/docs/API/Arguments.md
        name: `${APP_NAME} redux`,
        shouldHotReload: !!(import.meta.env.DEV && import.meta.hot),
        autoPause: true, // for performances
        //actionCreators
        stateSanitizer,
        actionSanitizer,
        //actionsDenylist: [USER],
    })
);
setCommonStore(store);
setUserStore(store);
export type AppDispatch = Store<AppState, Actions>['dispatch'];

// to avoid to reset the state with HMR
// https://redux.js.org/usage/configuring-your-store#hot-reloading
if (import.meta.env.DEV && import.meta.hot) {
    import.meta.hot.accept('./reducer', () => store.replaceReducer(reducer));
}

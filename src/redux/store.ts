/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { configureStore } from '@reduxjs/toolkit';
import { reducer } from './reducer';
import { setCommonStore } from '@gridsuite/commons-ui';
import { setUserStore } from './user-store';
import workspacesReducer from './slices/workspace-slice';
import workspaceSessionReducer from './slices/workspace-session-slice';
import { workspaceSyncMiddleware } from './middleware/workspace-sync-middleware';

const combineReducers = (state: any, action: any) => {
    const appState = reducer(state, action);
    const workspacesState = workspacesReducer(state?.workspace, action);
    const workspaceSessionState = workspaceSessionReducer(state?.workspaceSession, action);

    return {
        ...appState,
        workspace: workspacesState,
        workspaceSession: workspaceSessionState,
    };
};

export const store = configureStore({
    reducer: combineReducers,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
            immutableCheck: false,
        }).concat(workspaceSyncMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

setCommonStore(store);
setUserStore(store);

// to avoid to reset the state with HMR
// https://redux.js.org/usage/configuring-your-store#hot-reloading
if (import.meta.env.DEV && import.meta.hot) {
    import.meta.hot.accept('./reducer', () => {
        store.replaceReducer(combineReducers as any);
    });
}

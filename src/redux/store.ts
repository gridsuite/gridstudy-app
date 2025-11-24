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
import workspacesReducer, { saveWorkspacesToStorage } from './slices/workspace-slice';
import { debounce } from '@mui/material';

const saveWorkspacesDebounced = debounce(saveWorkspacesToStorage, 500);

const workspacesPersistenceMiddleware = (store: any) => (next: any) => (action: any) => {
    const result = next(action);

    if (action.type?.startsWith('workspace/') && action.type !== 'workspace/initializeWorkspaceSlice') {
        const state = store.getState();
        const studyUuid = state.studyUuid;

        if (studyUuid && state.workspace) {
            saveWorkspacesDebounced(state.workspace, studyUuid);
        }
    }

    return result;
};

const combineReducers = (state: any, action: any) => {
    const appState = reducer(state, action);
    const workspacesState = workspacesReducer(state?.workspace, action);

    return {
        ...appState,
        workspace: workspacesState,
    };
};

export const store = configureStore({
    reducer: combineReducers,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
            immutableCheck: false,
        }).concat(workspacesPersistenceMiddleware),
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

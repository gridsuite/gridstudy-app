/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { configureStore, combineReducers } from '@reduxjs/toolkit';
import {
    persistStore,
    persistReducer,
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER,
    createTransform,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { Actions, AppState as LegacyAppState, reducer } from './reducer';
import { setCommonStore } from '@gridsuite/commons-ui';
import { setUserStore } from './user-store';
import workspaceReducer from './slices/workspace-slice';
import { sanitizeMultiWorkspaceForStorage } from '../components/workspace/stores/workspace-helpers';

const workspaceTransform = createTransform(
    (inboundState: any) => {
        if (!inboundState) return inboundState;
        return sanitizeMultiWorkspaceForStorage({
            workspaces: inboundState.workspaces,
            activeWorkspaceId: inboundState.activeWorkspaceId,
        });
    },
    (outboundState: any) => outboundState,
    { whitelist: ['workspace'] }
);

const workspacePersistConfig = {
    key: 'gridsuite-workspace',
    storage,
    whitelist: ['workspaces', 'activeWorkspaceId'],
    transforms: [workspaceTransform],
};

const persistedWorkspaceReducer = persistReducer(workspacePersistConfig, workspaceReducer);

const rootReducer = (state: any, action: any) => {
    const appState = reducer(state, action);
    const workspaceState = persistedWorkspaceReducer(state?.workspace, action);

    return {
        ...appState,
        workspace: workspaceState,
    };
};

export const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
            immutableCheck: false,
        }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppState = RootState; // For backward compatibility
export type AppDispatch = typeof store.dispatch;

setCommonStore(store);
setUserStore(store);

// to avoid to reset the state with HMR
// https://redux.js.org/usage/configuring-your-store#hot-reloading
if (import.meta.env.DEV && import.meta.hot) {
    import.meta.hot.accept('./reducer', () => {
        const newRootReducer = (state: any, action: any) => {
            const appState = reducer(state, action);
            const workspaceState = persistedWorkspaceReducer(state?.workspace, action);

            return {
                ...appState,
                workspace: workspaceState,
            };
        };
        store.replaceReducer(newRootReducer as any);
    });
}

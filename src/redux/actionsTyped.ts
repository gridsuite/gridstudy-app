/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ListenerWS } from './reducer.type';

export const CLOSE_WEBSOCKET = 'CLOSE_WEBSOCKET';
export function closeWebsocket() {
    return {
        type: CLOSE_WEBSOCKET,
    };
}

export const OPEN_WEBSOCKET = 'OPEN_WEBSOCKET';
export function openWebsocket() {
    return {
        type: OPEN_WEBSOCKET,
    };
}

export const ADD_LISTENER_WEBSOCKET = 'ADD_LISTENER_WEBSOCKET';
export const addListenerWebsocket = (listener: ListenerWS) => ({
    type: ADD_LISTENER_WEBSOCKET,
    payload: listener,
});

export const REMOVE_LISTENER_WEBSOCKET = 'REMOVE_LISTENER_WEBSOCKET';
export function removeListenerWebsocket(listenerId: string) {
    return {
        type: REMOVE_LISTENER_WEBSOCKET,
        payload: listenerId,
    };
}

/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { APP_NAME } from '../utils/config-params';
import ReconnectingWebSocket from 'reconnecting-websocket';
import { getUrlWithToken, getWsBase } from './utils';

const PREFIX_CONFIG_NOTIFICATION_WS =
    import.meta.env.VITE_WS_GATEWAY + '/config-notification';

export function connectNotificationsWsUpdateConfig() {
    const webSocketBaseUrl = getWsBase();
    const webSocketUrl =
        webSocketBaseUrl +
        PREFIX_CONFIG_NOTIFICATION_WS +
        '/notify?appName=' +
        APP_NAME;

    const reconnectingWebSocket = new ReconnectingWebSocket(() =>
        getUrlWithToken(webSocketUrl)
    );
    reconnectingWebSocket.onopen = function (event) {
        console.info(
            'Connected Websocket update config ui ' + webSocketUrl + ' ...'
        );
    };
    return reconnectingWebSocket;
}

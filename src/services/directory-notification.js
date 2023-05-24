/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import ReconnectingWebSocket from 'reconnecting-websocket';
import { getToken, getUrlWithToken } from '../utils/rest-api';

const PREFIX_DIRECTORY_NOTIFICATION_WS = `${process.env.REACT_APP_WS_GATEWAY}/directory-notification`;

export function connectDeletedStudyNotificationsWebsocket(studyUuid) {
    // The websocket API doesn't allow relative urls
    const wsbase = document.baseURI
        .replace(/^http:\/\//, 'ws://')
        .replace(/^https:\/\//, 'wss://');

    // Add params to Url
    const urlSearchParams = new URLSearchParams();
    urlSearchParams.append('updateType', 'deleteStudy');
    urlSearchParams.append('elementUuid', studyUuid);

    const wsadress = `${wsbase}${PREFIX_DIRECTORY_NOTIFICATION_WS}/notify?${urlSearchParams}`;

    const rws = new ReconnectingWebSocket(() => getUrlWithToken(wsadress));
    // don't log the token, it's private
    rws.onopen = function () {
        console.info(`Connected Websocket ${wsadress} ...`);
    };
    return rws;
}

/**
 * Function will be called to connect with notification websocket to update the studies list
 * @returns {ReconnectingWebSocket}
 */
export function connectNotificationsWsUpdateDirectories() {
    const webSocketBaseUrl = document.baseURI
        .replace(/^http:\/\//, 'ws://')
        .replace(/^https:\/\//, 'wss://');
    const webSocketUrl = `${webSocketBaseUrl}${PREFIX_DIRECTORY_NOTIFICATION_WS}/notify?updateType=directories`;

    const reconnectingWebSocket = new ReconnectingWebSocket(
        () => `${webSocketUrl}&access_token=${getToken()}`
    );
    reconnectingWebSocket.onopen = function () {
        console.info(
            `Connected Websocket update directories ${webSocketUrl} ...`
        );
    };
    return reconnectingWebSocket;
}

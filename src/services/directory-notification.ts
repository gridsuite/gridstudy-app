/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import ReconnectingWebSocket from 'reconnecting-websocket';
import { getUrlWithToken, getWsBase } from './utils';
import { getUserToken } from '../redux/user-store';
import { UUID } from 'crypto';

const PREFIX_DIRECTORY_NOTIFICATION_WS = import.meta.env.VITE_WS_GATEWAY + '/directory-notification';

export function connectDeletedStudyNotificationsWebsocket(studyUuid: UUID) {
    // The websocket API doesn't allow relative urls
    const wsBase = getWsBase();
    // Add params to Url
    const urlSearchParams = new URLSearchParams();
    urlSearchParams.append('updateType', 'deleteElement');
    urlSearchParams.append('elementUuid', studyUuid);

    const wsAdress = `${wsBase}${PREFIX_DIRECTORY_NOTIFICATION_WS}/notify?${urlSearchParams}`;

    const rws = new ReconnectingWebSocket(() => getUrlWithToken(wsAdress));
    // don't log the token, it's private
    rws.onopen = function () {
        console.info(`Connected Websocket ${wsAdress} ...`);
    };
    return rws;
}

/**
 * Function will be called to connect with notification websocket to update the studies list
 * @returns {ReconnectingWebSocket}
 */
export function connectNotificationsWsUpdateDirectories() {
    const webSocketBaseUrl = getWsBase();
    const webSocketUrl = `${webSocketBaseUrl}${PREFIX_DIRECTORY_NOTIFICATION_WS}/notify?updateType=directories`;

    const reconnectingWebSocket = new ReconnectingWebSocket(() => `${webSocketUrl}&access_token=${getUserToken()}`);
    reconnectingWebSocket.onopen = function () {
        console.info(`Connected Websocket update directories ${webSocketUrl} ...`);
    };
    return reconnectingWebSocket;
}

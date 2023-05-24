/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import ReconnectingWebSocket from 'reconnecting-websocket';

import { getUrlWithToken } from '../utils/rest-api';

const PREFIX_STUDY_NOTIFICATION_WS = `${process.env.REACT_APP_WS_GATEWAY}/study-notification`;

export function connectNotificationsWebsocket(studyUuid, options) {
    // The websocket API doesn't allow relative urls
    const wsbase = document.baseURI
        .replace(/^http:\/\//, 'ws://')
        .replace(/^https:\/\//, 'wss://');
    const wsadress = `${wsbase}${PREFIX_STUDY_NOTIFICATION_WS}/notify?studyUuid=${encodeURIComponent(
        studyUuid
    )}`;

    const rws = new ReconnectingWebSocket(
        () => getUrlWithToken(wsadress),
        [],
        options
    );
    // don't log the token, it's private
    rws.onopen = function () {
        console.info(`Connected Websocket ${wsadress} ...`);
    };
    return rws;
}

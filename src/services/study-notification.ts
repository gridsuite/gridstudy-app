/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import ReconnectingWebSocket from 'reconnecting-websocket';

import { getUrlWithToken, getWsBase } from './utils';
import { UUID } from 'crypto';

const PREFIX_STUDY_NOTIFICATION_WS = import.meta.env.VITE_WS_GATEWAY + '/study-notification';

interface WebSocketOptions {
    minUptime: number;
}
export function connectNotificationsWebsocket(studyUuid: UUID, options: WebSocketOptions) {
    // The websocket API doesn't allow relative urls
    const wsBase = getWsBase();
    const wsAdress = `${wsBase}${PREFIX_STUDY_NOTIFICATION_WS}/notify?studyUuid=${encodeURIComponent(studyUuid)}`;

    const rws = new ReconnectingWebSocket(() => getUrlWithToken(wsAdress), [], options);
    // don't log the token, it's private
    rws.onopen = function () {
        console.info(`Connected Websocket ${wsAdress} ...`);
    };
    return rws;
}

/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
export enum NOTIFICATIONS_URL_KEYS {
    CONFIG = 'CONFIG',
    STUDY = 'STUDY',
}

export const PREFIX_CONFIG_NOTIFICATION_WS = import.meta.env.VITE_WS_GATEWAY + '/config-notification';
export const PREFIX_STUDY_NOTIFICATION_WS = import.meta.env.VITE_WS_GATEWAY + '/study-notification';

/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { type UUID } from 'node:crypto';

export enum directoriesNotificationType {
    DELETE_DIRECTORY = 'DELETE_DIRECTORY',
    ADD_DIRECTORY = 'ADD_DIRECTORY',
    UPDATE_DIRECTORY = 'UPDATE_DIRECTORY',
}

// Headers
interface CommonDirectoryEventDataHeaders {
    notificationType: directoriesNotificationType;
}

interface DirectoryUpdateEventDataHeaders extends CommonDirectoryEventDataHeaders {
    updateType: directoriesNotificationType.UPDATE_DIRECTORY;
    directoryUuid: UUID;
}

// Payloads

// EventData
export interface DirectoryUpdateEventData {
    headers: DirectoryUpdateEventDataHeaders;
    payload: string;
}
export function isDirectoryUpdateNotification(notif: unknown): notif is DirectoryUpdateEventData {
    return (notif as DirectoryUpdateEventData).headers?.updateType === directoriesNotificationType.UPDATE_DIRECTORY;
}

// Notification types
export type DirectoryNotification = {
    eventData: DirectoryUpdateEventData;
};

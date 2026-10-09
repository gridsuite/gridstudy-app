/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { UUID } from 'node:crypto';
import { useCallback, useEffect, useRef } from 'react';
import {
    CustomError,
    fetchDirectoryElementPath,
    NotificationsUrlKeys,
    useNotificationsListener,
} from '@gridsuite/commons-ui';
import { directoriesNotificationType } from '../utils/directories-notification-type';
import { DIRECTORIES_INFOS, type DirectoryInfos } from '../types/directory-server-types';

const isNotFound = (error: unknown) => error instanceof CustomError && error.status === 404;

type DirectoryElementListeners = {
    onName?: (name: string) => void;
    onUpdate?: () => void;
    onDelete?: () => void;
};

// Follows a directory element in GridExplore
export const useDirectoryElementListener = (elementUuid: UUID | undefined, listeners: DirectoryElementListeners) => {
    // Read by fetches once they answer
    const latestRef = useRef({ elementUuid, listeners });
    latestRef.current = { elementUuid, listeners };
    const directoryUuidsRef = useRef<UUID[]>([]);

    const refresh = useCallback((uuid: UUID, changedNames: (string | null)[] = []) => {
        const isFollowed = () => latestRef.current.elementUuid === uuid;
        // From the root directory to the element
        fetchDirectoryElementPath(uuid)
            .then((path) => {
                if (!isFollowed()) {
                    return;
                }
                directoryUuidsRef.current = path.slice(0, -1).map((directory) => directory.elementUuid);
                const { onName, onUpdate } = latestRef.current.listeners;
                const name = path.at(-1)?.elementName;
                if (name) {
                    onName?.(name);
                    if (changedNames.includes(name)) {
                        onUpdate?.();
                    }
                }
            })
            .catch((error) => {
                if (!isFollowed()) {
                    return;
                }
                if (isNotFound(error)) {
                    // A deleted element is no longer followed
                    directoryUuidsRef.current = [];
                    latestRef.current.listeners.onDelete?.();
                } else {
                    console.error(`Failed to fetch element '${uuid}':`, error);
                }
            });
    }, []);

    useEffect(() => {
        directoryUuidsRef.current = [];
        if (elementUuid) {
            refresh(elementUuid);
        }
    }, [elementUuid, refresh]);

    // On a change in one of its directories, the element is fetched again: it may have been edited, renamed or deleted
    const handleDirectoryNotification = useCallback(
        (event: MessageEvent<string>) => {
            const { headers } = JSON.parse(event.data);
            const { elementUuid } = latestRef.current;
            if (!elementUuid || headers?.notificationType !== directoriesNotificationType.UPDATE_DIRECTORY) {
                return;
            }
            const directoriesInfos: DirectoryInfos[] = JSON.parse(headers[DIRECTORIES_INFOS] ?? '[]');
            if (directoriesInfos.some((info) => directoryUuidsRef.current.includes(info.uuid))) {
                refresh(elementUuid, headers.elementNames ?? []);
            }
        },
        [refresh]
    );

    useNotificationsListener(NotificationsUrlKeys.DIRECTORY, { listenerCallbackMessage: handleDirectoryNotification });
};

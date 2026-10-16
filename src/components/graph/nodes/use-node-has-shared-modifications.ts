/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type { UUID } from 'node:crypto';
import {
    ModificationType,
    type NetworkModificationMetadata,
    NotificationsUrlKeys,
    useNotificationsListener,
} from '@gridsuite/commons-ui';
import { fetchNetworkModifications, hasModificationReferences } from 'services/study/network-modifications';
import {
    isModificationsDeleteFinishedNotification,
    isModificationsUpdateFinishedNotification,
    isSharedElementUpdateNotification,
} from 'types/notification-types';

async function fetchNodeHasSharedModifications(studyUuid: UUID, nodeUuid: UUID): Promise<boolean> {
    const modifications: NetworkModificationMetadata[] = await fetchNetworkModifications(studyUuid, nodeUuid, false);
    // shared modifications in the bin do not count
    const liveModifications = modifications.filter((modification) => !modification.stashed);
    if (liveModifications.some((modification) => modification.type === ModificationType.MODIFICATION_REFERENCE)) {
        return true;
    }
    // a shared modification may also be nested in a composite : ask the server
    const compositeUuids = liveModifications
        .filter((modification) => modification.type === ModificationType.COMPOSITE_MODIFICATION)
        .map((modification) => modification.uuid);
    return compositeUuids.length > 0 && hasModificationReferences(compositeUuids);
}

/**
 * Whether the node contains at least one shared modification, including nested in its composites.
 */
export function useNodeHasSharedModifications(studyUuid: UUID | null, nodeUuid: UUID): boolean {
    const [hasSharedModifications, setHasSharedModifications] = useState(false);
    const lastRequestRef = useRef(0);

    const update = useCallback(() => {
        if (!studyUuid) {
            return;
        }
        const request = ++lastRequestRef.current; // to manage race condition
        fetchNodeHasSharedModifications(studyUuid, nodeUuid)
            .then((res) => {
                if (request === lastRequestRef.current) {
                    setHasSharedModifications(res);
                }
            })
            .catch((error) => console.error('Failed to fetch whether the node contains shared modifications', error));
    }, [studyUuid, nodeUuid]);

    useEffect(() => {
        update();
        return () => {
            lastRequestRef.current++;
        };
    }, [update]);

    const handleEvent = useCallback(
        (event: MessageEvent<string>) => {
            const eventData = JSON.parse(event.data);
            if (
                (isModificationsUpdateFinishedNotification(eventData) ||
                    isModificationsDeleteFinishedNotification(eventData) ||
                    isSharedElementUpdateNotification(eventData)) &&
                eventData.headers.parentNode === nodeUuid
            ) {
                update();
            }
        },
        [nodeUuid, update]
    );

    useNotificationsListener(NotificationsUrlKeys.STUDY, { listenerCallbackMessage: handleEvent });

    return hasSharedModifications;
}

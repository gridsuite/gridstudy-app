/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NotificationsUrlKeys, useNotificationsListener } from '@gridsuite/commons-ui';
import type { UUID } from 'node:crypto';
import type { AppState } from '../redux/reducer.type';
import { handleTreeModelUpdate } from '../components/network-modification-tree-pane-event-handlers';

export const useTreeModelSync = (studyUuid: UUID): void => {
    const dispatch = useDispatch();
    const currentRootNetworkUuid = useSelector((state: AppState) => state.currentRootNetworkUuid);
    const currentRootNetworkUuidRef = useRef<UUID | null>(currentRootNetworkUuid);
    currentRootNetworkUuidRef.current = currentRootNetworkUuid;
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);
    const currentNodeRef = useRef(currentNode);
    currentNodeRef.current = currentNode;

    const handleEvent = useCallback(
        (event: MessageEvent<string>) => {
            if (!currentRootNetworkUuidRef.current) {
                return; // root networks not yet loaded, skip tree sync
            }
            const eventData = JSON.parse(event.data);
            handleTreeModelUpdate(
                dispatch,
                studyUuid,
                currentRootNetworkUuidRef.current,
                eventData,
                currentNodeRef.current?.id
            );
        },
        [dispatch, studyUuid]
    );

    useNotificationsListener(NotificationsUrlKeys.STUDY, { listenerCallbackMessage: handleEvent });
};

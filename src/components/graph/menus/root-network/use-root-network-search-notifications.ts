/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback } from 'react';

import { NotificationsUrlKeys, useNotificationsListener } from '@gridsuite/commons-ui';
import {
    isModificationsDeleteFinishedNotification,
    isModificationsUpdateFinishedNotification,
    isNodeBuildCompletedNotification,
    isNodeBuildStatusUpdatedNotification,
    isNodeCreatedNotification,
    isNodeDeletedNotification,
    isNodeEditedNotification,
    isNodSubTreeCreatedNotification,
    isRootNetworksUpdatedNotification,
} from 'types/notification-types';

type UseRootNetworkNotificationsProps = {
    resetNodesSearch: () => void;
    resetModificationsSearch: () => void;
};

export const useRootNetworkSearchNotifications = ({
    resetModificationsSearch,
    resetNodesSearch,
}: UseRootNetworkNotificationsProps) => {
    const handleRootNetworkSearchReset = useCallback(
        (event: MessageEvent<string>) => {
            const eventData = JSON.parse(event.data);
            // reset the modifications search result for : build/unbuild, root network update, create and update modifications.
            // reset the nodes search result for : create, remove, rename and create subtree node.
            const nodesStatus =
                isNodeBuildCompletedNotification(eventData) || isNodeBuildStatusUpdatedNotification(eventData);
            const rootNetworksStatus = isRootNetworksUpdatedNotification(eventData);
            const networkModificationsStatus =
                isModificationsDeleteFinishedNotification(eventData) ||
                isModificationsUpdateFinishedNotification(eventData);
            const nodeDeleted = isNodeDeletedNotification(eventData);
            const nodeCreated = isNodeCreatedNotification(eventData);
            const nodeEdited = isNodeEditedNotification(eventData);
            const nodeSubTreeCreated = isNodSubTreeCreatedNotification(eventData);

            if (nodesStatus || rootNetworksStatus || networkModificationsStatus) {
                console.log(' inside thez modification node');

                resetModificationsSearch();
            }
            if (nodeDeleted || nodeCreated || nodeEdited || nodeSubTreeCreated) {
                console.log(' inside thez delete node');
                resetNodesSearch();
            }
        },

        [resetModificationsSearch, resetNodesSearch]
    );

    useNotificationsListener(NotificationsUrlKeys.STUDY, {
        listenerCallbackMessage: handleRootNetworkSearchReset,
    });
};

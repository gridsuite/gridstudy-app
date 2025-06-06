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
    isRootNetworksUpdatedNotification,
} from 'types/notification-types';

type UseRootNetworkNotificationsProps = {
    resetSearch: () => void;
};

export const useRootNetworkSearchNotifications = ({ resetSearch }: UseRootNetworkNotificationsProps) => {
    const handleRootNetworkSearchReset = useCallback(
        (event: MessageEvent<string>) => {
            const eventData = JSON.parse(event.data);
            // reset the search result for : build/unbuild, root network update, create and update modifications.
            // The current behavior is subject to change in future user stories.
            const nodesStatus =
                isNodeBuildCompletedNotification(eventData) || isNodeBuildStatusUpdatedNotification(eventData);
            const rootNetworksStatus = isRootNetworksUpdatedNotification(eventData);
            const networkModificationsStatus =
                isModificationsDeleteFinishedNotification(eventData) ||
                isModificationsUpdateFinishedNotification(eventData);

            if (nodesStatus || rootNetworksStatus || networkModificationsStatus) {
                resetSearch();
            }
        },
        [resetSearch]
    );

    useNotificationsListener(NotificationsUrlKeys.STUDY, {
        listenerCallbackMessage: handleRootNetworkSearchReset,
    });
};

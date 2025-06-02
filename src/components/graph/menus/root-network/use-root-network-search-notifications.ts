/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback } from 'react';
import {
    NodeUpdatedEventData,
    NotificationType,
    RootNetworksUpdatedEventData,
    StudyUpdatedEventData,
} from 'redux/reducer';
import { NotificationsUrlKeys, useNotificationsListener } from '@gridsuite/commons-ui';

type UseRootNetworkNotificationsProps = {
    resetSearch: () => void;
};

export const useRootNetworkSearchNotifications = ({ resetSearch }: UseRootNetworkNotificationsProps) => {
    const handleRootNetworkSearchReset = useCallback(
        (event: MessageEvent<string>) => {
            const parsedEventData: StudyUpdatedEventData | RootNetworksUpdatedEventData | NodeUpdatedEventData =
                JSON.parse(event.data);
            // reset the search result for : build/unbuild, root network update, create and update modifications.
            // The current behavior is subject to change in future user stories.
            const updateTypeHeader = parsedEventData.headers.updateType;
            const nodesStatus =
                updateTypeHeader === NotificationType.BUILD_COMPLETED ||
                updateTypeHeader === NotificationType.NODE_BUILD_STATUS_UPDATED;
            const rootNetworksStatus = updateTypeHeader === NotificationType.ROOT_NETWORKS_UPDATED;
            const networkModificationsStatus =
                updateTypeHeader === NotificationType.DELETE_FINISHED ||
                updateTypeHeader === NotificationType.UPDATE_FINISHED;

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

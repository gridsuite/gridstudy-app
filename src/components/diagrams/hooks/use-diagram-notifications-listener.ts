/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { AppState, StudyUpdatedEventData } from 'redux/reducer';
import { NotificationsUrlKeys, useNotificationsListener } from '@gridsuite/commons-ui';

type UseDiagramNotificationsListenerProps = {
    updateAllDiagrams: () => void;
};

export const useDiagramNotificationsListener = ({ updateAllDiagrams }: UseDiagramNotificationsListenerProps) => {
    const currentRootNetworkUuid = useSelector((state: AppState) => state.currentRootNetworkUuid);

    const updateDiagramsCallback = useCallback(
        (event: MessageEvent) => {
            const eventData = JSON.parse(event.data) as StudyUpdatedEventData;
            // check consistency of the event
            if (eventData.headers.rootNetworkUuid !== currentRootNetworkUuid) {
                return;
            }
            if (eventData.headers.updateType === 'loadflowResult' || eventData.headers.updateType === 'study') {
                updateAllDiagrams();
            }
        },
        [currentRootNetworkUuid, updateAllDiagrams]
    );
    useNotificationsListener(NotificationsUrlKeys.STUDY, { listenerCallbackMessage: updateDiagramsCallback });
};

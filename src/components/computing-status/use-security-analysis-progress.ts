/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { NotificationsUrlKeys, useNotificationsListener } from '@gridsuite/commons-ui';
import type { UUID } from 'node:crypto';
import { setSaProgress } from '../../redux/actions';
import { AppDispatch } from '../../redux/store';
import {
    NotificationType,
    parseEventData,
    SecurityAnalysisProgressEventData,
    StudyUpdateEventData,
} from '../../types/notification-types';

function isSecurityAnalysisProgressNotification(notif: unknown): notif is SecurityAnalysisProgressEventData {
    return (
        (notif as SecurityAnalysisProgressEventData).headers?.updateType === NotificationType.SECURITY_ANALYSIS_PROGRESS
    );
}

export function useSecurityAnalysisProgress(studyUuid: UUID, nodeUuid: UUID, currentRootNetworkUuid: UUID) {
    const dispatch = useDispatch<AppDispatch>();

    const handleProgressEvent = useCallback(
        (event?: MessageEvent) => {
            if (!studyUuid || !nodeUuid || !currentRootNetworkUuid) {
                return;
            }
            const eventData = parseEventData<StudyUpdateEventData>(event ?? null);
            if (!isSecurityAnalysisProgressNotification(eventData)) {
                return;
            }
            const { node, rootNetworkUuid, progressCurrent, progressTotal } = eventData.headers;
            if (node !== nodeUuid || rootNetworkUuid !== currentRootNetworkUuid) {
                return;
            }
            dispatch(setSaProgress(progressCurrent, progressTotal));
        },
        [studyUuid, nodeUuid, currentRootNetworkUuid, dispatch]
    );

    useNotificationsListener(NotificationsUrlKeys.STUDY, {
        listenerCallbackMessage: handleProgressEvent,
    });
}

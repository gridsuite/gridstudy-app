/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { useCallback } from 'react';
import { NotificationType } from '../../types/notification-types';
import { NotificationsUrlKeys, useNotificationsListener, useSnackMessage } from '@gridsuite/commons-ui';
import { buildDebugIdentifier, isDebug, unsetDebug } from './computation-debug-utils';
import { useSelector } from 'react-redux';
import { AppState } from '../../redux/reducer.type';
import useDebugDownload from './use-debug-download';

export default function useDebugNotification() {
    const { snackWarning } = useSnackMessage();
    const userId = useSelector((state: AppState) => state.user?.profile.sub);
    const downloadDebugFile = useDebugDownload();
    const onDebugNotification = useCallback(
        (event: MessageEvent<string>) => {
            const eventData = JSON.parse(event.data);
            const updateTypeHeader = eventData.headers.updateType;
            if (updateTypeHeader === NotificationType.COMPUTATION_DEBUG_FILE_STATUS) {
                const {
                    studyUuid,
                    node: nodeUuid,
                    rootNetworkUuid,
                    computationType: computingType,
                    userId: userIdNotif,
                    resultUuid,
                    error,
                } = eventData.headers;
                const debugIdentifierNotif = buildDebugIdentifier({
                    studyUuid,
                    nodeUuid,
                    rootNetworkUuid,
                    computingType,
                });
                const debug = isDebug(debugIdentifierNotif);
                if (debug && userIdNotif === userId) {
                    // download by notif once, so unset the debug identifier
                    unsetDebug(debugIdentifierNotif);
                    if (error) {
                        snackWarning({
                            messageTxt: error,
                        });
                    } else {
                        // perform download debug file once
                        resultUuid && downloadDebugFile(resultUuid, computingType);
                    }
                }
            }
        },
        [downloadDebugFile, userId, snackWarning]
    );

    useNotificationsListener(NotificationsUrlKeys.STUDY, { listenerCallbackMessage: onDebugNotification });
}

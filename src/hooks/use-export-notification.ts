/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { UUID } from 'crypto';
import { useIntl } from 'react-intl';
import { NotificationsUrlKeys, useNotificationsListener, useSnackMessage } from '@gridsuite/commons-ui';
import { useCallback } from 'react';
import { useExportDownload } from './use-export-download';
import { useSelector } from 'react-redux';
import { AppState } from '../redux/reducer';
import { isExportNetworkNotification } from '../types/notification-types';

export function buildExportIdentifier({
    studyUuid,
    nodeUuid,
    rootNetworkUuid,
    format,
    fileName,
}: {
    studyUuid: UUID;
    nodeUuid: UUID;
    rootNetworkUuid: UUID;
    format: string;
    fileName: string;
}) {
    return `${studyUuid}|${rootNetworkUuid}|${nodeUuid}|${fileName}|${format}`;
}

function getExportState(): Set<string> | null {
    const state = sessionStorage.getItem('export-subscriptions');
    return state ? new Set<string>(JSON.parse(state)) : null;
}

function saveExportState(state: Set<string>): void {
    sessionStorage.setItem('export-subscriptions', JSON.stringify([...state]));
}

export function isExportSubscribed(identifier: string): boolean {
    const exportState = getExportState();
    return exportState?.has(identifier) ?? false;
}

export function unsetExportSubscription(identifier: string): void {
    const exportState = getExportState();
    if (exportState) {
        exportState.delete(identifier);
        saveExportState(exportState);
    }
}

export default function useExportNotification() {
    const intl = useIntl();
    const { snackWarning, snackInfo } = useSnackMessage();
    const { downloadExportNetworkFile } = useExportDownload();
    const userId = useSelector((state: AppState) => state.user?.profile.sub);

    const handleExportNotification = useCallback(
        (event: MessageEvent<string>) => {
            const eventData = JSON.parse(event.data);
            if (isExportNetworkNotification(eventData)) {
                const {
                    studyUuid,
                    node,
                    rootNetworkUuid,
                    format,
                    userId: useId,
                    exportUuid,
                    fileName,
                    error,
                } = eventData.headers;

                const exportIdentifierNotif = buildExportIdentifier({
                    studyUuid: studyUuid,
                    nodeUuid: node,
                    rootNetworkUuid: rootNetworkUuid,
                    format,
                    fileName,
                });

                const isSubscribed = isExportSubscribed(exportIdentifierNotif);

                if (isSubscribed && useId === userId) {
                    unsetExportSubscription(exportIdentifierNotif);

                    if (error) {
                        snackWarning({
                            messageTxt: error,
                        });
                    } else {
                        downloadExportNetworkFile(exportUuid);
                        snackInfo({
                            headerTxt: intl.formatMessage({ id: 'exportNetwork' }),
                            messageTxt: intl.formatMessage({ id: 'export.message.downloadStarted' }, { fileName }),
                        });
                    }
                }
            }
        },
        [userId, snackWarning, downloadExportNetworkFile, snackInfo, intl]
    );

    useNotificationsListener(NotificationsUrlKeys.STUDY, { listenerCallbackMessage: handleExportNotification });
}

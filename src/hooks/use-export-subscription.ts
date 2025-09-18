/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { UUID } from 'crypto';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { AppState } from 'redux/reducer';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { useCallback } from 'react';
import { HttpStatusCode } from '../utils/http-status-code';
import { fetchExportNetworkFile } from '../services/study';
import { downloadZipFile } from '../services/utils';

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

export function setExportSubscription(identifier: string): void {
    const exportState = getExportState() ?? new Set<string>();
    exportState.add(identifier);
    saveExportState(exportState);
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

export default function useExportSubscription({
    studyUuid,
    nodeUuid,
    rootNetworkUuid,
}: {
    studyUuid: UUID;
    nodeUuid: UUID;
    rootNetworkUuid: UUID;
}) {
    const intl = useIntl();
    const { snackWarning, snackInfo, snackError } = useSnackMessage();
    const userId = useSelector((state: AppState) => state.user?.profile.sub);

    const downloadExportNetworkFile = useCallback(
        (exportUuid: UUID) => {
            fetchExportNetworkFile(exportUuid)
                .then(async (response) => {
                    const contentDisposition = response.headers.get('Content-Disposition');
                    let filename = 'export.zip';
                    if (contentDisposition?.includes('filename=')) {
                        const regex = /filename="?([^"]+)"?/;
                        const match = regex.exec(contentDisposition);
                        if (match?.[1]) {
                            filename = match[1];
                        }
                    }

                    const blob = await response.blob();
                    downloadZipFile(blob, filename);
                })
                .catch((responseError: any) => {
                    const error = responseError as Error & { status: number };
                    if (error.status === HttpStatusCode.NOT_FOUND) {
                        // not found
                        snackWarning({
                            headerId: 'debug.header.fileNotFound',
                        });
                    } else {
                        // or whatever error
                        snackError({
                            messageTxt: error.message,
                            headerId: 'debug.header.fileError',
                        });
                    }
                });
        },
        [snackWarning, snackError]
    );

    const handleExportNotification = useCallback(
        (eventData: any) => {
            const { studyUuid, node, rootNetworkUuid, format, userId: useId, exportUuid, fileName, error } = eventData;

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
        },
        [userId, snackWarning, downloadExportNetworkFile, snackInfo, intl]
    );

    const subscribeExport = useCallback(
        (format: string, fileName: string) => {
            buildExportIdentifier({
                studyUuid,
                nodeUuid,
                rootNetworkUuid,
                format,
                fileName,
            });

            setExportSubscription(
                buildExportIdentifier({
                    studyUuid,
                    nodeUuid,
                    rootNetworkUuid,
                    format,
                    fileName,
                })
            );
            const exportKey = `${studyUuid}-${nodeUuid}-${rootNetworkUuid}`;
            const exportInfo = {
                format,
                fileName,
                timestamp: Date.now(),
            };
            sessionStorage.setItem(`export-${exportKey}`, JSON.stringify(exportInfo));
            snackInfo({
                headerTxt: intl.formatMessage({ id: 'exportNetwork' }),
                messageTxt: intl.formatMessage({ id: 'export.message.subscribed' }, { fileName }),
            });
        },
        [studyUuid, nodeUuid, rootNetworkUuid, snackInfo, intl]
    );

    return { subscribeExport, handleExportNotification };
}

/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback } from 'react';
import { UUID } from 'crypto';
import { getDebugState, saveDebugState } from '../redux/session-storage/debug-state';
import { downloadZipFile } from '../services/utils';
import { HttpStatusCode } from '../utils/http-status-code';
import {
    ComputingType,
    formatComputingTypeLabel,
    NotificationsUrlKeys,
    useNotificationsListener,
    useSnackMessage,
} from '@gridsuite/commons-ui';
import { downloadDebugFileDynamicSimulation } from '../services/dynamic-simulation';
import { useIntl } from 'react-intl';
import { downloadDebugFileDynamicSecurityAnalysis } from '../services/dynamic-security-analysis';
import { NotificationType } from '../types/notification-types';
import { useSelector } from 'react-redux';
import { AppState } from '../redux/reducer';
import { downloadDebugFileVoltageInit } from '../services/voltage-init';
import { downloadDebugFileShortCircuitAnalysis } from '../services/short-circuit-analysis';

const downloadDebugFileFetchers = {
    [ComputingType.DYNAMIC_SIMULATION]: downloadDebugFileDynamicSimulation,
    [ComputingType.DYNAMIC_SECURITY_ANALYSIS]: downloadDebugFileDynamicSecurityAnalysis,
    [ComputingType.VOLTAGE_INITIALIZATION]: downloadDebugFileVoltageInit,
    [ComputingType.SHORT_CIRCUIT]: downloadDebugFileShortCircuitAnalysis,
    [ComputingType.SHORT_CIRCUIT_ONE_BUS]: downloadDebugFileShortCircuitAnalysis,
} as Record<ComputingType, ((resultUuid: UUID) => Promise<Response>) | null>;

export function buildDebugIdentifier({
    studyUuid,
    nodeUuid,
    rootNetworkUuid,
    computingType,
}: {
    studyUuid: UUID;
    nodeUuid: UUID;
    rootNetworkUuid: UUID;
    computingType: ComputingType;
}) {
    return `${studyUuid}|${rootNetworkUuid}|${nodeUuid}|${computingType}`;
}

export function setDebug(identifier: string) {
    const debugState = getDebugState() ?? new Set();
    debugState.add(identifier);
    saveDebugState(debugState);
}

export function isDebug(identifier: string) {
    const debugState = getDebugState();
    return debugState?.has(identifier);
}

export function unsetDebug(identifier: string) {
    const debugState = getDebugState();
    if (debugState) {
        debugState.delete(identifier);
        saveDebugState(debugState);
    }
}

export default function useComputationDebug({
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

    const downloadDebugFile = useCallback(
        (resultUuid: UUID, computingType: ComputingType) => {
            downloadDebugFileFetchers[computingType]?.(resultUuid) // download a debug file from a specific computation server
                .then(async (response) => {
                    // Get the filename
                    const contentDisposition = response.headers.get('Content-Disposition');
                    let filename = `${formatComputingTypeLabel(computingType)}.zip`;
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
                .catch((responseError) => {
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

    const subscribeDebug = useCallback(
        (computingType: ComputingType) => {
            // set debug true in the session storage
            setDebug(
                buildDebugIdentifier({
                    studyUuid: studyUuid,
                    nodeUuid: nodeUuid,
                    rootNetworkUuid: rootNetworkUuid,
                    computingType: computingType,
                })
            );
            snackInfo({
                headerTxt: intl.formatMessage({
                    id: formatComputingTypeLabel(computingType),
                }),
                messageTxt: intl.formatMessage({ id: 'debug.message.downloadFile' }),
            });
        },
        [studyUuid, nodeUuid, rootNetworkUuid, snackInfo, intl]
    );

    return subscribeDebug;
}

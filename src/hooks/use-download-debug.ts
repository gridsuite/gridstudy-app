/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback } from 'react';
import { UUID } from 'crypto';
import { getDebugState, saveDebugState } from '../redux/session-storage/debug-state';
import ComputingType, { formatComputingTypeLabel } from '../components/computing-status/computing-type';
import { downloadZipFile } from '../services/utils';
import { HttpStatusCode } from '../utils/http-status-code';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { downloadDebugDynamicSimulation } from '../services/dynamic-simulation';

export const UPDATE_TYPE_STUDY_DEBUG = 'STUDY_DEBUG';

const debugFetchers = {
    [ComputingType.DYNAMIC_SIMULATION]: downloadDebugDynamicSimulation,
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
    const debugState = getDebugState() ?? new Map();
    debugState.set(identifier, true);
    saveDebugState(debugState);
}

export function getDebug(identifier: string) {
    const debugState = getDebugState();
    return debugState ? debugState.get(identifier) : null;
}

export function unsetDebug(identifier: string) {
    const debugSate = getDebugState();
    if (debugSate) {
        debugSate.delete(identifier);
        saveDebugState(debugSate);
    }
}

export default function useDownloadDebug() {
    const { snackError, snackWarning } = useSnackMessage();

    const downloadDebug = useCallback(
        (resultUuid: UUID, computingType: ComputingType) => {
            debugFetchers[computingType]?.(resultUuid) // download debug file from a specific computation server
                .then(async (response) => {
                    // Get the filename
                    const contentDisposition = response.headers.get('Content-Disposition');
                    let filename = `${formatComputingTypeLabel(computingType)}.zip`;
                    if (contentDisposition && contentDisposition.includes('filename=')) {
                        const match = contentDisposition.match(/filename="?([^"]+)"?/);
                        if (match && match[1]) {
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
                            headerId: 'debugFileNotFoundHeader',
                        });
                    } else {
                        // or whatever error
                        snackError({
                            messageTxt: error.message,
                            headerId: 'debugFileErrorHeader',
                        });
                    }
                });
        },
        [snackWarning, snackError]
    );

    return downloadDebug;
}

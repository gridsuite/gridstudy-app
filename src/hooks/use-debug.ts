/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback } from 'react';
import { UUID } from 'crypto';
import { getDebugMap, saveDebugMap } from '../redux/session-storage/debug-state';
import ComputingType, { formatComputingTypeLabel } from '../components/computing-status/computing-type';
import { downloadZipFile } from '../services/utils';
import { HttpStatusCode } from '../utils/http-status-code';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { downloadDynamicSimulationDebugFile } from '../services/dynamic-simulation';

export const UPDATE_TYPE_STUDY_DEBUG = 'STUDY_DEBUG';

const debugFileFetchers = {
    [ComputingType.DYNAMIC_SIMULATION]: downloadDynamicSimulationDebugFile,
} as Record<ComputingType, ((resultUuid: UUID) => Promise<Response>) | null>;

export default function useDebug() {
    const { snackError, snackWarning } = useSnackMessage();

    const set = useCallback((resultUuid: UUID) => {
        const debugMap = getDebugMap() ?? new Map();
        debugMap.set(resultUuid, true);
        saveDebugMap(debugMap);
    }, []);

    const get = useCallback((resultUuid: UUID) => {
        const debugMap = getDebugMap();
        return debugMap ? debugMap.get(resultUuid) : null;
    }, []);

    const unset = useCallback((resultUuid: UUID) => {
        const debugMap = getDebugMap();
        if (debugMap) {
            debugMap.delete(resultUuid);
            saveDebugMap(debugMap);
        }
    }, []);

    const downloadDebugFile = useCallback(
        (resultUuid: UUID, computingType: ComputingType) => {
            resultUuid && computingType && get(resultUuid);
            debugFileFetchers[computingType]?.(resultUuid) // download debug file from a specific computation server
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
                })
                .finally(() => {
                    unset(resultUuid);
                });
        },
        [snackWarning, snackError, unset, get]
    );

    return { get, set, unset, downloadDebugFile };
}

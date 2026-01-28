/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { useCallback } from 'react';
import type { UUID } from 'node:crypto';
import { ComputingType, formatComputingTypeLabel, snackWithFallback, useSnackMessage } from '@gridsuite/commons-ui';
import { downloadZipFile } from '../../services/utils';
import { HttpStatusCode } from '../../utils/http-status-code';
import { downloadDebugFileDynamicSimulation } from '../../services/dynamic-simulation';
import { downloadDebugFileDynamicSecurityAnalysis } from '../../services/dynamic-security-analysis';
import { downloadDebugFileDynamicMarginCalculation } from '../../services/dynamic-margin-calculation';
import { downloadDebugFileVoltageInit } from '../../services/voltage-init';
import { downloadDebugFileShortCircuitAnalysis } from '../../services/short-circuit-analysis';

const downloadDebugFileFetchers = {
    [ComputingType.DYNAMIC_SIMULATION]: downloadDebugFileDynamicSimulation,
    [ComputingType.DYNAMIC_SECURITY_ANALYSIS]: downloadDebugFileDynamicSecurityAnalysis,
    [ComputingType.DYNAMIC_MARGIN_CALCULATION]: downloadDebugFileDynamicMarginCalculation,
    [ComputingType.VOLTAGE_INITIALIZATION]: downloadDebugFileVoltageInit,
    [ComputingType.SHORT_CIRCUIT]: downloadDebugFileShortCircuitAnalysis,
    [ComputingType.SHORT_CIRCUIT_ONE_BUS]: downloadDebugFileShortCircuitAnalysis,
} as Record<ComputingType, ((resultUuid: UUID) => Promise<Response>) | null>;

export default function useDebugDownload() {
    const { snackWarning, snackError } = useSnackMessage();
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
                        snackWithFallback(snackError, error, { headerId: 'debug.header.fileError' });
                    }
                });
        },
        [snackWarning, snackError]
    );

    return downloadDebugFile;
}

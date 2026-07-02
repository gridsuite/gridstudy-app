/*
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { ExportCsvButton } from './export-csv-button';

export interface ManagedExportCsvButtonProps {
    disabled?: boolean;
    exportCsv: () => Promise<void>;
    resetKey?: unknown;
    onSuccess?: () => void;
    onError?: (error: unknown) => void;
}

export function ManagedExportCsvButton({
    disabled = false,
    exportCsv,
    resetKey,
    onSuccess,
    onError,
}: ManagedExportCsvButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccessful, setIsSuccessful] = useState(false);

    useEffect(() => {
        setIsLoading(false);
        setIsSuccessful(false);
    }, [resetKey]);

    useEffect(() => {
        if (disabled) {
            setIsSuccessful(false);
        }
    }, [disabled]);

    const handleClick = useCallback(async () => {
        setIsSuccessful(false);
        setIsLoading(true);

        try {
            await exportCsv();
            setIsSuccessful(true);
            onSuccess?.();
        } catch (error) {
            setIsSuccessful(false);
            onError?.(error);
        } finally {
            setIsLoading(false);
        }
    }, [exportCsv, onSuccess, onError]);

    return (
        <ExportCsvButton
            disabled={disabled || isLoading}
            onClick={handleClick}
            isDownloadLoading={isLoading}
            isDownloadSuccessful={isSuccessful}
        />
    );
}

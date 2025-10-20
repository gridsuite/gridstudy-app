/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { UUID } from 'node:crypto';
import { getExportState, saveExportState } from '../redux/session-storage/export-network-state';

export function buildExportIdentifier({ exportUuid }: { exportUuid: UUID }) {
    return `${exportUuid}`;
}

export function isExportSubscribed(identifier: string) {
    const exportState = getExportState();
    return exportState?.has(identifier);
}

export function unsetExportSubscription(identifier: string): void {
    const exportState = getExportState();
    if (exportState) {
        exportState.delete(identifier);
        saveExportState(exportState);
    }
}

export function setExportSubscription(identifier: string): void {
    const exportState = getExportState() ?? new Set();
    exportState.add(identifier);
    saveExportState(exportState);
}

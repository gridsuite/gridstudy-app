/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { UUID } from 'node:crypto';

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

export function setExportSubscription(identifier: string): void {
    const exportState = getExportState() ?? new Set<string>();
    exportState.add(identifier);
    saveExportState(exportState);
}

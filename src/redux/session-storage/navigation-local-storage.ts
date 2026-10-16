/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { UUID } from 'node:crypto';
import { LOCAL_STORAGE_KEY_PREFIX } from '../../utils/config-params';

export const STUDY_NAVIGATION_SYNC_KEY = `${LOCAL_STORAGE_KEY_PREFIX}:navigation-sync`;

export type StudyNavigationSyncEntry = {
    syncEnabled: boolean;
    rootNetworkUuid: UUID | null;
    treeNodeUuid: UUID | null;
};

function getStudyNavigationSync(studyUuid: UUID): StudyNavigationSyncEntry | null {
    const raw = localStorage.getItem(`${STUDY_NAVIGATION_SYNC_KEY}:${studyUuid}`);
    if (!raw) {
        return null;
    }
    try {
        return JSON.parse(raw) as StudyNavigationSyncEntry;
    } catch {
        return null;
    }
}

export function saveStudyNavigationSync(studyUuid: UUID, patch: Partial<StudyNavigationSyncEntry>): void {
    try {
        const current = getStudyNavigationSync(studyUuid) ?? {
            syncEnabled: false,
            rootNetworkUuid: null,
            treeNodeUuid: null,
        };
        localStorage.setItem(`${STUDY_NAVIGATION_SYNC_KEY}:${studyUuid}`, JSON.stringify({ ...current, ...patch }));
    } catch (err) {
        console.warn('Failed to save study navigation sync:', err);
    }
}

export function getLocalStorageSyncEnabled(studyUuid: UUID): boolean {
    return getStudyNavigationSync(studyUuid)?.syncEnabled ?? false;
}

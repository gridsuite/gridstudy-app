/*
 * Copyright © 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { APP_NAME } from '../../utils/config-params';
import type { UUID } from 'node:crypto';

const SESSION_STORAGE_DIAGRAMS_KEY_PREFIX = APP_NAME.toUpperCase() + '_DIAGRAMS_';

function getDiagramsKey(studyUuid: UUID) {
    return SESSION_STORAGE_DIAGRAMS_KEY_PREFIX + studyUuid;
}

export function syncDiagramsWithSessionStorage(diagrams: unknown, studyUuid: UUID) {
    if (studyUuid == null) {
        return;
    }
    sessionStorage.setItem(getDiagramsKey(studyUuid), JSON.stringify(diagrams));
}

export function loadDiagramsFromSessionStorage(studyUuid: UUID) {
    const raw = sessionStorage.getItem(getDiagramsKey(studyUuid));
    return (raw && JSON.parse(raw)) ?? [];
}

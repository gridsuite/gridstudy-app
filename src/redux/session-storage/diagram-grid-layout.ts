/*
 * Copyright © 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { APP_NAME } from '../../utils/config-params';
import { UUID } from 'crypto';

const SESSION_STORAGE_DIAGRAMS_GRID_LAYOUT_KEY_PREFIX = APP_NAME.toUpperCase() + '_DIAGRAMS_GRID_LAYOUT';

function getDiagramsGridLayoutKey(studyUuid: UUID) {
    return SESSION_STORAGE_DIAGRAMS_GRID_LAYOUT_KEY_PREFIX + studyUuid;
}

export function syncDiagramsGridLayoutWithSessionStorage(layouts: unknown, studyUuid: UUID) {
    if (studyUuid == null) {
        return;
    }
    sessionStorage.setItem(getDiagramsGridLayoutKey(studyUuid), JSON.stringify(layouts));
}

export function loadDiagramsGridLayoutFromSessionStorage(studyUuid: UUID) {
    const raw = sessionStorage.getItem(getDiagramsGridLayoutKey(studyUuid));
    if (!raw) {
        return undefined;
    }
    const savedLayouts = JSON.parse(raw);
    if (Object.keys(savedLayouts).length === 0) {
        return undefined;
    }
    return savedLayouts;
}

/*
 * Copyright © 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { APP_NAME } from '../../utils/config-params';
import { UUID } from 'crypto';

const SESSION_STORAGE_DIAGRAM_STATE_KEY_PREFIX = APP_NAME.toUpperCase() + '_DIAGRAM_STATE_';

function getDiagramStateKeyPrefixFromStudyUuid(studyUuid: UUID) {
    return SESSION_STORAGE_DIAGRAM_STATE_KEY_PREFIX + studyUuid;
}

export function syncDiagramStateWithSessionStorage(diagramState: unknown, studyUuid: UUID) {
    if (studyUuid == null) {
        return;
    }
    sessionStorage.setItem(getDiagramStateKeyPrefixFromStudyUuid(studyUuid), JSON.stringify(diagramState));
}

export function loadDiagramStateFromSessionStorage(studyUuid: UUID) {
    const raw = sessionStorage.getItem(getDiagramStateKeyPrefixFromStudyUuid(studyUuid));
    return (raw && JSON.parse(raw)) ?? [];
}

/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { UUID } from 'node:crypto';
import { LOCAL_STORAGE_KEY_PREFIX } from '../../utils/config-params';

const LAST_TREE_NODE_KEY = `${LOCAL_STORAGE_KEY_PREFIX}:last-tree-node`;

export function saveLastTreeNodeUuid(studyUuid: UUID, treeNodeUuid: UUID): void {
    try {
        localStorage.setItem(`${LAST_TREE_NODE_KEY}:${studyUuid}`, treeNodeUuid);
    } catch (err) {
        console.warn('Failed to save last tree node uuid:', err);
    }
}

export function getLastTreeNodeUuid(studyUuid: UUID): UUID | null {
    const stored = localStorage.getItem(`${LAST_TREE_NODE_KEY}:${studyUuid}`);
    return stored ? (stored as UUID) : null;
}

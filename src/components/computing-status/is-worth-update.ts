/*
 * Copyright © 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { UUID } from 'crypto';
import { type RefObject } from 'react';
import { UPDATE_TYPE_HEADER } from '../study-container';
import type { StudyUpdated } from '../../redux/type-notification';

export interface LastUpdateProps {
    studyUpdatedForce: StudyUpdated;
    fetcher: (studyUuid: UUID, nodeUuid: UUID) => Promise<string>;
}

export function isWorthUpdate(
    studyUpdatedForce: StudyUpdated,
    fetcher: (studyUuid: UUID, nodeUuid: UUID) => Promise<string>,
    lastUpdateRef: RefObject<LastUpdateProps>,
    nodeUuidRef: RefObject<UUID>,
    nodeUuid: UUID,
    invalidations: string[]
): boolean {
    const headers = studyUpdatedForce?.eventData?.headers;
    const updateType = headers?.[UPDATE_TYPE_HEADER];
    const node = headers?.['node'];
    const nodes = headers?.['nodes'];
    if (nodeUuidRef.current !== nodeUuid) {
        return true;
    }
    if (fetcher && lastUpdateRef.current?.fetcher !== fetcher) {
        return true;
    }
    if (studyUpdatedForce && lastUpdateRef.current?.studyUpdatedForce === studyUpdatedForce) {
        return false;
    }
    if (!updateType) {
        return false;
    }
    if (invalidations.indexOf(updateType) <= -1) {
        return false;
    }
    if (node === undefined && nodes === undefined) {
        return true;
    }
    if (node === nodeUuid || nodes?.indexOf(nodeUuid) !== -1) {
        return true;
    }

    return false;
}

/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { backendFetchJson } from '@gridsuite/commons-ui';
import type { UUID } from 'node:crypto';
import type { NodeActivity } from '../../types/node-activity.type';
import { getStudyUrl } from './index';

export function fetchNodeActivities(studyUuid: UUID): Promise<NodeActivity[]> {
    const url = getStudyUrl(studyUuid) + '/tree/node-activities';
    console.debug(url);
    return backendFetchJson(url);
}

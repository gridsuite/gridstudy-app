/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import type { UUID } from 'node:crypto';
import { backendFetch, backendFetchJson } from '@gridsuite/commons-ui';
import { getStudyUrl } from './index';
import { NodeAlias } from '../../components/spreadsheet-view/types/node-alias.type';

function getNodeAliasUrl(studyUuid: UUID) {
    return getStudyUrl(studyUuid) + '/node-aliases';
}

export function updateNodeAliases(studyUuid: UUID, nodeAliases: NodeAlias[]): Promise<Response> {
    console.info(`Update node aliases from study ${studyUuid}`);
    const changeUrl = getNodeAliasUrl(studyUuid);
    console.debug(changeUrl);
    return backendFetch(changeUrl, {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nodeAliases),
    });
}

export function getNodeAliases(studyUuid: UUID): Promise<NodeAlias[]> {
    console.info(`Get nodes aliases from study ${studyUuid}`);
    const url = `${getNodeAliasUrl(studyUuid)}`;
    console.debug(url);
    return backendFetchJson(url);
}

/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { UUID } from 'crypto';
import { backendFetch, backendFetchJson } from '../utils';
import { getStudyUrlWithNodeUuid } from './index';
import { NodeAlias } from '../../components/spreadsheet/custom-columns/node-alias.type';

function getNodeAliasUrl(studyUuid: UUID, nodeUuid: UUID) {
    return getStudyUrlWithNodeUuid(studyUuid, nodeUuid) + '/node-aliases';
}

export function updateNodeAliases(studyUuid: UUID, nodeUuid: UUID, nodeAliases: NodeAlias[]) {
    console.info(`Update node aliases from node ${nodeUuid} of study ${studyUuid}`);
    const changeUrl = getNodeAliasUrl(studyUuid, nodeUuid);
    console.debug(changeUrl);
    return backendFetch(changeUrl, {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nodeAliases),
    });
}

export async function getNodeAliases(studyUuid: UUID, nodeUuid: UUID): Promise<NodeAlias[]> {
    console.info(`Get nodes aliases from node ${nodeUuid} of study ${studyUuid}`);
    const url = `${getNodeAliasUrl(studyUuid, nodeUuid)}`;
    console.debug(url);
    return backendFetchJson(url);
}

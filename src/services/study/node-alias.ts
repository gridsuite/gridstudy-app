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

function getNodeAliasUrl(studyUuid: UUID | null | undefined, nodeUuid: string | undefined) {
    return getStudyUrlWithNodeUuid(studyUuid, nodeUuid) + '/node-aliases';
}

export function updateNodeAliases(studyUuid: UUID | null, nodeUuid: UUID, nodeAliases: NodeAlias[]) {
    console.info('Creating groovy script (request network change)');
    const changeUrl = getNodeAliasUrl(studyUuid, nodeUuid);
    console.debug(changeUrl);
    return backendFetch(changeUrl, {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nodeAliases),
    });
}

export async function getNodeAliases(studyUuid: UUID | null, nodeUuid: UUID): Promise<NodeAlias[]> {
    console.info(`get nodes aliases from node ${nodeUuid}`);
    const url = `${getNodeAliasUrl(studyUuid, nodeUuid)}`;
    console.debug(url);
    return backendFetchJson(url);
}

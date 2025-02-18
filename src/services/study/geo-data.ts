/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { UUID } from 'crypto';
import type { GeoDataLine, GeoDataSubstation } from '@powsybl/network-viewer';
import { backendFetchJson, getQueryParamsList } from '../utils';
import { getStudyUrlWithNodeUuidAndRootNetworkUuid } from './index';

export function fetchSubstationPositions(
    studyUuid: UUID,
    currentNodeUuid: UUID,
    currentRootNetworkUuid?: UUID,
    substationsIds?: string[]
): Promise<GeoDataSubstation[]> {
    console.info(
        `Fetching substation positions of study '${studyUuid}' on root network '${currentRootNetworkUuid}' and node '${currentNodeUuid}' with ids '${substationsIds}'...`
    );

    const paramsList =
        substationsIds && substationsIds.length > 0 ? '?' + getQueryParamsList(substationsIds, 'substationId') : '';

    const fetchSubstationPositionsUrl =
        getStudyUrlWithNodeUuidAndRootNetworkUuid(studyUuid, currentNodeUuid, currentRootNetworkUuid) +
        '/geo-data/substations' +
        paramsList;
    console.debug(fetchSubstationPositionsUrl);
    return backendFetchJson(fetchSubstationPositionsUrl);
}

export function fetchLinePositions(
    studyUuid: UUID,
    currentNodeUuid: UUID,
    currentRootNetworkUuid: UUID | undefined,
    linesIds?: string[]
): Promise<GeoDataLine[]> {
    console.info(
        `Fetching line positions of study '${studyUuid}' on root network '${currentRootNetworkUuid}' and node '${currentNodeUuid}' with ids '${linesIds}'...`
    );

    const paramsList = linesIds && linesIds.length > 0 ? '?' + getQueryParamsList(linesIds, 'lineId') : '';

    const fetchLinePositionsUrl =
        getStudyUrlWithNodeUuidAndRootNetworkUuid(studyUuid, currentNodeUuid, currentRootNetworkUuid) +
        '/geo-data/lines' +
        paramsList;

    console.debug(fetchLinePositionsUrl);
    return backendFetchJson(fetchLinePositionsUrl);
}

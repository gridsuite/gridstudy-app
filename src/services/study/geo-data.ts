/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { UUID } from 'crypto';
import type { GeoDataLine, GeoDataSubstation } from '@powsybl/network-viewer';
import { backendFetchJson } from '../utils';
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

    const fetchSubstationPositionsUrl =
        getStudyUrlWithNodeUuidAndRootNetworkUuid(studyUuid, currentNodeUuid, currentRootNetworkUuid) +
        '/geo-data/substations';
    console.debug(fetchSubstationPositionsUrl);
    return backendFetchJson(fetchSubstationPositionsUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(substationsIds),
    });
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

    const fetchLinePositionsUrl =
        getStudyUrlWithNodeUuidAndRootNetworkUuid(studyUuid, currentNodeUuid, currentRootNetworkUuid) +
        '/geo-data/lines';
    console.debug(fetchLinePositionsUrl);
    return backendFetchJson(fetchLinePositionsUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(linesIds),
    });
}

/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { getStudyUrl, getStudyUrlWithNodeUuidAndRootNetworkUuid } from './index';
import { backendFetch, backendFetchJson, backendFetchText } from '../utils';
import { UUID } from 'crypto';
import { VoltageInitParam } from '../../components/dialogs/parameters/voltageinit/voltage-init-utils';

export function startVoltageInit(studyUuid: UUID, currentNodeUuid: UUID, currentRootNetworkUuid: UUID) {
    console.info(
        `Running voltage init on '${studyUuid}' on root network '${currentRootNetworkUuid}' and node '${currentNodeUuid}' ...`
    );

    const startVoltageInitUrl =
        getStudyUrlWithNodeUuidAndRootNetworkUuid(studyUuid, currentNodeUuid, currentRootNetworkUuid) +
        '/voltage-init/run';
    console.debug(startVoltageInitUrl);
    return backendFetch(startVoltageInitUrl, { method: 'put' });
}

export function stopVoltageInit(studyUuid: UUID, currentNodeUuid: UUID, currentRootNetworkUuid: UUID) {
    console.info(
        `Stopping voltage init on '${studyUuid}' on root network '${currentRootNetworkUuid}' and node '${currentNodeUuid}' ...`
    );
    const stopVoltageInitUrl =
        getStudyUrlWithNodeUuidAndRootNetworkUuid(studyUuid, currentNodeUuid, currentRootNetworkUuid) +
        '/voltage-init/stop';
    console.debug(stopVoltageInitUrl);
    return backendFetch(stopVoltageInitUrl, { method: 'put' });
}

export function fetchVoltageInitStatus(studyUuid: UUID, currentNodeUuid: UUID, currentRootNetworkUuid: UUID) {
    console.info(
        `Fetching voltage init status on '${studyUuid}' on root network '${currentRootNetworkUuid}' and node '${currentNodeUuid}' ...`
    );
    const url =
        getStudyUrlWithNodeUuidAndRootNetworkUuid(studyUuid, currentNodeUuid, currentRootNetworkUuid) +
        '/voltage-init/status';

    console.debug(url);
    return backendFetchText(url);
}

export function fetchVoltageInitResult(studyUuid: UUID, currentNodeUuid: UUID, currentRootNetworkUuid: UUID) {
    console.info(
        `Fetching voltage init result on '${studyUuid}' , node '${currentNodeUuid}' and root network '${currentRootNetworkUuid}' ...`
    );
    const url =
        getStudyUrlWithNodeUuidAndRootNetworkUuid(studyUuid, currentNodeUuid, currentRootNetworkUuid) +
        '/voltage-init/result';
    console.debug(url);
    return backendFetchJson(url);
}

export function updateVoltageInitParameters(
    studyUuid: UUID | null,
    newParams: VoltageInitParam | Record<string, boolean | null>
) {
    console.info('set voltage init parameters');
    const url = getStudyUrl(studyUuid) + '/voltage-init/parameters';
    console.debug(url);

    console.info('newParams in rest API', newParams);

    return backendFetch(url, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(newParams),
    });
}

export function getVoltageInitStudyParameters(studyUuid: UUID) {
    console.info('get voltage init study parameters');
    const getVoltageInitParams = getStudyUrl(studyUuid) + '/voltage-init/parameters';
    console.debug(getVoltageInitParams);
    return backendFetchJson(getVoltageInitParams);
}

export function getVoltageInitModifications(studyUuid: UUID, currentNodeId: UUID, currentRootNetworkUuid: UUID) {
    console.info('get voltage init modifications');
    const getVoltageInitModifications =
        getStudyUrlWithNodeUuidAndRootNetworkUuid(studyUuid, currentNodeId, currentRootNetworkUuid) +
        '/network-modifications/voltage-init';
    console.debug(getVoltageInitModifications);
    return backendFetchJson(getVoltageInitModifications);
}

export function cloneVoltageInitModifications(studyUuid: UUID, currentNodeId: UUID, currentRootNetworkUuid: UUID) {
    console.info('cloning voltage init modifications');
    const cloneVoltageInitModificationsUrl =
        getStudyUrlWithNodeUuidAndRootNetworkUuid(studyUuid, currentNodeId, currentRootNetworkUuid) +
        '/network-modifications/voltage-init';

    return backendFetch(cloneVoltageInitModificationsUrl, {
        method: 'POST',
    });
}
